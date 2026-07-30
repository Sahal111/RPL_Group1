<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use App\Models\GuruAnak;
use App\Models\GuruKontakDarurat;
use App\Models\GuruKeluarga;
use App\Models\GuruPendidikan;
use App\Models\GuruSertifikasi;
use App\Models\GuruJabatan;
use App\Models\GuruDokumen;
use App\Models\GuruRekening;
use App\Models\GuruKompetensi;
use App\Models\GuruDiklat;
use App\Models\GuruMutasi;
use App\Models\GuruPkg;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class MasterDataGuruController extends Controller
{
    // ────────────────────────────────────────────────────────
    // SECTION 1: CRUD UTAMA GURU
    // ────────────────────────────────────────────────────────

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

        return response()->json(['success' => true, 'data' => $query]);
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
            'mutasi',
            'pkgs.tahunAjaran',
            'pkgs.semester',
        ])->where('nuptk', $nuptk)->firstOrFail();

        return response()->json(['success' => true, 'data' => $guru]);
    }

    public function store(Request $request)
    {
        $request->validate([
            // Identitas wajib
            'nuptk' => 'required|string|max:16|unique:gurus,nuptk',
            'nip' => 'nullable|string|max:18|unique:gurus,nip',
            'nip_lama' => 'nullable|string|max:9',
            'no_karis_karsu' => 'nullable|string|max:20',
            'nik' => 'nullable|string|max:16|unique:gurus,nik',
            'no_kk' => 'nullable|string|max:16',
            'no_karpeg' => 'nullable|string|max:20',
            'nama' => 'required|string|max:100',
            'gelar_depan' => 'nullable|string|max:30',
            'gelar_belakang' => 'nullable|string|max:50',
            'jenis_kelamin' => 'required|in:L,P',
            'tempat_lahir' => 'required|string|max:60',
            'tanggal_lahir' => 'required|date',
            'agama' => 'required|in:Islam,Kristen Protestan,Kristen Katolik,Hindu,Buddha,Konghucu,Lainnya',
            'kewarganegaraan' => 'nullable|string|max:30',
            'status_hidup' => 'nullable|in:Aktif,Meninggal',
            'nama_ibu_kandung' => 'nullable|string|max:100',
            'golongan_darah' => 'nullable|in:A,B,AB,O,A+,A-,B+,B-,AB+,AB-,O+,O-',
            // Kontak
            'no_hp' => 'required|string|max:20',
            'no_wa' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100|unique:gurus,email',
            // Alamat
            'alamat_jalan' => 'nullable|string|max:255',
            'rt' => 'nullable|string|max:5',
            'rw' => 'nullable|string|max:5',
            'dusun' => 'nullable|string|max:100',
            'desa_kelurahan' => 'nullable|string|max:60',
            'kecamatan' => 'nullable|string|max:60',
            'kota_kabupaten' => 'nullable|string|max:60',
            'provinsi' => 'nullable|string|max:60',
            'kode_pos' => 'nullable|string|max:10',
            // Kepegawaian
            'jenis_ptk' => 'required|string|max:50',
            'status_kepegawaian' => 'required|in:PNS,PPPK,GTY,GTT,Honorer,Lainnya',
            'status_keaktifan' => 'nullable|in:Aktif,Cuti,Pensiun,Mutasi,Keluar',
            'tanggal_bergabung' => 'nullable|date',
            'tmt_pns' => 'nullable|date',
            'tmt_gty' => 'nullable|date',
            'no_sk_pengangkatan' => 'nullable|string|max:80',
            'tgl_sk_pengangkatan' => 'nullable|date',
            'instansi_pengangkat' => 'nullable|string|max:150',
            'masa_kerja_tahun' => 'nullable|integer|min:0|max:50',
        ]);

        $guru = Guru::create($request->only([
            'nuptk',
            'nip',
            'nip_lama',
            'no_karis_karsu',
            'nik',
            'no_kk',
            'no_karpeg',
            'nama',
            'gelar_depan',
            'gelar_belakang',
            'jenis_kelamin',
            'tempat_lahir',
            'tanggal_lahir',
            'agama',
            'kewarganegaraan',
            'status_hidup',
            'nama_ibu_kandung',
            'golongan_darah',
            'no_hp',
            'no_wa',
            'email',
            'alamat_jalan',
            'rt',
            'rw',
            'dusun',
            'desa_kelurahan',
            'kecamatan',
            'kota_kabupaten',
            'provinsi',
            'kode_pos',
            'jenis_ptk',
            'status_kepegawaian',
            'status_keaktifan',
            'tanggal_bergabung',
            'tmt_pns',
            'tmt_gty',
            'no_sk_pengangkatan',
            'tgl_sk_pengangkatan',
            'instansi_pengangkat',
            'masa_kerja_tahun',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Data guru berhasil ditambahkan.',
            'data' => $guru,
        ], 201);
    }

    public function update(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'nip' => "nullable|string|max:18|unique:gurus,nip,{$guru->id}",
            'nip_lama' => 'nullable|string|max:9',
            'no_karis_karsu' => 'nullable|string|max:20',
            'nik' => "nullable|string|max:16|unique:gurus,nik,{$guru->id}",
            'no_kk' => 'nullable|string|max:16',
            'no_karpeg' => 'nullable|string|max:20',
            'email' => "nullable|email|max:100|unique:gurus,email,{$guru->id}",
            'nama' => 'required|string|max:100',
            'gelar_depan' => 'nullable|string|max:30',
            'gelar_belakang' => 'nullable|string|max:50',
            'jenis_kelamin' => 'required|in:L,P',
            'tempat_lahir' => 'required|string|max:60',
            'tanggal_lahir' => 'required|date',
            'agama' => 'required|in:Islam,Kristen Protestan,Kristen Katolik,Hindu,Buddha,Konghucu,Lainnya',
            'kewarganegaraan' => 'nullable|string|max:30',
            'status_hidup' => 'nullable|in:Aktif,Meninggal',
            'nama_ibu_kandung' => 'nullable|string|max:100',
            'golongan_darah' => 'nullable|in:A,B,AB,O,A+,A-,B+,B-,AB+,AB-,O+,O-',
            'no_hp' => 'required|string|max:20',
            'no_wa' => 'nullable|string|max:20',
            'alamat_jalan' => 'nullable|string|max:255',
            'rt' => 'nullable|string|max:5',
            'rw' => 'nullable|string|max:5',
            'dusun' => 'nullable|string|max:100',
            'desa_kelurahan' => 'nullable|string|max:60',
            'kecamatan' => 'nullable|string|max:60',
            'kota_kabupaten' => 'nullable|string|max:60',
            'provinsi' => 'nullable|string|max:60',
            'kode_pos' => 'nullable|string|max:10',
            'jenis_ptk' => 'required|string|max:50',
            'status_kepegawaian' => 'required|in:PNS,PPPK,GTY,GTT,Honorer,Lainnya',
            'status_keaktifan' => 'nullable|in:Aktif,Cuti,Pensiun,Mutasi,Keluar',
            'tanggal_bergabung' => 'nullable|date',
            'tmt_pns' => 'nullable|date',
            'tmt_gty' => 'nullable|date',
            'no_sk_pengangkatan' => 'nullable|string|max:80',
            'tgl_sk_pengangkatan' => 'nullable|date',
            'instansi_pengangkat' => 'nullable|string|max:150',
            'masa_kerja_tahun' => 'nullable|integer|min:0|max:50',
        ]);

        $guru->update($request->only([
            'nip',
            'nip_lama',
            'no_karis_karsu',
            'nik',
            'no_kk',
            'no_karpeg',
            'email',
            'nama',
            'gelar_depan',
            'gelar_belakang',
            'jenis_kelamin',
            'tempat_lahir',
            'tanggal_lahir',
            'agama',
            'kewarganegaraan',
            'status_hidup',
            'nama_ibu_kandung',
            'golongan_darah',
            'no_hp',
            'no_wa',
            'alamat_jalan',
            'rt',
            'rw',
            'dusun',
            'desa_kelurahan',
            'kecamatan',
            'kota_kabupaten',
            'provinsi',
            'kode_pos',
            'jenis_ptk',
            'status_kepegawaian',
            'status_keaktifan',
            'tanggal_bergabung',
            'tmt_pns',
            'tmt_gty',
            'no_sk_pengangkatan',
            'tgl_sk_pengangkatan',
            'instansi_pengangkat',
            'masa_kerja_tahun',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Data guru berhasil diperbarui.',
            'data' => $guru,
        ]);
    }

    public function destroy($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        if ($guru->user()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Guru ini memiliki akun login. Hapus akun loginnya terlebih dahulu.',
            ], 422);
        }

        $guru->delete(); // Soft delete — masuk recycle bin

        return response()->json(['success' => true, 'message' => 'Data guru dipindahkan ke recycle bin.']);
    }

    // ── Recycle Bin: daftar guru yang di-soft-delete ──────────────────────────
    public function trash(Request $request)
    {
        $data = Guru::onlyTrashed()
            ->when(
                $request->search,
                fn($q) => $q->where('nama', 'like', "%{$request->search}%")
                    ->orWhere('nuptk', 'like', "%{$request->search}%")
            )
            ->orderByDesc('deleted_at')
            ->paginate($request->per_page ?? 10);

        return response()->json(['success' => true, 'data' => $data]);
    }

    // ── Recycle Bin: pulihkan guru ────────────────────────────────────────────
    public function restore($nuptk)
    {
        $guru = Guru::onlyTrashed()->where('nuptk', $nuptk)->firstOrFail();
        $guru->restore();

        return response()->json(['success' => true, 'message' => 'Data guru berhasil dipulihkan.']);
    }

    // ── Recycle Bin: hapus permanen ───────────────────────────────────────────
    public function forceDelete($nuptk)
    {
        $guru = Guru::onlyTrashed()->where('nuptk', $nuptk)->firstOrFail();

        // Hapus foto dari storage jika ada
        if ($guru->foto) {
            Storage::disk('public')->delete($guru->foto);
        }

        $guru->forceDelete();

        return response()->json(['success' => true, 'message' => 'Data guru dihapus permanen.']);
    }

    public function dropdown()
    {
        $data = Guru::where('status_keaktifan', 'Aktif')
            ->orderBy('nama')
            ->get(['id', 'nama', 'nuptk', 'jenis_ptk', 'gelar_depan', 'gelar_belakang']);

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function stats()
    {
        $total = Guru::count();

        // Kelengkapan data — field opsional yang penting
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

        // Filter — hanya tampilkan yang count > 0
        $perhatian = array_values(array_filter($kelengkapan, fn($item) => $item['count'] > 0));

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'aktif' => Guru::where('status_keaktifan', 'Aktif')->count(),
                'nonaktif' => Guru::whereIn('status_keaktifan', ['Cuti', 'Pensiun', 'Mutasi', 'Keluar'])->count(),
                'bersertifikasi' => Guru::whereHas('sertifikasis')->count(),
                'wali_kelas' => Guru::whereHas('waliKelas', fn($q) => $q->where('is_active', 1))->count(),
                'jumlah_mapel' => \App\Models\PlotGuruMapel::distinct('mapel_id')->count('mapel_id'),
                'perhatian' => $perhatian, // ← array dinamis, hanya yang count > 0
            ]
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

        return response()->json(['success' => true, 'data' => $query->get()->append('nama_lengkap')]);
    }

    public function tanpaPenugasan()
    {
        $tahunAktif = \App\Models\TahunAjaran::where('is_active', 1)->first();
        $semesterAktif = \App\Models\Semester::where('is_active', 1)->first();

        $gurus = Guru::select('id', 'nuptk', 'nama', 'gelar_depan', 'gelar_belakang', 'jenis_ptk', 'foto')
            ->where('status_keaktifan', 'Aktif')
            ->whereDoesntHave('plotGuruMapels', function ($q) use ($tahunAktif, $semesterAktif) {
                $q->where('is_active', 1)
                    ->when($tahunAktif, fn($q) => $q->where('tahun_ajaran_id', $tahunAktif->id))
                    ->when($semesterAktif, fn($q) => $q->where('semester_id', $semesterAktif->id));
            })
            ->get()
            ->append('nama_lengkap');

        return response()->json(['success' => true, 'data' => $gurus]);
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
                    ? optional(\App\Models\User::find($g->updated_by))->name
                    : null;
                return $g;
            });

        return response()->json(['success' => true, 'data' => $aktivitas]);
    }

    public function uploadFoto(Request $request, $nuptk)
    {
        $request->validate(['foto' => 'required|image|mimes:jpg,jpeg,png|max:2048']);

        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        if ($guru->foto)
            Storage::disk('public')->delete($guru->foto);

        $path = $request->file('foto')->store('foto-guru', 'public');
        $guru->update(['foto' => $path]);

        return response()->json([
            'success' => true,
            'message' => 'Foto berhasil diupload.',
            'data' => ['foto_url' => asset('storage/' . $path)],
        ]);
    }

    // ────────────────────────────────────────────────────────
    // SECTION 2: KELUARGA & ANAK
    // ────────────────────────────────────────────────────────

    public function getKeluarga($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return response()->json([
            'success' => true,
            'data' => [
                'keluarga' => $guru->keluarga,
                'anaks' => $guru->anaks,
            ],
        ]);
    }

    public function updateKeluarga(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'status_perkawinan' => 'nullable|in:Belum Menikah,Menikah,Cerai Hidup,Cerai Mati',
            'nama_pasangan' => 'nullable|string|max:150',
            'nik_pasangan' => 'nullable|string|max:16',
            'pekerjaan_pasangan' => 'nullable|string|max:100',
            'jumlah_anak' => 'nullable|integer|min:0',
            'anaks' => 'nullable|array',
            'anaks.*.id' => 'nullable|integer|exists:guru_anaks,id',
            'anaks.*.nama' => 'required_with:anaks|string|max:150',
            'anaks.*.jenis_kelamin' => 'nullable|in:L,P',
            'anaks.*.tanggal_lahir' => 'nullable|date',
            'anaks.*.urutan' => 'nullable|integer|min:1',
        ]);

        DB::transaction(function () use ($request, $guru) {
            // Upsert data keluarga
            $guru->keluarga()->updateOrCreate(
                ['guru_id' => $guru->id],
                [
                    'status_perkawinan' => $request->status_perkawinan,
                    'nama_pasangan' => $request->nama_pasangan,
                    'nik_pasangan' => $request->nik_pasangan,
                    'pekerjaan_pasangan' => $request->pekerjaan_pasangan,
                    'jumlah_anak' => $request->jumlah_anak ?? 0,  // ← default 0
                ]
            );

            // Sync data anak — hapus yang lama, insert ulang
            if ($request->has('anaks')) {
                $guru->anaks()->delete();
                foreach ($request->anaks as $i => $anak) {
                    $guru->anaks()->create([
                        'nama' => $anak['nama'],
                        'jenis_kelamin' => $anak['jenis_kelamin'] ?? null,
                        'tanggal_lahir' => $anak['tanggal_lahir'] ?? null,
                        'urutan' => $anak['urutan'] ?? ($i + 1),
                        'keterangan' => $anak['keterangan'] ?? null,
                    ]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Data keluarga berhasil diperbarui.',
        ]);
    }

    // ────────────────────────────────────────────────────────
    // SECTION 3: KONTAK DARURAT
    // ────────────────────────────────────────────────────────

    public function getKontakDarurat($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return response()->json(['success' => true, 'data' => $guru->kontakDarurat]);
    }

    public function storeKontakDarurat(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'nama' => 'required|string|max:150',
            'hubungan' => 'required|string|max:50',
            'no_hp' => 'required|string|max:20',
            'alamat' => 'nullable|string|max:255',
            'is_primary' => 'nullable|boolean',
        ]);

        if ($request->is_primary) {
            $guru->kontakDarurat()->update(['is_primary' => 0]);
        }

        $data = $guru->kontakDarurat()->create($request->only(['nama', 'hubungan', 'no_hp', 'alamat', 'is_primary']));

        return response()->json(['success' => true, 'message' => 'Kontak darurat ditambahkan.', 'data' => $data], 201);
    }

    public function updateKontakDarurat(Request $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $kontak = $guru->kontakDarurat()->findOrFail($id);

        $request->validate([
            'nama' => 'required|string|max:150',
            'hubungan' => 'required|string|max:50',
            'no_hp' => 'required|string|max:20',
            'alamat' => 'nullable|string|max:255',
            'is_primary' => 'nullable|boolean',
        ]);

        if ($request->is_primary) {
            $guru->kontakDarurat()->where('id', '!=', $id)->update(['is_primary' => 0]);
        }

        $kontak->update($request->only(['nama', 'hubungan', 'no_hp', 'alamat', 'is_primary']));

        return response()->json(['success' => true, 'message' => 'Kontak darurat diperbarui.', 'data' => $kontak]);
    }

    public function destroyKontakDarurat($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $guru->kontakDarurat()->findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Kontak darurat dihapus.']);
    }

    // ────────────────────────────────────────────────────────
    // SECTION 4: PENDIDIKAN
    // ────────────────────────────────────────────────────────

    public function getPendidikan($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return response()->json(['success' => true, 'data' => $guru->pendidikans]);
    }

    public function storePendidikan(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'jenjang' => 'required|in:SD,SMP,SMA/SMK,D1,D2,D3,D4,S1,S2,S3',
            'nama_sekolah' => 'required|string|max:200',
            'jurusan' => 'nullable|string|max:100',
            'prodi' => 'nullable|string|max:100',
            'tahun_masuk' => 'nullable|integer|min:1950|max:' . date('Y'),
            'tahun_lulus' => 'nullable|integer|min:1950|max:' . (date('Y') + 1),
            'no_ijazah' => 'nullable|string|max:80',
            'file_ijazah' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['jenjang', 'nama_sekolah', 'jurusan', 'prodi', 'tahun_masuk', 'tahun_lulus', 'no_ijazah']);

        if ($request->hasFile('file_ijazah')) {
            $data['file_ijazah'] = $request->file('file_ijazah')->store("guru-dokumen/{$guru->id}/ijazah", 'public');
        }

        $pendidikan = $guru->pendidikans()->create($data);

        return response()->json(['success' => true, 'message' => 'Riwayat pendidikan ditambahkan.', 'data' => $pendidikan], 201);
    }

    public function updatePendidikan(Request $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $pendidikan = $guru->pendidikans()->findOrFail($id);

        $request->validate([
            'jenjang' => 'required|in:SD,SMP,SMA/SMK,D1,D2,D3,D4,S1,S2,S3',
            'nama_sekolah' => 'required|string|max:200',
            'jurusan' => 'nullable|string|max:100',
            'prodi' => 'nullable|string|max:100',
            'tahun_masuk' => 'nullable|integer|min:1950|max:' . date('Y'),
            'tahun_lulus' => 'nullable|integer|min:1950|max:' . (date('Y') + 1),
            'no_ijazah' => 'nullable|string|max:80',
            'file_ijazah' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['jenjang', 'nama_sekolah', 'jurusan', 'prodi', 'tahun_masuk', 'tahun_lulus', 'no_ijazah']);

        if ($request->hasFile('file_ijazah')) {
            if ($pendidikan->file_ijazah)
                Storage::disk('public')->delete($pendidikan->file_ijazah);
            $data['file_ijazah'] = $request->file('file_ijazah')->store("guru-dokumen/{$guru->id}/ijazah", 'public');
        }

        $pendidikan->update($data);

        return response()->json(['success' => true, 'message' => 'Riwayat pendidikan diperbarui.', 'data' => $pendidikan]);
    }

    public function destroyPendidikan($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $pendidikan = $guru->pendidikans()->findOrFail($id);
        if ($pendidikan->file_ijazah)
            Storage::disk('public')->delete($pendidikan->file_ijazah);
        $pendidikan->delete();
        return response()->json(['success' => true, 'message' => 'Riwayat pendidikan dihapus.']);
    }

    // ────────────────────────────────────────────────────────
    // SECTION 5: SERTIFIKASI
    // ────────────────────────────────────────────────────────

    public function getSertifikasi($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return response()->json(['success' => true, 'data' => $guru->sertifikasis]);
    }

    public function storeSertifikasi(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'jenis_sertifikasi' => 'required|string|max:100',
            'no_sertifikat' => 'nullable|string|max:80',
            'nrg' => 'nullable|string|max:20',
            'tahun_sertifikasi' => 'nullable|integer|min:1990|max:' . date('Y'),
            'lptk' => 'nullable|string|max:200',
            'bidang_studi' => 'nullable|string|max:100',
            'tanggal_terbit' => 'nullable|date',
            'expired_at' => 'nullable|date|after:tanggal_terbit',
            'file_sertifikat' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['jenis_sertifikasi', 'no_sertifikat', 'nrg', 'tahun_sertifikasi', 'lptk', 'bidang_studi', 'tanggal_terbit', 'expired_at']);

        if ($request->hasFile('file_sertifikat')) {
            $data['file_sertifikat'] = $request->file('file_sertifikat')->store("guru-dokumen/{$guru->id}/sertifikasi", 'public');
        }

        $sert = $guru->sertifikasis()->create($data);

        return response()->json(['success' => true, 'message' => 'Sertifikasi ditambahkan.', 'data' => $sert], 201);
    }

    public function destroySertifikasi($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $sert = $guru->sertifikasis()->findOrFail($id);
        if ($sert->file_sertifikat)
            Storage::disk('public')->delete($sert->file_sertifikat);
        $sert->delete();
        return response()->json(['success' => true, 'message' => 'Sertifikasi dihapus.']);
    }

    public function updateSertifikasi(Request $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $sert = $guru->sertifikasis()->findOrFail($id);

        $request->validate([
            'jenis_sertifikasi' => 'required|string|max:100',
            'no_sertifikat' => 'nullable|string|max:80',
            'nrg' => 'nullable|string|max:20',
            'tahun_sertifikasi' => 'nullable|integer|min:1990|max:' . date('Y'),
            'lptk' => 'nullable|string|max:200',
            'bidang_studi' => 'nullable|string|max:100',
            'tanggal_terbit' => 'nullable|date',
            'expired_at' => 'nullable|date|after:tanggal_terbit',
            'file_sertifikat' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['jenis_sertifikasi', 'no_sertifikat', 'nrg', 'tahun_sertifikasi', 'lptk', 'bidang_studi', 'tanggal_terbit', 'expired_at']);

        if ($request->hasFile('file_sertifikat')) {
            if ($sert->file_sertifikat)
                Storage::disk('public')->delete($sert->file_sertifikat);
            $data['file_sertifikat'] = $request->file('file_sertifikat')->store("guru-dokumen/{$guru->id}/sertifikasi", 'public');
        }

        $sert->update($data);
        return response()->json(['success' => true, 'message' => 'Sertifikasi diperbarui.', 'data' => $sert]);
    }

    // ────────────────────────────────────────────────────────
    // SECTION: INPASSING
    // ────────────────────────────────────────────────────────

    public function getInpassing($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return response()->json(['success' => true, 'data' => $guru->inpassings]);
    }

    public function storeInpassing(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'no_sk' => 'required|string|max:100',
            'tanggal_sk' => 'required|date',
            'tmt_inpassing' => 'required|date',
            'golongan_sesudah' => 'nullable|string|max:10',
            'jabatan_fungsional' => 'nullable|string|max:100',
            'angka_kredit' => 'nullable|numeric|min:0',
            'file_sk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['no_sk', 'tanggal_sk', 'tmt_inpassing', 'golongan_sesudah', 'jabatan_fungsional', 'angka_kredit']);

        if ($request->hasFile('file_sk')) {
            $data['file_sk'] = $request->file('file_sk')->store("guru-dokumen/{$guru->id}/inpassing", 'public');
        }

        $inpassing = $guru->inpassings()->create($data);
        return response()->json(['success' => true, 'message' => 'Data inpassing ditambahkan.', 'data' => $inpassing], 201);
    }

    public function updateInpassing(Request $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $inpassing = $guru->inpassings()->findOrFail($id);

        $request->validate([
            'no_sk' => 'required|string|max:100',
            'tanggal_sk' => 'required|date',
            'tmt_inpassing' => 'required|date',
            'golongan_sesudah' => 'nullable|string|max:10',
            'jabatan_fungsional' => 'nullable|string|max:100',
            'angka_kredit' => 'nullable|numeric|min:0',
            'file_sk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['no_sk', 'tanggal_sk', 'tmt_inpassing', 'golongan_sesudah', 'jabatan_fungsional', 'angka_kredit']);

        if ($request->hasFile('file_sk')) {
            if ($inpassing->file_sk)
                Storage::disk('public')->delete($inpassing->file_sk);
            $data['file_sk'] = $request->file('file_sk')->store("guru-dokumen/{$guru->id}/inpassing", 'public');
        }

        $inpassing->update($data);
        return response()->json(['success' => true, 'message' => 'Data inpassing diperbarui.', 'data' => $inpassing]);
    }

    public function destroyInpassing($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $inpassing = $guru->inpassings()->findOrFail($id);
        if ($inpassing->file_sk)
            Storage::disk('public')->delete($inpassing->file_sk);
        $inpassing->delete();
        return response()->json(['success' => true, 'message' => 'Data inpassing dihapus.']);
    }

    // ────────────────────────────────────────────────────────
    // SECTION 6: DOKUMEN UPLOAD
    // ────────────────────────────────────────────────────────

    public function getDokumen($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return response()->json(['success' => true, 'data' => $guru->dokumens]);
    }

    public function uploadDokumen(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'kategori' => 'required|in:identitas,kepegawaian,pendidikan,sertifikasi,penghargaan,lainnya',
            'nama_dokumen' => 'nullable|string|max:150',
            'nomor_dokumen' => 'nullable|string|max:80',
            'tanggal_dokumen' => 'nullable|date',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store("guru-dokumen/{$guru->id}", 'public');

        $dokumen = $guru->dokumens()->create([
            'kategori' => $request->kategori,
            'nama_dokumen' => $request->nama_dokumen ?? $request->kategori,
            'nomor_dokumen' => $request->nomor_dokumen,
            'tanggal_dokumen' => $request->tanggal_dokumen,
            'penerbit' => $request->penerbit,
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json(['success' => true, 'message' => 'Dokumen berhasil diupload.', 'data' => $dokumen], 201);
    }

    public function destroyDokumen($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $dokumen = $guru->dokumens()->findOrFail($id);
        Storage::disk('public')->delete($dokumen->file_path);
        $dokumen->delete();
        return response()->json(['success' => true, 'message' => 'Dokumen dihapus.']);
    }

    // ────────────────────────────────────────────────────────
    // SECTION 7: REKENING & ADMINISTRASI
    // ────────────────────────────────────────────────────────

    public function getAdministrasi($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return response()->json(['success' => true, 'data' => $guru->rekenings]);
    }

    public function updateAdministrasi(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'nama_bank' => 'nullable|string|max:100',
            'no_rekening' => 'nullable|string|max:30',
            'atas_nama' => 'nullable|string|max:150',
            'cabang' => 'nullable|string|max:100',
            'npwp' => 'nullable|string|max:20',
            'no_bpjs_kesehatan' => 'nullable|string|max:30',
            'no_bpjs_ketenagakerjaan' => 'nullable|string|max:30',
            'gaji_pokok' => 'nullable|numeric|min:0',
            'tunjangan_fungsional' => 'nullable|numeric|min:0',
            'tunjangan_profesi' => 'nullable|numeric|min:0',
        ]);

        $rekening = $guru->rekenings()->updateOrCreate(
            ['guru_id' => $guru->id, 'is_primary' => 1],
            $request->only([
                'nama_bank',
                'no_rekening',
                'atas_nama',
                'cabang',
                'npwp',
                'no_bpjs_kesehatan',
                'no_bpjs_ketenagakerjaan',
                'gaji_pokok',
                'tunjangan_fungsional',
                'tunjangan_profesi',
            ])
        );

        return response()->json(['success' => true, 'message' => 'Data administrasi diperbarui.', 'data' => $rekening]);
    }

    // ────────────────────────────────────────────────────────
    // SECTION 8: KOMPETENSI
    // ────────────────────────────────────────────────────────

    public function getKompetensi($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return response()->json(['success' => true, 'data' => $guru->kompetensi]);
    }

    public function storeKompetensi(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'jenis' => 'required|in:bahasa,it,bidang_keahlian,lainnya',
            'nama' => 'required|string|max:150',
            'tingkat' => 'nullable|in:Dasar,Menengah,Mahir,Ahli',
            'keterangan' => 'nullable|string|max:255',
        ]);

        $data = $guru->kompetensi()->create($request->only(['jenis', 'nama', 'tingkat', 'keterangan']));

        return response()->json(['success' => true, 'message' => 'Kompetensi ditambahkan.', 'data' => $data], 201);
    }

    public function destroyKompetensi($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $guru->kompetensi()->findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Kompetensi dihapus.']);
    }

    // ────────────────────────────────────────────────────────
    // SECTION 9: DIKLAT / PELATIHAN
    // ────────────────────────────────────────────────────────

    public function getDiklat($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return response()->json(['success' => true, 'data' => $guru->diklats]);
    }

    public function storeDiklat(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'nama_diklat' => 'required|string|max:200',
            'penyelenggara' => 'nullable|string|max:200',
            'jenis' => 'nullable|in:diklat,bimtek,workshop,seminar,pelatihan,kursus',
            'tingkat' => 'nullable|in:Kecamatan,Kabupaten/Kota,Provinsi,Nasional,Internasional',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'jumlah_jam' => 'nullable|integer|min:1',
            'peran' => 'nullable|in:peserta,narasumber,panitia,moderator',
            'no_sertifikat' => 'nullable|string|max:100',
            'keterangan' => 'nullable|string|max:500',
            'file_sertifikat' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['nama_diklat', 'penyelenggara', 'jenis', 'tingkat', 'tanggal_mulai', 'tanggal_selesai', 'jumlah_jam', 'peran', 'no_sertifikat', 'keterangan']);

        if ($request->hasFile('file_sertifikat')) {
            $data['file_sertifikat'] = $request->file('file_sertifikat')->store("guru-dokumen/{$guru->id}/diklat", 'public');
        }

        $diklat = $guru->diklats()->create($data);

        return response()->json(['success' => true, 'message' => 'Riwayat pelatihan ditambahkan.', 'data' => $diklat], 201);
    }

    public function updateDiklat(Request $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $diklat = $guru->diklats()->findOrFail($id);

        $request->validate([
            'nama_diklat' => 'required|string|max:200',
            'penyelenggara' => 'nullable|string|max:200',
            'jenis' => 'nullable|in:diklat,bimtek,workshop,seminar,pelatihan,kursus',
            'tingkat' => 'nullable|in:Kecamatan,Kabupaten/Kota,Provinsi,Nasional,Internasional',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'jumlah_jam' => 'nullable|integer|min:1',
            'peran' => 'nullable|in:peserta,narasumber,panitia,moderator',
            'no_sertifikat' => 'nullable|string|max:100',
            'keterangan' => 'nullable|string|max:500',
            'file_sertifikat' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['nama_diklat', 'penyelenggara', 'jenis', 'tingkat', 'tanggal_mulai', 'tanggal_selesai', 'jumlah_jam', 'peran', 'no_sertifikat', 'keterangan']);

        if ($request->hasFile('file_sertifikat')) {
            if ($diklat->file_sertifikat)
                Storage::disk('public')->delete($diklat->file_sertifikat);
            $data['file_sertifikat'] = $request->file('file_sertifikat')->store("guru-dokumen/{$guru->id}/diklat", 'public');
        }

        $diklat->update($data);
        return response()->json(['success' => true, 'message' => 'Riwayat pelatihan diperbarui.', 'data' => $diklat]);
    }

    public function destroyDiklat($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $diklat = $guru->diklats()->findOrFail($id);
        if ($diklat->file_sertifikat)
            Storage::disk('public')->delete($diklat->file_sertifikat);
        $diklat->delete();
        return response()->json(['success' => true, 'message' => 'Riwayat pelatihan dihapus.']);
    }

    // ────────────────────────────────────────────────────────
    // SECTION 10: MUTASI
    // ────────────────────────────────────────────────────────

    public function getMutasi($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return response()->json(['success' => true, 'data' => $guru->mutasi]);
    }

    public function storeMutasi(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'jenis_mutasi' => 'required|in:Masuk,Keluar,Internal',
            'sekolah_asal' => 'nullable|string|max:200',
            'npsn_asal' => 'nullable|string|max:10',
            'sekolah_tujuan' => 'nullable|string|max:200',
            'npsn_tujuan' => 'nullable|string|max:10',
            'tanggal_mutasi' => 'required|date',
            'no_sk' => 'nullable|string|max:80',
            'tanggal_sk' => 'nullable|date',
            'keterangan' => 'nullable|string',
            'file_sk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['jenis_mutasi', 'sekolah_asal', 'npsn_asal', 'sekolah_tujuan', 'npsn_tujuan', 'tanggal_mutasi', 'no_sk', 'tanggal_sk', 'keterangan']);

        if ($request->hasFile('file_sk')) {
            $data['file_sk'] = $request->file('file_sk')->store("guru-dokumen/{$guru->id}/mutasi", 'public');
        }

        $mutasi = $guru->mutasi()->create($data);

        return response()->json(['success' => true, 'message' => 'Riwayat mutasi ditambahkan.', 'data' => $mutasi], 201);
    }

    public function destroyMutasi($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $mutasi = $guru->mutasi()->findOrFail($id);
        if ($mutasi->file_sk)
            Storage::disk('public')->delete($mutasi->file_sk);
        $mutasi->delete();
        return response()->json(['success' => true, 'message' => 'Riwayat mutasi dihapus.']);
    }

    // ────────────────────────────────────────────────────────
    // SECTION 11: PKG (Penilaian Kinerja Guru)
    // ────────────────────────────────────────────────────────

    public function getPkg($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return response()->json(['success' => true, 'data' => $guru->pkgs()->with(['tahunAjaran', 'semester', 'penilai:id,name'])->get()]);
    }

    public function storePkg(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'tahun_ajaran_id' => 'required|exists:tahun_ajarans,id',
            'semester_id' => 'required|exists:semesters,id',
            'nilai' => 'required|numeric|min:0|max:100',
            'predikat' => 'required|in:Amat Baik,Baik,Cukup,Sedang,Kurang',
            'catatan' => 'nullable|string',
            'tanggal_penilaian' => 'nullable|date',
        ]);

        $pkg = $guru->pkgs()->updateOrCreate(
            ['tahun_ajaran_id' => $request->tahun_ajaran_id, 'semester_id' => $request->semester_id],
            [
                'nilai' => $request->nilai,
                'predikat' => $request->predikat,
                'catatan' => $request->catatan,
                'dinilai_oleh' => auth()->id(),
                'tanggal_penilaian' => $request->tanggal_penilaian ?? now(),
            ]
        );

        return response()->json(['success' => true, 'message' => 'PKG berhasil disimpan.', 'data' => $pkg]);
    }

    public function verifikasi($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $guru->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data guru berhasil diverifikasi.',
        ]);
    }

    public function batalVerifikasi($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $guru->update([
            'is_verified' => false,
            'verified_at' => null,
            'verified_by' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Verifikasi data guru dibatalkan.',
        ]);
    }
    public function koreksiNuptk(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'nuptk_baru' => [
                'required',
                'string',
                'size:16',
                'regex:/^\d{16}$/',
                \Illuminate\Validation\Rule::unique('gurus', 'nuptk')->ignore($guru->id),
            ],
            'alasan' => 'required|string|max:255',
        ]);

        $nuptk_lama = $guru->nuptk;
        $guru->update(['nuptk' => $request->nuptk_baru]);

        // Log perubahan
        \App\Models\ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'koreksi_nuptk',
            'module' => 'guru',
            'subject_id' => $guru->id,
            'keterangan' => "NUPTK dikoreksi dari {$nuptk_lama} ke {$request->nuptk_baru}. Alasan: {$request->alasan}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "NUPTK berhasil dikoreksi dari {$nuptk_lama} ke {$request->nuptk_baru}.",
            'data' => ['nuptk_baru' => $request->nuptk_baru],
        ]);
    }

    // ────────────────────────────────────────────────────────
    // SECTION: JABATAN
    // ────────────────────────────────────────────────────────

    public function getJabatan($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        return response()->json(['success' => true, 'data' => $guru->jabatans]);
    }

    public function storeJabatan(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'jenis_jabatan' => 'required|in:Struktural,Fungsional,Tambahan',
            'jenis_pengangkatan' => 'nullable|in:Pengangkatan Baru,Promosi,Mutasi,Rotasi,Perpanjangan,Pelaksana Tugas (Plt)',
            'jabatan' => 'required|string|max:100',
            'unit_kerja' => 'nullable|string|max:150',
            'instansi_pengangkat' => 'nullable|string|max:150',
            'golongan' => 'nullable|string|max:10',
            'pangkat' => 'nullable|string|max:60',
            'status_kepegawaian' => 'nullable|in:CPNS,PNS,PPPK,GTY,GTT,Honorer,Kontrak',
            'no_sk' => 'nullable|string|max:80',
            'tanggal_sk' => 'nullable|date',
            'pejabat_penandatangan' => 'nullable|string|max:100',
            'tmt_jabatan' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tmt_jabatan',
            'masa_berlaku' => 'nullable|date',
            'alasan_berakhir' => 'nullable|in:Mutasi,Promosi,Habis Masa Jabatan,Mengundurkan Diri,Pensiun,Lainnya',
            'status_jabatan' => 'nullable|in:Aktif,Berakhir,Nonaktif,Mutasi,Pensiun',
            'uraian_tugas' => 'nullable|string|max:500',
            'is_current' => 'boolean',
        ]);

        $data = $request->only([
            'jenis_jabatan',
            'jenis_pengangkatan',
            'jabatan',
            'unit_kerja',
            'instansi_pengangkat',
            'golongan',
            'pangkat',
            'status_kepegawaian',
            'no_sk',
            'tanggal_sk',
            'pejabat_penandatangan',
            'tmt_jabatan',
            'tanggal_selesai',
            'masa_berlaku',
            'alasan_berakhir',
            'status_jabatan',
            'uraian_tugas',
            'is_current',
        ]);

        $data['created_by'] = auth()->id();
        $data['updated_by'] = auth()->id();

        // Kalau is_current=true, reset yang lama dulu
        if (!empty($data['is_current'])) {
            $guru->jabatans()->update(['is_current' => false]);
        }

        $jabatan = $guru->jabatans()->create($data);

        return response()->json(['success' => true, 'message' => 'Riwayat jabatan ditambahkan.', 'data' => $jabatan], 201);
    }

    public function updateJabatan(Request $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $jabatan = $guru->jabatans()->findOrFail($id);

        $request->validate([
            'jenis_jabatan' => 'required|in:Struktural,Fungsional,Tambahan',
            'jenis_pengangkatan' => 'nullable|in:Pengangkatan Baru,Promosi,Mutasi,Rotasi,Perpanjangan,Pelaksana Tugas (Plt)',
            'jabatan' => 'required|string|max:100',
            'unit_kerja' => 'nullable|string|max:150',
            'instansi_pengangkat' => 'nullable|string|max:150',
            'golongan' => 'nullable|string|max:10',
            'pangkat' => 'nullable|string|max:60',
            'status_kepegawaian' => 'nullable|in:CPNS,PNS,PPPK,GTY,GTT,Honorer,Kontrak',
            'no_sk' => 'nullable|string|max:80',
            'tanggal_sk' => 'nullable|date',
            'pejabat_penandatangan' => 'nullable|string|max:100',
            'tmt_jabatan' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tmt_jabatan',
            'masa_berlaku' => 'nullable|date',
            'alasan_berakhir' => 'nullable|in:Mutasi,Promosi,Habis Masa Jabatan,Mengundurkan Diri,Pensiun,Lainnya',
            'status_jabatan' => 'nullable|in:Aktif,Berakhir,Nonaktif,Mutasi,Pensiun',
            'uraian_tugas' => 'nullable|string|max:500',
            'is_current' => 'boolean',
        ]);

        $data = $request->only([
            'jenis_jabatan',
            'jenis_pengangkatan',
            'jabatan',
            'unit_kerja',
            'instansi_pengangkat',
            'golongan',
            'pangkat',
            'status_kepegawaian',
            'no_sk',
            'tanggal_sk',
            'pejabat_penandatangan',
            'tmt_jabatan',
            'tanggal_selesai',
            'masa_berlaku',
            'alasan_berakhir',
            'status_jabatan',
            'uraian_tugas',
            'is_current',
        ]);

        $data['updated_by'] = auth()->id();

        // Kalau is_current di-set true, reset yang lain dulu
        if (!empty($data['is_current'])) {
            $guru->jabatans()->where('id', '!=', $id)->update(['is_current' => false]);
        }

        $jabatan->update($data);

        return response()->json(['success' => true, 'message' => 'Riwayat jabatan diperbarui.', 'data' => $jabatan]);
    }

    public function destroyJabatan($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $jabatan = $guru->jabatans()->findOrFail($id);
        $jabatan->delete(); // soft delete
        return response()->json(['success' => true, 'message' => 'Riwayat jabatan dihapus.']);
    }

    public function downloadDokumen($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $dokumen = $guru->dokumens()->findOrFail($id);

        $path = storage_path('app/public/' . $dokumen->file_path);

        if (!file_exists($path)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        return response()->download(
            $path,
            $dokumen->nama_dokumen . '.' . pathinfo($path, PATHINFO_EXTENSION)
        );
    }

    public function downloadFile(Request $request, $nuptk)
    {
        Guru::where('nuptk', $nuptk)->firstOrFail(); // pastikan guru exist

        $filePath = $request->query('path');
        $namaFile = $request->query('nama', 'dokumen');

        if (!$filePath) {
            return response()->json(['message' => 'Path tidak ditemukan.'], 400);
        }

        $fullPath = storage_path('app/public/' . $filePath);

        if (!file_exists($fullPath)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        $ext = pathinfo($fullPath, PATHINFO_EXTENSION);

        // Sanitasi nama file — hapus karakter yang tidak valid
        $safeName = preg_replace('/[\/\\\\:*?"<>|]/', '_', $namaFile);

        return response()->download($fullPath, $safeName . '.' . $ext);
    }

    // --------------------------------------------------------
    // SECTION: TEMPLATE, IMPORT, EXPORT, BACKUP
    // --------------------------------------------------------

    /**
     * GET /guru/template
     */
    public function downloadTemplate()
    {
        $headers = [
            // Identitas
            'nuptk',
            'nip',
            'nip_lama',
            'no_karis_karsu',
            'nik',
            'no_kk',
            'no_karpeg',
            'nama',
            'gelar_depan',
            'gelar_belakang',
            'jenis_kelamin (L/P)',
            'tempat_lahir',
            'tanggal_lahir (YYYY-MM-DD)',
            'agama',
            'golongan_darah',
            'kewarganegaraan',
            'status_hidup',
            'nama_ibu_kandung',
            // Kontak
            'no_hp',
            'no_wa',
            'email',
            // Alamat
            'alamat_jalan',
            'rt',
            'rw',
            'dusun',
            'desa_kelurahan',
            'kecamatan',
            'kota_kabupaten',
            'provinsi',
            'kode_pos',
            // Kepegawaian
            'jenis_ptk',
            'status_kepegawaian',
            'status_keaktifan',
            'tanggal_bergabung (YYYY-MM-DD)',
            'tmt_pns (YYYY-MM-DD)',
            'tmt_gty (YYYY-MM-DD)',
            'masa_kerja_tahun',
            // // Keluarga
            // 'status_perkawinan',
            // 'nama_pasangan',
            // 'nik_pasangan',
            // 'pekerjaan_pasangan',
            // 'jumlah_anak',
            // // Administrasi
            // 'nama_bank',
            // 'no_rekening',
            // 'atas_nama',
            // 'cabang',
            // 'npwp',
            // 'no_bpjs_kesehatan',
            // 'no_bpjs_ketenagakerjaan',
            // 'gaji_pokok',
            // 'tunjangan_fungsional',
            // 'tunjangan_profesi',
            // Kolom-kolom di bawah ini HANYA sebagai referensi — tidak diimport otomatis
            // (data keluarga & rekening diisi manual di halaman detail guru)
            '[INFO] status_perkawinan',
            '[INFO] nama_pasangan',
            '[INFO] nik_pasangan',
            '[INFO] nama_bank',
            '[INFO] no_rekening',
            '[INFO] npwp',
        ];
        $examples = [
            [
                // Identitas
                '1234567890123456',
                '199001012015011001',
                '123456789',
                '',
                '3201010101900001',
                '',
                '',
                'Ahmad Fauzi',
                'Drs.',
                'M.Pd',
                'L',
                'Bogor',
                '1990-01-01',
                'Islam',
                'A',
                'WNI',
                'Aktif',
                'Siti Aminah',
                // Kontak
                '08123456789',
                '08123456789',
                'ahmad.fauzi@email.com',
                // Alamat
                'Jl. Raya Bogor No. 10',
                '001',
                '002',
                'Bojong',
                'Cibuluh',
                'Bogor Utara',
                'Kota Bogor',
                'Jawa Barat',
                '16152',
                // Kepegawaian
                'Guru Kelas',
                'PNS',
                'Aktif',
                '2015-01-01',
                '2015-01-01',
                '',
                '9',
                // Keluarga
                'Menikah',
                'Dewi Rahayu',
                '3201019001010001',
                'Karyawan Swasta',
                '2',
                // Administrasi
                'BRI',
                '1234567890',
                'Ahmad Fauzi',
                'BRI Cabang Bogor',
                '12.345.678.9-012.000',
                '',
                '',
                '',
                '',
                '',
            ],
            [
                // Identitas
                '9876543210987654',
                '',
                '',
                '',
                '3201020202910002',
                '',
                '',
                'Siti Rahayu',
                '',
                'S.Pd',
                'P',
                'Depok',
                '1991-02-02',
                'Islam',
                'B',
                'WNI',
                'Aktif',
                'Rahayu',
                // Kontak
                '08987654321',
                '08987654321',
                'siti.rahayu@email.com',
                // Alamat
                'Jl. Margonda No. 5',
                '003',
                '001',
                '',
                'Beji',
                'Beji',
                'Kota Depok',
                'Jawa Barat',
                '16424',
                // Kepegawaian
                'Guru Mapel',
                'GTT',
                'Aktif',
                '2018-07-01',
                '',
                '',
                '6',
                // Keluarga
                'Menikah',
                'Budi Santoso',
                '3201011001910002',
                'Wiraswasta',
                '1',
                // Administrasi
                'BCA',
                '9876543210',
                'Siti Rahayu',
                'BCA KCP Depok',
                '',
                '',
                '',
                '',
                '',
                '',
            ],
        ];

        $xlsx = $this->buildXlsx($headers, $examples);
        return response($xlsx, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="template_import_guru.xlsx"',
            'Content-Length' => strlen($xlsx),
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * POST /guru/import
     */
    public function import(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls|max:10240']);

        $allRows = $this->parseXlsx($request->file('file')->getRealPath());
        if (empty($allRows)) {
            return response()->json(['success' => false, 'message' => 'File kosong atau tidak bisa dibaca.'], 422);
        }

        $headerRow = array_map('trim', array_shift($allRows));
        $headerMap = array_flip($headerRow);

        $get = function (array $row, string $key) use ($headerMap): ?string {
            $idx = $headerMap[$key] ?? null;
            if ($idx === null)
                return null;
            $val = trim($row[$idx] ?? '');
            return $val === '' ? null : $val;
        };

        $results = ['berhasil' => 0, 'diperbarui' => 0, 'gagal' => 0, 'errors' => []];

        foreach ($allRows as $rowIdx => $row) {
            $baris = $rowIdx + 2;
            if (empty(array_filter($row, fn($v) => trim($v) !== '')))
                continue;

            $nuptk = $get($row, 'nuptk');
            $nama = $get($row, 'nama');

            if (!$nuptk) {
                $results['gagal']++;
                $results['errors'][] = "Baris {$baris}: NUPTK wajib diisi.";
                continue;
            }
            if (!$nama) {
                $results['gagal']++;
                $results['errors'][] = "Baris {$baris}: Nama wajib diisi (NUPTK: {$nuptk}).";
                continue;
            }

            $payload = [
                // Identitas
                'nuptk' => $nuptk,
                'nip' => $get($row, 'nip'),
                'nip_lama' => $get($row, 'nip_lama'),
                'no_karis_karsu' => $get($row, 'no_karis_karsu'),
                'nik' => $get($row, 'nik'),
                'no_kk' => $get($row, 'no_kk'),
                'no_karpeg' => $get($row, 'no_karpeg'),
                'nama' => $nama,
                'gelar_depan' => $get($row, 'gelar_depan'),
                'gelar_belakang' => $get($row, 'gelar_belakang'),
                'jenis_kelamin' => strtoupper($get($row, 'jenis_kelamin (L/P)') ?? 'L'),
                'tempat_lahir' => $get($row, 'tempat_lahir'),
                'tanggal_lahir' => $get($row, 'tanggal_lahir (YYYY-MM-DD)'),
                'agama' => $get($row, 'agama') ?? 'Islam',
                'golongan_darah' => $get($row, 'golongan_darah'),
                'kewarganegaraan' => $get($row, 'kewarganegaraan') ?? 'WNI',
                'status_hidup' => $get($row, 'status_hidup') ?? 'Aktif',
                'nama_ibu_kandung' => $get($row, 'nama_ibu_kandung'),
                // Kontak
                'no_hp' => $get($row, 'no_hp') ?? '-',
                'no_wa' => $get($row, 'no_wa'),
                'email' => $get($row, 'email'),
                // Alamat
                'alamat_jalan' => $get($row, 'alamat_jalan'),
                'rt' => $get($row, 'rt'),
                'rw' => $get($row, 'rw'),
                'dusun' => $get($row, 'dusun'),
                'desa_kelurahan' => $get($row, 'desa_kelurahan'),
                'kecamatan' => $get($row, 'kecamatan'),
                'kota_kabupaten' => $get($row, 'kota_kabupaten'),
                'provinsi' => $get($row, 'provinsi'),
                'kode_pos' => $get($row, 'kode_pos'),
                // Kepegawaian
                'jenis_ptk' => $get($row, 'jenis_ptk') ?? 'Guru Kelas',
                'status_kepegawaian' => $get($row, 'status_kepegawaian') ?? 'GTT',
                'status_keaktifan' => $get($row, 'status_keaktifan') ?? 'Aktif',
                'tanggal_bergabung' => $get($row, 'tanggal_bergabung (YYYY-MM-DD)'),
                'tmt_pns' => $get($row, 'tmt_pns (YYYY-MM-DD)'),
                'tmt_gty' => $get($row, 'tmt_gty (YYYY-MM-DD)'),
                'masa_kerja_tahun' => $get($row, 'masa_kerja_tahun'),
                // // Keluarga
                // 'status_perkawinan' => $get($row, 'status_perkawinan'),
                // 'nama_pasangan' => $get($row, 'nama_pasangan'),
                // 'nik_pasangan' => $get($row, 'nik_pasangan'),
                // 'pekerjaan_pasangan' => $get($row, 'pekerjaan_pasangan'),
                // 'jumlah_anak' => $get($row, 'jumlah_anak'),
                // // Administrasi
                // 'nama_bank' => $get($row, 'nama_bank'),
                // 'no_rekening' => $get($row, 'no_rekening'),
                // 'atas_nama' => $get($row, 'atas_nama'),
                // 'cabang' => $get($row, 'cabang'),
                // 'npwp' => $get($row, 'npwp'),
                // 'no_bpjs_kesehatan' => $get($row, 'no_bpjs_kesehatan'),
                // 'no_bpjs_ketenagakerjaan' => $get($row, 'no_bpjs_ketenagakerjaan'),
                // 'gaji_pokok' => $get($row, 'gaji_pokok'),
                // 'tunjangan_fungsional' => $get($row, 'tunjangan_fungsional'),
                // 'tunjangan_profesi' => $get($row, 'tunjangan_profesi'),
            ];

            try {
                $existing = Guru::where('nuptk', $nuptk)->first();
                if ($existing) {
                    unset($payload['nuptk']);
                    $existing->update($payload);
                    $results['diperbarui']++;
                } else {
                    Guru::create($payload);
                    $results['berhasil']++;
                }
            } catch (\Exception $e) {
                $results['gagal']++;
                $results['errors'][] = "Baris {$baris} ({$nama}): " . $e->getMessage();
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Import selesai: {$results['berhasil']} ditambahkan, {$results['diperbarui']} diperbarui, {$results['gagal']} gagal.",
            'data' => $results,
        ]);
    }

    /**
     * POST /guru/import-foto
     */
    public function importFoto(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:zip|max:51200']);

        $zip = new \ZipArchive();
        if ($zip->open($request->file('file')->getRealPath()) !== true) {
            return response()->json(['success' => false, 'message' => 'File ZIP tidak bisa dibuka.'], 422);
        }

        $results = ['berhasil' => 0, 'tidak_ditemukan' => 0, 'dilewati' => 0, 'errors' => []];
        $allowedExt = ['jpg', 'jpeg', 'png'];

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $stat = $zip->statIndex($i);
            $filename = basename($stat['name']);
            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

            if (substr($stat['name'], -1) === '/' || !in_array($ext, $allowedExt)) {
                $results['dilewati']++;
                continue;
            }

            $nuptk = pathinfo($filename, PATHINFO_FILENAME);
            $guru = Guru::where('nuptk', $nuptk)->first();

            if (!$guru) {
                $results['tidak_ditemukan']++;
                $results['errors'][] = "File {$filename}: NUPTK {$nuptk} tidak ditemukan.";
                continue;
            }

            try {
                if ($guru->foto)
                    Storage::disk('public')->delete($guru->foto);
                $newPath = "foto-guru/{$nuptk}.{$ext}";
                Storage::disk('public')->put($newPath, $zip->getFromIndex($i));
                $guru->update(['foto' => $newPath]);
                $results['berhasil']++;
            } catch (\Exception $e) {
                $results['errors'][] = "File {$filename}: " . $e->getMessage();
            }
        }
        $zip->close();

        return response()->json([
            'success' => true,
            'message' => "Import foto selesai: {$results['berhasil']} berhasil, {$results['tidak_ditemukan']} tidak ditemukan, {$results['dilewati']} dilewati.",
            'data' => $results,
        ]);
    }

    /**
     * GET /guru/export
     */
    public function export(Request $request)
    {
        $gurus = Guru::query()
            ->with([
                'waliKelas' => fn($q) => $q->where('is_active', 1)->with('kelas:id,nama_kelas'),
                'sertifikasis:id,guru_id',
            ])
            ->when($request->jenis_ptk, fn($q) => $q->where('jenis_ptk', $request->jenis_ptk))
            ->when($request->status_kepegawaian, fn($q) => $q->where('status_kepegawaian', $request->status_kepegawaian))
            ->when($request->status_keaktifan, fn($q) => $q->where('status_keaktifan', $request->status_keaktifan))
            ->when($request->search, fn($q) => $q->where('nama', 'like', "%{$request->search}%")->orWhere('nuptk', 'like', "%{$request->search}%"))
            ->orderBy('nama')
            ->get();

        $headers = [
            'No',
            'NUPTK',
            'NIP',
            'NIK',
            'Nama Lengkap',
            'Gelar Depan',
            'Gelar Belakang',
            'Jenis Kelamin',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Agama',
            'Status Perkawinan',
            'No. HP',
            'No. WA',
            'Email',
            'Jenis PTK',
            'Status Kepegawaian',
            'Status Keaktifan',
            'Tanggal Bergabung',
            'TMT PNS',
            'Alamat Jalan',
            'RT',
            'RW',
            'Desa/Kelurahan',
            'Kecamatan',
            'Kabupaten/Kota',
            'Provinsi',
            'Kode Pos',
            'Wali Kelas',
            'Bersertifikasi',
        ];
        $dataRows = $gurus->map(fn($g, $i) => [
            $i + 1,
            $g->nuptk ?? '-',
            $g->nip ?? '-',
            $g->nik ?? '-',
            trim(($g->gelar_depan ? $g->gelar_depan . ' ' : '') . $g->nama . ($g->gelar_belakang ? ', ' . $g->gelar_belakang : '')),
            $g->gelar_depan ?? '-',
            $g->gelar_belakang ?? '-',
            $g->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            $g->tempat_lahir ?? '-',
            $g->tanggal_lahir ? \Carbon\Carbon::parse($g->tanggal_lahir)->format('d/m/Y') : '-',
            $g->agama ?? '-',
            $g->status_perkawinan ?? '-',
            $g->no_hp ?? '-',
            $g->no_wa ?? '-',
            $g->email ?? '-',
            $g->jenis_ptk ?? '-',
            $g->status_kepegawaian ?? '-',
            $g->status_keaktifan ?? 'Aktif',
            $g->tanggal_bergabung ? \Carbon\Carbon::parse($g->tanggal_bergabung)->format('d/m/Y') : '-',
            $g->tmt_pns ? \Carbon\Carbon::parse($g->tmt_pns)->format('d/m/Y') : '-',
            $g->alamat_jalan ?? '-',
            $g->rt ?? '-',
            $g->rw ?? '-',
            $g->desa_kelurahan ?? '-',
            $g->kecamatan ?? '-',
            $g->kota_kabupaten ?? '-',
            $g->provinsi ?? '-',
            $g->kode_pos ?? '-',
            $g->waliKelas->first()?->kelas?->nama_kelas ?? 'Tidak Ada',
            $g->sertifikasis->count() > 0 ? 'Ya' : 'Tidak',
        ])->toArray();

        $filename = 'data_guru_' . now()->format('Ymd_His') . '.xlsx';
        $xlsx = $this->buildXlsx($headers, $dataRows);
        return response($xlsx, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Content-Length' => strlen($xlsx),
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * GET /guru/backup
     */
    public function exportBackup()
    {
        $gurus = Guru::with([
            'waliKelas' => fn($q) => $q->where('is_active', 1)->with('kelas:id,nama_kelas'),
            'sertifikasis:id,guru_id',
            'pendidikans',
            'jabatans',
        ])->orderBy('nama')->get();

        $headers = [
            'No',
            'NUPTK',
            'NIP',
            'NIK',
            'Nama Lengkap',
            'Gelar Depan',
            'Gelar Belakang',
            'Jenis Kelamin',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Agama',
            'Status Perkawinan',
            'No. HP',
            'No. WA',
            'Email',
            'Jenis PTK',
            'Status Kepegawaian',
            'Status Keaktifan',
            'Tanggal Bergabung',
            'TMT PNS',
            'Alamat Jalan',
            'RT',
            'RW',
            'Desa/Kelurahan',
            'Kecamatan',
            'Kabupaten/Kota',
            'Provinsi',
            'Kode Pos',
            'Wali Kelas',
            'Jml Sertifikasi',
            'Jml Pendidikan',
            'Jml Jabatan',
            'File Foto',
        ];
        $dataRows = $gurus->map(fn($g, $i) => [
            $i + 1,
            $g->nuptk ?? '-',
            $g->nip ?? '-',
            $g->nik ?? '-',
            trim(($g->gelar_depan ? $g->gelar_depan . ' ' : '') . $g->nama . ($g->gelar_belakang ? ', ' . $g->gelar_belakang : '')),
            $g->gelar_depan ?? '-',
            $g->gelar_belakang ?? '-',
            $g->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            $g->tempat_lahir ?? '-',
            $g->tanggal_lahir ? \Carbon\Carbon::parse($g->tanggal_lahir)->format('d/m/Y') : '-',
            $g->agama ?? '-',
            $g->status_perkawinan ?? '-',
            $g->no_hp ?? '-',
            $g->no_wa ?? '-',
            $g->email ?? '-',
            $g->jenis_ptk ?? '-',
            $g->status_kepegawaian ?? '-',
            $g->status_keaktifan ?? 'Aktif',
            $g->tanggal_bergabung ? \Carbon\Carbon::parse($g->tanggal_bergabung)->format('d/m/Y') : '-',
            $g->tmt_pns ? \Carbon\Carbon::parse($g->tmt_pns)->format('d/m/Y') : '-',
            $g->alamat_jalan ?? '-',
            $g->rt ?? '-',
            $g->rw ?? '-',
            $g->desa_kelurahan ?? '-',
            $g->kecamatan ?? '-',
            $g->kota_kabupaten ?? '-',
            $g->provinsi ?? '-',
            $g->kode_pos ?? '-',
            $g->waliKelas->first()?->kelas?->nama_kelas ?? 'Tidak Ada',
            $g->sertifikasis->count(),
            $g->pendidikans->count(),
            $g->jabatans->count(),
            $g->foto ? basename($g->foto) : '-',
        ])->toArray();

        $xlsxBinary = $this->buildXlsx($headers, $dataRows);

        $tmpFile = tempnam(sys_get_temp_dir(), 'backup_guru_');
        $zip = new \ZipArchive();
        $zip->open($tmpFile, \ZipArchive::OVERWRITE);
        $zip->addFromString('data_guru.xlsx', $xlsxBinary);
        foreach ($gurus as $guru) {
            if (!$guru->foto)
                continue;
            $fotoPath = storage_path('app/public/' . $guru->foto);
            if (file_exists($fotoPath)) {
                $ext = pathinfo($fotoPath, PATHINFO_EXTENSION);
                $zip->addFile($fotoPath, 'foto-guru/' . ($guru->nuptk ?? $guru->id) . '.' . $ext);
            }
        }
        $zip->addFromString(
            'README.txt',
            "BACKUP DATA GURU - " . now()->format('d/m/Y H:i:s') . "\r\n"
            . "SIAKAD MI Nurul Huda 3\r\n\r\n"
            . "Isi: data_guru.xlsx (" . count($gurus) . " guru) + foto-guru/\r\n"
            . "Import kembali: gunakan fitur Import di Master Data Guru.\r\n"
        );
        $zip->close();

        $zipBinary = file_get_contents($tmpFile);
        unlink($tmpFile);

        $filename = 'backup_guru_' . now()->format('Ymd_His') . '.zip';
        return response($zipBinary, 200, [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Content-Length' => strlen($zipBinary),
            'Cache-Control' => 'no-cache',
        ]);
    }

    // -- Private helpers --------------------------------------------------

    private function parseXlsx(string $filePath): array
    {
        $zip = new \ZipArchive();
        if ($zip->open($filePath) !== true)
            return [];

        $sharedStrings = [];
        $ssXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($ssXml !== false) {
            $ss = simplexml_load_string($ssXml);
            foreach ($ss->si as $si) {
                $t = '';
                foreach ($si->r as $r)
                    $t .= (string) $r->t;
                if ($t === '' && isset($si->t))
                    $t = (string) $si->t;
                $sharedStrings[] = $t;
            }
        }

        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();
        if ($sheetXml === false)
            return [];

        $sheet = simplexml_load_string($sheetXml);
        $rows = [];
        foreach ($sheet->sheetData->row as $row) {
            $rowArr = [];
            $maxCol = 0;
            foreach ($row->c as $cell) {
                $ref = (string) $cell['r'];
                $colLetters = preg_replace('/[0-9]/', '', $ref);
                $colIdx = $this->colLetterToIndex($colLetters);
                $maxCol = max($maxCol, $colIdx);
                $t = (string) $cell['t'];
                $val = isset($cell->v) ? (string) $cell->v : '';
                if ($t === 's' && $val !== '')
                    $val = $sharedStrings[(int) $val] ?? '';
                $rowArr[$colIdx] = $val;
            }
            for ($i = 0; $i <= $maxCol; $i++) {
                if (!isset($rowArr[$i]))
                    $rowArr[$i] = '';
            }
            ksort($rowArr);
            $rows[] = array_values($rowArr);
        }
        return $rows;
    }

    private function buildXlsx(array $headerRow, array $dataRows): string
    {
        $strings = [];
        $addStr = function (string $s) use (&$strings): int {
            $key = array_search($s, $strings, true);
            if ($key === false) {
                $strings[] = $s;
                return count($strings) - 1;
            }
            return $key;
        };

        $sheetRowsXml = '';
        $allRows = array_merge([$headerRow], $dataRows);
        foreach ($allRows as $ri => $row) {
            $rowNum = $ri + 1;
            $isHeader = $ri === 0;
            $cellsXml = '';
            foreach ($row as $ci => $val) {
                $colLetter = $this->indexToColLetter($ci);
                $cellRef = "{$colLetter}{$rowNum}";
                $sAttr = $isHeader ? ' s="1"' : ($ri % 2 === 0 ? ' s="2"' : '');
                $strIdx = $addStr((string) $val);
                $cellsXml .= "<c r=\"{$cellRef}\" t=\"s\"{$sAttr}><v>{$strIdx}</v></c>";
            }
            $sheetRowsXml .= "<row r=\"{$rowNum}\">{$cellsXml}</row>";
        }

        $ssItems = '';
        foreach ($strings as $s) {
            $ssItems .= '<si><t xml:space="preserve">' . htmlspecialchars($s, ENT_XML1) . '</t></si>';
        }
        $ssCount = count($strings);
        $ssXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . "<sst xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" count=\"{$ssCount}\" uniqueCount=\"{$ssCount}\">{$ssItems}</sst>";

        $colCount = count($headerRow);
        $colDefsXml = '<cols>';
        for ($ci = 0; $ci < $colCount; $ci++) {
            $maxLen = 10;
            foreach ($allRows as $row) {
                $maxLen = max($maxLen, mb_strlen((string) ($row[$ci] ?? '')));
            }
            $width = min($maxLen + 4, 60);
            $colNum = $ci + 1;
            $colDefsXml .= "<col min=\"{$colNum}\" max=\"{$colNum}\" width=\"{$width}\" customWidth=\"1\"/>";
        }
        $colDefsXml .= '</cols>';

        $sheetXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . $colDefsXml . "<sheetData>{$sheetRowsXml}</sheetData></worksheet>";

        $stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . '<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font>'
            . '<font><b/><sz val="11"/><name val="Calibri"/><color rgb="FFFFFFFF"/></font>'
            . '<font><sz val="11"/><name val="Calibri"/></font></fonts>'
            . '<fills count="4"><fill><patternFill patternType="none"/></fill>'
            . '<fill><patternFill patternType="gray125"/></fill>'
            . '<fill><patternFill patternType="solid"><fgColor rgb="FF5B21B6"/></patternFill></fill>'
            . '<fill><patternFill patternType="solid"><fgColor rgb="FFF5F3FF"/></patternFill></fill></fills>'
            . '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>'
            . '<border><left style="thin"><color rgb="FFCCCCCC"/></left>'
            . '<right style="thin"><color rgb="FFCCCCCC"/></right>'
            . '<top style="thin"><color rgb="FFCCCCCC"/></top>'
            . '<bottom style="thin"><color rgb="FFCCCCCC"/></bottom></border></borders>'
            . '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            . '<cellXfs count="3">'
            . '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"><alignment wrapText="0"/></xf>'
            . '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0"><alignment horizontal="center" wrapText="0"/></xf>'
            . '<xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0"><alignment wrapText="0"/></xf>'
            . '</cellXfs></styleSheet>';

        $workbookXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            . '<sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets></workbook>';
        $workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            . '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>'
            . '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            . '</Relationships>';
        $rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            . '</Relationships>';
        $contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            . '<Default Extension="xml" ContentType="application/xml"/>'
            . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            . '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            . '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
            . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            . '</Types>';

        $tmpFile = tempnam(sys_get_temp_dir(), 'xlsx_');
        $zip = new \ZipArchive();
        $zip->open($tmpFile, \ZipArchive::OVERWRITE);
        $zip->addFromString('[Content_Types].xml', $contentTypes);
        $zip->addFromString('_rels/.rels', $rootRels);
        $zip->addFromString('xl/workbook.xml', $workbookXml);
        $zip->addFromString('xl/_rels/workbook.xml.rels', $workbookRels);
        $zip->addFromString('xl/worksheets/sheet1.xml', $sheetXml);
        $zip->addFromString('xl/sharedStrings.xml', $ssXml);
        $zip->addFromString('xl/styles.xml', $stylesXml);
        $zip->close();

        $binary = file_get_contents($tmpFile);
        unlink($tmpFile);
        return $binary;
    }

    private function indexToColLetter(int $index): string
    {
        $letter = '';
        $index++;
        while ($index > 0) {
            $index--;
            $letter = chr(65 + ($index % 26)) . $letter;
            $index = intdiv($index, 26);
        }
        return $letter;
    }

    private function colLetterToIndex(string $col): int
    {
        $col = strtoupper($col);
        $index = 0;
        for ($i = 0; $i < strlen($col); $i++) {
            $index = $index * 26 + (ord($col[$i]) - 64);
        }
        return $index - 1;
    }
}