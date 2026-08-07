# Spesifikasi & Kebutuhan Arsitektur Sistem SaaS Enterprise

Dokumen ini memuat panduan komprehensif, persyaratan teknis, dan standar arsitektur untuk membangun sistem SaaS Multi-Tenant menggunakan **Laravel (Backend)** dan **React.js (Frontend)**.

---

## 1. Arsitektur Backend (Laravel)

Sistem database yang dirancang adalah *Single Database, Multi-Tenant*. Laravel akan bertindak sebagai penyedia RESTful API berkinerja tinggi.

### A. Core Multi-Tenancy & Global Scope
*   **Tenant Identification:** Mengingat semua data berada dalam satu database, sistem harus memfilter data berdasarkan `school_id`.
*   **Implementation:** Gunakan **Laravel Global Scopes** pada setiap model transaksional (seperti `Siswa`, `Guru`, `Absensi`, `Nilai`). Ini memastikan query `Siswa::all()` secara otomatis hanya memanggil siswa dari institusi yang sedang login, mencegah kebocoran data antar sekolah.
*   **Primary Keys:** Karena sistem menggunakan ULID (26 karakter) untuk identitas publik (`schools`, `global_users`), gunakan trait khusus pada Eloquent model agar secara otomatis di-generate (misal menggunakan library `symfony/uid` atau package ULID Laravel) saat pembuatan baris baru.

### B. Autentikasi & Otorisasi Global (API Security)
*   **Library:** Gunakan **Laravel Sanctum** untuk menangani autentikasi SPA (Single Page Application) dan API tokens.
*   **Alur Login Global:** User (`global_users`) login melalui satu portal terpusat (misal: `account.siakad.id`). Setelah berhasil, backend mengembalikan daftar sekolah (`school_id`) di mana user tersebut terdaftar melalui tabel `global_user_schools`.
*   **Role-Based Access Control (RBAC):** Otentikasi harus mendukung *polymorphic context*. Buat custom Gate atau Policy di Laravel yang memeriksa tabel pivot `tenant_user_roles`. Sistem harus bisa membedakan akses apakah pengguna login sebagai "Admin" untuk `school_id = A` atau sebagai "Guru" untuk `school_id = B`.

### C. Manajemen Subdomain (Routing)
*   Sistem tabel `school_domains` mengharuskan penanganan routing dinamis.
*   Konfigurasi *Route Group* di Laravel harus mengecek host/domain yang mengakses (misal `{subdomain}.siakad.id`), lalu mencari ID sekolah terkait di database untuk di-inject ke dalam *Global Scope* sebelum request diproses lebih lanjut oleh controller.

### D. Billing, SaaS Engine, & Background Jobs
*   **Task Scheduling (Cron Jobs):** Wajib dikonfigurasi di server untuk menjalankan pengecekan status langganan (`school_subscriptions`). Script cron ini berjalan harian untuk mengubah status sekolah yang *grace period*-nya sudah habis menjadi tidak aktif.
*   **Queue & Worker (Horizon/Redis):** Proses berat seperti *Snapshot Usage Harian* (`tenant_usage_snapshots`), pengiriman Email/WhatsApp tagihan (`saas_invoices`), dan generate report harus dijalankan secara *asynchronous* melalui Laravel Queues agar tidak membebani API response.
*   **Payment Gateway Webhook:** Buat endpoint khusus dan aman (dengan verifikasi signature) untuk menerima callback dari payment gateway (Midtrans, Stripe, dll) guna memproses otomatis tabel `saas_payments`.

### E. Standar Penyimpanan (Storage)
*   **Filesystem:** Gunakan driver `s3` di Laravel (bisa dikoneksikan ke AWS S3, Cloudflare R2, atau MinIO).
*   **Path Convention:** Semua upload file harus mematuhi struktur folder terisolasi: `schools/{ulid}/{module}/{id}/{filename}` (contoh: `schools/01ARZ3NDEK.../siswa/12/foto_profil.jpg`).

---

## 2. Kebutuhan Frontend (React.js)

Frontend React.js bertindak sebagai *client* murni yang hanya berkomunikasi dengan backend melalui REST API. 

### A. Komunikasi Data & State Management
*   **API Client:** Gunakan **Axios** dengan konfigurasi interceptor. Interceptor ini bertugas menyisipkan *Bearer Token* di setiap request dan menangani error `401 Unauthorized` untuk me-refresh sesi atau me-redirect user ke halaman login global.
*   **State Management:** Gunakan React Context API atau Zustand untuk menyimpan state global seperti *Data User Login*, *Aktif Tenant/Sekolah*, dan *Tema/Locale*.

### B. Standar UI/UX dan Desain Administratif
Sistem dashboard SaaS membutuhkan tampilan yang bersih, modern, dan profesional.
*   **Layout Utama:** Gunakan struktur layout dengan *Sidebar Navigation* di sebelah kiri untuk menu modul, dan *Top Navbar* untuk profil pengguna, switch tenant (pindah sekolah), dan notifikasi.
*   **Elemen Visual:** Terapkan desain beraksen bayangan lembut (*soft shadow effects*), sudut membulat (*rounded corners*), dan *status badges* (contoh: badge hijau untuk langganan "Aktif", merah untuk "Expired") untuk memperjelas informasi.
*   **Data Presentation:** Gunakan struktur tabel yang rapi dan terorganisir untuk menampilkan manajemen master data dan data dinamis, dilengkapi dengan pagination dari API Laravel.

### C. Regulasi Styling & CSS (Sangat Penting)
Untuk menjaga kemurnian kode dan menghindari ketergantungan pada alat eksternal:
*   **Pure CSS Wajib:** Seluruh styling komponen React **harus** ditulis menggunakan CSS murni (baik dalam bentuk *CSS Modules* maupun file `style.css` terpisah).
*   **Tanpa CSS Framework:** Penggunaan framework CSS utility-first seperti **Tailwind CSS**, maupun library seperti Bootstrap, Chakra UI, atau Material-UI **dilarang keras**. Semua desain sidebar, tabel, form, dan kartu informasi harus dibuat murni dari dua fondasi utama: struktur komponen React (HTML) dan instruksi cascading style sheets (CSS) konvensional.
*   **Struktur CSS:** Manfaatkan fitur modern CSS seperti CSS Variables (Custom Properties) untuk mengatur tema global (warna primer, padding, shadow) dan Flexbox/CSS Grid untuk layouting sidebar dan dashboard.

---

## 3. Deployment & Infrastruktur Dasar
*   **Server:** VPS atau Cloud Server berbasis Linux (Ubuntu).
*   **Web Server:** Nginx (direkomendasikan untuk menghandle *wildcard SSL* dan *subdomain routing* menuju aplikasi Laravel).
*   **Database:** PostgreSQL atau MySQL versi terbaru. Disarankan PostgreSQL untuk dukungan tipe data JSONB yang lebih kuat (terutama untuk kolom `national_ids` dan `address_details`).
*   **Cache & Session:** Redis, sangat krusial untuk menyimpan session tenant, cache master data, dan mengelola Queue/Background jobs.
