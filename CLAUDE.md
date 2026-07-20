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

| Slug | Nama | Keterangan |
|------|------|------------|
| `operator` | Operator / Admin | Manajemen akun, master data, pengumuman, galeri |
| `guru` | Guru | Dashboard, input absensi, rekap, jadwal, profil |
| `ortu` | Orang Tua / Wali | Pantau absensi anak, pengumuman, profil |
| `kepsek` | Kepala Sekolah | Monitoring, data guru & siswa (read-only), kalender, pengumuman |
| `walikelas` | Wali Kelas | *(belum didefinisikan — perlu diskusi scope)* |
| `bendahara` | Bendahara | *(belum didefinisikan — perlu diskusi scope)* |
| `adminppdb` | Admin PPDB | *(belum didefinisikan — perlu diskusi scope)* |

> Role disimpan di tabel `roles` (kolom: `id`, `slug`, `nama`, `deskripsi`, `is_active`).
> Relasi user ↔ role lewat pivot `user_roles`. Role check pakai slug langsung — tidak ada mapping ID hardcode di middleware.
> Role baru cukup INSERT ke tabel `roles` tanpa perlu ubah `RoleMiddleware.php`.

---

## ✅ COMPLETED FEATURES — DO NOT TOUCH

> Update section ini setiap kali user bilang "done" / "selesai" / "fix".
> **AI wajib baca section ini dulu sebelum nulis satu baris pun.**
> File di sini = SUDAH SELESAI = JANGAN DIMODIFIKASI kecuali user minta eksplisit fix bug.

### Operator
- [x] Autentikasi — login, logout, guard token via Sanctum; `AuthContext.jsx`, `axios.js`, `ProtectedRoute.jsx`
- [x] Manajemen Akun — CRUD user, toggle aktif, reset password, hapus; `ManajemenAkun.jsx`
- [x] Approval Ortu — list pending, approve/reject; `ApprovalOrtu.jsx`
- [x] Master Data Guru — CRUD guru, upload foto, lihat detail & akun terhubung; `MasterGuru.jsx`, `DetailGuru.jsx`
- [x] Master Data Siswa — CRUD siswa, upload foto, assign kelas, regenerate kode anak; `MasterSiswa.jsx`, `DetailSiswa.jsx`
- [x] Master Data Kelas — CRUD kelas, tambah/keluarkan siswa, batalkan keluar; `MasterKelas.jsx`, `DetailKelas.jsx`
- [x] Master Data Orang Tua — CRUD ortu, attach anak; `MasterOrtu.jsx`, `DetailOrtu.jsx`, `DetailDataOrtu.jsx`
- [x] Master Data Mapel — CRUD mapel, toggle aktif; `MasterMapel.jsx`
- [x] Master Data Jadwal Pelajaran — CRUD jadwal; `MasterJadwal.jsx`
- [x] Tahun Ajaran — CRUD, set aktif, detail; `TahunAjaran.jsx`, `DetailTahunAjaran.jsx`
- [x] Naik Kelas — preview & proses naik kelas massal; `NaikKelas.jsx`
- [x] Pengumuman — CRUD; `PengumumanOperator.jsx`
- [x] Galeri Foto — upload & hapus; `GaleriOperator.jsx`

### Guru
- [x] Dashboard Guru; `DashboardGuru.jsx`
- [x] Input Absensi; `InputAbsensi.jsx`
- [x] Rekap Absensi; `RekapAbsensiGuru.jsx`
- [x] Data Siswa; `DataSiswaGuru.jsx`, `DetailSiswaGuru.jsx`
- [x] Riwayat Absensi Siswa; `RiwayatAbsensiSiswaGuru.jsx`
- [x] Jadwal Mengajar; `JadwalMengajarGuru.jsx`
- [x] Pengumuman Guru; `PengumumanGuru.jsx`
- [x] Profil Guru; `ProfilGuru.jsx`

### Kepsek
- [x] Dashboard Kepsek; `DashboardKepsek.jsx`
- [x] Monitoring Absensi; `MonitoringAbsensi.jsx`
- [x] Data Guru (read-only); `DataGuruKepsek.jsx`, `DetailGuruKepsek.jsx`
- [x] Data Siswa (read-only); `DataSiswaKepsek.jsx`, `DetailSiswaKepsek.jsx`
- [x] Pengumuman Kepsek; `PengumumanKepsek.jsx`
- [x] Kalender Akademik; `KalenderAkademik.jsx`
- [x] Profil Kepsek; `ProfilKepsek.jsx`

### Ortu
- [x] Absensi Anak; `AbsensiAnak.jsx`
- [x] Riwayat Absensi Anak; `RiwayatAbsensiAnak.jsx`
- [x] Data Anak; `DataAnak.jsx`
- [x] Tambah Anak; `TambahAnak.jsx`
- [x] Pengumuman Ortu; `PengumumanOrtu.jsx`
- [x] Profil Ortu; `ProfilOrtu.jsx`

### Public
- [x] Landing Page; `LandingPage.jsx`
- [x] Galeri Publik; `GalleryPage.jsx`
- [x] Tentang; `AboutPage.jsx`
- [x] Kontak; `ContactPage.jsx`
- [x] Login; `LoginPage.jsx`
- [x] Daftar Ortu; `RegisterOrtuPage.jsx`

### Komponen & File Stabil — jangan diubah kecuali ada bug eksplisit:
- `frontend/src/contexts/AuthContext.jsx`
- `frontend/src/lib/axios.js`
- `frontend/src/routes/ProtectedRoute.jsx`
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/main.jsx`
- `frontend/src/App.jsx`

---

## 🚧 IN PROGRESS — Sedang Dikerjakan

- [ ] *(kosong)*

---

## ❌ NEVER MODIFY — Tanpa Izin Eksplisit

- `frontend/dist/` — hasil build otomatis
- `backend/vendor/` — dikelola composer
- `frontend/node_modules/` — dikelola npm
- `.env` / `.env.example`
- `package-lock.json` / `composer.lock`
- `db_minurulhuda3.sql` — source of truth database, jangan diubah

---

## 📁 Struktur Project

```
RPL_Group1/
├── frontend/
│   └── src/
│       ├── contexts/AuthContext.jsx
│       ├── lib/axios.js
│       ├── routes/ProtectedRoute.jsx
│       ├── components/layout/Sidebar.jsx
│       ├── hooks/useSelectedAnak.js
│       ├── pages/
│       │   ├── auth/
│       │   ├── public/
│       │   ├── operator/master/
│       │   ├── guru/
│       │   ├── kepsek/
│       │   └── ortu/
│       └── App.jsx
│
└── backend/
    ├── app/
    │   ├── Http/Controllers/   # Auth/, Operator/, MasterData/, Guru/, Kepsek/, Ortu/, Absensi/
    │   ├── Http/Middleware/    # RoleMiddleware.php
    │   └── Models/
    ├── routes/api.php
    └── database/
        ├── migrations/
        └── db_minurulhuda3.sql
```

---

## 🗄️ Skema Database — Tabel Aktual

> ⚠️ Nama tabel, kolom, dan PK di bawah ini adalah GROUND TRUTH dari `db_minurulhuda3.sql`.
> Jangan asumsikan nama lain. Cek file SQL dulu sebelum nulis query apapun.

### Tabel Utama

| Tabel | Primary Key | Catatan |
|-------|-------------|---------|
| `users` | `id` (bigint) | Akun login semua role |
| `roles` | `id` (tinyint) | Kolom: `slug`, `nama`, `is_active` |
| `user_roles` | pivot | Kolom: `user_id`, `role_id` |
| `gurus` | `id` (bigint) | `nuptk` adalah kolom unik, **bukan** PK |
| `siswas` | `id` (bigint) | `nisn` adalah kolom unik, **bukan** PK |
| `orang_tuas` | `id` (bigint) | Data orang tua / wali |
| `orang_tua_siswa` | pivot | Kolom: `orang_tua_id`, `siswa_id` |
| `kelas` | `id` (bigint) | FK wali: `wali_kelas_id` → `gurus.id` |
| `riwayat_kelas` | `id` (bigint) | Pengganti `siswa_kelas`. Kolom: `siswa_id`, `kelas_id`, `tanggal_keluar`, `jenis_perubahan` |
| `tahun_ajarans` | `id` (bigint) | Nama tabel plural dengan suffix `s` |
| `semesters` | `id` (bigint) | FK ke `tahun_ajarans.id` |
| `mapels` | `id` (bigint) | Kolom kode: `kode` (bukan `kode_mapel`) |
| `jadwals` | `id` (bigint) | Kolom: `plot_id`, `kelas_id`, `guru_id`, `mapel_id`, `semester_id`, `hari`, `jam_ke`, `jam_mulai`, `jam_selesai` |
| `plot_guru_mapels` | `id` (bigint) | Penugasan guru mengajar mapel di kelas |
| `absensis` | `id` (bigint) | FK: `siswa_id`, `kelas_id`, `jadwal_id` (bukan `id_kelas`/`id_jadwal`) |
| `pengumumans` | `id` (bigint) | Pengumuman |
| `galeris` | `id` (bigint) | Galeri foto |
| `kalender_akademiks` | `id` (bigint) | Kalender event |
| `pengaturans` | `id` (bigint) | Setting sistem (key-value) |
| `operator_profiles` | `id` (bigint) | Profil operator |
| `wali_kelas` | `id` (bigint) | Detail penugasan wali kelas |
| `bendaharas` | `id` (bigint) | Profil bendahara |
| `activity_logs` | `id` (bigint) | Log aktivitas |
| `personal_access_tokens` | `id` | Sanctum tokens |

### ⚠️ Perbedaan Kritis vs Dokumentasi Lama

| Yang SALAH (dokumentasi lama) | Yang BENAR (aktual DB) |
|-------------------------------|------------------------|
| PK `siswas` = `nisn` | PK `siswas` = `id`, `nisn` hanya unique |
| PK `gurus` = `nuptk` | PK `gurus` = `id`, `nuptk` hanya unique |
| Tabel `siswa_kelas` | Tabel `riwayat_kelas` |
| Kolom `status_keluar` di siswa_kelas | Pakai `scopeAktif()` — cek `tanggal_keluar` IS NULL |
| FK `id_kelas` di absensis | FK `kelas_id` di `absensis` |
| FK `id_jadwal` di absensis | FK `jadwal_id` di `absensis` |
| FK `nuptk_wali` di kelas | FK `wali_kelas_id` di `kelas` |
| Kolom `kode_mapel` di mapels | Kolom `kode` di `mapels` |
| Tabel `jadwal_pelajaran` | Tabel `jadwals` |
| Tabel `mata_pelajaran` | Tabel `mapels` |
| Tabel `absensi` | Tabel `absensis` |
| Tabel `tahun_ajaran` | Tabel `tahun_ajarans` |
| Tabel `pengumuman` | Tabel `pengumumans` |
| Kolom `semester` di jadwals | Kolom `semester_id` (FK ke `semesters`) |
| Kolom `tahun_ajaran` di jadwals | Tidak ada — resolve via `semester.tahun_ajaran_id` |
| Kolom `id_mapel`, `nuptk` di jadwals | Kolom `mapel_id`, `guru_id` di `jadwals` |

---

## 🔧 Konvensi Kode

### Frontend
- Setiap role punya **Layout sendiri** (`OperatorLayout.jsx`, `GuruLayout.jsx`, dst.)
- Auth state via `useAuth()` dari `AuthContext`
- `api` dari `lib/axios.js` — sudah auto-attach Bearer token
- `BASE_URL` foto: `import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001"`
- Styling hanya TailwindCSS
- API call langsung di komponen, tidak ada folder `api/` terpisah

### Backend (Laravel)
- Semua route di `backend/routes/api.php` prefix `/api`
- Protected routes: `middleware('auth:sanctum')`
- Role guard: `middleware('role:operator')` via `RoleMiddleware` — cek lewat slug di `user_roles`, tidak ada mapping ID hardcode
- Model `Siswa` → `$table = 'siswas'`, PK = `id`, `nisn` unique
- Model `Guru` → `$table = 'gurus'`, PK = `id`, `nuptk` unique
- Model `RiwayatKelas` → `$table = 'riwayat_kelas'`, punya `scopeAktif()` untuk filter siswa aktif
- Model `SiswaKelas` → alias backward-compatible untuk `RiwayatKelas`, gunakan `RiwayatKelas` untuk kode baru
- Model `JadwalPelajaran` → `$table = 'jadwals'`
- Model `MataPelajaran` → `$table = 'mapels'`

---

## 🚀 Cara Menjalankan

```bash
# Frontend
cd frontend && npm install && npm run dev   # port 5173

# Backend
cd backend && composer install
cp .env.example .env && php artisan key:generate
php artisan migrate && php artisan serve    # port 8000/8001

# Keduanya sekaligus (dari root)
npm run dev
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


