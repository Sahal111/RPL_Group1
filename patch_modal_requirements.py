import re

with open('frontend/src/pages/operator/master/masterDataTahunAjaranSemester/TahunAjaranSemester.jsx', 'r') as f:
    content = f.read()

new_modal = """// ── Modal Tambah / Edit Tahun Ajaran ──────────────────────────────────────────
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
    semester_aktif: "Ganjil"
  });

  // Calculate semester date ranges automatically when TA start/end dates change
  const calcSemesterDates = (startStr, endStr) => {
    if (!startStr || !endStr) return {};
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) return {};

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
        const ganjil = editData.semesters?.find(s => s.nama === 'Ganjil');
        const genap = editData.semesters?.find(s => s.nama === 'Genap');
        const startTA = ganjil?.tgl_mulai || "";
        const endTA = genap?.tgl_selesai || ganjil?.tgl_selesai || "";

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
          semester_aktif: "Ganjil"
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
          semester_aktif: "Ganjil"
        });
      }
    }
  }, [open, editData]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Handle TA start date change
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

  // Handle TA end date change
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

  // Handle Tahun string input change (e.g., "2025/2026")
  const handleTahunTextChange = (val) => {
    setForm((f) => {
      const updated = { ...f, tahun: val };
      const match = val.match(/^(\\d{4})\\/(\\d{4})$/);
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
          ...autoSem
        };
      }
      return updated;
    });
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 transition-all duration-200"
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
            <div className="space-y-3.5">
              <div>
                <label className={labelCls}>
                  Nama Tahun Ajaran <span className="text-danger">*</span>
                </label>
                <input
                  value={form.tahun}
                  onChange={(e) => handleTahunTextChange(e.target.value)}
                  className={inputCls}
                  placeholder="Contoh: 2025/2026"
                  maxLength={9}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    Tanggal Mulai Tahun Ajaran <span className="text-danger">*</span>
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
                    Tanggal Selesai Tahun Ajaran <span className="text-danger">*</span>
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
                {/* Semester Ganjil (Readonly Label Header) */}
                <div className="p-4 bg-background-light/70 rounded-xl border border-border-light/80 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-md bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">1</span>
                    <span className="text-body-md font-bold text-on-surface select-none">Semester Ganjil</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium ml-auto">Otomatis</span>
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

                {/* Semester Genap (Readonly Label Header) */}
                <div className="p-4 bg-background-light/70 rounded-xl border border-border-light/80 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-md bg-text-secondary/10 text-text-secondary font-bold text-xs flex items-center justify-center">2</span>
                    <span className="text-body-md font-bold text-on-surface select-none">Semester Genap</span>
                    <span className="text-[10px] bg-surface-container text-text-secondary px-2 py-0.5 rounded-full font-medium ml-auto">Otomatis</span>
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

          {/* PENGATURAN LAINNYA */}
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-border-light pb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">settings</span>
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">PENGATURAN LAINNYA</h4>
            </div>
            <div className="space-y-2">
               <label className="flex items-center gap-3 cursor-pointer select-none">
                 <input 
                   type="checkbox" 
                   checked={form.is_active}
                   onChange={(e) => {
                     const active = e.target.checked;
                     setForm((f) => ({
                       ...f,
                       is_active: active,
                       semester_aktif: active ? "Ganjil" : ""
                     }));
                   }}
                   className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary accent-primary"
                 />
                 <span className="text-body-md font-medium text-on-surface">Jadikan Tahun Ajaran Aktif</span>
               </label>

               {/* Informational Warning Note */}
               <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-amber-800">
                 <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">info</span>
                 <p className="text-xs leading-relaxed text-amber-900 font-medium">
                   Mengaktifkan Tahun Ajaran ini akan menonaktifkan Tahun Ajaran yang sedang aktif.
                 </p>
               </div>
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

content = re.sub(r'// ── Modal Tambah / Edit Tahun Ajaran ──.*?// ── Skeleton Loader ──', lambda m: new_modal + '\n\n// ── Skeleton Loader ──', content, flags=re.DOTALL)

with open('frontend/src/pages/operator/master/masterDataTahunAjaranSemester/TahunAjaranSemester.jsx', 'w') as f:
    f.write(content)

