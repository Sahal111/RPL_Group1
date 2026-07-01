import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
import useSelectedAnak from "../../hooks/useSelectedAnak";

export default function TambahAnak() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setSelectedNisn } = useSelectedAnak();

  const [form, setForm] = useState({
    nisn: "",
    kode_anak: "",
    hubungan: "Ayah",
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) => api.post("/ortu/anak", data),
    onSuccess: (res) => {
      toast.success(res.data.message || "Anak berhasil ditautkan.", {
        duration: 4000,
      });
      // Refresh daftar anak (dipakai selector di OrtuLayout & halaman lain)
      queryClient.invalidateQueries({ queryKey: ["ortu-daftar-anak"] });

      // Langsung pindahkan tampilan ke anak yang baru ditambahkan
      setSelectedNisn(form.nisn);

      navigate("/ortu/data-anak");
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((e) =>
          toast.error(e[0]),
        );
      } else {
        toast.error(err.response?.data?.message || "Gagal menautkan anak.");
      }
    },
    onSettled: () => setLoading(false),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    mutation.mutate(form);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tambah Anak</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tautkan anak lain ke akun kamu. Kode di bawah khusus untuk anak dengan
          NISN yang kamu masukkan — minta ke operator sekolah untuk anak
          tersebut.
        </p>
      </div>

      <div className="card shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="font-semibold text-gray-800">Tautkan Anak Baru</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NISN Anak
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={form.nisn}
              onChange={(e) => set("nisn", e.target.value)}
              className="input-field"
              placeholder="NISN Nasional (10 digit)"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Hubungan
            </label>
            <select
              value={form.hubungan}
              onChange={(e) => set("hubungan", e.target.value)}
              className="input-field bg-white"
              disabled={loading}
            >
              <option value="Ayah">Ayah</option>
              <option value="Ibu">Ibu</option>
              <option value="Wali">Wali</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kode Anak
            </label>
            <input
              type="text"
              required
              value={form.kode_anak}
              onChange={(e) => set("kode_anak", e.target.value)}
              className="input-field"
              placeholder="Kode khusus anak ini dari operator"
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">
              Setiap siswa punya kode berbeda. Kode ini cuma bisa dipakai untuk
              NISN di atas — bukan kode registrasi akun awal.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Menautkan..." : "Tautkan Anak"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
