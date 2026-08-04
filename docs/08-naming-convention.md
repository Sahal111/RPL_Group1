# 08 · Naming Convention

---

## Backend (PHP / Laravel)

### File & Class

| Jenis | Format | Contoh |
|---|---|---|
| Controller | `PascalCase` + `Controller` | `GuruController`, `GuruDokumenController` |
| Service | `PascalCase` + `Service` | `GuruService`, `GuruImportService` |
| Model | `PascalCase` singular | `Guru`, `GuruDokumen`, `TahunAjaran` |
| Form Request | `PascalCase` aksi + nama | `StoreGuruRequest`, `UpdateGuruRequest` |
| API Resource | `PascalCase` + `Resource` | `GuruResource`, `GuruDetailResource` |
| Observer | `PascalCase` + `Observer` | `GuruObserver`, `DokumenObserver` |
| Job | `PascalCase` kata kerja | `ProcessGuruImport`, `SendNotificationEmail` |
| Event | `PascalCase` past tense | `GuruCreated`, `DokumenApproved` |
| Listener | `PascalCase` + `Listener` | `SendGuruWelcomeEmail`, `LogDokumenActivity` |
| Policy | `PascalCase` + `Policy` | `GuruPolicy`, `DokumenPolicy` |
| Middleware | `PascalCase` + `Middleware` | `TenantMiddleware`, `PermissionMiddleware` |
| Scope | `PascalCase` + `Scope` | `SchoolScope`, `ActiveScope` |
| Seeder | `PascalCase` + `Seeder` | `SchoolSeeder`, `RolePermissionSeeder` |
| Factory | `PascalCase` + `Factory` | `GuruFactory`, `SiswaFactory` |
| Migration | `snake_case` dengan timestamp | `2026_08_01_000001_create_gurus_table` |

### Method / Fungsi

| Jenis | Format | Contoh |
|---|---|---|
| Controller method | camelCase | `index`, `show`, `store`, `update`, `destroy` |
| Service method | camelCase, kata kerja | `create`, `update`, `delete`, `findByUlid`, `paginate` |
| Scope | `scope` + PascalCase | `scopeAktif()`, `scopeVerified()` |
| Accessor | `get` + PascalCase + `Attribute` | `getNamaLengkapAttribute()` |
| Mutator | `set` + PascalCase + `Attribute` | `setPasswordAttribute()` |
| Relasi | camelCase nama relasi | `jabatanAktif()`, `pendidikanTerakhir()` |
| Boolean check | `is` / `has` / `can` prefix | `isAktif()`, `hasUser()`, `canApprove()` |

### Variable

```php
// camelCase
$guru, $guruId, $tahunAjaran, $isVerified

// Jangan singkatan tidak jelas
$g   ❌
$ta  ❌
$iv  ❌
```

### Konstanta

```php
// SCREAMING_SNAKE_CASE di class
const STATUS_AKTIF = 'Aktif';
const JENIS_PTK_GURU = 'Guru Kelas';

// Atau pakai Enum (PHP 8.1+)
enum StatusKeaktifan: string
{
    case Aktif   = 'Aktif';
    case Cuti    = 'Cuti';
    case Pensiun = 'Pensiun';
}
```

---

## Database

### Tabel

```
gurus                 ✅ plural, snake_case
siswas                ✅
orang_tuas            ✅
tahun_ajarans         ✅
guru_dokumens         ✅ child table: {parent}_{domain}s
user_roles            ✅ pivot: {a}_{b} alphabetical
role_permissions      ✅

guruDokumen           ❌ camelCase
guru_doc              ❌ singkatan
Gurus                 ❌ huruf besar
```

### Kolom

```
id                    ✅ PK selalu 'id'
school_id             ✅ FK: {tabel}_id
user_id               ✅
nama                  ✅
jenis_kelamin         ✅
is_active             ✅ boolean: is_ prefix
is_verified           ✅
created_at            ✅ timestamp: _at suffix
deleted_at            ✅ soft delete
created_by            ✅ audit: _by suffix
status_keaktifan      ✅ enum

namaLengkap           ❌ camelCase
JenisKelamin          ❌ PascalCase
aktif                 ❌ tidak jelas (boolean tanpa prefix is_)
```

---

## Frontend (React / JavaScript)

### File & Folder

| Jenis | Format | Contoh |
|---|---|---|
| Komponen React | `PascalCase.jsx` | `DataTable.jsx`, `MasterGuru.jsx` |
| Hooks | `use` + camelCase + `.js` | `useGuru.js`, `useDisclosure.js` |
| Context | `PascalCase` + `Context.jsx` | `AuthContext.jsx` |
| Utility | camelCase + `.js` | `formatDate.js`, `currency.js` |
| Konstanta | `SCREAMING_SNAKE_CASE.js` atau camelCase | `constants.js` |
| Folder | `camelCase` atau `kebab-case` | `masterDataGuru/`, `api/` |

### Komponen

```jsx
// PascalCase untuk nama komponen
const DataTable = () => { ... }    ✅
const dataTable = () => { ... }    ❌
const data_table = () => { ... }   ❌

// Props: camelCase
<DataTable
  isLoading={true}          ✅
  onPageChange={handlePage} ✅
  columnConfig={columns}    ✅

  is_loading={true}         ❌
  on_page_change={fn}       ❌
/>
```

### Hooks

```jsx
// Selalu prefix 'use'
const useGurus = () => { ... }       ✅
const getGurus = () => { ... }       ❌ — bukan hook

// Return dari hook: konsisten
const { data, isLoading, isError, refetch } = useGurus();
```

### Handler Functions

```jsx
// Prefix 'handle' untuk event handler
const handleSubmit = (e) => { ... }
const handleDelete = (id) => { ... }
const handlePageChange = (page) => { ... }

// Jangan 'on' prefix — itu untuk props
<button onClick={handleSubmit}>  ✅
```

### Variabel

```jsx
// camelCase, deskriptif
const guruList = [];           ✅
const selectedGuruUlid = '';   ✅
const isModalOpen = false;     ✅
const currentPage = 1;         ✅

const gl = [];                 ❌ singkatan
const flag = false;            ❌ tidak deskriptif
const temp = {};               ❌
```

---

## API Route

```
// RESTful, lowercase, kebab-case untuk kata majemuk
GET    /v1/guru                       ✅
GET    /v1/guru/{ulid}                ✅
POST   /v1/guru                       ✅
PUT    /v1/guru/{ulid}                ✅
DELETE /v1/guru/{ulid}                ✅

GET    /v1/guru/{ulid}/dokumen        ✅ sub-resource
POST   /v1/guru/{ulid}/dokumen        ✅
PATCH  /v1/guru/{ulid}/dokumen/{id}/approve  ✅ custom action

// Jangan campur konvensi
GET    /v1/getGuru                    ❌ verb di URL
GET    /v1/Guru                       ❌ huruf besar
POST   /v1/guru/tambah                ❌ verb bahasa Indonesia
GET    /v1/data-guru                  ❌ prefix 'data-'
```

---

## Git

### Branch

```
main                          production-ready code
develop                       staging branch, merge ke sini dulu
feature/guru-import           fitur baru
fix/guru-foto-upload          bug fix
refactor/split-guru-controller refactor
docs/update-ses               update dokumentasi
```

### Commit Message

Format: `{type}({scope}): {deskripsi singkat}`

```
feat(guru): tambah validasi NUPTK duplikat per sekolah
fix(absensi): perbaiki bug filter tanggal di rekap
refactor(guru-controller): pecah menjadi 9 controller terpisah
docs(ses): update laravel standard
test(guru-service): tambah unit test untuk GuruService::create
style(data-table): perbaiki responsive layout di mobile
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `style`, `chore`
