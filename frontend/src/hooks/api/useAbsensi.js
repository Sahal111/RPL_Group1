import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const BASE_GURU = "/guru/absensi";
const BASE_OPERATOR = "/operator/absensi";

export const absensiKeys = {
  all: ["absensi"],
  lists: () => [...absensiKeys.all, "list"],
  list: (filters) => [...absensiKeys.lists(), filters],
  rekap: (filters) => [...absensiKeys.all, "rekap", filters],
  detail: (id) => [...absensiKeys.all, "detail", id],
};

/**
 * Fetch daftar absensi (monitoring / rekap operator)
 */
export function useAbsensiList(params = {}) {
  return useQuery({
    queryKey: absensiKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get(`${BASE_OPERATOR}/monitoring`, { params });
      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

/**
 * Fetch rekap absensi guru
 */
export function useAbsensiRekap(params = {}) {
  return useQuery({
    queryKey: absensiKeys.rekap(params),
    queryFn: async () => {
      const { data } = await api.get(`${BASE_GURU}/rekap`, { params });
      return data;
    },
    enabled: Boolean(params.kelas_id || params.semester_id),
    staleTime: 30_000,
  });
}

/**
 * Mutation: input absensi
 */
export function useInputAbsensi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(`${BASE_GURU}/input`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: absensiKeys.lists() });
      toast.success("Absensi berhasil disimpan.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? "Gagal menyimpan absensi.");
    },
  });
}
