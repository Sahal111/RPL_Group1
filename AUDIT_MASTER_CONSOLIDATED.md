# MASTER AUDIT REPORT — Scholara
> Diverifikasi langsung dari source code. Last verified: 2026-08-12.

---

## Health Score: 6.5/10

Arsitektur backend solid. Multi-tenancy dengan SchoolScope fail-closed sudah tepat. Modul core (Operator, Guru, Kepsek, Ortu) sudah production-ready. Masalah utama: beberapa modul lanjutan (LMS, PPDB, Keuangan) sudah ada backend-nya tapi belum diverifikasi integrasi penuhnya, dan beberapa klaim audit lama salah total.

---

## 1. ARSITEKTUR — Status Aktual

### ✅ Service Layer — JUSTIFIED, BUKAN OVER-ENGINEERING

Klaim lama "Services hanya CRUD wrapper, harus dihapus" adalah **SALAH**.

| Service | Baris | Isi Nyata |
|---------|------:|-----------|
| `GuruCutiService.php` | 208 | Validasi overlap cuti, state machine status, business rules kompleks |
| `GuruDokumenService.php` | 206 | Manajemen file upload, validasi dokumen |
| `GuruExportService.php` | 562 | Pure-PHP XLSX generation tanpa PhpSpreadsheet |
| `GuruImportService.php` | 754 | Batch import dengan rollback, duplicate detection, error reporting |
| `MutasiGuruService.php` | 593 | Proses mutasi dengan audit trail |

**Verdict:** Semua Service berisi business logic nyata. Tidak ada yang perlu dihapus.

### ✅ Traits — DIGUNAKAN LUAS

Klaim lama "Traits hanya digunakan di satu tempat" adalah **SALAH**.

| Trait | Digunakan di |
|-------|-------------|
| `HasSchoolScope` | 26 model |
| `ApiResponse` | 20+ controller |
| `HasUlid` | multiple model |

### ✅ State Management Frontend — BUKAN Redux

Klaim lama "menggunakan Redux, harus diganti" adalah **SALAH**. File `frontend/src/lib/store.js` **tidak ada**.

Frontend menggunakan:
- **TanStack Query v5** — server state, caching, async
- **React Context** — auth state
- **Recharts** — digunakan nyata di dashboard (bukan kandidat hapus sederhana)

---

## 2. SECURITY — Status Aktual

### ✅ Multi-Tenancy SchoolScope — SOLID

- `SchoolScope` dengan fail-closed pattern (`1 = 0`) sudah benar
- Digunakan di **26 model** utama
- Auto-inject `school_id` saat creating via `bootHasSchoolScope`

### ⚠️ IDOR — NUANCED, BUKAN KRITIS SEPERTI DIKLAIM

`Guru::find($id)`, `Kelas::find($id)` — **aman** karena `HasSchoolScope` menginject `WHERE school_id = ?` secara global otomatis.

Tapi ada edge case yang perlu perhatian:
- Model yang **tidak** menggunakan `HasSchoolScope` harus dipastikan semua query-nya manual menyertakan `school_id`
- Pastikan tidak ada penggunaan `withoutGlobalScope()` di luar `PlatformAdminController`, Artisan Command, atau `SchoolProvisioningService`

**Action:** Audit seluruh penggunaan `withoutGlobalScope(SchoolScope::class)` — pastikan hanya di 3 konteks yang diizinkan.

### ✅ Mass Assignment — AMAN

Tidak ada model dengan `$fillable = ['*']` atau `$guarded = []`. Semua model memiliki `$fillable` eksplisit.

### ✅ DB Transactions — SUDAH ADA

`DB::transaction()` sudah diimplementasikan di:
- `PembayaranController` (store, batalkan)
- `TagihanController` (generate)
- `MasterDataSiswaController` (store, update, destroy)
- `TahunAjaranController`, `NaikKelasController`, `AbsensiController`, dll.

### ❌ Pessimistic Locking — BELUM ADA

`lockForUpdate()` tidak ada di `PembayaranController`. Race condition pada pembayaran bersamaan masih mungkin terjadi.

**Fix:**
```php
// Di PembayaranController::store()
DB::transaction(function () use ($request, $tagihan) {
    $tagihan = Tagihan::lockForUpdate()->findOrFail($request->tagihan_id);
    // ... proses pembayaran
});
```

### ✅ API Routes — Tidak Ada v1 Prefix

Semua routes menggunakan `/api/` langsung (bukan `/api/v1/`). Ini konsisten di kode. Dokumentasi lama yang menyebut `/api/v1/` sudah tidak valid.

---

## 3. DATABASE PERFORMANCE — Status Aktual

### ⚠️ N+1 Risk — VALID

| Kasus | Detail | Status |
|-------|--------|--------|
| Guru profile + 22 relasi | Jika daftar guru load semua relasi | ⚠️ Perlu audit per endpoint |
| Siswa + absensi + kelas | Potensi 600+ query untuk 200 siswa | ⚠️ Perlu eager loading konsisten |
| Tagihan + pembayarans | Laporan tunggakan tanpa withSum | ⚠️ Perlu aggregasi di DB level |
| Exam → Questions → Answers | 3-level N+1 | ⚠️ Perlu nested with() |

### ❌ Missing Index — VALID

Index berikut belum ada di migration:

```sql
-- tagihans.jatuh_tempo — dipakai scopeTunggakan()
ALTER TABLE tagihans ADD INDEX idx_tagihan_school_jtempo_status
  (school_id, jatuh_tempo, status);

-- pembayarans.status — dipakai scopeValid()
ALTER TABLE pembayarans
  ADD INDEX idx_bayar_school_status (school_id, status, tanggal_bayar);
```

Index yang sudah **ada** (via migration `2026_08_07_000002`):
- `tagihans` → `(school_id, status)`, `(school_id, siswa_id)` ✅
- `pembayarans` → `(school_id, siswa_id)` ✅
- `riwayat_kelas` → `(school_id, siswa_id)` ✅
- `absensis` → multiple composites ✅
- `nilais` → `(school_id, siswa_id, semester_id)` ✅

### ⚠️ SiswaKelas Deprecated — BELUM DIMIGRASIKAN

`SiswaKelas.php` masih ada dan masih dipakai aktif di `GuruController.php` (5+ tempat). Ini tech debt nyata.

**Action:** Ganti semua `SiswaKelas` dengan `RiwayatKelas`, lalu hapus file.

### ⚠️ activity_logs — Belum Ada Cleanup Job

Tabel `activity_logs` append-only tanpa archiving. `data_retention_policies` ada di schema tapi tidak terhubung ke scheduled job.

---

## 4. TRANSACTION INTEGRITY — Status Aktual

| Item | Status |
|------|--------|
| DB::transaction di pembayaran | ✅ Ada |
| Pessimistic locking (lockForUpdate) | ❌ Belum ada |
| Immutable history (no direct update on paid) | ⚠️ Perlu verifikasi |
| Frontend disabled state saat request | ⚠️ Perlu audit per komponen |

---

## 5. DOKUMENTASI — Status Aktual

| Masalah | Status |
|---------|--------|
| Docs menyebut `/api/v1/` | ❌ Salah — aktual `/api/` |
| `apibackup.md` duplikat `doc3-api-contract.md` | ✅ Konfirmasi valid |

---

## Action Plan (Direvisi)

| Prioritas | Task | File |
|-----------|------|------|
| **P0** | Tambah `lockForUpdate()` di PembayaranController | `Keuangan/PembayaranController.php` |
| **P0** | Audit semua `withoutGlobalScope()` — pastikan hanya di konteks yang diizinkan | `app/Http/Controllers/` |
| **P1** | Migrate semua `SiswaKelas` → `RiwayatKelas`, hapus SiswaKelas.php | `GuruController.php` |
| **P1** | Tambah index `jatuh_tempo` dan `status` yang masih missing | Migration baru |
| **P1** | Update `doc3-api-contract.md` dan `04-api-standard.md` — hapus semua `/api/v1/` | `docs/` |
| **P2** | Audit N+1: cek eager loading di setiap endpoint daftar Guru dan Siswa | Controllers |
| **P2** | Buat scheduled job untuk archiving `activity_logs` > 1 tahun | `Console/Commands/` |
| **P2** | Verifikasi integrasi frontend-backend: Keuangan, PPDB, LMS | End-to-end |
| **P3** | `recharts` — pertahankan, justified untuk dashboard (bukan kandidat hapus) | — |