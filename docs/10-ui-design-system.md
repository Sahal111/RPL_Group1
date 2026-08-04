# 10 · UI Design System

---

## Stack

- **Tailwind CSS 4.x** — utility classes
- **Lucide React** — icons (konsisten, jangan campur icon library lain)
- **react-hot-toast** — toast notification
- **Recharts** — chart dan grafik

---

## Warna

Pakai Tailwind utility classes. Jangan hardcode hex color.

| Peran | Class | Kapan |
|---|---|---|
| Primary action | `bg-blue-600`, `text-blue-600` | Tombol utama, link aktif |
| Danger | `bg-red-600`, `text-red-600` | Hapus, error, nonaktif |
| Success | `bg-green-600`, `text-green-600` | Berhasil, aktif, verified |
| Warning | `bg-amber-500`, `text-amber-600` | Peringatan, pending |
| Neutral | `bg-gray-100`, `text-gray-600` | Background, teks sekunder |
| Sidebar bg | `bg-slate-800` | Sidebar dark |

---

## Typography

```
Heading halaman  : text-2xl font-bold text-gray-900
Sub-heading      : text-lg font-semibold text-gray-800
Section title    : text-base font-semibold text-gray-700
Label field      : text-sm font-medium text-gray-600
Value field      : text-sm text-gray-900
Caption / hint   : text-xs text-gray-500
```

---

## Komponen Standard

### Button

```jsx
// Primary
<button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
  Simpan
</button>

// Secondary
<button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
  Batal
</button>

// Danger
<button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
  Hapus
</button>

// Icon button
<button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
  <PencilIcon size={16} />
</button>
```

### Badge / Status

```jsx
// Pakai StatusBadge component
<StatusBadge status="Aktif" />    // → hijau
<StatusBadge status="Nonaktif" /> // → merah
<StatusBadge status="Cuti" />     // → kuning
<StatusBadge status="Pending" />  // → abu-abu

// Atau Badge generik dengan variant
<Badge variant="success">Verified</Badge>
<Badge variant="danger">Ditolak</Badge>
<Badge variant="warning">Menunggu</Badge>
<Badge variant="info">Baru</Badge>
```

### Card

```jsx
// Section card untuk detail page
<div className="bg-white rounded-xl border border-gray-200 p-6">
  <h3 className="text-base font-semibold text-gray-800 mb-4">Identitas Guru</h3>
  {/* konten */}
</div>
```

### Form Input

```jsx
// Input standard
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Nama Lengkap <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Masukkan nama lengkap"
  />
  {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
</div>
```

### Table

Pakai `DataTable` component dari `components/ui/`.
Jangan buat tabel dari `<table>` langsung di page.

```jsx
<DataTable
  columns={[
    { key: 'nama', label: 'Nama Guru', sortable: true },
    { key: 'nuptk', label: 'NUPTK' },
    { key: 'status_keaktifan', label: 'Status',
      render: (row) => <StatusBadge status={row.status_keaktifan} />
    },
    { key: 'actions', label: '',
      render: (row) => <ActionButtons guru={row} />
    },
  ]}
  data={data?.data ?? []}
  meta={data?.meta}
  isLoading={isLoading}
  onPageChange={(page) => setFilters(f => ({ ...f, page }))}
/>
```

### Modal

```jsx
<Modal
  isOpen={isOpen}
  onClose={close}
  title="Tambah Guru"
  size="lg"          // sm | md | lg | xl | full
>
  <form onSubmit={handleSubmit}>
    {/* form fields */}
    <div className="flex justify-end gap-3 mt-6">
      <button type="button" onClick={close}>Batal</button>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Menyimpan...' : 'Simpan'}
      </button>
    </div>
  </form>
</Modal>
```

---

## Spacing

Konsisten pakai Tailwind spacing:

```
Padding card     : p-6
Gap antar section: space-y-6
Gap antar field  : space-y-4
Gap inline items : gap-3
Margin tombol    : mt-6
```

---

## Loading State

Selalu tampilkan skeleton, bukan spinner.

```jsx
// ❌ SALAH
if (isLoading) return <div>Loading...</div>;
if (isLoading) return <Spinner />;

// ✅ BENAR — skeleton yang mirip bentuk konten aslinya
if (isLoading) return <TableSkeleton rows={10} cols={5} />;
if (isLoading) return <DetailSkeleton />;
```

---

## Empty State

Selalu tampilkan pesan yang jelas saat data kosong.

```jsx
if (data?.data.length === 0) return (
  <EmptyState
    icon={<UsersIcon size={40} className="text-gray-300" />}
    title="Belum ada data guru"
    description="Tambahkan data guru pertama untuk mulai."
    action={hasPermission('master_data.guru.create') && (
      <button onClick={handleTambah}>Tambah Guru</button>
    )}
  />
);
```

---

## Aturan UI

1. Semua halaman pakai `AppLayout` — tidak boleh ada layout ad-hoc
2. Icon pakai Lucide React — jangan campur dengan library lain
3. Toast pakai `react-hot-toast` — jangan `alert()` atau custom toast
4. Warna status harus konsisten: hijau = aktif/berhasil, merah = nonaktif/gagal, kuning = pending
5. Tombol delete selalu pakai `ConfirmDialog` sebelum eksekusi
6. Form yang panjang (>5 field) pakai modal atau halaman terpisah, bukan inline
7. Pagination selalu ada untuk semua list — tidak boleh load semua data
