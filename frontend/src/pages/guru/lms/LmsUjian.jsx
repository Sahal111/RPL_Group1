import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  FileQuestion,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useUjianList,
  useUjianDetail,
  useCreateUjian,
  useUpdateUjian,
  useDeleteUjian,
  useTogglePublishUjian,
  useStoreSoal,
  useUpdateSoal,
  useDeleteSoal,
  useUjianSessions,
  useNilaiEsai,
} from "../../../hooks/api/useLms";
import Modal from "../../../components/ui/Modal";
import Confirm from "../../../components/ui/Confirm";

// ── Constants ────────────────────────────────────────────────────────────────

const TIPE_UJIAN = ["ulangan_harian", "uts", "uas", "formatif", "sumatif"];
const TIPE_SOAL = [
  { value: "pilihan_ganda", label: "Pilihan Ganda" },
  { value: "benar_salah", label: "Benar/Salah" },
  { value: "esai", label: "Esai" },
  { value: "isian_singkat", label: "Isian Singkat" },
];

const INITIAL_UJIAN = {
  judul: "",
  deskripsi: "",
  tipe: "ulangan_harian",
  waktu_mulai: "",
  waktu_selesai: "",
  nilai_lulus: 70,
  acak_soal: false,
  acak_pilihan: false,
  tampilkan_skor_langsung: true,
  boleh_buka_lagi: false,
  is_published: false,
};

const INITIAL_SOAL = {
  pertanyaan: "",
  tipe: "pilihan_ganda",
  pilihan: ["", "", "", ""],
  jawaban_benar: "",
  bobot: 1,
  pembahasan: "",
};

// ── Helper ───────────────────────────────────────────────────────────────────

function formatDt(val) {
  if (!val) return "—";
  return new Date(val).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── UjianForm ────────────────────────────────────────────────────────────────

function UjianForm({
  defaultValues = INITIAL_UJIAN,
  onClose,
  isEdit = false,
  id,
}) {
  const [form, setForm] = useState(defaultValues);
  const create = useCreateUjian();
  const update = useUpdateUjian(id);
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
          Judul Ujian *
        </label>
        <input
          required
          value={form.judul}
          onChange={(e) => set("judul", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          placeholder="cth: UTS Matematika Semester 1"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tipe Ujian
          </label>
          <select
            value={form.tipe}
            onChange={(e) => set("tipe", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {TIPE_UJIAN.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nilai Lulus
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.nilai_lulus}
            onChange={(e) => set("nilai_lulus", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Waktu Mulai *
          </label>
          <input
            required
            type="datetime-local"
            value={form.waktu_mulai}
            onChange={(e) => set("waktu_mulai", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Waktu Selesai *
          </label>
          <input
            required
            type="datetime-local"
            value={form.waktu_selesai}
            onChange={(e) => set("waktu_selesai", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Pengaturan
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "acak_soal", label: "Acak urutan soal" },
            { key: "acak_pilihan", label: "Acak pilihan jawaban" },
            {
              key: "tampilkan_skor_langsung",
              label: "Tampilkan skor langsung",
            },
            { key: "boleh_buka_lagi", label: "Boleh mengerjakan ulang" },
            { key: "is_published", label: "Publish langsung" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600"
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
              : "Buat Ujian"}
        </button>
      </div>
    </form>
  );
}

// ── SoalForm ─────────────────────────────────────────────────────────────────

function SoalForm({
  ujianId,
  defaultValues = INITIAL_SOAL,
  onClose,
  isEdit = false,
  questionId,
}) {
  const [form, setForm] = useState(defaultValues);
  const create = useStoreSoal(ujianId);
  const update = useUpdateSoal(ujianId);
  const mut = isEdit ? update : create;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      pilihan:
        form.tipe === "pilihan_ganda"
          ? form.pilihan.filter(Boolean)
          : undefined,
    };
    if (isEdit) {
      await mut.mutateAsync({ questionId, ...payload });
    } else {
      await mut.mutateAsync(payload);
    }
    onClose();
  };

  const isPG = form.tipe === "pilihan_ganda";
  const isBS = form.tipe === "benar_salah";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tipe Soal
          </label>
          <select
            value={form.tipe}
            onChange={(e) => set("tipe", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {TIPE_SOAL.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Bobot Nilai
          </label>
          <input
            type="number"
            min={1}
            value={form.bobot}
            onChange={(e) => set("bobot", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Pertanyaan *
        </label>
        <textarea
          required
          value={form.pertanyaan}
          onChange={(e) => set("pertanyaan", e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
          placeholder="Tulis pertanyaan di sini..."
        />
      </div>

      {isPG && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Pilihan Jawaban
          </label>
          {form.pilihan.map((p, i) => (
            <input
              key={i}
              value={p}
              onChange={(e) => {
                const updated = [...form.pilihan];
                updated[i] = e.target.value;
                set("pilihan", updated);
              }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 mb-2"
              placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
            />
          ))}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Jawaban Benar *
          {isPG && (
            <span className="text-gray-400 font-normal">
              {" "}
              (ketik pilihan yang benar, cth: A)
            </span>
          )}
          {isBS && (
            <span className="text-gray-400 font-normal"> (Benar / Salah)</span>
          )}
        </label>
        {isBS ? (
          <select
            value={form.jawaban_benar}
            onChange={(e) => set("jawaban_benar", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="">Pilih...</option>
            <option value="Benar">Benar</option>
            <option value="Salah">Salah</option>
          </select>
        ) : (
          <input
            value={form.jawaban_benar}
            onChange={(e) => set("jawaban_benar", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            placeholder={isPG ? "cth: A" : "Jawaban yang diharapkan..."}
          />
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Pembahasan (opsional)
        </label>
        <textarea
          value={form.pembahasan}
          onChange={(e) => set("pembahasan", e.target.value)}
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
          placeholder="Penjelasan jawaban untuk siswa..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={mut.isPending}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium"
        >
          {mut.isPending ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah Soal"}
        </button>
      </div>
    </form>
  );
}

// ── Detail Ujian (soal + hasil) ───────────────────────────────────────────────

function UjianDetail({ ujianId, onBack }) {
  const { data: ujian, isLoading } = useUjianDetail(ujianId);
  const { data: sessions } = useUjianSessions(ujianId);
  const deleteSoal = useDeleteSoal(ujianId);
  const nilaiEsai = useNilaiEsai(ujianId);

  const [tab, setTab] = useState("soal"); // soal | hasil
  const [soalModal, setSoalModal] = useState(null);
  const [deleteSoalTarget, setDeleteSoalTarget] = useState(null);
  const [nilaiTarget, setNilaiTarget] = useState(null);
  const [nilaiInput, setNilaiInput] = useState("");

  if (isLoading)
    return (
      <div className="p-8 text-center text-sm text-gray-400">Memuat...</div>
    );
  if (!ujian) return null;

  const soalList = ujian.questions ?? [];
  const sessionList = sessions ?? [];

  return (
    <div className="space-y-5">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-800">{ujian.judul}</h2>
          <p className="text-xs text-gray-400">
            {formatDt(ujian.waktu_mulai)} — {formatDt(ujian.waktu_selesai)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded-lg">
            {soalList.length} soal
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded-lg">
            {sessionList.length} sesi
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: "soal", label: "Soal" },
          { key: "hasil", label: "Hasil Siswa" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Soal */}
      {tab === "soal" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setSoalModal({ mode: "create" })}
              className="flex items-center gap-2 bg-primary-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              Tambah Soal
            </button>
          </div>

          {soalList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <FileQuestion className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Belum ada soal. Tambahkan soal pertama!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {soalList.map((soal, idx) => (
                <div
                  key={soal.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-50 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{soal.pertanyaan}</p>
                    <div className="flex gap-2 mt-1.5">
                      <span className="text-xs text-gray-400">
                        {TIPE_SOAL.find((t) => t.value === soal.tipe)?.label}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
                        Bobot: {soal.bobot}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-1 shrink-0">
                    <button
                      onClick={() =>
                        setSoalModal({
                          mode: "edit",
                          data: {
                            questionId: soal.id,
                            pertanyaan: soal.pertanyaan,
                            tipe: soal.tipe,
                            pilihan: soal.pilihan ?? ["", "", "", ""],
                            jawaban_benar: soal.jawaban_benar ?? "",
                            bobot: soal.bobot,
                            pembahasan: soal.pembahasan ?? "",
                          },
                        })
                      }
                      className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteSoalTarget(soal)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Hasil Siswa */}
      {tab === "hasil" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {sessionList.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-gray-400">
                Belum ada siswa yang mengerjakan ujian ini.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Siswa
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nilai
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Lulus
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sessionList.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800">
                        {s.siswa?.nama_lengkap}
                      </p>
                      <p className="text-xs text-gray-400">{s.siswa?.nisn}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          s.status === "submitted"
                            ? "bg-blue-50 text-blue-700"
                            : s.status === "in_progress"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-700">
                      {s.nilai_akhir ?? (
                        <span className="text-gray-400 font-normal text-xs">
                          Perlu dinilai
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {s.lulus === null ? (
                        "—"
                      ) : s.lulus ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {s.status === "submitted" && s.nilai_akhir === null && (
                        <button
                          onClick={() => {
                            setNilaiTarget(s);
                            setNilaiInput("");
                          }}
                          className="text-xs font-medium text-primary-600 hover:text-primary-800"
                        >
                          Nilai Esai
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Soal */}
      <Modal
        isOpen={Boolean(soalModal)}
        onClose={() => setSoalModal(null)}
        title={soalModal?.mode === "edit" ? "Edit Soal" : "Tambah Soal"}
        size="md"
      >
        {soalModal && (
          <SoalForm
            ujianId={ujianId}
            defaultValues={soalModal.data ?? INITIAL_SOAL}
            isEdit={soalModal.mode === "edit"}
            questionId={soalModal.data?.questionId}
            onClose={() => setSoalModal(null)}
          />
        )}
      </Modal>

      {/* Confirm Hapus Soal */}
      <Confirm
        isOpen={Boolean(deleteSoalTarget)}
        onClose={() => setDeleteSoalTarget(null)}
        onConfirm={async () => {
          await deleteSoal.mutateAsync(deleteSoalTarget.id);
          setDeleteSoalTarget(null);
        }}
        title="Hapus Soal"
        message="Soal ini akan dihapus dan nomor urut akan diperbarui. Lanjutkan?"
        isLoading={deleteSoal.isPending}
      />

      {/* Modal Nilai Esai */}
      <Modal
        isOpen={Boolean(nilaiTarget)}
        onClose={() => setNilaiTarget(null)}
        title="Input Nilai Esai"
        size="sm"
      >
        {nilaiTarget && (
          <div className="space-y-4 p-1">
            <div>
              <p className="text-sm text-gray-600">Siswa</p>
              <p className="font-medium text-gray-800">
                {nilaiTarget.siswa?.nama_lengkap}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nilai Akhir (0–100) *
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={nilaiInput}
                onChange={(e) => setNilaiInput(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNilaiTarget(null)}
                className="px-4 py-2 text-sm text-gray-600"
              >
                Batal
              </button>
              <button
                disabled={nilaiEsai.isPending || nilaiInput === ""}
                onClick={async () => {
                  await nilaiEsai.mutateAsync({
                    sessionId: nilaiTarget.id,
                    nilai_akhir: Number(nilaiInput),
                  });
                  setNilaiTarget(null);
                }}
                className="px-4 py-2 bg-primary-600 text-white text-sm rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium"
              >
                {nilaiEsai.isPending ? "Menyimpan..." : "Simpan Nilai"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LmsUjian() {
  const [filter, setFilter] = useState({
    search: "",
    tipe: "",
    is_published: "",
  });
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailView, setDetailView] = useState(null);

  const { data, isLoading } = useUjianList(filter);
  const togglePublish = useTogglePublishUjian();
  const deleteUjian = useDeleteUjian();

  const items = data?.data?.data ?? data?.data ?? [];

  if (detailView) {
    return (
      <UjianDetail ujianId={detailView} onBack={() => setDetailView(null)} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Ujian</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Buat ujian, kelola soal, dan pantau hasil siswa
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Buat Ujian
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          placeholder="Cari judul ujian..."
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 w-56"
        />
        <select
          value={filter.tipe}
          onChange={(e) => setFilter((f) => ({ ...f, tipe: e.target.value }))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="">Semua Tipe</option>
          {TIPE_UJIAN.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ").toUpperCase()}
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
            <FileQuestion className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              Belum ada ujian. Buat ujian pertama!
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ujian
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Soal / Sesi
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
                    <button
                      onClick={() => setDetailView(item.id)}
                      className="font-medium text-gray-800 hover:text-primary-600 text-left"
                    >
                      {item.judul}
                    </button>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.tipe?.replace(/_/g, " ").toUpperCase()}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs text-gray-500">
                      {formatDt(item.waktu_mulai)}
                    </p>
                    <p className="text-xs text-gray-400">
                      s/d {formatDt(item.waktu_selesai)}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.is_published ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {item.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {item.questions_count ?? 0} soal ·{" "}
                    {item.sessions_count ?? 0} sesi
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
                        onClick={() =>
                          setModal({
                            mode: "edit",
                            data: {
                              id: item.id,
                              judul: item.judul,
                              deskripsi: item.deskripsi ?? "",
                              tipe: item.tipe,
                              waktu_mulai: item.waktu_mulai?.slice(0, 16) ?? "",
                              waktu_selesai:
                                item.waktu_selesai?.slice(0, 16) ?? "",
                              nilai_lulus: item.nilai_lulus,
                              acak_soal: item.acak_soal,
                              acak_pilihan: item.acak_pilihan,
                              tampilkan_skor_langsung:
                                item.tampilkan_skor_langsung,
                              boleh_buka_lagi: item.boleh_buka_lagi,
                              is_published: item.is_published,
                            },
                          })
                        }
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

      {/* Modal */}
      <Modal
        isOpen={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Edit Ujian" : "Buat Ujian"}
        size="md"
      >
        {modal && (
          <UjianForm
            defaultValues={modal.data ?? INITIAL_UJIAN}
            isEdit={modal.mode === "edit"}
            id={modal.data?.id}
            onClose={() => setModal(null)}
          />
        )}
      </Modal>

      <Confirm
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteUjian.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Hapus Ujian"
        message={`Ujian "${deleteTarget?.judul}" akan dihapus. Ujian yang sudah memiliki sesi tidak dapat dihapus.`}
        isLoading={deleteUjian.isPending}
      />
    </div>
  );
}
