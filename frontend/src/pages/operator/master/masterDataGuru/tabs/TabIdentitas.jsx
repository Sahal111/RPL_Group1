import { InfoRow, SubLabel, SectionTitle, fmtDate } from "./helpers";

/**
 * TabIdentitas — Tab 1: Identitas Pribadi, Kepegawaian & Alamat
 */
export default function TabIdentitas({ guru, onGoToRiwayat }) {
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
            <InfoRow label="No. Karis / Karsu" value={guru.no_karis_karsu} mono />
            <InfoRow
              label="Jenis Kelamin"
              value={guru.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
            />
          </div>
          <div className="space-y-3">
            <InfoRow label="Tempat Lahir" value={guru.tempat_lahir} />
            <InfoRow label="Tanggal Lahir" value={fmtDate(guru.tanggal_lahir)} />
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

      {/* Status Kepegawaian */}
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="work" label="Status Kepegawaian" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
          <div className="space-y-3">
            <InfoRow label="Status Kepegawaian" value={guru.status_kepegawaian} />
            <InfoRow label="Status Keaktifan" value={guru.status_keaktifan} />
            <InfoRow label="Jenis PTK" value={guru.jenis_ptk} />
            <InfoRow label="Tanggal Bergabung" value={fmtDate(guru.tanggal_bergabung)} />
          </div>
          <div className="space-y-3">
            <InfoRow label="TMT PNS / PPPK" value={fmtDate(guru.tmt_pns)} />
            <InfoRow label="TMT GTY" value={fmtDate(guru.tmt_gty)} />
            <InfoRow
              label="Masa Kerja"
              value={guru.masa_kerja_tahun ? `${guru.masa_kerja_tahun} Tahun` : null}
            />
          </div>
        </div>

        {/* Jabatan Aktif — ringkasan */}
        {(guru.jabatan_aktif || guru.jabatanAktif) && (
          <>
            <SubLabel>Jabatan Aktif</SubLabel>
            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/15 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {guru.jabatan_aktif?.jabatan ?? guru.jabatanAktif?.jabatan ?? "-"}
                  </p>
                  {(guru.jabatan_aktif?.golongan ?? guru.jabatanAktif?.golongan) && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      Gol.{" "}
                      {guru.jabatan_aktif?.golongan ?? guru.jabatanAktif?.golongan}
                      {(guru.jabatan_aktif?.pangkat ?? guru.jabatanAktif?.pangkat) &&
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
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
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
          <InfoRow label="RT / RW" value={`${guru.rt ?? "-"} / ${guru.rw ?? "-"}`} />
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
