import re

with open('frontend/src/pages/operator/master/masterDataTahunAjaranSemester/TahunAjaranSemester.jsx', 'r') as f:
    content = f.read()

# Add import createPortal
if 'createPortal' not in content:
    content = 'import { createPortal } from "react-dom";\n' + content

# Replace ModalTahunAjaran return statement with createPortal
old_modal_start = '// ── Modal Tambah / Edit Tahun Ajaran ──────────────────────────────────────────'
old_modal_end = '// ── Skeleton Loader ──'

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

  const inputCls =
    "w-full px-3.5 py-2.5 bg-background-light border border-border-light rounded-xl text-body-md text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50";
  const labelCls =
    "block text-label-md font-semibold text-text-secondary mb-1.5";

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 sm:p-6 transition-all duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-border-light/80 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
              <span className="material-symbols-outlined text-[22px]">
                {isEdit ? "edit_note" : "add_circle"}
              </span>
            </div>
            <div>
              <h3 className="text-section-title font-bold text-on-surface">
                {isEdit ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
              </h3>
              <p className="text-xs text-text-secondary">Kelola periode akademis dan semester sekolah</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* INFORMASI TAHUN AJARAN */}
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-border-light pb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">INFORMASI TAHUN AJARAN</h4>
            </div>
            <div>
              <label className={labelCls}>
                Nama Tahun Ajaran <span className="text-danger">*</span>
              </label>
              <input
                value={form.tahun}
                onChange={(e) => set("tahun", e.target.value)}
                className={inputCls}
                placeholder="Contoh: 2025/2026"
                maxLength={9}
              />
            </div>
          </div>

          {/* PENGATURAN SEMESTER */}
          <div>
            <div className="flex items-center justify-between border-b border-border-light pb-2 mb-3">
               <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary text-[18px]">date_range</span>
                 <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">PENGATURAN SEMESTER</h4>
               </div>
               <label className="flex items-center gap-2 cursor-pointer select-none">
                 <input 
                   type="checkbox" 
                   checked={form.buat_semester}
                   onChange={(e) => set("buat_semester", e.target.checked)}
                   className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary accent-primary"
                 />
                 <span className="text-xs font-semibold text-text-secondary">Buat Semester Otomatis</span>
               </label>
            </div>
            
            {form.buat_semester && (
              <div className="space-y-3.5">
                {/* Semester Ganjil */}
                <div className="p-4 bg-background-light/70 rounded-xl border border-border-light/80 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-md bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">1</span>
                    <h5 className="text-body-md font-bold text-on-surface">Semester Ganjil</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Tanggal Mulai</label>
                      <input
                        type="date"
                        value={form.semester_ganjil_mulai}
                        onChange={(e) => set("semester_ganjil_mulai", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tanggal Selesai</label>
                      <input
                        type="date"
                        value={form.semester_ganjil_selesai}
                        onChange={(e) => set("semester_ganjil_selesai", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                {/* Semester Genap */}
                <div className="p-4 bg-background-light/70 rounded-xl border border-border-light/80 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-md bg-text-secondary/10 text-text-secondary font-bold text-xs flex items-center justify-center">2</span>
                    <h5 className="text-body-md font-bold text-on-surface">Semester Genap</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Tanggal Mulai</label>
                      <input
                        type="date"
                        value={form.semester_genap_mulai}
                        onChange={(e) => set("semester_genap_mulai", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tanggal Selesai</label>
                      <input
                        type="date"
                        value={form.semester_genap_selesai}
                        onChange={(e) => set("semester_genap_selesai", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PENGATURAN LAIN */}
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-border-light pb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">settings</span>
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">PENGATURAN LAINNYA</h4>
            </div>
            <div className="space-y-3">
               <label className="flex items-center gap-3 cursor-pointer select-none">
                 <input 
                   type="checkbox" 
                   checked={form.is_active}
                   onChange={(e) => {
                     set("is_active", e.target.checked);
                     if (!e.target.checked) set("semester_aktif", "");
                   }}
                   className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary accent-primary"
                 />
                 <span className="text-body-md font-medium text-on-surface">Jadikan Tahun Ajaran Aktif</span>
               </label>
               
               {form.is_active && form.buat_semester && (
                 <div className="ml-7 p-3 bg-primary/5 rounded-xl border border-primary/10 flex flex-col gap-2">
                   <p className="text-xs font-medium text-text-secondary mb-0.5">Pilih semester yang aktif:</p>
                   <div className="flex items-center gap-4">
                     <label className="flex items-center gap-2 cursor-pointer select-none">
                       <input 
                         type="radio" 
                         name="semester_aktif"
                         checked={form.semester_aktif === 'Ganjil'}
                         onChange={() => set("semester_aktif", "Ganjil")}
                         className="w-4 h-4 border-border-light text-primary focus:ring-primary accent-primary"
                       />
                       <span className="text-body-md font-medium text-on-surface">Semester Ganjil</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer select-none">
                       <input 
                         type="radio" 
                         name="semester_aktif"
                         checked={form.semester_aktif === 'Genap'}
                         onChange={() => set("semester_aktif", "Genap")}
                         className="w-4 h-4 border-border-light text-primary focus:ring-primary accent-primary"
                       />
                       <span className="text-body-md font-medium text-on-surface">Semester Genap</span>
                     </label>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border-light bg-surface-container-lowest">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container-low text-body-md font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-body-md font-semibold hover:bg-primary-700 shadow-sm hover:shadow transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                Menyimpan...
              </>
            ) : isEdit ? (
              "Perbarui Data"
            ) : (
              "Simpan Data"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}"""

content = re.sub(r'// ── Modal Tambah / Edit Tahun Ajaran ──.*?// ── Skeleton Loader ──', new_modal + '\n\n// ── Skeleton Loader ──', content, flags=re.DOTALL)

with open('frontend/src/pages/operator/master/masterDataTahunAjaranSemester/TahunAjaranSemester.jsx', 'w') as f:
    f.write(content)

