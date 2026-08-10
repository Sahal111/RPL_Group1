import { Construction } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

/**
 * ComingSoonDashboard
 *
 * Digunakan untuk role yang sudah ada di sistem tapi modulnya
 * belum diimplementasikan. Menggantikan dashboard dengan
 * hardcoded fake data agar tidak menyesatkan pengguna.
 *
 * @param {string} roleName      - Nama role yang ditampilkan (e.g. "Bendahara")
 * @param {string} description   - Deskripsi singkat fungsi role ini
 * @param {Array}  plannedFeatures - Fitur yang akan dibangun
 * @param {string} accentColor   - Tailwind color class untuk aksen (default: "blue")
 */
export default function ComingSoonDashboard({
  roleName,
  description,
  plannedFeatures = [],
  accentColor = "blue",
}) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          Dashboard {roleName}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Selamat datang, {user?.nama || user?.nama_lengkap || "Pengguna"}
        </p>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center">
          <Construction className="w-8 h-8 text-amber-600" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-amber-800">
            Modul Sedang Dikembangkan
          </h2>
          <p className="text-sm text-amber-700 mt-1 max-w-md leading-relaxed">
            {description}
          </p>
        </div>

        <span className="px-3 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider">
          Coming Soon
        </span>
      </div>

      {/* Planned Features */}
      {plannedFeatures.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
            Fitur yang Akan Tersedia
          </h3>
          <ul className="space-y-3">
            {plannedFeatures.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
              >
                <span className="mt-0.5 w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {feature.name}
                  </p>
                  {feature.desc && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {feature.desc}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
