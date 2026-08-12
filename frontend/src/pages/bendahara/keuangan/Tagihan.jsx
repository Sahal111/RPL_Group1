import { useState } from "react";
import {
  Search,
  Plus,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
} from "lucide-react";
import {
  useTagihanList,
  useCreateTagihan,
  useGenerateTagihan,
  useDeleteTagihan,
} from "../../../hooks/api/useKeuangan";
import { useJenisTagihanList } from "../../../hooks/api/useKeuangan";
import Modal from "../../../components/ui/Modal";
import Confirm from "../../../components/ui/Confirm";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios";

const STATUS_CFG = {
  belum_lunas: { label: "Belum Lunas", bg: "bg-red-50", text: "text-red-700" },
  sebagian: { label: "Sebagian", bg: "bg-yellow-50", text: "text-yellow-700" },
  lunas: { label: "Lunas", bg: "bg-green-50", text: "text-green-700" },
  dibatalkan: { label: "Dibatalkan", bg: "bg-gray-100", text: "text-gray-500" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

function FormTagihan({ onClose }) {
  const { data: siswaRes } = useQuery({
    queryKey: ["siswa-dropdown"],
    queryFn: () =>
      api
        .get("/operator/master-data/siswa")
        .then((r) => r.data.data?.data ?? []),
  });
  const { data: jenisRes } = useJenisTagihanList({ is_active: 1 });
  const create = useCreateTagihan();

  const siswas = siswaRes ?? [];
  const jenis = jenisRes?.data?.data ?? jenisRes?.data ?? [];

  const [form, setForm] = useState({
    siswa_id: "",
    jenis_tagihan_id: "",
    bulan: "",
    nominal_tagihan: "",
    nominal_diskon: 0,
    keterangan: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleJenis = (id) => {
    const j = jenis.find((x) => String(x.id) === String(id));
    set("jenis_tagihan_id", id);
    if (j?.nominal_default) set("nominal_tagihan", j.nominal_default);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await create.mutateAsync(form);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Siswa
          </label>
          <select
            required
            value={form.siswa_id}
            onChange={(e) => set("siswa_id", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">-- Pilih Siswa --</option>
            {siswas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama_lengkap} ({s.nisn})
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Jenis Tagihan
          </label>
          <select
            required
            value={form.jenis_tagihan_id}
            onChange={(e) => handleJenis(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">-- Pilih Jenis --</option>
            {jenis.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Bulan
          </label>
          <select
            value={form.bulan}
            onChange={(e) => set("bulan", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">-- Bulan (opsional) --</option>
            {[
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ].map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nominal (Rp)
          </label>
          <input
            required
            type="number"
            value={form.nominal_tagihan}
            onChange={(e) => set("nominal_tagihan", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Diskon (Rp)
          </label>
          <input
            type="number"
            value={form.nominal_diskon}
            onChange={(e) => set("nominal_diskon", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Keterangan
        </label>
        <input
          value={form.keterangan}
          onChange={(e) => set("keterangan", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
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
          disabled={create.isPending}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {create.isPending ? "Menyimpan..." : "Buat Tagihan"}
        </button>
      </div>
    </form>
  );
}

function FormGenerate({ onClose }) {
  const { data: jenisRes } = useJenisTagihanList({ is_active: 1 });
  const { data: kelasRes } = useQuery({
    queryKey: ["kelas-dropdown"],
    queryFn: () =>
      api
        .get("/operator/master-data/kelas")
        .then((r) => r.data.data?.data ?? []),
  });
  const generate = useGenerateTagihan();
  const jenis = jenisRes?.data?.data ?? jenisRes?.data ?? [];
  const kelas = kelasRes ?? [];

  const [form, setForm] = useState({
    jenis_tagihan_id: "",
    kelas_id: "",
    bulan: "",
    nominal_tagihan: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await generate.mutateAsync(form);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
        Generate tagihan akan membuat tagihan secara otomatis untuk seluruh
        siswa pada kelas yang dipilih.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Jenis Tagihan
          </label>
          <select
            required
            value={form.jenis_tagihan_id}
            onChange={(e) => set("jenis_tagihan_id", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">-- Pilih Jenis --</option>
            {jenis.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Kelas (kosongkan = semua kelas)
          </label>
          <select
            value={form.kelas_id}
            onChange={(e) => set("kelas_id", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">-- Semua Kelas --</option>
            {kelas.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama_kelas}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Bulan
          </label>
          <select
            value={form.bulan}
            onChange={(e) => set("bulan", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">-- Pilih Bulan --</option>
            {[
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ].map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nominal (Rp)
          </label>
          <input
            required
            type="number"
            value={form.nominal_tagihan}
            onChange={(e) => set("nominal_tagihan", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
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
          disabled={generate.isPending}
          className="px-4 py-2 text-sm bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors"
        >
          {generate.isPending ? "Generating..." : "Generate Tagihan"}
        </button>
      </div>
    </form>
  );
}

export default function Tagihan() {
  const [params, setParams] = useState({ page: 1, search: "" });
  const [search, setSearch] = useState("");
  const [modalAdd, setModalAdd] = useState(false);
  const [modalGenerate, setModalGenerate] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useTagihanList(params);
  const remove = useDeleteTagihan();

  const items = data?.data?.data ?? [];
  const meta = data?.data;

  const handleSearch = (e) => {
    e.preventDefault();
    setParams((p) => ({ ...p, search, page: 1 }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Tagihan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola tagihan pembayaran siswa
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalGenerate(true)}
            className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            <Zap className="w-4 h-4" /> Generate Bulk
          </button>
          <button
            onClick={() => setModalAdd(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Manual
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama siswa..."
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setParams((p) => ({ ...p, search: "", page: 1 }));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse bg-gray-100 rounded-xl"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Tidak ada tagihan.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Siswa</th>
                <th className="px-4 py-3 text-left">Jenis</th>
                <th className="px-4 py-3 text-left">Periode</th>
                <th className="px-4 py-3 text-right">Nominal</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">
                      {item.siswa?.nama_lengkap ?? "–"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.siswa?.kelas?.nama_kelas}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.jenis_tagihan?.nama ?? "–"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {item.bulan ? `${item.bulan}/${item.tahun}` : item.tahun}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    Rp{" "}
                    {Number(
                      item.nominal_bersih ?? item.nominal_tagihan,
                    ).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
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

        {meta?.last_page > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Halaman {meta.current_page} dari {meta.last_page}
            </span>
            <div className="flex gap-1">
              <button
                disabled={params.page <= 1}
                onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}
                className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={params.page >= meta.last_page}
                onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
                className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalAdd}
        onClose={() => setModalAdd(false)}
        title="Tambah Tagihan Manual"
        size="md"
      >
        <FormTagihan onClose={() => setModalAdd(false)} />
      </Modal>
      <Modal
        isOpen={modalGenerate}
        onClose={() => setModalGenerate(false)}
        title="Generate Tagihan Massal"
        size="md"
      >
        <FormGenerate onClose={() => setModalGenerate(false)} />
      </Modal>
      <Confirm
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          remove.mutate(deleteId);
          setDeleteId(null);
        }}
        title="Hapus Tagihan"
        message="Tagihan yang sudah dibayar tidak dapat dihapus."
        confirmLabel="Hapus"
      />
    </div>
  );
}
