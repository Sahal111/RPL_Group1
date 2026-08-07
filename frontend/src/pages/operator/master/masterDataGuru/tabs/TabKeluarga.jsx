import { InfoRow, SubLabel, SectionTitle, fmtDate } from "./helpers";

/**
 * TabKeluarga — Tab 4: Data Keluarga & Kontak Darurat
 */
export default function TabKeluarga({ guru }) {
  const keluarga = guru.keluarga ?? {};
  const anaks = guru.anaks ?? [];
  const kontaks = guru.kontak_darurat ?? [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[16px] border border-outline-variant/30 shadow-sm p-6">
        <SectionTitle icon="family_restroom" label="Data Keluarga" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
          <InfoRow label="Status Perkawinan" value={keluarga.status_perkawinan} />
          <InfoRow label="Nama Pasangan" value={keluarga.nama_pasangan} />
          <InfoRow label="NIK Pasangan" value={keluarga.nik_pasangan} mono />
          <InfoRow label="Pekerjaan Pasangan" value={keluarga.pekerjaan_pasangan} />
          <InfoRow label="Jumlah Anak" value={keluarga.jumlah_anak} />
        </div>
        {anaks.length > 0 && (
          <>
            <SubLabel>Data Anak</SubLabel>
            <div className="space-y-3">
              {anaks.map((a, i) => (
                <div key={i} className="p-4 bg-surface-container-low rounded-xl border border-border-light">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{a.nama}</span>
                    <span className="text-xs text-text-secondary">
                      {a.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </span>
                  </div>
                  {a.tanggal_lahir && (
                    <p className="text-xs text-text-secondary mt-1">{fmtDate(a.tanggal_lahir)}</p>
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
          <p className="text-sm text-text-secondary text-center py-8">Belum ada kontak darurat.</p>
        ) : (
          <div className="space-y-3">
            {kontaks.map((k, i) => (
              <div key={i} className="p-4 bg-surface-container-low rounded-xl border border-border-light">
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
