# 18 · Roadmap

---

## Status Saat Ini

Project sudah punya fondasi yang berjalan:
- Auth (Sanctum, role-based)
- Master Data Guru (lengkap — identitas, kepegawaian, DMS, import/export)
- Master Data Siswa
- Master Data Kelas, Mapel, Jadwal, Tahun Ajaran
- Absensi siswa
- Portal Guru, Kepsek, Ortu, WaliKelas, Bendahara (sebagian)
- React frontend dengan layout per role

**Yang belum ada tapi harus ada sebelum bisa scale:**
- `school_id` di semua tabel (multi-tenant)
- Form Request (semua validasi masih inline)
- ApiResponse trait (response belum konsisten)
- SchoolScope (Global Scope)
- Permission-based middleware (masih role-based)
- Reusable UI components
- Route terpisah per domain

---

## Phase 0 — Fondasi Multi-Tenant
*Target: sebelum fitur baru apapun*

- [ ] Tambah kolom `school_id` ke semua tabel operasional
- [ ] Buat tabel `schools`, `school_settings`, `school_domains`
- [ ] Buat `SchoolScope` (Global Scope)
- [ ] Buat `TenantMiddleware`
- [ ] Ganti `RoleMiddleware` dengan `PermissionMiddleware`
- [ ] Buat tabel `permissions` dan `role_permissions`
- [ ] Buat `SchoolProvisioningService` (seed role + permission saat sekolah baru)
- [ ] Update `users` table: `school_id`, `ulid`
- [ ] Update `roles` table: `school_id`, ganti `TINYINT` id jadi `BIGINT`

---

## Phase 1 — Refactor Backend (No New Feature)
*Target: semua yang ada jadi rapi dan aman*

- [ ] Pecah `routes/api.php` → `routes/api/*.php`
- [ ] Buat semua Form Request (85 inline validate)
- [ ] Buat `ApiResponse` trait + update semua controller
- [ ] Buat `GuruResource`, `SiswaResource` dll (API Resource)
- [ ] Pecah `MasterDataGuruController` (5078 baris) jadi 9 controller
- [ ] Pindah inline closure route ke controller
- [ ] Rename `app/jobs/` → `app/Jobs/` (naming convention)
- [ ] Tambah `$hidden` di model (hapus field sensitif dari serialisasi)
- [ ] Tambah scope `scopeAktif()`, `scopeVerified()` di model Guru, Siswa
- [ ] Tambah `GuruPolicy`, `SiswaPolicy`, `DokumenPolicy`
- [ ] Buat `GuruObserver`, `SiswaObserver` untuk audit log

---

## Phase 2 — Refactor Frontend (No New Feature)
*Target: komponen reusable, React Query konsisten*

- [ ] Buat `components/ui/` (DataTable, Modal, Badge, Skeleton, dll)
- [ ] Satukan semua Layout jadi satu `AppLayout.jsx`
- [ ] Satukan semua Sidebar jadi satu `Sidebar.jsx` (dinamis per permission)
- [ ] Buat `hooks/api/` (useGuru, useSiswa, useAbsensi, useKelas, dll)
- [ ] Migrasi halaman yang masih pakai `useEffect` + axios manual → React Query
- [ ] Pecah `DetailGuru.jsx` (7641 baris) jadi 15 tab komponen
- [ ] Pecah `MasterGuru.jsx`, `TambahEditGuru.jsx`
- [ ] Pindah `PublicNavbar.jsx`, `PublicFooter.jsx` ke `pages/public/components/`
- [ ] Tambah `useDisclosure.js`, `useDebounce.js` hook

---

## Phase 3 — Akademik Core
*Target: nilai, rapor, kalender akademik*

- [ ] Tabel: `komponen_penilaians`, `nilais`, `nilai_akhirs`
- [ ] Input nilai per mapel
- [ ] Generate rapor semester
- [ ] Kalender akademik (sudah ada tabelnya, lengkapi fitur)

---

## Phase 4 — Keuangan
*Target: tagihan SPP dan pembayaran*

- [ ] CRUD jenis tagihan
- [ ] Generate tagihan per siswa per bulan
- [ ] Input pembayaran
- [ ] Laporan keuangan bulanan
- [ ] Export tagihan ke Excel / PDF

---

## Phase 5 — PPDB Online
*Target: penerimaan siswa baru digital*

- [ ] Form pendaftaran publik (tanpa login)
- [ ] Upload berkas pendaftaran
- [ ] Verifikasi berkas oleh admin PPDB
- [ ] Pengumuman hasil seleksi
- [ ] Konversi calon siswa → siswa aktif

---

## Phase 6 — Notification Center
*Target: notifikasi multi-channel*

- [ ] In-app notification (bell icon)
- [ ] Email via SMTP per sekolah (konfigurasi di school_settings)
- [ ] Template notifikasi per event (dokumen approve, absensi, dll)
- [ ] WhatsApp (via API gateway — opsional)

---

## Phase 7 — Integrasi Dapodik & EMIS
*Target: tidak perlu entry data dua kali*

- [ ] Export data guru format Dapodik
- [ ] Export data siswa format Dapodik
- [ ] Export format EMIS (Kemenag)
- [ ] Validasi data sesuai requirement Dapodik

---

## Phase 8 — Platform Admin Dashboard
*Target: Super Admin bisa kelola semua sekolah*

- [ ] Dashboard: daftar sekolah, status, jumlah user
- [ ] Kelola paket langganan
- [ ] Impersonate tenant untuk support
- [ ] Monitor penggunaan storage per sekolah

---

## Phase 9+ — Enterprise Features
*(setelah Phase 0-8 selesai dan stabil)*

- Workflow Engine (approval bertingkat)
- DMS lanjutan (OCR, retention, recycle bin)
- Global Search
- Reporting Engine (chart, pivot, export)
- Scheduler (backup, reminder, auto-archive)
- Theme Engine (per sekolah)
- Plugin System (perpustakaan, asrama, kantin)
- CI/CD Pipeline
- Monitoring (CPU, RAM, Queue, Slow Query)
- AI Integration

---

## Aturan Prioritas

**Jangan mulai Phase N+1 sebelum Phase N selesai.**

Kalau Phase 0 (multi-tenant) belum beres, semua fitur baru yang dibangun
akan harus diubah lagi. Itu buang waktu.

Urutan yang tidak bisa dilangkahi:
```
Phase 0 (fondasi) → Phase 1 (backend rapi) → Phase 2 (frontend rapi)
→ baru boleh Phase 3, 4, 5, dst
```
