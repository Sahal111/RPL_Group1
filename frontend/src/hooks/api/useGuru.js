import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const BASE = "/operator/master-data/guru";

// ── Query Keys ─────────────────────────────────────────────

export const guruKeys = {
  all: ["guru"],
  lists: () => [...guruKeys.all, "list"],
  list: (filters) => [...guruKeys.lists(), filters],
  details: () => [...guruKeys.all, "detail"],
  detail: (id) => [...guruKeys.details(), id],
  stats: () => [...guruKeys.all, "stats"],
  dropdown: () => [...guruKeys.all, "dropdown"],
};

// ── Hooks ───────────────────────────────────────────────────

/**
 * Fetch daftar guru dengan filter & pagination
 * @param {Object} params - { page, per_page, search, status_aktif, jenis_ptk }
 */
export function useGuruList(params = {}) {
  return useQuery({
    queryKey: guruKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get(BASE, { params });
      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

/**
 * Fetch detail satu guru by ID/ULID/NUPTK
 */
export function useGuruDetail(id) {
  return useQuery({
    queryKey: guruKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`${BASE}/${id}`);
      return data;
    },
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

/**
 * Fetch stats dashboard guru
 */
export function useGuruStats() {
  return useQuery({
    queryKey: guruKeys.stats(),
    queryFn: async () => {
      const { data } = await api.get(`${BASE}/stats`);
      return data;
    },
    staleTime: 60_000,
  });
}

/**
 * Fetch dropdown list guru (id + nama)
 */
export function useGuruDropdown() {
  return useQuery({
    queryKey: guruKeys.dropdown(),
    queryFn: async () => {
      const { data } = await api.get(`${BASE}/dropdown`);
      return data;
    },
    staleTime: 120_000,
  });
}

/**
 * Mutation: tambah guru baru
 */
export function useCreateGuru() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => api.post(BASE, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guruKeys.lists() });
      toast.success("Data guru berhasil ditambahkan.");
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Gagal menambahkan guru.";
      toast.error(msg);
    },
  });
}

/**
 * Mutation: update data guru
 */
export function useUpdateGuru(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => api.put(`${BASE}/${id}`, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guruKeys.detail(id) });
      qc.invalidateQueries({ queryKey: guruKeys.lists() });
      toast.success("Data guru berhasil diperbarui.");
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Gagal memperbarui guru.";
      toast.error(msg);
    },
  });
}

/**
 * Mutation: hapus guru (soft delete)
 */
export function useDeleteGuru() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`${BASE}/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guruKeys.lists() });
      toast.success("Data guru berhasil dihapus.");
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Gagal menghapus guru.";
      toast.error(msg);
    },
  });
}
