import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Link,
  Video,
  BookOpen,
} from "lucide-react";
import {
  useMateriList,
  useCreateMateri,
  useUpdateMateri,
  useDeleteMateri,
  useTogglePublishMateri,
} from "../../../hooks/api/useLms";
import Modal from "../../../components/ui/Modal";
import Confirm from "../../../components/ui/Confirm";

// ── Constants ────────────────────────────────────────────────────────────────

const TIPE_OPTS = [
  { value: "dokumen", label: "Dokumen", icon: FileText },
  { value: "video", label: "Video", icon: Video },
  { value: "link", label: "Link Eksternal", icon: Link },
  { value: "teks", label: "Teks", icon: BookOpen },
];

const TIPE_BADGE = {
  dokumen: "bg-blue-50 text-blue-700",
  video: "bg-purple-50 text-purple-700",
  link: "bg-orange-50 text-orange-700",
  teks: "bg-green-50 text-green-700",
};

const INITIAL_FORM = {
  judul: "",
  deskripsi: "",
  tipe: "dokumen",
  url_eksternal: "",
  urutan: "",
  is_published: false,
};

// ── Sub-components ───────────────────────────────────────────────────────────

function TipeBadge({ tipe }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${TIPE_BADGE[tipe] ?? "bg-gray-100 text-gray-600"}`}
    >
      {TIPE_OPTS.find((t) => t.value === tipe)?.label ?? tipe}
    </span>
  );
}

function StatusBadge({ published }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${published ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

function MateriForm({
  defaultValues = INITIAL_FORM,
  onClose,
  isEdit = false,
  id,
}) {
  const [form, setForm] = useState(defaultValues);
  const [file, setFile] = useState(null);

  const create = useCreateMateri();
  const update = useUpdateMateri(id);
  const mut = isEdit ? update : create;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) fd.append(k, v);
    });
    if (file) fd.append("file", file);
    await mut.mutateAsync(fd);
    onClose();
  };

  const needsFile = form.tipe === "dokumen" || form.tipe === "video";
  const needsUrl = form.tipe === "link";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Judul Materi *
        </label>
        <input
          required
          value={form.judul}
          onChange={(e) => set("judul", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          placeholder="cth: Pengantar Matematika Dasar"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Tipe Materi *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TIPE_OPTS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => set("tipe", value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                form.tipe === value
                  ? "border-primary-400 bg-primary-50 text-primary-700 font-medium"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {needsUrl && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            URL Eksternal *
          </label>
          <input
            required={needsUrl}
            type="url"
            value={form.url_eksternal}
            onChange={(e) => set("url_eksternal", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            placeholder="https://..."
          />
        </div>
      )}

      {needsFile && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            File {isEdit ? "(biarkan kosong jika tidak diganti)" : "*"}
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required={needsFile && !isEdit}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Deskripsi
        </label>
        <textarea
          value={form.deskripsi}
          onChange={(e) => set("deskripsi", e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
          placeholder="Deskripsi singkat materi ini..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Urutan
          </label>
          <input
            type="number"
            min={1}
            value={form.urutan}
            onChange={(e) => set("urutan", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            placeholder="1"
          />
        </div>
        <div className="flex items-end pb-0.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => set("is_published", e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Publish langsung</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={mut.isPending}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium"
        >
          {mut.isPending
            ? "Menyimpan..."
            : isEdit
              ? "Simpan Perubahan"
              : "Tambah Materi"}
        </button>
      </div>
    </form>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function LmsMateri() {
  const [filter, setFilter] = useState({
    search: "",
    tipe: "",
    is_published: "",
  });
  const [modal, setModal] = useState(null); // null | { mode: "create" | "edit", data? }
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useMateriList(filter);
  const togglePublish = useTogglePublishMateri();
  const deleteMateri = useDeleteMateri();

  const items = data?.data?.data ?? data?.data ?? [];

  const openCreate = () => setModal({ mode: "create" });
  const openEdit = (item) =>
    setModal({
      mode: "edit",
      data: {
        id: item.id,
        judul: item.judul,
        deskripsi: item.deskripsi ?? "",
        tipe: item.tipe,
        url_eksternal: item.url_eksternal ?? "",
        urutan: item.urutan ?? "",
        is_published: item.is_published,
      },
    });

  const handleDelete = async () => {
    await deleteMateri.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Materi Pembelajaran
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola materi yang diajarkan ke siswa
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Materi
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          placeholder="Cari judul materi..."
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 w-56"
        />
        <select
          value={filter.tipe}
          onChange={(e) => setFilter((f) => ({ ...f, tipe: e.target.value }))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="">Semua Tipe</option>
          {TIPE_OPTS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={filter.is_published}
          onChange={(e) =>
            setFilter((f) => ({ ...f, is_published: e.target.value }))
          }
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="">Semua Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">
            Memuat data...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              Belum ada materi. Tambahkan yang pertama!
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Materi
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Urutan
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800">{item.judul}</p>
                    {item.deskripsi && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {item.deskripsi}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <TipeBadge tipe={item.tipe} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge published={item.is_published} />
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">
                    {item.urutan ?? "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => togglePublish.mutate(item.id)}
                        title={item.is_published ? "Sembunyikan" : "Publish"}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      >
                        {item.is_published ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      <Modal
        isOpen={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Edit Materi" : "Tambah Materi"}
        size="md"
      >
        {modal && (
          <MateriForm
            defaultValues={modal.data ?? INITIAL_FORM}
            isEdit={modal.mode === "edit"}
            id={modal.data?.id}
            onClose={() => setModal(null)}
          />
        )}
      </Modal>

      {/* Confirm Delete */}
      <Confirm
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Materi"
        message={`Materi "${deleteTarget?.judul}" akan dihapus permanen. Lanjutkan?`}
        isLoading={deleteMateri.isPending}
      />
    </div>
  );
}
