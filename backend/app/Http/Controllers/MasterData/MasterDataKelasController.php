<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\RiwayatKelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MasterDataKelasController extends Controller
{
    public function index(Request $request)
    {
        $kelas = Kelas::with('wali')
            ->when($request->tingkat, fn($q) => $q->where('tingkat', $request->tingkat))
            ->when($request->search, fn($q) => $q->where('nama_kelas', 'like', "%{$request->search}%"))
            ->orderBy('tingkat')->orderBy('nama_kelas')
            ->paginate(15);

        $kelas->getCollection()->transform(function ($k) {
            $k->total_siswa = RiwayatKelas::where('kelas_id', $k->id)
                ->aktif()
                ->count();
            return $k;
        });

        return response()->json(['success' => true, 'data' => $kelas]);
    }

    public function show($id)
    {
        $kelas = Kelas::with('wali')->findOrFail($id);

        $siswaAktif = RiwayatKelas::with('siswa')
            ->where('kelas_id', $id)
            ->aktif()
            ->orderBy('no_absen')
            ->get();

        $siswaKeluar = RiwayatKelas::with('siswa')
            ->where('kelas_id', $id)
            ->whereNotNull('tanggal_keluar')
            ->orderByDesc('tanggal_keluar')
            ->get();

        return response()->json([
            'success' => true,
            'data' => array_merge($kelas->toArray(), [
                'total_siswa' => $siswaAktif->count(),
                'siswas' => $siswaAktif,
                'siswa_keluar' => $siswaKeluar,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $tahunAjaranAktif = \App\Models\TahunAjaran::where('is_active', true)->first();
        $semesterAktif = \App\Models\Semester::where('is_active', true)->first();

        if (!$request->tahun_ajaran_id && !$tahunAjaranAktif) {
            return response()->json([
                'success' => false,
                'message' => 'Belum ada Tahun Ajaran aktif. Silakan aktifkan Tahun Ajaran terlebih dahulu.',
            ], 422);
        }

        $request->validate([
            'tahun_ajaran_id' => 'nullable|integer|exists:tahun_ajarans,id',
            'semester_id' => 'nullable|integer|exists:semesters,id',
            'nama_kelas' => 'required|string|max:20',
            'tingkat' => 'required|integer|in:1,2,3,4,5,6',
            'kurikulum' => 'required|string|max:50',
            'wali_kelas_id' => 'nullable|integer|exists:gurus,id',
            'kapasitas' => 'required|integer|min:1|max:60',
            'ruangan' => 'nullable|string|max:50',
        ]);

        $kelas = Kelas::create([
            'tahun_ajaran_id' => $request->tahun_ajaran_id ?? $tahunAjaranAktif->id,
            'semester_id' => $request->semester_id ?? $semesterAktif?->id,
            'nama_kelas' => $request->nama_kelas,
            'tingkat' => $request->tingkat,
            'kurikulum' => $request->kurikulum,
            'wali_kelas_id' => $request->wali_kelas_id,
            'kapasitas' => $request->kapasitas,
            'ruangan' => $request->ruangan,
            'is_active' => 1,
        ]);

        return response()->json(['success' => true, 'message' => 'Kelas berhasil ditambahkan.', 'data' => $kelas], 201);
    }

    public function update(Request $request, $id)
    {
        $kelas = Kelas::findOrFail($id);

        $request->validate([
            'tahun_ajaran_id' => 'nullable|integer|exists:tahun_ajarans,id',
            'semester_id' => 'nullable|integer|exists:semesters,id',
            'nama_kelas' => 'required|string|max:20',
            'tingkat' => 'required|integer|in:1,2,3,4,5,6',
            'kurikulum' => 'required|string|max:50',
            'wali_kelas_id' => 'nullable|integer|exists:gurus,id',
            'kapasitas' => 'required|integer|min:1|max:60',
            'ruangan' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $kelas->update(array_filter([
            'tahun_ajaran_id' => $request->tahun_ajaran_id ?? $kelas->tahun_ajaran_id,
            'semester_id' => $request->semester_id ?? $kelas->semester_id,
            'nama_kelas' => $request->nama_kelas,
            'tingkat' => $request->tingkat,
            'kurikulum' => $request->kurikulum,
            'wali_kelas_id' => $request->has('wali_kelas_id') ? $request->wali_kelas_id : $kelas->wali_kelas_id,
            'kapasitas' => $request->kapasitas,
            'ruangan' => $request->ruangan,
            'is_active' => $request->has('is_active') ? $request->is_active : $kelas->is_active,
        ], fn($v) => !is_null($v)));

        return response()->json(['success' => true, 'message' => 'Kelas berhasil diperbarui.', 'data' => $kelas->fresh('wali')]);
    }

    public function destroy($id)
    {
        $kelas = Kelas::findOrFail($id);

        $adaSiswa = RiwayatKelas::where('kelas_id', $id)->aktif()->exists();
        if ($adaSiswa) {
            return response()->json(['success' => false, 'message' => 'Kelas masih memiliki siswa aktif.'], 422);
        }

        $kelas->delete();
        return response()->json(['success' => true, 'message' => 'Kelas berhasil dihapus.']);
    }

    public function dropdown()
    {
        $kelas = Kelas::where('is_active', 1)
            ->orderBy('tingkat')->orderBy('nama_kelas')
            ->get(['id', 'nama_kelas', 'tingkat']);

        return response()->json(['success' => true, 'data' => $kelas]);
    }

    public function tahunAjaranDropdown()
    {
        $data = DB::table('tahun_ajarans')
            ->orderByDesc('is_active')
            ->orderByDesc('id')
            ->get(['id', 'tahun', 'is_active']);

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function tambahSiswa(Request $request, $id)
    {
        $request->validate([
            'siswa_id' => 'required|integer|exists:siswas,id',
            'jenis_perubahan' => 'required|in:masuk_baru,naik_kelas,mutasi_masuk',
        ]);

        Kelas::findOrFail($id);

        $sudahAda = RiwayatKelas::where('kelas_id', $id)
            ->where('siswa_id', $request->siswa_id)
            ->aktif()->exists();

        if ($sudahAda) {
            return response()->json(['success' => false, 'message' => 'Siswa sudah terdaftar di kelas ini.'], 422);
        }

        $noAbsen = (RiwayatKelas::where('kelas_id', $id)->aktif()->max('no_absen') ?? 0) + 1;

        $kelas = Kelas::find($id);
        RiwayatKelas::create([
            'siswa_id' => $request->siswa_id,
            'kelas_id' => $id,
            'nama_kelas_snapshot' => $kelas->nama_kelas,
            'tahun_ajaran_id' => $kelas->tahun_ajaran_id,
            'semester_id' => $kelas->semester_id,
            'no_absen' => $noAbsen,
            'tanggal_masuk' => now()->toDateString(),
            'jenis_perubahan' => $request->jenis_perubahan,
        ]);

        return response()->json(['success' => true, 'message' => 'Siswa berhasil ditambahkan ke kelas.'], 201);
    }

    public function keluarkanSiswa(Request $request, $id, $riwayatId)
    {
        $request->validate([
            'jenis_perubahan' => 'required|in:lulus,mutasi_keluar,nonaktif,meninggal',
            'catatan' => 'nullable|string',
        ]);

        $riwayat = RiwayatKelas::where('id', $riwayatId)->where('kelas_id', $id)->firstOrFail();

        $riwayat->update([
            'tanggal_keluar' => now()->toDateString(),
            'jenis_perubahan' => $request->jenis_perubahan,
            'catatan' => $request->catatan,
        ]);

        return response()->json(['success' => true, 'message' => 'Siswa berhasil dikeluarkan dari kelas.']);
    }

    public function batalkanKeluar($id, $riwayatId)
    {
        $riwayat = RiwayatKelas::where('id', $riwayatId)->where('kelas_id', $id)->firstOrFail();

        $riwayat->update([
            'tanggal_keluar' => null,
            'jenis_perubahan' => 'masuk_kembali',
            'catatan' => null,
        ]);

        return response()->json(['success' => true, 'message' => 'Status siswa dikembalikan ke aktif.']);
    }
}