import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8001";

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
function TabIdentitas({ guru }) {
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
        <SubLabel>SK Pengangkatan</SubLabel>
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
        </div>
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
function TabPendidikan({ guru }) {
  const pendidikans = guru.pendidikans ?? [];
  const sertifikasis = guru.sertifikasis ?? [];
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="school" label="Riwayat Pendidikan" />
        {pendidikans.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            Belum ada data pendidikan.
          </p>
        ) : (
          <div className="space-y-4">
            {pendidikans.map((p, i) => (
              <div
                key={i}
                className="p-4 bg-surface-container-low rounded-xl border border-border-light"
              >
                <p className="font-semibold text-text-primary">
                  {p.jenjang} — {p.nama_institusi}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  {p.jurusan} · {p.tahun_lulus}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="workspace_premium" label="Sertifikasi" />
        {sertifikasis.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            Belum ada data sertifikasi.
          </p>
        ) : (
          <div className="space-y-3">
            {sertifikasis.map((s, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-border-light"
              >
                <span className="text-sm font-medium">{s.nama}</span>
                <span className="text-xs text-text-secondary">
                  {fmtDate(s.tanggal)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
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
function TabDokumen({ guru }) {
  const dokumens = guru.dokumens ?? [];
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="folder_open" label="Dokumen Guru" />
        {dokumens.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            Belum ada dokumen yang diunggah.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dokumens.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-border-light"
              >
                <span className="material-symbols-outlined text-primary text-[28px]">
                  description
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {d.nama_dokumen ?? d.jenis_dokumen}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {fmtDate(d.created_at)}
                  </p>
                </div>
                <a
                  href={`${BASE_URL}/storage/${d.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    download
                  </span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB 6 — Riwayat
   ══════════════════════════════════════════════════════════ */
function TabRiwayat({ guru }) {
  const mutasis = guru.mutasis ?? [];
  const jabatans = guru.jabatans ?? [];
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="swap_horiz" label="Riwayat Mutasi" />
        {mutasis.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            Belum ada riwayat mutasi.
          </p>
        ) : (
          <div className="space-y-3">
            {mutasis.map((m, i) => (
              <div
                key={i}
                className="p-4 bg-surface-container-low rounded-xl border border-border-light"
              >
                <p className="font-medium text-sm">{m.keterangan}</p>
                <p className="text-xs text-text-secondary mt-1">
                  {fmtDate(m.tanggal)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="work_history" label="Riwayat Jabatan" />
        {jabatans.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            Belum ada riwayat jabatan.
          </p>
        ) : (
          <div className="space-y-3">
            {jabatans.map((j, i) => (
              <div
                key={i}
                className="p-4 bg-surface-container-low rounded-xl border border-border-light"
              >
                <p className="font-medium text-sm">{j.nama_jabatan}</p>
                <p className="text-xs text-text-secondary mt-1">
                  {fmtDate(j.tmt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
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
   TABS CONFIG
   ══════════════════════════════════════════════════════════ */
const TABS = [
  { id: "identitas", label: "Identitas & Kepegawaian" },
  { id: "penugasan", label: "Penugasan & Kompetensi" },
  { id: "pendidikan", label: "Pendidikan & Sertifikasi" },
  { id: "keluarga", label: "Keluarga & Kontak" },
  { id: "dokumen", label: "Dokumen" },
  { id: "riwayat", label: "Riwayat" },
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
              badge={t.id === "riwayat" ? riwayatBadge : undefined}
            >
              {t.label}
            </TabBtn>
          ))}
        </div>

        {/* Tab Content — p-8 di desktop, dikurangi di mobile */}
        <div className="p-4 sm:p-6 md:p-8">
          {activeTab === "identitas" && <TabIdentitas guru={guru} />}
          {activeTab === "penugasan" && <TabPenugasan guru={guru} />}
          {activeTab === "pendidikan" && <TabPendidikan guru={guru} />}
          {activeTab === "keluarga" && <TabKeluarga guru={guru} />}
          {activeTab === "dokumen" && <TabDokumen guru={guru} />}
          {activeTab === "riwayat" && <TabRiwayat guru={guru} />}
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
