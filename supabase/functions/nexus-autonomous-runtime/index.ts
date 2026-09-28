import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type Check = {
  source: string;
  metric: string;
  value_numeric?: number;
  value_text?: string;
  state: "DATA_AVAILABLE" | "NO_DATA" | "DATA_UNAVAILABLE" | "DATA_STALE" | "UNKNOWN";
  metadata?: Record<string, unknown>;
};

const SITE_URL = Deno.env.get("TRANSMIND_SITE_URL") ?? "https://transmindnusantararentalmobil.co.id/";
const NEXUS_URL = Deno.env.get("TRANSMIND_NEXUS_URL") ?? "https://transmindnusantararentalmobil.co.id/nexus/";
const RUNTIME_SECRET = Deno.env.get("NEXUS_RUNTIME_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
function auth(req: Request) {
  return Boolean(RUNTIME_SECRET) && req.headers.get("x-nexus-runtime-secret") === RUNTIME_SECRET;
}
async function probe(url: string): Promise<Check> {
  const started = performance.now();
  try {
    const response = await fetch(url, { method: "GET", redirect: "follow", headers: { "user-agent": "TransMind-NEXUS-Watchdog/1.0" } });
    const duration = Math.round(performance.now() - started);
    return {
      source: "WEBSITE",
      metric: url.includes("/nexus/") ? "nexus_http_status" : "site_http_status",
      value_numeric: response.status,
      state: response.ok ? "DATA_AVAILABLE" : "DATA_UNAVAILABLE",
      metadata: { url, latency_ms: duration, ok: response.ok },
    };
  } catch (error) {
    return {
      source: "WEBSITE",
      metric: url.includes("/nexus/") ? "nexus_http_status" : "site_http_status",
      state: "DATA_UNAVAILABLE",
      metadata: { url, error: String(error) },
    };
  }
}
async function rest(path: string, init: RequestInit = {}) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Runtime database credentials are not configured.");
  const response = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    ...init,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: "Bearer " + SERVICE_ROLE_KEY,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error("Supabase REST " + response.status + ": " + text);
  return text ? JSON.parse(text) : null;
}
async function insert(table: string, payload: unknown) {
  return rest(table, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(payload) });
}
async function patch(table: string, filter: string, payload: unknown) {
  return rest(table + "?" + filter, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(payload) });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST required" }, 405);
  if (!auth(req)) return json({ error: "Unauthorized" }, 401);

  const startedAt = new Date();
  const runId = "NXR-" + startedAt.toISOString().replace(/[-:.TZ]/g, "") + "-" + crypto.randomUUID().slice(0, 8);
  const trigger = req.headers.get("x-nexus-trigger") ?? "SCHEDULED";

  try {
    await insert("nexus_runtime_runs", { run_id: runId, trigger, status: "RUNNING", summary: { phase: "WAKE" } });

    const checks = await Promise.all([probe(SITE_URL), probe(NEXUS_URL)]);
    checks.push(
      { source: "ANALYTICS", metric: "traffic", state: "UNKNOWN", metadata: { reason: "connector_not_configured" } },
      { source: "SEARCH", metric: "organic_traffic", state: "UNKNOWN", metadata: { reason: "connector_not_configured" } },
    );

    await insert("nexus_measurements", checks.map((c) => ({
      run_id: runId, source: c.source, metric: c.metric,
      value_numeric: c.value_numeric ?? null, value_text: c.value_text ?? null,
      state: c.state, metadata: c.metadata ?? {},
    })));

    const anomalies: Array<Record<string, any>> = [];
    const site = checks.find((c) => c.metric === "site_http_status");
    const nexus = checks.find((c) => c.metric === "nexus_http_status");

    if (site?.state !== "DATA_AVAILABLE") {
      anomalies.push({ incident_key: "SITE_UNAVAILABLE", severity: "HIGH", diagnosis: { root_cause: "website_probe_failed", confidence: 0.95 }, evidence: site });
    }
    if (nexus?.state !== "DATA_AVAILABLE") {
      anomalies.push({ incident_key: "NEXUS_UNAVAILABLE", severity: "HIGH", diagnosis: { root_cause: "nexus_route_probe_failed", confidence: 0.95 }, evidence: nexus });
    }

    for (const anomaly of anomalies) {
      const existing = await rest(
        "nexus_incidents?select=id&incident_key=eq." + encodeURIComponent(String(anomaly.incident_key)) + "&state=in.(OPEN,ACKNOWLEDGED)&limit=1"
      );
      if (!existing?.length) {
        const created = await rest("nexus_incidents", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            run_id: runId, incident_key: anomaly.incident_key, severity: anomaly.severity,
            diagnosis: anomaly.diagnosis, evidence: anomaly.evidence,
            confidence: anomaly.diagnosis?.confidence ?? null,
          }),
        });
        const id = created?.[0]?.id ?? null;
        await insert("nexus_actions", {
          incident_id: id, run_id: runId, action_type: "RETEST_AND_ESCALATE",
          risk_level: "L1", authorization_state: "NOT_REQUIRED", execution_state: "PLANNED",
          plan: { steps: ["probe", "compare", "escalate_if_persistent"], mutation: false },
        });
      }
    }

    const retest = await Promise.all([probe(SITE_URL), probe(NEXUS_URL)]);
    const failedAfterRetest = retest.some((c) => c.state !== "DATA_AVAILABLE");
    const finishedAt = new Date();
    const status = anomalies.length === 0 && !failedAfterRetest ? "PASS" : "ANOMALY";

    // Close the loop: every planned action is explicitly verified after retest.
    if (anomalies.length > 0) {
      for (const anomaly of anomalies) {
        const persisted = await rest(
          "nexus_incidents?select=id,state&incident_key=eq." + encodeURIComponent(String(anomaly.incident_key)) +
          "&state=in.(OPEN,ACKNOWLEDGED)&limit=1"
        );
        const incidentId = persisted?.[0]?.id ?? null;
        if (incidentId) {
          const persistent = failedAfterRetest;
          await patch("nexus_incidents", "id=eq." + encodeURIComponent(String(incidentId)), {
            state: persistent ? "ESCALATED" : "RESOLVED",
            resolved_at: persistent ? null : finishedAt.toISOString(),
            evidence: { initial: anomaly.evidence, retest, persistent },
          });
          await patch(
            "nexus_actions",
            "incident_id=eq." + encodeURIComponent(String(incidentId)) + "&execution_state=eq.PLANNED",
            {
              execution_state: persistent ? "VERIFIED_ESCALATION" : "VERIFIED",
              result: {
                mutation: false,
                retest_passed: !persistent,
                escalated: persistent,
                verified_at: finishedAt.toISOString(),
              },
              executed_at: finishedAt.toISOString(),
              verified_at: finishedAt.toISOString(),
            }
          );
        }
      }
    }

    await patch("nexus_runtime_runs", "run_id=eq." + encodeURIComponent(runId), {
      finished_at: finishedAt.toISOString(),
      status,
      duration_ms: finishedAt.getTime() - startedAt.getTime(),
      summary: {
        phase: "VERIFY", checks, retest, anomalies: anomalies.length,
        policy: "observe-diagnose-retest-escalate; no automatic production mutation",
      },
    });

    return json({
      ok: true, run_id: runId, status, heartbeat: "ALIVE",
      autonomous_loop: ["WAKE","DISCOVER","ASSESS","DIAGNOSE","PLAN","RETEST","VERIFY","AUDIT"],
      anomalies, checks, retest, mutation_performed: false,
    });
  } catch (error) {
    try {
      await patch("nexus_runtime_runs", "run_id=eq." + encodeURIComponent(runId), {
        finished_at: new Date().toISOString(), status: "ERROR", summary: { phase: "ERROR", error: String(error) },
      });
    } catch (_) {}
    return json({ ok: false, run_id: runId, status: "ERROR", error: String(error) }, 500);
  }
});
