import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import toast from "react-hot-toast";

// ── Query Keys ───────────────────────────────────────────────────────────────

export const keuanganKeys = {
  all: ["keuangan"],
  dashboard: () => [...keuanganKeys.all, "dashboard"],
  jenisTagihan: {
    all: ["keuangan", "jenis-tagihan"],
    lists: () => [...keuanganKeys.jenisTagihan.all, "list"],
    list: (f) => [...keuanganKeys.jenisTagihan.lists(), f],
    detail: (id) => [...keuanganKeys.jenisTagihan.all, "detail", id],
  },
  tagihan: {
    all: ["keuangan", "tagihan"],
    lists: () => [...keuanganKeys.tagihan.all, "list"],
    list: (f) => [...keuanganKeys.tagihan.lists(), f],
    detail: (id) => [...keuanganKeys.tagihan.all, "detail", id],
    tunggakan: (f) => [...keuanganKeys.tagihan.all, "tunggakan", f],
    rekap: (siswaId) => [...keuanganKeys.tagihan.all, "rekap", siswaId],
  },
  pembayaran: {
    all: ["keuangan", "pembayaran"],
    lists: () => [...keuanganKeys.pembayaran.all, "list"],
    list: (f) => [...keuanganKeys.pembayaran.lists(), f],
    detail: (id) => [...keuanganKeys.pembayaran.all, "detail", id],
    laporan: (f) => [...keuanganKeys.pembayaran.all, "laporan", f],
  },
};

// ── Dashboard ────────────────────────────────────────────────────────────────

export function useKeuanganDashboard(params = {}) {
  return useQuery({
    queryKey: keuanganKeys.dashboard(),
    queryFn: async () => {
      const { data } = await api.get("/keuangan/dashboard-stats", { params });
      return data.data;
    },
    staleTime: 30_000,
  });
}

// ── Jenis Tagihan ────────────────────────────────────────────────────────────

export function useJenisTagihanList(params = {}) {
  return useQuery({
    queryKey: keuanganKeys.jenisTagihan.list(params),
    queryFn: async () => {
      const { data } = await api.get("/keuangan/jenis-tagihan", { params });
      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useJenisTagihanDetail(id) {
  return useQuery({
    queryKey: keuanganKeys.jenisTagihan.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/keuangan/jenis-tagihan/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateJenisTagihan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/keuangan/jenis-tagihan", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keuanganKeys.jenisTagihan.lists() });
      toast.success("Jenis tagihan berhasil ditambahkan.");
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? "Gagal menambahkan jenis tagihan.",
      ),
  });
}

export function useUpdateJenisTagihan(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.put(`/keuangan/jenis-tagihan/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keuanganKeys.jenisTagihan.lists() });
      qc.invalidateQueries({ queryKey: keuanganKeys.jenisTagihan.detail(id) });
      toast.success("Jenis tagihan berhasil diperbarui.");
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? "Gagal memperbarui jenis tagihan.",
      ),
  });
}

export function useDeleteJenisTagihan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/keuangan/jenis-tagihan/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keuanganKeys.jenisTagihan.lists() });
      toast.success("Jenis tagihan dihapus.");
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? "Gagal menghapus jenis tagihan.",
      ),
  });
}

export function useToggleJenisTagihan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      api.patch(`/keuangan/jenis-tagihan/${id}/toggle-active`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keuanganKeys.jenisTagihan.lists() });
      toast.success("Status jenis tagihan diperbarui.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal mengubah status."),
  });
}

// ── Tagihan ──────────────────────────────────────────────────────────────────

export function useTagihanList(params = {}) {
  return useQuery({
    queryKey: keuanganKeys.tagihan.list(params),
    queryFn: async () => {
      const { data } = await api.get("/keuangan/tagihan", { params });
      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useTagihanDetail(id) {
  return useQuery({
    queryKey: keuanganKeys.tagihan.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/keuangan/tagihan/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useTunggakan(params = {}) {
  return useQuery({
    queryKey: keuanganKeys.tagihan.tunggakan(params),
    queryFn: async () => {
      const { data } = await api.get("/keuangan/tagihan/tunggakan", { params });
      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useRekapSiswa(siswaId) {
  return useQuery({
    queryKey: keuanganKeys.tagihan.rekap(siswaId),
    queryFn: async () => {
      const { data } = await api.get(
        `/keuangan/tagihan/rekap-siswa/${siswaId}`,
      );
      return data.data;
    },
    enabled: Boolean(siswaId),
  });
}

export function useCreateTagihan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/keuangan/tagihan", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keuanganKeys.tagihan.lists() });
      qc.invalidateQueries({ queryKey: keuanganKeys.dashboard() });
      toast.success("Tagihan berhasil dibuat.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal membuat tagihan."),
  });
}

export function useGenerateTagihan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/keuangan/tagihan/generate", payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: keuanganKeys.tagihan.lists() });
      qc.invalidateQueries({ queryKey: keuanganKeys.dashboard() });
      const jumlah = res.data?.data?.generated ?? "";
      toast.success(`Berhasil generate ${jumlah} tagihan.`);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal generate tagihan."),
  });
}

export function useUpdateTagihan(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.put(`/keuangan/tagihan/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keuanganKeys.tagihan.lists() });
      qc.invalidateQueries({ queryKey: keuanganKeys.tagihan.detail(id) });
      toast.success("Tagihan diperbarui.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal memperbarui tagihan."),
  });
}

export function useDeleteTagihan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/keuangan/tagihan/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keuanganKeys.tagihan.lists() });
      qc.invalidateQueries({ queryKey: keuanganKeys.dashboard() });
      toast.success("Tagihan dihapus.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus tagihan."),
  });
}

// ── Pembayaran ───────────────────────────────────────────────────────────────

export function usePembayaranKeuanganList(params = {}) {
  return useQuery({
    queryKey: keuanganKeys.pembayaran.list(params),
    queryFn: async () => {
      const { data } = await api.get("/keuangan/pembayaran", { params });
      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function usePembayaranDetail(id) {
  return useQuery({
    queryKey: keuanganKeys.pembayaran.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/keuangan/pembayaran/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useLaporanPembayaran(params = {}) {
  return useQuery({
    queryKey: keuanganKeys.pembayaran.laporan(params),
    queryFn: async () => {
      const { data } = await api.get("/keuangan/pembayaran/laporan", {
        params,
      });
      return data.data;
    },
    staleTime: 30_000,
  });
}

export function useCreatePembayaranKeuangan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/keuangan/pembayaran", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keuanganKeys.pembayaran.lists() });
      qc.invalidateQueries({ queryKey: keuanganKeys.tagihan.lists() });
      qc.invalidateQueries({ queryKey: keuanganKeys.dashboard() });
      toast.success("Pembayaran berhasil dicatat.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal mencatat pembayaran."),
  });
}

export function useBatalkanPembayaran() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/keuangan/pembayaran/${id}/batalkan`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keuanganKeys.pembayaran.lists() });
      qc.invalidateQueries({ queryKey: keuanganKeys.tagihan.lists() });
      qc.invalidateQueries({ queryKey: keuanganKeys.dashboard() });
      toast.success("Pembayaran berhasil dibatalkan.");
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? "Gagal membatalkan pembayaran.",
      ),
  });
}
