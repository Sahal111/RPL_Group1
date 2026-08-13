# Scholara_ — Progress & Completed Features
> File ini mencatat semua fitur yang sudah selesai dikerjakan dan di-test.
> **Jangan ubah section yang sudah ✅ tanpa diskusi dulu.**
> Update file ini setiap kali fitur baru selesai.

---

## 📋 Status Legend
| Symbol | Arti |
|--------|------|
| ✅ | Selesai & tested |
| 🔧 | Sedang dikerjakan |
| ⏳ | Antrian / belum mulai |
| ❌ | Ada masalah / broken |

---

## ✅ [2026-08-13] Sistem Auth — Login, Register, Forgot Password

### Scope
Sistem autentikasi lengkap: login multi-role, register orang tua, forgot/reset password via email.

### Flow yang Tested
| Flow | Endpoint | Hasil |
|------|----------|-------|
| Login username/email | `POST /api/auth/login` | ✅ |
| Redirect by role | Frontend `redirectMap` | ✅ |
| Session restore (refresh halaman) | `GET /api/auth/me` | ✅ |
| Logout | `POST /api/auth/logout` | ✅ |
| Register Orang Tua | `POST /api/auth/register-ortu` | ✅ |
| Forgot Password — kirim email | `POST /api/auth/forgot-password` | ✅ |
| Email reset masuk Gmail | Via SMTP Gmail | ✅ |
| Verifikasi token | `GET /api/auth/verify-reset-token` | ✅ |
| Reset Password | `POST /api/auth/reset-password` | ✅ |
| Login dengan password baru | `POST /api/auth/login` | ✅ |
| Rate limiting (429) | `throttle:5,1` pada login | ✅ |

### Bug yang Diperbaiki

**Bug 1 — `me()` response structure (session tidak restore saat refresh)**
- File: `backend/app/Http/Controllers/Auth/AuthController.php`
- Problem: `/me` return flat `data.data`, tapi `AuthContext` baca `data.data.user` → user selalu null saat refresh
- Fix: wrap response dalam `'user' => [...]` agar konsisten dengan `/login`

**Bug 2 — Field mismatch `nama` vs `nama_lengkap` di Register Ortu**
- Files: `RegisterOrtuRequest.php` + `AuthController.php`
- Problem: frontend kirim `nama_lengkap`, backend rules pakai `nama` → registrasi gagal
- Fix: ganti rules ke `nama_lengkap`, update 2 titik `$request->nama` → `$request->nama_lengkap`

**Bug 3 — `MasterData/Guru/GuruController` isi salah (500 di dashboard operator)**
- Files: `Guru/GuruProfileController.php` + `routes/api/master-data.php`
- Problem: route operator `/master-data/guru` pakai `MasterGuruController` yang isinya method portal guru bukan CRUD → 500 karena `index()` tidak ada
- Fix: ganti import di route ke `GuruProfileController`, tambahkan 12 method yang kurang, fix `show()` & `update()` pakai `$nuptk`

### File yang Diubah
| File | Perubahan |
|------|-----------|
| `backend/app/Http/Controllers/Auth/AuthController.php` | Fix `me()` response + `$request->nama_lengkap` |
| `backend/app/Http/Requests/Auth/RegisterOrtuRequest.php` | Field `nama` → `nama_lengkap` |
| `backend/app/Http/Controllers/Guru/GuruProfileController.php` | Tambah 12 method baru, fix `show()` & `update()` |
| `backend/routes/api/master-data.php` | Ganti import `MasterGuruController` ke `GuruProfileController` |

### Yang Tidak Boleh Diubah
- Response structure `me()` — harus tetap `data.user` bukan flat `data`
- Field `nama_lengkap` di `RegisterOrtuRequest` — jangan dikembalikan ke `nama`
- Import `MasterGuruController` di `master-data.php` — harus tetap dari `GuruProfileController`
- Method `show()` dan `update()` di `GuruProfileController` — harus pakai `$nuptk`

---

## ✅ [2026-08-13] Security Fix — Multi-Tenant Login (Cross-Tenant Prevention)

### Scope
Mencegah user dari sekolah A bisa login ke subdomain sekolah B.

### Problem
Method `login()` pakai `withoutGlobalScope(SchoolScope)` tanpa filter `school_id` → user dari sekolah manapun bisa login ke subdomain sekolah lain selama username/password cocok.

### Fix
**File:** `backend/app/Http/Controllers/Auth/AuthController.php`

Logic baru di `login()`:
1. Cek apakah ada `current_school_id` dari TenantMiddleware (subdomain)
2. Kalau **ADA** subdomain → `WHERE school_id = current_school_id` (+ `orWhereNull` untuk super_admin)
3. Double-check setelah user ditemukan: kalau `school_id` tidak cocok → tolak dengan pesan generik
4. Kalau **TIDAK ADA** subdomain (localhost/mobile) → query tanpa filter, lalu set `current_school_id` dari user yang login (fallback)
5. `super_admin` (`school_id = null`) dikecualikan — boleh login dari subdomain manapun

### Yang Tidak Boleh Diubah
- Jangan hapus `withoutGlobalScope(SchoolScope)` di query login — tanpa ini query akan error sebelum filter manual sempat jalan
- Pesan error cross-tenant harus tetap generik (`'Username/email atau password salah.'`) — anti-enumeration, jangan bocorkan bahwa user exist di sekolah lain
- Urutan logic wajib: filter school_id → cek password → double-check cross-tenant → cek is_active

### File yang Diubah
| File | Perubahan |
|------|-----------|
| `backend/app/Http/Controllers/Auth/AuthController.php` | Tambah logika filter `school_id` di method `login()` |

---

## ⏳ Fitur Berikutnya
> Isi section ini saat ada fitur baru yang akan dikerjakan

---

## 📌 Catatan Umum

### Struktur Controller Guru (Final)
```
app/Http/Controllers/
├── Auth/
│   ├── AuthController.php              ← login, logout, me, registerOrtu
│   └── PasswordResetController.php     ← forgotPassword, resetPassword, verifyToken
├── Guru/
│   ├── GuruController.php              ← portal guru: dashboard, absensi, profil
│   ├── GuruProfileController.php       ← MASTER DATA operator: index, show, store, dst
│   ├── GuruDokumenController.php
│   └── GuruKepegawaianController.php
└── MasterData/
    └── Guru/
        ├── GuruController.php          ⚠️ TIDAK DIPAKAI — jangan edit
        ├── GuruAdministrasiController.php
        ├── GuruDokumenController.php
        ├── GuruExportController.php
        ├── GuruImportController.php
        ├── GuruKeluargaController.php
        ├── GuruKepegawaianController.php
        ├── GuruKompetensiController.php
        └── GuruMutasiController.php
```

### Akun Testing
| Role | Username | Password |
|------|----------|----------|
| Super Admin | `superadmin` | `superadmin123` |
| Operator | `operator` | `operator123` |
| Kepala Sekolah | `kepsek` | `kepsek123` |
| Guru | `guru` | `guru123` |
| Wali Kelas | `walikelas` | `walikelas123` |
| Bendahara | `bendahara` | `bendahara123` |
| Orang Tua | `ortu` | `ortu123` |
| Siswa | `siswa` | `siswa123` |
| Admin PPDB | `adminppdb` | `adminppdb123` |

### Konfigurasi `.env` Penting
```env
# Backend
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_BACKEND_URL=http://127.0.0.1:8000
```
> ⚠️ Ada duplikat MAIL config di `.env` backend — hapus blok `MAIL_MAILER=log` yang lama.