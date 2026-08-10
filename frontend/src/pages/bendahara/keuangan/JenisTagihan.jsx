import { useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import {
  useJenisTagihanList,
  useCreateJenisTagihan,
  useUpdateJenisTagihan,
  useDeleteJenisTagihan,
  useToggleJenisTagihan,
} from "../../../hooks/api/useKeuangan";
import Modal from "../../../components/ui/Modal";
import Confirm from "../../../components/ui/Confirm";

const KATEGORI_OPTS = ["SPP", "BOS", "Komite", "PPDB", "Lainnya"];

const INITIAL = {
  nama: "",
  kategori: "SPP",
  nominal_default: "",
  keterangan: "",
};

function FormJenisTagihan({
  defaultValues = INITIAL,
  onClose,
  isEdit = false,
  id,
}) {
  const [form, setForm] = useState(defaultValues);
  const create = useCreateJenisTagihan();
  const update = useUpdateJenisTagihan(id);
  const mut = isEdit ? update : create;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await mut.mutateAsync(form);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Nama Tagihan
        </label>
        <input
          required
          value={form.nama}
          onChange={(e) => set("nama", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          placeholder="cth: SPP Bulanan"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Kategori
          </label>
          <select
            value={form.kategori}
            onChange={(e) => set("kategori", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            {KATEGORI_OPTS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nominal Default (opsional)
          </label>
          <input
            type="number"
            value={form.nominal_default}
            onChange={(e) => set("nominal_default", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            placeholder="0"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Keterangan
        </label>
        <textarea
          value={form.keterangan}
          onChange={(e) => set("keterangan", e.target.value)}
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={mut.isPending}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {mut.isPending
            ? "Menyimpan..."
            : isEdit
              ? "Simpan Perubahan"
              : "Tambah"}
        </button>
      </div>
    </form>
  );
}

export default function JenisTagihan() {
  const { data, isLoading } = useJenisTagihanList();
  const toggle = useToggleJenisTagihan();
  const remove = useDeleteJenisTagihan();
  const [modalAdd, setModalAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const items = data?.data?.data ?? data?.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Jenis Tagihan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola tipe-tipe tagihan sekolah
          </p>
        </div>
        <button
          onClick={() => setModalAdd(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse bg-gray-50 m-4 rounded-xl"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Belum ada jenis tagihan.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Nama</th>
                <th className="px-5 py-3 text-left">Kategori</th>
                <th className="px-5 py-3 text-left">Nominal Default</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {item.nama}
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {item.nominal_default
                      ? "Rp " +
                        Number(item.nominal_default).toLocaleString("id-ID")
                      : "–"}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggle.mutate(item.id)}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      {item.is_active ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-green-500" />
                          <span className="text-green-600">Aktif</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-400">Nonaktif</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditItem(item)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      <Modal
        isOpen={modalAdd}
        onClose={() => setModalAdd(false)}
        title="Tambah Jenis Tagihan"
        size="md"
      >
        <FormJenisTagihan onClose={() => setModalAdd(false)} />
      </Modal>

      <Modal
        isOpen={Boolean(editItem)}
        onClose={() => setEditItem(null)}
        title="Edit Jenis Tagihan"
        size="md"
      >
        {editItem && (
          <FormJenisTagihan
            isEdit
            id={editItem.id}
            defaultValues={{
              nama: editItem.nama,
              kategori: editItem.kategori,
              nominal_default: editItem.nominal_default ?? "",
              keterangan: editItem.keterangan ?? "",
            }}
            onClose={() => setEditItem(null)}
          />
        )}
      </Modal>

      <Confirm
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          remove.mutate(deleteId);
          setDeleteId(null);
        }}
        title="Hapus Jenis Tagihan"
        message="Jenis tagihan yang sudah dipakai di tagihan tidak dapat dihapus."
        confirmLabel="Hapus"
      />
    </div>
  );
}
