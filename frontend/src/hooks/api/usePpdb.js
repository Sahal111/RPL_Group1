import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import toast from "react-hot-toast";

// ── Query Keys ──────────────────────────────────────────────────────────────

export const ppdbKeys = {
  all: ["ppdb"],
  dashboard: () => [...ppdbKeys.all, "dashboard"],
  lists: () => [...ppdbKeys.all, "list"],
  list: (filters) => [...ppdbKeys.lists(), filters],
  details: () => [...ppdbKeys.all, "detail"],
  detail: (id) => [...ppdbKeys.details(), id],
  berkas: (id) => [...ppdbKeys.detail(id), "berkas"],
  pembayaran: (id) => [...ppdbKeys.detail(id), "pembayaran"],
};

// ── Dashboard ───────────────────────────────────────────────────────────────

export function usePpdbDashboard(tahunAjaranId) {
  return useQuery({
    queryKey: ppdbKeys.dashboard(),
    queryFn: async () => {
      const { data } = await api.get("/ppdb/dashboard-stats", {
        params: tahunAjaranId ? { tahun_ajaran_id: tahunAjaranId } : {},
      });
      return data.data;
    },
    staleTime: 30_000,
  });
}

// ── Calon Siswa ─────────────────────────────────────────────────────────────

export function useCalonSiswaList(params = {}) {
  return useQuery({
    queryKey: ppdbKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get("/ppdb/calon-siswa", { params });
      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useCalonSiswaDetail(id) {
  return useQuery({
    queryKey: ppdbKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/ppdb/calon-siswa/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCreateCalonSiswa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/ppdb/calon-siswa", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ppdbKeys.lists() });
      qc.invalidateQueries({ queryKey: ppdbKeys.dashboard() });
      toast.success("Pendaftar berhasil ditambahkan.");
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? "Gagal menambahkan pendaftar.",
      ),
  });
}

export function useUpdateCalonSiswa(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.put(`/ppdb/calon-siswa/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ppdbKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ppdbKeys.lists() });
      toast.success("Data pendaftar berhasil diperbarui.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal memperbarui data."),
  });
}

export function useDeleteCalonSiswa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/ppdb/calon-siswa/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ppdbKeys.lists() });
      qc.invalidateQueries({ queryKey: ppdbKeys.dashboard() });
      toast.success("Data pendaftar berhasil dihapus.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus data."),
  });
}

export function useVerifikasiCalonSiswa(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      api.patch(`/ppdb/calon-siswa/${id}/verifikasi`, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ppdbKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ppdbKeys.lists() });
      qc.invalidateQueries({ queryKey: ppdbKeys.dashboard() });
      toast.success(`Status diubah ke "${vars.status}".`);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal mengubah status."),
  });
}

export function useKonversiSiswa(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      api.post(`/ppdb/calon-siswa/${id}/konversi`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ppdbKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ppdbKeys.lists() });
      qc.invalidateQueries({ queryKey: ppdbKeys.dashboard() });
      toast.success("Calon siswa berhasil dikonversi menjadi siswa aktif!");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal mengkonversi."),
  });
}

// ── Berkas Pendaftar ────────────────────────────────────────────────────────

export function useBerkasList(calonSiswaId) {
  return useQuery({
    queryKey: ppdbKeys.berkas(calonSiswaId),
    queryFn: async () => {
      const { data } = await api.get(
        `/ppdb/calon-siswa/${calonSiswaId}/berkas`,
      );
      return data.data;
    },
    enabled: Boolean(calonSiswaId),
  });
}

export function useUploadBerkas(calonSiswaId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) =>
      api.post(`/ppdb/calon-siswa/${calonSiswaId}/berkas`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ppdbKeys.berkas(calonSiswaId) });
      toast.success("Berkas berhasil diunggah.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal mengunggah berkas."),
  });
}

export function useDeleteBerkas(calonSiswaId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (berkasId) =>
      api.delete(`/ppdb/calon-siswa/${calonSiswaId}/berkas/${berkasId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ppdbKeys.berkas(calonSiswaId) });
      toast.success("Berkas dihapus.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus berkas."),
  });
}

export function useVerifikasiBerkas(calonSiswaId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ berkasId, ...payload }) =>
      api.patch(
        `/ppdb/calon-siswa/${calonSiswaId}/berkas/${berkasId}/verifikasi`,
        payload,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ppdbKeys.berkas(calonSiswaId) });
      toast.success("Status berkas diperbarui.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal memverifikasi berkas."),
  });
}

// ── Pembayaran PPDB ─────────────────────────────────────────────────────────

export function usePembayaranList(calonSiswaId) {
  return useQuery({
    queryKey: ppdbKeys.pembayaran(calonSiswaId),
    queryFn: async () => {
      const { data } = await api.get(
        `/ppdb/calon-siswa/${calonSiswaId}/pembayaran`,
      );
      return data.data;
    },
    enabled: Boolean(calonSiswaId),
  });
}

export function useCreatePembayaran(calonSiswaId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      api.post(`/ppdb/calon-siswa/${calonSiswaId}/pembayaran`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ppdbKeys.pembayaran(calonSiswaId) });
      toast.success("Pembayaran berhasil dicatat.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal mencatat pembayaran."),
  });
}

export function useDeletePembayaran(calonSiswaId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bayarId) =>
      api.delete(`/ppdb/calon-siswa/${calonSiswaId}/pembayaran/${bayarId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ppdbKeys.pembayaran(calonSiswaId) });
      toast.success("Data pembayaran dihapus.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus pembayaran."),
  });
}
