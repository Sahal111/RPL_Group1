# Fitur Data Siswa untuk Kepsek

## Deskripsi
Fitur ini memungkinkan Kepala Sekolah (Kepsek) untuk melihat daftar lengkap siswa dan detail informasi setiap siswa dalam sistem.

## Fitur yang Ditambahkan

### Backend (Laravel)

#### Controller: `KepsekController.php`
Ditambahkan method baru:

1. **`daftarSiswa(Request $request)`**
   - Endpoint: `GET /api/kepsek/siswa`
   - Menampilkan daftar siswa dengan pagination
   - Filter yang tersedia:
     - Search (nama, NISN, NIK)
     - Kelas (`id_kelas`)
     - Status Peserta Didik (`status_pd`)
     - Jenis Kelamin (`jenis_kelamin`)
   - Response mencakup informasi kelas aktif siswa

2. **`detailSiswa($nisn)`**
   - Endpoint: `GET /api/kepsek/siswa/{nisn}`
   - Menampilkan detail lengkap siswa:
     - Data pribadi siswa
     - Data orang tua (Ayah, Ibu, Wali)
     - Kelas aktif dan informasi akademik
     - Riwayat kelas
     - Statistik absensi (Hadir, Sakit, Izin, Alpa, Persentase Kehadiran)

3. **`daftarKelasFilter()`**
   - Endpoint: `GET /api/kepsek/kelas-filter`
   - Menampilkan daftar kelas untuk keperluan filter
   - Hanya kelas aktif yang ditampilkan

#### Routes
Ditambahkan routes di `api.php`:
```php
Route::middleware('role:kepsek')->prefix('kepsek')->group(function () {
    // ... routes lain
    Route::get('/siswa', [KepsekController::class, 'daftarSiswa']);
    Route::get('/siswa/{nisn}', [KepsekController::class, 'detailSiswa']);
    Route::get('/kelas-filter', [KepsekController::class, 'daftarKelasFilter']);
});
```

#### Model Update
- **`Kelas.php`**: Diperbaiki relasi `tahunAjaran()` untuk menggunakan model TahunAjaran

### Frontend (React)

#### Halaman Baru

1. **`DataSiswaKepsek.jsx`**
   - Path: `/kepsek/siswa`
   - Fitur:
     - Tabel daftar siswa dengan informasi:
       - Foto dan nama siswa
       - NISN
       - Kelas dan tingkat
       - No. Absen
       - Jenis Kelamin
       - Status (Aktif, Mutasi, Lulus, Keluar)
     - Filter multiple:
       - Search box (nama, NISN, NIK)
       - Filter berdasarkan kelas
       - Filter berdasarkan status peserta didik
       - Filter berdasarkan jenis kelamin
     - Tombol reset filter
     - Pagination otomatis
     - Klik row atau tombol detail untuk melihat detail siswa

2. **`DetailSiswaKepsek.jsx`**
   - Path: `/kepsek/siswa/{nisn}`
   - Fitur:
     - Layout 2 kolom (kolom utama 2/3, kolom kanan 1/3)
     - **Kolom Kiri:**
       - Foto profil siswa
       - Data Pribadi (NISN, NIK, No. Induk, Kode Anak, dll)
       - Alamat lengkap
       - Data Akademik (Asal sekolah, tanggal masuk, kelas aktif, wali kelas)
       - Riwayat Kelas (semua kelas yang pernah diikuti)
     - **Kolom Kanan:**
       - Statistik Absensi:
         - Persentase kehadiran
         - Total hari efektif
         - Detail Hadir, Sakit, Izin, Alpa
       - Data Orang Tua:
         - Informasi Ayah (nama, NIK, HP, pekerjaan, pendidikan, penghasilan)
         - Informasi Ibu (nama, NIK, HP, pekerjaan, pendidikan, penghasilan)
         - Informasi Wali (jika ada)
     - Tombol kembali ke daftar siswa

#### Layout Update
- **`KepsekLayout.jsx`**: Ditambahkan menu "Data Siswa" dengan icon GraduationCap

#### Routing Update
- **`App.jsx`**: Ditambahkan routes untuk:
  - `/kepsek/siswa` → DataSiswaKepsek
  - `/kepsek/siswa/:nisn` → DetailSiswaKepsek

## Cara Menggunakan

### Untuk Kepsek:

1. **Melihat Daftar Siswa:**
   - Login sebagai Kepsek
   - Klik menu "Data Siswa" di sidebar
   - Gunakan filter untuk mencari siswa tertentu:
     - Ketik nama/NISN/NIK di search box
     - Pilih kelas tertentu dari dropdown
     - Filter berdasarkan status atau jenis kelamin
   - Klik baris siswa atau tombol mata untuk melihat detail

2. **Melihat Detail Siswa:**
   - Dari halaman daftar, klik siswa yang ingin dilihat
   - Lihat informasi lengkap siswa
   - Scroll untuk melihat riwayat kelas
   - Periksa statistik absensi di kolom kanan
   - Lihat data orang tua/wali siswa
   - Klik tombol panah kiri untuk kembali ke daftar

## Keamanan
- Hanya role `kepsek` yang dapat mengakses endpoint ini (middleware role)
- Data bersifat read-only, Kepsek tidak dapat mengubah data siswa
- Authentication menggunakan Laravel Sanctum

## Teknologi
- **Backend:** Laravel 11, PHP 8.2+
- **Frontend:** React 18, React Query (TanStack Query), React Router, Tailwind CSS
- **Icons:** Lucide React

## Catatan Pengembangan
- Relasi orang tua menggunakan struktur data yang terpisah (ayah, ibu, wali) dalam satu tabel `orang_tua`
- Data kelas aktif diambil dari `siswa_kelas` dengan kondisi `status_keluar IS NULL`
- Statistik absensi dihitung dari tanggal masuk siswa di kelas aktif sampai sekarang
- Foto siswa disimpan di storage Laravel dan diakses melalui public storage link
