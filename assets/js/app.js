/* =========================================================
   TRANSMIND NUSANTARA RENTAL MOBIL
   APP.JS — GO LIVE FINAL IMAGE_PATH
   ========================================================= */

'use strict';

console.log('==========================================');
console.log('TRANSMIND APP.JS GO-LIVE FINAL AKTIF');
console.log('MODE: DATABASE + IMAGE_PATH');
console.log('==========================================');


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


/* =========================================================
   CEK KONFIGURASI SUPABASE
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

    console.log('FLEET STATUS:', message);
}


/* =========================================================
   URL GAMBAR DARI SUPABASE STORAGE
   ========================================================= */

function getVehicleImageUrl(vehicle) {

    if (!sb) {
        return '';
    }


    const imagePath = String(
        vehicle?.image_path || ''
    ).trim();


    if (!imagePath) {

        console.warn(
            'IMAGE_PATH KOSONG:',
            vehicle?.name
        );

        return '';
    }


    try {

        const {
            data
        } = sb.storage
            .from(VEHICLE_IMAGE_BUCKET)
            .getPublicUrl(imagePath);


        const url =
            data?.publicUrl || '';


        console.log(
            'IMAGE:',
            vehicle.name,
            '=>',
            imagePath
        );


        return url;

    } catch (error) {

        console.error(
            'GAGAL MEMBUAT URL GAMBAR:',
            vehicle?.name,
            error
        );

        return '';
    }
}


/* =========================================================
   HANDLE GAMBAR ERROR
   ========================================================= */

function handleVehicleImageError(img) {

    if (!img) {
        return;
    }


    console.warn(
        'GAMBAR GAGAL DIMUAT:',
        img.src
    );


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
}


/* =========================================================
   FILTER ARMADA VALID
   HANYA TAMPILKAN YANG:
   - ACTIVE
   - PUNYA IMAGE_PATH
   ========================================================= */

function filterValidVehicles(list) {

    if (!Array.isArray(list)) {
        return [];
    }


    return list.filter(vehicle => {

        const active =
            vehicle.active === true;


        const imagePath =
            String(
                vehicle.image_path || ''
            ).trim();


        return active && imagePath;
    });
}


/* =========================================================
   RENDER ARMADA
   ========================================================= */

function showCars(list) {

    vehiclesCache =
        filterValidVehicles(list);


    console.log(
        'ARMADA VALID UNTUK DITAMPILKAN:',
        vehiclesCache.length,
        vehiclesCache
    );


    const vehicleSelect =
        getElement('vehicle');


    const cars =
        getElement('cars');


    /* =====================================================
       DROPDOWN BOOKING
       ===================================================== */

    if (vehicleSelect) {

        vehicleSelect.innerHTML =
            '<option value="">Pilih kendaraan</option>';


        vehiclesCache.forEach(vehicle => {

            const option =
                document.createElement('option');


            option.value =
                vehicle.id || '';


            option.textContent =
                vehicle.name || 'Kendaraan';


            vehicleSelect.appendChild(option);
        });
    }


    /* =====================================================
       CONTAINER ARMADA
       ===================================================== */

    if (!cars) {

        console.error(
            'ELEMENT #cars TIDAK DITEMUKAN'
        );

        return;
    }


    /* =====================================================
       TIDAK ADA ARMADA
       ===================================================== */

    if (!vehiclesCache.length) {

        cars.innerHTML = `
            <div class="fleet-empty">
                <strong>
                    Armada belum tersedia.
                </strong>
                <br>
                Silakan hubungi Transmind Nusantara.
            </div>
        `;


        return;
    }


    /* =====================================================
       BUAT KARTU ARMADA
       ===================================================== */

    cars.innerHTML =
        vehiclesCache.map(vehicle => {

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


            const imageUrl =
                getVehicleImageUrl(vehicle);


            return `

                <article
                    class="car"
                    data-vehicle-id="${escapeHtml(id)}"
                >

                    <div class="photo">

                        ${
                            imageUrl
                                ? `
                                    <img
                                        src="${escapeHtml(imageUrl)}"
                                        alt="${escapeHtml(name)}"
                                        loading="lazy"

                                        style="
                                            width:100%;
                                            height:220px;
                                            object-fit:cover;
                                            display:block;
                                        "

                                        onerror="
                                            handleVehicleImageError(this);
                                        "
                                    >
                                `
                                : ''
                        }


                        <div
                            class="vehicle-placeholder"

                            style="
                                display:${imageUrl ? 'none' : 'flex'};
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

        }).join('');


    /* =====================================================
       EVENT TOMBOL PILIH
       ===================================================== */

    cars
        .querySelectorAll(
            '[data-select-vehicle]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    selectVehicle(
                        button.dataset
                            .selectVehicle
                    );

                }
            );

        });
}


/* =========================================================
   PILIH KENDARAAN
   ========================================================= */

function selectVehicle(vehicleId) {

    const select =
        getElement('vehicle');


    if (!select) {

        console.error(
            'SELECT #vehicle TIDAK DITEMUKAN'
        );

        return;
    }


    select.value =
        vehicleId || '';


    if (
        select.value !== vehicleId
    ) {

        console.warn(
            'VEHICLE ID TIDAK DITEMUKAN:',
            vehicleId
        );

        return;
    }


    updateVehicleInfo(vehicleId);


    window.location.hash =
        'booking';


    setTimeout(() => {

        select.focus();

    }, 300);
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


    if (!vehicleId) {

        priceBox.textContent =
            'Pilih kendaraan untuk melihat informasi rental.';

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
            'Kendaraan tidak ditemukan.';

        return;
    }


    priceBox.textContent =
        `${vehicle.name} • ${
            vehicle.category || 'Armada'
        } • ${
            vehicle.capacity ||
            'Kapasitas sesuai tipe kendaraan'
        }`;
}


/* =========================================================
   LOAD ARMADA DARI DATABASE
   ========================================================= */

async function loadVehicles() {

    setFleetStatus(
        'Memuat armada...',
        'loading'
    );


    /* =====================================================
       CEK KONFIGURASI
       ===================================================== */

    if (!configured()) {

        console.error(
            'SUPABASE BELUM DIKONFIGURASI'
        );


        setFleetStatus(
            'Konfigurasi database belum tersedia.',
            'error'
        );


        return;
    }


    /* =====================================================
       CEK SUPABASE LIBRARY
       ===================================================== */

    if (
        !window.supabase ||
        typeof window.supabase.createClient !== 'function'
    ) {

        console.error(
            'SUPABASE LIBRARY TIDAK TERMUAT'
        );


        setFleetStatus(
            'Library Supabase gagal dimuat.',
            'error'
        );


        return;
    }


    try {

        /* =================================================
           BUAT CLIENT
           ================================================= */

        sb =
            window.supabase.createClient(
                window.TRANSMIND_SUPABASE_URL,
                window.TRANSMIND_SUPABASE_ANON_KEY
            );


        console.log(
            'SUPABASE CLIENT BERHASIL DIBUAT'
        );


        /* =================================================
           AMBIL ARMADA
           ================================================= */

        const {
            data,
            error
        } = await sb
            .from('vehicles')
            .select(
                `
                id,
                name,
                slug,
                category,
                capacity,
                active,
                sort_order,
                image_path
                `
            )
            .eq(
                'active',
                true
            )
            .not(
                'image_path',
                'is',
                null
            )
            .order(
                'sort_order',
                {
                    ascending: true
                }
            )
            .order(
                'name',
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                'GAGAL MENGAMBIL ARMADA:',
                error
            );


            throw error;
        }


        console.log(
            'DATA DATABASE DITERIMA:',
            data?.length || 0,
            data
        );


        /* =================================================
           FILTER IMAGE_PATH KOSONG
           ================================================= */

        const validVehicles =
            filterValidVehicles(data);


        console.log(
            'ARMADA DENGAN GAMBAR VALID:',
            validVehicles.length,
            validVehicles
        );


        /* =================================================
           RENDER
           ================================================= */

        showCars(validVehicles);


        /* =================================================
           STATUS
           ================================================= */

        if (!validVehicles.length) {

            setFleetStatus(
                'Belum ada armada yang memiliki gambar.',
                'warning'
            );


            return;
        }


        setFleetStatus(
            `${validVehicles.length} armada tersedia`,
            'success'
        );


    } catch (error) {

        console.error(
            'LOAD VEHICLES ERROR:',
            error
        );


        setFleetStatus(
            'Gagal memuat armada dari database.',
            'error'
        );


        const cars =
            getElement('cars');


        if (cars) {

            cars.innerHTML = `
                <div class="fleet-empty">

                    <strong>
                        Armada sedang tidak dapat dimuat.
                    </strong>

                    <br>

                    Silakan refresh halaman.

                </div>
            `;
        }
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


    if (!data.service) {

        resultBox.textContent =
            'Silakan pilih layanan.';

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
        data.end < data.start
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


    const message = `Halo Transmind Nusantara,

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


    console.log(
        'MEMBUKA WHATSAPP BOOKING:',
        url
    );


    window.location.href =
        url;
}


/* =========================================================
   WHATSAPP KENDARAAN TIDAK TERSEDIA
   ========================================================= */

function openUnavailableWhatsApp(
    formData,
    messageText
) {

    const message = `Halo Transmind Nusantara.

Saya ingin menyewa kendaraan, tetapi kendaraan yang saya pilih sedang tidak tersedia.

Kendaraan: ${formData.vehicleName || '-'}
Layanan: ${formData.service || '-'}

Tanggal:
${formData.start || '-'} s/d ${formData.end || '-'}

Area:
${formData.area || '-'}

Keterangan sistem:
${messageText || '-'}

Mohon dibantu mencarikan kendaraan alternatif.

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


    const data =
        getFormData();


    /* =====================================================
       VALIDASI
       ===================================================== */

    if (
        !validateBooking(
            data,
            resultBox
        )
    ) {
        return;
    }


    /* =====================================================
       CEK DATABASE
       ===================================================== */

    if (!sb) {

        resultBox.textContent =
            'Database belum terhubung. Silakan refresh halaman.';

        return;
    }


    resultBox.textContent =
        'Memproses booking...';


    try {

        console.log(
            'MENGIRIM BOOKING:',
            data
        );


        /* =================================================
           RPC CREATE BOOKING
           ================================================= */

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
                'Database tidak mengembalikan hasil booking.';

            return;
        }


        /* =================================================
           BOOKING GAGAL
           ================================================= */

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


        /* =================================================
           BOOKING BERHASIL
           ================================================= */

        resultBox.innerHTML = `

            <b>
                Booking berhasil dibuat.
            </b>

            <br><br>

            Kode Booking:

            <b>
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


        /* =================================================
           WHATSAPP
           ================================================= */

        setTimeout(() => {

            openSuccessWhatsApp(
                data,
                result
            );

        }, 800);


        /* =================================================
           RESET FORM
           ================================================= */

        setTimeout(() => {

            form.reset();


            const vehicleSelect =
                getElement('vehicle');


            if (vehicleSelect) {

                vehicleSelect.selectedIndex = 0;
            }


            updateVehicleInfo('');

        }, 1500);


    } catch (error) {

        console.error(
            'SUBMIT BOOKING ERROR:',
            error
        );


        resultBox.textContent =
            'Terjadi kesalahan: ' +
            (
                error?.message ||
                'Unknown error'
            );
    }
}


/* =========================================================
   SETUP EVENT
   ========================================================= */

function setupEvents() {

    /* =====================================================
       FORM BOOKING
       ===================================================== */

    const form =
        getElement('bookingForm');


    if (form) {

        form.addEventListener(
            'submit',
            submitBooking
        );
    }


    /* =====================================================
       DROPDOWN KENDARAAN
       ===================================================== */

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


    /* =====================================================
       TANGGAL
       ===================================================== */

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
                    end.value < start.value
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
        '=========================================='
    );

    console.log(
        'TRANSMIND INITIALIZATION DIMULAI'
    );

    console.log(
        '=========================================='
    );


    setupEvents();


    await loadVehicles();


    console.log(
        '=========================================='
    );

    console.log(
        'TRANSMIND INITIALIZATION SELESAI'
    );

    console.log(
        '=========================================='
    );
}


/* =========================================================
   GLOBAL FUNCTION
   PENTING UNTUK ONERROR HTML
   ========================================================= */

window.handleVehicleImageError =
    handleVehicleImageError;


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    init
);
