/* =========================================================
   TRANSMIND NUSANTARA
   APP.JS — GO LIVE FINAL ARMADA + BOOKING
   ========================================================= */

'use strict';

console.log('=== TRANSMIND APP.JS GO-LIVE FINAL AKTIF ===');


/* =========================================================
   KONFIGURASI
   ========================================================= */

const WA_NUMBER = '6281292677888';

const VEHICLE_IMAGE_BUCKET = 'vehicle-images';

let sb = null;
let vehiclesCache = [];


/* =========================================================
   FALLBACK ARMADA
   ========================================================= */

const fallbackVehicles = [
    'Toyota Rocky',
    'Toyota Avanza',
    'Honda Brio',
    'Toyota Avanza 2022',
    'Toyota Veloz 2022',
    'Honda Jazz',
    'Toyota Rush',
    'Mitsubishi Xpander Ultimate 2023',
    'Honda City RS',
    'Toyota Innova Reborn Bensin',
    'Toyota Innova Reborn Diesel',
    'Toyota Innova Zenix G Bensin',
    'Toyota Innova Zenix Hybrid G',
    'Honda HR-V',
    'Toyota Innova Venturer',
    'Honda CR-V',
    'Toyota Fortuner',
    'Mitsubishi Pajero',
    'Toyota Innova Zenix Hybrid Q',
    'Mitsubishi Pajero 4x4',
    'Honda Accord',
    'Hyundai Palisade',
    'Hyundai Ioniq',
    'BMW',
    'Honda Civic RS',
    'Toyota Alphard 2022',
    'Toyota Alphard 2024',
    'Toyota Vellfire',
    'Mercedes-Benz E 300 AMG',
    'Mercedes-Benz S 450 L',
    'Toyota Land Cruiser VXR 2023',
    'Toyota Hiace Premio Luxury',
    'Toyota Hiace Premio',
    'Isuzu ELF',
    'Bus Medium',
    'Big Bus'
];


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


/* =========================================================
   NORMALISASI
   ========================================================= */

function normalizeImageKey(value) {

    return String(value || '')
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

}


/* =========================================================
   PEMETAAN FILE STORAGE
   =========================================================
   
   INI BAGIAN PENTING.
   
   Nama file dibuat mengikuti file yang benar-benar
   ada di bucket vehicle-images.
   ========================================================= */

const VEHICLE_IMAGE_MAP = {

    'toyota-rocky':
        [
            'toyota-rocky.jpg',
            'toyota-rocky.jpeg',
            'toyota-rocky.webp',
            'toyota-rocky.png',
            'toyota-rocky..jpg'
        ],

    'toyota-avanza':
        [
            'toyota-avanza.jpeg',
            'toyota-avanza.jpg',
            'toyota-avanza.webp'
        ],

    'honda-brio':
        [
            'honda-brio.jpeg',
            'honda-brio.jpg',
            'honda-brio.webp'
        ],

    'toyota-avanza-2022':
        [
            'toyota-avanza-2022.jpeg',
            'toyota-avanza-2022.jpg',
            'toyota-avanza-2022.webp'
        ],

    'toyota-veloz-2022':
        [
            'toyota-veloz-2022.jpeg',
            'toyota-veloz-2022.jpg',
            'toyota-veloz-2022.webp'
        ],

    'honda-jazz':
        [
            'honda-jazz.jpeg',
            'honda-jazz.jpg',
            'honda-jazz.webp'
        ],

    'toyota-rush':
        [
            'toyota-rush.jpeg',
            'toyota-rush.jpg',
            'toyota-rush.webp'
        ],

    'mitsubishi-xpander-ultimate-2023':
        [
            'Mitsubishi-Xpander-2025.jpeg',
            'mitsubishi-xpander-ultimate-2023.jpeg',
            'mitsubishi-xpander-ultimate-2023.jpg',
            'mitsubishi-xpander-ultimate-2023.webp'
        ],

    'honda-city-rs':
        [
            'honda-city-rs.jpeg',
            'honda-city-rs.jpg',
            'honda-city-rs.webp'
        ],

    'toyota-innova-reborn-bensin':
        [
            'toyota-innova-reborn-bensin.jpeg',
            'toyota-innova-reborn-bensin.jpg',
            'toyota-innova-reborn-bensin.webp'
        ],

    'toyota-innova-reborn-diesel':
        [
            'toyota-innova-reborn-diesel.jpeg',
            'toyota-innova-reborn-diesel.jpg',
            'toyota-innova-reborn-diesel.webp'
        ],

    'toyota-innova-zenix-g-bensin':
        [
            'toyota-innova-zenix-g-bensin.jpeg',
            'toyota-innova-zenix-g-bensin.jpg',
            'toyota-innova-zenix-g-bensin.webp'
        ],

    'toyota-innova-zenix-hybrid-g':
        [
            'innova-zenix-hybrid-g.jpeg',
            'toyota-innova-zenix-hybrid-g.jpeg',
            'toyota-innova-zenix-hybrid-g.jpg',
            'toyota-innova-zenix-hybrid-g.webp'
        ],

    'honda-hr-v':
        [
            'honda-hr-v.jpeg',
            'honda-hr-v.jpg',
            'honda-hr-v.webp'
        ],

    'toyota-innova-venturer':
        [
            'toyota-innova-venturer.jpeg',
            'toyota-innova-venturer.jpg',
            'toyota-innova-venturer.webp'
        ],

    'honda-cr-v':
        [
            'honda-cr-v.jpeg',
            'honda-cr-v.jpg',
            'honda-cr-v.webp'
        ],

    'toyota-fortuner':
        [
            'toyota-fortuner.jpeg',
            'toyota-fortuner.jpg',
            'toyota-fortuner.webp'
        ],

    'mitsubishi-pajero':
        [
            'mitsubishi-pajero.jpeg',
            'mitsubishi-pajero.jpg',
            'mitsubishi-pajero.webp',
            'mitsubishi-pajero..webp'
        ],

    'toyota-innova-zenix-hybrid-q':
        [
            'Toyota-Innova-Zenix-2024-2025.jpeg',
            'toyota-innova-zenix-hybrid-q.jpeg',
            'toyota-innova-zenix-hybrid-q.jpg',
            'toyota-innova-zenix-hybrid-q.webp'
        ],

    'mitsubishi-pajero-4x4':
        [
            'mitsubishi-pajero.jpeg',
            'mitsubishi-pajero.jpg',
            'mitsubishi-pajero.webp'
        ],

    'honda-accord':
        [
            'honda-accord.jpeg',
            'honda-accord.jpg',
            'honda-accord.webp'
        ],

    'hyundai-palisade':
        [
            'hyundai-palisade.jpeg',
            'hyundai-palisade.jpg',
            'hyundai-palisade.webp'
        ],

    'hyundai-ioniq':
        [
            'hyundai-ioniq.jpeg',
            'hyundai-ioniq.jpg',
            'hyundai-ioniq.webp'
        ],

    'bmw':
        [
            'bmw.jpeg',
            'bmw.jpg',
            'bmw.webp'
        ],

    'honda-civic-rs':
        [
            'honda-civic-rs.jpeg',
            'honda-civic-rs.jpg',
            'honda-civic-rs.webp'
        ],

    'toyota-alphard-2022':
        [
            'toyota-alphard-2024.jpeg',
            'toyota-alphard-2022.jpeg',
            'toyota-alphard-2022.jpg',
            'toyota-alphard-2022.webp'
        ],

    'toyota-alphard-2024':
        [
            'toyota-alphard-2024.jpeg',
            'toyota-alphard-2024.jpg',
            'toyota-alphard-2024.webp'
        ],

    'toyota-vellfire':
        [
            'toyota-vellfire.jpeg',
            'toyota-vellfire (2).jpeg',
            'toyota-vellfire.jpg',
            'toyota-vellfire.webp'
        ],

    'mercedes-benz-e-300-amg':
        [
            'mercedes-benz-e-300-amg.jpeg',
            'mercedes-benz-e-300-amg.jpg',
            'mercedes-benz-e-300-amg.webp'
        ],

    'mercedes-benz-s-450-l':
        [
            'mercedes-benz-s-450-l.jpeg',
            'mercedes-benz-s-450-l.jpg',
            'mercedes-benz-s-450-l.webp'
        ],

    'toyota-land-cruiser-vxr-2023':
        [
            'toyota-land-cruiser-vxr-2023.jpeg',
            'toyota-land-cruiser-vxr-2023.jpg',
            'toyota-land-cruiser-vxr-2023.webp'
        ],

    'toyota-hiace-premio-luxury':
        [
            'toyota-hiace-premio-luxury.jpeg',
            'toyota-hiace-premio-luxury.jpg',
            'toyota-hiace-premio-luxury.webp'
        ],

    'toyota-hiace-premio':
        [
            'toyota-hiace-premio-luxury.jpeg',
            'toyota-hiace-premio.jpeg',
            'toyota-hiace-premio.jpg',
            'toyota-hiace-premio.webp'
        ],

    'toyota-hiace-commuter':
        [
            'toyota-hiace-commuter.jpeg',
            'toyota-hiace-commuter.jpg',
            'toyota-hiace-commuter.webp'
        ],

    'isuzu-elf':
        [
            'isuzu-elf.jpeg',
            'isuzu-elf.jpg',
            'isuzu-elf.webp'
        ],

    'bus-medium':
        [
            'bus-medium.jpeg',
            'bus-medium.jpg',
            'bus-medium.webp',
            'bus-medium.png'
        ],

    'big-bus':
        [
            'big-bus.jpeg',
            'big-bus.jpg',
            'big-bus.webp',
            'big-bus.png'
        ],

    'suzuki-ertiga-hybrid-2025':
        [
            'Suzuki-Ertiga-Hybrid-2025.webp',
            'suzuki-ertiga-hybrid-2025.webp',
            'Suzuki-Ertiga-Hybrid-2025.jpeg',
            'suzuki-ertiga-hybrid-2025.jpeg'
        ]

};


/* =========================================================
   BUAT KANDIDAT GAMBAR
   ========================================================= */

function getVehicleImageCandidates(vehicle) {

    const name =
        String(vehicle?.name || '').trim();

    const slug =
        String(vehicle?.slug || '').trim();

    const key =
        normalizeImageKey(slug || name);

    let candidates = [];

    /*
       Prioritas:
       1. mapping khusus
       2. slug
       3. nama
    */

    if (VEHICLE_IMAGE_MAP[key]) {

        candidates.push(
            ...VEHICLE_IMAGE_MAP[key]
        );

    }


    if (slug) {

        candidates.push(
            `${slug}.jpeg`,
            `${slug}.jpg`,
            `${slug}.webp`,
            `${slug}.png`
        );

    }


    if (name) {

        const nameKey =
            normalizeImageKey(name);

        candidates.push(
            `${nameKey}.jpeg`,
            `${nameKey}.jpg`,
            `${nameKey}.webp`,
            `${nameKey}.png`
        );

    }


    return [
        ...new Set(candidates)
    ];

}


/* =========================================================
   STORAGE PUBLIC URL
   ========================================================= */

function getStoragePublicUrl(fileName) {

    if (!sb || !fileName) {
        return '';
    }

    try {

        const result =
            sb.storage
                .from(VEHICLE_IMAGE_BUCKET)
                .getPublicUrl(fileName);

        return result?.data?.publicUrl || '';

    } catch (error) {

        console.error(
            'Gagal membuat URL Storage:',
            error
        );

        return '';

    }

}


/* =========================================================
   TEST GAMBAR SATU PER SATU
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
            img.parentElement?.querySelector(
                '.vehicle-placeholder'
            );


        if (placeholder) {

            placeholder.style.display =
                'flex';

        }


        console.warn(
            'Gambar tidak ditemukan untuk kendaraan:',
            img.alt,
            candidates
        );

        return;

    }


    img.dataset.imageIndex =
        String(index);


    const nextFile =
        candidates[index];


    const nextUrl =
        getStoragePublicUrl(
            nextFile
        );


    console.log(
        'Mencoba gambar:',
        nextFile
    );


    img.src =
        nextUrl;

}


/* =========================================================
   SUPABASE CONFIG
   ========================================================= */

function configured() {

    return Boolean(

        window.TRANSMIND_SUPABASE_URL &&

        window.TRANSMIND_SUPABASE_URL
            .startsWith('http') &&

        window.TRANSMIND_SUPABASE_ANON_KEY &&

        window.TRANSMIND_SUPABASE_ANON_KEY.length > 20

    );

}


/* =========================================================
   STATUS ARMADA
   ========================================================= */

function setFleetStatus(
    message,
    type = 'normal'
) {

    const status =
        getElement('fleetStatus');

    if (!status) {
        return;
    }

    status.textContent =
        message;

    status.dataset.status =
        type;

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
       DROPDOWN
       ====================================================== */

    if (vehicleSelect) {

        vehicleSelect.innerHTML =
            '<option value="">Pilih kendaraan</option>';


        vehiclesCache.forEach(
            vehicle => {

                const option =
                    document.createElement('option');


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


    if (!cars) {
        return;
    }


    if (!vehiclesCache.length) {

        cars.innerHTML = `
            <div class="fleet-empty">
                Armada belum tersedia.
            </div>
        `;

        return;

    }


    cars.innerHTML =
        vehiclesCache.map(
            vehicle => {

                const name =
                    vehicle.name ||
                    'Kendaraan';


                const category =
                    vehicle.category ||
                    'Armada Transmind';


                const capacity =
                    vehicle.capacity ||
                    'Kapasitas sesuai tipe kendaraan';


                const id =
                    vehicle.id ||
                    '';


                const candidates =
                    getVehicleImageCandidates(
                        vehicle
                    );


                const firstFile =
                    candidates[0] || '';


                const firstUrl =
                    getStoragePublicUrl(
                        firstFile
                    );


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

                            <!-- NAMA KENDARAAN -->

                            <h3
                                style="
                                    margin:0 0 7px;
                                    font-size:18px;
                                    color:#111923;
                                "
                            >
                                ${escapeHtml(name)}
                            </h3>


                            <!-- JENIS / KATEGORI -->

                            <b>
                                ${escapeHtml(category)}
                            </b>


                            <!-- KAPASITAS -->

                            <p>
                                ${escapeHtml(capacity)}
                                • Jabodetabek
                            </p>


                            <button
                                type="button"

                                class="btn gold"

                                data-select-vehicle="${escapeHtml(id)}"
                            >
                                PILIH
                            </button>

                        </div>

                    </article>

                `;

            }
        ).join('');


    /* ======================================================
       BUTTON PILIH
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


    if (
        select.value !==
        vehicleId
    ) {

        console.warn(
            'Vehicle ID tidak ditemukan:',
            vehicleId
        );

        return;

    }


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
                item.id === vehicleId
        );


    if (!vehicle) {

        priceBox.textContent =
            'Pilih kendaraan untuk melihat informasi rental.';

        return;

    }


    priceBox.textContent =
        `${vehicle.name} • ${
            vehicle.category ||
            'Armada'
        } • ${
            vehicle.capacity ||
            'Kapasitas sesuai tipe kendaraan'
        }`;

}


/* =========================================================
   LOAD ARMADA
   ========================================================= */

async function loadVehicles() {

    setFleetStatus(
        'Menghubungkan ke database...',
        'loading'
    );


    if (!configured()) {

        console.warn(
            'Supabase belum dikonfigurasi.'
        );


        const fallback =
            fallbackVehicles.map(
                (name, index) => ({

                    id:
                        `fallback-${index + 1}`,

                    name,

                    slug:
                        normalizeImageKey(name),

                    category:
                        'Armada',

                    capacity:
                        'Sesuai tipe kendaraan'

                })
            );


        showCars(
            fallback
        );


        setFleetStatus(
            `Mode offline — ${fallback.length} kendaraan`,
            'warning'
        );


        return;

    }


    try {

        sb =
            window.supabase
                .createClient(
                    window.TRANSMIND_SUPABASE_URL,
                    window.TRANSMIND_SUPABASE_ANON_KEY
                );


        console.log(
            'Supabase client berhasil dibuat.'
        );


        const {
            data,
            error
        } =
            await sb
                .from('vehicles')
                .select(
                    'id,name,slug,category,capacity'
                )
                .eq(
                    'active',
                    true
                )
                .order(
                    'name'
                );


        if (error) {

            console.error(
                'Gagal mengambil armada:',
                error
            );

            throw error;

        }


        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            showCars([]);


            setFleetStatus(
                'Belum ada kendaraan aktif.',
                'warning'
            );


            return;

        }


        console.log(
            `Armada berhasil dimuat: ${data.length} kendaraan`,
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
            'LOAD VEHICLES ERROR:',
            error
        );


        const fallback =
            fallbackVehicles.map(
                (name, index) => ({

                    id:
                        `fallback-${index + 1}`,

                    name,

                    slug:
                        normalizeImageKey(name),

                    category:
                        'Armada',

                    capacity:
                        'Sesuai tipe kendaraan'

                })
            );


        showCars(
            fallback
        );


        setFleetStatus(
            'Database tidak dapat diakses. Mode cadangan aktif.',
            'warning'
        );

    }

}


/* =========================================================
   FORM DATA
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

    if (!data.vehicleId) {

        resultBox.textContent =
            'Silakan pilih kendaraan terlebih dahulu.';

        return false;

    }


    if (
        data.vehicleId
            .startsWith('fallback-')
    ) {

        resultBox.textContent =
            'Database armada belum terhubung. Silakan refresh halaman.';

        return false;

    }


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


    if (
        !data.start ||
        !data.end
    ) {

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
   WHATSAPP BERHASIL
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
        encodeURIComponent(message);


    window.location.href =
        url;

}


/* =========================================================
   WHATSAPP ALTERNATIF
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
        encodeURIComponent(message);


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


        resultBox.innerHTML = `

            Booking berhasil dibuat.
            <br>

            <b>
                Kode:
                ${escapeHtml(
                    result.booking_code || '-'
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
   EVENT
   ========================================================= */

function setupEvents() {

    const form =
        getElement('bookingForm');


    if (form) {

        form.addEventListener(
            'submit',
            submitBooking
        );

    }


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


    const start =
        getElement('start');


    const end =
        getElement('end');


    const today =
        new Date()
            .toISOString()
            .slice(0, 10);


    if (start) {

        start.min =
            today;

    }


    if (end) {

        end.min =
            today;

    }


    if (
        start &&
        end
    ) {

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
        'TRANSMIND: initialization dimulai'
    );


    setupEvents();


    await loadVehicles();


    console.log(
        'TRANSMIND: initialization selesai'
    );

}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    init
);
