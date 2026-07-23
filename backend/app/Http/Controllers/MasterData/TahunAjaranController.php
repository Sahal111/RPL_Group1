<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\TahunAjaran;
use App\Models\Kelas;
use App\Models\RiwayatKelas;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TahunAjaranController extends Controller
{
    public function index()
    {
        $data = TahunAjaran::with('semesters')->orderByDesc('tahun')->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function show($id)
    {
        $tahunAjaran = TahunAjaran::with('semesters')->findOrFail($id);

        // Alias fields agar frontend bisa pakai ta.nama, ta.tanggal_mulai, ta.tanggal_selesai
        $ganjil = $tahunAjaran->semesters->firstWhere('nama', 'Ganjil');
        $genap = $tahunAjaran->semesters->firstWhere('nama', 'Genap');

        $tahunAjaran->nama = $tahunAjaran->tahun;
        $tahunAjaran->tanggal_mulai = $ganjil?->tgl_mulai;
        $tahunAjaran->tanggal_selesai = $genap?->tgl_selesai ?? $ganjil?->tgl_selesai;
        $tahunAjaran->semester_aktif = $tahunAjaran->semesters->firstWhere('is_active', true)?->nama ?? null;

        // Ambil semua kelas pada tahun ajaran ini beserta wali kelas dan semester
        $kelasList = Kelas::with(['wali:id,nuptk,nama', 'semester:id,nama'])
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
                    'semester' => $k->semester?->nama ?? '-',
                    'kurikulum' => $k->kurikulum,
                    'kapasitas' => $k->kapasitas,
                    'ruangan' => $k->ruangan,
                    'is_active' => $k->is_active,
                    'nama_wali' => $k->wali?->nama ?? '-',
                    'total_siswa' => $totalSiswa,
                ];
            });

        // Hitung distribusi per tingkat untuk stat card
        $distribusiTingkat = $kelasList->groupBy('tingkat')->map(function ($group, $tingkat) {
            return [
                'tingkat' => $tingkat,
                'jumlah_kelas' => $group->count(),
                'jumlah_siswa' => $group->sum('total_siswa'),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $tahunAjaran,
            'kelas' => $kelasList,
            'total_kelas' => $kelasList->count(),
            'total_siswa' => $kelasList->sum('total_siswa'),
            'distribusi_tingkat' => $distribusiTingkat,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tahun' => 'required|string|max:9|unique:tahun_ajarans,tahun',
            'is_active' => 'nullable|boolean',
            'buat_semester' => 'nullable|boolean',
            'semester_ganjil_mulai' => 'nullable|date',
            'semester_ganjil_selesai' => 'nullable|date',
            'semester_genap_mulai' => 'nullable|date',
            'semester_genap_selesai' => 'nullable|date',
            'semester_aktif' => 'nullable|string|in:Ganjil,Genap',
        ]);

        DB::beginTransaction();
        try {
            if ($request->is_active) {
                TahunAjaran::query()->update(['is_active' => false]);
            }

            $tahunAjaran = TahunAjaran::create([
                'tahun' => $request->tahun,
                'is_active' => $request->is_active ?? false,
            ]);

            if ($request->buat_semester) {
                if ($request->semester_aktif) {
                    Semester::query()->update(['is_active' => false]);
                }

                Semester::create([
                    'tahun_ajaran_id' => $tahunAjaran->id,
                    'nama' => 'Ganjil',
                    'tgl_mulai' => $request->semester_ganjil_mulai,
                    'tgl_selesai' => $request->semester_ganjil_selesai,
                    'is_active' => ($request->is_active && $request->semester_aktif === 'Ganjil'),
                ]);

                Semester::create([
                    'tahun_ajaran_id' => $tahunAjaran->id,
                    'nama' => 'Genap',
                    'tgl_mulai' => $request->semester_genap_mulai,
                    'tgl_selesai' => $request->semester_genap_selesai,
                    'is_active' => ($request->is_active && $request->semester_aktif === 'Genap'),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tahun ajaran berhasil ditambahkan.',
                'data' => $tahunAjaran->load('semesters'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $tahunAjaran = TahunAjaran::findOrFail($id);

        $request->validate([
            'tahun' => 'required|string|max:9|unique:tahun_ajarans,tahun,' . $id,
            'is_active' => 'nullable|boolean',
            'buat_semester' => 'nullable|boolean',
            'semester_ganjil_mulai' => 'nullable|date',
            'semester_ganjil_selesai' => 'nullable|date',
            'semester_genap_mulai' => 'nullable|date',
            'semester_genap_selesai' => 'nullable|date',
            'semester_aktif' => 'nullable|string|in:Ganjil,Genap',
        ]);

        DB::beginTransaction();
        try {
            if ($request->is_active && !$tahunAjaran->is_active) {
                TahunAjaran::query()->update(['is_active' => false]);
            }

            $tahunAjaran->update([
                'tahun' => $request->tahun,
                'is_active' => $request->is_active ?? $tahunAjaran->is_active,
            ]);

            if ($request->buat_semester) {
                if ($request->semester_aktif && $request->is_active) {
                    Semester::query()->update(['is_active' => false]);
                }

                Semester::updateOrCreate(
                    ['tahun_ajaran_id' => $tahunAjaran->id, 'nama' => 'Ganjil'],
                    [
                        'tgl_mulai' => $request->semester_ganjil_mulai,
                        'tgl_selesai' => $request->semester_ganjil_selesai,
                        'is_active' => ($request->is_active && $request->semester_aktif === 'Ganjil') ? true : DB::raw('is_active'),
                    ]
                );

                Semester::updateOrCreate(
                    ['tahun_ajaran_id' => $tahunAjaran->id, 'nama' => 'Genap'],
                    [
                        'tgl_mulai' => $request->semester_genap_mulai,
                        'tgl_selesai' => $request->semester_genap_selesai,
                        'is_active' => ($request->is_active && $request->semester_aktif === 'Genap') ? true : DB::raw('is_active'),
                    ]
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tahun ajaran berhasil diperbarui.',
                'data' => $tahunAjaran->load('semesters'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function setAktif($id)
    {
        // Non-aktifkan semua tahun ajaran & semester
        TahunAjaran::query()->update(['is_active' => false]);
        Semester::query()->update(['is_active' => false]);

        // Aktifkan tahun ajaran yang dipilih
        $tahunAjaran = TahunAjaran::findOrFail($id);
        $tahunAjaran->update(['is_active' => true]);

        // Aktifkan semester Ganjil secara default
        Semester::where('tahun_ajaran_id', $id)
            ->where('nama', 'Ganjil')
            ->update(['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Tahun ajaran aktif berhasil diubah.',
            'data' => $tahunAjaran->load('semesters'),
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