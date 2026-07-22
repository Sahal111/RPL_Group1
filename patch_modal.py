import re

with open('frontend/src/pages/operator/master/masterDataTahunAjaranSemester/TahunAjaranSemester.jsx', 'r') as f:
    content = f.read()

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
    "w-full px-4 py-2.5 bg-background-light border border-border-light rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";
  const labelCls =
    "block text-label-md font-semibold text-text-secondary mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">
                {isEdit ? "edit_note" : "add_circle"}
              </span>
            </div>
            <h3 className="text-section-title font-semibold text-on-surface">
              {isEdit ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* INFORMASI TAHUN AJARAN */}
          <div>
            <h4 className="text-body-md font-bold text-on-surface mb-3 border-b border-border-light pb-2">INFORMASI TAHUN AJARAN</h4>
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
               <h4 className="text-body-md font-bold text-on-surface">PENGATURAN SEMESTER</h4>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={form.buat_semester}
                   onChange={(e) => set("buat_semester", e.target.checked)}
                   className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
                 />
                 <span className="text-label-md font-medium text-text-secondary">Buat Semester Otomatis</span>
               </label>
            </div>
            
            {form.buat_semester && (
              <div className="space-y-4">
                {/* Semester Ganjil */}
                <div className="p-4 bg-background-light rounded-xl border border-border-light">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[18px] text-primary">looks_one</span>
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
                <div className="p-4 bg-background-light rounded-xl border border-border-light">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[18px] text-text-secondary">looks_two</span>
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
            <h4 className="text-body-md font-bold text-on-surface mb-3 border-b border-border-light pb-2">PENGATURAN</h4>
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
                 <span className="text-body-md font-medium text-on-surface">Jadikan Tahun Ajaran Aktif</span>
               </label>
               
               {form.is_active && form.buat_semester && (
                 <div className="ml-7 flex flex-col gap-2">
                   <p className="text-label-md text-text-secondary mb-1">Pilih semester yang aktif:</p>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                       type="radio" 
                       name="semester_aktif"
                       checked={form.semester_aktif === 'Ganjil'}
                       onChange={() => set("semester_aktif", "Ganjil")}
                       className="w-4 h-4 border-border-light text-primary focus:ring-primary"
                     />
                     <span className="text-body-md text-on-surface">Semester Ganjil</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                       type="radio" 
                       name="semester_aktif"
                       checked={form.semester_aktif === 'Genap'}
                       onChange={() => set("semester_aktif", "Genap")}
                       className="w-4 h-4 border-border-light text-primary focus:ring-primary"
                     />
                     <span className="text-body-md text-on-surface">Semester Genap</span>
                   </label>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border-light bg-background-light">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-border-light text-text-secondary hover:bg-surface-container-low text-body-md font-medium transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-lg bg-primary text-white text-body-md font-semibold hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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

with open('frontend/src/pages/operator/master/masterDataTahunAjaranSemester/TahunAjaranSemester.jsx', 'w') as f:
    f.write(content)

