<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\TahunAjaran;
use App\Models\ActivityLog;
use App\Models\Kelas;
use App\Models\RiwayatKelas;
use App\Models\Semester;
use App\Models\PlotGuruMapel;
use App\Models\Absensi;
use App\Models\KalenderAkademik;
use App\Models\UserWaliKelas;
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
        $kepsekNama = \App\Models\Pengaturan::where('key', 'kepala_madrasah')->value('value') ?? '';
        $kepsekNip = \App\Models\Pengaturan::where('key', 'nip_kepala_madrasah')->value('value') ?? '';

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

        // ── Status Tutup Buku ──
        $sudahNaikKelas = \App\Models\RiwayatKelas::where('tahun_ajaran_id', $id)
            ->where('jenis_perubahan', 'naik_kelas')
            ->exists();

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

        $tglMulai = $ganjil?->tgl_mulai;
        $tglSelesai = $genap?->tgl_selesai ?? $ganjil?->tgl_selesai;
        $hariTotal = ($tglMulai && $tglSelesai)
            ? (int) \Carbon\Carbon::parse($tglMulai)->diffInDays(\Carbon\Carbon::parse($tglSelesai))
            : null;
        $hariEfektif = $hariTotal !== null ? max(0, $hariTotal - $totalHariLibur) : null;

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
            'tahun' => ['required', 'string', 'max:9', 'regex:/^\d{4}\/\d{4}$/', 'unique:tahun_ajarans,tahun'],
            'is_active' => 'nullable|boolean',
            'buat_semester' => 'nullable|boolean',
            'semester_ganjil_mulai' => 'nullable|date',
            'semester_ganjil_selesai' => 'nullable|date',
            'semester_genap_mulai' => 'nullable|date',
            'semester_genap_selesai' => 'nullable|date',
            'semester_aktif' => 'nullable|string|in:Ganjil,Genap',
            'tgl_mulai_ta' => 'nullable|date',
            'tgl_selesai_ta' => 'nullable|date',
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

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'create',
                'module' => 'tahun_ajaran',
                'subject_id' => $tahunAjaran->id,
                'keterangan' => "Membuat tahun ajaran {$tahunAjaran->tahun}" . ($request->buat_semester ? ' beserta semester.' : '.'),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

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
            'tahun' => ['required', 'string', 'max:9', 'regex:/^\d{4}\/\d{4}$/', 'unique:tahun_ajarans,tahun,' . $id],
            'is_active' => 'nullable|boolean',
            'buat_semester' => 'nullable|boolean',
            'semester_ganjil_mulai' => 'nullable|date',
            'semester_ganjil_selesai' => 'nullable|date',
            'semester_genap_mulai' => 'nullable|date',
            'semester_genap_selesai' => 'nullable|date',
            'semester_aktif' => 'nullable|string|in:Ganjil,Genap',
            'tgl_mulai_ta' => 'nullable|date',
            'tgl_selesai_ta' => 'nullable|date',
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
                // Ambil nilai lama dari DB sebelum di-update,
                // agar tidak kehilangan tanggal/status aktif saat update salah satu semester saja.
                $semGanjilLama = Semester::where('tahun_ajaran_id', $tahunAjaran->id)
                    ->where('nama', 'Ganjil')->first();
                $semGenapLama = Semester::where('tahun_ajaran_id', $tahunAjaran->id)
                    ->where('nama', 'Genap')->first();

                // Kalau semester_aktif eksplisit dikirim dan TA ini aktif,
                // reset semua semester lain baru set yang dipilih.
                if ($request->has('semester_aktif') && $request->semester_aktif && $request->is_active) {
                    Semester::query()->update(['is_active' => false]);
                }

                if ($request->has('semester_ganjil_mulai') || $request->has('semester_ganjil_selesai') || !$semGanjilLama) {
                    Semester::updateOrCreate(
                        ['tahun_ajaran_id' => $tahunAjaran->id, 'nama' => 'Ganjil'],
                        [
                            'tgl_mulai' => $request->has('semester_ganjil_mulai')
                                ? $request->semester_ganjil_mulai
                                : $semGanjilLama?->tgl_mulai,
                            'tgl_selesai' => $request->has('semester_ganjil_selesai')
                                ? $request->semester_ganjil_selesai
                                : $semGanjilLama?->tgl_selesai,
                            'is_active' => $request->has('semester_aktif') && $request->is_active
                                ? ($request->semester_aktif === 'Ganjil')
                                : ($semGanjilLama?->is_active ?? false),
                        ]
                    );
                }

                if ($request->has('semester_genap_mulai') || $request->has('semester_genap_selesai') || !$semGenapLama) {
                    Semester::updateOrCreate(
                        ['tahun_ajaran_id' => $tahunAjaran->id, 'nama' => 'Genap'],
                        [
                            'tgl_mulai' => $request->has('semester_genap_mulai')
                                ? $request->semester_genap_mulai
                                : $semGenapLama?->tgl_mulai,
                            'tgl_selesai' => $request->has('semester_genap_selesai')
                                ? $request->semester_genap_selesai
                                : $semGenapLama?->tgl_selesai,
                            'is_active' => $request->has('semester_aktif') && $request->is_active
                                ? ($request->semester_aktif === 'Genap')
                                : ($semGenapLama?->is_active ?? false),
                        ]
                    );
                }
            }

            DB::commit();

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'update',
                'module' => 'tahun_ajaran',
                'subject_id' => $tahunAjaran->id,
                'keterangan' => "Memperbarui tahun ajaran {$tahunAjaran->tahun}" . ($request->buat_semester ? ' dan semester.' : '.'),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

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

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'set_semester_aktif',
            'module' => 'tahun_ajaran',
            'subject_id' => $id,
            'keterangan' => "Mengaktifkan Semester {$request->semester_nama} pada tahun ajaran {$tahunAjaran->tahun}.",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Semester {$request->semester_nama} berhasil diaktifkan.",
        ]);
    }
    public function destroy($id)
    {
        $tahunAjaran = TahunAjaran::findOrFail($id);

        // Cek seluruh relasi data akademik yang terikat pada tahun ajaran ini
        $adaKelas = Kelas::where('tahun_ajaran_id', $id)->exists();
        $adaPlotGuru = PlotGuruMapel::where('tahun_ajaran_id', $id)->exists();
        $adaRiwayatKelas = RiwayatKelas::where('tahun_ajaran_id', $id)->exists();
        $adaAbsensi = Absensi::where('tahun_ajaran_id', $id)->exists();
        $adaKalender = KalenderAkademik::where('tahun_ajaran_id', $id)->exists();
        $adaWaliKelas = UserWaliKelas::where('tahun_ajaran_id', $id)->exists();

        if ($adaKelas || $adaPlotGuru || $adaRiwayatKelas || $adaAbsensi || $adaKalender || $adaWaliKelas) {
            return response()->json([
                'success' => false,
                'message' => 'Tahun ajaran ini tidak dapat dihapus karena sudah memiliki data akademik (kelas, jadwal/plot guru, absensi, kalender, atau penugasan wali kelas).',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Hapus semester pendamping secara bersih agar tidak meninggalkan orphan rows
            $tahunAjaran->semesters()->delete();
            $tahunAjaran->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tahun ajaran berhasil dihapus.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus tahun ajaran: ' . $e->getMessage(),
            ], 500);
        }
    }
}