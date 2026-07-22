import re

with open('frontend/src/pages/operator/master/masterDataTahunAjaranSemester/TahunAjaranSemester.jsx', 'r') as f:
    content = f.read()

# Helpers to extract getTglMulai
helpers = """// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
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
  const diff = Math.round((new Date(end) - new Date()) / 86400000);
  return diff;
}

function getTglMulai(t) {
  if (!t || !t.semesters) return null;
  const ganjil = t.semesters.find(s => s.nama === 'Ganjil');
  return ganjil ? ganjil.tgl_mulai : null;
}

function getTglSelesai(t) {
  if (!t || !t.semesters) return null;
  const genap = t.semesters.find(s => s.nama === 'Genap');
  const ganjil = t.semesters.find(s => s.nama === 'Ganjil');
  return genap ? genap.tgl_selesai : (ganjil ? ganjil.tgl_selesai : null);
}"""

content = re.sub(r'// ── Helpers ──.*?function daysRemaining.*?return diff;\n}', helpers, content, flags=re.DOTALL)

# Modal Replacement
new_modal = """// ── Modal Tambah / Edit Tahun Ajaran ──────────────────────────────────────────
function ModalTahunAjaran({ open, onClose, editData, queryClient }) {
  const isEdit = !!editData;
  const [form, setForm] = useState({
    tahun: "",
    is_active: false,
    buat_semester: true,
    semester_ganjil_mulai: "",
    semester_ganjil_selesai: "",
    semester_genap_mulai: "",
    semester_genap_selesai: "",
    semester_aktif: "Ganjil"
  });

  useEffect(() => {
    if (open) {
      if (editData) {
        const ganjil = editData.semesters?.find(s => s.nama === 'Ganjil');
        const genap = editData.semesters?.find(s => s.nama === 'Genap');
        let semAktif = "";
        if (ganjil?.is_active) semAktif = "Ganjil";
        else if (genap?.is_active) semAktif = "Genap";
        
        setForm({
          tahun: editData.tahun || "",
          is_active: editData.is_active || false,
          buat_semester: !!(ganjil || genap),
          semester_ganjil_mulai: ganjil?.tgl_mulai || "",
          semester_ganjil_selesai: ganjil?.tgl_selesai || "",
          semester_genap_mulai: genap?.tgl_mulai || "",
          semester_genap_selesai: genap?.tgl_selesai || "",
          semester_aktif: semAktif
        });
      } else {
        setForm({ 
          tahun: "", 
          is_active: false, 
          buat_semester: true,
          semester_ganjil_mulai: "",
          semester_ganjil_selesai: "",
          semester_genap_mulai: "",
          semester_genap_selesai: "",
          semester_aktif: "Ganjil"
        });
      }
    }
  }, [open, editData]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? api.put(`/operator/master-data/tahun-ajaran/${editData.id}`, data)
        : api.post("/operator/master-data/tahun-ajaran", data),
    onSuccess: () => {
      toast.success(
        `Tahun ajaran berhasil ${isEdit ? "diperbarui" : "ditambahkan"}.`,
      );
      queryClient.invalidateQueries(["tahun-ajaran"]);
      queryClient.invalidateQueries(["tahun-ajaran-dropdown"]);
      onClose();
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach((e) => toast.error(e[0]));
      else toast.error(err.response?.data?.message ?? "Gagal menyimpan.");
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg border border-border-light animate-fade-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">
                calendar_today
              </span>
            </div>
            <h3
              className="font-semibold text-text-primary"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {isEdit ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* INFORMASI TAHUN AJARAN */}
          <div>
            <h4 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wide border-b border-border-light pb-2">INFORMASI TAHUN AJARAN</h4>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Nama Tahun Ajaran <span className="text-danger">*</span>
              </label>
              <input
                value={form.tahun}
                onChange={(e) => set("tahun", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-text-primary placeholder:text-text-secondary"
                placeholder="Contoh: 2025/2026"
                maxLength={9}
              />
            </div>
          </div>

          {/* PENGATURAN SEMESTER */}
          <div>
            <div className="flex items-center justify-between border-b border-border-light pb-2 mb-3">
               <h4 className="text-sm font-bold text-text-primary uppercase tracking-wide">PENGATURAN SEMESTER</h4>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={form.buat_semester}
                   onChange={(e) => set("buat_semester", e.target.checked)}
                   className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
                 />
                 <span className="text-xs font-semibold text-text-secondary">Buat Semester Otomatis</span>
               </label>
            </div>
            
            {form.buat_semester && (
              <div className="space-y-4">
                {/* Semester Ganjil */}
                <div className="p-4 bg-surface-container/30 rounded-xl border border-border-light">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[16px] text-primary">looks_one</span>
                    <h5 className="text-sm font-bold text-text-primary">Semester Ganjil</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Tanggal Mulai</label>
                      <input
                        type="date"
                        value={form.semester_ganjil_mulai}
                        onChange={(e) => set("semester_ganjil_mulai", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border-light bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Tanggal Selesai</label>
                      <input
                        type="date"
                        value={form.semester_ganjil_selesai}
                        onChange={(e) => set("semester_ganjil_selesai", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border-light bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-text-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Semester Genap */}
                <div className="p-4 bg-surface-container/30 rounded-xl border border-border-light">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[16px] text-text-secondary">looks_two</span>
                    <h5 className="text-sm font-bold text-text-primary">Semester Genap</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Tanggal Mulai</label>
                      <input
                        type="date"
                        value={form.semester_genap_mulai}
                        onChange={(e) => set("semester_genap_mulai", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border-light bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Tanggal Selesai</label>
                      <input
                        type="date"
                        value={form.semester_genap_selesai}
                        onChange={(e) => set("semester_genap_selesai", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border-light bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-text-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PENGATURAN LAIN */}
          <div>
            <h4 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wide border-b border-border-light pb-2">PENGATURAN</h4>
            <div className="space-y-3">
               <label className="flex items-center gap-3 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={form.is_active}
                   onChange={(e) => {
                     set("is_active", e.target.checked);
                     if (!e.target.checked) set("semester_aktif", "");
                   }}
                   className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
                 />
                 <span className="text-sm font-medium text-text-primary">Jadikan Tahun Ajaran Aktif</span>
               </label>
               
               {form.is_active && form.buat_semester && (
                 <div className="ml-7 flex flex-col gap-2">
                   <p className="text-xs text-text-secondary mb-1">Pilih semester yang aktif:</p>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                       type="radio" 
                       name="semester_aktif"
                       checked={form.semester_aktif === 'Ganjil'}
                       onChange={() => set("semester_aktif", "Ganjil")}
                       className="w-4 h-4 border-border-light text-primary focus:ring-primary"
                     />
                     <span className="text-sm text-text-primary">Semester Ganjil</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                       type="radio" 
                       name="semester_aktif"
                       checked={form.semester_aktif === 'Genap'}
                       onChange={() => set("semester_aktif", "Genap")}
                       className="w-4 h-4 border-border-light text-primary focus:ring-primary"
                     />
                     <span className="text-sm text-text-primary">Semester Genap</span>
                   </label>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-border-light bg-surface-container/30 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
                Menyimpan...
              </>
            ) : isEdit ? (
              "Perbarui"
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}"""

content = re.sub(r'// ── Modal Tambah / Edit Tahun Ajaran ──.*?// ── Skeleton Loader ──', new_modal + '\n\n// ── Skeleton Loader ──', content, flags=re.DOTALL)

# Variable replacements
content = content.replace("t.nama?.toLowerCase()", "t.tahun?.toLowerCase()")
content = content.replace("aktif?.nama", "aktif?.tahun")
content = content.replace("aktif.nama", "aktif.tahun")
content = content.replace("t.nama", "t.tahun")
content = content.replace("aktif.tanggal_selesai", "getTglSelesai(aktif)")
content = content.replace("aktif.tanggal_mulai", "getTglMulai(aktif)")
content = content.replace("t.tanggal_mulai", "getTglMulai(t)")
content = content.replace("t.tanggal_selesai", "getTglSelesai(t)")

with open('frontend/src/pages/operator/master/masterDataTahunAjaranSemester/TahunAjaranSemester.jsx', 'w') as f:
    f.write(content)
