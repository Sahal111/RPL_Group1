import re

with open('frontend/src/pages/operator/master/masterDataTahunAjaranSemester/TahunAjaranSemester.jsx', 'r') as f:
    content = f.read()

# Fix the backdrop blur and max height constraint
content = content.replace(
    '<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">',
    '<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">'
)

content = content.replace(
    '<div className="px-6 py-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">',
    '<div className="px-6 py-5 space-y-5 max-h-[68vh] overflow-y-auto custom-scrollbar">'
)

# Fix the footer
old_footer = """        {/* Footer */}
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
        </div>"""

new_footer = """        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border-light bg-background-light">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-border-light text-text-secondary hover:bg-surface-container-low font-medium transition-colors text-body-md"
          >
            Batal
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-body-md"
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
        </div>"""

content = content.replace(old_footer, new_footer)

with open('frontend/src/pages/operator/master/masterDataTahunAjaranSemester/TahunAjaranSemester.jsx', 'w') as f:
    f.write(content)

