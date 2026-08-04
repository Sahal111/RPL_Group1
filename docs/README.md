# 📘 SIAKAD Enterprise Specification (SES)

Dokumen ini adalah **kitab utama** pengembangan SIAKAD Enterprise Platform.

Setiap developer yang bergabung **wajib membaca semua dokumen ini** sebelum menulis baris kode pertama.

---

## Daftar Dokumen

| # | Dokumen | Deskripsi |
|---|---------|-----------|
| 01 | [Vision & Mission](docs/01-vision.md) | Tujuan besar, target user, scope |
| 02 | [Architecture Overview](docs/02-architecture.md) | Arsitektur sistem, request lifecycle, keputusan final |
| 03 | [Database Standard](docs/03-database-standard.md) | Schema, naming, index, audit field, migration, seeder |
| 04 | [API Standard](docs/04-api-standard.md) | Format response, error code, ApiResponse trait |
| 05 | [Laravel Standard](docs/05-laravel-standard.md) | Controller, Service, Model, Form Request, Route, Observer |
| 06 | [React Standard](docs/06-react-standard.md) | React Query, hooks, komponen, layout, error handling |
| 07 | [RBAC Standard](docs/07-rbac-standard.md) | Role, permission, middleware, policy, permission matrix |
| 08 | [Naming Convention](docs/08-naming-convention.md) | File, class, method, variabel, tabel, kolom, API route, Git |
| 09 | [Folder Structure](docs/09-folder-structure.md) | Struktur folder backend dan frontend lengkap |
| 10 | [UI Design System](docs/10-ui-design-system.md) | Warna, tipografi, komponen, spacing, aturan UI |
| 10b | [UI Consistency Checklist](docs/10b-ui-consistency-rules.md) | Checklist code review untuk perubahan UI |
| 11 | [DMS Standard](docs/11-dms-standard.md) | Workflow dokumen, versioning, audit log, endpoint |
| 12 | [Import Export Standard](docs/12-import-export-standard.md) | Flow import async, job, error handling, template |
| 13 | [Security Standard](docs/13-security-standard.md) | Mass assignment, auth, file upload, SQL injection, audit |
| 14 | [Performance Standard](docs/14-performance-standard.md) | N+1, pagination, index, cache, queue, React Query |
| 15 | [Testing Standard](docs/15-testing-standard.md) | Feature test, unit test, contoh kode test |
| 16 | [Contribution Guide](docs/16-contribution-guide.md) | Git flow, commit message, PR template, coding standards |
| 17 | [Deployment Standard](docs/17-deployment-standard.md) | Server, Nginx, queue worker, SSL, backup, checklist |
| 18 | [Roadmap](docs/18-roadmap.md) | Phase pengembangan dari 0 sampai enterprise features |

---

## Tech Stack

| Layer | Teknologi | Versi |
|---|---|---|
| Backend | Laravel | 12.x |
| Frontend | React + Vite | 19.x |
| Database | MySQL | 8.x |
| Auth | Laravel Sanctum | — |
| HTTP Client | Axios | 1.x |
| Server State | TanStack React Query | 5.x |
| UI Utilities | Tailwind CSS | 4.x |
| Icons | Lucide React | latest |
| Charts | Recharts | 3.x |
| Date | Day.js | 1.x |
| PDF Export | jsPDF + AutoTable | latest |
| Excel Export | SheetJS (xlsx) | latest |

---

## Quick Start untuk Developer Baru

```bash
# 1. Clone repo
git clone https://github.com/Sahal111/RPL_Group1.git
cd RPL_Group1

# 2. Setup backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --port=8001

# 3. Setup frontend (terminal baru)
cd frontend
npm install
cp .env.example .env.local   # isi VITE_API_URL=http://127.0.0.1:8001/api
npm run dev
```

**Baca semua dokumen di `/docs` sebelum mulai coding. Mulai dari [01-vision.md](docs/01-vision.md).**

---

## Aturan Yang Tidak Boleh Dilanggar

```
❌ $guarded = []                         → pakai $fillable eksplisit
❌ $request->validate() di controller   → pakai Form Request
❌ Query DB di controller               → lewat Service
❌ axios langsung di komponen React     → lewat hooks/api/
❌ useEffect untuk fetch data           → pakai React Query
❌ Layout baru per role                 → semua pakai AppLayout
❌ Tabel tanpa school_id                → semua tabel operasional wajib punya
❌ Response tanpa ApiResponse trait     → pakai $this->success() / $this->error()
❌ dd() atau console.log() di PR        → tidak boleh lolos review
❌ Migration yang down() kosong         → wajib bisa rollback
```
