# 16 · Contribution Guide

---

## Untuk Developer Baru — Checklist Onboarding

Sebelum mulai coding, pastikan sudah:

- [ ] Baca semua dokumen di `/docs` dari 01 sampai 18
- [ ] Setup local environment (lihat README.md)
- [ ] Jalankan `php artisan migrate --seed` dan pastikan berhasil
- [ ] Bisa login dengan akun dev yang di-seed
- [ ] Bisa akses API dari Postman atau frontend
- [ ] Pahami struktur folder backend dan frontend (doc 09)
- [ ] Pahami naming convention (doc 08)
- [ ] Tanya lead developer kalau ada yang tidak jelas — jangan asumsikan

---

## Git Flow

```
main ─────────────────────────────────────────── production
  │
  └── develop ──────────────────────────────── staging
        │
        ├── feature/guru-import ──── selesai → PR ke develop
        ├── fix/foto-upload-bug ──── selesai → PR ke develop
        └── refactor/split-controller → selesai → PR ke develop
```

### Aturan Branch

```bash
# Buat branch dari develop (BUKAN dari main)
git checkout develop
git pull origin develop
git checkout -b feature/nama-fitur

# Naming
feature/         fitur baru
fix/             bug fix
refactor/        refactor kode
docs/            update dokumentasi
test/            tambah test
```

### Aturan Sebelum Push

```bash
# 1. Pastikan kode jalan
php artisan test                # backend
npm run lint                    # frontend (oxlint)

# 2. Tidak ada migration yang tertinggal
php artisan migrate:status

# 3. Tidak ada dd(), var_dump(), console.log() yang tertinggal
grep -r "dd(" app/              # cari dd()
grep -r "console.log" src/      # cari console.log

# 4. Squash commit kalau terlalu banyak commit kecil
git rebase -i develop
```

---

## Commit Message

Format: `{type}({scope}): {deskripsi}`

```bash
# ✅ BENAR
feat(guru): tambah endpoint import foto bulk via zip
fix(absensi): perbaiki bug tanggal tidak tersimpan di timezone WIB
refactor(guru-controller): pecah menjadi 9 controller terpisah
docs(ses): tambah performance standard
test(guru-service): tambah test untuk create dan delete

# ❌ SALAH
update guru
fix bug
wip
asdfgh
tambah fitur baru
```

Types yang valid:
- `feat` — fitur baru
- `fix` — bug fix
- `refactor` — perubahan kode tanpa ubah behavior
- `docs` — update dokumentasi
- `test` — tambah atau update test
- `style` — formatting, tidak ada perubahan logic
- `chore` — update dependency, config, dll

---

## Pull Request

### Template PR Description

```markdown
## Apa yang berubah?
Jelaskan singkat apa yang diubah dan kenapa.

## Tipe perubahan
- [ ] Bug fix (tidak ubah API)
- [ ] Fitur baru (tidak breaking)
- [ ] Refactor (tidak ubah behavior)
- [ ] Breaking change (ubah API atau DB schema)

## Testing
- [ ] Sudah test manual di local
- [ ] Sudah jalankan php artisan test
- [ ] Tidak ada N+1 query baru

## Screenshot (kalau ada perubahan UI)
[lampirkan screenshot]

## Checklist
- [ ] Kode mengikuti naming convention (doc 08)
- [ ] Tidak ada dd() atau console.log() yang tertinggal
- [ ] Migration bisa di-rollback (down() tidak kosong)
- [ ] Response sudah pakai ApiResponse trait
- [ ] Validasi sudah di Form Request, bukan inline
```

### Aturan Review PR

- PR tidak boleh di-merge oleh penulisnya sendiri
- Minimal 1 reviewer
- Jangan merge kalau ada konflik yang belum diselesaikan
- Reviewer harus cek: security, N+1, naming convention

---

## Yang Tidak Boleh di PR

```
❌ Migration yang mengubah tabel yang sudah ada (tanpa migration baru)
❌ $guarded = []
❌ $request->validate() di controller
❌ Inline closure di routes/api.php
❌ axios langsung di komponen (bukan hooks/api/)
❌ useEffect untuk fetch data (pakai React Query)
❌ Layout baru per role (semua pakai AppLayout)
❌ dd(), dump(), var_dump() di kode production
❌ console.log() di kode production
❌ .env file yang berisi credential asli
❌ Hardcode school_id, user_id, atau nilai yang harusnya dinamis
```

---

## Coding Standards

### PHP

- PHP 8.2+, pakai fitur modern: readonly properties, named arguments, match expression
- Type hints wajib di semua method signature
- Return type wajib
- Jangan skip `declare(strict_types=1)` — tambahkan di file baru

```php
<?php

declare(strict_types=1);

namespace App\Services\Guru;

class GuruService
{
    public function findByUlid(string $ulid): Guru  // ← return type wajib
    {
        return Guru::where('ulid', $ulid)->firstOrFail();
    }
}
```

### JavaScript / React

- ES2022+
- Functional component, tidak boleh class component
- Pakai optional chaining (`?.`) dan nullish coalescing (`??`)
- Destruktur props di parameter function

```jsx
// ✅ BENAR
const DataField = ({ label, value, className = '' }) => (
  <div className={`data-field ${className}`}>
    <span className="label">{label}</span>
    <span className="value">{value ?? '-'}</span>
  </div>
);

// ❌ SALAH
function DataField(props) {
  return (
    <div>
      <span>{props.label}</span>
      <span>{props.value}</span>
    </div>
  );
}
```

---

## Kapan Harus Tanya Lead Developer

Tanya dulu, jangan langsung coding, kalau:

- Mau tambah tabel baru atau ubah schema yang sudah ada
- Mau ubah struktur folder
- Mau install dependency baru
- Mau ubah format API response
- Tidak yakin permission mana yang cocok untuk endpoint baru
- PR sudah >500 baris perubahan (kemungkinan bisa dipecah)
