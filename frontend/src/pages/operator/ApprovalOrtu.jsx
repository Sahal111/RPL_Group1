import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { UserCheck, UserX, Clock, User } from "lucide-react";

export default function ApprovalOrtu() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["ortu-pending"],
    queryFn: () => api.get("/operator/ortu/pending").then((r) => r.data.data),
    refetchInterval: 30000, // auto refresh tiap 30 detik
  });

  const approve = useMutation({
    mutationFn: (id) => api.patch(`/operator/users/${id}/approve-ortu`),
    onSuccess: () => {
      toast.success("Akun orang tua berhasil disetujui.");
      queryClient.invalidateQueries(["ortu-pending"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menyetujui."),
  });

  const tolak = useMutation({
    mutationFn: (id) => api.delete(`/operator/users/${id}`),
    onSuccess: () => {
      toast.success("Akun orang tua berhasil ditolak dan dihapus.");
      queryClient.invalidateQueries(["ortu-pending"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menolak."),
  });

  const list = data ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Approval Orang Tua
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Daftar akun orang tua yang menunggu persetujuan
          </p>
        </div>
        {list.length > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-sm font-medium px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            {list.length} menunggu
          </span>
        )}
      </div>

      {/* Empty state */}
      {!isLoading && list.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Semua sudah diproses!
          </h3>
          <p className="text-sm text-gray-400">
            Tidak ada akun orang tua yang menunggu persetujuan.
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="card flex items-center justify-center py-16">
          <p className="text-gray-400">Memuat data...</p>
        </div>
      )}

      {/* List */}
      {!isLoading && list.length > 0 && (
        <div className="space-y-4">
          {list.map((u) => (
            <div
              key={u.id}
              className="card flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-bold">
                    {u.nama_lengkap?.charAt(0)?.toUpperCase()}
                  </span>
                </div>

                {/* Info ortu */}
                <div>
                  <p className="font-semibold text-gray-800">
                    {u.nama_lengkap}
                  </p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                  {u.no_hp && (
                    <p className="text-sm text-gray-500">📱 {u.no_hp}</p>
                  )}
                </div>
              </div>

              {/* Info anak */}
              {u.ortu_profile?.siswa && (
                <div className="hidden md:flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 flex-1 max-w-xs">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Data Anak</p>
                    <p className="text-sm font-medium text-gray-700">
                      {u.ortu_profile.siswa.nama_lengkap}
                    </p>
                    <p className="text-xs text-gray-400">
                      NISN: {u.ortu_profile.nisn} · {u.ortu_profile.hubungan}
                    </p>
                  </div>
                </div>
              )}

              {/* Tanggal daftar */}
              <div className="hidden lg:block text-right">
                <p className="text-xs text-gray-400">Mendaftar</p>
                <p className="text-sm text-gray-600">
                  {new Date(u.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Aksi */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    if (confirm(`Setujui akun ${u.nama_lengkap}?`))
                      approve.mutate(u.id);
                  }}
                  disabled={approve.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  Setujui
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Tolak dan hapus akun ${u.nama_lengkap}? Tindakan ini tidak bisa dibatalkan.`,
                      )
                    )
                      tolak.mutate(u.id);
                  }}
                  disabled={tolak.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" />
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
