import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Users,
  ClipboardCheck,
  ChevronLeft,
} from "lucide-react";
import {
  useTugasList,
  useCreateTugas,
  useUpdateTugas,
  useDeleteTugas,
  useTogglePublishTugas,
  useTugasSubmissions,
  useNilaiSubmission,
} from "../../../hooks/api/useLms";
import Modal from "../../../components/ui/Modal";
import Confirm from "../../../components/ui/Confirm";

// ── Constants ────────────────────────────────────────────────────────────────

const TIPE_OPTS = ["individu", "kelompok"];
const LATE_POLICY_OPTS = [
  { value: "accept", label: "Terima (tanpa penalti)" },
  { value: "penalty", label: "Terima dengan penalti" },
  { value: "reject", label: "Tolak" },
];

const STATUS_BADGE = {
  submitted: "bg-blue-50 text-blue-700",
  late: "bg-orange-50 text-orange-700",
  graded: "bg-emerald-50 text-emerald-700",
  draft: "bg-gray-100 text-gray-500",
};

const INITIAL_FORM = {
  judul: "",
  instruksi: "",
  tipe: "individu",
  batas_pengumpulan: "",
  late_policy: "accept",
  late_penalty_persen: "",
  nilai_maksimal: 100,
  boleh_revisi: false,
  is_published: false,
};

// ── Sub-components ───────────────────────────────────────────────────────────

function TugasForm({
  defaultValues = INITIAL_FORM,
  onClose,
  isEdit = false,
  id,
}) {
  const [form, setForm] = useState(defaultValues);
  const [file, setFile] = useState(null);

  const create = useCreateTugas();
  const update = useUpdateTugas(id);
  const mut = isEdit ? update : create;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) fd.append(k, String(v));
    });
    if (file) fd.append("lampiran", file);
    await mut.mutateAsync(fd);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Judul Tugas *
        </label>
        <input
          required
          value={form.judul}
          onChange={(e) => set("judul", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          placeholder="cth: Tugas Bab 3 - Persamaan Linear"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Instruksi *
        </label>
        <textarea
          required
          value={form.instruksi}
          onChange={(e) => set("instruksi", e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
          placeholder="Jelaskan apa yang harus dikerjakan siswa..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tipe
          </label>
          <select
            value={form.tipe}
            onChange={(e) => set("tipe", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {TIPE_OPTS.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nilai Maksimal
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={form.nilai_maksimal}
            onChange={(e) => set("nilai_maksimal", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Batas Pengumpulan *
        </label>
        <input
          required
          type="datetime-local"
          value={form.batas_pengumpulan}
          onChange={(e) => set("batas_pengumpulan", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Kebijakan Terlambat
        </label>
        <select
          value={form.late_policy}
          onChange={(e) => set("late_policy", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          {LATE_POLICY_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {form.late_policy === "penalty" && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Penalti (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.late_penalty_persen}
            onChange={(e) => set("late_penalty_persen", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            placeholder="cth: 20 (artinya 20% potongan)"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Lampiran{" "}
          {isEdit ? "(opsional, kosongkan jika tidak diganti)" : "(opsional)"}
        </label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.boleh_revisi}
            onChange={(e) => set("boleh_revisi", e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-600">Boleh revisi</span>
        </label>
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
              : "Tambah Tugas"}
        </button>
      </div>
    </form>
  );
}

function NilaiForm({ tugasId, submission, onClose }) {
  const [form, setForm] = useState({
    nilai: submission.nilai ?? "",
    feedback_guru: submission.feedback_guru ?? "",
  });
  const nilaiMut = useNilaiSubmission(tugasId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await nilaiMut.mutateAsync({ submissionId: submission.id, ...form });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <p className="text-sm text-gray-600 mb-1">Siswa</p>
        <p className="font-medium text-gray-800">
          {submission.siswa?.nama_lengkap}
        </p>
        <p className="text-xs text-gray-400">{submission.siswa?.nisn}</p>
      </div>
      {submission.storage_path && (
        <div>
          <p className="text-xs text-gray-500 mb-1">File Tugas</p>
          <p className="text-xs text-primary-600 truncate">
            {submission.storage_path}
          </p>
        </div>
      )}
      {submission.catatan_siswa && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Catatan Siswa</p>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
            {submission.catatan_siswa}
          </p>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Nilai *
        </label>
        <input
          required
          type="number"
          min={0}
          max={100}
          value={form.nilai}
          onChange={(e) => setForm((f) => ({ ...f, nilai: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Feedback (opsional)
        </label>
        <textarea
          value={form.feedback_guru}
          onChange={(e) =>
            setForm((f) => ({ ...f, feedback_guru: e.target.value }))
          }
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
          placeholder="Berikan feedback untuk siswa..."
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
          disabled={nilaiMut.isPending}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium"
        >
          {nilaiMut.isPending ? "Menyimpan..." : "Simpan Nilai"}
        </button>
      </div>
    </form>
  );
}

function SubmissionPanel({ tugas, onBack }) {
  const { data, isLoading } = useTugasSubmissions(tugas.id);
  const [nilaiTarget, setNilaiTarget] = useState(null);
  const submissions = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-semibold text-gray-800">{tugas.judul}</h2>
          <p className="text-xs text-gray-400">Daftar pengumpulan siswa</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Memuat...</div>
        ) : submissions.length === 0 ? (
          <div className="p-10 text-center">
            <ClipboardCheck className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Belum ada siswa yang mengumpulkan.
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
                  Dikumpulkan
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nilai
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800">
                      {s.siswa?.nama_lengkap}
                    </p>
                    <p className="text-xs text-gray-400">{s.siswa?.nisn}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[s.status] ?? "bg-gray-100 text-gray-500"}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {s.submitted_at
                      ? new Date(s.submitted_at).toLocaleString("id-ID")
                      : "—"}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-700">
                    {s.nilai ?? (
                      <span className="text-gray-400 font-normal">
                        Belum dinilai
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setNilaiTarget(s)}
                      className="text-xs font-medium text-primary-600 hover:text-primary-800"
                    >
                      {s.status === "graded" ? "Edit Nilai" : "Nilai"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={Boolean(nilaiTarget)}
        onClose={() => setNilaiTarget(null)}
        title="Penilaian Tugas"
        size="sm"
      >
        {nilaiTarget && (
          <NilaiForm
            tugasId={tugas.id}
            submission={nilaiTarget}
            onClose={() => setNilaiTarget(null)}
          />
        )}
      </Modal>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function LmsTugas() {
  const [filter, setFilter] = useState({ search: "", is_published: "" });
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submissionView, setSubmissionView] = useState(null);

  const { data, isLoading } = useTugasList(filter);
  const togglePublish = useTogglePublishTugas();
  const deleteTugas = useDeleteTugas();

  const items = data?.data?.data ?? data?.data ?? [];

  if (submissionView) {
    return (
      <SubmissionPanel
        tugas={submissionView}
        onBack={() => setSubmissionView(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Tugas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Buat dan kelola tugas untuk siswa
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Tugas
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          placeholder="Cari judul tugas..."
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 w-56"
        />
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
            <ClipboardCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              Belum ada tugas. Tambahkan yang pertama!
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tugas
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Batas
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pengumpulan
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => {
                const isOverdue =
                  item.batas_pengumpulan &&
                  new Date(item.batas_pengumpulan) < new Date();
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800">{item.judul}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Nilai maks: {item.nilai_maksimal} · {item.tipe}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      {item.batas_pengumpulan ? (
                        <span
                          className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-500"}`}
                        >
                          {new Date(item.batas_pengumpulan).toLocaleString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.is_published ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {item.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSubmissionView(item)}
                        className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 font-medium"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {item.submissions_count ?? 0} siswa
                      </button>
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
                                instruksi: item.instruksi ?? "",
                                tipe: item.tipe,
                                batas_pengumpulan:
                                  item.batas_pengumpulan?.slice(0, 16) ?? "",
                                late_policy: item.late_policy,
                                late_penalty_persen:
                                  item.late_penalty_persen ?? "",
                                nilai_maksimal: item.nilai_maksimal,
                                boleh_revisi: item.boleh_revisi,
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Edit Tugas" : "Tambah Tugas"}
        size="md"
      >
        {modal && (
          <TugasForm
            defaultValues={modal.data ?? INITIAL_FORM}
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
          await deleteTugas.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Hapus Tugas"
        message={`Tugas "${deleteTarget?.judul}" akan dihapus permanen. Lanjutkan?`}
        isLoading={deleteTugas.isPending}
      />
    </div>
  );
}
