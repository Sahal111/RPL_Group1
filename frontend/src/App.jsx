import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

// Pages (akan kita buat satu per satu)
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterOrtuPage from "./pages/auth/RegisterOrtuPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Operator
import OperatorLayout from "./pages/operator/OperatorLayout";
import ManajemenAkun from "./pages/operator/ManajemenAkun";
import MasterGuru from "./pages/operator/master/MasterGuru";
import MasterSiswa from "./pages/operator/master/MasterSiswa";
import MasterKelas from "./pages/operator/master/MasterKelas";
import MasterOrtu from "./pages/operator/master/MasterOrtu";
import TahunAjaran from "./pages/operator/master/TahunAjaran";
import ApprovalOrtu from "./pages/operator/ApprovalOrtu";
import DetailGuru from "./pages/operator/master/DetailGuru";
import DetailSiswa from "./pages/operator/master/DetailSiswa";
import DetailKelas from "./pages/operator/master/DetailKelas";
import DetailOrtu from "./pages/operator/master/DetailOrtu";
import NaikKelas from "./pages/operator/master/NaikKelas";
import DetailTahunAjaran from "./pages/operator/master/DetailTahunAjaran";
import MasterMapel from "./pages/operator/master/MasterMapel";
import MasterJadwal from "./pages/operator/master/MasterJadwal";
import PengumumanOperator from "./pages/operator/master/PengumumanOperator";
import DetailDataOrtu from "./pages/operator/master/DetailDataOrtu"; // sesuaikan path import

// Guru
import GuruLayout from "./pages/guru/GuruLayout";
import DashboardGuru from "./pages/guru/DashboardGuru";
import DataSiswaGuru from "./pages/guru/DataSiswaGuru";
import DetailSiswaGuru from "./pages/guru/DetailSiswaGuru";
import InputAbsensi from "./pages/guru/InputAbsensi";
import RiwayatAbsensiSiswaGuru from "./pages/guru/RiwayatAbsensiSiswaGuru";
import RekapAbsensiGuru from "./pages/guru/RekapAbsensiGuru";
import JadwalMengajarGuru from "./pages/guru/JadwalMengajarGuru";
import PengumumanGuru from "./pages/guru/PengumumanGuru";
import ProfilGuru from "./pages/guru/ProfilGuru";

// Kepsek
import KepsekLayout from "./pages/kepsek/KepsekLayout";
import DashboardKepsek from "./pages/kepsek/DashboardKepsek";
import DataGuruKepsek from "./pages/kepsek/DataGuruKepsek";
import DetailGuruKepsek from "./pages/kepsek/DetailGuruKepsek";
import DataSiswaKepsek from "./pages/kepsek/DataSiswaKepsek";
import DetailSiswaKepsek from "./pages/kepsek/DetailSiswaKepsek";
import MonitoringAbsensi from "./pages/kepsek/MonitoringAbsensi";
import PengumumanKepsek from "./pages/kepsek/PengumumanKepsek";
import KalenderAkademik from "./pages/kepsek/KalenderAkademik";
import ProfilKepsek from "./pages/kepsek/ProfilKepsek";

// Ortu
import OrtuLayout from "./pages/ortu/OrtuLayout";
import AbsensiAnak from "./pages/ortu/AbsensiAnak";
import RiwayatAbsensiAnak from "./pages/ortu/RiwayatAbsensiAnak";
import PengumumanOrtu from "./pages/ortu/PengumumanOrtu";
import ProfilOrtu from "./pages/ortu/ProfilOrtu";
import DataAnak from "./pages/ortu/DataAnak";
import TambahAnak from "./pages/ortu/TambahAnak";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-ortu" element={<RegisterOrtuPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Operator */}
      <Route
        path="/operator"
        element={
          <ProtectedRoute roles={["operator"]}>
            <OperatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManajemenAkun />} />
        <Route path="master/guru" element={<MasterGuru />} />
        <Route path="master/siswa" element={<MasterSiswa />} />
        <Route path="master/kelas" element={<MasterKelas />} />
        <Route path="master/ortu" element={<MasterOrtu />} />
        <Route path="master/tahun-ajaran" element={<TahunAjaran />} />
        <Route path="ortu-pending" element={<ApprovalOrtu />} />
        <Route path="master/guru/:nuptk" element={<DetailGuru />} />
        <Route path="master/siswa/:nisn" element={<DetailSiswa />} />
        <Route path="master/kelas/:id" element={<DetailKelas />} />
        <Route path="master/ortu/:id" element={<DetailOrtu />} />
        <Route path="master/naik-kelas" element={<NaikKelas />} />
        <Route path="master/tahun-ajaran/:id" element={<DetailTahunAjaran />} />
        <Route path="master/mapel" element={<MasterMapel />} />
        <Route path="master/jadwal-pelajaran" element={<MasterJadwal />} />
        <Route path="master/pengumuman" element={<PengumumanOperator />} />
        <Route path="master/ortu/keluarga/:id" element={<DetailDataOrtu />} />
      </Route>

      {/* Guru */}
      <Route
        path="/guru"
        element={
          <ProtectedRoute roles={["guru"]}>
            <GuruLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardGuru />} />
        <Route path="siswa" element={<DataSiswaGuru />} />
        <Route path="siswa/:nisn" element={<DetailSiswaGuru />} />
        <Route
          path="siswa/:nisn/riwayat"
          element={<RiwayatAbsensiSiswaGuru />}
        />
        <Route path="absensi" element={<InputAbsensi />} />
        <Route path="rekap-absensi" element={<RekapAbsensiGuru />} />
        <Route path="jadwal" element={<JadwalMengajarGuru />} />
        <Route path="pengumuman" element={<PengumumanGuru />} />
        <Route path="profil" element={<ProfilGuru />} />
      </Route>

      {/* Kepsek */}
      <Route
        path="/kepsek"
        element={
          <ProtectedRoute roles={["kepsek"]}>
            <KepsekLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardKepsek />} />
        <Route path="monitoring-absensi" element={<MonitoringAbsensi />} />
        <Route path="guru" element={<DataGuruKepsek />} />
        <Route path="guru/:nuptk" element={<DetailGuruKepsek />} />
        <Route path="siswa" element={<DataSiswaKepsek />} />
        <Route path="siswa/:nisn" element={<DetailSiswaKepsek />} />
        <Route path="pengumuman" element={<PengumumanKepsek />} />
        <Route path="kalender" element={<KalenderAkademik />} />
        <Route path="profil" element={<ProfilKepsek />} />
      </Route>

      {/* Ortu */}
      <Route
        path="/ortu"
        element={
          <ProtectedRoute roles={["ortu"]}>
            <OrtuLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AbsensiAnak />} />
        <Route path="riwayat-absensi" element={<RiwayatAbsensiAnak />} />
        <Route path="pengumuman" element={<PengumumanOrtu />} />
        <Route path="data-anak" element={<DataAnak />} />
        <Route path="tambah-anak" element={<TambahAnak />} />
        <Route path="profil" element={<ProfilOrtu />} />
      </Route>
    </Routes>
  );
}
