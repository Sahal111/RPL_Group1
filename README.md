<div align="center">

# 🏫 SIAKAD — Sistem Informasi Akademik Sekolah

> **Aplikasi manajemen absensi & akademik sekolah berbasis web** yang dibangun dengan **Laravel 12** (Backend) dan **React + Vite** (Frontend)

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

## 📌 Tentang Proyek

**SIAKAD** adalah sistem informasi akademik berbasis web yang dirancang untuk membantu sekolah dalam mengelola kehadiran siswa, data akademik, pengumuman, dan komunikasi antar pemangku kepentingan. Sistem ini mendukung **multi-role** (Operator, Guru, Kepala Sekolah, dan Orang Tua) dengan dashboard dan hak akses yang berbeda untuk setiap peran.

### 🎯 Tujuan Sistem

| No | Tujuan |
|----|--------|
| 1  | Mempermudah guru dalam melakukan absensi harian per mata pelajaran |
| 2  | Memberikan transparansi kehadiran siswa kepada orang tua secara real-time |
| 3  | Memudahkan kepala sekolah dalam memonitor data akademik sekolah |
| 4  | Menyederhanakan pengelolaan data master (siswa, guru, kelas, jadwal) oleh operator |

---

## ✨ Fitur Utama

### 👨‍💼 Operator
- Manajemen akun pengguna (guru, siswa, orang tua, kepala sekolah)
- Master data kelas, mata pelajaran, dan jadwal pelajaran
- Manajemen tahun ajaran & proses naik kelas
- Approval pendaftaran akun orang tua
- Pengelolaan galeri & pengumuman sekolah

### 👨‍🏫 Guru
- Dashboard statistik kelas
- Input absensi per jadwal pelajaran
- Rekap absensi siswa dengan ekspor PDF/Excel
- Lihat data siswa dan riwayat absensi
- Lihat jadwal mengajar

### 🎓 Kepala Sekolah
- Dashboard monitoring statistik sekolah
- Monitoring absensi seluruh kelas
- Melihat data guru & siswa
- Manajemen pengumuman & kalender akademik

### 👨‍👩‍👧 Orang Tua
- Pantau absensi anak secara real-time
- Riwayat absensi per bulan
- Tambah & kelola data anak
- Lihat pengumuman sekolah

---

## 🛠 Teknologi

### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| PHP | 8.2+ | Runtime language |
| Laravel | 12.x | Web framework |
| Laravel Sanctum | 4.3 | API Authentication (Token-based) |
| MySQL | 8.x | Database utama |

### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | 19.x | UI Library |
| Vite | 8.x | Build tool & dev server |
| TailwindCSS | 4.x | Utility-first CSS framework |
| React Router DOM | 7.x | Client-side routing |
| TanStack Query | 5.x | Server state management & caching |
| Axios | 1.x | HTTP client |
| Recharts | 3.x | Charting library |
| jsPDF + AutoTable | 4.x + 5.x | Ekspor laporan PDF |
| XLSX | 0.18 | Ekspor laporan Excel |
| Lucide React | 1.x | Icon library |
| React Hot Toast | 2.x | Notifikasi |

---
---

## 📊 Analisis Proses Bisnis

### Flowchart Sistem Berjalan (Manual)

```mermaid
flowchart TD
    A([🏫 Mulai]) --> B[Guru membawa buku absensi ke kelas]
    B --> C[Guru memanggil nama siswa satu per satu]
    C --> D{Siswa hadir?}
    D -->|Hadir| E[Catat: Hadir]
    D -->|Tidak hadir| F{Keterangan?}
    F -->|Izin| G[Catat: Izin]
    F -->|Sakit| H[Catat: Sakit]
    F -->|Tanpa keterangan| I[Catat: Alfa]
    E & G & H & I --> J{Semua siswa sudah dipanggil?}
    J -->|Belum| C
    J -->|Sudah| K[Admin merekap data secara manual]
    K --> L[Laporan diserahkan ke Kepala Madrasah]
    L --> M[Kepala Madrasah monitoring & evaluasi]
    M --> N[Orang tua mendapat info dari pihak sekolah]
    N --> O([🔚 Selesai])

    style A fill:#4CAF50,color:#fff
    style O fill:#F44336,color:#fff
    style D fill:#FF9800,color:#fff
    style F fill:#FF9800,color:#fff
    style J fill:#FF9800,color:#fff
```

---

## 🗂️ Perancangan Sistem

### Use Case Diagram

```mermaid
graph LR
    subgraph Sistem["🖥️ Sistem Informasi Presensi Digital"]
        UC1(Login)
        UC2(Kelola Data Guru)
        UC3(Kelola Data Siswa)
        UC4(Kelola Data Orang Tua)
        UC5(Kelola Data Akademik)
        UC6(Kelola Akun)
        UC7(Lihat Laporan Presensi)
        UC8(Input Presensi)
        UC9(Edit Presensi)
        UC10(Lihat Rekap Presensi)
        UC11(Lihat Presensi Anak)
        UC12(Monitoring Presensi)
        UC13(Melihat Data Siswa)
        UC14(Logout)
    end

    Admin(["👤 Admin"])
    Guru(["👨‍🏫 Guru"])
    OrangTua(["👨‍👩‍👧 Orang Tua"])
    Kepsek(["🏛️ Kepala Madrasah"])

    Admin --- UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7 & UC14
    Guru --- UC1 & UC8 & UC9 & UC10 & UC14
    OrangTua --- UC1 & UC11 & UC14
    Kepsek --- UC1 & UC12 & UC13 & UC14
```

---

### Activity Diagram

#### 1. Login — Semua Aktor

```mermaid
flowchart TD
    A([Mulai]) --> B[Buka Aplikasi]
    B --> C[Masukkan Username & Password]
    C --> D{Kredensial valid?}
    D -->|Tidak| E[Tampilkan pesan error]
    E --> C
    D -->|Ya| F{Status akun aktif?}
    F -->|Tidak aktif| G[Tampilkan pesan akun nonaktif]
    G --> H([Selesai])
    F -->|Aktif| I{Role pengguna?}
    I -->|Admin| J[Dashboard Admin]
    I -->|Guru| K[Dashboard Guru]
    I -->|Orang Tua| L[Dashboard Orang Tua]
    I -->|Kepala Madrasah| M[Dashboard Kepsek]
    J & K & L & M --> H

    style A fill:#4CAF50,color:#fff
    style H fill:#F44336,color:#fff
    style D fill:#FF9800,color:#fff
    style F fill:#FF9800,color:#fff
    style I fill:#2196F3,color:#fff
```

#### 2. Kelola Data — Admin

```mermaid
flowchart TD
    A([Mulai]) --> B[Pilih menu Kelola Data]
    B --> C{Pilih jenis data}
    C -->|Guru| D1[Data Guru]
    C -->|Siswa| D2[Data Siswa]
    C -->|Orang Tua| D3[Data Orang Tua]
    C -->|Akademik| D4[Data Akademik]
    D1 & D2 & D3 & D4 --> E{Pilih aksi}
    E -->|Tambah/Edit| F[Isi / ubah form data]
    F --> G{Data valid?}
    G -->|Tidak| H[Tampilkan pesan kesalahan]
    H --> F
    G -->|Ya| I[Simpan ke database]
    I --> J[Tampilkan notifikasi berhasil]
    E -->|Hapus| K[Hapus data dari database]
    K --> J
    J --> L([Selesai])

    style A fill:#4CAF50,color:#fff
    style L fill:#F44336,color:#fff
    style E fill:#2196F3,color:#fff
    style G fill:#FF9800,color:#fff
```

#### 3. Input Presensi — Guru

```mermaid
flowchart TD
    A([Mulai]) --> B[Pilih menu Input Presensi]
    B --> C[Pilih Kelas]
    C --> D[Pilih Tanggal]
    D --> E[Pilih Jadwal Pelajaran]
    E --> F[Sistem menampilkan daftar siswa]
    F --> G[Isi status kehadiran tiap siswa\nHadir / Sakit / Izin / Alfa]
    G --> H{Semua siswa sudah diisi?}
    H -->|Belum| G
    H -->|Sudah| I[Klik tombol Simpan]
    I --> J{Data valid & lengkap?}
    J -->|Tidak| K[Tampilkan pesan data belum lengkap]
    K --> G
    J -->|Ya| L[Simpan ke database]
    L --> M[Tampilkan notifikasi berhasil]
    M --> N([Selesai])

    style A fill:#4CAF50,color:#fff
    style N fill:#F44336,color:#fff
    style H fill:#FF9800,color:#fff
    style J fill:#FF9800,color:#fff
```

#### 4. Monitoring Presensi — Kepala Madrasah

```mermaid
flowchart TD
    A([Mulai]) --> B[Pilih menu Monitoring Laporan Absensi]
    B --> C[Pilih Kelas]
    C --> D[Pilih Periode]
    D --> E[Sistem menampilkan laporan absensi]
    E --> F[Lihat rekap kehadiran siswa]
    F --> G{Ada siswa sering alpa?}
    G -->|Ya| H[Catat untuk evaluasi]
    G -->|Tidak| I([Selesai])
    H --> I

    style A fill:#4CAF50,color:#fff
    style I fill:#F44336,color:#fff
    style G fill:#FF9800,color:#fff
```

#### 5. Lihat Presensi Anak — Orang Tua

```mermaid
flowchart TD
    A([Mulai]) --> B[Pilih menu Lihat Presensi Anak]
    B --> C[Pilih Periode yang ingin ditampilkan]
    C --> D[Sistem menampilkan data presensi anak]
    D --> E[Lihat status kehadiran per tanggal]
    E --> F{Ingin hubungkan akun anak baru?}
    F -->|Ya| G[Masukkan NISN & Kode Anak]
    G --> H{NISN & kode cocok?}
    H -->|Tidak| I[Tampilkan pesan error]
    I --> G
    H -->|Ya| J[Sistem simpan relasi akun anak]
    J --> K([Selesai])
    F -->|Tidak| K

    style A fill:#4CAF50,color:#fff
    style K fill:#F44336,color:#fff
    style F fill:#2196F3,color:#fff
    style H fill:#FF9800,color:#fff
```

---

### Sequence Diagram

#### 1. Kelola Data — Admin

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Frontend/UI
    participant BE as Backend/Controller
    participant DB as Database

    Admin->>UI: Buka halaman login
    UI->>BE: POST /login (username, password)
    BE->>DB: Cek kredensial & token
    DB-->>BE: Data user + role
    BE-->>UI: Redirect dashboard admin
    UI-->>Admin: Tampilkan dashboard

    Admin->>UI: Pilih menu Kelola Data Siswa
    UI->>BE: GET /siswa
    BE->>DB: Query data siswa
    DB-->>BE: List data siswa
    BE-->>UI: Response data
    UI-->>Admin: Tampilkan tabel data siswa

    Admin->>UI: Tambah / Edit / Hapus data
    UI->>BE: POST/PUT/DELETE /siswa
    BE->>DB: Eksekusi query
    DB-->>BE: Konfirmasi berhasil
    BE-->>UI: Response sukses
    UI-->>Admin: Notifikasi berhasil

    Admin->>UI: Buka menu Kelola Akun Orang Tua
    UI->>BE: GET /akun/pending
    BE->>DB: Query akun pending approval
    DB-->>BE: List akun menunggu
    BE-->>UI: Data akun pending
    UI-->>Admin: Tampilkan list pending
    Admin->>UI: Setujui akun
    UI->>BE: PUT /akun/approve
    BE->>DB: Update status akun
    DB-->>BE: Konfirmasi
    BE-->>UI: Sukses
    UI-->>Admin: Notifikasi akun disetujui
```

#### 2. Input Absensi Siswa — Guru

```mermaid
sequenceDiagram
    actor Guru
    participant UI as Frontend/UI
    participant BE as Backend/Controller
    participant DB as Database

    Guru->>UI: Login dengan kredensial
    UI->>BE: POST /login
    BE->>DB: Validasi kredensial & status akun
    DB-->>BE: Data guru + token
    BE-->>UI: Redirect dashboard guru
    UI-->>Guru: Dashboard guru tampil

    Guru->>UI: Pilih menu Input Presensi
    UI->>BE: GET /kelas/perwalian
    BE->>DB: Query kelas & jadwal hari ini
    DB-->>BE: List kelas & jadwal
    BE-->>UI: Data kelas
    UI-->>Guru: Tampilkan daftar kelas & jadwal

    loop Untuk setiap sesi presensi
        Guru->>UI: Pilih kelas, tanggal, jadwal
        UI->>BE: GET /siswa/kelas/:id
        BE->>DB: Query daftar siswa kelas
        DB-->>BE: List siswa
        BE-->>UI: Data siswa
        UI-->>Guru: Tampilkan form presensi
        Guru->>UI: Isi status kehadiran & simpan
        UI->>BE: POST /presensi
        BE->>DB: Simpan data presensi
        DB-->>BE: Konfirmasi
        BE-->>UI: Sukses
        UI-->>Guru: Notifikasi presensi tersimpan
    end

    Guru->>UI: Edit presensi jika ada koreksi
    UI->>BE: PUT /presensi/:id
    BE->>DB: Update data presensi
    DB-->>BE: Konfirmasi update
    BE-->>UI: Sukses
    UI-->>Guru: Notifikasi presensi diperbarui
```

#### 3. Monitoring Laporan — Kepala Madrasah

```mermaid
sequenceDiagram
    actor Kepsek as Kepala Madrasah
    participant UI as Frontend/UI
    participant BE as Backend/Controller
    participant DB as Database

    Kepsek->>UI: Login
    UI->>BE: POST /login
    BE->>DB: Validasi kredensial
    DB-->>BE: Data kepsek + token
    BE-->>UI: Redirect dashboard kepsek
    UI-->>Kepsek: Dashboard tampil

    UI->>BE: GET /dashboard/summary
    BE->>DB: Query grafik kehadiran & notifikasi
    DB-->>BE: Data ringkasan
    BE-->>UI: Summary data
    UI-->>Kepsek: Tampilkan grafik & notifikasi otomatis

    Kepsek->>UI: Pilih Monitoring per Kelas
    UI->>BE: GET /presensi/rekap?kelas=&periode=
    BE->>DB: Query rekap absensi
    DB-->>BE: Data rekap per kelas
    BE-->>UI: Response data
    UI-->>Kepsek: Tampilkan rekap & siswa sering alpa

    opt Lihat Data Guru / Siswa (read-only)
        Kepsek->>UI: Buka halaman data guru/siswa
        UI->>BE: GET /guru atau GET /siswa
        BE->>DB: Query data (read-only)
        DB-->>BE: Data guru/siswa
        BE-->>UI: Response data
        UI-->>Kepsek: Tampilkan data (tanpa akses edit/hapus)
    end
```

#### 4. Lihat Absensi Anak — Orang Tua

```mermaid
sequenceDiagram
    actor Ortu as Orang Tua
    participant UI as Frontend/UI
    participant BE as Backend/Controller
    participant DB as Database

    Ortu->>UI: Login
    UI->>BE: POST /login
    BE->>DB: Validasi kredensial
    DB-->>BE: Data orang tua + token
    BE-->>UI: Redirect dashboard anak
    UI-->>Ortu: Dashboard tampil

    Ortu->>UI: Pilih Riwayat Absensi
    UI->>BE: GET /presensi/anak?filter=tanggal
    BE->>DB: Query presensi anak berdasarkan filter
    DB-->>BE: Data riwayat kehadiran
    BE-->>UI: Response data
    UI-->>Ortu: Tampilkan riwayat absensi anak

    Ortu->>UI: Buka menu Pengumuman
    UI->>BE: GET /pengumuman
    BE->>DB: Query pengumuman sekolah
    DB-->>BE: List pengumuman
    BE-->>UI: Response data
    UI-->>Ortu: Tampilkan pengumuman

    opt Hubungkan Akun Anak Baru
        Ortu->>UI: Masukkan NISN & Kode Anak
        UI->>BE: POST /anak/link (NISN, kode_anak)
        BE->>DB: Validasi NISN & kode
        alt NISN & kode cocok dan belum terpakai
            DB-->>BE: Valid
            BE->>DB: Simpan relasi orang tua - anak
            DB-->>BE: Konfirmasi
            BE-->>UI: Sukses
            UI-->>Ortu: Notifikasi anak berhasil ditautkan
        else Kode salah atau NISN sudah terpakai
            DB-->>BE: Invalid
            BE-->>UI: Error message
            UI-->>Ortu: Tampilkan pesan error
        end
    end
```

---

### Class Diagram

```mermaid
classDiagram
    class Role {
        +id
        +nama_role
        +created_at
    }

    class User {
        +id
        +username
        +email
        +password
        +role_id
        +status
        +login()
        +logout()
    }

    class UserOperator {
        +id
        +user_id
        +nama_lengkap
        +nip
    }

    class UserGuru {
        +id
        +user_id
        +guru_id
    }

    class UserKepsek {
        +id
        +user_id
        +nama_lengkap
        +nip
    }

    class UserOrtu {
        +id
        +user_id
        +ortu_id
    }

    class Guru {
        +id
        +nuptk
        +nip
        +nama
        +jenis_kelamin
        +no_telp
        +created_at
    }

    class Siswa {
        +id
        +nisn
        +nis
        +nama
        +jenis_kelamin
        +tanggal_lahir
        +kode_anak
        +created_at
    }

    class OrangTua {
        +id
        +nama
        +no_telp
        +alamat
        +created_at
    }

    class OrangTuaDokumen {
        +id
        +ortu_id
        +jenis_dokumen
        +file_path
    }

    class TahunAjaran {
        +id
        +nama
        +tahun_mulai
        +tahun_selesai
        +is_aktif
    }

    class Kelas {
        +id
        +nama_kelas
        +tingkat
        +kuota
        +kurikulum
        +wali_kelas_id
        +tahun_ajaran_id
    }

    class SiswaKelas {
        +id
        +siswa_id
        +kelas_id
        +tahun_ajaran_id
        +no_absen
        +status
    }

    class MataPelajaran {
        +id
        +nama
        +kode
        +created_at
    }

    class JadwalPelajaran {
        +id
        +kelas_id
        +mapel_id
        +guru_id
        +hari
        +jam_mulai
        +jam_selesai
    }

    class Absensi {
        +id
        +siswa_kelas_id
        +jadwal_id
        +tanggal
        +status
        +keterangan
        +dicatat_oleh
        +created_at
    }

    class Pengumuman {
        +id
        +judul
        +isi
        +penulis_id
        +created_at
    }

    class KalenderAkademik {
        +id
        +judul
        +tanggal_mulai
        +tanggal_selesai
        +keterangan
    }

    class Pengaturan {
        +id
        +key
        +value
    }

    Role "1" --> "many" User
    User "1" --> "0..1" UserOperator
    User "1" --> "0..1" UserGuru
    User "1" --> "0..1" UserKepsek
    User "1" --> "0..1" UserOrtu
    UserGuru --> Guru
    UserOrtu --> OrangTua
    OrangTua "1" --> "many" OrangTuaDokumen
    OrangTua "many" --> "many" Siswa
    Guru "1" --> "many" Kelas : wali kelas
    TahunAjaran "1" --> "many" Kelas
    Kelas "1" --> "many" SiswaKelas
    Siswa "1" --> "many" SiswaKelas
    Kelas "1" --> "many" JadwalPelajaran
    MataPelajaran "1" --> "many" JadwalPelajaran
    Guru "1" --> "many" JadwalPelajaran
    SiswaKelas "1" --> "many" Absensi
    JadwalPelajaran "1" --> "many" Absensi
    User "1" --> "many" Pengumuman : penulis
```

---

## ⚙️ Metode Pengembangan

Sistem dikembangkan menggunakan **metode Waterfall** — terstruktur dan bertahap, cocok karena kebutuhan sistem sudah ditentukan sejak awal.

```mermaid
flowchart LR
    A["1️⃣ Analisis\nKebutuhan"] --> B["2️⃣ Perancangan\nSistem"]
    B --> C["3️⃣ Implementasi\nSistem"]
    C --> D["4️⃣ Pengujian\nSistem"]
    D --> E["5️⃣ Pemeliharaan\nSistem"]

    style A fill:#1565C0,color:#fff
    style B fill:#283593,color:#fff
    style C fill:#4527A0,color:#fff
    style D fill:#6A1B9A,color:#fff
    style E fill:#880E4F,color:#fff
```

| Tahap | Keterangan |
|-------|-----------|
| **1. Analisis** | Identifikasi kebutuhan: kelola data guru, siswa, orang tua, input presensi, monitoring, akses orang tua |
| **2. Perancangan** | Use Case, Activity, Sequence, Class Diagram + rancangan antarmuka |
| **3. Implementasi** | Pembangunan aplikasi web (Laravel + React + MySQL) |
| **4. Pengujian** | Black Box Testing pada seluruh fitur utama |
| **5. Pemeliharaan** | Perbaikan bug & pengembangan fitur ke depan |

---

## 🧪 Pengujian Sistem

Metode pengujian: **Black Box Testing** — fokus pada fungsionalitas dari sisi pengguna.

### Flow Graph — Login

```mermaid
flowchart TD
    N1([Start]) --> N2[Buka form login]
    N2 --> N3[Input username & password]
    N3 --> N4{Validasi input}
    N4 -->|Input kosong/format salah| N5[Tampilkan pesan validasi]
    N5 --> N3
    N4 -->|Input valid| N6{Cek kredensial di DB}
    N6 -->|Kredensial salah| N7[Tampilkan pesan kredensial salah]
    N7 --> N3
    N6 -->|Kredensial benar| N8{Cek status akun}
    N8 -->|Nonaktif/pending| N9[Tampilkan pesan akun nonaktif]
    N9 --> N10([End])
    N8 -->|Aktif| N11[Generate session/token]
    N11 --> N12[Redirect ke dashboard sesuai role]
    N12 --> N10

    style N1 fill:#4CAF50,color:#fff
    style N10 fill:#F44336,color:#fff
    style N4 fill:#FF9800,color:#fff
    style N6 fill:#FF9800,color:#fff
    style N8 fill:#FF9800,color:#fff
```

### Flow Graph — Input Presensi

```mermaid
flowchart TD
    N1([Start]) --> N2[Guru buka menu Input Presensi]
    N2 --> N3[Pilih kelas & tanggal]
    N3 --> N4[Sistem tampilkan daftar siswa]
    N4 --> N5[Guru isi status kehadiran]
    N5 --> N6[Klik Simpan]
    N6 --> N7{Semua siswa sudah diisi?}
    N7 -->|Belum lengkap| N8[Tampilkan pesan data belum lengkap]
    N8 --> N5
    N7 -->|Lengkap| N9{Validasi data}
    N9 -->|Tidak valid| N10[Tampilkan pesan error]
    N10 --> N5
    N9 -->|Valid| N11[Simpan presensi ke database]
    N11 --> N12[Tampilkan notifikasi berhasil]
    N12 --> N13([End])

    style N1 fill:#4CAF50,color:#fff
    style N13 fill:#F44336,color:#fff
    style N7 fill:#FF9800,color:#fff
    style N9 fill:#FF9800,color:#fff
```

### Hasil Black Box Testing

| # | Fitur | Skenario | Hasil yang Diharapkan | Status |
|---|-------|----------|-----------------------|--------|
| 1 | Login | Input username & password valid | Masuk ke dashboard sesuai role | ✅ Valid |
| 2 | Login | Input username/password salah | Muncul pesan "kredensial salah" | ✅ Valid |
| 3 | Login | Akun belum diapprove/nonaktif | Muncul pesan "akun nonaktif" | ✅ Valid |
| 4 | Kelola Data Guru | Admin tambah data guru lengkap | Data guru berhasil disimpan | ✅ Valid |
| 5 | Kelola Data Guru | Admin kosongkan field wajib | Sistem tampilkan pesan data belum lengkap | ✅ Valid |
| 6 | Kelola Data Siswa | Admin ubah data siswa | Perubahan data berhasil disimpan | ✅ Valid |
| 7 | Kelola Data Orang Tua | Admin hapus data orang tua | Data berhasil dihapus dari sistem | ✅ Valid |
| 8 | Input Presensi | Guru isi semua status & simpan | Data presensi berhasil disimpan | ✅ Valid |
| 9 | Input Presensi | Guru belum isi semua status | Sistem tampilkan pesan data belum lengkap | ✅ Valid |
| 10 | Monitoring Presensi | Kepsek buka halaman monitoring | Sistem tampilkan data presensi seluruh siswa | ✅ Valid |
| 11 | Lihat Presensi Anak | Orang tua buka data presensi anak | Sistem tampilkan riwayat kehadiran anak | ✅ Valid |

> 🎉 **Seluruh 11 fitur utama** dinyatakan berfungsi dengan baik sesuai kebutuhan fungsional sistem.

---

## ✨ Fitur Utama

- 🔐 **Autentikasi berbasis role** — Admin, Guru, Kepala Madrasah, Orang Tua
- 📝 **Input & edit presensi** oleh guru secara digital (Hadir / Sakit / Izin / Alfa)
- 📊 **Dashboard monitoring** dengan grafik & rekap kehadiran per kelas
- 👨‍👩‍👧 **Portal orang tua** — pantau kehadiran anak secara real-time + filter tanggal
- 🔗 **Link akun anak** via NISN + kode unik siswa (`kode_anak`)
- 📢 **Pengumuman sekolah** & **kalender akademik**
- 🗄️ **Pengelolaan data lengkap** — guru, siswa, orang tua, kelas, jadwal, tahun ajaran

---

<div align="center">

**MI Nurul Huda 3** — Kp. Kencana, RT 01/RW 02, Kel. Kencana, Kec. Tanah Sareal, Kota Bogor

*Rekayasa Perangkat Lunak — Teknik Informatika 4.B.1*

</div>


## 📁 Struktur Proyek

```
Tugas_UAS_RPL_1/
│
├── 📂 backend/                     # Laravel 12 API
│   ├── 📂 app/
│   │   ├── 📂 Http/Controllers/
│   │   │   ├── 📂 Absensi/         # AbsensiController
│   │   │   ├── 📂 Auth/            # AuthController
│   │   │   ├── 📂 Guru/            # GuruController
│   │   │   ├── 📂 Kepsek/          # KepsekController
│   │   │   ├── 📂 MasterData/      # Data master
│   │   │   ├── 📂 Operator/        # OperatorController
│   │   │   ├── 📂 Ortu/            # OrtuController
│   │   │   ├── GaleriController.php
│   │   │   └── PengumumanController.php
│   │   └── 📂 Models/
│   │       ├── Absensi.php
│   │       ├── Guru.php
│   │       ├── JadwalPelajaran.php
│   │       ├── Kelas.php
│   │       ├── MataPelajaran.php
│   │       ├── OrangTua.php
│   │       ├── Pengumuman.php
│   │       ├── Siswa.php
│   │       ├── SiswaKelas.php
│   │       ├── TahunAjaran.php
│   │       └── User.php
│   ├── 📂 database/migrations/
│   └── 📂 routes/
│
└── 📂 frontend/                    # React + Vite SPA
    └── 📂 src/
        ├── 📂 pages/
        │   ├── 📂 operator/        # Halaman Operator
        │   ├── 📂 guru/            # Halaman Guru
        │   ├── 📂 kepsek/          # Halaman Kepala Sekolah
        │   ├── 📂 ortu/            # Halaman Orang Tua
        │   ├── 📂 auth/            # Login dan Register
        │   └── 📂 public/          # Gallery, About, Contact
        ├── 📂 components/          # Reusable components
        ├── 📂 contexts/            # React Context AuthContext
        ├── 📂 hooks/               # Custom hooks
        ├── 📂 routes/              # ProtectedRoute component
        └── App.jsx                 # Root routing
```

---

## 🚀 Instalasi & Menjalankan

### Prasyarat

- PHP >= 8.2
- Composer
- Node.js >= 18.x & npm
- MySQL 8.x

### 1. Clone Repository

```bash
git clone https://github.com/username/Tugas_UAS_RPL_1.git
cd Tugas_UAS_RPL_1
```

### 2. Setup Backend (Laravel)

```bash
cd backend

# Install dependencies
composer install

# Copy file environment
cp .env.example .env

# Generate application key
php artisan key:generate

# Konfigurasi database di .env
# DB_DATABASE=siakad
# DB_USERNAME=root
# DB_PASSWORD=

# Jalankan migrasi database
php artisan migrate

# (Opsional) Jalankan seeder
php artisan db:seed

# Jalankan server backend
php artisan serve
```

### 3. Setup Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Copy file environment
cp .env.example .env

# Konfigurasi URL API di .env
# VITE_API_URL=http://localhost:8000/api

# Jalankan dev server
npm run dev
```

### 4. Akses Aplikasi

| Layanan | URL |
|---------|-----|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:8000` |

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/login` | Login pengguna |
| `POST` | `/api/logout` | Logout pengguna |
| `POST` | `/api/register-ortu` | Registrasi akun orang tua |

### Absensi (Guru)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/absensi/jadwal/{id_kelas}` | Jadwal hari ini |
| `GET` | `/api/absensi/kelas/{id_kelas}` | Daftar siswa + status absensi |
| `POST` | `/api/absensi/store` | Submit absensi |
| `PUT` | `/api/absensi/{id}` | Edit absensi satu siswa |
| `GET` | `/api/absensi/rekap/{id_kelas}` | Rekap absensi per kelas |

### Master Data (Operator)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET/POST` | `/api/guru` | List & tambah guru |
| `GET/PUT/DELETE` | `/api/guru/{nuptk}` | Detail, edit, hapus guru |
| `GET/POST` | `/api/siswa` | List & tambah siswa |
| `GET/PUT/DELETE` | `/api/siswa/{nisn}` | Detail, edit, hapus siswa |
| `GET/POST` | `/api/kelas` | List & tambah kelas |
| `GET/POST` | `/api/jadwal-pelajaran` | List & tambah jadwal |

### Orang Tua

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/ortu/anak` | Daftar anak yang terdaftar |
| `GET` | `/api/absensi/siswa/{nisn}` | Riwayat absensi anak |

---


## 👥 Kelompok 1 — UAS Rekayasa Perangkat Lunak

| No | Nama | NIM | Peran |
|----|------|-----|-------|
| 1 | Muhammad Sahal Anwar Hadi | 24260032 | Backend, Flowchart, Waterfall |
| 2 | Shela Rahma Fitri | 24260012 | Database, Use Case, Activity Diagram |
| 3 | Abin Maulana Aksa | 24260029 | Pengujian Sistem, Black Box Testing |
| 4 | Muhamad Khoerul | 24260049 | Frontend, Class Diagram, Sequence Diagram |

> **Prodi:** Teknik Informatika &nbsp;|&nbsp; **Kelas:** 4.B.1 &nbsp;|&nbsp; **Mata Kuliah:** Rekayasa Perangkat Lunak


---

<div align="center">

**⭐ Jika proyek ini membantu, jangan lupa berikan bintang! ⭐**

---

*Dibuat dengan ❤️ menggunakan Laravel & React*

</div>
