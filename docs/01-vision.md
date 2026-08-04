# 01 · Vision & Mission

---

## Vision

Membangun platform SIAKAD (Sistem Informasi Akademik) berbasis cloud yang dapat di-deploy di ribuan madrasah dan sekolah Islam di Indonesia — dengan konfigurasi yang berbeda per sekolah, tanpa perlu membangun ulang sistem dari awal.

---

## Mission

1. **Menggantikan pencatatan manual** di madrasah dengan sistem digital yang mudah dipakai oleh operator yang tidak punya latar belakang IT.

2. **Menyediakan data yang akurat** untuk kebutuhan pelaporan ke Dapodik, EMIS, dan instansi terkait — sehingga operator tidak perlu entry data dua kali.

3. **Memberi akses real-time** kepada kepala sekolah, guru, orang tua, dan bendahara sesuai peran masing-masing.

4. **Menjadi platform yang bisa dikembangkan** — bukan aplikasi monolitik yang sulit diubah, tapi fondasi yang bisa ditambah modul baru (Perpustakaan, Asrama, Koperasi, dsb) tanpa merombak ulang.

---

## Target User

| Role | Siapa | Kebutuhan Utama |
|---|---|---|
| Operator | Staf TU / admin sekolah | Kelola semua master data, akun, dokumen |
| Kepala Sekolah | Kepala Madrasah | Monitor data, approve dokumen, lihat laporan |
| Guru | Guru kelas / mata pelajaran | Input absensi, lihat jadwal, kelola dokumen diri |
| Wali Kelas | Guru yang jadi wali kelas | Semua hak guru + catatan perkembangan siswa |
| Bendahara | Petugas keuangan | Tagihan, pembayaran, laporan keuangan |
| Orang Tua | Wali siswa | Monitor absensi anak, lihat pengumuman |
| Admin PPDB | Petugas penerimaan siswa | Kelola pendaftaran dan seleksi calon siswa |
| Platform Admin | Tim SIAKAD (internal) | Kelola semua sekolah, paket, monitoring |

---

## Scope Saat Ini (MVP)

- Manajemen akun dan autentikasi per sekolah
- Master data guru (lengkap — identitas, kepegawaian, dokumen, mutasi, PKG, dll)
- Master data siswa (lengkap — identitas, orang tua, riwayat kelas, berkas)
- Master data kelas, mata pelajaran, jadwal, tahun ajaran
- Input dan rekap absensi siswa
- Document Management System (DMS) untuk guru
- Portal orang tua (absensi anak, pengumuman)
- Dashboard per role

## Out of Scope Saat Ini

- Nilai dan rapor (Phase 2 akademik)
- Keuangan dan tagihan SPP (Phase 3)
- PPDB online (Phase 4)
- Integrasi Dapodik dan EMIS (Phase 5)
- Plugin sistem (Phase 6+)

---

## Prinsip Pengembangan

**Jangan tambah fitur baru sebelum fitur yang ada benar-benar solid.**

Setiap fitur yang sudah berjalan harus:
- Punya validasi yang proper (Form Request)
- Punya response yang konsisten (ApiResponse trait)
- Tidak punya N+1 query
- Aman dari mass assignment
- Punya permission check yang benar

Lebih baik 5 fitur yang solid daripada 20 fitur yang rapuh.
