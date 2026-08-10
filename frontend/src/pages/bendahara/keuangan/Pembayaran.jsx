import { useState } from "react";
import { Search, Plus, X, ChevronLeft, ChevronRight, Ban } from "lucide-react";
import {
  usePembayaranKeuanganList,
  useCreatePembayaranKeuangan,
  useBatalkanPembayaran,
} from "../../../hooks/api/useKeuangan";
import { useQuery } from "@tanstack/react-query";
import Modal from "../../../components/ui/Modal";
import Confirm from "../../../components/ui/Confirm";
import api from "../../../lib/axios";

function FormPembayaran({ onClose }) {
  const { data: siswaRes } = useQuery({
    queryKey: ["siswa-dropdown"],
    queryFn: () =>
      api
        .get("/operator/master-data/siswa")
        .then((r) => r.data.data?.data ?? []),
  });
  const siswas = siswaRes ?? [];
  const [siswaId, setSiswaId] = useState("");
  const [tagihanList, setTagihanList] = useState([]);
  const [loadingTagihan, setLoadingTagihan] = useState(false);
  const [form, setForm] = useState({
    tagihan_id: "",
    nominal_bayar: "",
    metode_pembayaran: "tunai",
    catatan: "",
  });
  const create = useCreatePembayaranKeuangan();

  const loadTagihan = async (id) => {
    setSiswaId(id);
    if (!id) return;
    setLoadingTagihan(true);
    try {
      const res = await api.get("/keuangan/tagihan/rekap-siswa/" + id);
      const items = res.data?.data?.tagihan ?? [];
      setTagihanList(
        items.filter((t) => t.status !== "lunas" && t.status !== "dibatalkan"),
      );
    } finally {
      setLoadingTagihan(false);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleTagihan = (id) => {
    const t = tagihanList.find((x) => String(x.id) === String(id));
    set("tagihan_id", id);
    if (t)
      set("nominal_bayar", t.sisa ?? t.nominal_bersih ?? t.nominal_tagihan);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await create.mutateAsync(form);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Pilih Siswa
        </label>
        <select
          value={siswaId}
          onChange={(e) => loadTagihan(e.target.value)}
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
      {siswaId && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tagihan
          </label>
          <select
            required
            value={form.tagihan_id}
            onChange={(e) => handleTagihan(e.target.value)}
            disabled={loadingTagihan}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">
              {loadingTagihan ? "Memuat..." : "-- Pilih Tagihan --"}
            </option>
            {tagihanList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.jenis_tagihan?.nama}{" "}
                {t.bulan ? `${t.bulan}/${t.tahun}` : t.tahun} — Rp{" "}
                {Number(t.nominal_bersih ?? t.nominal_tagihan).toLocaleString(
                  "id-ID",
                )}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nominal Bayar (Rp)
          </label>
          <input
            required
            type="number"
            value={form.nominal_bayar}
            onChange={(e) => set("nominal_bayar", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Metode
          </label>
          <select
            value={form.metode_pembayaran}
            onChange={(e) => set("metode_pembayaran", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="tunai">Tunai</option>
            <option value="transfer">Transfer</option>
            <option value="qris">QRIS</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Catatan (opsional)
        </label>
        <input
          value={form.catatan}
          onChange={(e) => set("catatan", e.target.value)}
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
          {create.isPending ? "Menyimpan..." : "Catat Pembayaran"}
        </button>
      </div>
    </form>
  );
}

export default function Pembayaran() {
  const [params, setParams] = useState({ page: 1, search: "" });
  const [search, setSearch] = useState("");
  const [modalAdd, setModalAdd] = useState(false);
  const [batalkanId, setBatalkanId] = useState(null);
  const { data, isLoading } = usePembayaranKeuanganList(params);
  const batalkan = useBatalkanPembayaran();

  const items = data?.data?.data ?? [];
  const meta = data?.data;

  const handleSearch = (e) => {
    e.preventDefault();
    setParams((p) => ({ ...p, search, page: 1 }));
  };

  const METODE = { tunai: "Tunai", transfer: "Transfer", qris: "QRIS" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Pembayaran</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Riwayat dan pencatatan pembayaran
          </p>
        </div>
        <button
          onClick={() => setModalAdd(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Catat Pembayaran
        </button>
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
            Belum ada riwayat pembayaran.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Siswa</th>
                <th className="px-4 py-3 text-left">Tagihan</th>
                <th className="px-4 py-3 text-right">Dibayar</th>
                <th className="px-4 py-3 text-left">Metode</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 ${item.is_cancelled ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">
                      {item.tagihan?.siswa?.nama_lengkap ?? "–"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {item.tagihan?.jenis_tagihan?.nama}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                    Rp {Number(item.nominal_bayar).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {METODE[item.metode_pembayaran] ?? item.metode_pembayaran}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {item.tanggal_bayar
                      ? new Date(item.tanggal_bayar).toLocaleDateString("id-ID")
                      : "–"}
                  </td>
                  <td className="px-4 py-3">
                    {!item.is_cancelled && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => setBatalkanId(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Batalkan"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
        title="Catat Pembayaran"
        size="md"
      >
        <FormPembayaran onClose={() => setModalAdd(false)} />
      </Modal>
      <Confirm
        isOpen={Boolean(batalkanId)}
        onClose={() => setBatalkanId(null)}
        onConfirm={() => {
          batalkan.mutate(batalkanId);
          setBatalkanId(null);
        }}
        title="Batalkan Pembayaran"
        message="Pembayaran akan dibatalkan dan status tagihan akan dikembalikan."
        confirmLabel="Batalkan"
      />
    </div>
  );
}
