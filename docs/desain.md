# DESAIN.md

## Design Guideline Sistem Informasi Madrasah MI Nurul Huda 3

---

# Filosofi Desain

Website ini **bukan website sekolah biasa**, melainkan sebuah **School Management System (SMS)** modern yang setara dengan aplikasi profesional.

Target desain:

* Bersih
* Elegan
* Profesional
* Modern
* Cepat digunakan
* Mudah dipahami semua umur
* Tidak terlihat seperti template AI
* Tidak terlalu banyak warna
* Fokus pada data

Inspirasi:

* Notion
* Linear
* Stripe Dashboard
* Vercel Dashboard
* Google Workspace Admin
* Framer Dashboard

---

# Tema Utama

Karena ini Madrasah, gunakan nuansa Islami modern.

Warna utama tetap identitas sekolah tetapi tidak norak.

Primary

Hijau Emerald

#15803D

Secondary

Hijau Muda

#DCFCE7

Accent

Emas

#D4AF37

Danger

#DC2626

Warning

#F59E0B

Info

#2563EB

Success

#16A34A

Background

#F8FAFC

Surface

#FFFFFF

Border

#E5E7EB

Text Primary

#111827

Text Secondary

#6B7280

---

# Dark Mode

Background

#0F172A

Card

#1E293B

Border

#334155

Text

#F8FAFC

Accent tetap menggunakan hijau.

---

# Typography

Gunakan:

Inter

atau

Plus Jakarta Sans

Ukuran

Heading

32

Sub Heading

24

Section

18

Body

15-16

Caption

13

Jangan menggunakan font dekoratif.

---

# Radius

Semua komponen menggunakan radius konsisten.

Card

18px

Button

12px

Input

12px

Modal

20px

Dropdown

14px

---

# Shadow

Gunakan shadow lembut.

Tidak boleh shadow hitam pekat.

Gunakan

shadow-sm

shadow-md

hindari shadow-xl kecuali modal.

---

# Layout

Sidebar

280px

Header

72px

Content

Responsive

Maksimal lebar konten

1600px

Gunakan spacing 24px.

---

# Sidebar

Sidebar minimalis.

Logo Madrasah di atas.

Menu memiliki icon outline.

Menu aktif menggunakan:

Background hijau muda

Icon hijau

Text hijau tua

Hover cukup berubah background.

Tidak menggunakan gradient.

---

# Header

Header selalu berisi

Search

Breadcrumb

Notifikasi

Quick Action

Profile

Jam realtime

Tahun ajaran aktif

---

# Dashboard

Dashboard bukan kumpulan kotak.

Gunakan hirarki informasi.

Urutan:

Selamat Datang

Ringkasan

Grafik

Aktivitas

Quick Action

Pengumuman

Statistik

---

# Card

Card menggunakan:

Background putih

Radius besar

Border tipis

Shadow ringan

Padding 24px

Tidak memakai gradient.

---

# Button

Primary

Hijau

Secondary

Putih dengan border

Danger

Merah

Ghost

Transparan

Icon Button

Kotak kecil radius 10px.

---

# Table

Modern Data Table.

Harus memiliki

Search

Sorting

Filter

Column Visibility

Pagination

Export

Import

Bulk Action

Sticky Header

Hover Row

Rounded

Row Height nyaman.

---

# Form

Label di atas input.

Gunakan validasi realtime.

Field wajib diberi tanda merah kecil.

Error tampil tepat di bawah field.

---

# Icon

Gunakan Lucide Icon.

Semua icon outline.

Ukuran

20px

atau

22px.

---

# Animasi

Animasi hanya seperlunya.

Hover

150ms

Dropdown

200ms

Modal

250ms

Sidebar

250ms

Tidak memakai animasi berlebihan.

---

# Dashboard Operator

Fokus:

Monitoring seluruh sistem.

Widget

Jumlah siswa

Jumlah guru

Jumlah kelas

Jumlah mapel

Data belum lengkap

Sinkronisasi

Aktivitas terakhir

Grafik siswa

Grafik guru

Quick Menu

Import

Export

Backup

Restore

Audit Log

---

# Dashboard Kepala Sekolah

Lebih fokus pada informasi.

Tidak banyak tombol.

Widget

Total Guru

Total Siswa

Presensi Hari Ini

Prestasi

Keuangan

Grafik

Ringkasan Akademik

Pengumuman

Agenda

Approval

---

# Dashboard Guru

Fokus pada pekerjaan hari ini.

Widget

Mengajar Hari Ini

Absensi

Nilai Belum Diisi

Tugas

Jadwal

Pengingat

Quick Input Nilai

Quick Absensi

---

# Dashboard Wali Kelas

Widget

Jumlah Murid

Kehadiran

Pelanggaran

Prestasi

Catatan

Pesan Orang Tua

Approval Surat

Ranking

---

# Dashboard Admin PPDB

Widget

Pendaftar Baru

Sudah Diverifikasi

Belum Diverifikasi

Lulus

Cadangan

Pembayaran

Statistik Asal Sekolah

Export

Import

---

# Dashboard Orang Tua

Desain lebih sederhana.

Widget

Foto Anak

Status Kehadiran

Nilai Terbaru

Tagihan

Pengumuman

Pesan Guru

Jadwal

Kalender Akademik

---

# Grafik

Gunakan

Line Chart

Bar Chart

Area Chart

Donut Chart

Tidak memakai pie chart klasik.

---

# Empty State

Harus ramah.

Icon besar.

Tulisan singkat.

Contoh

"Belum ada data."

Disertai tombol aksi.

---

# Loading

Gunakan Skeleton Loader.

Jangan spinner penuh layar.

---

# Notification

Toast kanan atas.

Maksimal 4 detik.

Tidak mengganggu pekerjaan.

---

# Responsive

Desktop

Laptop

Tablet

Mobile

Sidebar berubah menjadi Drawer.

---

# Prinsip UX

1. Maksimal tiga klik menuju fitur penting.

2. Semua aksi penting memiliki konfirmasi.

3. Warna bukan satu-satunya indikator status.

4. Semua halaman memiliki breadcrumb.

5. Konsisten pada seluruh role.

6. Hindari popup berlebihan.

7. Prioritaskan kecepatan input data.

8. Dashboard harus dapat dipahami dalam waktu kurang dari 10 detik.

---

# Komponen Wajib

Button

Input

Textarea

Select

Autocomplete

Date Picker

Time Picker

Badge

Chip

Avatar

Breadcrumb

Tabs

Accordion

Modal

Drawer

Tooltip

Popover

Dropdown

Toast

Alert

Progress

Calendar

Timeline

Kanban (opsional)

Data Table

Pagination

Search Box

Stat Card

Chart Card

Activity Card

Announcement Card

Quick Action Card

---

# Kesan Akhir

Ketika pengguna pertama kali membuka sistem ini, kesan yang harus muncul adalah:

"Bukan seperti website sekolah biasa, tetapi seperti aplikasi SaaS profesional yang modern, cepat, rapi, dan nyaman digunakan setiap hari, dengan identitas visual Madrasah yang elegan dan tidak berlebihan."
