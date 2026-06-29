<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TahunAjaranController extends Controller
{
    public function index()
    {
        $data = DB::table('tahun_ajaran')
            ->orderByDesc('tanggal_mulai')
            ->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function show($id)
    {
        $tahunAjaran = DB::table('tahun_ajaran')->find($id);

        if (!$tahunAjaran) {
            return response()->json(['success' => false, 'message' => 'Tahun ajaran tidak ditemukan.'], 404);
        }

        // Ambil semua kelas pada tahun ajaran ini beserta wali kelas
        $kelasList = DB::table('kelas')
            ->leftJoin('guru', 'kelas.nuptk_wali', '=', 'guru.nuptk')
            ->where('kelas.id_tahun_ajaran', $id)
            ->orderBy('kelas.tingkat')
            ->orderBy('kelas.nama_kelas')
            ->get([
                'kelas.id',
                'kelas.nama_kelas',
                'kelas.tingkat',
                'kelas.semester',
                'kelas.kurikulum',
                'kelas.kapasitas',
                'kelas.ruangan',
                'kelas.is_active',
                'guru.nama_lengkap as nama_wali',
            ])
            ->map(function ($k) {
                $k->total_siswa = DB::table('siswa_kelas')
                    ->where('id_kelas', $k->id)
                    ->where('status_keluar', 'Aktif')
                    ->count();
                return $k;
            });

        return response()->json([
            'success'      => true,
            'data'         => $tahunAjaran,
            'kelas'        => $kelasList,
            'total_kelas'  => $kelasList->count(),
            'total_siswa'  => $kelasList->sum('total_siswa'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:20',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
        ]);

        $id = DB::table('tahun_ajaran')->insertGetId([
            'nama' => $request->nama,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'is_active' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tahun ajaran berhasil ditambahkan.',
            'data' => DB::table('tahun_ajaran')->find($id),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:20',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
        ]);

        DB::table('tahun_ajaran')->where('id', $id)->update([
            'nama' => $request->nama,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tahun ajaran berhasil diperbarui.',
        ]);
    }

    public function setAktif($id)
    {
        // Non-aktifkan semua dulu
        DB::table('tahun_ajaran')->update(['is_active' => 0]);
        // Aktifkan yang dipilih
        DB::table('tahun_ajaran')->where('id', $id)->update(['is_active' => 1]);

        return response()->json([
            'success' => true,
            'message' => 'Tahun ajaran aktif berhasil diubah.',
        ]);
    }

    public function destroy($id)
    {
        // Cek apakah ada kelas yang pakai tahun ajaran ini
        $adaKelas = DB::table('kelas')->where('id_tahun_ajaran', $id)->exists();
        if ($adaKelas) {
            return response()->json([
                'success' => false,
                'message' => 'Tahun ajaran ini sudah dipakai oleh kelas. Hapus kelas terlebih dahulu.',
            ], 422);
        }

        DB::table('tahun_ajaran')->where('id', $id)->delete();

        return response()->json(['success' => true, 'message' => 'Tahun ajaran berhasil dihapus.']);
    }
}