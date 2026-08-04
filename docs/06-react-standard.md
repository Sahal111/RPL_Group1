# 06 · React Standard

---

## Prinsip Utama

1. **Page = orchestration** — halaman hanya mengatur layout dan memanggil komponen
2. **Komponen = reusable** — satu komponen tidak boleh tahu tentang domain lain
3. **Data = React Query** — tidak ada `axios` langsung di komponen, tidak ada `useEffect` untuk fetch data
4. **State = minimal** — hanya simpan state yang tidak bisa derivasi dari React Query

---

## React Query — Wajib untuk Semua Data Fetching

### Tidak Boleh Lagi

```jsx
// ❌ SALAH — pattern lama yang harus dihapus
const [gurus, setGurus] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  api.get('/guru')
    .then(res => setGurus(res.data.data))
    .finally(() => setLoading(false));
}, []);
```

### Yang Benar

```jsx
// ✅ BENAR — React Query
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

// 1. Definisikan query function di hooks/api/
export const useGurus = (filters = {}) => {
  return useQuery({
    queryKey: ['gurus', filters],
    queryFn: () => api.get('/v1/guru', { params: filters }).then(r => r.data),
    staleTime: 1000 * 60 * 5,  // 5 menit
  });
};

// 2. Pakai di komponen
const MasterGuru = () => {
  const [filters, setFilters] = useState({ page: 1, search: '' });
  const { data, isLoading, isError } = useGurus(filters);

  if (isLoading) return <TableSkeleton />;
  if (isError)   return <ErrorState />;

  return <DataTable data={data.data} meta={data.meta} />;
};
```

### Mutation

```jsx
// ✅ BENAR
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateGuru = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/v1/guru', data).then(r => r.data),
    onSuccess: () => {
      // Invalidate supaya list otomatis refresh
      queryClient.invalidateQueries({ queryKey: ['gurus'] });
    },
  });
};

// Di komponen
const { mutate: createGuru, isPending } = useCreateGuru();

const handleSubmit = (formData) => {
  createGuru(formData, {
    onSuccess: (res) => {
      toast.success(res.message);
      navigate('/operator/guru');
    },
    onError: (err) => {
      // Error validasi sudah di-handle global di axios interceptor
    },
  });
};
```

---

## Struktur Hooks

```
src/hooks/
  api/
    useGuru.js           query + mutation untuk domain guru
    useSiswa.js
    useAbsensi.js
    useKelas.js
    useAkun.js
    useDokumen.js
  ui/
    useDebounce.js       debounce untuk search input
    useDisclosure.js     state buka/tutup modal
    useLocalStorage.js   wrapper localStorage
```

### Template Hook API

```js
// src/hooks/api/useGuru.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

const QUERY_KEY = 'gurus';

// Queries
export const useGurus = (filters) => useQuery({
  queryKey: [QUERY_KEY, filters],
  queryFn:  () => api.get('/v1/guru', { params: filters }).then(r => r.data),
});

export const useGuru = (ulid) => useQuery({
  queryKey: [QUERY_KEY, ulid],
  queryFn:  () => api.get(`/v1/guru/${ulid}`).then(r => r.data),
  enabled:  !!ulid,
});

// Mutations
export const useCreateGuru = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/v1/guru', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
};

export const useUpdateGuru = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ulid, data }) => api.put(`/v1/guru/${ulid}`, data).then(r => r.data),
    onSuccess: (_, { ulid }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: [QUERY_KEY, ulid] });
    },
  });
};

export const useDeleteGuru = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ulid) => api.delete(`/v1/guru/${ulid}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
};
```

---

## Komponen

### Aturan Ukuran

- Satu file komponen tidak boleh lebih dari **200-250 baris**
- Kalau lebih, pecah jadi sub-komponen

### Pemecahan Halaman Besar

```
// ❌ SALAH — satu file 7000+ baris
DetailGuru.jsx

// ✅ BENAR — shell + tab
pages/operator/master/masterDataGuru/DetailGuru/
  index.jsx              shell: tab navigation + layout
  tabs/
    TabIdentitas.jsx
    TabKepegawaian.jsx
    TabKeluarga.jsx
    TabPendidikan.jsx
    TabSertifikasi.jsx
    TabInpassing.jsx
    TabJabatan.jsx
    TabDokumen.jsx
    TabKompetensi.jsx
    TabDiklat.jsx
    TabMutasi.jsx
    TabPKG.jsx
    TabAdministrasi.jsx
    TabPenugasan.jsx
    TabAkun.jsx
```

### Template Tab Komponen

```jsx
// tabs/TabIdentitas.jsx
import { useGuru } from '@/hooks/api/useGuru';
import { useUpdateGuru } from '@/hooks/api/useGuru';
import DataField from '@/components/ui/DataField';
import EditModal from './modals/EditIdentitasModal';
import { useDisclosure } from '@/hooks/ui/useDisclosure';

const TabIdentitas = ({ guruUlid }) => {
  const { data, isLoading } = useGuru(guruUlid);
  const { isOpen, open, close } = useDisclosure();

  if (isLoading) return <Skeleton />;

  const guru = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Data Identitas</h3>
        <button onClick={open} className="btn-secondary">Edit</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DataField label="Nama Lengkap" value={guru.nama_lengkap} />
        <DataField label="NUPTK" value={guru.nuptk ?? '-'} />
        <DataField label="NIK" value={guru.nik ?? '-'} />
        <DataField label="Jenis Kelamin" value={guru.jenis_kelamin} />
      </div>

      <EditModal isOpen={isOpen} onClose={close} guru={guru} />
    </div>
  );
};

export default TabIdentitas;
```

---

## Reusable UI Components

Semua komponen UI generik ada di `src/components/ui/`.
Komponen ini **tidak boleh** import dari `hooks/api/` — tidak boleh tahu tentang domain.

```
src/components/ui/
  DataTable.jsx        table: columns config, data, pagination, sort, loading
  Modal.jsx            modal: isOpen, onClose, title, children, size
  ConfirmDialog.jsx    konfirmasi: message, onConfirm, onCancel, isLoading
  Badge.jsx            status badge: variant (success|warning|danger|info)
  Skeleton.jsx         loading skeleton: berbagai bentuk
  FileUpload.jsx       upload: accept, maxSize, onUpload, preview
  Pagination.jsx       pagination: meta, onChange
  SearchInput.jsx      search: value, onChange, debounce bawaan
  EmptyState.jsx       kosong: icon, title, description, action
  DataField.jsx        label + value pair untuk detail view
  SectionCard.jsx      card wrapper untuk section di halaman detail
  StatusBadge.jsx      badge khusus status (aktif/nonaktif/dll)
```

### Template DataTable

```jsx
// components/ui/DataTable.jsx
const DataTable = ({
  columns,      // [{ key, label, render, sortable }]
  data,         // array data
  meta,         // { current_page, last_page, total, per_page }
  isLoading,
  onPageChange,
  onSort,
}) => {
  if (isLoading) return <TableSkeleton cols={columns.length} />;

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {meta && (
        <Pagination meta={meta} onChange={onPageChange} />
      )}
    </div>
  );
};
```

---

## Layout

### Satu Layout untuk Semua Role

```jsx
// components/layout/AppLayout.jsx
// Menerima prop `menus` yang berisi navigasi sesuai role user

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const menus = useMenusByPermission(user.permissions);  // generate dari permission

  return (
    <div className="flex h-screen">
      <Sidebar menus={menus} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
```

**Tidak boleh ada** `OperatorLayout`, `GuruLayout`, `KepsekLayout` yang terpisah.
Perbedaan antar role hanya di `menus` yang di-pass ke `AppLayout`.

---

## Auth Context

```jsx
// contexts/AuthContext.jsx

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Yang tersedia dari useAuth():
const {
  user,           // object user dari /api/v1/auth/me
  token,          // bearer token
  isAuthenticated,
  login,          // fn(credentials) → void
  logout,         // fn() → void
  hasPermission,  // fn(slug) → boolean
  hasRole,        // fn(slug) → boolean
} = useAuth();
```

---

## Error Handling Global

```js
// src/lib/axios.js — tambahkan di response interceptor

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error.response?.data?.code;
    const status = error.response?.status;

    if (status === 401) {
      // Session expired
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    if (status === 403 && code === 'SCHOOL_SUSPENDED') {
      window.location.href = '/suspended';
      return;
    }

    // Validation error (422) — biarkan component yang handle
    // Error lain — bisa di-throw untuk ditangkap useMutation onError
    return Promise.reject(error);
  }
);
```

---

## Aturan Import

```jsx
// Urutan import yang konsisten:
// 1. React dan hooks bawaan
import { useState, useEffect } from 'react';

// 2. Library eksternal
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

// 3. Hooks internal
import { useGurus } from '@/hooks/api/useGuru';
import { useDisclosure } from '@/hooks/ui/useDisclosure';

// 4. Components
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';

// 5. Assets, utils, constants
import { formatDate } from '@/lib/utils';
```

Gunakan alias `@` untuk `src/` — sudah dikonfigurasi di `vite.config.js`.
