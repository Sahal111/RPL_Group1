# 10b · UI Consistency Checklist

Ini checklist yang dipakai saat code review untuk PR yang menyentuh UI.

---

## Spacing
- [ ] Padding card konsisten: `p-6`
- [ ] Gap antar section: `space-y-6`
- [ ] Gap antar form field: `space-y-4`
- [ ] Padding halaman: `p-6` atau `p-8`

## Typography
- [ ] Heading halaman: `text-2xl font-bold text-gray-900`
- [ ] Section title: `text-base font-semibold text-gray-700`
- [ ] Label form: `text-sm font-medium text-gray-600`
- [ ] Body text: `text-sm text-gray-900`
- [ ] Caption: `text-xs text-gray-500`

## Tombol
- [ ] Primary action: `bg-blue-600 text-white`
- [ ] Secondary: `bg-white border border-gray-300 text-gray-700`
- [ ] Danger: `bg-red-600 text-white`
- [ ] Semua tombol punya `hover:` state
- [ ] Tombol submit disabled + loading state saat `isPending`

## Status
- [ ] Aktif/Berhasil: `text-green-700 bg-green-100`
- [ ] Nonaktif/Error: `text-red-700 bg-red-100`
- [ ] Pending/Warning: `text-amber-700 bg-amber-100`
- [ ] Info: `text-blue-700 bg-blue-100`

## Loading
- [ ] Pakai `<TableSkeleton>` atau `<DetailSkeleton>` — tidak boleh `Loading...`
- [ ] Skeleton harus mirip bentuk konten aslinya

## Error State
- [ ] Pakai `<EmptyState>` untuk data kosong — tidak boleh tabel kosong tanpa pesan
- [ ] Error validasi tampil di bawah field, bukan alert popup
- [ ] Pesan error human-readable, bukan kode teknis

## Modal
- [ ] Semua modal pakai `<Modal>` component — tidak boleh custom modal
- [ ] Tombol "Batal" selalu ada di modal
- [ ] Delete/aksi berbahaya pakai `<ConfirmDialog>` — tidak langsung eksekusi

## Table
- [ ] Semua tabel pakai `<DataTable>` component
- [ ] Pagination selalu ada kalau data > 1 halaman
- [ ] Kolom aksi selalu di kanan
- [ ] Responsive — minimal bisa di-scroll horizontal di mobile
