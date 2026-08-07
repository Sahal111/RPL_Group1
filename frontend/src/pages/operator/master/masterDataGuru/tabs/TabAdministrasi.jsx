import { InfoRow, SectionTitle } from "./helpers";

/**
 * TabAdministrasi — Tab 7: Rekening Bank, NPWP, BPJS, Gaji & Tunjangan
 */
export default function TabAdministrasi({ guru }) {
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
