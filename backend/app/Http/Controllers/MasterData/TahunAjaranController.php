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

        $ganjil = $tahunAjaran->semesters->firstWhere('nama', 'Ganjil');
        $genap = $tahunAjaran->semesters->firstWhere('nama', 'Genap');

        $tahunAjaran->nama = $tahunAjaran->tahun;
        $tahunAjaran->tanggal_mulai = $ganjil?->tgl_mulai;
        $tahunAjaran->tanggal_selesai = $genap?->tgl_selesai ?? $ganjil?->tgl_selesai;
        $tahunAjaran->semester_aktif = $tahunAjaran->semesters->firstWhere('is_active', true)?->nama ?? null;

        // ── Otoritas Tanda Tangan ──
        $tahunAjaran->kepsek_nama = \App\Models\Pengaturan::where('key', 'kepala_madrasah')->value('value') ?? '';
        $tahunAjaran->kepsek_nip = \App\Models\Pengaturan::where('key', 'nip_kepala_madrasah')->value('value') ?? '';

        // ── Hari Libur dari kalender_akademiks ──
        $totalHariLibur = \App\Models\KalenderAkademik::where('tahun_ajaran_id', $id)
            ->where('jenis', 'libur')
            ->get()
            ->sum(function ($k) {
                $mulai = \Carbon\Carbon::parse($k->tanggal_mulai);
                $selesai = $k->tanggal_selesai
                    ? \Carbon\Carbon::parse($k->tanggal_selesai)
                    : $mulai;
                return $mulai->diffInDays($selesai) + 1;
            });
        $tahunAjaran->total_hari_libur = $totalHariLibur;

        // ── Status Tutup Buku ──
        $sudahNaikKelas = \App\Models\RiwayatKelas::where('tahun_ajaran_id', $id)
            ->where('jenis_perubahan', 'naik_kelas')
            ->exists();
        $tahunAjaran->is_tutup_buku = $sudahNaikKelas;
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

        // ── Stats tambahan ──────────────────────────────────────
        $semesterIds = $tahunAjaran->semesters->pluck('id');

        $totalGuruMengajar = \App\Models\PlotGuruMapel::where('tahun_ajaran_id', $id)
            ->where('is_active', true)
            ->distinct('guru_id')->count('guru_id');

        $totalMapel = \App\Models\PlotGuruMapel::where('tahun_ajaran_id', $id)
            ->where('is_active', true)
            ->distinct('mapel_id')->count('mapel_id');

        $totalWaliKelas = $kelasList->filter(fn($k) => $k['nama_wali'] !== '-')->count();

        $totalRuangan = $kelasList->filter(fn($k) => !empty($k['ruangan']))->pluck('ruangan')->unique()->count();

        $totalJadwal = \App\Models\JadwalPelajaran::whereIn('semester_id', $semesterIds)
            ->where('is_active', true)->count();

        // ── Hari libur & efektif ──────────────────────────────
        $totalHariLibur = \App\Models\KalenderAkademik::where('tahun_ajaran_id', $id)
            ->where('jenis', 'libur')
            ->get()
            ->sum(function ($k) {
                $mulai = \Carbon\Carbon::parse($k->tanggal_mulai);
                $selesai = $k->tanggal_selesai ? \Carbon\Carbon::parse($k->tanggal_selesai) : $mulai;
                return $mulai->diffInDays($selesai) + 1;
            });

        $tglMulai = $ganjil?->tgl_mulai;
        $tglSelesai = $genap?->tgl_selesai ?? $ganjil?->tgl_selesai;
        $hariTotal = ($tglMulai && $tglSelesai)
            ? (int) \Carbon\Carbon::parse($tglMulai)->diffInDays(\Carbon\Carbon::parse($tglSelesai))
            : null;
        $hariEfektif = $hariTotal !== null ? max(0, $hariTotal - $totalHariLibur) : null;

        // ── Kepsek ────────────────────────────────────────────
        $kepsekNama = \App\Models\Pengaturan::where('key', 'kepala_madrasah')->value('value') ?? '';
        $kepsekNip = \App\Models\Pengaturan::where('key', 'nip_kepala_madrasah')->value('value') ?? '';

        // ── Tutup buku ────────────────────────────────────────
        $sudahNaikKelas = \App\Models\RiwayatKelas::where('tahun_ajaran_id', $id)
            ->where('jenis_perubahan', 'naik_kelas')->exists();

        // ── Kalender akademik ─────────────────────────────────
        $kalender = \App\Models\KalenderAkademik::where('tahun_ajaran_id', $id)
            ->orderBy('tanggal_mulai')
            ->get(['id', 'judul', 'jenis', 'tanggal_mulai', 'tanggal_selesai', 'is_nasional']);

        // ── Aktivitas terbaru ─────────────────────────────────
        $aktivitas = \App\Models\ActivityLog::with('user:id,username')
            ->where('module', 'tahun_ajaran')
            ->where('subject_id', $id)
            ->latest()
            ->take(8)
            ->get(['id', 'user_id', 'action', 'keterangan', 'created_at']);

        // ── Navigasi TA sebelum & sesudah ────────────────────
        $allTA = TahunAjaran::orderBy('tahun')->pluck('tahun', 'id');
        $taIds = $allTA->keys()->values();
        $currentIndex = $taIds->search($tahunAjaran->id);
        $taPrev = $currentIndex > 0 ? TahunAjaran::find($taIds[$currentIndex - 1], ['id', 'tahun', 'is_active']) : null;
        $taNext = ($currentIndex !== false && $currentIndex < $taIds->count() - 1)
            ? TahunAjaran::find($taIds[$currentIndex + 1], ['id', 'tahun', 'is_active']) : null;

        // ── Checklist kesiapan ───────────────────────────────
        $checklist = [
            'ta_dibuat' => true,
            'semester_dibuat' => $tahunAjaran->semesters->count() >= 2,
            'rombel_dibuat' => $kelasList->count() > 0,
            'guru_mengajar' => $totalGuruMengajar > 0,
            'mapel_lengkap' => $totalMapel > 0,
            'wali_kelas' => $totalWaliKelas > 0,
            'jadwal_selesai' => $totalJadwal > 0,
            'kalender' => $kalender->count() > 0,
            'siswa_terdistribusi' => $kelasList->sum('total_siswa') > 0,
            'kepsek_dikunci' => !empty($kepsekNama),
        ];

        // ── Append ke objek tahunAjaran ───────────────────────
        $tahunAjaran->kepsek_nama = $kepsekNama;
        $tahunAjaran->kepsek_nip = $kepsekNip;
        $tahunAjaran->total_hari_libur = $totalHariLibur;
        $tahunAjaran->total_hari_efektif = $hariEfektif;
        $tahunAjaran->is_tutup_buku = $sudahNaikKelas;

        return response()->json([
            'success' => true,
            'data' => $tahunAjaran,
            'kelas' => $kelasList,
            'total_kelas' => $kelasList->count(),
            'total_siswa' => $kelasList->sum('total_siswa'),
            'total_guru' => $totalGuruMengajar,
            'total_mapel' => $totalMapel,
            'total_wali_kelas' => $totalWaliKelas,
            'total_ruangan' => $totalRuangan,
            'total_jadwal' => $totalJadwal,
            'distribusi_tingkat' => $distribusiTingkat,
            'kalender' => $kalender,
            'aktivitas' => $aktivitas,
            'ta_prev' => $taPrev,
            'ta_next' => $taNext,
            'checklist' => $checklist,
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
    public function setSemesterAktif(Request $request, $id)
    {
        $request->validate([
            'semester_nama' => 'required|in:Ganjil,Genap',
        ]);

        $tahunAjaran = TahunAjaran::findOrFail($id);
        if (!$tahunAjaran->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Aktifkan tahun ajaran ini terlebih dahulu.',
            ], 422);
        }

        Semester::where('tahun_ajaran_id', $id)->update(['is_active' => false]);
        Semester::where('tahun_ajaran_id', $id)
            ->where('nama', $request->semester_nama)
            ->update(['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => "Semester {$request->semester_nama} berhasil diaktifkan.",
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