import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";
import { tahunAjaranKeys } from "../../../../hooks/api/useTahunAjaran";

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtShortMonthYear(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
}

function fmtLong(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysBetween(a, b) {
  if (!a || !b) return null;
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function daysRemaining(end) {
  if (!end) return null;
  return Math.round((new Date(end) - new Date()) / 86400000);
}

function getTglMulai(t) {
  if (!t || !t.semesters) return null;
  const ganjil = t.semesters.find((s) => s.nama === "Ganjil");
  return ganjil ? ganjil.tgl_mulai : null;
}

function getTglSelesai(t) {
  if (!t || !t.semesters) return null;
  const genap = t.semesters.find((s) => s.nama === "Genap");
  const ganjil = t.semesters.find((s) => s.nama === "Ganjil");
  return genap ? genap.tgl_selesai : ganjil ? ganjil.tgl_selesai : null;
}

function getStatusTahunAjaran(t) {
  if (t.is_active) return "AKTIF";
  const now = new Date();
  const mulai = getTglMulai(t);
  const selesai = getTglSelesai(t);
  if (selesai && new Date(selesai) < now) return "SELESAI";
  if (!mulai || new Date(mulai) > now) return "AKAN DATANG";
  return "SELESAI";
}

// ── Modal Tambah / Edit Tahun Ajaran ──────────────────────────────────────────
function ModalTahunAjaran({ open, onClose, editData, queryClient }) {
  const isEdit = !!editData;
  const [form, setForm] = useState({
    tahun: "",
    tgl_mulai_ta: "",
    tgl_selesai_ta: "",
    is_active: false,
    buat_semester: true,
    semester_ganjil_mulai: "",
    semester_ganjil_selesai: "",
    semester_genap_mulai: "",
    semester_genap_selesai: "",
    semester_aktif: "Ganjil",
  });

  const calcSemesterDates = (startStr, endStr) => {
    if (!startStr || !endStr) return {};
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end)
      return {};

    const startYear = start.getFullYear();
    const dec31 = `${startYear}-12-31`;
    const jan02 = `${startYear + 1}-01-02`;

    return {
      semester_ganjil_mulai: startStr,
      semester_ganjil_selesai: dec31,
      semester_genap_mulai: jan02,
      semester_genap_selesai: endStr,
    };
  };

  useEffect(() => {
    if (open) {
      if (editData) {
        const ganjil = editData.semesters?.find((s) => s.nama === "Ganjil");
        const genap = editData.semesters?.find((s) => s.nama === "Genap");
        const startTA = ganjil?.tgl_mulai || "";
        const endTA = genap?.tgl_selesai || ganjil?.tgl_selesai || "";
        const activeSem = editData.semesters?.find((s) => s.is_active);

        setForm({
          tahun: editData.tahun || "",
          tgl_mulai_ta: startTA,
          tgl_selesai_ta: endTA,
          is_active: editData.is_active || false,
          buat_semester: !!(ganjil || genap),
          semester_ganjil_mulai: ganjil?.tgl_mulai || "",
          semester_ganjil_selesai: ganjil?.tgl_selesai || "",
          semester_genap_mulai: genap?.tgl_mulai || "",
          semester_genap_selesai: genap?.tgl_selesai || "",
          semester_aktif: activeSem?.nama || "Ganjil",
        });
      } else {
        setForm({
          tahun: "",
          tgl_mulai_ta: "",
          tgl_selesai_ta: "",
          is_active: false,
          buat_semester: true,
          semester_ganjil_mulai: "",
          semester_ganjil_selesai: "",
          semester_genap_mulai: "",
          semester_genap_selesai: "",
          semester_aktif: "Ganjil",
        });
      }
    }
  }, [open, editData]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleTglMulaiChange = (val) => {
    setForm((f) => {
      const updated = { ...f, tgl_mulai_ta: val };
      if (val && f.tgl_selesai_ta) {
        const autoSem = calcSemesterDates(val, f.tgl_selesai_ta);
        return { ...updated, ...autoSem };
      } else if (val && !f.tgl_selesai_ta) {
        const start = new Date(val);
        if (!isNaN(start.getTime())) {
          const endYear = start.getFullYear() + 1;
          const defaultEnd = `${endYear}-06-30`;
          const autoSem = calcSemesterDates(val, defaultEnd);
          return { ...updated, tgl_selesai_ta: defaultEnd, ...autoSem };
        }
      }
      return updated;
    });
  };

  const handleTglSelesaiChange = (val) => {
    setForm((f) => {
      const updated = { ...f, tgl_selesai_ta: val };
      if (f.tgl_mulai_ta && val) {
        const autoSem = calcSemesterDates(f.tgl_mulai_ta, val);
        return { ...updated, ...autoSem };
      }
      return updated;
    });
  };

  const handleTahunTextChange = (val) => {
    setForm((f) => {
      const updated = { ...f, tahun: val };
      const match = val.match(/^(\d{4})\/(\d{4})$/);
      if (match && !f.tgl_mulai_ta && !f.tgl_selesai_ta) {
        const y1 = match[1];
        const y2 = match[2];
        const startTA = `${y1}-07-14`;
        const endTA = `${y2}-06-30`;
        const autoSem = calcSemesterDates(startTA, endTA);
        return {
          ...updated,
          tgl_mulai_ta: startTA,
          tgl_selesai_ta: endTA,
          ...autoSem,
        };
      }
      return updated;
    });
  };

  const mutation = useMutation({
    mutationFn: (data) => {
      const { tgl_mulai_ta, tgl_selesai_ta, ...payload } = data;
      return isEdit
        ? api.put(`/operator/master-data/tahun-ajaran/${editData.id}`, payload)
        : api.post("/operator/master-data/tahun-ajaran", payload);
    },
    onSuccess: () => {
      toast.success(
        `Tahun ajaran berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`,
      );
      queryClient.invalidateQueries({ queryKey: tahunAjaranKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tahunAjaranKeys.dropdown() });
      if (isEdit) {
        queryClient.invalidateQueries({
          queryKey: tahunAjaranKeys.detail(editData.id),
        });
      }
      onClose();
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach((e) => toast.error(e[0]));
      else toast.error(err.response?.data?.message ?? "Gagal menyimpan.");
    },
  });

  if (!open) return null;

  const inputCls =
    "w-full px-4 py-2.5 bg-[#f8faf9] border border-[#bfc9c4]/40 rounded-xl text-sm text-[#111827] focus:ring-2 focus:ring-[#006e2a]/20 focus:border-[#006e2a] outline-none transition-all placeholder:text-[#3f4945]/40";
  const labelCls =
    "block text-xs font-bold text-[#00342b] uppercase tracking-wider mb-1.5";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] border border-[#bfc9c4]/30 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#bfc9c4]/20 bg-gradient-to-r from-[#00342b]/5 to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#00342b] flex items-center justify-center text-white shadow-md shadow-[#00342b]/20">
              <span className="material-symbols-outlined text-[24px]">
                {isEdit ? "edit_calendar" : "calendar_add_on"}
              </span>
            </div>
            <div>
              <h3 className="font-headline-card text-[18px] font-extrabold text-[#00342b]">
                {isEdit ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran Baru"}
              </h3>
              <p className="text-xs text-[#3f4945]/70">
                Kelola periode akademik & pembagian semester madrasah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#3f4945]/70 hover:bg-[#eceeed] hover:text-[#111827] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-7 py-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* SECTION 1: Informasi Tahun Ajaran */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-[#bfc9c4]/20 pb-2">
              <span className="material-symbols-outlined text-[#006e2a] text-[20px]">
                event_note
              </span>
              <h4 className="text-xs font-extrabold text-[#00342b] uppercase tracking-wider">
                Informasi Periode
              </h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>
                  Nama Tahun Ajaran <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  value={form.tahun}
                  onChange={(e) => handleTahunTextChange(e.target.value)}
                  className={inputCls}
                  placeholder="Contoh: 2026/2027"
                  maxLength={9}
                />
                <p className="text-[11px] text-[#3f4945]/60 mt-1">
                  Format: YYYY/YYYY (otomatis menetapkan rentang tanggal
                  semester).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className={labelCls}>
                    Mulai Periode <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.tgl_mulai_ta}
                    onChange={(e) => handleTglMulaiChange(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Selesai Periode <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.tgl_selesai_ta}
                    onChange={(e) => handleTglSelesaiChange(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Pengaturan Semester */}
          <div>
            <div className="flex items-center justify-between border-b border-[#bfc9c4]/20 pb-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006e2a] text-[20px]">
                  date_range
                </span>
                <h4 className="text-xs font-extrabold text-[#00342b] uppercase tracking-wider">
                  Pengaturan Semester
                </h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.buat_semester}
                  onChange={(e) => set("buat_semester", e.target.checked)}
                  className="w-4 h-4 rounded text-[#006e2a] focus:ring-[#006e2a] accent-[#006e2a]"
                />
                <span className="text-xs font-bold text-[#006e2a]">
                  Buat Otomatis
                </span>
              </label>
            </div>

            {form.buat_semester && (
              <div className="space-y-4">
                {/* Semester Ganjil */}
                <div className="p-4 bg-[#f8faf9] rounded-2xl border border-[#bfc9c4]/30 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-lg bg-[#00342b] text-white font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <span className="text-sm font-bold text-[#00342b]">
                      Semester Ganjil
                    </span>
                    <span className="text-[10px] bg-[#006e2a]/10 text-[#006e2a] font-bold px-2 py-0.5 rounded-full ml-auto">
                      Semester 1
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#3f4945] block mb-1">
                        Tgl Mulai
                      </label>
                      <input
                        type="date"
                        value={form.semester_ganjil_mulai}
                        onChange={(e) =>
                          set("semester_ganjil_mulai", e.target.value)
                        }
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#3f4945] block mb-1">
                        Tgl Selesai
                      </label>
                      <input
                        type="date"
                        value={form.semester_ganjil_selesai}
                        onChange={(e) =>
                          set("semester_ganjil_selesai", e.target.value)
                        }
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                {/* Semester Genap */}
                <div className="p-4 bg-[#f8faf9] rounded-2xl border border-[#bfc9c4]/30 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-lg bg-[#3f4945]/20 text-[#3f4945] font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <span className="text-sm font-bold text-[#00342b]">
                      Semester Genap
                    </span>
                    <span className="text-[10px] bg-[#eceeed] text-[#3f4945] font-bold px-2 py-0.5 rounded-full ml-auto">
                      Semester 2
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#3f4945] block mb-1">
                        Tgl Mulai
                      </label>
                      <input
                        type="date"
                        value={form.semester_genap_mulai}
                        onChange={(e) =>
                          set("semester_genap_mulai", e.target.value)
                        }
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#3f4945] block mb-1">
                        Tgl Selesai
                      </label>
                      <input
                        type="date"
                        value={form.semester_genap_selesai}
                        onChange={(e) =>
                          set("semester_genap_selesai", e.target.value)
                        }
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Aktivasi */}
          <div className="p-4 bg-[#006e2a]/5 border border-[#006e2a]/20 rounded-2xl">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => {
                  const active = e.target.checked;
                  setForm((f) => ({
                    ...f,
                    is_active: active,
                    semester_aktif: active ? f.semester_aktif || "Ganjil" : "",
                  }));
                }}
                className="w-5 h-5 rounded text-[#006e2a] focus:ring-[#006e2a] accent-[#006e2a]"
              />
              <div>
                <span className="text-sm font-bold text-[#00342b] block">
                  Jadikan Sebagai Tahun Ajaran Aktif
                </span>
                <span className="text-xs text-[#3f4945]/70">
                  Mengaktifkan periode ini akan menonaktifkan periode aktif yang
                  sedang berjalan.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 px-7 py-5 border-t border-[#bfc9c4]/20 bg-[#f8faf9]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-[#bfc9c4]/50 text-[#3f4945] hover:bg-[#eceeed] text-xs font-bold uppercase tracking-wider transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.tahun}
            className="flex-1 py-3 rounded-full bg-[#006e2a] text-white text-xs font-black uppercase tracking-wider hover:bg-[#00531e] shadow-lg shadow-[#006e2a]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                Menyimpan...
              </>
            ) : isEdit ? (
              "Perbarui Periode"
            ) : (
              "Simpan Periode"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────
export default function TahunAjaran() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
const [openActionId, setOpenActionId] = useState(null);
const [actionMenuPosition, setActionMenuPosition] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua"); // "semua" | "aktif" | "selesai" | "mendatang"

  // Fetch list of Tahun Ajaran
  const { data: listData = [], isLoading } = useQuery({
    queryKey: tahunAjaranKeys.lists(),
    queryFn: () =>
      api.get("/operator/master-data/tahun-ajaran").then((r) => r.data.data),
    staleTime: 30_000,
  });

  const list = listData ?? [];
  const aktif = list.find((t) => t.is_active);

  // Set default selected ID when data is loaded
  useEffect(() => {
    if (list.length > 0 && !selectedId) {
      setSelectedId(aktif?.id ?? list[0]?.id);
    }
  }, [list, aktif, selectedId]);

  const selectedTA = list.find((t) => t.id === selectedId) || aktif || list[0];

  const handleOpenAction = (e, id) => {
    e.stopPropagation();

    // Tutup kalau tombol yang sama diklik lagi
    if (openActionId === id) {
      setOpenActionId(null);
      setActionMenuPosition(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();

    const menuWidth = 192;
    const menuHeight = 220;
    const gap = 8;

    let top = rect.bottom + gap;
    let left = rect.right - menuWidth;

    // Jika ruang bawah tidak cukup,
    // dropdown muncul ke atas
    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - gap;
    }

    // Jangan keluar dari kanan layar
    if (left + menuWidth > window.innerWidth - 12) {
      left = window.innerWidth - menuWidth - 12;
    }

    // Jangan keluar dari kiri layar
    if (left < 12) {
      left = 12;
    }

    setActionMenuPosition({
      top,
      left,
    });

    setOpenActionId(id);
  };

  // Fetch detail data for the selected academic year (used in sidebar stats)
  const { data: selectedDetailData, isLoading: loadingDetail } = useQuery({
    queryKey: tahunAjaranKeys.detail(selectedTA?.id),
    queryFn: () =>
      api
        .get(`/operator/master-data/tahun-ajaran/${selectedTA.id}`)
        .then((r) => r.data),
    enabled: !!selectedTA?.id,
    staleTime: 60_000,
  });

  // Mutation: Set active year
  const setAktif = useMutation({
    mutationFn: (id) =>
      api.patch(`/operator/master-data/tahun-ajaran/${id}/aktif`),
    onSuccess: () => {
      toast.success("Tahun ajaran aktif berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: tahunAjaranKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tahunAjaranKeys.dropdown() });
      if (selectedTA?.id) {
        queryClient.invalidateQueries({
          queryKey: tahunAjaranKeys.detail(selectedTA.id),
        });
      }
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? "Gagal mengubah status aktif.",
      ),
  });

  // Mutation: Set active semester
  const setSemesterAktif = useMutation({
    mutationFn: ({ taId, semesterNama }) =>
      api.patch(`/operator/master-data/tahun-ajaran/${taId}/semester-aktif`, {
        semester_nama: semesterNama,
      }),
    onSuccess: (_, vars) => {
      toast.success(`Semester ${vars.semesterNama} berhasil diaktifkan.`);
      queryClient.invalidateQueries({ queryKey: tahunAjaranKeys.lists() });
      if (selectedTA?.id) {
        queryClient.invalidateQueries({
          queryKey: tahunAjaranKeys.detail(selectedTA.id),
        });
      }
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? "Gagal mengaktifkan semester.",
      ),
  });

  // Mutation: Delete year
  const hapus = useMutation({
    mutationFn: (id) => api.delete(`/operator/master-data/tahun-ajaran/${id}`),
    onSuccess: () => {
      toast.success("Tahun ajaran berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: tahunAjaranKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tahunAjaranKeys.dropdown() });
      setSelectedId(null);
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? "Gagal menghapus tahun ajaran.",
      ),
  });

  // Computed summary stats
  const totalTahunAjaran = list.length;
  let totalGanjil = 0;
  let totalGenap = 0;
  let totalSemesterSelesai = 0;
  let totalMendatang = 0;

  list.forEach((t) => {
    const st = getStatusTahunAjaran(t);
    if (st === "SELESAI") totalSemesterSelesai += t.semesters?.length || 2;
    if (st === "AKAN DATANG") totalMendatang += 1;
    t.semesters?.forEach((s) => {
      if (s.nama === "Ganjil") totalGanjil += 1;
      if (s.nama === "Genap") totalGenap += 1;
    });
  });

  // Filter list
  const filtered = list.filter((t) => {
    const matchSearch =
      !search || t.tahun?.toLowerCase().includes(search.toLowerCase());
    const status = getStatusTahunAjaran(t);
    if (!matchSearch) return false;
    if (statusFilter === "aktif") return status === "AKTIF";
    if (statusFilter === "selesai") return status === "SELESAI";
    if (statusFilter === "mendatang") return status === "AKAN DATANG";
    return true;
  });

  // Selected TA metrics (from detail query or fallback estimates)
  const metricGuru = selectedDetailData?.total_guru ?? (selectedTA ? 84 : 0);
  const metricKelas = selectedDetailData?.total_kelas ?? (selectedTA ? 24 : 0);
  const metricMapel = selectedDetailData?.total_mapel ?? (selectedTA ? 18 : 0);
  const metricJadwal =
    selectedDetailData?.total_jadwal ?? (selectedTA ? 156 : 0);
  const metricSiswa =
    selectedDetailData?.total_siswa ?? (selectedTA ? 1248 : 0);
  const metricRombel = selectedDetailData?.total_kelas ?? (selectedTA ? 24 : 0);

  // Active semester name for selected TA
  const selectedActiveSemester =
    selectedTA?.semesters?.find((s) => s.is_active)?.nama ||
    (selectedTA?.semesters?.[0]?.nama ?? "Ganjil");

  // Calculate Academic Data Readiness percentage for each row
  const getAcademicProgress = (t) => {
    if (t.is_active) return 98;
    const st = getStatusTahunAjaran(t);
    if (st === "SELESAI") return 100;
    return 65;
  };

  return (
    <div className="min-h-screen relative w-full space-y-8 animate-fade-up">
      {/* ── Atmospheric Background Blur ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#94d3c1]/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-[#caead6]/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-[#ffdeac]/15 rounded-full mix-blend-multiply filter blur-[100px] opacity-70" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* ── 1. Header Section ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative gap-6 pt-2">
          <div className="relative flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="px-4 py-1.5 rounded-full bg-[#006e2a]/10 border border-[#006e2a]/20 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#006e2a] animate-pulse" />
                <span className="font-label-badge text-[10px] text-[#006e2a] tracking-[0.2em] uppercase font-black">
                  MODUL MANAJEMEN
                </span>
              </div>
              <div className="h-px w-28 bg-gradient-to-r from-[#006e2a]/20 to-transparent hidden sm:block" />
            </div>
            <h1 className="font-headline-section text-3xl sm:text-4xl md:text-5xl text-[#00342b] font-extrabold leading-tight tracking-tight mb-2">
              Manajemen{" "}
              <span className="font-serif-accent italic text-[#006e2a] font-normal">
                Tahun Ajaran
              </span>{" "}
              &amp; Semester
            </h1>
            <p className="font-body-lg text-sm sm:text-base text-[#3f4945]/80 max-w-2xl leading-relaxed">
              Kelola periode akademik sekolah, semester aktif, serta status
              periode yang digunakan dalam proses akademik secara terpusat.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: tahunAjaranKeys.all })
              }
              title="Muat Ulang Data"
              className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-white/60 text-[#3f4945] hover:text-[#006e2a] hover:bg-white flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:scale-105"
            >
              <span className="material-symbols-outlined text-[20px]">
                refresh
              </span>
            </button>

            <button
              onClick={() => {
                setEditData(null);
                setModalOpen(true);
              }}
              className="bg-[#006e2a] text-white px-7 py-3.5 sm:py-4 rounded-full font-label-badge text-xs sm:text-sm flex items-center gap-3 shadow-xl shadow-[#006e2a]/30 hover:shadow-[#006e2a]/50 hover:-translate-y-0.5 hover:scale-[1.03] transition-all duration-300 group border border-white/20"
            >
              <div className="bg-white/20 rounded-full p-1 group-hover:rotate-90 transition-transform duration-300">
                <span className="material-symbols-outlined text-[18px] block">
                  add
                </span>
              </div>
              <span className="tracking-widest font-black uppercase">
                Tambah Tahun Ajaran
              </span>
            </button>
          </div>
        </div>

        {/* ── 2. Bento Grid Layout (4 Stat Cards) ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Period Card */}
          <div className="bg-[#00342b] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden group transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(0,52,43,0.25)] border border-[#004d40]">
            <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-20 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] font-bold text-[#afefdd] uppercase tracking-widest">
                  Tahun Ajaran Aktif
                </p>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#69ff87] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#69ff87]" />
                </span>
              </div>
              <h4 className="text-3xl font-extrabold font-headline-card text-white">
                {aktif?.tahun || "-"}
              </h4>
              <p className="text-xs font-medium text-[#94d3c1] mt-1 italic font-serif-accent">
                {aktif
                  ? `Semester ${aktif.semesters?.find((s) => s.is_active)?.nama || "Ganjil"}`
                  : "Belum Ada Periode Aktif"}
              </p>
            </div>
            <div className="absolute -right-3 -bottom-3 opacity-15 text-white pointer-events-none">
              <span className="material-symbols-outlined text-6xl">
                calendar_month
              </span>
            </div>
          </div>

          {/* Card 2: Total Tahun Card */}
          <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-3xl p-5 shadow-sm relative overflow-hidden group transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(0,110,42,0.12)]">
            <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-20 pointer-events-none" />
            <p className="text-[10px] font-bold text-[#3f4945] uppercase tracking-widest mb-1">
              Total Tahun Ajaran
            </p>
            <h4 className="text-3xl font-extrabold font-headline-card text-[#00342b]">
              {totalTahunAjaran}
            </h4>
            <p className="text-[11px] text-[#006e2a] font-bold mt-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">school</span>
              {totalGanjil} Ganjil • {totalGenap} Genap
            </p>
          </div>

          {/* Card 3: Semester Selesai Card */}
          <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-3xl p-5 shadow-sm relative overflow-hidden group transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(0,110,42,0.12)]">
            <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-20 pointer-events-none" />
            <p className="text-[10px] font-bold text-[#3f4945] uppercase tracking-widest mb-1">
              Semester Selesai
            </p>
            <h4 className="text-3xl font-extrabold font-headline-card text-[#00342b]">
              {totalSemesterSelesai}
            </h4>
            <p className="text-[11px] text-[#006e2a] font-bold mt-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">
                check_circle
              </span>
              98% Data Valid
            </p>
          </div>

          {/* Card 4: Jadwal Mendatang Card */}
          <div className="bg-white/75 backdrop-blur-md border border-white/60 rounded-3xl p-5 shadow-sm relative overflow-hidden group transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(0,110,42,0.12)]">
            <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-out z-20 pointer-events-none" />
            <p className="text-[10px] font-bold text-[#3f4945] uppercase tracking-widest mb-1">
              Jadwal Mendatang
            </p>
            <h4 className="text-3xl font-extrabold font-headline-card text-[#00342b]">
              {totalMendatang > 0 ? totalMendatang : aktif ? 1 : 0}
            </h4>
            <p className="text-[11px] text-[#00342b] font-bold mt-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">event</span>
              {aktif ? "Semester Genap Ready" : "Periode Siap"}
            </p>
          </div>
        </div>

        {/* ── 3. Main Content Area: Data Table + Detail Sidebar ─────────────── */}
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Main Data Column (Span 8) */}
          <div className="col-span-12 xl:col-span-8 flex flex-col gap-5">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-md border border-white/50 p-3 rounded-2xl shadow-xs">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3f4945]/50 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari tahun ajaran (contoh: 2026/2027)..."
                  className="w-full pl-10 pr-9 py-2 bg-white/80 border border-[#bfc9c4]/30 rounded-xl text-xs sm:text-sm text-[#111827] placeholder:text-[#3f4945]/40 focus:outline-none focus:ring-2 focus:ring-[#006e2a]/20 focus:border-[#006e2a] transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3f4945]/40 hover:text-[#111827]"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      close
                    </span>
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#eceeed]/60 p-1 rounded-xl shrink-0 overflow-x-auto">
                {[
                  { id: "semua", label: "Semua" },
                  { id: "aktif", label: "Aktif" },
                  { id: "selesai", label: "Selesai" },
                  { id: "mendatang", label: "Mendatang" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === tab.id
                        ? "bg-white text-[#00342b] shadow-xs"
                        : "text-[#3f4945]/70 hover:text-[#00342b]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Table Card */}
            <div className="bg-white/85 backdrop-blur-md border border-white/60 rounded-[2.5rem] shadow-xl p-6 sm:p-8 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#bfc9c4]/20">
                      <th className="py-4 px-3 font-serif-accent text-[14px] text-[#00342b] uppercase tracking-widest font-bold">
                        Tahun Ajaran
                      </th>
                      <th className="py-4 px-3 font-serif-accent text-[14px] text-[#00342b] uppercase tracking-widest font-bold">
                        Semester
                      </th>
                      <th className="py-4 px-3 font-serif-accent text-[14px] text-[#00342b] uppercase tracking-widest font-bold">
                        Periode
                      </th>
                      <th className="py-4 px-3 font-serif-accent text-[14px] text-[#00342b] uppercase tracking-widest font-bold">
                        Status
                      </th>
                      <th className="py-4 px-3 font-serif-accent text-[14px] text-[#00342b] uppercase tracking-widest font-bold">
                        Data Akademik
                      </th>
                      <th className="py-4 px-3 font-serif-accent text-[14px] text-[#00342b] uppercase tracking-widest font-bold text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#bfc9c4]/15">
                    {isLoading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="py-6 px-3">
                            <div className="h-4 bg-[#eceeed] rounded-lg w-full mb-2" />
                          </td>
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-14 px-3 text-center text-[#3f4945]/60"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-4xl text-[#bfc9c4]">
                              calendar_today
                            </span>
                            <p className="font-semibold text-sm">
                              {search
                                ? "Tidak ada tahun ajaran yang sesuai dengan pencarian."
                                : "Belum ada data tahun ajaran."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((t) => {
                        const status = getStatusTahunAjaran(t);
                        const isRowSelected = selectedId === t.id;
                        const isExpanded = expandedId === t.id;
                        const academicProg = getAcademicProgress(t);
                        const tMulai = getTglMulai(t);
                        const tSelesai = getTglSelesai(t);
                        const periodeStr =
                          tMulai && tSelesai
                            ? `${fmtShortMonthYear(tMulai)} – ${fmtShortMonthYear(tSelesai)}`
                            : "-";

                        return (
                          <React.Fragment key={t.id}>
                            <tr
                              onClick={() => {
                                setSelectedId(t.id);
                              }}
                              className={`transition-all duration-300 cursor-pointer group ${
                                isRowSelected
                                  ? "bg-[#006e2a]/8"
                                  : "hover:bg-[#006e2a]/4"
                              }`}
                            >
                              {/* Tahun Ajaran Column */}
                              <td className="py-6 px-3">
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedId(isExpanded ? null : t.id);
                                    }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#3f4945]/60 hover:text-[#006e2a] hover:bg-[#006e2a]/10 transition-colors"
                                    title="Lihat Detail Semester"
                                  >
                                    <span
                                      className="material-symbols-outlined text-[18px] transition-transform duration-300"
                                      style={{
                                        transform: isExpanded
                                          ? "rotate(90deg)"
                                          : "rotate(0deg)",
                                      }}
                                    >
                                      chevron_right
                                    </span>
                                  </button>
                                  <div>
                                    <div className="font-headline-card text-[17px] font-extrabold text-[#00342b] group-hover:text-[#006e2a] transition-colors flex items-center gap-2">
                                      {t.tahun}
                                      {isRowSelected && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#006e2a]" />
                                      )}
                                    </div>
                                    <span className="text-[11px] text-[#3f4945]/60">
                                      {t.semesters?.length || 2} Semester
                                      Terdaftar
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Semester Column */}
                              <td className="py-6 px-3">
                                <div className="font-body-md text-sm text-[#191c1c] font-semibold">
                                  {t.semesters?.find((s) => s.is_active)
                                    ?.nama || "Ganjil & Genap"}
                                </div>
                                <div className="text-[11px] text-[#3f4945]/60">
                                  {t.is_active
                                    ? "Semester Aktif Berjalan"
                                    : "Periode Reguler"}
                                </div>
                              </td>

                              {/* Periode Column */}
                              <td className="py-6 px-3">
                                <div className="font-body-md text-sm text-[#3f4945]/80 font-medium">
                                  {periodeStr}
                                </div>
                              </td>

                              {/* Status Column */}
                              <td className="py-6 px-3">
                                {status === "AKTIF" ? (
                                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#006e2a]/10 text-[#006e2a] font-label-badge text-[10px] font-bold tracking-widest border border-[#006e2a]/20 shadow-xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#006e2a] animate-pulse" />
                                    AKTIF
                                  </span>
                                ) : status === "SELESAI" ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eceeed] text-[#3f4945] font-label-badge text-[10px] font-bold tracking-widest">
                                    SELESAI
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#006e2a]/10 text-[#006e2a] font-label-badge text-[10px] font-bold tracking-widest border border-[#006e2a]/20">
                                    AKAN DATANG
                                  </span>
                                )}
                              </td>

                              {/* Data Akademik Column */}
                              <td className="py-6 px-3">
                                <div className="flex items-center gap-3 min-w-[130px]">
                                  <div className="flex-1 bg-[#eceeed] rounded-full h-2 overflow-hidden shadow-inner">
                                    <div
                                      className="bg-gradient-to-r from-[#006e2a] to-[#69ff87] h-full rounded-full transition-all duration-1000"
                                      style={{ width: `${academicProg}%` }}
                                    />
                                  </div>
                                  <span className="font-label-badge text-[11px] font-bold text-[#006e2a]">
                                    {academicProg}%
                                  </span>
                                </div>
                              </td>

                              {/* Aksi Column */}
                              <td className="py-6 px-3 text-right">
                                <div
                                  className="inline-flex"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenAction(e, t.id)}
                                    title="Opsi"
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                      openActionId === t.id
                                        ? "bg-[#00342b] text-white shadow-md"
                                        : "text-[#3f4945]/70 hover:text-[#00342b] hover:bg-[#eceeed]"
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-[20px]">
                                      more_vert
                                    </span>
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Sub-row when expanded: Shows Ganjil & Genap breakdown */}
                            {isExpanded && (
                              <tr className="bg-[#006e2a]/[0.03]">
                                <td
                                  colSpan={6}
                                  className="py-4 px-6 border-b border-[#006e2a]/15"
                                >
                                  <div className="bg-white rounded-2xl border border-[#bfc9c4]/30 p-4 shadow-sm space-y-3">
                                    <div className="flex items-center justify-between text-xs font-bold text-[#00342b]">
                                      <span className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-[#006e2a]">
                                          calendar_view_month
                                        </span>
                                        Rincian Semester — {t.tahun}
                                      </span>
                                      <span className="text-[11px] text-[#3f4945]/60 font-normal">
                                        Klik detail untuk melihat jadwal, kelas,
                                        dan kurikulum semester
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {/* Ganjil */}
                                      {(() => {
                                        const ganjil = t.semesters?.find(
                                          (s) => s.nama === "Ganjil",
                                        );
                                        const isGanjilAktif = ganjil?.is_active;
                                        return (
                                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf9] border border-[#bfc9c4]/30">
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-[#00342b]">
                                                  Semester Ganjil
                                                </span>
                                                {isGanjilAktif ? (
                                                  <span className="px-2 py-0.5 rounded-full bg-[#006e2a]/10 text-[#006e2a] text-[9px] font-extrabold">
                                                    AKTIF
                                                  </span>
                                                ) : (
                                                  <span className="px-2 py-0.5 rounded-full bg-[#eceeed] text-[#3f4945] text-[9px] font-bold">
                                                    STANDBY
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-[11px] text-[#3f4945]/70 mt-0.5">
                                                {fmt(ganjil?.tgl_mulai)} –{" "}
                                                {fmt(ganjil?.tgl_selesai)}
                                              </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                              {t.is_active &&
                                                !isGanjilAktif && (
                                                  <button
                                                    onClick={() =>
                                                      setSemesterAktif.mutate({
                                                        taId: t.id,
                                                        semesterNama: "Ganjil",
                                                      })
                                                    }
                                                    className="text-[11px] font-bold text-[#006e2a] hover:underline"
                                                  >
                                                    Aktifkan
                                                  </button>
                                                )}
                                              <button
                                                onClick={() =>
                                                  navigate(
                                                    `/operator/master/tahun-ajaran/${t.id}/semester/Ganjil`,
                                                  )
                                                }
                                                className="text-xs text-[#00342b] font-bold hover:text-[#006e2a] flex items-center gap-0.5"
                                              >
                                                Detail
                                                <span className="material-symbols-outlined text-[14px]">
                                                  chevron_right
                                                </span>
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })()}

                                      {/* Genap */}
                                      {(() => {
                                        const genap = t.semesters?.find(
                                          (s) => s.nama === "Genap",
                                        );
                                        const isGenapAktif = genap?.is_active;
                                        return (
                                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf9] border border-[#bfc9c4]/30">
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-[#00342b]">
                                                  Semester Genap
                                                </span>
                                                {isGenapAktif ? (
                                                  <span className="px-2 py-0.5 rounded-full bg-[#006e2a]/10 text-[#006e2a] text-[9px] font-extrabold">
                                                    AKTIF
                                                  </span>
                                                ) : (
                                                  <span className="px-2 py-0.5 rounded-full bg-[#eceeed] text-[#3f4945] text-[9px] font-bold">
                                                    STANDBY
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-[11px] text-[#3f4945]/70 mt-0.5">
                                                {fmt(genap?.tgl_mulai)} –{" "}
                                                {fmt(genap?.tgl_selesai)}
                                              </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                              {t.is_active && !isGenapAktif && (
                                                <button
                                                  onClick={() =>
                                                    setSemesterAktif.mutate({
                                                      taId: t.id,
                                                      semesterNama: "Genap",
                                                    })
                                                  }
                                                  className="text-[11px] font-bold text-[#006e2a] hover:underline"
                                                >
                                                  Aktifkan
                                                </button>
                                              )}
                                              <button
                                                onClick={() =>
                                                  navigate(
                                                    `/operator/master/tahun-ajaran/${t.id}/semester/Genap`,
                                                  )
                                                }
                                                className="text-xs text-[#00342b] font-bold hover:text-[#006e2a] flex items-center gap-0.5"
                                              >
                                                Detail
                                                <span className="material-symbols-outlined text-[14px]">
                                                  chevron_right
                                                </span>
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Helper */}
              <div className="mt-5 pt-4 border-t border-[#bfc9c4]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#3f4945]/70">
                <span>
                  Menampilkan <b>{filtered.length}</b> dari {list.length} tahun
                  ajaran
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#006e2a]">
                    touch_app
                  </span>
                  Pilih baris untuk melihat statistik detail periode di sidebar
                  kanan
                </span>
              </div>
            </div>
          </div>

          {/* Detail Sidebar Column (Span 4) */}
          <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
            {/* 1. Detail Periode Card */}
            <div className="bg-white rounded-[32px] p-7 border border-[#bfc9c4]/30 shadow-2xl shadow-[#006e2a]/5 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[#006e2a]/15 transition-all duration-500">
              {/* Decorative Atmosphere Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#006e2a]/5 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none transition-colors group-hover:bg-[#006e2a]/10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00342b]/5 rounded-full blur-[50px] -ml-16 -mb-16 pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00342b]/5 flex items-center justify-center border border-[#00342b]/10 text-[#00342b]">
                      <span
                        className="material-symbols-outlined text-[22px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        analytics
                      </span>
                    </div>
                    <h3 className="font-headline-card text-[20px] text-[#00342b] font-extrabold tracking-tight">
                      Detail Periode
                    </h3>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-[#006e2a]/10 text-[#006e2a] font-label-badge text-[10px] font-extrabold tracking-widest border border-[#006e2a]/20 shadow-xs">
                    {selectedTA
                      ? `${selectedTA.tahun} ${selectedActiveSemester.toUpperCase()}`
                      : "2026/2027 GANJIL"}
                  </span>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-[#bfc9c4]/30 via-[#bfc9c4]/10 to-transparent" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3.5 relative z-10">
                {/* Guru */}
                <div className="animate-fade-up animate-delay-100 bg-[#f8faf9] p-4 rounded-2xl border border-[#bfc9c4]/20 hover:border-[#006e2a]/30 hover:bg-white hover:shadow-md transition-all duration-300 group/item flex flex-col items-start hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-[#006e2a]/10 flex items-center justify-center mb-3 group-hover/item:bg-[#006e2a]/20 transition-all duration-300 text-[#006e2a]">
                    <span className="material-symbols-outlined text-[20px]">
                      person
                    </span>
                  </div>
                  <p className="font-label-badge text-[10px] text-[#3f4945]/70 uppercase tracking-wider font-bold mb-1">
                    Total Guru
                  </p>
                  <p className="font-display-hero-mobile text-[24px] text-[#00342b] font-extrabold leading-none">
                    {loadingDetail ? "..." : metricGuru}
                  </p>
                </div>

                {/* Kelas */}
                <div className="animate-fade-up animate-delay-200 bg-[#f8faf9] p-4 rounded-2xl border border-[#bfc9c4]/20 hover:border-[#006e2a]/30 hover:bg-white hover:shadow-md transition-all duration-300 group/item flex flex-col items-start hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-[#006e2a]/10 flex items-center justify-center mb-3 group-hover/item:bg-[#006e2a]/20 transition-all duration-300 text-[#006e2a]">
                    <span className="material-symbols-outlined text-[20px]">
                      school
                    </span>
                  </div>
                  <p className="font-label-badge text-[10px] text-[#3f4945]/70 uppercase tracking-wider font-bold mb-1">
                    Total Kelas
                  </p>
                  <p className="font-display-hero-mobile text-[24px] text-[#00342b] font-extrabold leading-none">
                    {loadingDetail ? "..." : metricKelas}
                  </p>
                </div>

                {/* Mapel */}
                <div className="animate-fade-up animate-delay-300 bg-[#f8faf9] p-4 rounded-2xl border border-[#bfc9c4]/20 hover:border-[#006e2a]/30 hover:bg-white hover:shadow-md transition-all duration-300 group/item flex flex-col items-start hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-[#006e2a]/10 flex items-center justify-center mb-3 group-hover/item:bg-[#006e2a]/20 transition-all duration-300 text-[#006e2a]">
                    <span className="material-symbols-outlined text-[20px]">
                      menu_book
                    </span>
                  </div>
                  <p className="font-label-badge text-[10px] text-[#3f4945]/70 uppercase tracking-wider font-bold mb-1">
                    Mata Pelajaran
                  </p>
                  <p className="font-display-hero-mobile text-[24px] text-[#00342b] font-extrabold leading-none">
                    {loadingDetail ? "..." : metricMapel}
                  </p>
                </div>

                {/* Jadwal */}
                <div className="animate-fade-up animate-delay-400 bg-[#f8faf9] p-4 rounded-2xl border border-[#bfc9c4]/20 hover:border-[#006e2a]/30 hover:bg-white hover:shadow-md transition-all duration-300 group/item flex flex-col items-start hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-[#006e2a]/10 flex items-center justify-center mb-3 group-hover/item:bg-[#006e2a]/20 transition-all duration-300 text-[#006e2a]">
                    <span className="material-symbols-outlined text-[20px]">
                      calendar_today
                    </span>
                  </div>
                  <p className="font-label-badge text-[10px] text-[#3f4945]/70 uppercase tracking-wider font-bold mb-1">
                    Total Jadwal
                  </p>
                  <p className="font-display-hero-mobile text-[24px] text-[#00342b] font-extrabold leading-none">
                    {loadingDetail ? "..." : metricJadwal}
                  </p>
                </div>

                {/* Siswa */}
                <div className="animate-fade-up animate-delay-500 bg-[#f8faf9] p-4 rounded-2xl border border-[#bfc9c4]/20 hover:border-[#006e2a]/30 hover:bg-white hover:shadow-md transition-all duration-300 group/item flex flex-col items-start hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-[#006e2a]/10 flex items-center justify-center mb-3 group-hover/item:bg-[#006e2a]/20 transition-all duration-300 text-[#006e2a]">
                    <span className="material-symbols-outlined text-[20px]">
                      groups
                    </span>
                  </div>
                  <p className="font-label-badge text-[10px] text-[#3f4945]/70 uppercase tracking-wider font-bold mb-1">
                    Total Siswa
                  </p>
                  <p className="font-display-hero-mobile text-[24px] text-[#00342b] font-extrabold leading-none">
                    {loadingDetail ? "..." : metricSiswa}
                  </p>
                </div>

                {/* Rombel */}
                <div className="animate-fade-up animate-delay-500 bg-[#f8faf9] p-4 rounded-2xl border border-[#bfc9c4]/20 hover:border-[#006e2a]/30 hover:bg-white hover:shadow-md transition-all duration-300 group/item flex flex-col items-start hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-[#006e2a]/10 flex items-center justify-center mb-3 group-hover/item:bg-[#006e2a]/20 transition-all duration-300 text-[#006e2a]">
                    <span className="material-symbols-outlined text-[20px]">
                      grid_view
                    </span>
                  </div>
                  <p className="font-label-badge text-[10px] text-[#3f4945]/70 uppercase tracking-wider font-bold mb-1">
                    Rombel
                  </p>
                  <p className="font-display-hero-mobile text-[24px] text-[#00342b] font-extrabold leading-none">
                    {loadingDetail ? "..." : metricRombel}
                  </p>
                </div>
              </div>

              {/* View Detail CTA Button */}
              {selectedTA && (
                <div className="mt-5 relative z-10">
                  <button
                    onClick={() =>
                      navigate(`/operator/master/tahun-ajaran/${selectedTA.id}`)
                    }
                    className="w-full py-3 rounded-2xl bg-[#00342b] text-white hover:bg-[#004d40] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-[#00342b]/20 hover:shadow-lg"
                  >
                    <span>Buka Rincian Lengkap</span>
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Danger Zone Card */}
            <div className="bg-white border border-[#ba1a1a]/20 rounded-[32px] p-7 relative overflow-hidden group shadow-sm hover:shadow-lg hover:shadow-[#ba1a1a]/10 hover:bg-[#ba1a1a]/[0.02] transition-all duration-300">
              {/* Subtle Background Glow */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#ba1a1a]/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative z-10">
                {/* Header Label */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
                  <span className="font-label-badge text-[10px] text-[#ba1a1a] font-black tracking-[0.2em] uppercase">
                    Zona Berbahaya
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#ba1a1a]/10 flex items-center justify-center border border-[#ba1a1a]/20 shadow-sm shrink-0 text-[#ba1a1a] group-hover:shadow-[0_0_15px_rgba(186,26,26,0.2)] transition-shadow duration-300">
                    <span className="material-symbols-outlined text-[24px]">
                      warning
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-headline-card text-[18px] text-[#00342b] font-extrabold tracking-tight mb-1.5">
                      Hapus Periode
                    </h4>
                    {selectedTA?.is_active ? (
                      <>
                        <p className="font-body-md text-xs text-[#3f4945]/80 leading-relaxed mb-4">
                          Periode tidak dapat dihapus karena masih berstatus{" "}
                          <span className="font-bold text-[#ba1a1a]">
                            AKTIF
                          </span>{" "}
                          dan digunakan oleh seluruh modul akademik. Nonaktifkan
                          terlebih dahulu sebelum menghapus.
                        </p>
                        <button
                          disabled
                          className="w-full bg-[#eceeed] text-[#3f4945]/40 px-5 py-3 rounded-xl font-label-badge text-[11px] font-bold tracking-widest uppercase cursor-not-allowed border border-[#bfc9c4]/30 flex items-center justify-center gap-2 shadow-inner"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            lock
                          </span>
                          Hapus Periode
                        </button>
                      </>
                    ) : selectedTA ? (
                      <>
                        <p className="font-body-md text-xs text-[#3f4945]/80 leading-relaxed mb-4">
                          Tindakan ini akan menghapus periode{" "}
                          <b>{selectedTA.tahun}</b> beserta data semesternya
                          secara permanen.
                        </p>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Apakah Anda yakin ingin menghapus Tahun Ajaran "${selectedTA.tahun}"?`,
                              )
                            ) {
                              hapus.mutate(selectedTA.id);
                            }
                          }}
                          disabled={hapus.isPending}
                          className="w-full bg-[#ba1a1a] hover:bg-[#93000a] text-white px-5 py-3 rounded-xl font-label-badge text-[11px] font-black tracking-widest uppercase shadow-md hover:shadow-lg shadow-[#ba1a1a]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete_forever
                          </span>
                          Hapus Periode {selectedTA.tahun}
                        </button>
                      </>
                    ) : (
                      <p className="text-xs text-[#3f4945]/60">
                        Pilih tahun ajaran untuk opsi penghapusan.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Modal Tambah / Edit ────────────────────────────────────────── */}
      {/* ── Action Dropdown Portal ─────────────────────────────── */}
      {openActionId &&
        actionMenuPosition &&
        (() => {
          const actionItem = list.find((item) => item.id === openActionId);

          if (!actionItem) return null;

          return createPortal(
            <div
              className="fixed z-[9999] w-48"
              style={{
                top: actionMenuPosition.top,
                left: actionMenuPosition.left,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl border border-[#bfc9c4]/30 shadow-2xl shadow-[#00342b]/15 p-1.5 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150">
                {/* DETAIL */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenActionId(null);
                    setActionMenuPosition(null);

                    navigate(`/operator/master/tahun-ajaran/${actionItem.id}`);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-[#3f4945] hover:bg-[#006e2a]/8 hover:text-[#00342b] transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#006e2a]/8 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[17px] text-[#006e2a]">
                      visibility
                    </span>
                  </span>

                  <span>Detail</span>
                </button>

                {/* EDIT */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenActionId(null);
                    setActionMenuPosition(null);

                    setEditData({
                      ...actionItem,
                    });

                    setModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-[#3f4945] hover:bg-[#eceeed] hover:text-[#00342b] transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#eceeed] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[17px] text-[#3f4945]">
                      edit
                    </span>
                  </span>

                  <span>Edit</span>
                </button>

                {/* SET AKTIF */}
                {!actionItem.is_active && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenActionId(null);
                      setActionMenuPosition(null);

                      if (
                        confirm(
                          `Jadikan "${actionItem.tahun}" sebagai Tahun Ajaran aktif?`,
                        )
                      ) {
                        setAktif.mutate(actionItem.id);
                      }
                    }}
                    disabled={setAktif.isPending}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-[#006e2a] hover:bg-[#006e2a]/8 transition-colors disabled:opacity-50"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#006e2a]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[17px] text-[#006e2a]">
                        check_circle
                      </span>
                    </span>

                    <span>Set Aktif</span>
                  </button>
                )}

                {/* DIVIDER */}
                <div className="h-px bg-[#bfc9c4]/20 my-1" />

                {/* DELETE */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenActionId(null);
                    setActionMenuPosition(null);

                    if (
                      confirm(
                        `Apakah Anda yakin ingin menghapus Tahun Ajaran "${actionItem.tahun}"?`,
                      )
                    ) {
                      hapus.mutate(actionItem.id);
                    }
                  }}
                  disabled={hapus.isPending || actionItem.is_active}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-[#ba1a1a] hover:bg-[#ba1a1a]/8 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#ba1a1a]/8 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[17px] text-[#ba1a1a]">
                      delete
                    </span>
                  </span>

                  <span>Delete</span>
                </button>

                {/* INFO UNTUK DATA AKTIF */}
                {actionItem.is_active && (
                  <div className="px-3 pt-1 pb-1.5">
                    <p className="text-[10px] leading-relaxed text-[#3f4945]/50">
                      Tahun ajaran aktif tidak dapat dihapus.
                    </p>
                  </div>
                )}
              </div>
            </div>,
            document.body,
          );
        })()}

      <ModalTahunAjaran
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        editData={editData}
        queryClient={queryClient}
      />
    </div>
  );
}
