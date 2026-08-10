import { DollarSign, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { useKeuanganDashboard } from "../../../hooks/api/useKeuangan";

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-start shadow-sm">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function formatRp(val) {
  if (!val && val !== 0) return "–";
  return "Rp " + Number(val).toLocaleString("id-ID");
}

export default function DashboardKeuangan() {
  const { data, isLoading } = useKeuanganDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Dashboard Keuangan</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Ringkasan keuangan sekolah bulan ini
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total Tagihan"
          value={formatRp(data?.total_tagihan)}
          sub={`${data?.jumlah_tagihan ?? 0} tagihan`}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Sudah Dibayar"
          value={formatRp(data?.total_terbayar)}
          sub={`${data?.jumlah_lunas ?? 0} lunas`}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={AlertCircle}
          label="Tunggakan"
          value={formatRp(data?.total_tunggakan)}
          sub={`${data?.jumlah_belum_lunas ?? 0} siswa`}
          color="bg-red-50 text-red-600"
        />
        <StatCard
          icon={DollarSign}
          label="Pembayaran Bulan Ini"
          value={formatRp(data?.pembayaran_bulan_ini)}
          sub={`${data?.jumlah_pembayaran_bulan_ini ?? 0} transaksi`}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {data?.tunggakan_terbaru?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">
              Siswa dengan Tunggakan Terbesar
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.tunggakan_terbesar.slice(0, 5).map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.nama_siswa}
                  </p>
                  <p className="text-xs text-gray-400">{item.kelas}</p>
                </div>
                <span className="text-sm font-semibold text-red-600">
                  {formatRp(item.total_tunggakan)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
