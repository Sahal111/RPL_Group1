import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Download,
} from "lucide-react";
import api from "../../lib/axios";
import {
  useCalonSiswaList,
  useCreateCalonSiswa,
  useDeleteCalonSiswa,
} from "../../hooks/api/usePpdb";
import Modal from "../../components/ui/Modal";
import Confirm from "../../components/ui/Confirm";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: { label: "Menunggu", bg: "bg-yellow-100", text: "text-yellow-700" },
  verifikasi: {
    label: "Diverifikasi",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  lulus: { label: "Lulus", bg: "bg-green-100", text: "text-green-700" },
  tidak_lulus: { label: "Tidak Lulus", bg: "bg-red-100", text: "text-red-700" },
  cadangan: { label: "Cadangan", bg: "bg-orange-100", text: "text-orange-700" },
  converted: {
    label: "Siswa Aktif",
    bg: "bg-purple-100",
    text: "text-purple-700",
  },
  dibatalkan: { label: "Dibatalkan", bg: "bg-gray-100", text: "text-gray-500" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? {
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

// ── Form Tambah Pendaftar ────────────────────────────────────────────────────

const JALUR_OPTS = [
  "Zonasi",
  "Prestasi",
  "Afirmasi",
  "Pindah Tugas",
  "Regular",
];
const AGAMA_OPTS = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
];

function FormTambahCalonSiswa({ onClose }) {
  const { data: tahunAjaranList } = useQuery({
    queryKey: ["tahun-ajaran-dropdown"],
    queryFn: () =>
      api
        .get("/operator/master-data/tahun-ajaran")
        .then((r) => r.data.data?.data ?? []),
  });

  const create = useCreateCalonSiswa();
  const [form, setForm] = useState({
    tahun_ajaran_id: "",
    nama_lengkap: "",
    jenis_kelamin: "L",
    tempat_lahir: "",
    tanggal_lahir: "",
    agama: "Islam",
    alamat: "",
    asal_sekolah: "",
    nama_orang_tua: "",
    no_hp: "",
    email: "",
    jalur: "Regular",
  });

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.tahun_ajaran_id) return;
    await create.mutateAsync(form);
    onClose();
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <div className="space-y-4">
      {/* Tahun Ajaran */}
      <div>
        <label className={labelClass}>
          Tahun Ajaran <span className="text-red-500">*</span>
        </label>
        <select
          className={inputClass}
          value={form.tahun_ajaran_id}
          onChange={set("tahun_ajaran_id")}
        >
          <option value="">— Pilih Tahun Ajaran —</option>
          {(tahunAjaranList ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Nama + JK */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className={labelClass}>
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            className={inputClass}
            value={form.nama_lengkap}
            onChange={set("nama_lengkap")}
            placeholder="Nama lengkap"
          />
        </div>
        <div>
          <label className={labelClass}>
            Jenis Kelamin <span className="text-red-500">*</span>
          </label>
          <select
            className={inputClass}
            value={form.jenis_kelamin}
            onChange={set("jenis_kelamin")}
          >
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
      </div>

      {/* Tempat + Tgl Lahir */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tempat Lahir</label>
          <input
            className={inputClass}
            value={form.tempat_lahir}
            onChange={set("tempat_lahir")}
            placeholder="Kota"
          />
        </div>
        <div>
          <label className={labelClass}>
            Tanggal Lahir <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={inputClass}
            value={form.tanggal_lahir}
            onChange={set("tanggal_lahir")}
          />
        </div>
      </div>

      {/* Agama + Jalur */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Agama</label>
          <select
            className={inputClass}
            value={form.agama}
            onChange={set("agama")}
          >
            {AGAMA_OPTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Jalur Pendaftaran</label>
          <select
            className={inputClass}
            value={form.jalur}
            onChange={set("jalur")}
          >
            {JALUR_OPTS.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Asal sekolah */}
      <div>
        <label className={labelClass}>Asal Sekolah</label>
        <input
          className={inputClass}
          value={form.asal_sekolah}
          onChange={set("asal_sekolah")}
          placeholder="Nama sekolah asal"
        />
      </div>

      {/* Nama ortu + no hp */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Nama Orang Tua</label>
          <input
            className={inputClass}
            value={form.nama_orang_tua}
            onChange={set("nama_orang_tua")}
            placeholder="Ayah / Ibu"
          />
        </div>
        <div>
          <label className={labelClass}>No. HP</label>
          <input
            className={inputClass}
            value={form.no_hp}
            onChange={set("no_hp")}
            placeholder="08xx..."
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          className={inputClass}
          value={form.email}
          onChange={set("email")}
          placeholder="email@domain.com"
        />
      </div>

      {/* Alamat */}
      <div>
        <label className={labelClass}>Alamat</label>
        <textarea
          className={inputClass}
          rows={2}
          value={form.alamat}
          onChange={set("alamat")}
          placeholder="Alamat lengkap"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            create.isPending ||
            !form.nama_lengkap ||
            !form.tahun_ajaran_id ||
            !form.tanggal_lahir
          }
          className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {create.isPending ? "Menyimpan..." : "Simpan Pendaftar"}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PpdbCalonSiswa() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Sync URL params → state
  useEffect(() => {
    const s = searchParams.get("status") ?? "";
    setStatus(s);
    setPage(1);
  }, [searchParams]);

  const params = { search, status: status || undefined, page, per_page: 15 };
  const { data, isLoading } = useCalonSiswaList(params);
  const deleteMut = useDeleteCalonSiswa();

  const list = data?.data?.data ?? [];
  const meta = data?.data ?? {};

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleStatusFilter = (val) => {
    setStatus(val);
    setPage(1);
    const p = new URLSearchParams(searchParams);
    if (val) p.set("status", val);
    else p.delete("status");
    setSearchParams(p);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMut.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Link to="/adminppdb" className="hover:text-blue-600">
              Dashboard
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-semibold">
              Data Calon Siswa
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={22} className="text-blue-500" />
            Data Calon Siswa PPDB
          </h1>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm w-fit"
        >
          <Plus size={16} />
          Tambah Pendaftar
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              placeholder="Cari nama, no. pendaftaran, no. HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <select
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-600"
            value={status}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Cari
          </button>
          {(search || status) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                handleStatusFilter("");
              }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-1"
            >
              <X size={14} /> Reset
            </button>
          )}
        </form>
      </div>

      {/* Tabel */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  No. Daftar
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Nama
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">
                  Jalur
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">
                  Tgl. Daftar
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Tidak ada data pendaftar</p>
                    <p className="text-xs mt-1">
                      Coba ubah filter atau tambah pendaftar baru
                    </p>
                  </td>
                </tr>
              ) : (
                list.map((calon) => (
                  <tr
                    key={calon.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {calon.no_pendaftaran ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {calon.nama_lengkap}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {calon.jenis_kelamin === "L"
                            ? "Laki-laki"
                            : "Perempuan"}
                          {calon.asal_sekolah ? ` · ${calon.asal_sekolah}` : ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {calon.jalur ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell whitespace-nowrap">
                      {calon.created_at
                        ? new Date(calon.created_at).toLocaleDateString(
                            "id-ID",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={calon.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() =>
                            navigate(`/adminppdb/calon-siswa/${calon.id}`)
                          }
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye size={15} />
                        </button>
                        {calon.status !== "converted" && (
                          <button
                            onClick={() => setDeleteId(calon.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              {meta.from}–{meta.to} dari {meta.total} pendaftar
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 font-semibold text-gray-700">
                {page} / {meta.last_page}
              </span>
              <button
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tambah Calon Siswa"
        size="xl"
      >
        <FormTambahCalonSiswa onClose={() => setModalOpen(false)} />
      </Modal>

      {/* Confirm Hapus */}
      <Confirm
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleteMut.isPending}
        title="Hapus Data Pendaftar?"
        message="Data calon siswa ini akan dihapus permanen dan tidak bisa dikembalikan."
        confirmLabel="Ya, Hapus"
        variant="danger"
      />
    </div>
  );
}
