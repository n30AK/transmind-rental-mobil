# TransMind NEXUS — Autonomous Runtime v1

## Implemented
- Supabase audit schema
- Server-side Edge Function watchdog
- 15-minute GitHub Actions scheduler
- heartbeat/run IDs
- website and NEXUS route probes
- explicit measurement states: DATA_AVAILABLE / NO_DATA / DATA_UNAVAILABLE / DATA_STALE / UNKNOWN
- anomaly detection
- incident/action audit records
- mandatory retest
- no automatic production mutation in v1

## Production target
Supabase project: `ynigwuutmqpnfnkhlaip`

## Required Supabase Edge Function secrets
- `NEXUS_RUNTIME_SECRET`
- `TRANSMIND_SITE_URL=https://transmindnusantararentalmobil.co.id/`
- `TRANSMIND_NEXUS_URL=https://transmindnusantararentalmobil.co.id/nexus/`

Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the Edge Function.

## Required GitHub Actions secrets
- `NEXUS_RUNTIME_URL=https://ynigwuutmqpnfnkhlaip.supabase.co/functions/v1/nexus-autonomous-runtime`
- `NEXUS_RUNTIME_SECRET` (same value as the Edge Function secret)

## Deployment gate
1. Apply the migration to the existing production Supabase project.
2. Deploy the Edge Function with JWT verification disabled only because the function has its own shared-secret gate.
3. Add the GitHub Actions secrets.
4. Run the workflow manually.
5. Verify a `NXR-...` run in `nexus_runtime_runs`.
6. Verify the workflow reports `heartbeat: ALIVE`.
7. Verify the second probe/retest.
8. Only then enable additional L2/L3 actions under explicit policy.

## Governance
L0/L1 observation and diagnostics may run automatically. L2/L3 require explicit policy authorization and an audit record. L4 remains human-gated. No fake traffic, fake rankings, scraping, keyword stuffing, mass auto-publishing, doorway pages, or silent production mutations.
