<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\TahunAjaran;
use App\Models\Kelas;
use App\Models\RiwayatKelas;
use Illuminate\Http\Request;

class TahunAjaranController extends Controller
{
    public function index()
    {
        $data = TahunAjaran::orderByDesc('tahun')->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function show($id)
    {
        $tahunAjaran = TahunAjaran::findOrFail($id);

        // Ambil semua kelas pada tahun ajaran ini beserta wali kelas
        $kelasList = Kelas::with(['wali:id,nuptk,nama'])
            ->where('tahun_ajaran_id', $id)
            ->orderBy('tingkat')
            ->orderBy('nama_kelas')
            ->get()
            ->map(function ($k) {
                $totalSiswa = RiwayatKelas::where('kelas_id', $k->id)
                    ->whereNull('tanggal_keluar')
                    ->count();

                return [
                    'id' => $k->id,
                    'nama_kelas' => $k->nama_kelas,
                    'tingkat' => $k->tingkat,
                    'kurikulum' => $k->kurikulum,
                    'kapasitas' => $k->kapasitas,
                    'ruangan' => $k->ruangan,
                    'is_active' => $k->is_active,
                    'nama_wali' => $k->wali?->nama ?? '-',
                    'total_siswa' => $totalSiswa,
                ];
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
            'tahun' => 'required|string|max:9|unique:tahun_ajarans,tahun',
        ]);

        $tahunAjaran = TahunAjaran::create([
            'tahun' => $request->tahun,
            'is_active' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tahun ajaran berhasil ditambahkan.',
            'data' => $tahunAjaran,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tahunAjaran = TahunAjaran::findOrFail($id);

        $request->validate([
            'tahun' => 'required|string|max:9|unique:tahun_ajarans,tahun,' . $id,
        ]);

        $tahunAjaran->update([
            'tahun' => $request->tahun,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tahun ajaran berhasil diperbarui.',
            'data' => $tahunAjaran,
        ]);
    }

    public function setAktif($id)
    {
        // Non-aktifkan semua dulu
        TahunAjaran::query()->update(['is_active' => false]);
        
        // Aktifkan yang dipilih
        $tahunAjaran = TahunAjaran::findOrFail($id);
        $tahunAjaran->update(['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Tahun ajaran aktif berhasil diubah.',
            'data' => $tahunAjaran,
        ]);
    }

    public function destroy($id)
    {
        $tahunAjaran = TahunAjaran::findOrFail($id);

        // Cek apakah ada kelas yang pakai tahun ajaran ini
        $adaKelas = Kelas::where('tahun_ajaran_id', $id)->exists();
        
        if ($adaKelas) {
            return response()->json([
                'success' => false,
                'message' => 'Tahun ajaran ini sudah dipakai oleh kelas. Hapus kelas terlebih dahulu.',
            ], 422);
        }

        $tahunAjaran->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tahun ajaran berhasil dihapus.',
        ]);
    }
}