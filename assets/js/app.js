/* =========================================================
   TRANSMIND NUSANTARA
   APP.JS — GO LIVE ARMADA FINAL
   ========================================================= */

'use strict';

console.log('=== TRANSMIND APP.JS — ARMADA FINAL AKTIF ===');


/* =========================================================
   KONFIGURASI
   ========================================================= */

const WA_NUMBER = '6281292677888';

const VEHICLE_IMAGE_BUCKET = 'vehicle-images';

let sb = null;

let vehiclesCache = [];


/* =========================================================
   HELPER
   ========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


function escapeHtml(value) {

    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


function normalizeImageKey(value) {

    return String(value || '')
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}


/* =========================================================
   KONFIGURASI SUPABASE
   ========================================================= */

function configured() {

    return Boolean(
        window.TRANSMIND_SUPABASE_URL &&
        window.TRANSMIND_SUPABASE_URL.startsWith('http') &&
        window.TRANSMIND_SUPABASE_ANON_KEY &&
        window.TRANSMIND_SUPABASE_ANON_KEY.length > 20
    );
}


/* =========================================================
   STATUS ARMADA
   ========================================================= */

function setFleetStatus(message, type = 'normal') {

    const status = getElement('fleetStatus');

    if (!status) {
        return;
    }

    status.textContent = message;

    status.dataset.status = type;
}


/* =========================================================
   DAFTAR NAMA FILE GAMBAR YANG BENAR
   ========================================================= */

const VEHICLE_IMAGE_MAP = {

    'hyundai-ioniq': [
        'hyundai-ioniq.jpeg'
    ],

    'hyundai-palisade': [
        'hyundai-palisade.jpeg'
    ],

    'innova-zenix-hybrid-g': [
        'innova-zenix-hybrid-g.jpeg',
        'toyota-innova-zenix-hybrid-g.jpeg'
    ],

    'isuzu-elf': [
        'isuzu-elf.jpeg'
    ],

    'mercedes-benz-e-300-amg': [
        'mercedes-benz-e-300-amg.jpeg'
    ],

    'mercedes-benz-s-450-l': [
        'mercedes-benz-s-450-l.jpeg'
    ],

    'mitsubishi-pajero': [
        'mitsubishi-pajero.jpeg',
        'mitsubishi-pajero.webp'
    ],

    'mitsubishi-xpander-2025': [
        'Mitsubishi-Xpander-2025.jpeg',
        'mitsubishi-xpander-2025.jpeg'
    ],

    'suzuki-ertiga-hybrid-2025': [
        'Suzuki-Ertiga-Hybrid-2025.webp',
        'suzuki-ertiga-hybrid-2025.webp'
    ],

    'toyota-alphard-2024': [
        'toyota-alphard-2024.jpeg'
    ],

    'toyota-avanza': [
        'toyota-avanza.jpeg'
    ],

    'toyota-hiace-commuter': [
        'toyota-hiace-commuter.jpeg'
    ],

    'toyota-hiace-premio-luxury': [
        'toyota-hiace-premio-luxury.jpeg'
    ],

    'toyota-innova-venturer': [
        'toyota-innova-venturer.jpeg'
    ],

    'toyota-innova-zenix-2024-2025': [
        'Toyota-Innova-Zenix-2024-2025.jpeg'
    ],

    'toyota-innova-zenix-g-bensin': [
        'toyota-innova-zenix-g-bensin.jpeg'
    ],

    'toyota-land-cruiser-vxr-2023': [
        'toyota-land-cruiser-vxr-2023.jpeg'
    ],

    'toyota-vellfire-2': [
        'toyota-vellfire (2).jpeg'
    ],

    'toyota-vellfire': [
        'toyota-vellfire.jpeg',
        'toyota-vellfire (2).jpeg'
    ],

    'toyota-veloz-2022': [
        'toyota-veloz-2022.jpeg'
    ]

};


/* =========================================================
   KANDIDAT GAMBAR GENERIK
   ========================================================= */

function getVehicleImageCandidates(vehicle) {

    const name =
        String(vehicle?.name || '').trim();

    const slug =
        String(vehicle?.slug || '').trim();

    const normalizedSlug =
        normalizeImageKey(slug);

    const normalizedName =
        normalizeImageKey(name);

    const candidates = [];


    /* ======================================================
       PRIORITAS BERDASARKAN SLUG
       ====================================================== */

    if (VEHICLE_IMAGE_MAP[normalizedSlug]) {

        candidates.push(
            ...VEHICLE_IMAGE_MAP[normalizedSlug]
        );
    }


    /* ======================================================
       PRIORITAS BERDASARKAN NAMA
       ====================================================== */

    if (
        normalizedName &&
        VEHICLE_IMAGE_MAP[normalizedName]
    ) {

        candidates.push(
            ...VEHICLE_IMAGE_MAP[normalizedName]
        );
    }


    /* ======================================================
       NORMALISASI KHUSUS NAMA
       ====================================================== */

    const aliases = {

        'toyota-innova-zenix-hybrid-g':
            [
                'innova-zenix-hybrid-g.jpeg',
                'toyota-innova-zenix-hybrid-g.jpeg'
            ],

        'toyota-innova-zenix-hybrid-q':
            [
                'Toyota-Innova-Zenix-2024-2025.jpeg',
                'innova-zenix-hybrid-g.jpeg'
            ],

        'mitsubishi-xpander-ultimate-2023':
            [
                'Mitsubishi-Xpander-2025.jpeg'
            ],

        'toyota-hiace-premio':
            [
                'toyota-hiace-premio-luxury.jpeg',
                'toyota-hiace-commuter.jpeg'
            ],

        'toyota-alphard-2022':
            [
                'toyota-alphard-2024.jpeg'
            ],

        'toyota-vellfire-2024':
            [
                'toyota-vellfire.jpeg',
                'toyota-vellfire (2).jpeg'
            ],

        'hyundai-ioniq-5':
            [
                'hyundai-ioniq.jpeg'
            ]

    };


    if (aliases[normalizedName]) {

        candidates.push(
            ...aliases[normalizedName]
        );
    }


    if (aliases[normalizedSlug]) {

        candidates.push(
            ...aliases[normalizedSlug]
        );
    }


    /* ======================================================
       FALLBACK BERDASARKAN SLUG
       ====================================================== */

    if (slug) {

        candidates.push(
            `${slug}.jpeg`,
            `${slug}.jpg`,
            `${slug}.webp`,
            `${slug}.png`
        );
    }


    /* ======================================================
       FALLBACK BERDASARKAN NAMA
       ====================================================== */

    if (normalizedName) {

        candidates.push(
            `${normalizedName}.jpeg`,
            `${normalizedName}.jpg`,
            `${normalizedName}.webp`,
            `${normalizedName}.png`
        );
    }


    return [
        ...new Set(
            candidates.filter(Boolean)
        )
    ];
}


/* =========================================================
   URL STORAGE
   ========================================================= */

function getStoragePublicUrl(fileName) {

    if (!sb || !fileName) {
        return '';
    }

    try {

        const {
            data
        } =
            sb.storage
                .from(VEHICLE_IMAGE_BUCKET)
                .getPublicUrl(fileName);

        return data?.publicUrl || '';

    } catch (error) {

        console.error(
            'Storage URL ERROR:',
            error
        );

        return '';
    }
}


/* =========================================================
   COBA GAMBAR BERIKUTNYA
   ========================================================= */

function tryNextVehicleImage(img) {

    if (!img) {
        return;
    }


    let candidates = [];


    try {

        candidates =
            JSON.parse(
                img.dataset.imageCandidates || '[]'
            );

    } catch {

        candidates = [];
    }


    let index =
        Number(
            img.dataset.imageIndex || 0
        );


    index++;


    if (
        index >=
        candidates.length
    ) {

        img.style.display = 'none';


        const placeholder =
            img.parentElement
                ?.querySelector(
                    '.vehicle-placeholder'
                );


        if (placeholder) {

            placeholder.style.display =
                'flex';
        }


        console.warn(
            'Semua gambar gagal:',
            candidates
        );

        return;
    }


    const nextFile =
        candidates[index];


    const nextUrl =
        getStoragePublicUrl(
            nextFile
        );


    img.dataset.imageIndex =
        String(index);


    if (!nextUrl) {

        tryNextVehicleImage(
            img
        );

        return;
    }


    console.log(
        'Mencoba gambar berikut:',
        nextFile
    );


    img.src =
        nextUrl;
}


/* =========================================================
   RENDER ARMADA
   ========================================================= */

function showCars(list) {

    vehiclesCache =
        Array.isArray(list)
            ? list
            : [];


    const vehicleSelect =
        getElement('vehicle');


    const cars =
        getElement('cars');


    /* ======================================================
       DROPDOWN BOOKING
       ====================================================== */

    if (vehicleSelect) {

        vehicleSelect.innerHTML =
            '<option value="">Pilih kendaraan</option>';


        vehiclesCache.forEach(
            vehicle => {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    vehicle.id || '';


                option.textContent =
                    vehicle.name ||
                    'Kendaraan';


                vehicleSelect.appendChild(
                    option
                );
            }
        );
    }


    /* ======================================================
       CONTAINER ARMADA
       ====================================================== */

    if (!cars) {
        return;
    }


    if (!vehiclesCache.length) {

        cars.innerHTML = `
            <div class="fleet-empty">
                Tidak ada armada aktif di database.
            </div>
        `;

        return;
    }


    /* ======================================================
       KARTU ARMADA
       ====================================================== */

    cars.innerHTML =
        vehiclesCache.map(
            vehicle => {

                const id =
                    vehicle.id || '';


                const name =
                    vehicle.name ||
                    'Kendaraan';


                const category =
                    vehicle.category ||
                    'Armada Transmind';


                const capacity =
                    vehicle.capacity ||
                    'Sesuai tipe kendaraan';


                const slug =
                    vehicle.slug ||
                    '';


                const candidates =
                    getVehicleImageCandidates(
                        vehicle
                    );


                const firstUrl =
                    candidates.length
                        ? getStoragePublicUrl(
                            candidates[0]
                        )
                        : '';


                return `

                    <article
                        class="car"
                        data-vehicle-id="${escapeHtml(id)}"
                    >

                        <div class="photo">

                            ${
                                firstUrl
                                    ? `

                                        <img
                                            src="${escapeHtml(firstUrl)}"

                                            alt="${escapeHtml(name)}"

                                            loading="lazy"

                                            data-image-index="0"

                                            data-image-candidates="${escapeHtml(
                                                JSON.stringify(candidates)
                                            )}"

                                            onerror="
                                                tryNextVehicleImage(this);
                                            "
                                        >

                                    `
                                    : ''
                            }


                            <div
                                class="vehicle-placeholder"

                                style="
                                    display:${firstUrl ? 'none' : 'flex'};
                                "
                            >

                                <strong>
                                    ${escapeHtml(name)}
                                </strong>

                            </div>

                        </div>


                        <div class="ci">

                            <b>
                                ${escapeHtml(category)}
                            </b>


                            <h3>
                                ${escapeHtml(name)}
                            </h3>


                            <p>
                                ${escapeHtml(capacity)}
                                • Jabodetabek
                            </p>


                            <button
                                type="button"
                                class="btn gold"

                                data-select-vehicle="${escapeHtml(id)}"
                            >
                                PILIH KENDARAAN
                            </button>

                        </div>

                    </article>

                `;

            }
        ).join('');


    /* ======================================================
       TOMBOL PILIH
       ====================================================== */

    cars
        .querySelectorAll(
            '[data-select-vehicle]'
        )
        .forEach(
            button => {

                button.addEventListener(
                    'click',
                    () => {

                        selectVehicle(
                            button.dataset
                                .selectVehicle
                        );

                    }
                );

            }
        );
}


/* =========================================================
   PILIH KENDARAAN
   ========================================================= */

function selectVehicle(vehicleId) {

    const select =
        getElement('vehicle');


    if (!select) {
        return;
    }


    select.value =
        vehicleId || '';


    updateVehicleInfo(
        vehicleId
    );


    window.location.hash =
        'booking';


    select.focus();
}


/* =========================================================
   INFORMASI KENDARAAN
   ========================================================= */

function updateVehicleInfo(vehicleId) {

    const priceBox =
        getElement('vehiclePrice');


    if (!priceBox) {
        return;
    }


    const vehicle =
        vehiclesCache.find(
            item =>
                String(item.id) ===
                String(vehicleId)
        );


    if (!vehicle) {

        priceBox.textContent =
            'Pilih kendaraan untuk melihat informasi rental.';

        return;
    }


    priceBox.textContent =
        `${vehicle.name || 'Kendaraan'} • ${
            vehicle.category || 'Armada'
        } • ${
            vehicle.capacity || 'Kapasitas sesuai tipe kendaraan'
        }`;
}


/* =========================================================
   LOAD ARMADA DARI SUPABASE
   ========================================================= */

async function loadVehicles() {

    setFleetStatus(
        'Menghubungkan ke database armada...',
        'loading'
    );


    /* ======================================================
       JANGAN GUNAKAN FALLBACK ARMADA
       ====================================================== */

    if (!configured()) {

        console.error(
            'Supabase belum dikonfigurasi.'
        );


        showCars([]);


        setFleetStatus(
            'Database armada belum terhubung.',
            'error'
        );


        return;
    }


    try {

        /* ==================================================
           CREATE SUPABASE CLIENT
           ================================================== */

        sb =
            window.supabase
                .createClient(
                    window.TRANSMIND_SUPABASE_URL,
                    window.TRANSMIND_SUPABASE_ANON_KEY
                );


        console.log(
            'Supabase client berhasil dibuat.'
        );


        /* ==================================================
           AMBIL DATA ARMADA TERBARU
           ================================================== */

        const {
            data,
            error
        } =
            await sb
                .from('vehicles')
                .select(
                    'id,name,slug,category,capacity,active'
                )
                .eq(
                    'active',
                    true
                )
                .order(
                    'name',
                    {
                        ascending: true
                    }
                );


        /* ==================================================
           ERROR DATABASE
           ================================================== */

        if (error) {

            console.error(
                'SUPABASE VEHICLES ERROR:',
                error
            );


            showCars([]);


            setFleetStatus(
                'Gagal mengambil data armada dari database.',
                'error'
            );


            return;
        }


        /* ==================================================
           VALIDASI DATA
           ================================================== */

        if (
            !Array.isArray(data)
        ) {

            console.error(
                'Data armada bukan array:',
                data
            );


            showCars([]);


            setFleetStatus(
                'Format data armada tidak valid.',
                'error'
            );


            return;
        }


        /* ==================================================
           DATA ARMADA FINAL
           ================================================== */

        console.log(
            '=== ARMADA DARI SUPABASE ==='
        );


        console.log(
            `Jumlah armada aktif: ${data.length}`
        );


        console.table(
            data
        );


        showCars(
            data
        );


        setFleetStatus(
            `${data.length} kendaraan tersedia`,
            'success'
        );


    } catch (error) {

        console.error(
            'LOAD VEHICLES FATAL ERROR:',
            error
        );


        showCars([]);


        setFleetStatus(
            'Terjadi kesalahan saat memuat armada.',
            'error'
        );
    }
}


/* =========================================================
   DATA FORM BOOKING
   ========================================================= */

function getFormData() {

    const vehicleSelect =
        getElement('vehicle');


    const selectedOption =
        vehicleSelect &&
        vehicleSelect.options[
            vehicleSelect.selectedIndex
        ];


    return {

        name:
            getElement('name')
                ?.value
                .trim() || '',


        phone:
            getElement('phone')
                ?.value
                .trim() || '',


        vehicleId:
            vehicleSelect
                ?.value
                .trim() || '',


        vehicleName:
            selectedOption
                ?.textContent
                .trim() || '',


        service:
            getElement('service')
                ?.value
                .trim() || '',


        start:
            getElement('start')
                ?.value || '',


        end:
            getElement('end')
                ?.value || '',


        area:
            getElement('area')
                ?.value
                .trim() || '',


        notes:
            getElement('notes')
                ?.value
                .trim() || ''

    };
}


/* =========================================================
   VALIDASI BOOKING
   ========================================================= */

function validateBooking(
    data,
    resultBox
) {

    if (!data.name) {

        resultBox.textContent =
            'Nama wajib diisi.';

        return false;
    }


    if (!data.phone) {

        resultBox.textContent =
            'Nomor WhatsApp wajib diisi.';

        return false;
    }


    if (!data.vehicleId) {

        resultBox.textContent =
            'Silakan pilih kendaraan terlebih dahulu.';

        return false;
    }


    if (!data.start || !data.end) {

        resultBox.textContent =
            'Tanggal booking wajib diisi.';

        return false;
    }


    if (
        data.end <
        data.start
    ) {

        resultBox.textContent =
            'Tanggal selesai tidak boleh sebelum tanggal mulai.';

        return false;
    }


    return true;
}


/* =========================================================
   WHATSAPP BOOKING BERHASIL
   ========================================================= */

function openSuccessWhatsApp(
    formData,
    result
) {

    if (Array.isArray(result)) {
        result = result[0];
    }


    const code =
        result?.booking_code ||
        'TRM-BOOKING';


    const vehicleName =
        result?.vehicle_name ||
        formData?.vehicleName ||
        '-';


    const message =
`Halo Transmind Nusantara,

Booking saya sudah dibuat.

Kode Booking: ${code}

Nama: ${formData?.name || '-'}
WhatsApp: ${formData?.phone || '-'}

Kendaraan: ${vehicleName}
Layanan: ${formData?.service || '-'}

Tanggal:
${formData?.start || '-'} s/d ${formData?.end || '-'}

Area: ${formData?.area || '-'}
Catatan: ${formData?.notes || '-'}

Mohon konfirmasi booking saya.

Terima kasih.`;


    const url =
        'https://wa.me/' +
        WA_NUMBER +
        '?text=' +
        encodeURIComponent(
            message
        );


    window.location.href =
        url;
}


/* =========================================================
   WHATSAPP JIKA TIDAK TERSEDIA
   ========================================================= */

function openUnavailableWhatsApp(
    formData,
    messageText
) {

    const message =
`Halo Transmind Nusantara.

Saya ingin menyewa kendaraan, tetapi kendaraan yang saya pilih sedang tidak tersedia.

Kendaraan: ${formData.vehicleName}
Layanan: ${formData.service}

Tanggal:
${formData.start} s/d ${formData.end}

Area: ${formData.area}

Keterangan sistem:
${messageText}

Mohon dibantu mencarikan kendaraan alternatif yang tersedia.

Terima kasih.`;


    const url =
        'https://wa.me/' +
        WA_NUMBER +
        '?text=' +
        encodeURIComponent(
            message
        );


    window.location.href =
        url;
}


/* =========================================================
   SUBMIT BOOKING
   ========================================================= */

async function submitBooking(event) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const resultBox =
        getElement('result');


    if (!resultBox) {
        return;
    }


    resultBox.textContent =
        'Memproses booking...';


    const data =
        getFormData();


    if (
        !validateBooking(
            data,
            resultBox
        )
    ) {

        return;
    }


    if (!sb) {

        resultBox.textContent =
            'Database belum terhubung. Silakan refresh halaman.';

        return;
    }


    try {

        console.log(
            'Mengirim booking:',
            data
        );


        const {
            data: rpcData,
            error
        } =
            await sb.rpc(
                'create_booking',
                {

                    p_name:
                        data.name,

                    p_phone:
                        data.phone,

                    p_vehicle_id:
                        data.vehicleId,

                    p_service:
                        data.service,

                    p_start_date:
                        data.start,

                    p_end_date:
                        data.end,

                    p_area:
                        data.area,

                    p_notes:
                        data.notes

                }
            );


        console.log(
            'CREATE BOOKING RESULT:',
            rpcData
        );


        if (error) {

            console.error(
                'CREATE BOOKING ERROR:',
                error
            );


            resultBox.textContent =
                'Terjadi kesalahan sistem: ' +
                error.message;


            return;
        }


        const result =
            Array.isArray(rpcData)
                ? rpcData[0]
                : rpcData;


        if (!result) {

            resultBox.textContent =
                'Sistem tidak menerima hasil booking dari database.';

            return;
        }


        /* ==================================================
           BOOKING GAGAL
           ================================================== */

        if (!result.success) {

            const message =
                result.message ||
                'Booking tidak dapat dibuat.';


            resultBox.innerHTML =
                `<b>${escapeHtml(message)}</b>`;


            if (
                /tidak tersedia|sedang digunakan|seluruh unit/i
                    .test(message)
            ) {

                openUnavailableWhatsApp(
                    data,
                    message
                );
            }


            return;
        }


        /* ==================================================
           BOOKING BERHASIL
           ================================================== */

        resultBox.innerHTML = `

            Booking berhasil dibuat.
            <br>

            <b>
                Kode:
                ${escapeHtml(
                    result.booking_code ||
                    '-'
                )}
            </b>

            <br>

            Kendaraan:
            ${escapeHtml(
                result.vehicle_name ||
                data.vehicleName
            )}

        `;


        openSuccessWhatsApp(
            data,
            result
        );


        form.reset();


        const vehicleSelect =
            getElement('vehicle');


        if (vehicleSelect) {

            vehicleSelect.selectedIndex =
                0;
        }


        updateVehicleInfo('');


    } catch (error) {

        console.error(
            'SUBMIT BOOKING ERROR:',
            error
        );


        resultBox.textContent =
            'Terjadi kesalahan: ' +
            error.message;
    }
}


/* =========================================================
   EVENT LISTENER
   ========================================================= */

function setupEvents() {

    /* ======================================================
       FORM
       ====================================================== */

    const form =
        getElement('bookingForm');


    if (form) {

        form.addEventListener(
            'submit',
            submitBooking
        );
    }


    /* ======================================================
       DROPDOWN VEHICLE
       ====================================================== */

    const vehicle =
        getElement('vehicle');


    if (vehicle) {

        vehicle.addEventListener(
            'change',
            event => {

                updateVehicleInfo(
                    event.target.value
                );

            }
        );
    }


    /* ======================================================
       TANGGAL
       ====================================================== */

    const start =
        getElement('start');


    const end =
        getElement('end');


    const today =
        new Date()
            .toISOString()
            .slice(
                0,
                10
            );


    if (start) {

        start.min =
            today;
    }


    if (end) {

        end.min =
            today;
    }


    if (start && end) {

        start.addEventListener(
            'change',
            () => {

                end.min =
                    start.value;


                if (
                    end.value &&
                    end.value <
                    start.value
                ) {

                    end.value =
                        start.value;
                }

            }
        );
    }
}


/* =========================================================
   INIT
   ========================================================= */

async function init() {

    console.log(
        '=== TRANSMIND INITIALIZATION ==='
    );


    setupEvents();


    await loadVehicles();


    console.log(
        '=== TRANSMIND INITIALIZATION SELESAI ==='
    );
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    init
);
