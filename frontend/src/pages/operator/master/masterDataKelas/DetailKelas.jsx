import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, UserMinus, X, Search } from "lucide-react";

const statusMasukOpts = ["Baru", "Naik Kelas", "Tinggal Kelas", "Mutasi Masuk"];
const statusKeluarOpts = [
  "Naik Kelas",
  "Lulus",
  "Mutasi Keluar",
  "Dropout",
  "Meninggal",
];

function ModalTambahSiswa({
  open,
  onClose,
  idKelas,
  tahunAjaran,
  semester,
  queryClient,
}) {
  const [form, setForm] = useState({
    nisn: "",
    status_masuk: "Baru",
    tahun_ajaran: tahunAjaran ?? "",
    semester: semester ?? "1",
  });
  const [searchSiswa, setSearchSiswa] = useState("");

  const { data: siswaList } = useQuery({
    queryKey: ["siswa-search", searchSiswa],
    queryFn: () =>
      api
        .get("/operator/master-data/siswa", {
          params: { search: searchSiswa, status: "Aktif" },
        })
        .then((r) => r.data.data.data),
    enabled: searchSiswa.length > 2,
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      api.post(`/operator/master-data/kelas/${idKelas}/siswa`, data),
    onSuccess: () => {
      toast.success("Siswa berhasil ditambahkan ke kelas.");
      queryClient.invalidateQueries(["kelas-detail", idKelas]);
      onClose();
      setForm({
        nisn: "",
        status_masuk: "Baru",
        tahun_ajaran: tahunAjaran ?? "",
        semester: semester ?? "1",
      });
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">Tambah Siswa ke Kelas</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Cari siswa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Siswa
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchSiswa}
                onChange={(e) => setSearchSiswa(e.target.value)}
                className="input-field pl-9"
                placeholder="Ketik nama atau NISN (min. 3 karakter)"
              />
            </div>
            {siswaList && siswaList.length > 0 && !form.nisn && (
              <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {siswaList.slice(0, 5).map((s) => (
                  <button
                    key={s.nisn}
                    onClick={() => {
                      setForm((f) => ({ ...f, nisn: s.nisn }));
                      setSearchSiswa(s.nama_lengkap);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                  >
                    <p className="font-medium text-gray-800">
                      {s.nama_lengkap}
                    </p>
                    <p className="text-xs text-gray-400">NISN: {s.nisn}</p>
                  </button>
                ))}
              </div>
            )}
            {form.nisn && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                ✓ NISN: {form.nisn} dipilih
              </p>
            )}
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Absen <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.no_absen}
              onChange={(e) =>
                setForm((f) => ({ ...f, no_absen: e.target.value }))
              }
              className="input-field"
              placeholder="1"
              min="1"
            />
          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Masuk <span className="text-red-500">*</span>
            </label>
            <select
              value={form.status_masuk}
              onChange={(e) =>
                setForm((f) => ({ ...f, status_masuk: e.target.value }))
              }
              className="input-field"
            >
              {statusMasukOpts.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun Ajaran
            </label>
            <input
              value={form.tahun_ajaran}
              onChange={(e) =>
                setForm((f) => ({ ...f, tahun_ajaran: e.target.value }))
              }
              className="input-field"
              placeholder="2025/2026"
            />
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t">
          <button onClick={onClose} className="btn-secondary flex-1">
            Batal
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.nisn}
            className="btn-primary flex-1"
          >
            {mutation.isPending ? "Menyimpan..." : "Tambah"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalKeluarkanSiswa({ open, onClose, idKelas, siswa, queryClient }) {
  const [statusKeluar, setStatusKeluar] = useState("Lulus");
  const [alasan, setAlasan] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api.patch(
        `/operator/master-data/kelas/${idKelas}/siswa/${siswa.id}/keluar`,
        { status_keluar: statusKeluar, alasan_keluar: alasan || null },
      ),
    onSuccess: () => {
      toast.success("Siswa berhasil dikeluarkan dari kelas.");
      queryClient.invalidateQueries(["kelas-detail", idKelas]);
      onClose();
      setStatusKeluar("Lulus");
      setAlasan("");
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  if (!open || !siswa) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">
            Keluarkan {siswa.siswa?.nama_lengkap}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Keluar <span className="text-red-500">*</span>
            </label>
            <select
              value={statusKeluar}
              onChange={(e) => setStatusKeluar(e.target.value)}
              className="input-field"
            >
              {statusKeluarOpts.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alasan (opsional)
            </label>
            <textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Contoh: Pindah ke sekolah lain"
            />
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t">
          <button onClick={onClose} className="btn-secondary flex-1">
            Batal
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="btn-primary flex-1"
          >
            {mutation.isPending ? "Menyimpan..." : "Keluarkan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DetailKelas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalTambah, setModalTambah] = useState(false);

  const { data: kelas, isLoading } = useQuery({
    queryKey: ["kelas-detail", id],
    queryFn: () =>
      api.get(`/operator/master-data/kelas/${id}`).then((r) => r.data.data),
  });

  const [siswaKeluarDipilih, setSiswaKeluarDipilih] = useState(null);

  const batalkanKeluar = useMutation({
    mutationFn: (siswaKelasId) =>
      api.patch(
        `/operator/master-data/kelas/${id}/siswa/${siswaKelasId}/batalkan-keluar`,
      ),
    onSuccess: () => {
      toast.success("Siswa dikembalikan ke status aktif.");
      queryClient.invalidateQueries(["kelas-detail", id]);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );

  if (!kelas)
    return (
      <div className="text-center py-20 text-gray-400">
        Data kelas tidak ditemukan.
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/operator/master/kelas")}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">
            {kelas.nama_kelas}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Detail kelas dan daftar siswa
          </p>
        </div>
        <button
          onClick={() => setModalTambah(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Siswa
        </button>
      </div>

      {/* Info Kelas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">
            {kelas.total_siswa}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Siswa</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-700">{kelas.kapasitas}</p>
          <p className="text-xs text-gray-500 mt-1">Kapasitas</p>
        </div>
        <div className="card text-center">
          <p className="text-lg font-bold text-gray-700">
            Kelas {kelas.tingkat}
          </p>
          <p className="text-xs text-gray-500 mt-1">Tingkat</p>
        </div>
        <div className="card text-center">
          <p className="text-lg font-bold text-gray-700">
            Smt {kelas.semester}
          </p>
          <p className="text-xs text-gray-500 mt-1">Semester</p>
        </div>
      </div>

      {/* Info detail */}
      <div className="card mb-6">
        <div className="grid grid-cols-3 gap-4">
          <InfoItem
            label="Wali Kelas"
            value={kelas.wali?.nama_lengkap ?? "Belum ditentukan"}
          />
          <InfoItem label="Ruangan" value={kelas.ruangan ?? "-"} />
          <InfoItem label="Kurikulum" value={kelas.kurikulum} />
          <InfoItem
            label="Tahun Ajaran"
            value={kelas.tahun_ajaran?.nama ?? "-"}
          />
          <InfoItem label="ID Kelas" value={kelas.id} mono />
          <InfoItem
            label="Status"
            value={kelas.is_active ? "Aktif" : "Non-aktif"}
          />
        </div>
      </div>

      {/* Daftar Siswa */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Daftar Siswa Aktif</h2>
          <span className="text-sm text-gray-500">
            {kelas.siswa?.length ?? 0} siswa
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 text-gray-500 font-medium w-12">
                No
              </th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                Nama Siswa
              </th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                NISN
              </th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                L/P
              </th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                Status Masuk
              </th>
              <th className="text-right px-6 py-3 text-gray-500 font-medium">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {!kelas.siswa || kelas.siswa.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  Belum ada siswa di kelas ini.
                </td>
              </tr>
            ) : (
              kelas.siswa.map((sk) => (
                <tr key={sk.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 font-medium">
                    {sk.no_absen ?? "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${sk.siswa?.jenis_kelamin === "L" ? "bg-blue-100" : "bg-pink-100"}`}
                      >
                        {sk.siswa?.foto ? (
                          <img
                            src={`http://127.0.0.1:8001/storage/${sk.siswa.foto}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span
                            className={`font-semibold text-xs ${sk.siswa?.jenis_kelamin === "L" ? "text-blue-700" : "text-pink-700"}`}
                          >
                            {sk.siswa?.nama_lengkap?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-800">
                        {sk.siswa?.nama_lengkap}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    {sk.nisn}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${sk.siswa?.jenis_kelamin === "L" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"}`}
                    >
                      {sk.siswa?.jenis_kelamin === "L" ? "L" : "P"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      {sk.status_masuk}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setSiswaKeluarDipilih(sk)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        title="Keluarkan dari kelas"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Riwayat Siswa Keluar */}
      <div className="card p-0 overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Riwayat Siswa Keluar</h2>
          <span className="text-sm text-gray-500">
            {kelas.siswa_keluar?.length ?? 0} siswa
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                Nama Siswa
              </th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                NISN
              </th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                Status Keluar
              </th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                Tanggal Keluar
              </th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">
                Alasan
              </th>
              <th className="text-right px-6 py-3 text-gray-500 font-medium">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {!kelas.siswa_keluar || kelas.siswa_keluar.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  Belum ada siswa yang keluar dari kelas ini.
                </td>
              </tr>
            ) : (
              kelas.siswa_keluar.map((sk) => (
                <tr key={sk.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {sk.siswa?.nama_lengkap}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    {sk.nisn}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        sk.status_keluar === "Lulus"
                          ? "bg-green-50 text-green-700"
                          : sk.status_keluar === "Mutasi Keluar"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {sk.status_keluar}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {sk.tanggal_keluar ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {sk.alasan_keluar ?? "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => batalkanKeluar.mutate(sk.id)}
                        disabled={batalkanKeluar.isPending}
                        className="text-xs font-medium text-primary-600 hover:underline"
                        title="Kembalikan ke status aktif"
                      >
                        Batalkan
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModalTambahSiswa
        open={modalTambah}
        onClose={() => setModalTambah(false)}
        idKelas={id}
        tahunAjaran={kelas.tahun_ajaran?.nama}
        semester={kelas.semester}
        queryClient={queryClient}
      />

      <ModalKeluarkanSiswa
        open={!!siswaKeluarDipilih}
        onClose={() => setSiswaKeluarDipilih(null)}
        idKelas={id}
        siswa={siswaKeluarDipilih}
        queryClient={queryClient}
      />
    </div>
  );
}

function InfoItem({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p
        className={`text-sm text-gray-700 ${mono ? "font-mono" : "font-medium"}`}
      >
        {value}
      </p>
    </div>
  );
}
