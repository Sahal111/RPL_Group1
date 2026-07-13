<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\RiwayatKelas;
use App\Models\Siswa;
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

        // Tambah total siswa per kelas
        $kelas->getCollection()->transform(function ($k) {
            $k->total_siswa = SiswaKelas::where('id_kelas', $k->id)
                ->where('status_keluar', 'Aktif')
                ->count();
            return $k;
        });

        return response()->json(['success' => true, 'data' => $kelas]);
    }

    public function show($id)
    {
        $kelas = Kelas::with(['wali'])->findOrFail($id);

        // Ambil tahun ajaran
        $tahunAjaran = DB::table('tahun_ajarans')->find($kelas->tahun_ajaran_id);

        // Ambil daftar siswa aktif di kelas ini
        $siswaList = SiswaKelas::with('siswas')
            ->where('kelas_id', $id)
            ->where('status_keluar', 'Aktif')
            ->orderBy('no_absen')
            ->get();

        // Ambil daftar siswa yang sudah keluar (Lulus, Mutasi Keluar, Dropout, Meninggal)
        $siswaKeluarList = SiswaKelas::with('siswas')
            ->where('kelas_id', $id)
            ->where('status_keluar', '!=', 'Aktif')
            ->orderByDesc('tanggal_keluar')
            ->get();

        return response()->json([
            'success' => true,
            'data' => array_merge($kelas->toArray(), [
                'tahun_ajarans' => $tahunAjaran,
                'total_siswa' => $siswaList->count(),
                'siswas' => $siswaList,
                'siswa_keluar' => $siswaKeluarList,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id' => 'required|string|max:20|unique:kelas,id',
            'id_tahun_ajaran' => 'required|integer|exists:tahun_ajaran,id',
            'nama_kelas' => 'required|string|max:30',
            'tingkat' => 'required|in:1,2,3,4,5,6',
            'semester' => 'required|in:1,2',
            'nuptk_wali' => 'nullable|string|max:16|exists:gurus,nuptk',
            'kurikulum' => 'required|in:Kurikulum 2013,Kurikulum Merdeka',
            'kapasitas' => 'required|integer|min:1|max:50',
            'ruangan' => 'nullable|string|max:50',
        ]);

        $kelas = Kelas::create([
            ...$request->only([
                'id',
                'id_tahun_ajaran',
                'nama_kelas',
                'tingkat',
                'semester',
                'nuptk_wali',
                'kurikulum',
                'kapasitas',
                'ruangan',
            ]),
            'is_active' => 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data kelas berhasil ditambahkan.',
            'data' => $kelas,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $kelas = Kelas::findOrFail($id);

        $request->validate([
            'id_tahun_ajaran' => 'required|integer|exists:tahun_ajaran,id',
            'nama_kelas' => 'required|string|max:30',
            'tingkat' => 'required|in:1,2,3,4,5,6',
            'semester' => 'required|in:1,2',
            'nuptk_wali' => 'nullable|string|max:16|exists:gurus,nuptk',
            'kurikulum' => 'required|in:Kurikulum 2013,Kurikulum Merdeka',
            'kapasitas' => 'required|integer|min:1|max:50',
            'ruangan' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $kelas->update($request->only([
            'id_tahun_ajaran',
            'nama_kelas',
            'tingkat',
            'semester',
            'nuptk_wali',
            'kurikulum',
            'kapasitas',
            'ruangan',
            'is_active',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Data kelas berhasil diperbarui.',
            'data' => $kelas->fresh('wali'),
        ]);
    }

    public function destroy($id)
    {
        $kelas = Kelas::findOrFail($id);

        $adaSiswa = SiswaKelas::where('id_kelas', $id)
            ->where('status_keluar', 'Aktif')
            ->exists();

        if ($adaSiswa) {
            return response()->json([
                'success' => false,
                'message' => 'Kelas masih memiliki siswa aktif. Pindahkan siswa terlebih dahulu.',
            ], 422);
        }

        $kelas->delete();
        return response()->json(['success' => true, 'message' => 'Data kelas berhasil dihapus.']);
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
            ->orderByDesc('tanggal_mulai')
            ->get(['id', 'nama', 'is_active']);

        return response()->json(['success' => true, 'data' => $data]);
    }

    // Tambah siswa ke kelas
    public function tambahSiswa(Request $request, $id)
    {
        $request->validate([
            'nisn' => 'required|string|exists:siswas,nisn',
            'tahun_ajarans' => 'required|string|max:20',
            'semester' => 'required|in:1,2',
            'status_masuk' => 'required|in:Baru,Naik Kelas,Tinggal Kelas,Mutasi Masuk',
        ]);

        Kelas::findOrFail($id);

        $sudahAda = SiswaKelas::where('id_kelas', $id)
            ->where('siswa_id', $request->nisn)
            ->where('status_keluar', 'Aktif')
            ->exists();

        if ($sudahAda) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa sudah terdaftar di kelas ini.',
            ], 422);
        }

        // No. absen otomatis: ambil nomor terbesar yang aktif di kelas ini, lalu +1
        $noAbsenBaru = (SiswaKelas::where('id_kelas', $id)
            ->where('status_keluar', 'Aktif')
            ->max('no_absen') ?? 0) + 1;

        SiswaKelas::create([
            'nisn' => $request->nisn,
            'kelas_id' => $id,
            'no_absen' => $noAbsenBaru,
            'semester' => $request->semester,
            'tahun_ajarans' => $request->tahun_ajaran,
            'status_masuk' => $request->status_masuk,
            'tanggal_masuk' => now()->toDateString(),
            'status_keluar' => 'Aktif',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil ditambahkan ke kelas.',
        ], 201);
    }

    // Keluarkan siswa dari kelas
    public function keluarkanSiswa(Request $request, $id, $siswaKelasId)
    {
        $request->validate([
            'status_keluar' => 'required|in:Naik Kelas,Lulus,Mutasi Keluar,Dropout,Meninggal',
            'alasan_keluar' => 'nullable|string',
        ]);

        $siswaKelas = SiswaKelas::where('id', $siswaKelasId)
            ->where('kelas_id', $id)
            ->firstOrFail();

        $siswaKelas->update([
            'status_keluar' => $request->status_keluar,
            'tanggal_keluar' => now()->toDateString(),
            'alasan_keluar' => $request->alasan_keluar,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil dikeluarkan dari kelas.',
        ]);
    }

    public function batalkanKeluar($id, $siswaKelasId)
    {
        $siswaKelas = SiswaKelas::where('id', $siswaKelasId)
            ->where('kelas_id', $id)
            ->firstOrFail();

        $siswaKelas->update([
            'status_keluar' => 'Aktif',
            'tanggal_keluar' => null,
            'alasan_keluar' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status siswa berhasil dikembalikan ke aktif.',
        ]);
    }
}