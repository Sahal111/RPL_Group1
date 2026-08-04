# 11 · DMS Standard (Document Management System)

---

## Overview

DMS adalah sistem pengelolaan dokumen kepegawaian guru.
Dokumen guru melewati workflow: **Upload → Review → Approve/Reject → Published**.

---

## Workflow Status

```
draft      ← guru baru upload, belum submit
pending    ← guru submit, menunggu review operator/kepsek
approved   ← dokumen disetujui, bisa didownload semua pihak berwenang
rejected   ← dokumen ditolak, guru bisa upload versi baru
archived   ← versi lama setelah ada versi baru yang approved
```

---

## Tabel yang Terlibat

```
guru_dokumens        ← dokumen utama (metadata)
guru_dokumen_versions ← versi file (setiap upload baru = versi baru)
guru_dokumen_logs    ← audit trail semua aksi (upload, approve, reject, download)
```

---

## Permission DMS

```
dms.upload       ← guru bisa upload dokumen dirinya sendiri
dms.view_own     ← guru lihat dokumen miliknya
dms.view_all     ← operator/kepsek lihat dokumen semua guru
dms.approve      ← operator/kepsek bisa approve/reject
dms.download     ← download file
dms.delete       ← hapus dokumen
dms.bulk_download ← download semua dokumen satu guru (zip)
```

---

## Aturan File

```php
// Validasi wajib
'file' => [
    'required', 'file',
    'max:10240',  // 10MB max per file
    'mimetypes:application/pdf,image/jpeg,image/png,
               application/msword,
               application/vnd.openxmlformats-officedocument.wordprocessingml.document',
],

// Storage path — per sekolah
"schools/{school_id}/guru/dokumen/{guru_ulid}/{filename}"

// Nama file — jangan pakai nama asli dari user (XSS risk di nama file)
$filename = $guruUlid . '_' . $dokumenSlug . '_v' . $version . '.' . $ext;
```

---

## Versioning

Setiap upload baru untuk dokumen yang sama → buat version baru.
Version lama statusnya jadi `archived`, tidak dihapus.

```php
// GuruDokumenService::upload()
public function upload(Guru $guru, array $data, UploadedFile $file): GuruDokumen
{
    return DB::transaction(function () use ($guru, $data, $file) {
        // Cari dokumen existing (kalau ada)
        $dokumen = GuruDokumen::firstOrCreate(
            ['guru_id' => $guru->id, 'jenis_dokumen' => $data['jenis_dokumen']],
            ['school_id' => $guru->school_id, 'status' => 'draft']
        );

        // Archive versi lama
        $dokumen->versions()->update(['is_current' => false]);

        // Simpan file dan buat versi baru
        $path = $file->store("schools/{$guru->school_id}/guru/dokumen/{$guru->ulid}", 'local');

        $version = $dokumen->versions()->create([
            'file_path'   => $path,
            'file_name'   => $file->getClientOriginalName(),
            'file_size'   => $file->getSize(),
            'mime_type'   => $file->getMimeType(),
            'version'     => $dokumen->versions()->count() + 1,
            'is_current'  => true,
            'uploaded_by' => auth()->id(),
        ]);

        // Update status dokumen
        $dokumen->update(['status' => 'pending', 'submitted_at' => now()]);

        // Log
        $this->logAksi($dokumen, 'uploaded', $version->id);

        return $dokumen->load('currentVersion');
    });
}
```

---

## Audit Log

Setiap aksi di DMS harus dicatat:

```php
// Di GuruDokumenLog
$actions = [
    'uploaded',        // guru upload file
    'submitted',       // guru submit untuk review
    'approved',        // operator/kepsek approve
    'rejected',        // operator/kepsek reject (dengan catatan)
    'downloaded',      // siapapun download file
    'deleted',         // dokumen dihapus
    'archived',        // versi lama diarsipkan
];
```

---

## Endpoint API

```
GET    /v1/guru/{ulid}/dokumen                    ← list semua dokumen guru
POST   /v1/guru/{ulid}/dokumen                    ← upload dokumen baru
GET    /v1/guru/{ulid}/dokumen/{dokumenId}         ← detail dokumen
PATCH  /v1/guru/{ulid}/dokumen/{dokumenId}/approve ← approve
PATCH  /v1/guru/{ulid}/dokumen/{dokumenId}/reject  ← reject (wajib ada catatan)
GET    /v1/guru/{ulid}/dokumen/{dokumenId}/download ← download current version
GET    /v1/guru/{ulid}/dokumen/{dokumenId}/versions ← daftar semua versi
GET    /v1/guru/{ulid}/dokumen/bulk-download       ← download semua (zip)
```
