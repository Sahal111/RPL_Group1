<?php

namespace App\Http\Controllers\MasterData\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\StoreGuruRequest;
use App\Http\Requests\Guru\UpdateGuruRequest;
use App\Http\Requests\Guru\UploadFotoGuruRequest;
use App\Http\Requests\Guru\KoreksiNuptkRequest;
use App\Models\ActivityLog;
use App\Models\Guru;
use App\Models\PlotGuruMapel;
use App\Models\Semester;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class GuruController extends Controller
{
    // ────────────────────────────────────────
    // SECTION: CRUD UTAMA
    // ────────────────────────────────────────

    public function index(Request $request)
    {
        $query = Guru::query()
            ->with([
                'waliKelas' => fn($q) => $q->where('is_active', 1)
                    ->with('kelas:id,nama_kelas'),
                'sertifikasis:id,guru_id',
                'plotGuruMapels:id,guru_id,mapel_id',
            ])
            ->when(
                $request->search,
                fn($q) =>
                $q->where('nama', 'like', "%{$request->search}%")
                    ->orWhere('nuptk', 'like', "%{$request->search}%")
                    ->orWhere('nip', 'like', "%{$request->search}%")
            )
            ->when(
                $request->jenis_ptk,
                fn($q) =>
                $q->where('jenis_ptk', $request->jenis_ptk)
            )
            ->when(
                $request->status_keaktifan,
                fn($q) =>
                $q->where('status_keaktifan', $request->status_keaktifan)
            )
            ->when(
                $request->status_kepegawaian,
                fn($q) =>
                $q->where('status_kepegawaian', $request->status_kepegawaian)
            )
            ->orderBy('nama')
            ->paginate($request->per_page ?? 15);

        return $this->success($query);
    }

    public function show($nuptk)
    {
        $guru = Guru::with([
            'user',
            'keluarga',
            'anaks',
            'kontakDarurat',
            'pendidikans',
            'pendidikanTerakhir',
            'sertifikasis',
            'jabatans',
            'jabatanAktif',
            'inpassings',
            'dokumens',
            'rekenings',
            'kompetensi',
            'diklats',
            'cutis',
            'mutasi',
            'pkgs.tahunAjaran',
            'pkgs.semester',
            'plotGuruMapels.mapel:id,kode,nama_mapel,kelompok',
            'plotGuruMapels.kelas:id,nama_kelas,tingkat',
            'plotGuruMapels.tahunAjaran:id,tahun',
            'plotGuruMapels.semester:id,nama',
            'jadwals.mapel:id,nama_mapel',
            'jadwals.kelas:id,nama_kelas',
        ])->where('nuptk', $nuptk)->firstOrFail();

        return $this->success($guru);
    }

    public function store(StoreGuruRequest $request)
    {
        $guru = Guru::create($request->validated());

        return $this->created($guru, 'Data guru berhasil ditambahkan.');
    }

    public function update(UpdateGuruRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $guru->update($request->validated());

        return $this->success($guru, 'Data guru berhasil diperbarui.');
    }

    public function destroy($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        if ($guru->user()->exists()) {
            return $this->error(
                'Guru ini memiliki akun login. Hapus akun loginnya terlebih dahulu.',
                'CONFLICT',
                422
            );
        }

        $guru->delete();

        return $this->success(message: 'Data guru berhasil dihapus.');
    }

    public function trash()
    {
        $data = Guru::onlyTrashed()->orderByDesc('deleted_at')->paginate(15);

        return $this->success($data);
    }

    public function restore($nuptk)
    {
        $guru = Guru::onlyTrashed()->where('nuptk', $nuptk)->firstOrFail();
        $guru->restore();

        return $this->success(message: 'Data guru berhasil dipulihkan.');
    }

    public function forceDelete($nuptk)
    {
        $guru = Guru::onlyTrashed()->where('nuptk', $nuptk)->firstOrFail();
        $guru->forceDelete();

        return $this->success(message: 'Data guru berhasil dihapus permanen.');
    }

    // ────────────────────────────────────────
    // SECTION: UTILITAS & STATISTIK
    // ────────────────────────────────────────

    public function dropdown()
    {
        $data = Guru::where('status_keaktifan', 'Aktif')
            ->orderBy('nama')
            ->get(['id', 'nama', 'nuptk', 'jenis_ptk', 'gelar_depan', 'gelar_belakang']);

        return $this->success($data);
    }

    public function stats()
    {
        $kelengkapan = [
            ['field' => 'foto', 'label' => 'Foto belum diupload', 'count' => Guru::whereNull('foto')->orWhere('foto', '')->count()],
            ['field' => 'nik', 'label' => 'NIK belum diisi', 'count' => Guru::whereNull('nik')->orWhere('nik', '')->count()],
            ['field' => 'email', 'label' => 'Email belum diisi', 'count' => Guru::whereNull('email')->orWhere('email', '')->count()],
            ['field' => 'no_kk', 'label' => 'No. KK belum diisi', 'count' => Guru::whereNull('no_kk')->orWhere('no_kk', '')->count()],
            ['field' => 'golongan_darah', 'label' => 'Golongan darah belum diisi', 'count' => Guru::whereNull('golongan_darah')->orWhere('golongan_darah', '')->count()],
            ['field' => 'nama_ibu_kandung', 'label' => 'Nama ibu kandung belum diisi', 'count' => Guru::whereNull('nama_ibu_kandung')->orWhere('nama_ibu_kandung', '')->count()],
            ['field' => 'tanggal_bergabung', 'label' => 'Tanggal bergabung belum diisi', 'count' => Guru::whereNull('tanggal_bergabung')->count()],
            ['field' => 'rekening', 'label' => 'Rekening bank belum diisi', 'count' => Guru::whereDoesntHave('rekenings', fn($q) => $q->whereNotNull('no_rekening')->where('no_rekening', '!=', ''))->count()],
            ['field' => 'npwp', 'label' => 'NPWP belum diisi', 'count' => Guru::whereDoesntHave('rekenings', fn($q) => $q->whereNotNull('npwp')->where('npwp', '!=', ''))->count()],
            ['field' => 'bpjs_kesehatan', 'label' => 'BPJS Kesehatan belum diisi', 'count' => Guru::whereDoesntHave('rekenings', fn($q) => $q->whereNotNull('no_bpjs_kesehatan')->where('no_bpjs_kesehatan', '!=', ''))->count()],
            ['field' => 'bpjs_ketenagakerjaan', 'label' => 'BPJS Ketenagakerjaan belum diisi', 'count' => Guru::whereDoesntHave('rekenings', fn($q) => $q->whereNotNull('no_bpjs_ketenagakerjaan')->where('no_bpjs_ketenagakerjaan', '!=', ''))->count()],
        ];

        $perhatian = array_values(array_filter($kelengkapan, fn($item) => $item['count'] > 0));

        return $this->success([
            'total' => Guru::count(),
            'aktif' => Guru::where('status_keaktifan', 'Aktif')->count(),
            'nonaktif' => Guru::whereIn('status_keaktifan', ['Cuti', 'Pensiun', 'Mutasi', 'Keluar'])->count(),
            'bersertifikasi' => Guru::whereHas('sertifikasis')->count(),
            'wali_kelas' => Guru::whereHas('waliKelas', fn($q) => $q->where('is_active', 1))->count(),
            'jumlah_mapel' => PlotGuruMapel::distinct('mapel_id')->count('mapel_id'),
            'perhatian' => $perhatian,
        ]);
    }

    public function perhatianDetail(Request $request)
    {
        $field = $request->query('field');

        $query = Guru::select('id', 'nuptk', 'nama', 'gelar_depan', 'gelar_belakang', 'jenis_ptk', 'foto');

        match ($field) {
            'foto' => $query->whereNull('foto')->orWhere('foto', ''),
            'nik' => $query->where(fn($q) => $q->whereNull('nik')->orWhere('nik', '')),
            'email' => $query->where(fn($q) => $q->whereNull('email')->orWhere('email', '')),
            'no_kk' => $query->where(fn($q) => $q->whereNull('no_kk')->orWhere('no_kk', '')),
            'golongan_darah' => $query->where(fn($q) => $q->whereNull('golongan_darah')->orWhere('golongan_darah', '')),
            'nama_ibu_kandung' => $query->where(fn($q) => $q->whereNull('nama_ibu_kandung')->orWhere('nama_ibu_kandung', '')),
            'tanggal_bergabung' => $query->whereNull('tanggal_bergabung'),
            'rekening' => $query->whereDoesntHave('rekenings', fn($q) => $q->whereNotNull('no_rekening')->where('no_rekening', '!=', '')),
            'npwp' => $query->whereDoesntHave('rekenings', fn($q) => $q->whereNotNull('npwp')->where('npwp', '!=', '')),
            'bpjs_kesehatan' => $query->whereDoesntHave('rekenings', fn($q) => $q->whereNotNull('no_bpjs_kesehatan')->where('no_bpjs_kesehatan', '!=', '')),
            'bpjs_ketenagakerjaan' => $query->whereDoesntHave('rekenings', fn($q) => $q->whereNotNull('no_bpjs_ketenagakerjaan')->where('no_bpjs_ketenagakerjaan', '!=', '')),
            default => $query->whereRaw('1=0'),
        };

        return $this->success($query->get()->append('nama_lengkap'));
    }

    public function tanpaPenugasan()
    {
        $tahunAktif = TahunAjaran::where('is_active', 1)->first();
        $semesterAktif = Semester::where('is_active', 1)->first();

        $gurus = Guru::select('id', 'nuptk', 'nama', 'gelar_depan', 'gelar_belakang', 'jenis_ptk', 'foto')
            ->where('status_keaktifan', 'Aktif')
            ->whereDoesntHave('plotGuruMapels', function ($q) use ($tahunAktif, $semesterAktif) {
                $q->where('is_active', 1)
                    ->when($tahunAktif, fn($q) => $q->where('tahun_ajaran_id', $tahunAktif->id))
                    ->when($semesterAktif, fn($q) => $q->where('semester_id', $semesterAktif->id));
            })
            ->get()
            ->append('nama_lengkap');

        return $this->success($gurus);
    }

    public function aktivitasTerkini()
    {
        $aktivitas = Guru::select('id', 'nuptk', 'nama', 'gelar_depan', 'gelar_belakang', 'jenis_ptk', 'foto', 'updated_at', 'updated_by')
            ->whereNotNull('updated_at')
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get()
            ->append('nama_lengkap')
            ->map(function ($g) {
                $g->updated_by_nama = $g->updated_by
                    ? optional(User::find($g->updated_by))->name
                    : null;
                return $g;
            });

        return $this->success($aktivitas);
    }

    // ────────────────────────────────────────
    // SECTION: FOTO
    // ────────────────────────────────────────

    public function uploadFoto(UploadFotoGuruRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        if ($guru->foto) {
            Storage::disk('public')->delete($guru->foto);
        }

        $path = $request->file('foto')->store('foto-guru', 'public');
        $guru->update(['foto' => $path]);

        return $this->success(
            ['foto_url' => asset('storage/' . $path)],
            'Foto berhasil diupload.'
        );
    }

    // ────────────────────────────────────────
    // SECTION: VERIFIKASI & KOREKSI
    // ────────────────────────────────────────

    public function verifikasi($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $guru->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        return $this->success(message: 'Data guru berhasil diverifikasi.');
    }

    public function batalVerifikasi($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $guru->update([
            'is_verified' => false,
            'verified_at' => null,
            'verified_by' => null,
        ]);

        return $this->success(message: 'Verifikasi data guru dibatalkan.');
    }

    public function koreksiNuptk(KoreksiNuptkRequest $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'nuptk_baru' => [
                'required',
                'string',
                'size:16',
                'regex:/^\d{16}$/',
                Rule::unique('gurus', 'nuptk')->ignore($guru->id),
            ],
            'alasan' => 'required|string|max:255',
        ]);

        $nuptk_lama = $guru->nuptk;
        $guru->update(['nuptk' => $request->nuptk_baru]);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'koreksi_nuptk',
            'module' => 'guru',
            'subject_id' => $guru->id,
            'keterangan' => "NUPTK dikoreksi dari {$nuptk_lama} ke {$request->nuptk_baru}. Alasan: {$request->alasan}",
            'ip_address' => $request->ip(),
        ]);

        return $this->success(
            ['nuptk_baru' => $request->nuptk_baru],
            "NUPTK berhasil dikoreksi dari {$nuptk_lama} ke {$request->nuptk_baru}."
        );
    }
}