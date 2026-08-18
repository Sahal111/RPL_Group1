import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import api from "../../lib/axios";
import useSelectedAnak from "../../hooks/useSelectedAnak";

/**
 * AnakSelector — toolbar untuk memilih anak aktif, mengubah hubungan, dan menghapus.
 * Dipasang sebagai `header` prop di AppLayout untuk halaman ortu.
 */
export default function AnakSelector() {
  const { anak, selectedNisn, setSelectedNisn } = useSelectedAnak();
  const queryClient = useQueryClient();
  const [editHubungan, setEditHubungan] = useState(null);

  const anakAktif = anak.find((item) => item.nisn === selectedNisn);

  const updateMutation = useMutation({
    mutationFn: (hubungan) =>
      api.put(`/ortu/anak/${selectedNisn}`, { hubungan }),
    onSuccess: () => {
      toast.success("Status hubungan berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: ["ortu-daftar-anak"] });
      setEditHubungan(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal memperbarui data.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/ortu/anak/${selectedNisn}`),
    onSuccess: () => {
      toast.success("Anak berhasil dihapus dari akun.");
      queryClient.invalidateQueries({ queryKey: ["ortu-daftar-anak"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal menghapus data.");
    },
  });

  const handleHapus = () => {
    if (!anakAktif) return;
    const yakin = window.confirm(
      `Yakin mau hapus "${anakAktif.nama_lengkap}" dari akun kamu? Kamu bisa nautin lagi nanti pakai kode dari operator.`,
    );
    if (yakin) deleteMutation.mutate();
  };

  if (anak.length === 0) return null;

  return (
    <>
      <div className="mb-2 flex justify-end">
        <div className="flex items-center gap-2">
          {anak.length > 1 ? (
            <label className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium">Pilih Anak</span>
              <select
                value={selectedNisn}
                onChange={(e) => setSelectedNisn(e.target.value)}
                className="input-field min-w-[240px] bg-white"
              >
                {anak.map((item) => (
                  <option key={item.nisn} value={item.nisn}>
                    {item.nama_lengkap} - {item.nisn}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="text-sm text-gray-600">
              <span className="font-medium">Anak:</span>{" "}
              {anakAktif?.nama_lengkap}
            </span>
          )}

          <button
            type="button"
            title="Ubah status hubungan"
            onClick={() => setEditHubungan(anakAktif?.hubungan || "Ayah")}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Hapus anak dari akun"
            onClick={handleHapus}
            disabled={deleteMutation.isPending}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Edit Hubungan */}
      {editHubungan !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-4">
              Ubah Status Hubungan
            </h3>
            <select
              value={editHubungan}
              onChange={(e) => setEditHubungan(e.target.value)}
              className="input-field bg-white w-full mb-4"
            >
              <option value="Ayah">Ayah</option>
              <option value="Ibu">Ibu</option>
              <option value="Wali">Wali</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditHubungan(null)}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate(editHubungan)}
                className="btn-primary px-4 py-2 text-sm"
              >
                {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
