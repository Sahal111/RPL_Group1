import { useState, useEffect, useRef } from "react";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

// ── Modal Import Enterprise ───────────────────────────────────────────────────
export default function ModalImportGuru({ open, onClose, queryClient }) {
  // step: "type" | "upload" | "preview" | "mapping" | "confirm" | "progress" | "done"
  const [step, setStep]           = useState("type");
  const [importType, setImportType] = useState(null); // "excel" | "zip" | "foto"
  const [file, setFile]           = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [batchId, setBatchId]     = useState(null);
  const [preview, setPreview]     = useState(null);   // { headers, sample_rows, auto_mapping, db_fields, dup_stats, total_baris }
  const [mapping, setMapping]     = useState({});     // { userHeader: dbField }
  const [modeDuplikat, setModeDuplikat] = useState("replace");
  const [progress, setProgress]   = useState(null);  // dari polling
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileRef = useRef();
  const pollRef = useRef(null);

  const reset = () => {
    setStep("type");
    setImportType(null);
    setFile(null);
    setBatchId(null);
    setPreview(null);
    setMapping({});
    setProgress(null);
    setLoading(false);
    clearInterval(pollRef.current);
  };

  const handleClose = () => { reset(); onClose(); };

  // ── Polling progress ───────────────────────────────────────────────────────
  const startPolling = (bid) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/operator/master-data/guru/import-status/${bid}`);
        const d   = res.data.data;
        setProgress(d);
        if (["done", "failed", "rolled_back"].includes(d.status)) {
          clearInterval(pollRef.current);
          setStep("done");
          queryClient.invalidateQueries(["master-guru"]);
        }
      } catch { clearInterval(pollRef.current); }
    }, 2000);
  };

  // ── Step 1: Upload + Preview ───────────────────────────────────────────────
  const handleUploadPreview = async () => {
    if (!file) return;
    setLoading(true);
    try {
      if (importType === "excel") {
        setBatchId(null); // reset dulu batchId lama
        const fd = new FormData();
        fd.append("file", file);
        const res = await api.post(
          "/operator/master-data/guru/import-preview",
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        const d = res.data;
        setBatchId(d.batch_id);
        setPreview(d);
        setMapping(d.auto_mapping ?? {});
        setStep("preview");
      } else if (importType === "zip") {
        // ZIP: langsung ke confirm (tidak ada preview per-baris)
        setStep("confirm");
      } else {
        // foto: langsung submit
        const fd = new FormData();
        fd.append("file", file);
        const res = await api.post(
          "/operator/master-data/guru/import-foto",
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        setProgress({ status: "done", ...res.data.data });
        setStep("done");
        queryClient.invalidateQueries(["master-guru"]);
        toast.success(res.data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? "Gagal memulai import.";
      const status = err.response?.status;
      // 404 = file tidak ada di server, suruh upload ulang
      if (status === 422 && msg.includes("tidak ada")) {
        toast.error("File sudah tidak ada di server. Silakan upload ulang.");
        setStep("upload");
        setBatchId(null);
        setFile(null);
      } else {
        toast.error(msg);
        setStep("confirm");
      }
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Execute import ─────────────────────────────────────────────────
  const handleExecute = async () => {
    // Guard: pastikan batchId ada (preview harus sudah selesai)
    if (importType === "excel" && !batchId) {
      toast.error("Upload file terlebih dahulu.");
      setStep("upload");
      return;
    }

    setLoading(true);
    setStep("progress");
    setProgress({
      status: "processing",
      progress_persen: 0,
      total_baris: preview?.total_baris ?? 0,
    });
    try {
      if (importType === "excel") {
        const res = await api.post(
          "/operator/master-data/guru/import-execute",
          {
            batch_id: batchId,
            column_mapping: mapping,
            mode_duplikat: modeDuplikat,
          },
        );
        // Simulasikan progress bar naik saat response datang
        setProgress({ status: "processing", progress_persen: 80 });
        await new Promise((r) => setTimeout(r, 300));
        setProgress(res.data.data);
        setStep("done");
        queryClient.invalidateQueries(["master-guru"]);
        if ((res.data.data?.jumlah_gagal ?? 0) === 0) {
          toast.success(
            `Import selesai! ${res.data.data?.jumlah_insert ?? 0} baru, ${res.data.data?.jumlah_update ?? 0} update.`,
          );
        } else {
          toast.error(
            `Import selesai dengan ${res.data.data?.jumlah_gagal} error. Cek laporan.`,
          );
        }
      } else if (importType === "zip") {
        // ZIP tetap async (file besar) — pakai polling
        const fd = new FormData();
        fd.append("file", file);
        fd.append("mode_duplikat", modeDuplikat);
        const res = await api.post(
          "/operator/master-data/guru/import-zip",
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        setBatchId(res.data.batch_id);
        startPolling(res.data.batch_id);
        toast.success("ZIP sedang diproses di background...");
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal memulai import.");
      setStep("confirm");
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Download error report ──────────────────────────────────────────────────
  const downloadErrorReport = async () => {
    if (!batchId) return;
    try {
      const res = await api.get(`/operator/master-data/guru/import-error-report/${batchId}`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `error_import_${batchId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Gagal mengunduh laporan error."); }
  };

  // ── Load history ───────────────────────────────────────────────────────────
  const loadHistory = async () => {
    try {
      const res = await api.get("/operator/master-data/guru/import-history");
      setHistory(res.data.data ?? []);
      setShowHistory(true);
    } catch { toast.error("Gagal memuat riwayat."); }
  };

  // ── Download template ──────────────────────────────────────────────────────
  const downloadTemplate = async () => {
    try {
      const res = await api.get("/operator/master-data/guru/template", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = "template_import_guru.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Gagal mengunduh template."); }
  };

  useEffect(() => { return () => clearInterval(pollRef.current); }, []);

  if (!open) return null;

  const DB_FIELD_LABELS = {
    nuptk: "NUPTK*", nip: "NIP", nik: "NIK", nama: "Nama*",
    jenis_kelamin: "Jenis Kelamin", tanggal_lahir: "Tanggal Lahir",
    tempat_lahir: "Tempat Lahir", agama: "Agama", no_hp: "No. HP",
    email: "Email", jenis_ptk: "Jenis PTK", status_kepegawaian: "Status Kepegawaian",
    status_keaktifan: "Status Keaktifan", gelar_depan: "Gelar Depan",
    gelar_belakang: "Gelar Belakang", no_kk: "No. KK", alamat_jalan: "Alamat",
    provinsi: "Provinsi", kota_kabupaten: "Kota/Kab", kecamatan: "Kecamatan",
  };

  // ─────────────────────── RENDER STEPS ────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl border border-border-light animate-fade-up flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">upload_file</span>
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Import Data Guru
              </h3>
              <p className="text-xs text-text-secondary">
                {step === "type" && "Pilih tipe import"}
                {step === "upload" && "Upload file"}
                {step === "preview" && "Preview & mapping kolom"}
                {step === "confirm" && "Konfirmasi import"}
                {step === "progress" && "Sedang memproses..."}
                {step === "done" && "Import selesai"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadHistory} className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors" title="Riwayat Import">
              <span className="material-symbols-outlined text-[18px]">history</span>
            </button>
            <button onClick={handleClose} className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Stepper */}
        {!showHistory && (
          <div className="flex items-center gap-0 px-6 py-3 border-b border-border-light bg-surface-container-low shrink-0 overflow-x-auto">
            {[
              { id: "type", label: "Tipe" },
              { id: "upload", label: "Upload" },
              { id: "preview", label: "Preview" },
              { id: "confirm", label: "Konfirmasi" },
              { id: "progress", label: "Proses" },
              { id: "done", label: "Selesai" },
            ].map((s, i, arr) => {
              const steps = ["type", "upload", "preview", "confirm", "progress", "done"];
              const cur   = steps.indexOf(step);
              const me    = steps.indexOf(s.id);
              const done  = me < cur;
              const active = me === cur;
              return (
                <div key={s.id} className="flex items-center shrink-0">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${active ? "text-primary" : done ? "text-success" : "text-text-tertiary"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? "bg-primary text-white" : done ? "bg-success text-white" : "bg-surface-container text-text-secondary"}`}>
                      {done ? "✓" : me + 1}
                    </span>
                    {s.label}
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-border-light mx-0.5 text-[10px]">›</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── HISTORY ── */}
          {showHistory && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-text-primary text-sm">Riwayat Import (20 Terakhir)</h4>
                <button onClick={() => setShowHistory(false)} className="text-xs text-primary hover:underline">← Kembali</button>
              </div>
              {history.length === 0 ? (
                <p className="text-text-secondary text-sm text-center py-8">Belum ada riwayat import.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((h) => (
                    <div key={h.batch_id} className="border border-border-light rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">{h.nama_file ?? h.batch_id.slice(0, 8) + "..."}</p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {h.oleh} · {h.ip_address} · {new Date(h.created_at).toLocaleString("id-ID")}
                          </p>
                          <div className="flex gap-3 mt-1.5 text-[11px]">
                            <span className="text-success">+{h.jumlah_insert ?? 0} baru</span>
                            <span className="text-info">~{h.jumlah_update ?? 0} update</span>
                            <span className="text-text-secondary">⟳{h.jumlah_skip ?? 0} skip</span>
                            {(h.jumlah_gagal ?? 0) > 0 && <span className="text-danger">✗{h.jumlah_gagal} gagal</span>}
                            <span className="text-text-tertiary">{h.durasi_detik}s</span>
                          </div>
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          h.status === "done" ? "bg-success/10 text-success" :
                          h.status === "failed" ? "bg-danger/10 text-danger" :
                          "bg-warning/10 text-warning"
                        }`}>{h.status.toUpperCase()}</span>
                      </div>
                      {h.status === "done" && h.jumlah_gagal > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await api.get(`/operator/master-data/guru/import-error-report/${h.batch_id}`, { responseType: "blob" });
                              const url = URL.createObjectURL(res.data);
                              const a = document.createElement("a"); a.href = url; a.download = `error_${h.batch_id.slice(0,8)}.xlsx`; a.click();
                            } catch { toast.error("Gagal unduh laporan."); }
                          }}
                          className="mt-2 text-[11px] text-danger hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">download</span>
                          Download laporan error
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: TYPE ── */}
          {!showHistory && step === "type" && (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary mb-4">Pilih metode import yang sesuai dengan data kamu:</p>
              {[
                { id: "excel", icon: "table_view", iconBg: "bg-primary/10", iconColor: "text-primary",
                  title: "Import Excel (Multi-Sheet)", desc: "Upload file .xlsx dengan format template. Mendukung Data Utama + Keluarga, Pendidikan, Sertifikasi, Diklat, dll dalam satu file.", badge: "RECOMMENDED" },
                { id: "zip", icon: "folder_zip", iconBg: "bg-warning/10", iconColor: "text-warning",
                  title: "Import ZIP (Excel + Foto + Dokumen)", desc: "Upload .zip berisi guru.xlsx, folder foto/, ijazah/, ktp/, kk/, sertifikat/, sk/, dll. Sistem akan membaca Excel terlebih dahulu lalu mencocokkan file.", badge: "ENTERPRISE" },
                { id: "foto", icon: "image", iconBg: "bg-info/10", iconColor: "text-info",
                  title: "Import Foto & Dokumen (ZIP)", desc: "Upload .zip berisi foto profil dan file dokumen saja. Data guru harus sudah ada di database.", badge: null },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setImportType(opt.id); setStep("upload"); }}
                  className="w-full text-left flex items-start gap-4 p-4 border border-border-light rounded-xl hover:border-primary/40 hover:bg-surface-container-low transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl ${opt.iconBg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${opt.iconColor} text-[22px]`}>{opt.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{opt.title}</p>
                      {opt.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{opt.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{opt.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-text-secondary text-[18px] shrink-0 mt-1">chevron_right</span>
                </button>
              ))}
            </div>
          )}

          {/* ── STEP: UPLOAD ── */}
          {!showHistory && step === "upload" && (
            <div className="space-y-4">
              <button onClick={() => setStep("type")} className="text-xs text-primary hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">arrow_back</span> Ganti tipe import
              </button>

              {importType === "excel" && (
                <div className="flex items-start gap-3 p-3 bg-info/5 border border-info/20 rounded-xl">
                  <span className="material-symbols-outlined text-info text-[18px] shrink-0 mt-0.5">info</span>
                  <div className="text-xs text-text-secondary leading-relaxed">
                    Upload <strong>.xlsx</strong> sesuai template multi-sheet. Kolom bisa berbeda nama — mapping akan dilakukan otomatis, dan kamu bisa koreksi sebelum import.
                    <button onClick={downloadTemplate} className="block mt-1.5 text-primary font-semibold hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">download</span> Unduh Template Excel
                    </button>
                  </div>
                </div>
              )}

              {importType === "zip" && (
                <div className="flex items-start gap-3 p-3 bg-warning/5 border border-warning/20 rounded-xl">
                  <span className="material-symbols-outlined text-warning text-[18px] shrink-0 mt-0.5">folder_zip</span>
                  <div className="text-xs text-text-secondary leading-relaxed space-y-1">
                    <p>Upload <strong>.zip</strong> berisi <code className="bg-surface-container px-1 rounded">guru.xlsx</code> di dalamnya + folder media:</p>
                    <div className="bg-surface-container rounded-lg p-2 font-mono text-[10px] leading-5">
                      <div>📁 guru.zip</div>
                      <div className="pl-3">📄 guru.xlsx <span className="text-text-tertiary">(wajib — acuan utama)</span></div>
                      <div className="pl-3">📁 foto/ <span className="text-text-tertiary">atau</span> foto-guru/</div>
                      <div className="pl-3">📁 ijazah/ <span className="text-text-tertiary">atau</span> file-ijazah/</div>
                      <div className="pl-3">📁 ktp/ · 📁 kk/ · 📁 sertifikat/ · 📁 sk/ · 📁 transkrip/</div>
                    </div>
                    <p>Nama file: <code className="bg-surface-container px-1 rounded">NUPTK.ext</code> (foto) atau <code className="bg-surface-container px-1 rounded">NUPTK_id.ext</code> (dokumen)</p>
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? "border-primary bg-primary/5" : file ? "border-success/40 bg-success/5" : "border-border-light hover:border-primary/40 hover:bg-surface-container-low"}`}
              >
                <input ref={fileRef} type="file"
                  accept={importType === "excel" ? ".xlsx,.xls" : ".zip"}
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0])}
                />
                {file ? (
                  <>
                    <span className="material-symbols-outlined text-success text-[36px]">{importType === "excel" ? "table_view" : "folder_zip"}</span>
                    <p className="text-sm font-semibold text-text-primary mt-2">{file.name}</p>
                    <p className="text-xs text-text-secondary mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-2 text-xs text-danger hover:underline">Ganti file</button>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-text-secondary text-[36px]">{importType === "excel" ? "table_view" : "folder_zip"}</span>
                    <p className="text-sm font-semibold text-text-primary mt-2">Drag & drop file di sini</p>
                    <p className="text-xs text-text-secondary mt-1">atau klik untuk pilih file</p>
                    <p className="text-[10px] text-text-secondary mt-1 opacity-70">
                      {importType === "excel" ? ".xlsx — Maks 20 MB" : ".zip — Maks 100 MB"}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── STEP: PREVIEW ── */}
          {!showHistory && step === "preview" && preview && (
            <div className="space-y-4">
              {/* Statistik */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-container rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-text-primary">{preview.total_baris?.toLocaleString()}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Total Baris</p>
                </div>
                <div className="bg-success/5 border border-success/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-success">{preview.sheets?.length ?? 1}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Sheet Ditemukan</p>
                </div>
                <div className="bg-warning/5 border border-warning/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-warning">
                    {Object.values(preview.dup_stats ?? {}).reduce((a, b) => a + b, 0)}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">Potensi Duplikat (sample)</p>
                </div>
              </div>

              {/* Mapping Kolom */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-text-primary">Mapping Kolom</h4>
                  <span className="text-xs text-text-secondary">{Object.keys(mapping).filter(k => mapping[k]).length}/{preview.headers?.length} kolom dipetakan</span>
                </div>
                <div className="border border-border-light rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-surface-container sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-text-secondary font-semibold">Kolom di File Kamu</th>
                        <th className="px-3 py-2 text-left text-text-secondary font-semibold">→ Kolom Database</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(preview.headers ?? []).map((h) => (
                        <tr key={h} className="border-t border-border-light">
                          <td className="px-3 py-1.5 text-text-primary font-mono">{h}</td>
                          <td className="px-3 py-1.5">
                            <select
                              value={mapping[h] ?? ""}
                              onChange={(e) => setMapping(prev => ({ ...prev, [h]: e.target.value || undefined }))}
                              className="w-full text-xs border border-border-light rounded-lg px-2 py-1 bg-surface-container-lowest focus:outline-none focus:border-primary"
                            >
                              <option value="">(abaikan kolom ini)</option>
                              {(preview.db_fields ?? []).map(f => (
                                <option key={f} value={f}>{DB_FIELD_LABELS[f] ?? f}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Data */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">Preview Data (5 Baris Pertama)</h4>
                <div className="border border-border-light rounded-xl overflow-auto max-h-40">
                  <table className="w-full text-[11px] whitespace-nowrap">
                    <thead className="bg-surface-container">
                      <tr>
                        {(preview.headers ?? []).map((h, i) => (
                          <th key={i} className="px-2 py-1.5 text-left text-text-secondary font-semibold border-r border-border-light last:border-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(preview.sample_rows ?? []).map((row, ri) => (
                        <tr key={ri} className={`border-t border-border-light ${ri % 2 === 0 ? "" : "bg-surface-container-low"}`}>
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-2 py-1 text-text-primary border-r border-border-light last:border-0 max-w-[120px] truncate">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: CONFIRM ── */}
          {!showHistory && step === "confirm" && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-container rounded-xl space-y-3">
                <h4 className="text-sm font-semibold text-text-primary">Pengaturan Import</h4>

                {/* Mode Duplikat */}
                <div>
                  <p className="text-xs text-text-secondary mb-2 font-medium">Jika data sudah ada (deteksi via NUPTK → NIP → NIK → Email):</p>
                  <div className="space-y-2">
                    {[
                      { id: "replace", label: "Replace", desc: "Timpa semua field dengan data dari file", icon: "sync" },
                      { id: "merge", label: "Merge", desc: "Update hanya field yang tidak kosong di file", icon: "merge" },
                      { id: "skip", label: "Skip", desc: "Lewati — jangan ubah data yang sudah ada", icon: "skip_next" },
                    ].map((m) => (
                      <label key={m.id} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${modeDuplikat === m.id ? "border-primary bg-primary/5" : "border-border-light hover:border-primary/30"}`}>
                        <input type="radio" name="mode_duplikat" value={m.id} checked={modeDuplikat === m.id} onChange={() => setModeDuplikat(m.id)} className="mt-0.5 accent-primary" />
                        <div>
                          <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-primary">{m.icon}</span>
                            {m.label}
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5">{m.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ringkasan */}
              <div className="flex items-start gap-3 p-3 bg-warning/5 border border-warning/20 rounded-xl">
                <span className="material-symbols-outlined text-warning text-[18px] shrink-0 mt-0.5">warning</span>
                <div className="text-xs text-text-secondary leading-relaxed">
                  <p className="font-semibold text-text-primary">Siap Import</p>
                  <p className="mt-1">
                    {importType === "excel" && <>File: <strong>{file?.name}</strong> · {preview?.total_baris?.toLocaleString()} baris · Mode: <strong>{modeDuplikat}</strong></>}
                    {importType === "zip" && <>File: <strong>{file?.name}</strong> · Mode: <strong>{modeDuplikat}</strong> · Foto & dokumen akan dicocokkan otomatis dengan data Excel di dalam ZIP.</>}
                  </p>
                  <p className="mt-1 text-warning">Proses ini tidak bisa dibatalkan setelah dimulai. Pastikan data sudah benar.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: PROGRESS ── */}
          {!showHistory && step === "progress" && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <span className="material-symbols-outlined text-primary text-[48px] animate-spin">progress_activity</span>
                <p className="text-sm font-semibold text-text-primary mt-3">Sedang Memproses...</p>
                <p className="text-xs text-text-secondary mt-1">Jangan tutup halaman ini</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Progress</span>
                  <span>{progress?.progress_persen ?? 0}%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress?.progress_persen ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Stats realtime */}
              {progress && (
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Total", val: progress.total_baris ?? "-", color: "text-text-primary" },
                    { label: "Berhasil", val: (progress.jumlah_insert ?? 0) + (progress.jumlah_update ?? 0), color: "text-success" },
                    { label: "Skip", val: progress.jumlah_skip ?? 0, color: "text-text-secondary" },
                    { label: "Gagal", val: progress.jumlah_gagal ?? 0, color: "text-danger" },
                  ].map((s) => (
                    <div key={s.label} className="bg-surface-container rounded-xl p-3 text-center">
                      <p className={`text-xl font-bold ${s.color}`}>{s.val?.toLocaleString()}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: DONE ── */}
          {!showHistory && step === "done" && progress && (
            <div className="space-y-4 py-2">
              {/* Header status */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${progress.status === "done" ? "bg-success/5 border-success/20" : "bg-danger/5 border-danger/20"}`}>
                <span className={`material-symbols-outlined text-[32px] ${progress.status === "done" ? "text-success" : "text-danger"}`}>
                  {progress.status === "done" ? "check_circle" : "error"}
                </span>
                <div>
                  <p className={`font-bold ${progress.status === "done" ? "text-success" : "text-danger"}`}>
                    {progress.status === "done" ? "Import Berhasil!" : "Import Selesai dengan Error"}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Durasi: {progress.durasi_detik ?? "–"}s
                  </p>
                </div>
              </div>

              {/* Statistik */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Total", val: progress.total_baris ?? 0, color: "text-text-primary", bg: "bg-surface-container" },
                  { label: "Baru", val: progress.jumlah_insert ?? 0, color: "text-success", bg: "bg-success/5" },
                  { label: "Update", val: progress.jumlah_update ?? 0, color: "text-info", bg: "bg-info/5" },
                  { label: "Skip", val: progress.jumlah_skip ?? 0, color: "text-text-secondary", bg: "bg-surface-container" },
                  { label: "Gagal", val: progress.jumlah_gagal ?? 0, color: "text-danger", bg: progress.jumlah_gagal > 0 ? "bg-danger/5" : "bg-surface-container" },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                    <p className={`text-xl font-bold ${s.color}`}>{s.val?.toLocaleString()}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Relasi per sheet */}
              {progress.statistik_relasi && Object.keys(progress.statistik_relasi).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-secondary mb-2">Relasi yang diimport:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(progress.statistik_relasi).filter(([,v]) => typeof v === "number" && v > 0).map(([k, v]) => (
                      <span key={k} className="text-[11px] px-2 py-1 bg-surface-container rounded-lg text-text-secondary">
                        {k}: <strong className="text-text-primary">{v}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Error list */}
              {progress.error_detail?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-danger">{progress.error_detail.length} error ditemukan:</p>
                    {batchId && (
                      <button onClick={downloadErrorReport} className="text-[11px] text-primary hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">download</span>
                        Download Laporan Error
                      </button>
                    )}
                  </div>
                  <ul className="space-y-1 max-h-32 overflow-y-auto">
                    {progress.error_detail.slice(0, 20).map((e, i) => (
                      <li key={i} className="text-xs text-danger/80 flex gap-1">
                        <span className="shrink-0">•</span>
                        {typeof e === "string" ? e : (e.pesan ?? JSON.stringify(e))}
                      </li>
                    ))}
                    {progress.error_detail.length > 20 && (
                      <li className="text-xs text-text-secondary">... dan {progress.error_detail.length - 20} error lainnya. Download laporan untuk detail lengkap.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-border-light shrink-0">
          <button onClick={handleClose} className="px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors">
            {step === "done" ? "Tutup" : "Batal"}
          </button>

          <div className="flex gap-2">
            {step === "upload" && !showHistory && (
              <button
                onClick={handleUploadPreview}
                disabled={!file || loading}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-on-primary-fixed-variant disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {loading ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Memproses...</> :
                  <><span className="material-symbols-outlined text-[16px]">arrow_forward</span> {importType === "foto" ? "Upload & Proses" : "Lanjut: Preview"}</>}
              </button>
            )}

            {step === "preview" && !showHistory && (
              <button
                onClick={() => setStep("confirm")}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-on-primary-fixed-variant flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span> Lanjut: Konfirmasi
              </button>
            )}

            {step === "confirm" && !showHistory && (
              <button
                onClick={handleExecute}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-on-primary-fixed-variant disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {loading ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Memulai...</> :
                  <><span className="material-symbols-outlined text-[16px]">upload</span> Mulai Import</>}
              </button>
            )}

            {step === "done" && !showHistory && (
              <button
                onClick={reset}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-on-primary-fixed-variant flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span> Import Lagi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
