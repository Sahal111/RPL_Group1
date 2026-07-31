import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

// Universal file downloader — pakai di semua tab
function useFileDownload(nuptk) {
  const download = async (filePath, namaFile = "dokumen") => {
    try {
      const res = await api.get(
        `/operator/master-data/guru/${nuptk}/file-download`,
        {
          params: { path: filePath, nama: namaFile },
          responseType: "blob",
        },
      );
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = namaFile;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mendownload file.");
    }
  };
  return download;
}

/* ─── Helper ─── */
function fmtDate(val) {
  if (!val) return "-";
  try {
    return new Date(val).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return val;
  }
}

/* ─── InfoRow — persis border-b border-surface-container seperti template ─── */
function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between border-b border-surface-container pb-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`text-sm font-semibold ${mono ? "font-mono" : ""}`}>
        {value || "-"}
      </span>
    </div>
  );
}

/* ─── SubLabel ─── */
function SubLabel({ children }) {
  return (
    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-3 mt-6">
      {children}
    </p>
  );
}

/* ─── SectionTitle — sama persis template ─── */
function SectionTitle({ icon, label, desc }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div>
        <h3 className="font-section-title text-section-title text-text-primary">
          {label}
        </h3>
        {desc && <p className="text-sm text-text-secondary">{desc}</p>}
      </div>
    </div>
  );
}

/* ─── Tab Button — persis template ─── */
function TabBtn({ active, onClick, children, badge }) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors text-primary border-b-2 border-primary bg-surface-container-low/50 rounded-t-lg flex items-center gap-2"
          : "px-5 py-3.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest whitespace-nowrap transition-colors flex items-center gap-2"
      }
    >
      {children}
      {badge != null && (
        <span className="bg-surface-container-high px-1.5 py-0.5 rounded text-xs">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ─── Metric Card — persis template ─── */
function MetricCard({ icon, iconBg, iconColor, label, value, sub, subColor }) {
  return (
    <div className="bg-surface rounded-xl p-5 border border-border-light shadow-sm flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${iconBg} ${iconColor} rounded-lg`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-text-primary">{value}</span>
        {sub && (
          <span
            className={`text-sm font-medium mb-1 ${subColor ?? "text-text-secondary"}`}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 1 — Identitas & Kepegawaian
   ══════════════════════════════════════════════════════════ */
function TabIdentitas({ guru, onGoToRiwayat }) {
  return (
    <div className="space-y-6">
      {/* Identitas Pribadi */}
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="badge" label="Identitas Pribadi" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
          <div className="space-y-3">
            <InfoRow label="NUPTK" value={guru.nuptk} mono />
            <InfoRow label="NIP / NI PPPK" value={guru.nip} mono />
            <InfoRow label="NIK" value={guru.nik} mono />
            <InfoRow label="No. Kartu Keluarga" value={guru.no_kk} mono />
            <InfoRow label="No. Karpeg" value={guru.no_karpeg} mono />
            <InfoRow
              label="Jenis Kelamin"
              value={guru.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
            />
          </div>
          <div className="space-y-3">
            <InfoRow label="Tempat Lahir" value={guru.tempat_lahir} />
            <InfoRow
              label="Tanggal Lahir"
              value={fmtDate(guru.tanggal_lahir)}
            />
            <InfoRow label="Agama" value={guru.agama} />
            <InfoRow label="Golongan Darah" value={guru.golongan_darah} />
            <InfoRow label="Kewarganegaraan" value={guru.kewarganegaraan} />
            <InfoRow label="Nama Ibu Kandung" value={guru.nama_ibu_kandung} />
          </div>
        </div>
        <SubLabel>Kontak</SubLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <InfoRow label="No. HP" value={guru.no_hp} />
          <InfoRow label="No. WhatsApp" value={guru.no_wa} />
          <InfoRow label="Email" value={guru.email} />
        </div>
      </div>

      {/* Kepegawaian */}
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="work" label="Status Kepegawaian" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
          <div className="space-y-3">
            <InfoRow
              label="Status Kepegawaian"
              value={guru.status_kepegawaian}
            />
            <InfoRow label="Status Keaktifan" value={guru.status_keaktifan} />
            <InfoRow label="Jenis PTK" value={guru.jenis_ptk} />
            <InfoRow
              label="Tanggal Bergabung"
              value={fmtDate(guru.tanggal_bergabung)}
            />
          </div>
          <div className="space-y-3">
            <InfoRow label="TMT PNS / PPPK" value={fmtDate(guru.tmt_pns)} />
            <InfoRow label="TMT GTY" value={fmtDate(guru.tmt_gty)} />
            <InfoRow
              label="Masa Kerja"
              value={
                guru.masa_kerja_tahun ? `${guru.masa_kerja_tahun} Tahun` : null
              }
            />
          </div>
        </div>

        {/* Golongan & Pangkat dari jabatan aktif
        {(guru.jabatan_aktif || guru.jabatanAktif) && (
          <>
            <SubLabel>Kepangkatan Aktif</SubLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
              <InfoRow
                label="Golongan / Ruang"
                value={
                  (guru.jabatan_aktif?.golongan ??
                    guru.jabatanAktif?.golongan) ||
                  "-"
                }
                mono
              />
              <InfoRow
                label="Pangkat"
                value={
                  guru.jabatan_aktif?.pangkat ?? guru.jabatanAktif?.pangkat
                }
              />
              <InfoRow
                label="Jabatan Aktif"
                value={
                  guru.jabatan_aktif?.jabatan ?? guru.jabatanAktif?.jabatan
                }
              />
            </div>
          </>
        )} */}

        {/* <SubLabel>SK Pengangkatan</SubLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <InfoRow label="No. SK" value={guru.no_sk_pengangkatan} />
          <InfoRow
            label="Tanggal SK"
            value={fmtDate(guru.tgl_sk_pengangkatan)}
          />
          <InfoRow
            label="Instansi Pengangkat"
            value={guru.instansi_pengangkat}
          />
        </div> */}
        {/* Jabatan aktif — ringkasan, detail ada di Tab Riwayat */}
        {(guru.jabatan_aktif || guru.jabatanAktif) && (
          <>
            <SubLabel>Jabatan Aktif</SubLabel>
            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/15 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  badge
                </span>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {guru.jabatan_aktif?.jabatan ??
                      guru.jabatanAktif?.jabatan ??
                      "-"}
                  </p>
                  {(guru.jabatan_aktif?.golongan ??
                    guru.jabatanAktif?.golongan) && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      Gol.{" "}
                      {guru.jabatan_aktif?.golongan ??
                        guru.jabatanAktif?.golongan}
                      {(guru.jabatan_aktif?.pangkat ??
                        guru.jabatanAktif?.pangkat) &&
                        ` · ${guru.jabatan_aktif?.pangkat ?? guru.jabatanAktif?.pangkat}`}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onGoToRiwayat}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                Lihat riwayat
                <span className="material-symbols-outlined text-[14px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Alamat */}
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="location_on" label="Alamat" />
        <div className="space-y-3 mb-4">
          <InfoRow label="Jalan" value={guru.alamat_jalan} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
          <InfoRow
            label="RT / RW"
            value={`${guru.rt ?? "-"} / ${guru.rw ?? "-"}`}
          />
          <InfoRow label="Dusun" value={guru.dusun} />
          <InfoRow label="Desa / Kelurahan" value={guru.desa_kelurahan} />
          <InfoRow label="Kecamatan" value={guru.kecamatan} />
          <InfoRow label="Kabupaten / Kota" value={guru.kota_kabupaten} />
          <InfoRow label="Provinsi" value={guru.provinsi} />
          <InfoRow label="Kode Pos" value={guru.kode_pos} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 2 — Penugasan & Kompetensi
   ══════════════════════════════════════════════════════════ */
function TabPenugasan({ guru }) {
  const mapels = guru.plot_mapels ?? [];
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="menu_book" label="Mata Pelajaran & Penugasan" />
        {mapels.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            Belum ada data penugasan mengajar.
          </p>
        ) : (
          <div className="space-y-3">
            {mapels.map((m, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-border-light"
              >
                <span className="text-sm font-medium text-text-primary">
                  {m.nama_mapel ?? m.mapel}
                </span>
                <span className="text-xs text-text-secondary">{m.kelas}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 3 — Pendidikan & Sertifikasi
   ══════════════════════════════════════════════════════════ */
/* ── Modal wrapper ── */
function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className={`bg-surface rounded-2xl shadow-2xl w-full border border-border-light max-h-[90vh] flex flex-col ${wide ? "max-w-2xl" : "max-w-lg"}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light flex-shrink-0">
          <h3 className="font-bold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

/* ── Field helper ── */
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}
const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm";

/* ══════════════════════════════════════════════════════════
   TAB 3 — Pendidikan, Sertifikasi & Inpassing
   ══════════════════════════════════════════════════════════ */
function TabPendidikan({ nuptk, guru }) {
  const downloadFile = useFileDownload(nuptk);
  const queryClient = useQueryClient();

  /* ── state modal ── */
  const [modalPend, setModalPend] = useState(null); // null | 'add' | object (edit)
  const [modalSert, setModalSert] = useState(null);
  const [modalInp, setModalInp] = useState(null);

  /* ── fetch terpisah supaya invalidate per-section ── */
  const { data: pendidikans = [] } = useQuery({
    queryKey: ["guru-pendidikan", nuptk],
    queryFn: () =>
      api
        .get(`/operator/master-data/guru/${nuptk}/pendidikan`)
        .then((r) => r.data.data),
    initialData: guru.pendidikans ?? [],
  });
  const { data: sertifikasis = [] } = useQuery({
    queryKey: ["guru-sertifikasi", nuptk],
    queryFn: () =>
      api
        .get(`/operator/master-data/guru/${nuptk}/sertifikasi`)
        .then((r) => r.data.data),
    initialData: guru.sertifikasis ?? [],
  });
  const { data: inpassings = [] } = useQuery({
    queryKey: ["guru-inpassing", nuptk],
    queryFn: () =>
      api
        .get(`/operator/master-data/guru/${nuptk}/inpassing`)
        .then((r) => r.data.data),
    // tidak pakai initialData — biarkan fetch dari endpoint sendiri
    // supaya data selalu fresh dan tidak terblokir oleh [] dari show()
  });

  /* ── Pendidikan mutations ── */
  const savePendidikan = useMutation({
    mutationFn: ({ data, id }) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v != null && fd.append(k, v));
      return id
        ? api.post(
            `/operator/master-data/guru/${nuptk}/pendidikan/${id}?_method=PUT`,
            fd,
            { headers: { "Content-Type": "multipart/form-data" } },
          )
        : api.post(`/operator/master-data/guru/${nuptk}/pendidikan`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
    },
    onSuccess: () => {
      toast.success("Pendidikan disimpan.");
      queryClient.invalidateQueries(["guru-pendidikan", nuptk]);
      setModalPend(null);
    },
    onError: (e) => {
      const errors = e.response?.data?.errors;
      if (errors) {
        Object.values(errors)
          .flat()
          .forEach((msg) => toast.error(msg));
      } else {
        toast.error(e.response?.data?.message ?? "Gagal menyimpan.");
      }
    },
  });
  const deletePendidikan = useMutation({
    mutationFn: (id) =>
      api.delete(`/operator/master-data/guru/${nuptk}/pendidikan/${id}`),
    onSuccess: () => {
      toast.success("Pendidikan dihapus.");
      queryClient.invalidateQueries(["guru-pendidikan", nuptk]);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message ?? "Gagal menghapus."),
  });

  /* ── Sertifikasi mutations ── */
  const saveSertifikasi = useMutation({
    mutationFn: ({ data, id }) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v != null && fd.append(k, v));
      return id
        ? api.post(
            `/operator/master-data/guru/${nuptk}/sertifikasi/${id}?_method=PUT`,
            fd,
            { headers: { "Content-Type": "multipart/form-data" } },
          )
        : api.post(`/operator/master-data/guru/${nuptk}/sertifikasi`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
    },
    onSuccess: () => {
      toast.success("Sertifikasi disimpan.");
      queryClient.invalidateQueries(["guru-sertifikasi", nuptk]);
      setModalSert(null);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message ?? "Gagal menyimpan."),
  });
  const deleteSertifikasi = useMutation({
    mutationFn: (id) =>
      api.delete(`/operator/master-data/guru/${nuptk}/sertifikasi/${id}`),
    onSuccess: () => {
      toast.success("Sertifikasi dihapus.");
      queryClient.invalidateQueries(["guru-sertifikasi", nuptk]);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message ?? "Gagal menghapus."),
  });

  /* ── Inpassing mutations ── */
  const saveInpassing = useMutation({
    mutationFn: ({ data, id }) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v != null && fd.append(k, v));
      return id
        ? api.post(
            `/operator/master-data/guru/${nuptk}/inpassing/${id}?_method=PUT`,
            fd,
            { headers: { "Content-Type": "multipart/form-data" } },
          )
        : api.post(`/operator/master-data/guru/${nuptk}/inpassing`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
    },
    onSuccess: () => {
      toast.success("Inpassing disimpan.");
      queryClient.invalidateQueries(["guru-inpassing", nuptk]);
      setModalInp(null);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message ?? "Gagal menyimpan."),
  });
  const deleteInpassing = useMutation({
    mutationFn: (id) =>
      api.delete(`/operator/master-data/guru/${nuptk}/inpassing/${id}`),
    onSuccess: () => {
      toast.success("Inpassing dihapus.");
      queryClient.invalidateQueries(["guru-inpassing", nuptk]);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message ?? "Gagal menghapus."),
  });

  /* ── form submit handlers ── */
  const handlePendidikanSubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    savePendidikan.mutate({
      id: modalPend?.id,
      data: {
        jenjang: f.jenjang.value,
        nama_sekolah: f.nama_sekolah.value,
        jurusan: f.jurusan.value,
        prodi: f.prodi.value,
        tahun_masuk: f.tahun_masuk.value,
        tahun_lulus: f.tahun_lulus.value,
        no_ijazah: f.no_ijazah.value,
        file_ijazah: f.file_ijazah.files[0] ?? null,
      },
    });
  };
  const handleSertifikasiSubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    saveSertifikasi.mutate({
      id: modalSert?.id,
      data: {
        jenis_sertifikasi: f.jenis_sertifikasi.value,
        no_sertifikat: f.no_sertifikat.value,
        nrg: f.nrg.value,
        tahun_sertifikasi: f.tahun_sertifikasi.value,
        lptk: f.lptk.value,
        bidang_studi: f.bidang_studi.value,
        tanggal_terbit: f.tanggal_terbit.value,
        expired_at: f.expired_at.value,
        file_sertifikat: f.file_sertifikat.files[0] ?? null,
      },
    });
  };
  const handleInpassingSubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    saveInpassing.mutate({
      id: modalInp?.id,
      data: {
        no_sk: f.no_sk.value,
        tanggal_sk: f.tanggal_sk.value,
        tmt_inpassing: f.tmt_inpassing.value,
        golongan_sesudah: f.golongan_sesudah.value,
        jabatan_fungsional: f.jabatan_fungsional.value,
        angka_kredit: f.angka_kredit.value,
        file_sk: f.file_sk.files[0] ?? null,
      },
    });
  };

  const JENJANG_OPTS = [
    "SD",
    "SMP",
    "SMA/SMK",
    "D1",
    "D2",
    "D3",
    "D4",
    "S1",
    "S2",
    "S3",
  ];
  const GOLONGAN_OPTS = [
    "III/a",
    "III/b",
    "III/c",
    "III/d",
    "IV/a",
    "IV/b",
    "IV/c",
    "IV/d",
    "IV/e",
  ];

  return (
    <div className="space-y-6">
      {/* ── SECTION 1: PENDIDIKAN ── */}
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle
            icon="school"
            label="Riwayat Pendidikan"
            desc={`${pendidikans.length} data tercatat`}
          />
          <button
            onClick={() => setModalPend("add")}
            className="px-3 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>{" "}
            Tambah
          </button>
        </div>
        {pendidikans.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            Belum ada riwayat pendidikan.
          </p>
        ) : (
          <div className="space-y-3">
            {pendidikans.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-surface-container-low rounded-xl border border-border-light"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary">
                      {p.jenjang} — {p.nama_sekolah}
                    </p>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {[p.prodi, p.jurusan].filter(Boolean).join(" / ")}
                      {(p.tahun_masuk || p.tahun_lulus) &&
                        ` · ${p.tahun_masuk ?? "?"} – ${p.tahun_lulus ?? "?"}`}
                    </p>
                    {p.no_ijazah && (
                      <p className="text-xs text-text-secondary mt-0.5 font-mono">
                        No. Ijazah: {p.no_ijazah}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {p.file_ijazah && (
                      <button
                        onClick={() =>
                          downloadFile(
                            p.file_ijazah,
                            `Ijazah_${p.nama_sekolah}`,
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="Download ijazah"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          download
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => setModalPend(p)}
                      className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        confirm("Hapus data pendidikan ini?") &&
                        deletePendidikan.mutate(p.id)
                      }
                      className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 2: SERTIFIKASI ── */}
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle
            icon="workspace_premium"
            label="Sertifikasi"
            desc={`${sertifikasis.length} data tercatat`}
          />
          <button
            onClick={() => setModalSert("add")}
            className="px-3 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>{" "}
            Tambah
          </button>
        </div>
        {sertifikasis.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            Belum ada data sertifikasi.
          </p>
        ) : (
          <div className="space-y-3">
            {sertifikasis.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-surface-container-low rounded-xl border border-border-light"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary">
                      {s.jenis_sertifikasi}
                    </p>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {s.bidang_studi && `${s.bidang_studi} · `}
                      {s.lptk}
                      {s.tahun_sertifikasi && ` · ${s.tahun_sertifikasi}`}
                    </p>
                    {s.nrg && (
                      <p className="text-xs text-text-secondary mt-0.5 font-mono">
                        NRG: {s.nrg}
                      </p>
                    )}
                    {s.no_sertifikat && (
                      <p className="text-xs text-text-secondary font-mono">
                        No: {s.no_sertifikat}
                      </p>
                    )}
                    {s.expired_at && (
                      <p
                        className={`text-xs mt-0.5 font-medium ${new Date(s.expired_at) < new Date() ? "text-error" : "text-success"}`}
                      >
                        Exp: {fmtDate(s.expired_at)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {s.file_sertifikat && (
                      <button
                        onClick={() =>
                          downloadFile(
                            s.file_sertifikat,
                            `Sertifikasi_${s.jenis_sertifikasi}`,
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="Download sertifikat"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          download
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => setModalSert(s)}
                      className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        confirm("Hapus sertifikasi ini?") &&
                        deleteSertifikasi.mutate(s.id)
                      }
                      className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 3: INPASSING ── */}
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle
            icon="military_tech"
            label="Inpassing"
            desc="SK penetapan inpassing guru non-PNS"
          />
          <button
            onClick={() => setModalInp("add")}
            className="px-3 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>{" "}
            Tambah
          </button>
        </div>
        {inpassings.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            Belum ada data inpassing.
          </p>
        ) : (
          <div className="space-y-3">
            {inpassings.map((inp) => (
              <div
                key={inp.id}
                className="p-4 bg-surface-container-low rounded-xl border border-border-light"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary">
                      SK {inp.no_sk}
                    </p>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {inp.jabatan_fungsional && `${inp.jabatan_fungsional} · `}
                      Gol. {inp.golongan_sesudah ?? "-"}
                      {inp.angka_kredit && ` · AK: ${inp.angka_kredit}`}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Tanggal SK: {fmtDate(inp.tanggal_sk)} · TMT:{" "}
                      {fmtDate(inp.tmt_inpassing)}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {inp.file_sk && (
                      <button
                        onClick={() =>
                          downloadFile(inp.file_sk, `SK_Inpassing_${inp.no_sk}`)
                        }
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="Download SK Inpassing"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          download
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => setModalInp(inp)}
                      className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        confirm("Hapus data inpassing ini?") &&
                        deleteInpassing.mutate(inp.id)
                      }
                      className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ MODAL: PENDIDIKAN ══ */}
      {modalPend && (
        <Modal
          title={
            modalPend === "add"
              ? "Tambah Riwayat Pendidikan"
              : "Edit Riwayat Pendidikan"
          }
          onClose={() => setModalPend(null)}
        >
          <form onSubmit={handlePendidikanSubmit} className="space-y-4">
            <Field label="Jenjang" required>
              <select
                name="jenjang"
                defaultValue={modalPend?.jenjang ?? ""}
                required
                className={inputCls}
              >
                <option value="" disabled>
                  Pilih jenjang
                </option>
                {JENJANG_OPTS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nama Sekolah / Institusi" required>
              <input
                name="nama_sekolah"
                defaultValue={modalPend?.nama_sekolah ?? ""}
                required
                className={inputCls}
                placeholder="Contoh: Universitas Negeri Malang"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Jurusan">
                <input
                  name="jurusan"
                  defaultValue={modalPend?.jurusan ?? ""}
                  className={inputCls}
                  placeholder="Contoh: Pendidikan IPA"
                />
              </Field>
              <Field label="Program Studi">
                <input
                  name="prodi"
                  defaultValue={modalPend?.prodi ?? ""}
                  className={inputCls}
                  placeholder="Contoh: S1 Pendidikan IPA"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tahun Masuk">
                <input
                  name="tahun_masuk"
                  type="number"
                  defaultValue={modalPend?.tahun_masuk ?? ""}
                  min="1950"
                  max={new Date().getFullYear()}
                  className={inputCls}
                  placeholder="Contoh: 2005"
                />
              </Field>
              <Field label="Tahun Lulus">
                <input
                  name="tahun_lulus"
                  type="number"
                  defaultValue={modalPend?.tahun_lulus ?? ""}
                  min="1950"
                  max={new Date().getFullYear() + 1}
                  className={inputCls}
                  placeholder="Contoh: 2009"
                />
              </Field>
            </div>
            <Field label="No. Ijazah">
              <input
                name="no_ijazah"
                defaultValue={modalPend?.no_ijazah ?? ""}
                className={inputCls}
                placeholder="Nomor ijazah"
              />
            </Field>
            <Field label="Upload Ijazah (PDF/JPG, maks 5MB)">
              <input
                name="file_ijazah"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {modalPend?.file_ijazah && (
                <p className="text-xs text-text-secondary mt-1">
                  File sebelumnya:{" "}
                  <a
                    href={`${BASE_URL}/storage/${modalPend.file_ijazah}`}
                    target="_blank"
                    className="text-primary underline"
                  >
                    lihat
                  </a>
                </p>
              )}
            </Field>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalPend(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savePendidikan.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {savePendidikan.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ══ MODAL: SERTIFIKASI ══ */}
      {modalSert && (
        <Modal
          title={
            modalSert === "add" ? "Tambah Sertifikasi" : "Edit Sertifikasi"
          }
          onClose={() => setModalSert(null)}
        >
          <form onSubmit={handleSertifikasiSubmit} className="space-y-4">
            <Field label="Jenis Sertifikasi" required>
              <input
                name="jenis_sertifikasi"
                defaultValue={modalSert?.jenis_sertifikasi ?? ""}
                required
                className={inputCls}
                placeholder="Contoh: Sertifikasi Guru (PPG)"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="No. Sertifikat">
                <input
                  name="no_sertifikat"
                  defaultValue={modalSert?.no_sertifikat ?? ""}
                  className={inputCls}
                />
              </Field>
              <Field label="NRG">
                <input
                  name="nrg"
                  defaultValue={modalSert?.nrg ?? ""}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tahun Sertifikasi">
                <input
                  name="tahun_sertifikasi"
                  type="number"
                  defaultValue={modalSert?.tahun_sertifikasi ?? ""}
                  min="1990"
                  max={new Date().getFullYear()}
                  className={inputCls}
                />
              </Field>
              <Field label="Bidang Studi">
                <input
                  name="bidang_studi"
                  defaultValue={modalSert?.bidang_studi ?? ""}
                  className={inputCls}
                  placeholder="Contoh: Matematika"
                />
              </Field>
            </div>
            <Field label="LPTK Penyelenggara">
              <input
                name="lptk"
                defaultValue={modalSert?.lptk ?? ""}
                className={inputCls}
                placeholder="Contoh: Universitas Negeri Malang"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tanggal Terbit">
                <input
                  name="tanggal_terbit"
                  type="date"
                  defaultValue={modalSert?.tanggal_terbit?.slice(0, 10) ?? ""}
                  className={inputCls}
                />
              </Field>
              <Field label="Berlaku Hingga">
                <input
                  name="expired_at"
                  type="date"
                  defaultValue={modalSert?.expired_at?.slice(0, 10) ?? ""}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Upload Sertifikat (PDF/JPG, maks 5MB)">
              <input
                name="file_sertifikat"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {modalSert?.file_sertifikat && (
                <p className="text-xs text-text-secondary mt-1">
                  File sebelumnya:{" "}
                  <a
                    href={`${BASE_URL}/storage/${modalSert.file_sertifikat}`}
                    target="_blank"
                    className="text-primary underline"
                  >
                    lihat
                  </a>
                </p>
              )}
            </Field>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalSert(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saveSertifikasi.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {saveSertifikasi.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ══ MODAL: INPASSING ══ */}
      {modalInp && (
        <Modal
          title={
            modalInp === "add" ? "Tambah Data Inpassing" : "Edit Data Inpassing"
          }
          onClose={() => setModalInp(null)}
        >
          <form onSubmit={handleInpassingSubmit} className="space-y-4">
            <Field label="Nomor SK Inpassing" required>
              <input
                name="no_sk"
                defaultValue={modalInp?.no_sk ?? ""}
                required
                className={inputCls}
                placeholder="Contoh: 0001/SK/INP/2018"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tanggal SK" required>
                <input
                  name="tanggal_sk"
                  type="date"
                  defaultValue={modalInp?.tanggal_sk?.slice(0, 10) ?? ""}
                  required
                  className={inputCls}
                />
              </Field>
              <Field label="TMT Inpassing" required>
                <input
                  name="tmt_inpassing"
                  type="date"
                  defaultValue={modalInp?.tmt_inpassing?.slice(0, 10) ?? ""}
                  required
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Golongan Sesudah">
                <select
                  name="golongan_sesudah"
                  defaultValue={modalInp?.golongan_sesudah ?? ""}
                  className={inputCls}
                >
                  <option value="">Pilih golongan</option>
                  {GOLONGAN_OPTS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Angka Kredit">
                <input
                  name="angka_kredit"
                  type="number"
                  step="0.01"
                  defaultValue={modalInp?.angka_kredit ?? ""}
                  className={inputCls}
                  placeholder="Contoh: 150.00"
                />
              </Field>
            </div>
            <Field label="Jabatan Fungsional">
              <input
                name="jabatan_fungsional"
                defaultValue={modalInp?.jabatan_fungsional ?? ""}
                className={inputCls}
                placeholder="Contoh: Guru Pertama"
              />
            </Field>
            <Field label="Upload SK Inpassing (PDF/JPG, maks 5MB)">
              <input
                name="file_sk"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {modalInp?.file_sk && (
                <p className="text-xs text-text-secondary mt-1">
                  File sebelumnya:{" "}
                  <a
                    href={`${BASE_URL}/storage/${modalInp.file_sk}`}
                    target="_blank"
                    className="text-primary underline"
                  >
                    lihat
                  </a>
                </p>
              )}
            </Field>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalInp(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saveInpassing.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {saveInpassing.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 4 — Keluarga & Kontak
   ══════════════════════════════════════════════════════════ */
function TabKeluarga({ guru }) {
  const keluarga = guru.keluarga ?? {};
  const anaks = guru.anaks ?? [];
  const kontaks = guru.kontak_darurat ?? [];
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="family_restroom" label="Data Keluarga" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
          <InfoRow
            label="Status Perkawinan"
            value={keluarga.status_perkawinan}
          />
          <InfoRow label="Nama Pasangan" value={keluarga.nama_pasangan} />
          <InfoRow label="NIK Pasangan" value={keluarga.nik_pasangan} mono />
          <InfoRow
            label="Pekerjaan Pasangan"
            value={keluarga.pekerjaan_pasangan}
          />
          <InfoRow label="Jumlah Anak" value={keluarga.jumlah_anak} />
        </div>
        {anaks.length > 0 && (
          <>
            <SubLabel>Data Anak</SubLabel>
            <div className="space-y-3">
              {anaks.map((a, i) => (
                <div
                  key={i}
                  className="p-4 bg-surface-container-low rounded-xl border border-border-light"
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{a.nama}</span>
                    <span className="text-xs text-text-secondary">
                      {a.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </span>
                  </div>
                  {a.tanggal_lahir && (
                    <p className="text-xs text-text-secondary mt-1">
                      {fmtDate(a.tanggal_lahir)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="contact_phone" label="Kontak Darurat" />
        {kontaks.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            Belum ada kontak darurat.
          </p>
        ) : (
          <div className="space-y-3">
            {kontaks.map((k, i) => (
              <div
                key={i}
                className="p-4 bg-surface-container-low rounded-xl border border-border-light"
              >
                <div className="flex justify-between">
                  <span className="font-medium text-sm">{k.nama}</span>
                  <span className="text-xs bg-secondary-container text-on-secondary-fixed-variant px-2 py-0.5 rounded-full font-medium">
                    {k.hubungan}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-1">{k.no_hp}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 5 — Dokumen
   ══════════════════════════════════════════════════════════ */
function TabDokumen({ nuptk }) {
  const queryClient = useQueryClient();
  const [modalUpload, setModalUpload] = useState(false);
  const [modalEdit, setModalEdit] = useState(null); // null | object dokumen
  const fileRef = useRef();

  const KATEGORI_OPTS = [
    { value: "identitas", label: "Identitas (KTP, KK, Paspor)" },
    { value: "kepegawaian", label: "Kepegawaian (SK, Kontrak)" },
    { value: "pendidikan", label: "Pendidikan (Ijazah, Transkrip)" },
    { value: "sertifikasi", label: "Sertifikasi & Pelatihan" },
    { value: "penghargaan", label: "Penghargaan" },
    { value: "lainnya", label: "Lainnya" },
  ];

  const { data: dokumens = [], isLoading } = useQuery({
    queryKey: ["guru-dokumen", nuptk],
    queryFn: () =>
      api
        .get(`/operator/master-data/guru/${nuptk}/dokumen`)
        .then((r) => r.data.data),
  });

  const uploadDokumen = useMutation({
    mutationFn: (fd) =>
      api.post(`/operator/master-data/guru/${nuptk}/dokumen`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      toast.success("Dokumen berhasil diupload.");
      queryClient.invalidateQueries(["guru-dokumen", nuptk]);
      setModalUpload(false);
    },
    onError: (e) => {
      const errors = e.response?.data?.errors;
      if (errors) {
        Object.values(errors)
          .flat()
          .forEach((msg) => toast.error(msg));
      } else {
        toast.error(e.response?.data?.message ?? "Gagal mengupload dokumen.");
      }
    },
  });

  const deleteDokumen = useMutation({
    mutationFn: (id) =>
      api.delete(`/operator/master-data/guru/${nuptk}/dokumen/${id}`),
    onSuccess: () => {
      toast.success("Dokumen dihapus.");
      queryClient.invalidateQueries(["guru-dokumen", nuptk]);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message ?? "Gagal menghapus."),
  });

  const editDokumen = useMutation({
    mutationFn: ({ id, fd }) =>
      api.post(
        `/operator/master-data/guru/${nuptk}/dokumen/${id}?_method=PUT`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      ),
    onSuccess: () => {
      toast.success("Dokumen berhasil diperbarui.");
      queryClient.invalidateQueries(["guru-dokumen", nuptk]);
      setModalEdit(null);
    },
    onError: (e) => {
      const errors = e.response?.data?.errors;
      if (errors) {
        Object.values(errors)
          .flat()
          .forEach((msg) => toast.error(msg));
      } else {
        toast.error(e.response?.data?.message ?? "Gagal memperbarui dokumen.");
      }
    },
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    const fd = new FormData();
    fd.append("kategori", f.kategori.value);
    fd.append("nama_dokumen", f.nama_dokumen.value);
    fd.append("nomor_dokumen", f.nomor_dokumen.value);
    fd.append("tanggal_dokumen", f.tanggal_dokumen.value);
    fd.append("penerbit", f.penerbit.value);
    if (f.file.files[0]) fd.append("file", f.file.files[0]);
    uploadDokumen.mutate(fd);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    const fd = new FormData();
    fd.append("kategori", f.kategori.value);
    fd.append("nama_dokumen", f.nama_dokumen.value);
    fd.append("nomor_dokumen", f.nomor_dokumen.value);
    fd.append("tanggal_dokumen", f.tanggal_dokumen.value);
    fd.append("penerbit", f.penerbit.value);
    if (f.file.files[0]) fd.append("file", f.file.files[0]);
    editDokumen.mutate({ id: modalEdit.id, fd });
  };

  const fmtSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const iconByKategori = (kategori) => {
    const icons = {
      identitas: "badge",
      kepegawaian: "gavel",
      pendidikan: "school",
      sertifikasi: "workspace_premium",
      penghargaan: "emoji_events",
      lainnya: "description",
    };
    return icons[kategori] ?? "description";
  };

  const handleDownload = async (dokumenId, namaFile) => {
    try {
      const res = await api.get(
        `/operator/master-data/guru/${nuptk}/dokumen/${dokumenId}/download`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = namaFile ?? "dokumen";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mendownload file.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle
            icon="folder_open"
            label="Dokumen Guru"
            desc={`${dokumens.length} dokumen tersimpan`}
          />
          <button
            onClick={() => setModalUpload(true)}
            className="px-3 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">
              upload_file
            </span>
            Upload Dokumen
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <span className="material-symbols-outlined text-[36px] text-primary animate-spin">
              progress_activity
            </span>
          </div>
        ) : dokumens.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-text-secondary/30 block mb-3">
              folder_open
            </span>
            <p className="text-sm text-text-secondary font-medium">
              Belum ada dokumen yang diunggah.
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Klik <strong>Upload Dokumen</strong> untuk menambahkan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dokumens.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-border-light group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    {iconByKategori(d.kategori)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {d.nama_dokumen ?? d.kategori}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {d.kategori && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary font-medium">
                        {d.kategori}
                      </span>
                    )}
                    {d.file_size && (
                      <span className="text-xs text-text-secondary">
                        {fmtSize(d.file_size)}
                      </span>
                    )}
                    <span className="text-xs text-text-secondary">
                      {fmtDate(d.created_at)}
                    </span>
                  </div>
                  {d.nomor_dokumen && (
                    <p className="text-xs text-text-secondary font-mono mt-0.5">
                      No: {d.nomor_dokumen}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => setModalEdit(d)}
                    className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors"
                    title="Edit dokumen"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      edit
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(d.id, d.nama_dokumen ?? d.kategori)
                    }
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                    title="Download"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      download
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      confirm("Hapus dokumen ini?") &&
                      deleteDokumen.mutate(d.id)
                    }
                    className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Upload */}
      {modalUpload && (
        <Modal title="Upload Dokumen" onClose={() => setModalUpload(false)}>
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <Field label="Kategori Dokumen" required>
              <select name="kategori" required className={inputCls}>
                <option value="">-- Pilih kategori --</option>
                {KATEGORI_OPTS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nama Dokumen">
              <input
                name="nama_dokumen"
                className={inputCls}
                placeholder="Kosongkan untuk pakai nama kategori"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nomor Dokumen">
                <input
                  name="nomor_dokumen"
                  className={inputCls}
                  placeholder="No. seri / nomor dokumen"
                />
              </Field>
              <Field label="Tanggal Dokumen">
                <input
                  name="tanggal_dokumen"
                  type="date"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Penerbit / Instansi">
              <input
                name="penerbit"
                className={inputCls}
                placeholder="Contoh: Dukcapil, Kemenag, dll."
              />
            </Field>
            <Field label="File (PDF/JPG/PNG, maks 10MB)" required>
              <input
                ref={fileRef}
                name="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                className="w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </Field>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalUpload(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={uploadDokumen.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {uploadDokumen.isPending ? "Mengupload..." : "Upload"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalEdit && (
        <Modal title="Edit Dokumen" onClose={() => setModalEdit(null)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Field label="Kategori Dokumen" required>
              <select
                name="kategori"
                required
                defaultValue={modalEdit.kategori}
                className={inputCls}
              >
                <option value="">-- Pilih kategori --</option>
                {KATEGORI_OPTS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nama Dokumen">
              <input
                name="nama_dokumen"
                defaultValue={modalEdit.nama_dokumen ?? ""}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nomor Dokumen">
                <input
                  name="nomor_dokumen"
                  defaultValue={modalEdit.nomor_dokumen ?? ""}
                  className={inputCls}
                />
              </Field>
              <Field label="Tanggal Dokumen">
                <input
                  name="tanggal_dokumen"
                  type="date"
                  defaultValue={modalEdit.tanggal_dokumen?.slice(0, 10) ?? ""}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Penerbit / Instansi">
              <input
                name="penerbit"
                defaultValue={modalEdit.penerbit ?? ""}
                className={inputCls}
              />
            </Field>
            <Field label="Ganti File (opsional)">
              <input
                name="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {modalEdit.file_path && (
                <p className="text-xs text-text-secondary mt-1">
                  File saat ini:{" "}
                  <a
                    href={`${BASE_URL}/storage/${modalEdit.file_path}`}
                    target="_blank"
                    className="text-primary underline"
                  >
                    lihat
                  </a>
                </p>
              )}
            </Field>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalEdit(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={editDokumen.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {editDokumen.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL MUTASI — komponen terpisah agar hooks legal
   ══════════════════════════════════════════════════════════ */
function ModalMutasi({
  modalMutasi,
  onClose,
  onSubmit,
  isPending,
  jabatanAktif,
}) {
  const isAdd = modalMutasi === "add";
  const [jenisDipilih, setJenisDipilih] = useState(
    isAdd ? "" : (modalMutasi?.jenis_mutasi ?? ""),
  );

  const show = {
    sekolah_asal: ["Masuk", "Penugasan Sementara"].includes(jenisDipilih),
    npsn_asal: ["Masuk", "Penugasan Sementara"].includes(jenisDipilih),
    sekolah_tujuan: ["Keluar", "Penugasan Sementara"].includes(jenisDipilih),
    npsn_tujuan: ["Keluar", "Penugasan Sementara"].includes(jenisDipilih),
    jabatan_sebelum: [
      "Masuk",
      "Keluar",
      "Internal",
      "Penugasan Sementara",
      "Kembali Bertugas",
    ].includes(jenisDipilih),
    jabatan_sesudah: ["Internal", "Kembali Bertugas"].includes(jenisDipilih),
    tanggal_berakhir: ["Penugasan Sementara"].includes(jenisDipilih),
    tmt_mutasi: [
      "Masuk",
      "Internal",
      "Penugasan Sementara",
      "Kembali Bertugas",
    ].includes(jenisDipilih),
    alasan_mutasi: ["Keluar", "Internal", "Penugasan Sementara"].includes(
      jenisDipilih,
    ),
  };

  const labelTanggal =
    {
      Masuk: "Tanggal Bergabung",
      Keluar: "Tanggal Keluar",
      Internal: "Tanggal Mutasi",
      "Penugasan Sementara": "Tanggal Mulai Penugasan",
      "Kembali Bertugas": "Tanggal Kembali Bertugas",
    }[jenisDipilih] ?? "Tanggal Mutasi";

  const descJenis = {
    Masuk: "Guru pindah dari sekolah lain ke sekolah ini.",
    Keluar: "Guru pindah ke sekolah lain.",
    Internal: "Perubahan jabatan atau unit kerja di sekolah yang sama.",
    "Penugasan Sementara":
      "Guru diperbantukan ke sekolah lain untuk sementara.",
    "Kembali Bertugas": "Guru kembali setelah diperbantukan atau cuti panjang.",
  }[jenisDipilih];

  const cls =
    "w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm";

  const handleSubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    const val = (name) => f.elements[name]?.value ?? "";
    const file = (name) => f.elements[name]?.files?.[0] ?? null;
    onSubmit({
      jenis_mutasi: val("jenis_mutasi"),
      sekolah_asal: val("sekolah_asal"),
      npsn_asal: val("npsn_asal"),
      sekolah_tujuan: val("sekolah_tujuan"),
      npsn_tujuan: val("npsn_tujuan"),
      jabatan_sebelum: val("jabatan_sebelum"),
      jabatan_sesudah: val("jabatan_sesudah"),
      tanggal_mutasi: val("tanggal_mutasi"),
      tmt_mutasi: val("tmt_mutasi"),
      tanggal_berakhir: val("tanggal_berakhir"),
      no_sk: val("no_sk"),
      tanggal_sk: val("tanggal_sk"),
      instansi_penerbit_sk: val("instansi_penerbit_sk"),
      status_kepegawaian: val("status_kepegawaian"),
      alasan_mutasi: val("alasan_mutasi"),
      keterangan: val("keterangan"),
      file_sk: file("file_sk"),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl border border-border-light max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light flex-shrink-0">
          <div>
            <h3 className="font-bold text-text-primary text-base">
              {isAdd ? "Tambah" : "Edit"} Riwayat Mutasi
            </h3>
            {descJenis && (
              <p className="text-xs text-text-secondary mt-0.5">{descJenis}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-4 overflow-y-auto flex-1"
        >
          {/* Jenis Mutasi */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Jenis Mutasi <span className="text-error">*</span>
            </label>
            <select
              name="jenis_mutasi"
              value={jenisDipilih}
              onChange={(e) => setJenisDipilih(e.target.value)}
              required
              className={cls}
            >
              <option value="">-- Pilih Jenis Mutasi --</option>
              <option value="Masuk">
                🟢 Mutasi Masuk — guru dari sekolah lain
              </option>
              <option value="Keluar">
                🔴 Mutasi Keluar — guru pindah ke sekolah lain
              </option>
              <option value="Internal">
                🟡 Mutasi Internal — perubahan jabatan/unit di sekolah ini
              </option>
              <option value="Penugasan Sementara">
                🔵 Penugasan Sementara — diperbantukan ke sekolah lain
              </option>
              <option value="Kembali Bertugas">
                ⚪ Kembali Bertugas — kembali dari penugasan/cuti
              </option>
            </select>
          </div>

          {/* Placeholder belum pilih */}
          {!jenisDipilih && (
            <div className="flex flex-col items-center justify-center py-10 text-text-secondary/60">
              <span className="material-symbols-outlined text-[48px] mb-2">
                swap_horiz
              </span>
              <p className="text-sm">
                Pilih jenis mutasi untuk menampilkan form
              </p>
            </div>
          )}

          {jenisDipilih && (
            <>
              {/* Sekolah Asal */}
              {show.sekolah_asal && (
                <div className={show.npsn_asal ? "grid grid-cols-3 gap-3" : ""}>
                  <div className={show.npsn_asal ? "col-span-2" : ""}>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Sekolah Asal <span className="text-error">*</span>
                    </label>
                    <input
                      name="sekolah_asal"
                      type="text"
                      required
                      defaultValue={
                        isAdd ? "" : (modalMutasi?.sekolah_asal ?? "")
                      }
                      placeholder={
                        jenisDipilih === "Masuk"
                          ? "Nama sekolah asal guru"
                          : jenisDipilih === "Penugasan Sementara"
                            ? "Sekolah induk guru ini"
                            : "Sekolah sebelum mutasi"
                      }
                      className={cls}
                    />
                  </div>
                  {show.npsn_asal && (
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        NPSN Asal
                      </label>
                      <input
                        name="npsn_asal"
                        type="text"
                        maxLength={10}
                        defaultValue={
                          isAdd ? "" : (modalMutasi?.npsn_asal ?? "")
                        }
                        placeholder="10 digit"
                        className={`${cls} font-mono`}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Sekolah Tujuan */}
              {show.sekolah_tujuan && (
                <div
                  className={show.npsn_tujuan ? "grid grid-cols-3 gap-3" : ""}
                >
                  <div className={show.npsn_tujuan ? "col-span-2" : ""}>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Sekolah Tujuan <span className="text-error">*</span>
                    </label>
                    <input
                      name="sekolah_tujuan"
                      type="text"
                      required
                      defaultValue={
                        isAdd ? "" : (modalMutasi?.sekolah_tujuan ?? "")
                      }
                      placeholder={
                        jenisDipilih === "Keluar"
                          ? "Sekolah tujuan guru"
                          : jenisDipilih === "Internal"
                            ? "Unit/jabatan tujuan di sekolah ini"
                            : "Sekolah tempat penugasan"
                      }
                      className={cls}
                    />
                  </div>
                  {show.npsn_tujuan && (
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        NPSN Tujuan
                      </label>
                      <input
                        name="npsn_tujuan"
                        type="text"
                        maxLength={10}
                        defaultValue={
                          isAdd ? "" : (modalMutasi?.npsn_tujuan ?? "")
                        }
                        placeholder="10 digit"
                        className={`${cls} font-mono`}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Jabatan Sebelum & Sesudah */}
              {show.jabatan_sebelum && (
                <div
                  className={
                    show.jabatan_sesudah ? "grid grid-cols-2 gap-3" : ""
                  }
                >
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Jabatan Sebelum
                    </label>
                    <input
                      name="jabatan_sebelum"
                      type="text"
                      defaultValue={
                        isAdd
                          ? (jabatanAktif?.jabatan ?? "")
                          : (modalMutasi?.jabatan_sebelum ?? "")
                      }
                      placeholder="Guru Kelas, Guru PAI, Wali Kelas, dll"
                      className={cls}
                    />
                  </div>
                  {show.jabatan_sesudah && (
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        Jabatan Sesudah
                      </label>
                      <input
                        name="jabatan_sesudah"
                        type="text"
                        defaultValue={
                          isAdd ? "" : (modalMutasi?.jabatan_sesudah ?? "")
                        }
                        placeholder="Jabatan setelah mutasi"
                        className={cls}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tanggal Mutasi & TMT */}
              <div className={show.tmt_mutasi ? "grid grid-cols-2 gap-3" : ""}>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    {labelTanggal} <span className="text-error">*</span>
                  </label>
                  <input
                    name="tanggal_mutasi"
                    type="date"
                    required
                    defaultValue={
                      isAdd
                        ? ""
                        : (modalMutasi?.tanggal_mutasi
                            ?.toString()
                            .slice(0, 10) ?? "")
                    }
                    className={cls}
                  />
                </div>
                {show.tmt_mutasi && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      TMT Mutasi
                      <span className="ml-1 text-xs text-text-secondary font-normal">
                        (Tgl Mulai Berlaku)
                      </span>
                    </label>
                    <input
                      name="tmt_mutasi"
                      type="date"
                      defaultValue={
                        isAdd
                          ? ""
                          : (modalMutasi?.tmt_mutasi?.toString().slice(0, 10) ??
                            "")
                      }
                      className={cls}
                    />
                  </div>
                )}
              </div>

              {/* Tanggal Berakhir — khusus Penugasan Sementara */}
              {show.tanggal_berakhir && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Tanggal Berakhir Penugasan
                  </label>
                  <input
                    name="tanggal_berakhir"
                    type="date"
                    defaultValue={
                      isAdd
                        ? ""
                        : (modalMutasi?.tanggal_berakhir
                            ?.toString()
                            .slice(0, 10) ?? "")
                    }
                    className={cls}
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Kosongkan jika belum ditentukan
                  </p>
                </div>
              )}

              {/* Nomor SK & Tanggal SK */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Nomor SK
                  </label>
                  <input
                    name="no_sk"
                    type="text"
                    defaultValue={isAdd ? "" : (modalMutasi?.no_sk ?? "")}
                    placeholder="Nomor surat keputusan"
                    className={cls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Tanggal SK
                  </label>
                  <input
                    name="tanggal_sk"
                    type="date"
                    defaultValue={
                      isAdd
                        ? ""
                        : (modalMutasi?.tanggal_sk?.toString().slice(0, 10) ??
                          "")
                    }
                    className={cls}
                  />
                </div>
              </div>

              {/* Instansi Penerbit SK & Status Kepegawaian */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Instansi Penerbit SK
                  </label>
                  <input
                    name="instansi_penerbit_sk"
                    type="text"
                    defaultValue={
                      isAdd ? "" : (modalMutasi?.instansi_penerbit_sk ?? "")
                    }
                    placeholder="Kemenag, Yayasan, dll"
                    className={cls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Status Kepegawaian
                  </label>
                  <select
                    name="status_kepegawaian"
                    defaultValue={
                      isAdd ? "" : (modalMutasi?.status_kepegawaian ?? "")
                    }
                    className={cls}
                  >
                    <option value="">-- Pilih --</option>
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="GTY">GTY</option>
                    <option value="GTT">GTT</option>
                  </select>
                </div>
              </div>

              {/* Alasan Mutasi */}
              {show.alasan_mutasi && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Alasan Mutasi
                  </label>
                  <input
                    name="alasan_mutasi"
                    type="text"
                    defaultValue={
                      isAdd ? "" : (modalMutasi?.alasan_mutasi ?? "")
                    }
                    placeholder="Permintaan sendiri, kebutuhan organisasi, promosi, dll"
                    className={cls}
                  />
                </div>
              )}

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Keterangan
                </label>
                <textarea
                  name="keterangan"
                  rows={2}
                  defaultValue={isAdd ? "" : (modalMutasi?.keterangan ?? "")}
                  placeholder="Catatan tambahan (opsional)"
                  className={`${cls} resize-none`}
                />
              </div>

              {/* Dokumen SK */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Dokumen SK Mutasi
                  {!isAdd && modalMutasi?.file_sk && (
                    <span className="ml-2 text-xs text-success font-normal">
                      (file sudah ada — kosongkan jika tidak ingin mengganti)
                    </span>
                  )}
                </label>
                <input
                  name="file_sk"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                <p className="text-xs text-text-secondary mt-1">
                  PDF / JPG / PNG, maks 5 MB
                </p>
              </div>

              {/* Footer */}
              <div className="flex gap-2 pt-2 border-t border-border-light">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 6 — Riwayat
   ══════════════════════════════════════════════════════════ */
function TabRiwayat({ nuptk, guru }) {
  const downloadFile = useFileDownload(nuptk);
  const queryClient = useQueryClient();
  const [modalDiklat, setModalDiklat] = useState(null); // null | 'add' | object
  const [modalJabatan, setModalJabatan] = useState(null); // null | 'add' | object

  const { data: diklats = [] } = useQuery({
    queryKey: ["guru-diklat", nuptk],
    queryFn: () =>
      api
        .get(`/operator/master-data/guru/${nuptk}/diklat`)
        .then((r) => r.data.data),
    initialData: guru.diklats ?? [],
  });

  const saveDiklat = useMutation({
    mutationFn: ({ data, id }) => {
      const fd = new FormData();
      Object.entries(data).forEach(
        ([k, v]) => v != null && v !== "" && fd.append(k, v),
      );
      return id
        ? api.post(
            `/operator/master-data/guru/${nuptk}/diklat/${id}?_method=PUT`,
            fd,
            { headers: { "Content-Type": "multipart/form-data" } },
          )
        : api.post(`/operator/master-data/guru/${nuptk}/diklat`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
    },
    onSuccess: () => {
      toast.success("Diklat disimpan.");
      queryClient.invalidateQueries(["guru-diklat", nuptk]);
      setModalDiklat(null);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message ?? "Gagal menyimpan."),
  });

  const deleteDiklat = useMutation({
    mutationFn: (id) =>
      api.delete(`/operator/master-data/guru/${nuptk}/diklat/${id}`),
    onSuccess: () => {
      toast.success("Diklat dihapus.");
      queryClient.invalidateQueries(["guru-diklat", nuptk]);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message ?? "Gagal menghapus."),
  });

  const handleDiklatSubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    saveDiklat.mutate({
      id: modalDiklat?.id,
      data: {
        nama_diklat: f.nama_diklat.value,
        penyelenggara: f.penyelenggara.value,
        jenis: f.jenis.value,
        tingkat: f.tingkat.value,
        tanggal_mulai: f.tanggal_mulai.value,
        tanggal_selesai: f.tanggal_selesai.value,
        jumlah_jam: f.jumlah_jam.value,
        peran: f.peran.value,
        no_sertifikat: f.no_sertifikat.value,
        keterangan: f.keterangan.value,
        file_sertifikat: f.file_sertifikat.files[0] ?? null,
      },
    });
  };

  /* ── Mutasi query & mutations ── */
  const [modalMutasi, setModalMutasi] = useState(null); // null | 'add' | object

  const { data: mutasis = [] } = useQuery({
    queryKey: ["guru-mutasi", nuptk],
    queryFn: () =>
      api
        .get(`/operator/master-data/guru/${nuptk}/mutasi`)
        .then((r) => r.data.data),
    initialData: guru.mutasi ?? [],
    initialDataUpdatedAt: 0, // ← tambah ini: paksa refetch saat pertama render
  });

  const saveMutasi = useMutation({
    mutationFn: ({ data, id }) => {
      const fd = new FormData();
      Object.entries(data).forEach(
        ([k, v]) => v != null && v !== "" && fd.append(k, v),
      );
      return id
        ? api.post(
            `/operator/master-data/guru/${nuptk}/mutasi/${id}?_method=PUT`,
            fd,
          )
        : api.post(`/operator/master-data/guru/${nuptk}/mutasi`, fd);
    },
    onSuccess: () => {
      toast.success("Riwayat mutasi disimpan.");
      queryClient.invalidateQueries({ queryKey: ["guru-mutasi", nuptk] });
      queryClient.invalidateQueries({ queryKey: ["guru-detail", nuptk] });
      queryClient.invalidateQueries({ queryKey: ["master-guru"] });
      setModalMutasi(null);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message ?? "Gagal menyimpan."),
  });

  const deleteMutasi = useMutation({
    mutationFn: (id) =>
      api.delete(`/operator/master-data/guru/${nuptk}/mutasi/${id}`),
    onSuccess: () => {
      toast.success("Riwayat mutasi dihapus.");
      queryClient.invalidateQueries({ queryKey: ["guru-mutasi", nuptk] });
      queryClient.invalidateQueries({ queryKey: ["guru-detail", nuptk] });
      queryClient.invalidateQueries({ queryKey: ["master-guru"] });
    },
    onError: (e) =>
      toast.error(e.response?.data?.message ?? "Gagal menghapus."),
  });

  const handleMutasiSubmit = (data) => {
    saveMutasi.mutate({
      id: modalMutasi?.id,
      data,
    });
  };

  /* ── Jabatan query & mutations ── */
  const { data: jabatans = [] } = useQuery({
    queryKey: ["guru-jabatan", nuptk],
    queryFn: () =>
      api
        .get(`/operator/master-data/guru/${nuptk}/jabatan`)
        .then((r) => r.data.data),
    initialData: guru.jabatans ?? [],
  });

  // // Baris sintetis dari data kepegawaian guru (jika belum ada entry jabatan aktif)
  // const jabatanAktifFromGuru =
  //   jabatans.length === 0 &&
  //   (guru.status_kepegawaian || guru.jabatan_aktif || guru.jabatanAktif)
  //     ? [
  //         {
  //           id: "__from_guru__",
  //           jabatan: guru.jenis_ptk || "Guru",
  //           jenis_jabatan: "Fungsional",
  //           unit_kerja: guru.instansi_pengangkat || "",
  //           golongan:
  //             guru.jabatan_aktif?.golongan ?? guru.jabatanAktif?.golongan ?? "",
  //           pangkat:
  //             guru.jabatan_aktif?.pangkat ?? guru.jabatanAktif?.pangkat ?? "",
  //           status_kepegawaian: guru.status_kepegawaian || "",
  //           no_sk: guru.no_sk_pengangkatan || "",
  //           tanggal_sk: guru.tgl_sk_pengangkatan || "",
  //           tmt_jabatan:
  //             guru.tmt_pns || guru.tmt_gty || guru.tanggal_bergabung || "",
  //           tanggal_selesai: null,
  //           is_current: true,
  //           _readOnly: true,
  //         },
  //       ]
  //     : [];

  // const jabatanRows = jabatans.length > 0 ? jabatans : jabatanAktifFromGuru;

  const jabatanRows = jabatans;

  const saveJabatan = useMutation({
    mutationFn: ({ data, id }) =>
      id
        ? api.put(`/operator/master-data/guru/${nuptk}/jabatan/${id}`, data)
        : api.post(`/operator/master-data/guru/${nuptk}/jabatan`, data),
    onSuccess: () => {
      toast.success("Jabatan disimpan.");
      queryClient.invalidateQueries(["guru-jabatan", nuptk]);
      setModalJabatan(null);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message ?? "Gagal menyimpan."),
  });

  const deleteJabatan = useMutation({
    mutationFn: (id) =>
      api.delete(`/operator/master-data/guru/${nuptk}/jabatan/${id}`),
    onSuccess: () => {
      toast.success("Jabatan dihapus.");
      queryClient.invalidateQueries(["guru-jabatan", nuptk]);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message ?? "Gagal menghapus."),
  });

  const handleJabatanSubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    const tmt = f.tmt_jabatan.value;
    const selesai = f.tanggal_selesai.value;
    if (tmt && selesai && selesai < tmt) {
      toast.error("Tanggal selesai tidak boleh lebih awal dari TMT jabatan.");
      return;
    }

    saveJabatan.mutate({
      id: modalJabatan?.id,
      data: {
        jenis_jabatan: f.jenis_jabatan.value,
        jenis_pengangkatan: f.jenis_pengangkatan.value,
        jabatan: f.jabatan.value,
        unit_kerja: f.unit_kerja.value,
        instansi_pengangkat: f.instansi_pengangkat.value,
        golongan: f.golongan.value,
        pangkat: f.pangkat.value,
        status_kepegawaian: f.status_kepegawaian.value,
        no_sk: f.no_sk.value,
        tanggal_sk: f.tanggal_sk.value,
        pejabat_penandatangan: f.pejabat_penandatangan.value,
        tmt_jabatan: f.tmt_jabatan.value,
        tanggal_selesai: f.tanggal_selesai.value,
        masa_berlaku: f.masa_berlaku.value,
        alasan_berakhir: f.alasan_berakhir.value,
        status_jabatan: f.status_jabatan.value,
        uraian_tugas: f.uraian_tugas.value,
        is_current: f.is_current.checked ? 1 : 0,
      },
    });
  };

  const TINGKAT_OPTS = [
    "Kecamatan",
    "Kabupaten/Kota",
    "Provinsi",
    "Nasional",
    "Internasional",
  ];
  const PERAN_OPTS = [
    { value: "peserta", label: "Peserta" },
    { value: "narasumber", label: "Narasumber" },
    { value: "panitia", label: "Panitia" },
    { value: "moderator", label: "Moderator" },
  ];

  /* ── badge warna tingkat ── */
  const tingkatColor = {
    Nasional: "bg-primary/10 text-primary",
    Provinsi: "bg-secondary/10 text-secondary",
    "Kabupaten/Kota": "bg-success/10 text-success",
    Kecamatan: "bg-warning/10 text-warning",
    Sekolah: "bg-surface-container text-text-secondary",
  };

  return (
    <div className="space-y-6">
      {/* ── SECTION 1: DIKLAT / PELATIHAN ── */}
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle
            icon="cast_for_education"
            label="Riwayat Diklat & Pelatihan"
            desc={`${diklats.length} data tercatat`}
          />
          <button
            onClick={() => setModalDiklat("add")}
            className="px-3 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>{" "}
            Tambah
          </button>
        </div>
        {diklats.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            Belum ada riwayat diklat / pelatihan.
          </p>
        ) : (
          <div className="space-y-3">
            {diklats.map((d) => (
              <div
                key={d.id}
                className="p-4 bg-surface-container-low rounded-xl border border-border-light"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-text-primary">
                        {d.nama_diklat}
                      </p>
                      {d.tingkat && (
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${tingkatColor[d.tingkat] ?? "bg-surface-container text-text-secondary"}`}
                        >
                          {d.tingkat}
                        </span>
                      )}
                      {d.peran && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant">
                          {d.peran}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary">
                      {d.penyelenggara}
                      {d.jenis ? ` · ${d.jenis}` : ""}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {d.tanggal_mulai ? fmtDate(d.tanggal_mulai) : ""}
                      {d.tanggal_selesai
                        ? ` – ${fmtDate(d.tanggal_selesai)}`
                        : ""}
                      {d.jumlah_jam ? ` · ${d.jumlah_jam} JP` : ""}
                    </p>
                    {d.no_sertifikat && (
                      <p className="text-xs text-text-secondary font-mono mt-0.5">
                        No: {d.no_sertifikat}
                      </p>
                    )}
                    {d.keterangan && (
                      <p className="text-xs text-text-secondary italic mt-0.5">
                        {d.keterangan}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {d.file_sertifikat && (
                      <button
                        onClick={() =>
                          downloadFile(
                            d.file_sertifikat,
                            `Diklat_${d.nama_diklat}`,
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="Download sertifikat diklat"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          download
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => setModalDiklat(d)}
                      className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        confirm("Hapus data diklat ini?") &&
                        deleteDiklat.mutate(d.id)
                      }
                      className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 2: MUTASI ── */}
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle
            icon="swap_horiz"
            label="Riwayat Mutasi"
            desc={`${mutasis.length} data tercatat`}
          />
          <button
            onClick={() => setModalMutasi("add")}
            className="px-3 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah
          </button>
        </div>

        {mutasis.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            Belum ada riwayat mutasi.
          </p>
        ) : (
          <div className="space-y-3">
            {mutasis.map((m) => {
              const badgeColor =
                m.jenis_mutasi === "Masuk"
                  ? "bg-success/10 text-success"
                  : m.jenis_mutasi === "Keluar"
                    ? "bg-error/10 text-error"
                    : m.jenis_mutasi === "Internal"
                      ? "bg-warning/10 text-warning"
                      : m.jenis_mutasi === "Penugasan Sementara"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-surface-container text-text-secondary";

              return (
                <div
                  key={m.id}
                  className="p-4 bg-surface-container-low rounded-xl border border-border-light"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Baris 1: badge jenis + SK */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}
                        >
                          {m.jenis_mutasi}
                        </span>
                        {m.jenis_mutasi === "Keluar" && (
                          <span
                            className="text-[11px] text-text-secondary italic"
                            title="Jika guru ini kembali bertugas di sekolah ini, tambahkan riwayat Mutasi Masuk baru."
                          >
                            · Untuk mengaktifkan kembali, tambah Mutasi Masuk
                          </span>
                        )}
                        {m.jenis_mutasi === "Penugasan Sementara" &&
                          !m.tanggal_berakhir && (
                            <span
                              className="text-[11px] text-warning font-medium"
                              title="Penugasan masih aktif. Tambah Kembali Bertugas untuk menutup."
                            >
                              · Masih aktif — tambah Kembali Bertugas jika sudah
                              selesai
                            </span>
                          )}
                        {m.no_sk && (
                          <span className="text-[11px] text-text-secondary font-mono">
                            SK: {m.no_sk}
                          </span>
                        )}
                        {m.tanggal_sk && (
                          <span className="text-[11px] text-text-secondary">
                            {fmtDate(m.tanggal_sk)}
                          </span>
                        )}
                      </div>

                      {/* Baris 2: Sekolah asal → tujuan */}
                      {(m.sekolah_asal || m.sekolah_tujuan) && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm font-medium text-text-primary truncate">
                            {m.sekolah_asal || "–"}
                          </span>
                          <span className="material-symbols-outlined text-[16px] text-text-secondary flex-shrink-0">
                            arrow_forward
                          </span>
                          <span className="text-sm font-medium text-text-primary truncate">
                            {m.sekolah_tujuan || "–"}
                          </span>
                        </div>
                      )}

                      {/* Baris 3: Jabatan sebelum → sesudah */}
                      {(m.jabatan_sebelum || m.jabatan_sesudah) && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs text-text-secondary truncate">
                            {m.jabatan_sebelum || "–"}
                          </span>
                          <span className="material-symbols-outlined text-[14px] text-text-secondary flex-shrink-0">
                            arrow_forward
                          </span>
                          <span className="text-xs text-text-secondary truncate">
                            {m.jabatan_sesudah || "–"}
                          </span>
                        </div>
                      )}

                      {/* Baris 4: Tanggal & TMT */}
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span className="text-xs text-text-secondary">
                          Tanggal Mutasi: <b>{fmtDate(m.tanggal_mutasi)}</b>
                        </span>
                        {m.tmt_mutasi && (
                          <span className="text-xs text-text-secondary">
                            TMT: <b>{fmtDate(m.tmt_mutasi)}</b>
                          </span>
                        )}
                        {m.status_kepegawaian && (
                          <span className="text-xs text-text-secondary">
                            Status: <b>{m.status_kepegawaian}</b>
                          </span>
                        )}
                      </div>

                      {/* Baris 5: Instansi & Alasan */}
                      {(m.instansi_penerbit_sk || m.alasan_mutasi) && (
                        <div className="flex flex-wrap gap-3 mt-0.5">
                          {m.instansi_penerbit_sk && (
                            <span className="text-xs text-text-secondary">
                              Penerbit: {m.instansi_penerbit_sk}
                            </span>
                          )}
                          {m.alasan_mutasi && (
                            <span className="text-xs text-text-secondary">
                              Alasan: {m.alasan_mutasi}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Baris 6: Keterangan */}
                      {m.keterangan && (
                        <p className="text-xs text-text-secondary italic mt-0.5">
                          {m.keterangan}
                        </p>
                      )}
                    </div>

                    {/* Tombol aksi */}
                    <div className="flex gap-1 flex-shrink-0 ml-1">
                      {m.file_sk && (
                        <button
                          onClick={() =>
                            downloadFile(m.file_sk, `SK_Mutasi_${m.id}`)
                          }
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Download SK"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            download
                          </span>
                        </button>
                      )}
                      <button
                        onClick={() => setModalMutasi(m)}
                        className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          confirm("Hapus riwayat mutasi ini?") &&
                          deleteMutasi.mutate(m.id)
                        }
                        className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL MUTASI (Dinamis per Jenis) ── */}
      {modalMutasi && (
        <ModalMutasi
          modalMutasi={modalMutasi}
          onClose={() => setModalMutasi(null)}
          onSubmit={handleMutasiSubmit}
          isPending={saveMutasi.isPending}
          jabatanAktif={jabatanRows.find((j) => j.is_current) ?? null}
        />
      )}

      {/* ── SECTION 3a: CARD JABATAN AKTIF ── */}
      {(() => {
        const aktif = jabatanRows.find((j) => j.is_current);
        if (!aktif) return null;
        const durasi = (() => {
          if (!aktif.tmt_jabatan) return null;
          const start = new Date(aktif.tmt_jabatan);
          const now = new Date();
          let y = now.getFullYear() - start.getFullYear();
          let m = now.getMonth() - start.getMonth();
          if (m < 0) {
            y--;
            m += 12;
          }
          const parts = [];
          if (y > 0) parts.push(`${y} Tahun`);
          if (m > 0) parts.push(`${m} Bulan`);
          return parts.length ? parts.join(" ") : "< 1 Bulan";
        })();
        return (
          <div className="bg-gradient-to-r from-primary/8 to-primary/4 rounded-[16px] border border-primary/20 p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  badge
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">
                    Jabatan Aktif
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success border border-success/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    Aktif
                  </span>
                </div>
                <p className="font-bold text-text-primary text-lg leading-tight">
                  {aktif.jabatan}
                </p>
                {aktif.unit_kerja && (
                  <p className="text-sm text-text-secondary mt-0.5">
                    {aktif.unit_kerja}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                  {aktif.tmt_jabatan && (
                    <span className="text-xs text-text-secondary">
                      Sejak{" "}
                      <strong className="text-text-primary">
                        {fmtDate(aktif.tmt_jabatan)}
                      </strong>
                      {durasi && (
                        <span className="ml-1 text-primary font-semibold">
                          ({durasi})
                        </span>
                      )}
                    </span>
                  )}
                  {(aktif.golongan || aktif.pangkat) && (
                    <span className="text-xs text-text-secondary">
                      Gol{" "}
                      <strong className="font-mono text-primary">
                        {aktif.golongan || "—"}
                      </strong>
                      {aktif.pangkat && (
                        <span className="ml-1">· {aktif.pangkat}</span>
                      )}
                    </span>
                  )}
                  {aktif.status_kepegawaian && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
                      {aktif.status_kepegawaian}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setModalJabatan(aktif)}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                title="Edit jabatan aktif"
              >
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── SECTION 3b: RIWAYAT JABATAN ── */}
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <SectionTitle
            icon="work_history"
            label="Riwayat Jabatan"
            desc={`${jabatanRows.length} data`}
          />
          <button
            onClick={() => setModalJabatan("add")}
            className="px-3 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah
          </button>
        </div>

        {jabatanRows.length === 0 ? (
          <div className="text-center py-10">
            <span className="material-symbols-outlined text-[40px] text-text-secondary/40 block mb-2">
              work_history
            </span>
            <p className="text-sm text-text-secondary">
              Belum ada riwayat jabatan.
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Klik <strong>Tambah</strong> atau lengkapi data kepegawaian di
              form Edit Profil.
            </p>
          </div>
        ) : (
          <>
            {/* {jabatanAktifFromGuru.length > 0 && (
              <div className="mb-4 flex items-start gap-2 p-3 bg-primary/5 border border-primary/15 rounded-xl text-xs text-primary">
                <span className="material-symbols-outlined text-[16px] flex-shrink-0 mt-0.5">
                  info
                </span>
                <span>
                  Data diambil otomatis dari informasi kepegawaian guru.
                  Tambahkan riwayat jabatan manual untuk data lebih lengkap.
                </span>
              </div>
            )} */}
            {/* Timeline + Tabel */}
            <div className="space-y-3">
              {jabatanRows.map((j, idx) => {
                const durasi = (() => {
                  if (!j.tmt_jabatan) return null;
                  const s = new Date(j.tmt_jabatan);
                  const e2 = j.tanggal_selesai
                    ? new Date(j.tanggal_selesai)
                    : new Date();
                  let y = e2.getFullYear() - s.getFullYear();
                  let m = e2.getMonth() - s.getMonth();
                  if (m < 0) {
                    y--;
                    m += 12;
                  }
                  const p = [];
                  if (y > 0) p.push(`${y} Thn`);
                  if (m > 0) p.push(`${m} Bln`);
                  return p.length ? p.join(" ") : "< 1 Bln";
                })();
                const statusColor =
                  {
                    Aktif: "bg-success/10 text-success border-success/20",
                    Berakhir:
                      "bg-surface-container text-text-secondary border-border-light",
                    Nonaktif: "bg-red-50 text-red-600 border-red-200",
                    Mutasi: "bg-blue-50 text-blue-600 border-blue-200",
                    Pensiun: "bg-amber-50 text-amber-700 border-amber-200",
                  }[
                    j.status_jabatan || (j.is_current ? "Aktif" : "Berakhir")
                  ] ??
                  "bg-surface-container text-text-secondary border-border-light";
                return (
                  <div
                    key={j.id}
                    className={`flex gap-3 group ${idx < jabatanRows.length - 1 ? "" : ""}`}
                  >
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center flex-shrink-0 pt-1">
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${j.is_current ? "bg-success border-success" : "bg-border-light border-border-light"}`}
                      />
                      {idx < jabatanRows.length - 1 && (
                        <div className="w-0.5 bg-border-light flex-1 mt-1 min-h-[24px]" />
                      )}
                    </div>
                    {/* Card */}
                    <div
                      className={`flex-1 mb-3 rounded-xl border p-4 transition-all ${j.is_current ? "border-success/25 bg-success/3" : "border-border-light bg-surface-container-lowest"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusColor}`}
                            >
                              {j.status_jabatan ||
                                (j.is_current ? "● Aktif" : "Berakhir")}
                            </span>
                            {j.jenis_jabatan && (
                              <span className="text-[11px] text-text-secondary bg-surface-container rounded px-1.5 py-0.5 border border-border-light">
                                {j.jenis_jabatan}
                              </span>
                            )}
                            {j.jenis_pengangkatan && (
                              <span className="text-[11px] text-primary bg-primary/8 rounded px-1.5 py-0.5 border border-primary/15">
                                {j.jenis_pengangkatan}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-text-primary">
                            {j.jabatan || "—"}
                          </p>
                          {j.unit_kerja && (
                            <p className="text-xs text-text-secondary mt-0.5">
                              {j.unit_kerja}
                            </p>
                          )}
                          {j.instansi_pengangkat &&
                            j.instansi_pengangkat !== j.unit_kerja && (
                              <p className="text-xs text-text-secondary italic mt-0.5">
                                Pengangkat: {j.instansi_pengangkat}
                              </p>
                            )}
                          {/* Kepangkatan inline */}
                          {(j.golongan ||
                            j.pangkat ||
                            j.status_kepegawaian) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {j.status_kepegawaian && (
                                <span className="text-xs px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                                  {j.status_kepegawaian}
                                </span>
                              )}
                              {j.golongan && (
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                  {j.golongan}
                                </span>
                              )}
                              {j.pangkat && (
                                <span className="text-xs text-text-secondary">
                                  {j.pangkat}
                                </span>
                              )}
                            </div>
                          )}
                          {/* Periode */}
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-text-secondary">
                            {j.tmt_jabatan && (
                              <span>
                                {fmtDate(j.tmt_jabatan)} →{" "}
                                {j.tanggal_selesai ? (
                                  <span>{fmtDate(j.tanggal_selesai)}</span>
                                ) : (
                                  <span className="text-success font-semibold">
                                    Sekarang
                                  </span>
                                )}
                                {durasi && (
                                  <span className="ml-1 font-semibold text-primary">
                                    ({durasi})
                                  </span>
                                )}
                              </span>
                            )}
                            {j.masa_berlaku && (
                              <span>
                                Berlaku s/d:{" "}
                                <strong>{fmtDate(j.masa_berlaku)}</strong>
                              </span>
                            )}
                          </div>
                          {/* SK */}
                          {(j.no_sk || j.pejabat_penandatangan) && (
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-text-secondary">
                              {j.no_sk && (
                                <span className="font-mono">
                                  SK: {j.no_sk}
                                  {j.tanggal_sk &&
                                    ` · ${fmtDate(j.tanggal_sk)}`}
                                </span>
                              )}
                              {j.pejabat_penandatangan && (
                                <span>TTD: {j.pejabat_penandatangan}</span>
                              )}
                            </div>
                          )}
                          {j.alasan_berakhir && (
                            <p className="text-xs text-text-secondary mt-1">
                              Berakhir:{" "}
                              <span className="font-medium">
                                {j.alasan_berakhir}
                              </span>
                            </p>
                          )}
                        </div>
                        {/* Aksi */}
                        {!j._readOnly && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              onClick={() => setModalJabatan(j)}
                              className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-primary transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                confirm("Hapus data jabatan ini?") &&
                                deleteJabatan.mutate(j.id)
                              }
                              className="p-1.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-red-600 transition-colors"
                              title="Hapus"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                delete
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── SECTION 3c: RIWAYAT KEPANGKATAN (terpisah) ── */}
      {(() => {
        const kepangkatanRows = jabatanRows.filter(
          (j) => j.golongan || j.pangkat,
        );
        if (kepangkatanRows.length === 0) return null;
        return (
          <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
            <SectionTitle
              icon="military_tech"
              label="Riwayat Kepangkatan"
              desc={`${kepangkatanRows.length} entri`}
            />
            <div className="mt-4 flex items-start gap-2 overflow-x-auto pb-2">
              {kepangkatanRows.map((j, idx) => (
                <div
                  key={j.id}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <div
                    className={`text-center px-4 py-3 rounded-xl border min-w-[100px] ${j.is_current ? "bg-primary/8 border-primary/25" : "bg-surface-container-low border-border-light"}`}
                  >
                    <p
                      className={`text-lg font-black font-mono ${j.is_current ? "text-primary" : "text-text-primary"}`}
                    >
                      {j.golongan || "—"}
                    </p>
                    {j.pangkat && (
                      <p className="text-[11px] text-text-secondary mt-0.5 leading-tight">
                        {j.pangkat}
                      </p>
                    )}
                    {j.tmt_jabatan && (
                      <p className="text-[10px] text-text-secondary mt-1">
                        {fmtDate(j.tmt_jabatan)}
                      </p>
                    )}
                    {j.is_current && (
                      <p className="text-[10px] text-success font-bold mt-0.5">
                        ● Saat ini
                      </p>
                    )}
                  </div>
                  {idx < kepangkatanRows.length - 1 && (
                    <span className="material-symbols-outlined text-text-secondary/40 text-[18px]">
                      arrow_forward
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ══ MODAL: JABATAN ══ */}
      {modalJabatan && (
        <Modal
          title={
            modalJabatan === "add"
              ? "Tambah Riwayat Jabatan"
              : "Edit Riwayat Jabatan"
          }
          onClose={() => setModalJabatan(null)}
          wide
        >
          <form onSubmit={handleJabatanSubmit} className="space-y-4">
            {/* ── Baris 1: Jenis + Jenis Pengangkatan + Status Kepegawaian ── */}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Jenis Jabatan" required>
                <select
                  name="jenis_jabatan"
                  defaultValue={modalJabatan?.jenis_jabatan ?? ""}
                  required
                  className={inputCls}
                >
                  <option value="">Pilih</option>
                  <option value="Struktural">Struktural</option>
                  <option value="Fungsional">Fungsional</option>
                  <option value="Tambahan">Tambahan</option>
                </select>
              </Field>
              <Field label="Jenis Pengangkatan">
                <select
                  name="jenis_pengangkatan"
                  defaultValue={modalJabatan?.jenis_pengangkatan ?? ""}
                  className={inputCls}
                >
                  <option value="">— Pilih —</option>
                  <option>Pengangkatan Baru</option>
                  <option>Promosi</option>
                  <option>Mutasi</option>
                  <option>Rotasi</option>
                  <option>Perpanjangan</option>
                  <option>Pelaksana Tugas (Plt)</option>
                </select>
              </Field>
              <Field label="Status Kepegawaian">
                <select
                  name="status_kepegawaian"
                  defaultValue={modalJabatan?.status_kepegawaian ?? ""}
                  className={inputCls}
                >
                  <option value="">— Pilih —</option>
                  {[
                    "CPNS",
                    "PNS",
                    "PPPK",
                    "GTY",
                    "GTT",
                    "Honorer",
                    "Kontrak",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* ── Baris 2: Nama Jabatan + Unit Kerja ── */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nama Jabatan" required>
                <input
                  name="jabatan"
                  defaultValue={modalJabatan?.jabatan ?? ""}
                  required
                  className={inputCls}
                  placeholder="Wali Kelas, Bendahara BOS, Waka Kurikulum…"
                />
              </Field>
              <Field label="Unit Kerja">
                <input
                  name="unit_kerja"
                  defaultValue={modalJabatan?.unit_kerja ?? ""}
                  className={inputCls}
                  placeholder="MI Nurul Huda 3"
                />
              </Field>
            </div>
            <Field label="Instansi Pengangkat">
              <input
                name="instansi_pengangkat"
                defaultValue={modalJabatan?.instansi_pengangkat ?? ""}
                className={inputCls}
                placeholder="Yayasan Nurul Huda, Kemenag Kab. Bogor, Pemda…"
              />
            </Field>

            {/* ── Kepangkatan ── */}
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 space-y-3">
              <p className="text-xs font-bold text-primary uppercase tracking-widest">
                Kepangkatan
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Golongan / Ruang">
                  <select
                    name="golongan"
                    defaultValue={modalJabatan?.golongan ?? ""}
                    className={inputCls}
                  >
                    <option value="">— Pilih —</option>
                    {[
                      "I/a",
                      "I/b",
                      "I/c",
                      "I/d",
                      "II/a",
                      "II/b",
                      "II/c",
                      "II/d",
                      "III/a",
                      "III/b",
                      "III/c",
                      "III/d",
                      "IV/a",
                      "IV/b",
                      "IV/c",
                      "IV/d",
                      "IV/e",
                    ].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Pangkat">
                  <input
                    name="pangkat"
                    defaultValue={modalJabatan?.pangkat ?? ""}
                    className={inputCls}
                    placeholder="Penata Muda, Guru Pertama…"
                  />
                </Field>
              </div>
            </div>

            {/* ── SK ── */}
            <div className="rounded-xl border border-border-light bg-surface-container-lowest p-4 space-y-3">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                Surat Keputusan
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="No. SK">
                  <input
                    name="no_sk"
                    defaultValue={modalJabatan?.no_sk ?? ""}
                    className={inputCls}
                    placeholder="Nomor SK"
                  />
                </Field>
                <Field label="Tanggal SK">
                  <input
                    name="tanggal_sk"
                    type="date"
                    defaultValue={modalJabatan?.tanggal_sk?.slice(0, 10) ?? ""}
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Pejabat Penandatangan">
                <input
                  name="pejabat_penandatangan"
                  defaultValue={modalJabatan?.pejabat_penandatangan ?? ""}
                  className={inputCls}
                  placeholder="Kepala Yayasan, Kepala Madrasah, Kemenag Kab…"
                />
              </Field>
            </div>

            {/* ── Periode ── */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="TMT Jabatan">
                <input
                  name="tmt_jabatan"
                  type="date"
                  defaultValue={modalJabatan?.tmt_jabatan?.slice(0, 10) ?? ""}
                  className={inputCls}
                />
              </Field>
              <Field label="Masa Berlaku (opsional)">
                <input
                  name="masa_berlaku"
                  type="date"
                  defaultValue={modalJabatan?.masa_berlaku?.slice(0, 10) ?? ""}
                  className={inputCls}
                />
              </Field>
              <Field label="Tanggal Selesai">
                <input
                  name="tanggal_selesai"
                  type="date"
                  defaultValue={
                    modalJabatan?.tanggal_selesai?.slice(0, 10) ?? ""
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Alasan Berakhir">
                <select
                  name="alasan_berakhir"
                  defaultValue={modalJabatan?.alasan_berakhir ?? ""}
                  className={inputCls}
                >
                  <option value="">— Pilih —</option>
                  {[
                    "Mutasi",
                    "Promosi",
                    "Habis Masa Jabatan",
                    "Mengundurkan Diri",
                    "Pensiun",
                    "Lainnya",
                  ].map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* ── Status Jabatan ── */}
            <Field label="Status Jabatan">
              <select
                name="status_jabatan"
                defaultValue={
                  modalJabatan?.status_jabatan ??
                  (modalJabatan === "add" ? "Aktif" : "")
                }
                className={inputCls}
              >
                <option value="Aktif">Aktif</option>
                <option value="Berakhir">Berakhir</option>
                <option value="Nonaktif">Nonaktif</option>
                <option value="Mutasi">Mutasi</option>
                <option value="Pensiun">Pensiun</option>
              </select>
            </Field>

            <Field label="Uraian Tugas / Keterangan">
              <textarea
                name="uraian_tugas"
                defaultValue={modalJabatan?.uraian_tugas ?? ""}
                rows={2}
                className={inputCls}
                placeholder="Deskripsi singkat tugas (opsional)"
              />
            </Field>

            <label className="flex items-center gap-2 text-sm cursor-pointer select-none p-3 rounded-xl border border-success/20 bg-success/5">
              <input
                name="is_current"
                type="checkbox"
                defaultChecked={
                  !!modalJabatan?.is_current || modalJabatan === "add"
                }
                className="w-4 h-4 accent-primary"
              />
              <span className="font-medium text-text-primary">
                Tandai sebagai jabatan <strong>aktif</strong> saat ini
              </span>
              <span className="ml-auto text-xs text-text-secondary italic">
                (menonaktifkan jabatan lain)
              </span>
            </label>

            <div className="flex justify-end gap-3 pt-2 border-t border-border-light">
              <button
                type="button"
                onClick={() => setModalJabatan(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border-light hover:bg-surface-container transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saveJabatan.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {saveJabatan.isPending ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ══ MODAL: DIKLAT ══ */}
      {modalDiklat && (
        <Modal
          title={
            modalDiklat === "add"
              ? "Tambah Diklat / Pelatihan"
              : "Edit Diklat / Pelatihan"
          }
          onClose={() => setModalDiklat(null)}
        >
          <form onSubmit={handleDiklatSubmit} className="space-y-4">
            <Field label="Nama Diklat / Pelatihan" required>
              <input
                name="nama_diklat"
                defaultValue={modalDiklat?.nama_diklat ?? ""}
                required
                className={inputCls}
                placeholder="Contoh: Pelatihan Kurikulum Merdeka"
              />
            </Field>
            <Field label="Penyelenggara">
              <input
                name="penyelenggara"
                defaultValue={modalDiklat?.penyelenggara ?? ""}
                className={inputCls}
                placeholder="Contoh: Kemdikbudristek"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Jenis">
                <select
                  name="jenis"
                  defaultValue={modalDiklat?.jenis ?? ""}
                  className={inputCls}
                >
                  <option value="">Pilih jenis</option>
                  <option value="diklat">Diklat</option>
                  <option value="bimtek">Bimtek</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="pelatihan">Pelatihan</option>
                  <option value="kursus">Kursus</option>
                </select>
              </Field>
              <Field label="Tingkat">
                <select
                  name="tingkat"
                  defaultValue={modalDiklat?.tingkat ?? ""}
                  className={inputCls}
                >
                  <option value="">Pilih tingkat</option>
                  {TINGKAT_OPTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tanggal Mulai">
                <input
                  name="tanggal_mulai"
                  type="date"
                  defaultValue={modalDiklat?.tanggal_mulai?.slice(0, 10) ?? ""}
                  className={inputCls}
                />
              </Field>
              <Field label="Tanggal Selesai">
                <input
                  name="tanggal_selesai"
                  type="date"
                  defaultValue={
                    modalDiklat?.tanggal_selesai?.slice(0, 10) ?? ""
                  }
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Jumlah Jam (JP)">
                <input
                  name="jumlah_jam"
                  type="number"
                  min="1"
                  defaultValue={modalDiklat?.jumlah_jam ?? ""}
                  className={inputCls}
                  placeholder="Contoh: 32"
                />
              </Field>
              <Field label="Peran">
                <select
                  name="peran"
                  defaultValue={modalDiklat?.peran ?? ""}
                  className={inputCls}
                >
                  <option value="">Pilih peran</option>
                  {PERAN_OPTS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="No. Sertifikat">
              <input
                name="no_sertifikat"
                defaultValue={modalDiklat?.no_sertifikat ?? ""}
                className={inputCls}
              />
            </Field>
            <Field label="Keterangan">
              <textarea
                name="keterangan"
                rows={2}
                defaultValue={modalDiklat?.keterangan ?? ""}
                className={`${inputCls} resize-none`}
                placeholder="Catatan tambahan (opsional)"
              />
            </Field>
            <Field label="Upload Sertifikat (PDF/JPG, maks 5MB)">
              <input
                name="file_sertifikat"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {modalDiklat?.file_sertifikat && (
                <p className="text-xs text-text-secondary mt-1">
                  File sebelumnya:{" "}
                  <a
                    href={`${BASE_URL}/storage/${modalDiklat.file_sertifikat}`}
                    target="_blank"
                    className="text-primary underline"
                  >
                    lihat
                  </a>
                </p>
              )}
            </Field>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalDiklat(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saveDiklat.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {saveDiklat.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 7 — Akun Login  (PERSIS TEMPLATE)
   ══════════════════════════════════════════════════════════ */
function TabAkunLogin({
  akunGuru,
  nuptk,
  navigate,
  toggleActive,
  resetPassword,
  hapusAkun,
}) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  if (!akunGuru) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
          <SectionTitle
            icon="shield_person"
            label="Akun Login"
            desc="Guru ini belum memiliki akun login."
          />
          <button
            onClick={() =>
              navigate("/operator", { state: { openModal: true, nuptk } })
            }
            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Buat Akun Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Main Account Card — PERSIS TEMPLATE */}
        <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
          {/* Header */}
          <SectionTitle
            icon="shield_person"
            label="Akun Login"
            desc="Informasi akun yang digunakan guru untuk mengakses sistem."
          />

          {/* Info Grid — 2 kolom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8">
            <div className="space-y-4">
              <InfoRow label="Username" value={akunGuru.username} />
              <InfoRow label="Email Login" value={akunGuru.email} />
              <InfoRow label="Role" value={akunGuru.roles?.[0] ?? "Guru"} />
              {/* Status Akun — badge khusus */}
              <div className="flex justify-between border-b border-surface-container pb-2">
                <span className="text-sm text-text-secondary">Status Akun</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                    akunGuru.is_active
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      akunGuru.is_active ? "bg-success" : "bg-danger"
                    }`}
                  />
                  {akunGuru.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <InfoRow
                label="Terakhir Login"
                value={
                  akunGuru.last_login_at
                    ? fmtDate(akunGuru.last_login_at)
                    : "Belum pernah login"
                }
              />
              <InfoRow
                label="Password Terakhir Diubah"
                value={
                  akunGuru.password_changed_at
                    ? fmtDate(akunGuru.password_changed_at)
                    : "-"
                }
              />
              <InfoRow
                label="Perangkat Terakhir"
                value={akunGuru.last_device ?? "-"}
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-secondary">
                Password
              </span>
              <button className="text-primary text-sm font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">
                  visibility
                </span>{" "}
                Lihat
              </button>
            </div>
            <div className="text-lg tracking-widest font-mono mb-2">
              ••••••••••••••
            </div>
            <p className="text-xs text-text-secondary italic">
              Password disimpan secara terenkripsi. Demi keamanan sistem
              disarankan melakukan reset password daripada melihat password.
            </p>
          </div>

          {/* Security Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/20 text-center">
              <p className="text-xs text-text-secondary mb-1">Login Gagal</p>
              <p className="text-sm font-bold text-text-primary">
                {akunGuru.failed_logins ?? 0} kali
              </p>
            </div>
            <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/20 text-center">
              <p className="text-xs text-text-secondary mb-1">Status Email</p>
              {akunGuru.email_verified_at ? (
                <p className="text-sm font-bold text-success flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    check_circle
                  </span>{" "}
                  Terverifikasi
                </p>
              ) : (
                <p className="text-sm font-bold text-text-secondary">Belum</p>
              )}
            </div>
            <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/20 text-center">
              <p className="text-xs text-text-secondary mb-1">2FA</p>
              <p className="text-sm font-bold text-text-secondary">
                Belum Aktif
              </p>
            </div>
          </div>

          {/* Action Buttons — persis urutan template */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-surface-container">
            <button
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">key</span>{" "}
              Reset Password
            </button>
            <button
              onClick={() => navigate(`/operator/master/guru/edit/${nuptk}`)}
              className="px-4 py-2 bg-surface border border-outline-variant text-text-primary rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                edit
              </span>{" "}
              Edit Username
            </button>
            <button
              onClick={() => navigate(`/operator/master/guru/edit/${nuptk}`)}
              className="px-4 py-2 bg-surface border border-outline-variant text-text-primary rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                mail
              </span>{" "}
              Ubah Email
            </button>
            <button
              onClick={() => {
                if (
                  confirm(
                    `${akunGuru.is_active ? "Nonaktifkan" : "Aktifkan"} akun ini?`,
                  )
                )
                  toggleActive.mutate(akunGuru.id);
              }}
              className="px-4 py-2 bg-surface border border-warning/30 text-warning rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-warning/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                block
              </span>{" "}
              {akunGuru.is_active ? "Nonaktifkan Akun" : "Aktifkan Akun"}
            </button>
            <button
              onClick={() => {
                if (
                  confirm(
                    "Hapus akun login guru ini? Tindakan ini tidak bisa dibatalkan.",
                  )
                )
                  hapusAkun.mutate(akunGuru.id);
              }}
              className="px-4 py-2 bg-surface border border-error/30 text-error rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-error/5 transition-colors ml-auto"
            >
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>{" "}
              Hapus Akun
            </button>
          </div>
        </div>
      </div>

      {/* Modal Reset Password */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm border border-border-light">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
              <div>
                <h3 className="font-bold text-text-primary">Reset Password</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Akun: {akunGuru.username}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setNewPassword("");
                }}
                className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>
            <div className="px-6 py-5">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Password Baru <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                placeholder="Minimal 8 karakter"
              />
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-border-light">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setNewPassword("");
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (newPassword.length < 8) {
                    toast.error("Password minimal 8 karakter.");
                    return;
                  }
                  resetPassword.mutate({
                    id: akunGuru.id,
                    password: newPassword,
                  });
                  setShowResetModal(false);
                  setNewPassword("");
                }}
                disabled={resetPassword.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {resetPassword.isPending ? "Mereset..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
/* ══════════════════════════════════════════════════════════
   TAB 8 — Administrasi (Rekening, BPJS, Gaji)
   ══════════════════════════════════════════════════════════ */
function TabAdministrasi({ guru }) {
  const rek = guru.rekenings?.[0] ?? {};

  const fmtRp = (val) =>
    val != null && val !== ""
      ? "Rp " + Number(val).toLocaleString("id-ID")
      : "-";

  return (
    <div className="space-y-6">
      {/* Rekening Bank */}
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="account_balance" label="Rekening Bank" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
          <InfoRow label="Nama Bank" value={rek.nama_bank} />
          <InfoRow label="Nomor Rekening" value={rek.no_rekening} mono />
          <InfoRow label="Atas Nama" value={rek.atas_nama} />
          <InfoRow label="Cabang" value={rek.cabang} />
        </div>
      </div>

      {/* NPWP & BPJS */}
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="badge" label="NPWP & BPJS" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
          <InfoRow label="NPWP" value={rek.npwp} mono />
          <InfoRow label="BPJS Kesehatan" value={rek.no_bpjs_kesehatan} mono />
          <InfoRow
            label="BPJS Ketenagakerjaan"
            value={rek.no_bpjs_ketenagakerjaan}
            mono
          />
        </div>
      </div>

      {/* Gaji & Tunjangan */}
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="payments" label="Gaji & Tunjangan" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-surface-container-low rounded-xl border border-border-light">
            <p className="text-xs text-text-secondary mb-1">Gaji Pokok</p>
            <p className="text-lg font-bold text-text-primary">
              {fmtRp(rek.gaji_pokok)}
            </p>
          </div>
          <div className="p-4 bg-surface-container-low rounded-xl border border-border-light">
            <p className="text-xs text-text-secondary mb-1">
              Tunjangan Fungsional
            </p>
            <p className="text-lg font-bold text-text-primary">
              {fmtRp(rek.tunjangan_fungsional)}
            </p>
          </div>
          <div className="p-4 bg-surface-container-low rounded-xl border border-border-light">
            <p className="text-xs text-text-secondary mb-1">
              Tunjangan Profesi
            </p>
            <p className="text-lg font-bold text-text-primary">
              {fmtRp(rek.tunjangan_profesi)}
            </p>
          </div>
        </div>
        {(rek.gaji_pokok ||
          rek.tunjangan_fungsional ||
          rek.tunjangan_profesi) && (
          <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 flex justify-between items-center">
            <span className="text-sm font-semibold text-text-primary">
              Total Penghasilan
            </span>
            <span className="text-lg font-bold text-primary">
              {fmtRp(
                (Number(rek.gaji_pokok) || 0) +
                  (Number(rek.tunjangan_fungsional) || 0) +
                  (Number(rek.tunjangan_profesi) || 0),
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
/* ══════════════════════════════════════════════════════════
   TABS CONFIG
   ══════════════════════════════════════════════════════════ */
const TABS = [
  { id: "identitas", label: "Identitas & Kepegawaian" },
  { id: "penugasan", label: "Penugasan & Kompetensi" },
  { id: "pendidikan", label: "Pendidikan & Sertifikasi" },
  { id: "keluarga", label: "Keluarga & Kontak" },
  { id: "dokumen", label: "Dokumen" },
  { id: "riwayat", label: "Riwayat" },
  { id: "administrasi", label: "Administrasi" },
  { id: "akun", label: "Akun Login" },
];

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function DetailGuru() {
  const { nuptk } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [activeTab, setActiveTab] = useState("identitas");

  /* ── Queries ── */
  const { data: guru, isLoading } = useQuery({
    queryKey: ["guru-detail", nuptk],
    queryFn: () =>
      api.get(`/operator/master-data/guru/${nuptk}`).then((r) => r.data.data),
  });

  const { data: akunGuru } = useQuery({
    queryKey: ["guru-akun", nuptk],
    queryFn: () =>
      api
        .get(`/operator/master-data/guru/${nuptk}/akun`)
        .then((r) => r.data.data)
        .catch(() => null), // ← 404 ditangkap, return null
    retry: false, // ← jangan retry kalau 404
  });

  /* ── Mutations ── */
  const uploadFoto = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("foto", file);
      return api.post(`/operator/master-data/guru/${nuptk}/foto`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Foto berhasil diupload.");
      queryClient.invalidateQueries(["guru-detail", nuptk]);
    },
    onError: () => toast.error("Gagal upload foto."),
  });

  const toggleActive = useMutation({
    mutationFn: (id) => api.patch(`/operator/users/${id}/toggle-active`),
    onSuccess: () => {
      toast.success("Status akun diperbarui.");
      queryClient.invalidateQueries(["guru-akun", nuptk]);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const resetPassword = useMutation({
    mutationFn: ({ id, password }) =>
      api.patch(`/operator/users/${id}/reset-password`, {
        password,
        password_confirmation: password,
      }),
    onSuccess: () => toast.success("Password berhasil direset."),
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });

  const hapusAkun = useMutation({
    mutationFn: (id) => api.delete(`/operator/users/${id}`),
    onSuccess: () => {
      toast.success("Akun login dihapus.");
      queryClient.invalidateQueries(["guru-akun", nuptk]);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? "Gagal."),
  });
  const mutasiVerifikasi = useMutation({
    mutationFn: () =>
      api.patch(
        `/operator/master-data/guru/${nuptk}/${guru.is_verified ? "batal-verifikasi" : "verifikasi"}`,
      ),
    onSuccess: () => {
      toast.success(
        guru.is_verified
          ? "Verifikasi dibatalkan."
          : "Data guru berhasil diverifikasi.",
      );
      queryClient.invalidateQueries(["guru-detail", nuptk]);
    },
  });
  const [showKoreksiNuptk, setShowKoreksiNuptk] = useState(false);
  const [nuptkBaru, setNuptkBaru] = useState("");
  const [alasanKoreksi, setAlasanKoreksi] = useState("");

  const koreksiNuptk = useMutation({
    mutationFn: () =>
      api.patch(`/operator/master-data/guru/${nuptk}/koreksi-nuptk`, {
        nuptk_baru: nuptkBaru,
        alasan: alasanKoreksi,
      }),
    onSuccess: (res) => {
      const nuptkBaru = res.data.data.nuptk_baru;
      toast.success("NUPTK berhasil dikoreksi.");
      setShowKoreksiNuptk(false);
      setNuptkBaru("");
      setAlasanKoreksi("");
      queryClient.invalidateQueries(["guru-detail", nuptk]);
      // Redirect ke URL baru karena NUPTK berubah
      navigate(`/operator/master/guru/${nuptkBaru}`, { replace: true });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message ?? "Gagal mengoreksi NUPTK."),
  });
  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-text-secondary">Memuat data guru...</p>
      </div>
    );
  }

  if (!guru) {
    return (
      <div className="text-center py-20 text-text-secondary">
        Data guru tidak ditemukan.
      </div>
    );
  }

  const fotoUrl = guru.foto ? `${BASE_URL}/storage/${guru.foto}` : null;
  const namaLengkap =
    [guru.gelar_depan, guru.nama, guru.gelar_belakang]
      .filter(Boolean)
      .join(" ") ||
    guru.nama_lengkap ||
    guru.nama;
  const riwayatBadge =
    (guru.mutasis?.length ?? 0) + (guru.jabatans?.length ?? 0) || null;

  // jabatanAktifFromGuru & jabatanRows dibutuhkan di luar TabRiwayat untuk badge
  // (computed di TabRiwayat, tapi juga kita hitung disini untuk badge)
  const _jabatanRows =
    (guru.jabatans ?? []).length > 0
      ? guru.jabatans
      : guru.status_kepegawaian
        ? [{}]
        : [];
  const riwayatBadgeFinal =
    (guru.mutasis?.length ?? 0) + _jabatanRows.length || null;

  /* ══════════════════════════════════════════════════════════
     RENDER — struktur 1:1 dengan template HTML
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* ── Page Header & Actions ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight mb-2">
            Profil Lengkap Guru
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-fixed-variant text-xs font-semibold">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  guru.status_keaktifan === "Aktif"
                    ? "bg-success"
                    : "bg-outline"
                }`}
              />
              {guru.status_keaktifan ?? "Aktif"}
            </span>
            <span className="text-sm text-text-secondary font-medium">
              Terakhir diperbarui:{" "}
              {guru.updated_at ? fmtDate(guru.updated_at) : "-"}
            </span>
          </div>
        </div>

        {/* Action buttons — urutan persis template */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={() => navigate("/operator/master/guru")}
            className="px-4 py-2 bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-low rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Kembali
          </button>
          <button
            onClick={() => navigate(`/operator/master/guru/edit/${nuptk}`)}
            className="px-4 py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Profil
          </button>
          <button
            onClick={() => {
              setNuptkBaru(guru.nuptk);
              setShowKoreksiNuptk(true);
            }}
            className="px-4 py-2 bg-surface text-warning border border-warning/30 hover:bg-warning/5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              edit_note
            </span>
            Koreksi NUPTK
          </button>
          <button
            onClick={() => mutasiVerifikasi.mutate()}
            disabled={mutasiVerifikasi.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] font-label-md text-sm font-bold border transition-colors ${
              guru.is_verified
                ? "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                : "bg-success/10 text-success border-success/20 hover:bg-success/20"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {guru.is_verified ? "remove_moderator" : "verified_user"}
            </span>
            {guru.is_verified ? "Batalkan Verifikasi" : "Verifikasi Data"}
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-low rounded-lg transition-colors shadow-sm"
            title="Cetak Profil"
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
          </button>
          <button
            onClick={() =>
              confirm("Nonaktifkan akun guru ini?") &&
              toast("Fitur ini belum tersedia.")
            }
            className="p-2 bg-surface text-danger border border-error-container hover:bg-error-container/20 rounded-lg transition-colors shadow-sm"
            title="Nonaktifkan Akun"
          >
            <span className="material-symbols-outlined text-[20px]">block</span>
          </button>
        </div>
      </div>

      {/* ── Hero Profile Card (Bento Style) — persis template ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Identity Block — lg:col-span-4 */}
        <div className="lg:col-span-4 bg-surface rounded-card p-6 border border-border-light shadow-sm flex flex-col items-center text-center">
          {/* Foto — w-32 h-32 rounded-full, dengan tombol ganti */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-low shadow-sm mb-4 relative">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={namaLengkap}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-secondary-container flex items-center justify-center">
                <span className="text-primary font-bold text-4xl">
                  {guru.nama?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            {/* Camera button — absolute, bottom-right */}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
              title="Ganti foto"
            >
              <span className="material-symbols-outlined text-on-primary text-[16px]">
                photo_camera
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFoto.mutate(file);
              }}
            />
          </div>

          <h2 className="font-section-title text-section-title text-text-primary mb-1">
            {namaLengkap}
          </h2>
          <p className="text-sm text-text-secondary font-medium mb-4">
            {guru.nip ? `NIP. ${guru.nip}` : `NUPTK. ${guru.nuptk}`}
          </p>

          {/* Tabel status — persis template */}
          <div className="w-full flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-center py-2 border-b border-surface-container-high text-sm">
              <span className="text-text-secondary">Status</span>
              <span className="font-semibold text-text-primary">
                {guru.status_kepegawaian ?? "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface-container-high text-sm">
              <span className="text-text-secondary">Peran Utama</span>
              <span className="font-semibold text-text-primary">
                {guru.jenis_ptk ?? "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 text-sm">
              <span className="text-text-secondary">Tugas Tambahan</span>
              <span className="font-semibold text-primary">
                {guru.tugas_tambahan ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics & Contact Block — lg:col-span-8 */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <MetricCard
              icon="schedule"
              iconBg="bg-primary-container/10"
              iconColor="text-primary"
              label="Total Jam Mengajar"
              value={guru.total_jam ?? "—"}
              sub="Jam/Minggu"
            />
            <MetricCard
              icon="school"
              iconBg="bg-secondary-container/30"
              iconColor="text-secondary"
              label="Masa Kerja"
              value={guru.masa_kerja_tahun ?? "—"}
              sub="Tahun"
            />
            <MetricCard
              icon="star"
              iconBg="bg-warning/10"
              iconColor="text-warning"
              label="Nilai PKG (2023)"
              value={guru.nilai_pkg ?? "—"}
              sub={guru.nilai_pkg ? "(Sangat Baik)" : ""}
              subColor="text-success"
            />
          </div>

          {/* Quick Contact Banner */}
          <div className="bg-gradient-to-r from-surface to-surface-container-low rounded-xl p-5 border border-border-light shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
            <div className="flex flex-wrap items-center gap-6">
              {guru.no_hp && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-text-secondary text-[20px]">
                    call
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {guru.no_hp}
                  </span>
                </div>
              )}
              {guru.email && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-text-secondary text-[20px]">
                    mail
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {guru.email}
                  </span>
                </div>
              )}
              {(guru.alamat_jalan || guru.kota_kabupaten) && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-text-secondary text-[20px]">
                    location_on
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {[guru.alamat_jalan, guru.kota_kabupaten]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>
            <button className="p-2 bg-surface border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors shadow-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">
                forum
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs & Detailed Content Area — mt-4 seperti template ── */}
      <div className="bg-surface rounded-card border border-border-light shadow-sm overflow-hidden flex flex-col mt-4">
        {/* Tab Headers (Scrollable on mobile) */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-surface-container-high px-2 pt-2">
          {TABS.map((t) => (
            <TabBtn
              key={t.id}
              active={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              badge={t.id === "riwayat" ? riwayatBadgeFinal : undefined}
            >
              {t.label}
            </TabBtn>
          ))}
        </div>

        {/* Tab Content — p-8 di desktop, dikurangi di mobile */}
        <div className="p-4 sm:p-6 md:p-8">
          {activeTab === "identitas" && (
            <TabIdentitas
              guru={guru}
              onGoToRiwayat={() => setActiveTab("riwayat")}
            />
          )}
          {activeTab === "penugasan" && <TabPenugasan guru={guru} />}
          {activeTab === "pendidikan" && (
            <TabPendidikan nuptk={nuptk} guru={guru} />
          )}
          {activeTab === "keluarga" && <TabKeluarga guru={guru} />}
          {activeTab === "dokumen" && <TabDokumen nuptk={nuptk} />}
          {activeTab === "riwayat" && <TabRiwayat nuptk={nuptk} guru={guru} />}
          {activeTab === "administrasi" && <TabAdministrasi guru={guru} />}
          {activeTab === "akun" && (
            <TabAkunLogin
              akunGuru={akunGuru}
              nuptk={nuptk}
              navigate={navigate}
              toggleActive={toggleActive}
              resetPassword={resetPassword}
              hapusAkun={hapusAkun}
            />
          )}
        </div>
      </div>
      {showKoreksiNuptk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md border border-border-light">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
              <div>
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-warning text-[20px]">
                    edit_note
                  </span>
                  Koreksi NUPTK
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Fitur ini hanya untuk memperbaiki kesalahan input NUPTK.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowKoreksiNuptk(false);
                  setNuptkBaru("");
                  setAlasanKoreksi("");
                }}
                className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Warning */}
              <div className="flex gap-3 p-3 bg-warning/10 border border-warning/20 rounded-xl">
                <span className="material-symbols-outlined text-warning text-[20px] flex-shrink-0 mt-0.5">
                  warning
                </span>
                <p className="text-xs text-warning font-medium">
                  Perubahan NUPTK akan tercatat di log aktivitas dan tidak dapat
                  dibatalkan. Pastikan NUPTK baru sudah benar sebelum menyimpan.
                </p>
              </div>

              {/* NUPTK lama (readonly) */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  NUPTK Saat Ini
                </label>
                <input
                  type="text"
                  value={guru.nuptk}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface-container text-text-secondary font-mono text-sm outline-none"
                />
              </div>

              {/* NUPTK baru */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  NUPTK Baru <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={nuptkBaru}
                  onChange={(e) =>
                    setNuptkBaru(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
                  placeholder="16 digit NUPTK yang benar"
                />
                {nuptkBaru.length > 0 && nuptkBaru.length < 16 && (
                  <p className="text-danger text-xs mt-1">
                    {nuptkBaru.length}/16 digit
                  </p>
                )}
              </div>

              {/* Alasan */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Alasan Koreksi <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={255}
                  value={alasanKoreksi}
                  onChange={(e) => setAlasanKoreksi(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"
                  placeholder="Contoh: Salah input, seharusnya 1234567890123456"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 px-6 py-4 border-t border-border-light">
              <button
                onClick={() => {
                  setShowKoreksiNuptk(false);
                  setNuptkBaru("");
                  setAlasanKoreksi("");
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary hover:bg-surface-container text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (nuptkBaru.length !== 16) {
                    toast.error("NUPTK harus 16 digit.");
                    return;
                  }
                  if (!alasanKoreksi.trim()) {
                    toast.error("Alasan koreksi wajib diisi.");
                    return;
                  }
                  if (nuptkBaru === guru.nuptk) {
                    toast.error("NUPTK baru sama dengan yang lama.");
                    return;
                  }
                  koreksiNuptk.mutate();
                }}
                disabled={koreksiNuptk.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-warning text-white text-sm font-semibold hover:bg-warning/90 transition-colors disabled:opacity-60"
              >
                {koreksiNuptk.isPending ? "Menyimpan..." : "Simpan Koreksi"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* scrollbar-hide CSS — inject sekali */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
