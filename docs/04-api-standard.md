# 04 · API Standard

Lihat dokumen lengkap di: `/siakad-platform-docs/doc3-api-contract.md`

Di sini adalah ringkasan cepat untuk developer.

---

## Base URL

```
https://{subdomain}.siakad.id/api/v1/...
```

## Format Response — Ringkasan

```json
// Success single
{ "success": true, "data": { ... } }

// Success collection
{ "success": true, "data": [...], "meta": { "current_page":1, "total":74, ... }, "links": { ... } }

// Success action (create/update/delete)
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "code": "ERROR_CODE", "message": "...", "errors": { ... } }
```

## HTTP Status Codes

| Status | Kapan |
|---|---|
| 200 | Success GET / action berhasil |
| 201 | Resource baru berhasil dibuat |
| 204 | Berhasil, tidak ada data dikembalikan (logout) |
| 422 | Validasi gagal |
| 401 | Belum login / token expired |
| 403 | Tidak punya permission |
| 404 | Data tidak ditemukan |
| 429 | Rate limit |
| 500 | Server error |

## Error Codes

```
UNAUTHENTICATED, ACCOUNT_INACTIVE, FORBIDDEN, NOT_FOUND,
VALIDATION_ERROR, CONFLICT, SCHOOL_SUSPENDED, TOO_MANY_REQUESTS,
SERVER_ERROR, IMPORT_FAILED, IMPORT_PARTIAL
```

## ApiResponse Trait

Semua controller pakai trait ini via base `Controller.php`:

```php
return $this->success($data);
return $this->created($data, 'Berhasil ditambahkan.');
return $this->success(message: 'Berhasil dihapus.');
return $this->notFound('Guru tidak ditemukan.');
return $this->forbidden();
return $this->error('Pesan error', 'ERROR_CODE', 500);
```

Jangan pernah `return response()->json([...])` langsung di controller.
