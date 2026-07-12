# RPL_Group1 — SIAKAD (Sistem Informasi Akademik Sekolah)

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: TailwindCSS v4
- **Server State**: TanStack React Query v5
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts v3
- **Export**: jsPDF + jsPDF-AutoTable, XLSX
- **Notifikasi**: React Hot Toast
- **Date**: Day.js
- **Linter**: OxLint

### Backend
- **Framework**: Laravel 12.x (PHP 8.2+)
- **Auth**: Laravel Sanctum (token-based)
- **Database**: MySQL 8.x
- **Entry points**: `backend/routes/api.php`, `backend/routes/web.php`
- **Dependencies**: `backend/composer.json`

---

## 👥 Role yang Ada di Sistem

| role_id | Slug | Nama | Keterangan |
|---------|------|------|------------|
| 1 | `operator` | Operator / Admin | Manajemen akun, master data, pengumuman, galeri |
| 2 | `guru` | Guru | Dashboard, input absensi, rekap, jadwal, profil |
| 3 | `ortu` | Orang Tua / Wali | Pantau absensi anak, pengumuman, profil |
| 4 | `kepsek` | Kepala Sekolah | Monitoring, data guru & siswa (read-only), kalender, pengumuman |
| 5 | `walikelas` | Wali Kelas | *(belum didefinisikan — perlu diskusi scope)* |
| 6 | `bendahara` | Bendahara | *(belum didefinisikan — perlu diskusi scope)* |
| 7 | `adminppdb` | Admin PPDB | *(belum didefinisikan — perlu diskusi scope)* |

> ⚠️ **Role 5, 6, 7 belum ada di database.** Sebelum mulai develop, wajib:
> 1. Tambah migration baru untuk INSERT ke tabel `roles` (id 5, 6, 7)
> 2. Update `slugMap` di `RoleMiddleware.php` (saat ini hanya map id 1–4)
> 3. Tambah relasi profil di `User.php` jika butuh tabel profil tersendiri
> 4. Tambah helper `isWaliKelas()`, `isBendahara()`, `isAdminPpdb()` di `User.php`

---

## ✅ COMPLETED FEATURES — DO NOT TOUCH

> Update section ini setiap kali user bilang "done" / "selesai" / "fix".
> **AI wajib baca section ini dulu sebelum nulis satu baris pun.**
> File di sini = SUDAH SELESAI = JANGAN DIMODIFIKASI kecuali user minta eksplisit fix bug.
> **Kalau user belum bilang done = JANGAN dipindahkan ke sini, masih IN PROGRESS.**

### Operator
- [x] Autentikasi — login, logout, guard token via Sanctum; `AuthContext.jsx`, `axios.js`, `ProtectedRoute.jsx`
- [x] Manajemen Akun — CRUD user (operator, guru, kepsek, ortu), toggle aktif, reset password, hapus; `ManajemenAkun.jsx`
- [x] Approval Ortu — list pending, approve/reject; `ApprovalOrtu.jsx`
- [x] Master Data Guru — CRUD guru, upload foto, lihat detail & akun terhubung; `MasterGuru.jsx`, `DetailGuru.jsx`
- [x] Master Data Siswa — CRUD siswa, upload foto, assign kelas, regenerate kode anak; `MasterSiswa.jsx`, `DetailSiswa.jsx`
- [x] Master Data Kelas — CRUD kelas, tambah/keluarkan siswa, batalkan keluar; `MasterKelas.jsx`, `DetailKelas.jsx`
- [x] Master Data Orang Tua — CRUD ortu, attach anak; `MasterOrtu.jsx`, `DetailOrtu.jsx`, `DetailDataOrtu.jsx`
- [x] Master Data Mapel — CRUD mapel, toggle aktif; `MasterMapel.jsx`
- [x] Master Data Jadwal Pelajaran — CRUD jadwal; `MasterJadwal.jsx`
- [x] Tahun Ajaran — CRUD, set aktif, detail; `TahunAjaran.jsx`, `DetailTahunAjaran.jsx`
- [x] Naik Kelas — preview & proses naik kelas massal; `NaikKelas.jsx`
- [x] Pengumuman — CRUD, termasuk `publish_at` dan `target` (semua/guru/ortu); `PengumumanOperator.jsx`
- [x] Galeri Foto — upload & hapus foto galeri; `GaleriOperator.jsx`

### Guru
- [x] Dashboard Guru — statistik kelas & absensi; `DashboardGuru.jsx`
- [x] Input Absensi — absensi per jadwal per kelas; `InputAbsensi.jsx`
- [x] Rekap Absensi — rekap per kelas + export; `RekapAbsensiGuru.jsx`
- [x] Data Siswa — daftar siswa di kelas guru; `DataSiswaGuru.jsx`, `DetailSiswaGuru.jsx`
- [x] Riwayat Absensi Siswa — histori absensi per siswa; `RiwayatAbsensiSiswaGuru.jsx`
- [x] Jadwal Mengajar — lihat jadwal guru; `JadwalMengajarGuru.jsx`
- [x] Pengumuman Guru — lihat pengumuman; `PengumumanGuru.jsx`
- [x] Profil Guru — lihat & edit profil; `ProfilGuru.jsx`

### Kepsek
- [x] Dashboard Kepsek — statistik sekolah, rekap absensi, siswa alpa terbanyak; `DashboardKepsek.jsx`
- [x] Monitoring Absensi — rekap seluruh kelas; `MonitoringAbsensi.jsx`
- [x] Data Guru — daftar & detail guru (read-only); `DataGuruKepsek.jsx`, `DetailGuruKepsek.jsx`
- [x] Data Siswa — daftar & detail siswa (read-only); `DataSiswaKepsek.jsx`, `DetailSiswaKepsek.jsx`
- [x] Pengumuman Kepsek — CRUD pengumuman; `PengumumanKepsek.jsx`
- [x] Kalender Akademik — CRUD kalender; `KalenderAkademik.jsx`
- [x] Profil Kepsek — lihat & edit profil; `ProfilKepsek.jsx`

### Ortu
- [x] Absensi Anak — lihat absensi anak hari ini; `AbsensiAnak.jsx`
- [x] Riwayat Absensi Anak — histori absensi per bulan; `RiwayatAbsensiAnak.jsx`
- [x] Data Anak — daftar anak yang terdaftar; `DataAnak.jsx`
- [x] Tambah Anak — daftarkan anak dengan kode; `TambahAnak.jsx`
- [x] Pengumuman Ortu — lihat pengumuman; `PengumumanOrtu.jsx`
- [x] Profil Ortu — lihat & edit profil; `ProfilOrtu.jsx`

### Public
- [x] Landing Page — halaman utama; `LandingPage.jsx`
- [x] Galeri Publik — lihat galeri foto; `GalleryPage.jsx`
- [x] Tentang — halaman about; `AboutPage.jsx`
- [x] Kontak — halaman kontak; `ContactPage.jsx`
- [x] Login — form login multi-role; `LoginPage.jsx`
- [x] Daftar Ortu — form registrasi orang tua; `RegisterOrtuPage.jsx`

### Wali Kelas
- [ ] *(belum ada)*

### Bendahara
- [ ] *(belum ada)*

### Admin PPDB
- [ ] *(belum ada)*

### Komponen & File yang SUDAH STABIL — jangan diubah kecuali ada bug:
- `frontend/src/contexts/AuthContext.jsx` — auth context & hooks, jangan direfactor
- `frontend/src/lib/axios.js` — axios instance + interceptors (auto token, auto redirect 401)
- `frontend/src/routes/ProtectedRoute.jsx` — route guard berdasarkan role
- `frontend/src/components/layout/Sidebar.jsx` — sidebar shared semua role
- `frontend/src/main.jsx` — entry point React
- `frontend/src/App.jsx` — routing utama, jangan ubah tanpa konfirmasi

---

## 🚧 IN PROGRESS — Sedang Dikerjakan

> Update section ini setiap kali mulai mengerjakan fitur baru.
> Hanya boleh ada 1 fitur aktif di sini per sesi.
> **Jangan pindahkan ke COMPLETED sampai user secara eksplisit bilang "done" / "selesai" / "fix".**

- [ ] *(kosong)*

---

## ❌ NEVER MODIFY — Tanpa Izin Eksplisit

- `frontend/dist/` — hasil build otomatis, selalu di-generate ulang via `npm run build`
- `backend/vendor/` — Laravel vendor (dikelola composer)
- `frontend/node_modules/` — dikelola npm
- `.env` / `.env.example` — konfigurasi environment sensitif
- `package-lock.json` / `composer.lock` — jangan diedit manual
- `backend/database/db_sekolah_mi_2026-07-04.sql` — backup database, jangan diubah

---

## 📁 Struktur Project

```
RPL_Group1/
├── frontend/                   # React App (Vite)
│   ├── src/
│   │   ├── contexts/           # React context (Auth)
│   │   │   └── AuthContext.jsx # auth state + login/logout/updateUser
│   │   ├── lib/
│   │   │   └── axios.js        # Base axios instance + interceptors
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Sidebar.jsx # Shared sidebar (props: menus[])
│   │   ├── pages/
│   │   │   ├── auth/           # Login, RegisterOrtu
│   │   │   ├── public/         # Landing, Gallery, About, Contact
│   │   │   ├── operator/       # Semua halaman operator
│   │   │   │   └── master/     # CRUD master data
│   │   │   ├── guru/           # Semua halaman guru
│   │   │   ├── kepsek/         # Semua halaman kepsek
│   │   │   └── ortu/           # Semua halaman ortu
│   │   ├── hooks/
│   │   │   └── useSelectedAnak.js
│   │   └── App.jsx             # Root routing
│   └── dist/                   # Build output (auto-generated)
│
├── backend/                    # Laravel App
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # Diorganisasi per domain
│   │   │   │   ├── Auth/
│   │   │   │   ├── Operator/
│   │   │   │   ├── MasterData/
│   │   │   │   ├── Guru/
│   │   │   │   ├── Kepsek/
│   │   │   │   ├── Ortu/
│   │   │   │   └── Absensi/
│   │   │   ├── Middleware/     # CheckRole, RoleMiddleware
│   │   │   └── Resources/      # GuruResource, SiswaResource
│   │   └── Models/             # Eloquent models
│   ├── routes/
│   │   ├── api.php             # Semua API routes (prefix /api)
│   │   └── web.php
│   └── database/
│       ├── migrations/         # File migrasi
│       ├── seeders/            # DatabaseSeeder, OperatorSeeder, dll
│       └── db_sekolah_mi_2026-07-04.sql  # Backup DB lengkap
│
└── CLAUDE.md                   # File ini
```

---

## 🗄️ Skema Database (Tabel Utama)

| Tabel | Primary Key | Keterangan |
|-------|------------|------------|
| `users` | `id` | Akun login semua role |
| `roles` | `id` | Daftar role |
| `user_operator` | `id` | Link user → data operator |
| `user_guru` | `id` | Link user → `guru.nuptk` |
| `user_kepsek` | `id` | Link user → data kepsek |
| `user_ortu` | `id` | Link user → `orang_tua.id` |
| `guru` | `nuptk` (string) | Data guru |
| `siswa` | `nisn` (string) | Data siswa |
| `orang_tua` | `id` | Data orang tua |
| `siswa_orang_tua` | pivot | Relasi siswa ↔ ortu |
| `kelas` | `id` | Data kelas, FK `nuptk_wali` → guru |
| `siswa_kelas` | `id` | Relasi siswa ↔ kelas (dengan status_keluar) |
| `tahun_ajaran` | `id` | Tahun ajaran |
| `mata_pelajaran` | `id` | Mata pelajaran |
| `jadwal_pelajaran` | `id` | Jadwal per kelas + mapel + guru |
| `absensi` | `id` | FK: `nisn`, `id_kelas`, `id_jadwal` |
| `pengumuman` | `id` | Pengumuman, ada `target` & `publish_at` |
| `galeri` | `id` | Galeri foto sekolah |
| `kalender_akademik` | `id` | Kalender event kepsek |
| `pengaturan` | `id` | Setting sistem (kode registrasi ortu, dll) |
| `activity_log` | `id` | Log aktivitas user |
| `user_walikelas` | `id` | *(belum ada — perlu dibuat jika walikelas punya profil tersendiri)* |
| `user_bendahara` | `id` | *(belum ada — perlu dibuat jika bendahara punya profil tersendiri)* |
| `user_adminppdb` | `id` | *(belum ada — perlu dibuat jika adminppdb punya profil tersendiri)* |

---

## 🔧 Konvensi Kode

### Frontend
- Setiap role punya **Layout sendiri** (`OperatorLayout.jsx`, `GuruLayout.jsx`, dst.) yang membungkus `Sidebar` + `<Outlet />`
- `Sidebar` menerima prop `menus` (array `{path, label, icon}`)
- Auth state diambil via `useAuth()` dari `AuthContext`
- `api` dari `lib/axios.js` dipakai di semua API call — sudah auto-attach Bearer token
- `BASE_URL` untuk storage/foto: `import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001"`
- Styling hanya dengan **TailwindCSS**, tidak ada inline style atau CSS tambahan
- Tidak ada folder `api/` terpisah — API call langsung di dalam komponen atau custom hook

### Backend (Laravel)
- API endpoint di `backend/routes/api.php`, semua di bawah prefix `/api`
- Protected routes di bawah `middleware('auth:sanctum')`
- Role guard pakai `middleware('role:operator')` dll. via `RoleMiddleware`
- Controller dikelompokkan per domain di subfolder `app/Http/Controllers/`
- Model `Siswa` primary key = `nisn` (string), `Guru` primary key = `nuptk` (string)
- Foreign key ikuti konvensi: `siswa_id`, `nuptk_wali`, `id_kelas`, dst.

#### ⚠️ Checklist Wajib Sebelum Develop Role Baru (walikelas / bendahara / adminppdb)
Setiap role baru butuh langkah-langkah berikut sebelum bisa dipakai:

1. **Migration INSERT roles** — buat file migrasi baru, jangan edit SQL dump:
   ```php
   // database/migrations/xxxx_add_roles_walikelas_bendahara_adminppdb.php
   DB::table('roles')->insert([
       ['id' => 5, 'nama_role' => 'Wali Kelas', 'slug' => 'walikelas', ...],
       ['id' => 6, 'nama_role' => 'Bendahara',  'slug' => 'bendahara',  ...],
       ['id' => 7, 'nama_role' => 'Admin PPDB', 'slug' => 'adminppdb',  ...],
   ]);
   ```

2. **Update `RoleMiddleware.php`** — tambah mapping di `$slugMap`:
   ```php
   $slugMap = [
       1 => 'operator', 2 => 'guru', 3 => 'ortu', 4 => 'kepsek',
       5 => 'walikelas', 6 => 'bendahara', 7 => 'adminppdb', // ← tambah ini
   ];
   ```

3. **Update `User.php`** — tambah helper method:
   ```php
   public function isWaliKelas(): bool { return $this->role_id === 5; }
   public function isBendahara(): bool { return $this->role_id === 6; }
   public function isAdminPpdb(): bool { return $this->role_id === 7; }
   ```

4. **Tambah route group baru** di `api.php` untuk setiap role (mirip blok `role:guru`)

5. **Frontend** — buat Layout, halaman, dan update `App.jsx` + `ProtectedRoute.jsx`

---

## 🚀 Cara Menjalankan

```bash
# Frontend
cd frontend
npm install
npm run dev          # development (port default 5173)
npm run build        # production build

# Backend (Laravel)
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve    # default port 8000 atau 8001

# Jalankan keduanya sekaligus (dari root)
npm run dev          # pakai concurrently
```

---

## ⚠️ ATURAN AI — WAJIB DIIKUTI

### Sebelum Mulai
1. **Baca section COMPLETED dulu** — semua file di sana tidak boleh diubah tanpa izin eksplisit user.
2. **Tulis fitur ke IN PROGRESS dulu** sebelum mulai mengerjakan apapun.
3. **Konfirmasi scope** — pastikan sudah paham apa yang diminta sebelum nulis kode.

### Selama Mengerjakan
4. **Satu sesi = satu fitur** — jangan ubah file di luar scope yang sedang dikerjakan.
5. **Jangan refactor** kode yang tidak diminta direfactor, meskipun kelihatan bisa diperbaiki.
6. **Jangan ubah** `App.jsx`, `AuthContext.jsx`, `axios.js`, atau `ProtectedRoute.jsx` tanpa konfirmasi eksplisit.
7. **Jangan install** dependency baru tanpa konfirmasi user.
8. **Kalau ragu apakah boleh ubah sesuatu — tanya dulu, jangan asumsi boleh.**

### Soal Status Fitur
9. **Fitur HANYA boleh dipindahkan ke COMPLETED kalau user sudah bilang secara eksplisit**: "done", "selesai", "udah beres", "fix", atau kata setara lainnya.
10. **Selama user belum bilang done = fitur masih IN PROGRESS** — meskipun kode sudah ditulis, meskipun kelihatan sudah berjalan.
11. **Jangan auto-complete** — jangan anggap fitur selesai hanya karena AI sudah selesai menulis kodenya.
12. **Jangan pindahkan** fitur dari IN PROGRESS ke COMPLETED atas inisiatif sendiri.

### Setelah Selesai (hanya jika user bilang done)
13. Centang `[x]` di IN PROGRESS, lalu pindahkan ke section COMPLETED role yang sesuai.
14. Kosongkan IN PROGRESS (isi kembali jadi `- [ ] *(kosong)*`).

### 🧠 Aturan Eksekusi & Kualitas Kode (Power Rules)
15. **Search Before Write:** Periksa model, kolom database, atau komponen yang sudah ada sebelum menulis kode baru. Dilarang menebak nama variabel/kolom/fungsi!
16. **Plan Before Code:** Untuk fitur baru/kompleks, berikan rancangan alur terlebih dahulu dan tunggu persetujuan user sebelum generate kode.
17. **Re-use Over Re-create:** Cek komponen atau helper yang sudah ada sebelum membuat baru. Hindari duplikasi kode.
18. **Mandatory Auth & Role Check:** Setiap endpoint Laravel baru WAJIB dilengkapi middleware role yang sesuai.
19. **Root Cause Analysis:** Saat fix bug, jelaskan AKAR MASALAH-nya terlebih dahulu sebelum memberikan solusi.
20. **Targeted Output:** Saat mengedit file panjang, berikan HANYA bagian kode yang diubah (gunakan komentar `// ... existing code ...`). Jangan cetak ulang seluruh file.
21. **No Over-Engineering:** Fokus 100% pada requirement. Jangan tambahkan fitur ekstra, styling berlebihan, atau refactor yang tidak diminta.

### 🛡️ Aturan Keamanan Database & Migrasi
22. **DILARANG KERAS `migrate:fresh` / `migrate:reset`** tanpa izin eksplisit. Data di database adalah SUCI.
23. **Dilarang Edit File Migrasi Lama:** Perlu ubah skema? **Buat file migrasi baru** (contoh: `add_kolom_to_tabel`).
24. **Cek Skema Sebelum Query:** Sebelum menulis Eloquent/SQL, periksa nama tabel dan kolom yang benar-benar ada. Jangan berasumsi!
25. **Jaga Integritas Relasi:** Saat membuat tabel baru atau fitur hapus, pertimbangkan Foreign Key constraint dan Soft Deletes.
26. **Aman Saat Seeding & Import:** Gunakan `updateOrCreate()` atau `firstOrCreate()`, hindari `create()` biasa yang bisa trigger duplicate error.
27. **Konsistensi Penamaan:** snake_case plural untuk tabel (`tahun_ajaran`, `siswa_kelas`), snake_case untuk foreign key (`siswa_id`, `nuptk_wali`).
