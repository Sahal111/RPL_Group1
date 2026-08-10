import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import toast from "react-hot-toast";

// ── Query Keys ───────────────────────────────────────────────────────────────

export const lmsKeys = {
  all: ["lms"],
  materi: {
    all: ["lms", "materi"],
    lists: () => [...lmsKeys.materi.all, "list"],
    list: (f) => [...lmsKeys.materi.lists(), f],
    detail: (id) => [...lmsKeys.materi.all, "detail", id],
  },
  tugas: {
    all: ["lms", "tugas"],
    lists: () => [...lmsKeys.tugas.all, "list"],
    list: (f) => [...lmsKeys.tugas.lists(), f],
    detail: (id) => [...lmsKeys.tugas.all, "detail", id],
    submissions: (id) => [...lmsKeys.tugas.detail(id), "submissions"],
  },
  ujian: {
    all: ["lms", "ujian"],
    lists: () => [...lmsKeys.ujian.all, "list"],
    list: (f) => [...lmsKeys.ujian.lists(), f],
    detail: (id) => [...lmsKeys.ujian.all, "detail", id],
    sessions: (id) => [...lmsKeys.ujian.detail(id), "sessions"],
  },
};

// ── MATERI (Guru/Operator) ───────────────────────────────────────────────────

export function useMateriList(params = {}) {
  return useQuery({
    queryKey: lmsKeys.materi.list(params),
    queryFn: async () => {
      const { data } = await api.get("/lms/materi", { params });
      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useMateriDetail(id) {
  return useQuery({
    queryKey: lmsKeys.materi.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/lms/materi/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateMateri() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/lms/materi", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.materi.lists() });
      toast.success("Materi berhasil ditambahkan.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menambahkan materi."),
  });
}

export function useUpdateMateri(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.put(`/lms/materi/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.materi.lists() });
      qc.invalidateQueries({ queryKey: lmsKeys.materi.detail(id) });
      toast.success("Materi berhasil diperbarui.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal memperbarui materi."),
  });
}

export function useDeleteMateri() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/lms/materi/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.materi.lists() });
      toast.success("Materi dihapus.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus materi."),
  });
}

export function useTogglePublishMateri() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/lms/materi/${id}/toggle-publish`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.materi.lists() });
      toast.success("Status publish materi diperbarui.");
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? "Gagal mengubah status publish.",
      ),
  });
}

// ── TUGAS ────────────────────────────────────────────────────────────────────

export function useTugasList(params = {}) {
  return useQuery({
    queryKey: lmsKeys.tugas.list(params),
    queryFn: async () => {
      const { data } = await api.get("/lms/tugas", { params });
      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useTugasDetail(id) {
  return useQuery({
    queryKey: lmsKeys.tugas.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/lms/tugas/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useTugasSubmissions(id) {
  return useQuery({
    queryKey: lmsKeys.tugas.submissions(id),
    queryFn: async () => {
      const { data } = await api.get(`/lms/tugas/${id}/submissions`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateTugas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/lms/tugas", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.tugas.lists() });
      toast.success("Tugas berhasil ditambahkan.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menambahkan tugas."),
  });
}

export function useUpdateTugas(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.put(`/lms/tugas/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.tugas.lists() });
      qc.invalidateQueries({ queryKey: lmsKeys.tugas.detail(id) });
      toast.success("Tugas berhasil diperbarui.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal memperbarui tugas."),
  });
}

export function useDeleteTugas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/lms/tugas/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.tugas.lists() });
      toast.success("Tugas dihapus.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus tugas."),
  });
}

export function useTogglePublishTugas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/lms/tugas/${id}/toggle-publish`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.tugas.lists() });
      toast.success("Status publish tugas diperbarui.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal mengubah status."),
  });
}

export function useNilaiSubmission(tugasId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, ...payload }) =>
      api.post(
        `/lms/tugas/${tugasId}/submissions/${submissionId}/nilai`,
        payload,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.tugas.submissions(tugasId) });
      toast.success("Nilai berhasil disimpan.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menyimpan nilai."),
  });
}

// ── TUGAS (Siswa) ─────────────────────────────────────────────────────────────

export function useTugasSiswa(id) {
  return useQuery({
    queryKey: [...lmsKeys.tugas.detail(id), "siswa"],
    queryFn: async () => {
      const { data } = await api.get(`/lms/siswa/tugas/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useSubmitTugas(tugasId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) =>
      api.post(`/lms/siswa/tugas/${tugasId}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [...lmsKeys.tugas.detail(tugasId), "siswa"],
      });
      toast.success("Tugas berhasil dikumpulkan!");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal mengumpulkan tugas."),
  });
}

// ── UJIAN ────────────────────────────────────────────────────────────────────

export function useUjianList(params = {}) {
  return useQuery({
    queryKey: lmsKeys.ujian.list(params),
    queryFn: async () => {
      const { data } = await api.get("/lms/ujian", { params });
      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useUjianDetail(id) {
  return useQuery({
    queryKey: lmsKeys.ujian.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/lms/ujian/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useUjianSessions(id) {
  return useQuery({
    queryKey: lmsKeys.ujian.sessions(id),
    queryFn: async () => {
      const { data } = await api.get(`/lms/ujian/${id}/sessions`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateUjian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/lms/ujian", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.ujian.lists() });
      toast.success("Ujian berhasil ditambahkan.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menambahkan ujian."),
  });
}

export function useUpdateUjian(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.put(`/lms/ujian/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.ujian.lists() });
      qc.invalidateQueries({ queryKey: lmsKeys.ujian.detail(id) });
      toast.success("Ujian berhasil diperbarui.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal memperbarui ujian."),
  });
}

export function useDeleteUjian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/lms/ujian/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.ujian.lists() });
      toast.success("Ujian dihapus.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus ujian."),
  });
}

export function useTogglePublishUjian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/lms/ujian/${id}/toggle-publish`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.ujian.lists() });
      toast.success("Status publish ujian diperbarui.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal mengubah status."),
  });
}

export function useStoreSoal(ujianId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(`/lms/ujian/${ujianId}/soal`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.ujian.detail(ujianId) });
      toast.success("Soal berhasil ditambahkan.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menambahkan soal."),
  });
}

export function useUpdateSoal(ujianId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, ...payload }) =>
      api.put(`/lms/ujian/${ujianId}/soal/${questionId}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.ujian.detail(ujianId) });
      toast.success("Soal diperbarui.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal memperbarui soal."),
  });
}

export function useDeleteSoal(ujianId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId) =>
      api.delete(`/lms/ujian/${ujianId}/soal/${questionId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.ujian.detail(ujianId) });
      toast.success("Soal dihapus.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menghapus soal."),
  });
}

export function useNilaiEsai(ujianId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, ...payload }) =>
      api.post(
        `/lms/ujian/${ujianId}/sessions/${sessionId}/nilai-esai`,
        payload,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lmsKeys.ujian.sessions(ujianId) });
      toast.success("Nilai esai disimpan.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menyimpan nilai esai."),
  });
}

// ── UJIAN (Siswa) ─────────────────────────────────────────────────────────────

export function useMulaiUjian(ujianId) {
  return useMutation({
    mutationFn: () => api.post(`/lms/siswa/ujian/${ujianId}/mulai`),
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal memulai ujian."),
  });
}

export function useJawabSoal(ujianId, sessionId) {
  return useMutation({
    mutationFn: (payload) =>
      api.post(
        `/lms/siswa/ujian/${ujianId}/sessions/${sessionId}/jawab`,
        payload,
      ),
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal menyimpan jawaban."),
  });
}

export function useSubmitUjian(ujianId, sessionId) {
  return useMutation({
    mutationFn: () =>
      api.post(`/lms/siswa/ujian/${ujianId}/sessions/${sessionId}/submit`),
    onSuccess: () => {
      toast.success("Ujian berhasil dikumpulkan!");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal mengumpulkan ujian."),
  });
}
