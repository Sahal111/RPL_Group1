# Rencana Implementasi: Perbaikan Rekap Absensi (Kombinasi Harian & Mapel)

Kita akan menerapkan 3 aturan yang Anda sebutkan di halaman **Rekap Absensi**.

## 1. Perubahan di Backend (AbsensiController)
Saat ini `AbsensiController@rekap` hanya mengembalikan total absensi per mata pelajaran secara mentah. Kita akan mengubah *endpoint* ini agar mengembalikan dua jenis rekap sekaligus:
* **`rekap_mapel`**: Hitungan total kehadiran berdasarkan jumlah pertemuan/mata pelajaran.
* **`rekap_harian`**: Hitungan total kehadiran berdasarkan hari efektif (dengan aturan mayoritas 50%).
* **Logika 50% Hadir**: 
  1. Data ditarik dan dikelompokkan per hari.
  2. Dihitung rasio "Hadir" pada hari itu. Jika >= 50%, maka status hariannya adalah `Hadir`.
  3. Jika rasio Hadir < 50%, akan dicari status non-Hadir yang paling dominan (Sakit/Izin/Alpa).
  4. Jika status hariannya `Hadir`, tapi ada jam pelajaran yang Alpa, akan ada flag `bolos_jam_pelajaran = true`.

## 2. Perubahan di Frontend (RekapAbsensiGuru.jsx)
Kita akan menambahkan Tab/Mode pada antarmuka agar Guru bisa berpindah pandangan:
1. **Pilihan Mode**: Akan ada dua tombol (seperti tab) "Mode Harian" dan "Mode Per Mata Pelajaran".
2. **Penanda Bolos**: Jika dalam Mode Harian seorang siswa memiliki status bolos jam pelajaran, namanya akan diberi penanda visual (ikon peringatan/warna oranye).
3. **Ekspor PDF & Excel**:
   - Jika saat ini berada di Tab "Mode Harian", maka *library* ekspor akan menyalin data dari state `rekap_harian`.
   - Jika berada di Tab "Mode Mapel", maka data yang diekspor berasal dari state `rekap_mapel`.

## Verifikasi
- Mengisi absensi pada 3 mata pelajaran di hari yang sama untuk seorang siswa: 2 Hadir, 1 Alpa.
- Mengakses Rekap Absensi Mode Harian: Harusnya dihitung 1 Hadir, tapi muncul ikon peringatan bolos.
- Mengakses Rekap Absensi Mode Mapel: Harusnya dihitung 2 Hadir, 1 Alpa.
- Mengunduh PDF/Excel untuk memastikan isinya sesuai.

Silakan klik **Proceed** jika Anda menyetujui rencana perombakan logika ini!
