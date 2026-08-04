# 02 · Architecture Overview

---

## Gambaran Besar

```
Browser / Mobile
      │
      ▼
React + Vite (SPA)
      │  HTTP JSON
      ▼
Laravel API (Sanctum)
      │
      ├── MySQL (data utama)
      ├── Redis (cache + queue) — opsional, fase scaling
      └── Local Storage / S3 (file upload)
```

---

## Multi-Tenant Strategy

Platform ini menggunakan **Shared Database dengan `school_id`**.

Setiap baris data di tabel operasional selalu punya `school_id`.
Laravel **Global Scope** (`SchoolScope`) otomatis menyuntikkan
`WHERE school_id = ?` di semua query — sehingga tidak perlu filter manual
di setiap controller.

```
schools (tenant registry)
  └── users          (school_id)
  └── roles          (school_id, per-tenant custom)
  └── permissions    (school_id, per-tenant custom)
  └── gurus          (school_id)
  └── siswas         (school_id)
  └── kelas          (school_id)
  └── ... semua tabel operasional lainnya
```

Tabel yang **tidak** punya `school_id` (shared global):
- `plans`, `plan_features` — paket langganan
- `school_domains` — domain/subdomain per tenant
- `platform_admins` — super admin platform
- `cache`, `jobs`, `sessions`, `migrations` — sistem

---

## Request Lifecycle

```
Request masuk
      │
      ▼
TenantMiddleware
  Deteksi school dari subdomain → set app('current_school_id')
      │
      ▼
auth:sanctum
  Validasi token → load user
      │
      ▼
PermissionMiddleware (atau RoleMiddleware)
  Cek user punya permission yang dibutuhkan route ini
      │
      ▼
Form Request
  Validasi input — tolak kalau tidak valid (422)
      │
      ▼
Controller (slim)
  Panggil Service, return Resource
      │
      ▼
Service Layer
  Business logic — query via Model
      │
      ▼
Model + SchoolScope
  Query ke DB, otomatis filter school_id
      │
      ▼
API Resource
  Format data → JSON response standar
```

---

## Backend Structure

```
Laravel mengikuti Clean Architecture ringan:

Controller  → terima request, panggil service, return response
Service     → business logic, tidak tahu HTTP
Model       → data access, relasi, scope
Form Request→ validasi input
API Resource→ format output
Observer    → side effect (audit log, notifikasi)
Job         → operasi async (import, export, email)
Event       → decoupling antar modul
```

**Controller tidak boleh:**
- Mengandung business logic
- Query DB langsung (selalu lewat Service atau Model scope)
- Punya lebih dari ~50 baris per method

---

## Frontend Structure

```
React SPA mengikuti pola:

Page Component  → layout + orchestration, tidak ada logic UI detail
Tab/Section     → bagian dari halaman besar (misal DetailGuru → TabIdentitas)
UI Component    → reusable, tidak tahu tentang domain (Table, Modal, Badge)
API Hook        → useQuery / useMutation per domain (useGuru, useSiswa)
Auth Context    → token, user, role — tersedia global
Axios Instance  → satu instance dengan interceptor (src/lib/axios.js)
```

---

## Keputusan Arsitektur yang Sudah Final

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Multi-tenant | Shared DB + school_id | Paling mudah dioperasikan untuk skala awal |
| Auth | Sanctum token | Sudah berjalan, tidak perlu ganti |
| RBAC | Per-tenant custom | Setiap sekolah bisa punya role sendiri |
| API format | JSON standar dengan `success`, `code`, `data` | Konsisten, mudah di-handle di frontend |
| Validation | Form Request (bukan inline `$request->validate`) | Separation of concerns, reusable |
| Response | ApiResponse trait di base Controller | Tidak copy-paste format di tiap controller |
| Frontend state | React Query (TanStack) — sudah terinstall | Cache otomatis, tidak perlu manage loading/error manual |
| File storage | `storage/app/schools/{school_id}/` | Isolasi file per tenant |

---

## Yang Belum Diputuskan (Untuk Fase Berikutnya)

- Queue driver: Database (sekarang) → Redis (saat traffic tinggi)
- Search engine: MySQL LIKE (sekarang) → Meilisearch / Typesense (saat data besar)
- Email driver: SMTP per sekolah → Amazon SES (saat skala)
- Storage: Local → S3-compatible (saat multi-server)
