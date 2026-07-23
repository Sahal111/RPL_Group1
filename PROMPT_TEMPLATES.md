# 🧠 Prompt Templates — minurulhuda3

> Simpan file ini, copy-paste sesuai kebutuhan di opencode

---

## 🐛 TEMPLATE 1: Nganuin Bug / Error

```
📋 CONTEXT — BACA DULU SEBELUM APAPUN:
- Baca CLAUDE.md di root project ini
- Jangan ubah file yang ada di section COMPLETED
- Fokus HANYA pada bug ini, jangan refactor hal lain

🐛 BUG REPORT:
- File/halaman bermasalah : [contoh: halaman login / OperatorSidebar.jsx]
- Role yang terdampak     : [contoh: Operator / Guru / semua role]
- Error message           : [paste error dari console/terminal]
- Langkah reproduce       :
  1. [langkah 1]
  2. [langkah 2]
  3. [error muncul]
- Expected behavior       : [seharusnya terjadi apa]
- Actual behavior         : [yang terjadi sekarang apa]

📁 FILE YANG DIDUGA BERMASALAH:
- [contoh: frontend/src/api/operator.js]
- [contoh: frontend/src/components/operator/ModalFormSiswa.jsx]

🎯 INSTRUKSI:
1. Baca file yang bermasalah dulu, jangan langsung edit
2. Identifikasi root cause, bukan hanya symptom-nya
3. Jelaskan ke saya apa penyebabnya sebelum mulai fix
4. Fix HANYA baris/fungsi yang bermasalah
5. Jangan ubah logic/struktur file lain yang tidak berkaitan
6. Setelah fix, jelaskan apa yang diubah dan kenapa
```

---

## ✨ TEMPLATE 2: Tambah Fitur Baru

```
📋 CONTEXT — BACA DULU SEBELUM APAPUN:
- Baca CLAUDE.md di root project ini
- Jangan ubah file yang ada di section COMPLETED
- Jangan install dependency baru tanpa tanya ke saya dulu

✨ FITUR BARU:
- Nama fitur     : [contoh: Export laporan siswa ke PDF]
- Role yang pakai: [contoh: Operator]
- Lokasi di UI   : [contoh: halaman daftar siswa, tombol di kanan atas]

📝 DESKRIPSI FITUR:
[Jelaskan fitur secara singkat]
[Contoh: Operator bisa export daftar siswa aktif ke file PDF.
PDF berisi: nama, NIS, kelas, status. Ada tombol "Export PDF" di halaman /operator/siswa]

🔗 INTEGRASI:
- API endpoint yang dipakai : [contoh: GET /api/siswa/export atau buat baru]
- Komponen yang dimodifikasi: [contoh: hanya tambah tombol di SiswaPage.jsx]
- File baru yang perlu dibuat: [contoh: src/components/operator/ExportSiswa.jsx]

🎯 INSTRUKSI:
1. Baca CLAUDE.md dan file terkait dulu
2. Buat rencana implementasi — jelaskan ke saya dulu sebelum coding
3. Tunggu konfirmasi saya sebelum mulai nulis kode
4. Buat file BARU untuk fitur ini, jangan menumpuk di file yang sudah ada
5. Kalau perlu modifikasi file lama, tanya ke saya dulu file mana yang akan diubah
6. Jangan ubah routing di App.jsx tanpa konfirmasi
7. Setelah selesai, update section IN PROGRESS / COMPLETED di CLAUDE.md
```

---

## 🔄 TEMPLATE 3: Review Sebelum Commit

```
📋 CONTEXT:
- Baca CLAUDE.md di root project ini

🔍 REVIEW REQUEST:
Saya baru selesai mengerjakan: [nama fitur/bugfix]

File yang diubah:
- [file 1]
- [file 2]

Tolong lakukan:
1. Review semua file yang saya ubah
2. Cek apakah ada file di COMPLETED yang tidak sengaja ikut berubah
3. Cek apakah ada potensi bug baru dari perubahan ini
4. Cek konsistensi dengan konvensi kode yang sudah ada
5. Beri skor 1-10 dan saran perbaikan kalau perlu

Jangan ubah apapun dulu — review saja dan laporkan hasilnya ke saya.
```

---

## 💡 TIPS PAKAI TEMPLATE INI

- **Selalu mulai dengan baca CLAUDE.md** — ini yang bikin AI tidak kabur ke file lain
- **"Jelaskan dulu sebelum coding"** — paksa AI untuk konfirmasi rencana sebelum eksekusi
- **Sebutkan file spesifik** — semakin spesifik, semakin kecil risiko AI ngusik file lain
- **Update CLAUDE.md** tiap fitur selesai — ini memory permanen AI kamu

```

---

## ⚡ QUICK PROMPT (versi singkat)

### Bug cepat:
```

Baca CLAUDE.md. Ada bug di [file/halaman]: [error message].
Jangan ubah file lain. Identifikasi dulu penyebabnya,
jelaskan ke saya sebelum fix.

```

### Fitur cepat:
```

Baca CLAUDE.md. Tambahkan fitur [nama fitur] untuk role [role].
Buat rencana dulu, tunggu konfirmasi saya sebelum coding.
Jangan ubah file di section COMPLETED.

```

/ponytail lite    → saran ringan, masih nulis normal
/ponytail full    → default, balance antara simpel dan fungsional
/ponytail ultra   → ekstrem, hapus semua yang tidak perlu
/ponytail off     → matikan ponytail

/ponytail-review
AI review perubahan kode kamu — cari yang over-engineered, bisa dihapus, atau disederhanakan.

/ponytail-audit
Scan seluruh repo untuk over-engineering. Cocok dipakai sekali sebelum submit tugas atau deploy.

/ponytail-debt
Kumpulkan semua komentar ponytail: di kode (shortcut yang disengaja) jadi debt ledger — reminder apa yang perlu di-improve nanti.

/ponytail-help
Quick reference semua command di atas.



