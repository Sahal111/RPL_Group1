# 07 · RBAC Standard

---

## Model

```
School → Role (per-tenant) → Permission (per-tenant)
                ↑
              User (punya satu atau lebih role)
```

Setiap sekolah punya role dan permission sendiri.
Saat sekolah baru didaftarkan, `SchoolProvisioningService` otomatis
seed role default + permission default.

---

## Role Default (Template)

| slug | nama | is_system | Bisa Dihapus |
|---|---|---|---|
| `super_operator` | Operator Utama | ✓ | ❌ |
| `operator` | Operator | ✓ | ❌ |
| `kepsek` | Kepala Sekolah | ✓ | ❌ |
| `guru` | Guru | ✓ | ❌ |
| `wali_kelas` | Wali Kelas | ✓ | ❌ |
| `bendahara` | Bendahara | ✓ | ❌ |
| `ortu` | Orang Tua | ✓ | ❌ |
| `admin_ppdb` | Admin PPDB | ✓ | ❌ |

Operator sekolah bisa tambah role custom (misal: `wakil_kepsek`, `tata_usaha`).

---

## Permission Format

```
{modul}.{resource}.{aksi}

Contoh:
master_data.guru.view
master_data.guru.create
master_data.guru.update
master_data.guru.delete
master_data.guru.import
master_data.guru.export
master_data.guru.verify

dms.upload
dms.view_own
dms.view_all
dms.approve
dms.download

absensi.input
absensi.view_all
absensi.rekap

pengaturan.rbac.manage    ← khusus super_operator
```

---

## Implementation

### Middleware di Route

```php
// Cek permission
Route::get('/guru', [GuruController::class, 'index'])
    ->middleware('permission:master_data.guru.view');

// Multiple permission (user harus punya SALAH SATU)
Route::get('/guru/{ulid}/dokumen', ...)
    ->middleware('permission:dms.view_own,dms.view_all');
```

### Policy di Controller

```php
// Cek ownership resource (lapis kedua)
public function destroy(string $ulid): JsonResponse
{
    $guru = Guru::where('ulid', $ulid)->firstOrFail();
    $this->authorize('delete', $guru);  // ← GuruPolicy::delete()

    $this->guruService->delete($ulid);
    return $this->success(message: 'Data guru berhasil dihapus.');
}
```

### Di Frontend

```jsx
// Cek permission sebelum tampilkan tombol
const { hasPermission } = useAuth();

{hasPermission('master_data.guru.create') && (
  <button onClick={handleTambah}>Tambah Guru</button>
)}

{hasPermission('master_data.guru.delete') && (
  <button onClick={() => handleDelete(guru.id)}>Hapus</button>
)}
```

---

## Aturan Keamanan RBAC

1. **Selalu dua lapis**: middleware (permission) + policy (ownership)
2. Middleware saja tidak cukup — cek cross-tenant harus ada di Policy
3. Cache permission per user per request — jangan query DB berkali-kali
4. `super_operator` tidak otomatis bisa akses lintas sekolah — itu hanya `platform_admins`
5. Kalau ragu permission mana yang cocok, tanya lead developer

---

## Permission Matrix Singkat

| Permission | super_operator | operator | kepsek | guru | wali_kelas | bendahara | ortu |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| master_data.guru.view | ✓ | ✓ | ✓ | - | - | - | - |
| master_data.guru.create | ✓ | ✓ | - | - | - | - | - |
| master_data.guru.delete | ✓ | ✓ | - | - | - | - | - |
| master_data.guru.verify | ✓ | ✓ | ✓ | - | - | - | - |
| dms.approve | ✓ | ✓ | ✓ | - | - | - | - |
| dms.upload | ✓ | ✓ | - | ✓ | ✓ | - | - |
| absensi.input | ✓ | ✓ | - | ✓ | ✓ | - | - |
| absensi.view_all | ✓ | ✓ | ✓ | - | - | - | - |
| keuangan.* | ✓ | - | - | - | - | ✓ | - |
| pengaturan.rbac.manage | ✓ | - | - | - | - | - | - |

Matriks lengkap ada di `doc2-rbac-design.md`.
