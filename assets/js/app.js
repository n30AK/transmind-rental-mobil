/* =========================================================
   TRANSMIND NUSANTARA
   APP.JS — GO LIVE FINAL
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


function rupiah(value) {

    return new Intl.NumberFormat(
        'id-ID',
        {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }
    ).format(Number(value || 0));
}


/* =========================================================
   NORMALISASI NAMA FILE
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
   DAFTAR KANDIDAT GAMBAR
   ========================================================= */

function getVehicleImageCandidates(vehicle) {

    const name = String(
        vehicle?.name || ''
    ).trim();

    const slug = String(
        vehicle?.slug || ''
    ).trim();

    const key = normalizeImageKey(
        slug || name
    );

    const candidates = [];

    /*
       ======================================================
       NAMA KHUSUS YANG SUDAH ADA DI STORAGE
       ======================================================
    */

    const specialMap = {

        'toyota-rocky': [
            'toyota-rocky..jpg',
            'toyota-rocky.jpg',
            'toyota-rocky.jpeg',
            'toyota-rocky.webp',
            'toyota-rocky.png'
        ],

        'toyota-innova-zenix-hybrid-g': [
            'toyota-innova-zenix-hybrid-g.jpg',
            'toyota-innova-zenix-hybrid-g.jpeg',
            'toyota-innova-zenix-hybrid-g.webp',
            'toyota-innova-zenix-hybrid-g.png'
        ],

        'mitsubishi-pajero': [
            'mitsubishi-pajero..webp',
            'mitsubishi-pajero.webp',
            'mitsubishi-pajero.jpg',
            'mitsubishi-pajero.jpeg',
            'mitsubishi-pajero.png'
        ],

        'bus-medium': [
            'bus-medium.jpg',
            'bus-medium.jpeg',
            'bus-medium.webp',
            'bus-medium.png',
            'bus-medium..jpg',
            'bus-medium..jpeg',
            'bus-medium..webp'
        ]

    };


    if (specialMap[key]) {

        candidates.push(
            ...specialMap[key]
        );
    }


    /*
       ======================================================
       FALLBACK BERDASARKAN SLUG DATABASE
       ======================================================
    */

    if (slug) {

        candidates.push(
            `${slug}.jpg`,
            `${slug}.jpeg`,
            `${slug}.webp`,
            `${slug}.png`
        );
    }


    /*
       ======================================================
       FALLBACK BERDASARKAN NAMA KENDARAAN
       ======================================================
    */

    if (name) {

        const nameKey =
            normalizeImageKey(name);

        candidates.push(
            `${nameKey}.jpg`,
            `${nameKey}.jpeg`,
            `${nameKey}.webp`,
            `${nameKey}.png`
        );
    }


    return [
        ...new Set(candidates)
    ];
}


/* =========================================================
   URL PUBLIC STORAGE
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
            'Gagal membuat Storage URL:',
            error
        );

        return '';
    }
}


/* =========================================================
   AMBIL URL GAMBAR PERTAMA
   ========================================================= */

function getVehicleImageUrl(vehicle) {

    const candidates =
        getVehicleImageCandidates(vehicle);

    if (!candidates.length) {
        return '';
    }

    return getStoragePublicUrl(
        candidates[0]
    );
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

    } catch (error) {

        console.warn(
            'Image candidates tidak valid:',
            error
        );

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

        img.style.display =
            'none';


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
            'Semua kandidat gambar gagal:',
            candidates
        );

        return;
    }


    img.dataset.imageIndex =
        String(index);


    const nextUrl =
        getStoragePublicUrl(
            candidates[index]
        );


    if (!nextUrl) {

        tryNextVehicleImage(
            img
        );

        return;
    }


    console.log(
        'Mencoba gambar:',
        candidates[index]
    );


    img.src =
        nextUrl;
}


/* =========================================================
   KONFIGURASI SUPABASE
   ========================================================= */

function configured() {

    return Boolean(

        window.TRANSMIND_SUPABASE_URL &&

        window.TRANSMIND_SUPABASE_URL
            .startsWith('http') &&

        window.TRANSMIND_SUPABASE_ANON_KEY &&

        window.TRANSMIND_SUPABASE_ANON_KEY
            .length > 20

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


    /*
       ======================================================
       DROPDOWN BOOKING
       ======================================================
    */

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


    /*
       ======================================================
       KARTU ARMADA
       ======================================================
    */

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
                    'Sesuai tipe kendaraan';


                const id =
                    vehicle.id ||
                    '';


                const candidates =
                    getVehicleImageCandidates(
                        vehicle
                    );


                const firstUrl =
                    getVehicleImageUrl(
                        vehicle
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

                                        style="
                                            width:100%;
                                            height:220px;
                                            object-fit:cover;
                                            display:block;
                                        "

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
                                    width:100%;
                                    height:220px;
                                    align-items:center;
                                    justify-content:center;
                                    text-align:center;
                                    padding:20px;
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


    /*
       ======================================================
       EVENT TOMBOL PILIH
       ======================================================
    */

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

function updateVehicleInfo(
    vehicleId
) {

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
   LOAD ARMADA DARI SUPABASE
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
                        normalizeImageKey(
                            name
                        ),

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
        } = await sb
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

            console.warn(
                'Tidak ada kendaraan aktif.'
            );


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
                        normalizeImageKey(
                            name
                        ),

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
   DATA FORM
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
   BUKA WHATSAPP BOOKING BERHASIL
   ========================================================= */

function openSuccessWhatsApp(
    formData,
    result
) {

    const code =
        result.booking_code ||
        'TRM-BOOKING';


    const vehicleName =
        result.vehicle_name ||
        formData.vehicleName;


    const totalDays =
        result.total_days ||
        0;


    const dailyPrice =
        result.daily_price ||
        0;


    const totalPrice =
        result.total_price ||
        0;


    const message = `

Halo Transmind Nusantara,

Booking saya sudah dibuat.

Kode Booking: ${code}

Nama: ${formData.name}
WhatsApp: ${formData.phone}
Kendaraan: ${vehicleName}
Layanan: ${formData.service}

Tanggal:
${formData.start} s/d ${formData.end}

Lama Sewa: ${totalDays} hari
Harga/Hari: ${rupiah(dailyPrice)}
Total Harga: ${rupiah(totalPrice)}

Area: ${formData.area}
Catatan: ${formData.notes || '-'}

Mohon konfirmasi booking saya.

Terima kasih.

`.trim();


    const url =
        'https://wa.me/' +
        WA_NUMBER +
        '?text=' +
        encodeURIComponent(
            message
        );


    /*
       ======================================================
       PENTING:
       JANGAN window.open()
       KARENA BOOKING SUDAH MELALUI ASYNC RPC.
       ======================================================
    */

    console.log(
        'Membuka WhatsApp:',
        url
    );


    window.location.href =
        url;
}


/* =========================================================
   WHATSAPP JIKA KENDARAAN TIDAK TERSEDIA
   ========================================================= */

function openUnavailableWhatsApp(
    formData,
    messageText
) {

    const message = `

Halo Transmind Nusantara.

Saya ingin menyewa kendaraan, tetapi kendaraan yang saya pilih sedang tidak tersedia.

Kendaraan: ${formData.vehicleName}
Layanan: ${formData.service}

Tanggal:
${formData.start} s/d ${formData.end}

Area: ${formData.area}

Keterangan sistem:
${messageText}

Mohon dibantu mencarikan kendaraan alternatif yang tersedia.

Terima kasih.

`.trim();


    const url =
        'https://wa.me/' +
        WA_NUMBER +
        '?text=' +
        encodeURIComponent(
            message
        );


    console.log(
        'Membuka WhatsApp alternatif:',
        url
    );


    window.location.href =
        url;
}


/* =========================================================
   SUBMIT BOOKING
   ========================================================= */

async function submitBooking(
    event
) {

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


    /*
       ======================================================
       VALIDASI
       ======================================================
    */

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


        /*
           ==================================================
           RPC CREATE BOOKING
           ==================================================
        */

        const {
            data: rpcData,
            error
        } = await sb.rpc(
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


        /*
           ==================================================
           ERROR RPC
           ==================================================
        */

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


        /*
           ==================================================
           HASIL RPC
           ==================================================
        */

        const result =
            Array.isArray(
                rpcData
            )
                ? rpcData[0]
                : rpcData;


        if (!result) {

            resultBox.textContent =
                'Sistem tidak menerima hasil booking dari database.';

            return;
        }


        /*
           ==================================================
           BOOKING GAGAL
           ==================================================
        */

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


        /*
           ==================================================
           BOOKING BERHASIL
           ==================================================
        */

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

            <br>

            Lama sewa:
            ${Number(
                result.total_days ||
                0
            )}
            hari

            <br>

            Total:
            ${rupiah(
                result.total_price
            )}

        `;


        /*
           ==================================================
           WHATSAPP
           ==================================================
        */

        openSuccessWhatsApp(
            data,
            result
        );


        /*
           ==================================================
           RESET FORM
           ==================================================
        */

        form.reset();


        const vehicleSelect =
            getElement('vehicle');


        if (vehicleSelect) {

            vehicleSelect.selectedIndex =
                0;
        }


        updateVehicleInfo(
            ''
        );


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

    /*
       ======================================================
       FORM BOOKING
       ======================================================
    */

    const form =
        getElement('bookingForm');


    if (form) {

        form.addEventListener(
            'submit',
            submitBooking
        );
    }


    /*
       ======================================================
       DROPDOWN KENDARAAN
       ======================================================
    */

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


    /*
       ======================================================
       TANGGAL
       ======================================================
    */

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