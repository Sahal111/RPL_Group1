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
use App\Models\PlotGuruMapel;
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
            'plotGuruMapels.mapel:id,kode,nama_mapel,kelompok',
            'plotGuruMapels.kelas:id,nama_kelas,tingkat',
            'plotGuruMapels.tahunAjaran:id,tahun',
            'plotGuruMapels.semester:id,nama',
            'jadwals.mapel:id,nama_mapel',
            'jadwals.kelas:id,nama_kelas',
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

        $guru->delete();

        return response()->json(['success' => true, 'message' => 'Data guru berhasil dihapus.']);
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
            'tanggal_berlaku' => 'nullable|date',
            'tanggal_kadaluarsa' => 'nullable|date',
            'penerbit' => 'nullable|string|max:150',
            'keterangan' => 'nullable|string|max:500',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store("guru-dokumen/{$guru->id}", 'public');

        $dokumen = $guru->dokumens()->create([
            'kategori' => $request->kategori,
            'nama_dokumen' => $request->nama_dokumen ?? $request->kategori,
            'nomor_dokumen' => $request->nomor_dokumen,
            'tanggal_dokumen' => $request->tanggal_dokumen,
            'tanggal_berlaku' => $request->tanggal_berlaku,
            'tanggal_kadaluarsa' => $request->tanggal_kadaluarsa,
            'penerbit' => $request->penerbit,
            'keterangan' => $request->keterangan,
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

    public function updateDokumen(Request $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $dokumen = $guru->dokumens()->findOrFail($id);

        $request->validate([
            'kategori' => 'required|in:identitas,kepegawaian,pendidikan,sertifikasi,penghargaan,lainnya',
            'nama_dokumen' => 'nullable|string|max:150',
            'nomor_dokumen' => 'nullable|string|max:80',
            'tanggal_dokumen' => 'nullable|date',
            'tanggal_berlaku' => 'nullable|date',
            'tanggal_kadaluarsa' => 'nullable|date',
            'penerbit' => 'nullable|string|max:150',
            'keterangan' => 'nullable|string|max:500',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $dokumen->kategori = $request->kategori;
        $dokumen->nama_dokumen = $request->nama_dokumen ?? $request->kategori;
        $dokumen->nomor_dokumen = $request->nomor_dokumen;
        $dokumen->tanggal_dokumen = $request->tanggal_dokumen;
        $dokumen->tanggal_berlaku = $request->tanggal_berlaku;
        $dokumen->tanggal_kadaluarsa = $request->tanggal_kadaluarsa;
        $dokumen->penerbit = $request->penerbit;
        $dokumen->keterangan = $request->keterangan;

        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($dokumen->file_path);
            $file = $request->file('file');
            $dokumen->file_path = $file->store("guru-dokumen/{$guru->id}", 'public');
            $dokumen->file_type = $file->getMimeType();
            $dokumen->file_size = $file->getSize();
        }

        $dokumen->save();

        return response()->json(['success' => true, 'message' => 'Dokumen berhasil diperbarui.', 'data' => $dokumen]);
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

    public function updateKompetensi(Request $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $komp = $guru->kompetensi()->findOrFail($id);

        $request->validate([
            'jenis' => 'required|in:bahasa,it,bidang_keahlian,lainnya',
            'nama' => 'required|string|max:150',
            'tingkat' => 'nullable|in:Dasar,Menengah,Mahir,Ahli',
            'keterangan' => 'nullable|string|max:255',
        ]);

        $komp->update($request->only(['jenis', 'nama', 'tingkat', 'keterangan']));
        return response()->json(['success' => true, 'message' => 'Kompetensi diperbarui.', 'data' => $komp]);
    }

    public function destroyKompetensi($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $guru->kompetensi()->findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Kompetensi dihapus.']);
    }

    // ────────────────────────────────────────────────────────
    // SECTION: PENUGASAN (PLOT GURU MAPEL)
    // ────────────────────────────────────────────────────────

    public function getPenugasan($nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $data = $guru->plotGuruMapels()
            ->with([
                'mapel:id,kode,nama_mapel,kelompok',
                'kelas:id,nama_kelas,tingkat',
                'tahunAjaran:id,tahun',
                'semester:id,nama',
            ])
            ->orderByDesc('tahun_ajaran_id')
            ->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function storePenugasan(Request $request, $nuptk)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();

        $request->validate([
            'mapel_id' => 'required|integer|exists:mapels,id',
            'kelas_id' => 'required|integer|exists:kelas,id',
            'tahun_ajaran_id' => 'required|integer|exists:tahun_ajarans,id',
            'semester_id' => 'required|integer|exists:semesters,id',
            'beban_jam' => 'nullable|integer|min:1|max:40',
        ]);

        // cek duplikat
        $exists = PlotGuruMapel::where('guru_id', $guru->id)
            ->where('mapel_id', $request->mapel_id)
            ->where('kelas_id', $request->kelas_id)
            ->where('semester_id', $request->semester_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Penugasan ini sudah ada untuk semester yang dipilih.',
            ], 422);
        }

        $plot = PlotGuruMapel::create([
            'guru_id' => $guru->id,
            'mapel_id' => $request->mapel_id,
            'kelas_id' => $request->kelas_id,
            'tahun_ajaran_id' => $request->tahun_ajaran_id,
            'semester_id' => $request->semester_id,
            'beban_jam' => $request->beban_jam ?? 0,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Penugasan berhasil ditambahkan.',
            'data' => $plot->load([
                'mapel:id,kode,nama_mapel,kelompok',
                'kelas:id,nama_kelas,tingkat',
                'tahunAjaran:id,tahun',
                'semester:id,nama',
            ]),
        ], 201);
    }

    public function destroyPenugasan($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $plot = $guru->plotGuruMapels()->findOrFail($id);

        // hapus jadwal yang terkait dulu
        \App\Models\JadwalPelajaran::where('plot_id', $plot->id)->delete();
        $plot->delete();

        return response()->json(['success' => true, 'message' => 'Penugasan dihapus beserta jadwalnya.']);
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
            'jenis_mutasi' => 'required|in:Masuk,Keluar,Internal,Penugasan Sementara,Kembali Bertugas',
            'sekolah_asal' => 'nullable|string|max:200',
            'npsn_asal' => 'nullable|string|max:10',
            'sekolah_tujuan' => 'nullable|string|max:200',
            'npsn_tujuan' => 'nullable|string|max:10',
            'tanggal_mutasi' => 'required|date',
            'tmt_mutasi' => 'nullable|date',
            'jabatan_sebelum' => 'nullable|string|max:100',
            'jabatan_sesudah' => 'nullable|string|max:100',
            'status_kepegawaian' => 'nullable|in:PNS,PPPK,GTY,GTT',
            'no_sk' => 'nullable|string|max:80',
            'tanggal_sk' => 'nullable|date',
            'instansi_penerbit_sk' => 'nullable|string|max:200',
            'alasan_mutasi' => 'nullable|string|max:200',
            'keterangan' => 'nullable|string',
            'file_sk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'tanggal_berakhir' => 'nullable|date',
        ]);

        $data = $request->only([
            'jenis_mutasi',
            'sekolah_asal',
            'npsn_asal',
            'sekolah_tujuan',
            'npsn_tujuan',
            'tanggal_mutasi',
            'tmt_mutasi',
            'tanggal_berakhir',
            'jabatan_sebelum',
            'jabatan_sesudah',
            'status_kepegawaian',
            'no_sk',
            'tanggal_sk',
            'instansi_penerbit_sk',
            'alasan_mutasi',
            'keterangan',
        ]);

        if ($request->hasFile('file_sk')) {
            $data['file_sk'] = $request->file('file_sk')->store("guru-dokumen/{$guru->id}/mutasi", 'public');
        }

        $mutasi = $guru->mutasi()->create($data);

        // Sinkron status_keaktifan otomatis
        if ($data['jenis_mutasi'] === 'Keluar') {
            $guru->update(['status_keaktifan' => 'Keluar']);
        } elseif ($data['jenis_mutasi'] === 'Masuk') {
            $guru->update(['status_keaktifan' => 'Aktif']);
        } elseif ($data['jenis_mutasi'] === 'Kembali Bertugas') {
            $guru->update(['status_keaktifan' => 'Aktif']);
        }

        // Sinkron jabatan aktif saat mutasi internal
        if ($data['jenis_mutasi'] === 'Internal' && !empty($data['jabatan_sesudah'])) {
            $jabatanAktif = $guru->jabatanAktif;
            if ($jabatanAktif) {
                $jabatanAktif->update([
                    'jabatan' => $data['jabatan_sesudah'],
                    'tanggal_selesai' => $data['tanggal_mutasi'] ?? null,
                    'status_jabatan' => 'Mutasi',
                    'is_current' => false,
                ]);
            }
            $guru->jabatans()->create([
                'jabatan' => $data['jabatan_sesudah'],
                'jenis_jabatan' => $jabatanAktif->jenis_jabatan ?? 'Fungsional',
                'unit_kerja' => $jabatanAktif->unit_kerja ?? '',
                'tmt_jabatan' => $data['tmt_mutasi'] ?? $data['tanggal_mutasi'],
                'status_kepegawaian' => $data['status_kepegawaian'] ?? ($jabatanAktif->status_kepegawaian ?? null),
                'no_sk' => $data['no_sk'] ?? null,
                'tanggal_sk' => $data['tanggal_sk'] ?? null,
                'instansi_pengangkat' => $data['instansi_penerbit_sk'] ?? null,
                'status_jabatan' => 'Aktif',
                'is_current' => true,
            ]);
        }

        return response()->json(['success' => true, 'message' => 'Riwayat mutasi ditambahkan.', 'data' => $mutasi], 201);
    }

    public function updateMutasi(Request $request, $nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $mutasi = $guru->mutasi()->findOrFail($id);

        $request->validate([
            'jenis_mutasi' => 'required|in:Masuk,Keluar,Internal,Penugasan Sementara,Kembali Bertugas',
            'sekolah_asal' => 'nullable|string|max:200',
            'npsn_asal' => 'nullable|string|max:10',
            'sekolah_tujuan' => 'nullable|string|max:200',
            'npsn_tujuan' => 'nullable|string|max:10',
            'tanggal_mutasi' => 'required|date',
            'tmt_mutasi' => 'nullable|date',
            'jabatan_sebelum' => 'nullable|string|max:100',
            'jabatan_sesudah' => 'nullable|string|max:100',
            'status_kepegawaian' => 'nullable|in:PNS,PPPK,GTY,GTT',
            'no_sk' => 'nullable|string|max:80',
            'tanggal_sk' => 'nullable|date',
            'instansi_penerbit_sk' => 'nullable|string|max:200',
            'alasan_mutasi' => 'nullable|string|max:200',
            'keterangan' => 'nullable|string',
            'file_sk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'tanggal_berakhir' => 'nullable|date',
        ]);

        $data = $request->only([
            'jenis_mutasi',
            'sekolah_asal',
            'npsn_asal',
            'sekolah_tujuan',
            'npsn_tujuan',
            'tanggal_mutasi',
            'tmt_mutasi',
            'tanggal_berakhir',
            'jabatan_sebelum',
            'jabatan_sesudah',
            'status_kepegawaian',
            'no_sk',
            'tanggal_sk',
            'instansi_penerbit_sk',
            'alasan_mutasi',
            'keterangan',
        ]);

        if ($request->hasFile('file_sk')) {
            if ($mutasi->file_sk)
                Storage::disk('public')->delete($mutasi->file_sk);
            $data['file_sk'] = $request->file('file_sk')->store("guru-dokumen/{$guru->id}/mutasi", 'public');
        }

        $jenisBaru = $data['jenis_mutasi'];
        $jenisLama = $mutasi->jenis_mutasi;

        $mutasi->update($data);

        // Re-sync status hanya kalau jenis berubah ke/dari Keluar atau Masuk
        if ($jenisBaru !== $jenisLama) {
            match ($jenisBaru) {
                'Keluar' => $guru->update(['status_keaktifan' => 'Keluar']),
                'Masuk', 'Kembali Bertugas' => $guru->update(['status_keaktifan' => 'Aktif']),
                default => null,
            };
        }

        return response()->json(['success' => true, 'message' => 'Riwayat mutasi diperbarui.', 'data' => $mutasi]);
    }

    public function destroyMutasi($nuptk, $id)
    {
        $guru = Guru::where('nuptk', $nuptk)->firstOrFail();
        $mutasi = $guru->mutasi()->findOrFail($id);

        $jenis = $mutasi->jenis_mutasi;

        if ($mutasi->file_sk)
            Storage::disk('public')->delete($mutasi->file_sk);
        $mutasi->delete();

        // Reverse status setelah hapus — cek dari sisa record mutasi yang ada
        $sisaMutasi = $guru->mutasi()->orderByDesc('tanggal_mutasi')->first();
        if ($sisaMutasi) {
            match ($sisaMutasi->jenis_mutasi) {
                'Keluar' => $guru->update(['status_keaktifan' => 'Keluar']),
                'Masuk', 'Kembali Bertugas' => $guru->update(['status_keaktifan' => 'Aktif']),
                default => null,
            };
        } elseif ($jenis === 'Keluar') {
            // Tidak ada sisa mutasi, dan yang dihapus adalah Keluar → balik Aktif
            $guru->update(['status_keaktifan' => 'Aktif']);
        }

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
     * Multi-sheet: Sheet1=Data Utama, Sheet2=Keluarga & Anak, Sheet3=Rekening & Adm,
     *              Sheet4=Pendidikan, Sheet5=Sertifikasi, Sheet6=Diklat,
     *              Sheet7=Jabatan, Sheet8=Inpassing, Sheet9=Mutasi, Sheet10=Kompetensi
     */
    public function downloadTemplate()
    {
        // NUPTK contoh — satu guru, semua sheet pakai NUPTK yang sama
        $nuptk = '1234567890123456';

        // ── Sheet 1: Data Utama ─────────────────────────────────────────
        $sheetUtamaHeaders = [
            'nuptk*',
            'nip',
            'nip_lama',
            'no_karpeg',
            'no_karis_karsu',
            'nik',
            'no_kk',
            'nama*',
            'gelar_depan',
            'gelar_belakang',
            'jenis_kelamin (L/P)*',
            'tempat_lahir*',
            'tanggal_lahir (YYYY-MM-DD)*',
            'agama',
            'golongan_darah',
            'kewarganegaraan',
            'status_hidup',
            'nama_ibu_kandung',
            'no_hp*',
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
            'jenis_ptk*',
            'status_kepegawaian*',
            'status_keaktifan',
            'tanggal_bergabung (YYYY-MM-DD)',
            'tmt_pns (YYYY-MM-DD)',
            'tmt_gty (YYYY-MM-DD)',
            'masa_kerja_tahun',
            'no_sk_pengangkatan',
            'tgl_sk_pengangkatan (YYYY-MM-DD)',
            'instansi_pengangkat',
        ];
        $sheetUtamaExample = [
            [
                $nuptk,
                '199001012015011001',
                '',
                'G-123456',
                '',
                '3201010101900001',
                '3201010101900001',
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
                '08123456789',
                '08123456789',
                'ahmad.fauzi@email.com',
                'Jl. Raya Bogor No.10',
                '001',
                '002',
                'Bojong',
                'Cibuluh',
                'Bogor Utara',
                'Kota Bogor',
                'Jawa Barat',
                '16152',
                'Guru Kelas',
                'PNS',
                'Aktif',
                '2015-01-01',
                '2015-01-01',
                '',
                '9',
                'SK-001/2015',
                '2015-01-01',
                'Kemendikbud',
            ]
        ];

        // ── Sheet 2: Keluarga & Anak ────────────────────────────────────
        $sheetKeluargaHeaders = [
            'nuptk* (harus ada di Sheet1)',
            'status_perkawinan',
            'nama_pasangan',
            'nik_pasangan',
            'pekerjaan_pasangan',
            'jumlah_anak',
            'nama_anak',
            'jenis_kelamin_anak (L/P)',
            'tanggal_lahir_anak (YYYY-MM-DD)',
            'urutan_anak',
        ];
        $sheetKeluargaExample = [
            // baris 1: data keluarga + anak pertama
            [$nuptk, 'Menikah', 'Dewi Rahayu', '3201019001010001', 'Karyawan Swasta', '2', 'Muhammad Rizki', 'L', '2015-03-10', '1'],
            // baris 2: anak kedua — kolom keluarga dikosongkan, NUPTK sama
            [$nuptk, '', '', '', '', '', 'Fatimah Azzahra', 'P', '2017-07-22', '2'],
        ];

        // ── Sheet 3: Rekening ───────────────────────────────────────────
        $sheetRekeningHeaders = [
            'nuptk* (harus ada di Sheet1)',
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
        ];
        $sheetRekeningExample = [
            [
                $nuptk,
                'BRI',
                '001234567890',
                'Ahmad Fauzi',
                'BRI Cabang Bogor Kota',
                '12.345.678.9-012.000',
                '0001234567890',
                '00087654321',
                '3500000',
                '500000',
                '1500000',
            ]
        ];

        // ── Sheet 4: Pendidikan ─────────────────────────────────────────
        $sheetPendidikanHeaders = [
            'nuptk* (harus ada di Sheet1)',
            'jenjang (SD/SMP/SMA-SMK/D1/D2/D3/D4/S1/S2/S3)*',
            'nama_sekolah*',
            'jurusan',
            'prodi',
            'tahun_masuk',
            'tahun_lulus',
            'no_ijazah',
        ];
        $sheetPendidikanExample = [
            // S1 — pendidikan terakhir sebelum S2
            [$nuptk, 'S1', 'Universitas Pendidikan Indonesia', 'PGSD', 'Pendidikan Guru SD', '2008', '2012', 'IJZ-S1-2012-001'],
            // S2 — pendidikan tertinggi
            [$nuptk, 'S2', 'Universitas Negeri Jakarta', 'Manajemen Pendidikan', '', '2013', '2015', 'IJZ-S2-2015-001'],
        ];

        // ── Sheet 5: Sertifikasi ────────────────────────────────────────
        $sheetSertifikasiHeaders = [
            'nuptk* (harus ada di Sheet1)',
            'jenis_sertifikasi*',
            'no_sertifikat',
            'nrg',
            'tahun_sertifikasi',
            'lptk',
            'bidang_studi',
            'tanggal_terbit (YYYY-MM-DD)',
            'expired_at (YYYY-MM-DD)',
        ];
        $sheetSertifikasiExample = [
            [
                $nuptk,
                'Guru Kelas SD',
                'SERT-2016-001',
                '12345678901234',
                '2016',
                'UPI Bandung',
                'Guru Kelas SD',
                '2016-12-01',
                '',
            ]
        ];

        // ── Sheet 6: Diklat ─────────────────────────────────────────────
        $sheetDiklatHeaders = [
            'nuptk* (harus ada di Sheet1)',
            'nama_diklat*',
            'penyelenggara',
            'jenis (diklat/bimtek/workshop/seminar/pelatihan/kursus)',
            'tingkat (Kecamatan/Kabupaten-Kota/Provinsi/Nasional/Internasional)',
            'tanggal_mulai (YYYY-MM-DD)',
            'tanggal_selesai (YYYY-MM-DD)',
            'jumlah_jam',
            'peran (peserta/narasumber/panitia/moderator)',
            'no_sertifikat',
            'keterangan',
        ];
        $sheetDiklatExample = [
            [$nuptk, 'Pelatihan Kurikulum Merdeka', 'Kemendikbud', 'bimtek', 'Nasional', '2023-07-10', '2023-07-14', '32', 'peserta', 'BT-2023-001', 'Implementasi Kurikulum Merdeka'],
            [$nuptk, 'Workshop Penilaian Autentik', 'Dinas Pendidikan Kota Bogor', 'workshop', 'Kabupaten-Kota', '2022-11-05', '2022-11-06', '16', 'peserta', 'WS-2022-015', ''],
        ];

        // ── Sheet 7: Jabatan ────────────────────────────────────────────
        $sheetJabatanHeaders = [
            'nuptk* (harus ada di Sheet1)',
            'jenis_jabatan (Struktural/Fungsional/Tambahan)*',
            'jabatan*',
            'unit_kerja',
            'instansi_pengangkat',
            'golongan',
            'pangkat',
            'jenis_pengangkatan',
            'status_kepegawaian_jabatan (CPNS/PNS/PPPK/GTY/GTT/Honorer/Kontrak)',
            'no_sk',
            'tanggal_sk (YYYY-MM-DD)',
            'pejabat_penandatangan',
            'tmt_jabatan (YYYY-MM-DD)',
            'tanggal_selesai (YYYY-MM-DD)',
            'status_jabatan (Aktif/Berakhir/Nonaktif/Mutasi/Pensiun)',
            'is_current (1/0)',
            'uraian_tugas',
        ];
        $sheetJabatanExample = [
            // jabatan lama — sudah berakhir
            [$nuptk, 'Fungsional', 'Guru Pertama', 'MI Nurul Huda 3', 'Kemendikbud', 'III/a', 'Penata Muda', 'Pengangkatan Baru', 'PNS', 'SK-2015-001', '2015-01-01', 'Kepala Dinas Kota Bogor', '2015-01-01', '2019-12-31', 'Berakhir', '0', ''],
            // jabatan aktif sekarang
            [$nuptk, 'Fungsional', 'Guru Madya', 'MI Nurul Huda 3', 'Kemendikbud', 'III/c', 'Penata', 'Kenaikan Jabatan', 'PNS', 'SK-2020-001', '2020-01-01', 'Kepala Dinas Kota Bogor', '2020-01-01', '', 'Aktif', '1', 'Mengajar kelas IV-VI'],
        ];

        // ── Sheet 8: Inpassing ──────────────────────────────────────────
        $sheetInpassingHeaders = [
            'nuptk* (harus ada di Sheet1)',
            'no_sk*',
            'tanggal_sk (YYYY-MM-DD)*',
            'tmt_inpassing (YYYY-MM-DD)*',
            'golongan_sesudah',
            'jabatan_fungsional',
            'angka_kredit',
        ];
        $sheetInpassingExample = [
            [
                $nuptk,
                'SK-INP-2021-001',
                '2021-03-01',
                '2021-04-01',
                'III/c',
                'Guru Madya',
                '300.50',
            ]
        ];

        // ── Sheet 9: Mutasi ─────────────────────────────────────────────
        $sheetMutasiHeaders = [
            'nuptk* (harus ada di Sheet1)',
            'jenis_mutasi (Masuk/Keluar/Internal)*',
            'sekolah_asal',
            'npsn_asal',
            'sekolah_tujuan',
            'npsn_tujuan',
            'tanggal_mutasi (YYYY-MM-DD)*',
            'no_sk',
            'tanggal_sk (YYYY-MM-DD)',
            'keterangan',
        ];
        $sheetMutasiExample = [
            [
                $nuptk,
                'Masuk',
                'SDN Budi Luhur 1 Bogor',
                '20217891',
                'MI Nurul Huda 3',
                '20123456',
                '2015-01-01',
                'SK-MUT-2015-001',
                '2014-12-15',
                'Mutasi atas permintaan sendiri',
            ]
        ];

        // ── Sheet 10: Kompetensi ────────────────────────────────────────
        $sheetKompetensiHeaders = [
            'nuptk* (harus ada di Sheet1)',
            'jenis (bahasa/it/bidang_keahlian/lainnya)*',
            'nama*',
            'tingkat (Dasar/Menengah/Mahir/Ahli)',
            'keterangan',
        ];
        $sheetKompetensiExample = [
            [$nuptk, 'bahasa', 'Bahasa Inggris', 'Menengah', 'TOEFL 450'],
            [$nuptk, 'it', 'Microsoft Office', 'Mahir', 'Word, Excel, PowerPoint'],
            [$nuptk, 'bidang_keahlian', 'Pendidikan Dasar', 'Ahli', 'Spesialisasi kelas rendah'],
        ];

        // ── Sheet 11: Kontak Darurat ────────────────────────────────────
        $sheetKontakHeaders = [
            'nuptk* (harus ada di Sheet1)',
            'nama*',
            'hubungan*',
            'no_hp*',
            'alamat',
            'is_primary (1/0)',
        ];
        $sheetKontakExample = [
            // kontak utama
            [$nuptk, 'Dewi Rahayu', 'Istri', '081234567899', 'Jl. Raya Bogor No.10, Cibuluh, Bogor Utara', '1'],
            // kontak alternatif
            [$nuptk, 'Hasan Fauzi', 'Kakak', '081298765432', 'Jl. Sudirman No.5, Bogor Tengah', '0'],
        ];

        // ── Sheet Petunjuk ──────────────────────────────────────────────
        $sheetPetunjukHeaders = ['PETUNJUK PENGISIAN TEMPLATE IMPORT GURU'];
        $sheetPetunjukExample = [
            [''],
            ['CARA PENGGUNAAN:'],
            ['1. Sheet "Data Utama" WAJIB diisi terlebih dahulu. Satu baris = satu guru.'],
            ['2. Sheet lain bersifat opsional, diisi sesuai data yang tersedia.'],
            ['3. Kolom bertanda * (bintang) wajib diisi, kolom lain boleh dikosongkan.'],
            ['4. NUPTK di setiap sheet HARUS sama persis dengan NUPTK di sheet "Data Utama".'],
            ['5. Format tanggal: YYYY-MM-DD (contoh: 2025-07-31).'],
            ['6. Hapus baris contoh sebelum mengisi data asli, atau timpa langsung.'],
            [''],
            ['PENJELASAN TIAP SHEET:'],
            ['Sheet "Data Utama"   — Data identitas & kepegawaian guru (tabel: gurus)'],
            ['Sheet "Keluarga"     — Status perkawinan, pasangan, dan data anak (tabel: guru_keluargas + guru_anaks)'],
            ['                       Untuk anak ke-2 dst: baris baru dengan NUPTK sama, kolom keluarga dikosongkan.'],
            ['Sheet "Rekening"     — Rekening bank, NPWP, BPJS, dan tunjangan (tabel: guru_rekenings)'],
            ['Sheet "Pendidikan"   — Riwayat pendidikan formal (tabel: guru_pendidikans). Bisa lebih dari 1 baris.'],
            ['Sheet "Sertifikasi"  — Data sertifikat pendidik (tabel: guru_sertifikasis). Bisa lebih dari 1 baris.'],
            ['Sheet "Diklat"       — Riwayat pelatihan/diklat (tabel: guru_diklats). Bisa lebih dari 1 baris.'],
            ['Sheet "Jabatan"      — Riwayat jabatan struktural/fungsional (tabel: guru_jabatans). Bisa lebih dari 1 baris.'],
            ['                       Kolom "is_current": isi 1 untuk jabatan aktif sekarang, 0 untuk riwayat.'],
            ['Sheet "Inpassing"    — Data inpassing/penyetaraan jabatan (tabel: guru_inpassings).'],
            ['Sheet "Mutasi"       — Riwayat mutasi masuk/keluar (tabel: guru_mutasi).'],
            ['Sheet "Kompetensi"   — Kompetensi bahasa, IT, atau bidang keahlian (tabel: guru_kompetensi).'],
            ['Sheet "Kontak Darurat" — Kontak darurat guru (tabel: guru_kontak_darurat).'],
            ['                         Kolom "is_primary": isi 1 untuk kontak utama, 0 untuk alternatif.'],
            [''],
            ['NILAI YANG DIIZINKAN:'],
            ['jenis_kelamin       : L atau P'],
            ['agama               : Islam / Kristen / Katolik / Hindu / Buddha / Konghucu'],
            ['status_keaktifan    : Aktif / Nonaktif / Pensiun / Meninggal'],
            ['status_kepegawaian  : PNS / PPPK / GTY / GTT / Honorer / Kontrak'],
            ['jenis_ptk           : Guru Kelas / Guru Mapel / Guru BK / Kepala Sekolah / Tenaga Kependidikan'],
            ['jenjang pendidikan  : SD / SMP / SMA / SMK / D1 / D2 / D3 / D4 / S1 / S2 / S3'],
            ['jenis diklat        : diklat / bimtek / workshop / seminar / pelatihan / kursus'],
            ['tingkat diklat      : Kecamatan / Kabupaten-Kota / Provinsi / Nasional / Internasional'],
            ['peran diklat        : peserta / narasumber / panitia / moderator'],
            ['jenis jabatan       : Struktural / Fungsional / Tambahan'],
            ['status jabatan      : Aktif / Berakhir / Nonaktif / Mutasi / Pensiun'],
            ['status kepeg jabatan: CPNS / PNS / PPPK / GTY / GTT / Honorer / Kontrak'],
            ['jenis mutasi        : Masuk / Keluar / Internal'],
            ['jenis kompetensi    : bahasa / it / bidang_keahlian / lainnya'],
            ['tingkat kompetensi  : Dasar / Menengah / Mahir / Ahli'],
            [''],
            ['CATATAN:'],
            ['- File hasil import dapat dipakai untuk import ulang tanpa perlu modifikasi (NUPTK yang sudah ada di DB akan diperbarui).'],
            ['- File dokumen (ijazah, sertifikat, SK) tidak bisa diimport lewat Excel; upload manual via halaman detail guru.'],
            ['- Jika ada error saat import, cek kolom NUPTK dan format tanggal terlebih dahulu.'],
        ];

        $sheets = [
            ['name' => 'Petunjuk', 'headers' => $sheetPetunjukHeaders, 'rows' => $sheetPetunjukExample],
            ['name' => 'Data Utama', 'headers' => $sheetUtamaHeaders, 'rows' => $sheetUtamaExample],
            ['name' => 'Keluarga & Anak', 'headers' => $sheetKeluargaHeaders, 'rows' => $sheetKeluargaExample],
            ['name' => 'Rekening', 'headers' => $sheetRekeningHeaders, 'rows' => $sheetRekeningExample],
            ['name' => 'Pendidikan', 'headers' => $sheetPendidikanHeaders, 'rows' => $sheetPendidikanExample],
            ['name' => 'Sertifikasi', 'headers' => $sheetSertifikasiHeaders, 'rows' => $sheetSertifikasiExample],
            ['name' => 'Diklat', 'headers' => $sheetDiklatHeaders, 'rows' => $sheetDiklatExample],
            ['name' => 'Jabatan', 'headers' => $sheetJabatanHeaders, 'rows' => $sheetJabatanExample],
            ['name' => 'Inpassing', 'headers' => $sheetInpassingHeaders, 'rows' => $sheetInpassingExample],
            ['name' => 'Mutasi', 'headers' => $sheetMutasiHeaders, 'rows' => $sheetMutasiExample],
            ['name' => 'Kompetensi', 'headers' => $sheetKompetensiHeaders, 'rows' => $sheetKompetensiExample],
            ['name' => 'Kontak Darurat', 'headers' => $sheetKontakHeaders, 'rows' => $sheetKontakExample],
        ];

        $xlsx = $this->buildMultiSheetXlsx($sheets);
        return response($xlsx, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="template_import_guru.xlsx"',
            'Content-Length' => strlen($xlsx),
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * POST /guru/import — Multi-sheet import
     */
    public function import(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls|max:10240']);

        $allSheets = $this->parseMultiSheetXlsx($request->file('file')->getRealPath());
        if (empty($allSheets)) {
            return response()->json(['success' => false, 'message' => 'File kosong atau tidak bisa dibaca.'], 422);
        }

        // Helper: ambil sheet by name (case-insensitive) atau by index
        $getSheet = function (array $sheets, string|int $nameOrIdx): ?array {
            if (is_int($nameOrIdx))
                return $sheets[$nameOrIdx] ?? null;
            foreach ($sheets as $s) {
                if (strtolower($s['name']) === strtolower($nameOrIdx))
                    return $s;
            }
            return null;
        };

        $results = ['berhasil' => 0, 'diperbarui' => 0, 'gagal' => 0, 'relasi' => [], 'errors' => []];

        // ── SHEET 1 / "Data Utama" — tabel gurus ───────────────────────
        $sheetUtama = $getSheet($allSheets, 'Data Utama') ?? $getSheet($allSheets, 0);
        if ($sheetUtama) {
            $rows = $sheetUtama['rows'];
            if (!empty($rows)) {
                $headerRow = array_map('trim', array_shift($rows));
                $headerMap = array_flip($headerRow);
                $get = fn(array $row, string $key): ?string =>
                    (($idx = $headerMap[$key] ?? null) !== null && trim($row[$idx] ?? '') !== '')
                    ? trim($row[$idx]) : null;

                foreach ($rows as $rowIdx => $row) {
                    $baris = $rowIdx + 2;
                    if (empty(array_filter($row, fn($v) => trim($v) !== '')))
                        continue;

                    $nuptk = $get($row, 'nuptk*');
                    $nama = $get($row, 'nama*');
                    if (!$nuptk) {
                        $results['gagal']++;
                        $results['errors'][] = "Utama Baris {$baris}: NUPTK wajib.";
                        continue;
                    }
                    if (!$nama) {
                        $results['gagal']++;
                        $results['errors'][] = "Utama Baris {$baris}: Nama wajib (NUPTK: {$nuptk}).";
                        continue;
                    }

                    $payload = array_filter([
                        'nuptk' => $nuptk,
                        'nip' => $get($row, 'nip'),
                        'nip_lama' => $get($row, 'nip_lama'),
                        'no_karpeg' => $get($row, 'no_karpeg'),
                        'no_karis_karsu' => $get($row, 'no_karis_karsu'),
                        'nik' => $get($row, 'nik'),
                        'no_kk' => $get($row, 'no_kk'),
                        'nama' => $nama,
                        'gelar_depan' => $get($row, 'gelar_depan'),
                        'gelar_belakang' => $get($row, 'gelar_belakang'),
                        'jenis_kelamin' => strtoupper($get($row, 'jenis_kelamin (L/P)*') ?? 'L'),
                        'tempat_lahir' => $get($row, 'tempat_lahir*'),
                        'tanggal_lahir' => $get($row, 'tanggal_lahir (YYYY-MM-DD)*'),
                        'agama' => $get($row, 'agama') ?? 'Islam',
                        'golongan_darah' => $get($row, 'golongan_darah'),
                        'kewarganegaraan' => $get($row, 'kewarganegaraan') ?? 'WNI',
                        'status_hidup' => $get($row, 'status_hidup') ?? 'Aktif',
                        'nama_ibu_kandung' => $get($row, 'nama_ibu_kandung'),
                        'no_hp' => $get($row, 'no_hp*') ?? '-',
                        'no_wa' => $get($row, 'no_wa'),
                        'email' => $get($row, 'email'),
                        'alamat_jalan' => $get($row, 'alamat_jalan'),
                        'rt' => $get($row, 'rt'),
                        'rw' => $get($row, 'rw'),
                        'dusun' => $get($row, 'dusun'),
                        'desa_kelurahan' => $get($row, 'desa_kelurahan'),
                        'kecamatan' => $get($row, 'kecamatan'),
                        'kota_kabupaten' => $get($row, 'kota_kabupaten'),
                        'provinsi' => $get($row, 'provinsi'),
                        'kode_pos' => $get($row, 'kode_pos'),
                        'jenis_ptk' => $get($row, 'jenis_ptk*') ?? 'Guru Kelas',
                        'status_kepegawaian' => $get($row, 'status_kepegawaian*') ?? 'GTT',
                        'status_keaktifan' => $get($row, 'status_keaktifan') ?? 'Aktif',
                        'tanggal_bergabung' => $get($row, 'tanggal_bergabung (YYYY-MM-DD)'),
                        'tmt_pns' => $get($row, 'tmt_pns (YYYY-MM-DD)'),
                        'tmt_gty' => $get($row, 'tmt_gty (YYYY-MM-DD)'),
                        'masa_kerja_tahun' => $get($row, 'masa_kerja_tahun'),
                        'no_sk_pengangkatan' => $get($row, 'no_sk_pengangkatan'),
                        'tgl_sk_pengangkatan' => $get($row, 'tgl_sk_pengangkatan (YYYY-MM-DD)'),
                        'instansi_pengangkat' => $get($row, 'instansi_pengangkat'),
                    ], fn($v) => $v !== null);

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
                        $results['errors'][] = "Utama Baris {$baris} ({$nama}): " . $e->getMessage();
                    }
                }
            }
        }

        // Closure helper: cari guru_id by nuptk, catat error jika tidak ada
        $findGuru = function (string $nuptk, string $sheet, int $baris) use (&$results): ?Guru {
            $guru = Guru::where('nuptk', $nuptk)->first();
            if (!$guru) {
                $results['errors'][] = "{$sheet} Baris {$baris}: NUPTK {$nuptk} tidak ditemukan di DB.";
            }
            return $guru;
        };

        $countRelasi = function (string $key) use (&$results) {
            $results['relasi'][$key] = ($results['relasi'][$key] ?? 0) + 1;
        };

        // ── SHEET 2 / "Keluarga & Anak" ────────────────────────────────
        $sheetKeluarga = $getSheet($allSheets, 'Keluarga & Anak') ?? $getSheet($allSheets, 2);
        if ($sheetKeluarga) {
            $rows = $sheetKeluarga['rows'];
            if (!empty($rows)) {
                $hRow = array_map('trim', array_shift($rows));
                $hMap = array_flip($hRow);
                $get = fn($row, $key) => (($i = $hMap[$key] ?? null) !== null && trim($row[$i] ?? '') !== '') ? trim($row[$i]) : null;

                foreach ($rows as $idx => $row) {
                    $baris = $idx + 2;
                    if (empty(array_filter($row, fn($v) => trim($v) !== '')))
                        continue;
                    $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
                    if (!$nuptk)
                        continue;
                    $guru = $findGuru($nuptk, 'Keluarga', $baris);
                    if (!$guru)
                        continue;

                    try {
                        // Update/create keluarga jika ada data keluarga di baris ini
                        $spk = $get($row, 'status_perkawinan');
                        if ($spk || $get($row, 'nama_pasangan')) {
                            $guru->keluarga()->updateOrCreate(
                                ['guru_id' => $guru->id],
                                array_filter([
                                    'status_perkawinan' => $spk,
                                    'nama_pasangan' => $get($row, 'nama_pasangan'),
                                    'nik_pasangan' => $get($row, 'nik_pasangan'),
                                    'pekerjaan_pasangan' => $get($row, 'pekerjaan_pasangan'),
                                    'jumlah_anak' => $get($row, 'jumlah_anak'),
                                ], fn($v) => $v !== null)
                            );
                            $countRelasi('keluarga');
                        }

                        // Tambahkan anak jika ada nama anak
                        $namaAnak = $get($row, 'nama_anak');
                        if ($namaAnak) {
                            $guru->anaks()->create(array_filter([
                                'nama' => $namaAnak,
                                'jenis_kelamin' => $get($row, 'jenis_kelamin_anak (L/P)'),
                                'tanggal_lahir' => $get($row, 'tanggal_lahir_anak (YYYY-MM-DD)'),
                                'urutan' => $get($row, 'urutan_anak'),
                            ], fn($v) => $v !== null));
                            $countRelasi('anak');
                        }
                    } catch (\Exception $e) {
                        $results['errors'][] = "Keluarga Baris {$baris}: " . $e->getMessage();
                    }
                }
            }
        }

        // ── SHEET 3 / "Rekening" ───────────────────────────────────────
        $sheetRekening = $getSheet($allSheets, 'Rekening') ?? $getSheet($allSheets, 3);
        if ($sheetRekening) {
            $rows = $sheetRekening['rows'];
            if (!empty($rows)) {
                $hRow = array_map('trim', array_shift($rows));
                $hMap = array_flip($hRow);
                $get = fn($row, $key) => (($i = $hMap[$key] ?? null) !== null && trim($row[$i] ?? '') !== '') ? trim($row[$i]) : null;

                foreach ($rows as $idx => $row) {
                    $baris = $idx + 2;
                    if (empty(array_filter($row, fn($v) => trim($v) !== '')))
                        continue;
                    $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
                    if (!$nuptk)
                        continue;
                    $guru = $findGuru($nuptk, 'Rekening', $baris);
                    if (!$guru)
                        continue;

                    try {
                        $guru->rekenings()->updateOrCreate(
                            ['guru_id' => $guru->id, 'is_primary' => 1],
                            array_filter([
                                'nama_bank' => $get($row, 'nama_bank'),
                                'no_rekening' => $get($row, 'no_rekening'),
                                'atas_nama' => $get($row, 'atas_nama'),
                                'cabang' => $get($row, 'cabang'),
                                'npwp' => $get($row, 'npwp'),
                                'no_bpjs_kesehatan' => $get($row, 'no_bpjs_kesehatan'),
                                'no_bpjs_ketenagakerjaan' => $get($row, 'no_bpjs_ketenagakerjaan'),
                                'gaji_pokok' => $get($row, 'gaji_pokok'),
                                'tunjangan_fungsional' => $get($row, 'tunjangan_fungsional'),
                                'tunjangan_profesi' => $get($row, 'tunjangan_profesi'),
                                'is_primary' => 1,
                            ], fn($v) => $v !== null)
                        );
                        $countRelasi('rekening');
                    } catch (\Exception $e) {
                        $results['errors'][] = "Rekening Baris {$baris}: " . $e->getMessage();
                    }
                }
            }
        }

        // ── SHEET 4 / "Pendidikan" ─────────────────────────────────────
        $sheetPendidikan = $getSheet($allSheets, 'Pendidikan') ?? $getSheet($allSheets, 4);
        if ($sheetPendidikan) {
            $rows = $sheetPendidikan['rows'];
            if (!empty($rows)) {
                $hRow = array_map('trim', array_shift($rows));
                $hMap = array_flip($hRow);
                $get = fn($row, $key) => (($i = $hMap[$key] ?? null) !== null && trim($row[$i] ?? '') !== '') ? trim($row[$i]) : null;

                foreach ($rows as $idx => $row) {
                    $baris = $idx + 2;
                    if (empty(array_filter($row, fn($v) => trim($v) !== '')))
                        continue;
                    $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
                    if (!$nuptk)
                        continue;
                    $guru = $findGuru($nuptk, 'Pendidikan', $baris);
                    if (!$guru)
                        continue;

                    $jenjang = $get($row, 'jenjang (SD/SMP/SMA-SMK/D1/D2/D3/D4/S1/S2/S3)*');
                    $namaSekolah = $get($row, 'nama_sekolah*');
                    if (!$jenjang || !$namaSekolah) {
                        $results['errors'][] = "Pendidikan Baris {$baris}: jenjang dan nama_sekolah wajib.";
                        continue;
                    }

                    try {
                        $jenjangDb = str_replace('-', '/', $jenjang); // SMA-SMK → SMA/SMK
                        $guru->pendidikans()->create(array_filter([
                            'jenjang' => $jenjangDb,
                            'nama_sekolah' => $namaSekolah,
                            'jurusan' => $get($row, 'jurusan'),
                            'prodi' => $get($row, 'prodi'),
                            'tahun_masuk' => $get($row, 'tahun_masuk'),
                            'tahun_lulus' => $get($row, 'tahun_lulus'),
                            'no_ijazah' => $get($row, 'no_ijazah'),
                        ], fn($v) => $v !== null));
                        $countRelasi('pendidikan');
                    } catch (\Exception $e) {
                        $results['errors'][] = "Pendidikan Baris {$baris}: " . $e->getMessage();
                    }
                }
            }
        }

        // ── SHEET 5 / "Sertifikasi" ────────────────────────────────────
        $sheetSert = $getSheet($allSheets, 'Sertifikasi') ?? $getSheet($allSheets, 5);
        if ($sheetSert) {
            $rows = $sheetSert['rows'];
            if (!empty($rows)) {
                $hRow = array_map('trim', array_shift($rows));
                $hMap = array_flip($hRow);
                $get = fn($row, $key) => (($i = $hMap[$key] ?? null) !== null && trim($row[$i] ?? '') !== '') ? trim($row[$i]) : null;

                foreach ($rows as $idx => $row) {
                    $baris = $idx + 2;
                    if (empty(array_filter($row, fn($v) => trim($v) !== '')))
                        continue;
                    $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
                    if (!$nuptk)
                        continue;
                    $guru = $findGuru($nuptk, 'Sertifikasi', $baris);
                    if (!$guru)
                        continue;

                    $jenisSert = $get($row, 'jenis_sertifikasi*');
                    if (!$jenisSert) {
                        $results['errors'][] = "Sertifikasi Baris {$baris}: jenis_sertifikasi wajib.";
                        continue;
                    }

                    try {
                        $guru->sertifikasis()->create(array_filter([
                            'jenis_sertifikasi' => $jenisSert,
                            'no_sertifikat' => $get($row, 'no_sertifikat'),
                            'nrg' => $get($row, 'nrg'),
                            'tahun_sertifikasi' => $get($row, 'tahun_sertifikasi'),
                            'lptk' => $get($row, 'lptk'),
                            'bidang_studi' => $get($row, 'bidang_studi'),
                            'tanggal_terbit' => $get($row, 'tanggal_terbit (YYYY-MM-DD)'),
                            'expired_at' => $get($row, 'expired_at (YYYY-MM-DD)'),
                        ], fn($v) => $v !== null));
                        $countRelasi('sertifikasi');
                    } catch (\Exception $e) {
                        $results['errors'][] = "Sertifikasi Baris {$baris}: " . $e->getMessage();
                    }
                }
            }
        }

        // ── SHEET 6 / "Diklat" ─────────────────────────────────────────
        $sheetDiklat = $getSheet($allSheets, 'Diklat') ?? $getSheet($allSheets, 6);
        if ($sheetDiklat) {
            $rows = $sheetDiklat['rows'];
            if (!empty($rows)) {
                $hRow = array_map('trim', array_shift($rows));
                $hMap = array_flip($hRow);
                $get = fn($row, $key) => (($i = $hMap[$key] ?? null) !== null && trim($row[$i] ?? '') !== '') ? trim($row[$i]) : null;

                foreach ($rows as $idx => $row) {
                    $baris = $idx + 2;
                    if (empty(array_filter($row, fn($v) => trim($v) !== '')))
                        continue;
                    $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
                    if (!$nuptk)
                        continue;
                    $guru = $findGuru($nuptk, 'Diklat', $baris);
                    if (!$guru)
                        continue;

                    $namaDiklat = $get($row, 'nama_diklat*');
                    if (!$namaDiklat) {
                        $results['errors'][] = "Diklat Baris {$baris}: nama_diklat wajib.";
                        continue;
                    }

                    try {
                        $jenis = $get($row, 'jenis (diklat/bimtek/workshop/seminar/pelatihan/kursus)');
                        $tingkat = $get($row, 'tingkat (Kecamatan/Kabupaten-Kota/Provinsi/Nasional/Internasional)');
                        if ($tingkat)
                            $tingkat = str_replace('-', '/', $tingkat);
                        $guru->diklats()->create(array_filter([
                            'nama_diklat' => $namaDiklat,
                            'penyelenggara' => $get($row, 'penyelenggara'),
                            'jenis' => $jenis,
                            'tingkat' => $tingkat,
                            'tanggal_mulai' => $get($row, 'tanggal_mulai (YYYY-MM-DD)'),
                            'tanggal_selesai' => $get($row, 'tanggal_selesai (YYYY-MM-DD)'),
                            'jumlah_jam' => $get($row, 'jumlah_jam'),
                            'peran' => $get($row, 'peran (peserta/narasumber/panitia/moderator)'),
                            'no_sertifikat' => $get($row, 'no_sertifikat'),
                            'keterangan' => $get($row, 'keterangan'),
                        ], fn($v) => $v !== null));
                        $countRelasi('diklat');
                    } catch (\Exception $e) {
                        $results['errors'][] = "Diklat Baris {$baris}: " . $e->getMessage();
                    }
                }
            }
        }

        // ── SHEET 7 / "Jabatan" ────────────────────────────────────────
        $sheetJabatan = $getSheet($allSheets, 'Jabatan') ?? $getSheet($allSheets, 7);
        if ($sheetJabatan) {
            $rows = $sheetJabatan['rows'];
            if (!empty($rows)) {
                $hRow = array_map('trim', array_shift($rows));
                $hMap = array_flip($hRow);
                $get = fn($row, $key) => (($i = $hMap[$key] ?? null) !== null && trim($row[$i] ?? '') !== '') ? trim($row[$i]) : null;

                foreach ($rows as $idx => $row) {
                    $baris = $idx + 2;
                    if (empty(array_filter($row, fn($v) => trim($v) !== '')))
                        continue;
                    $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
                    if (!$nuptk)
                        continue;
                    $guru = $findGuru($nuptk, 'Jabatan', $baris);
                    if (!$guru)
                        continue;

                    $jabatan = $get($row, 'jabatan*');
                    $jenisJab = $get($row, 'jenis_jabatan (Struktural/Fungsional/Tambahan)*');
                    if (!$jabatan || !$jenisJab) {
                        $results['errors'][] = "Jabatan Baris {$baris}: jabatan dan jenis_jabatan wajib.";
                        continue;
                    }

                    try {
                        $isCurrent = (int) ($get($row, 'is_current (1/0)') ?? 0);
                        if ($isCurrent) {
                            $guru->jabatans()->update(['is_current' => false]);
                        }
                        $guru->jabatans()->create(array_filter([
                            'jenis_jabatan' => $jenisJab,
                            'jabatan' => $jabatan,
                            'unit_kerja' => $get($row, 'unit_kerja'),
                            'instansi_pengangkat' => $get($row, 'instansi_pengangkat'),
                            'golongan' => $get($row, 'golongan'),
                            'pangkat' => $get($row, 'pangkat'),
                            'jenis_pengangkatan' => $get($row, 'jenis_pengangkatan'),
                            'status_kepegawaian' => $get($row, 'status_kepegawaian_jabatan (CPNS/PNS/PPPK/GTY/GTT/Honorer/Kontrak)'),
                            'no_sk' => $get($row, 'no_sk'),
                            'tanggal_sk' => $get($row, 'tanggal_sk (YYYY-MM-DD)'),
                            'pejabat_penandatangan' => $get($row, 'pejabat_penandatangan'),
                            'tmt_jabatan' => $get($row, 'tmt_jabatan (YYYY-MM-DD)'),
                            'tanggal_selesai' => $get($row, 'tanggal_selesai (YYYY-MM-DD)'),
                            'status_jabatan' => $get($row, 'status_jabatan (Aktif/Berakhir/Nonaktif/Mutasi/Pensiun)'),
                            'is_current' => $isCurrent,
                            'uraian_tugas' => $get($row, 'uraian_tugas'),
                        ], fn($v) => $v !== null && $v !== ''));
                        $countRelasi('jabatan');
                    } catch (\Exception $e) {
                        $results['errors'][] = "Jabatan Baris {$baris}: " . $e->getMessage();
                    }
                }
            }
        }

        // ── SHEET 8 / "Inpassing" ──────────────────────────────────────
        $sheetInpassing = $getSheet($allSheets, 'Inpassing') ?? $getSheet($allSheets, 8);
        if ($sheetInpassing) {
            $rows = $sheetInpassing['rows'];
            if (!empty($rows)) {
                $hRow = array_map('trim', array_shift($rows));
                $hMap = array_flip($hRow);
                $get = fn($row, $key) => (($i = $hMap[$key] ?? null) !== null && trim($row[$i] ?? '') !== '') ? trim($row[$i]) : null;

                foreach ($rows as $idx => $row) {
                    $baris = $idx + 2;
                    if (empty(array_filter($row, fn($v) => trim($v) !== '')))
                        continue;
                    $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
                    if (!$nuptk)
                        continue;
                    $guru = $findGuru($nuptk, 'Inpassing', $baris);
                    if (!$guru)
                        continue;

                    try {
                        $guru->inpassings()->create(array_filter([
                            'no_sk' => $get($row, 'no_sk*'),
                            'tanggal_sk' => $get($row, 'tanggal_sk (YYYY-MM-DD)*'),
                            'tmt_inpassing' => $get($row, 'tmt_inpassing (YYYY-MM-DD)*'),
                            'golongan_sesudah' => $get($row, 'golongan_sesudah'),
                            'jabatan_fungsional' => $get($row, 'jabatan_fungsional'),
                            'angka_kredit' => $get($row, 'angka_kredit'),
                        ], fn($v) => $v !== null));
                        $countRelasi('inpassing');
                    } catch (\Exception $e) {
                        $results['errors'][] = "Inpassing Baris {$baris}: " . $e->getMessage();
                    }
                }
            }
        }

        // ── SHEET 9 / "Mutasi" ─────────────────────────────────────────
        $sheetMutasi = $getSheet($allSheets, 'Mutasi') ?? $getSheet($allSheets, 9);
        if ($sheetMutasi) {
            $rows = $sheetMutasi['rows'];
            if (!empty($rows)) {
                $hRow = array_map('trim', array_shift($rows));
                $hMap = array_flip($hRow);
                $get = fn($row, $key) => (($i = $hMap[$key] ?? null) !== null && trim($row[$i] ?? '') !== '') ? trim($row[$i]) : null;

                foreach ($rows as $idx => $row) {
                    $baris = $idx + 2;
                    if (empty(array_filter($row, fn($v) => trim($v) !== '')))
                        continue;
                    $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
                    if (!$nuptk)
                        continue;
                    $guru = $findGuru($nuptk, 'Mutasi', $baris);
                    if (!$guru)
                        continue;

                    try {
                        $jenisMutasi = $get($row, 'jenis_mutasi (Masuk/Keluar/Internal)*');
                        $guru->mutasi()->create(array_filter([
                            'jenis_mutasi' => $jenisMutasi,
                            'sekolah_asal' => $get($row, 'sekolah_asal'),
                            'npsn_asal' => $get($row, 'npsn_asal'),
                            'sekolah_tujuan' => $get($row, 'sekolah_tujuan'),
                            'npsn_tujuan' => $get($row, 'npsn_tujuan'),
                            'tanggal_mutasi' => $get($row, 'tanggal_mutasi (YYYY-MM-DD)*'),
                            'no_sk' => $get($row, 'no_sk'),
                            'tanggal_sk' => $get($row, 'tanggal_sk (YYYY-MM-DD)'),
                            'keterangan' => $get($row, 'keterangan'),
                        ], fn($v) => $v !== null));

                        // Sync status seperti di storeMutasi
                        match ($jenisMutasi) {
                            'Keluar' => $guru->update(['status_keaktifan' => 'Keluar']),
                            'Masuk', 'Kembali Bertugas' => $guru->update(['status_keaktifan' => 'Aktif']),
                            default => null,
                        };

                        $countRelasi('mutasi');
                    } catch (\Exception $e) {
                        $results['errors'][] = "Mutasi Baris {$baris}: " . $e->getMessage();
                    }
                }
            }
        }

        // ── SHEET 10 / "Kompetensi" ────────────────────────────────────
        $sheetKomp = $getSheet($allSheets, 'Kompetensi') ?? $getSheet($allSheets, 10);
        if ($sheetKomp) {
            $rows = $sheetKomp['rows'];
            if (!empty($rows)) {
                $hRow = array_map('trim', array_shift($rows));
                $hMap = array_flip($hRow);
                $get = fn($row, $key) => (($i = $hMap[$key] ?? null) !== null && trim($row[$i] ?? '') !== '') ? trim($row[$i]) : null;

                foreach ($rows as $idx => $row) {
                    $baris = $idx + 2;
                    if (empty(array_filter($row, fn($v) => trim($v) !== '')))
                        continue;
                    $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
                    if (!$nuptk)
                        continue;
                    $guru = $findGuru($nuptk, 'Kompetensi', $baris);
                    if (!$guru)
                        continue;

                    try {
                        $guru->kompetensi()->create(array_filter([
                            'jenis' => $get($row, 'jenis (bahasa/it/bidang_keahlian/lainnya)*'),
                            'nama' => $get($row, 'nama*'),
                            'tingkat' => $get($row, 'tingkat (Dasar/Menengah/Mahir/Ahli)'),
                            'keterangan' => $get($row, 'keterangan'),
                        ], fn($v) => $v !== null));
                        $countRelasi('kompetensi');
                    } catch (\Exception $e) {
                        $results['errors'][] = "Kompetensi Baris {$baris}: " . $e->getMessage();
                    }
                }
            }
        }

        // ── SHEET 11 / "Kontak Darurat" ────────────────────────────────
        $sheetKontak = $getSheet($allSheets, 'Kontak Darurat') ?? $getSheet($allSheets, 11);
        if ($sheetKontak) {
            $rows = $sheetKontak['rows'];
            if (!empty($rows)) {
                $hRow = array_map('trim', array_shift($rows));
                $hMap = array_flip($hRow);
                $get = fn($row, $key) => (($i = $hMap[$key] ?? null) !== null && trim($row[$i] ?? '') !== '') ? trim($row[$i]) : null;

                foreach ($rows as $idx => $row) {
                    $baris = $idx + 2;
                    if (empty(array_filter($row, fn($v) => trim($v) !== '')))
                        continue;
                    $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
                    if (!$nuptk)
                        continue;
                    $guru = $findGuru($nuptk, 'Kontak Darurat', $baris);
                    if (!$guru)
                        continue;

                    try {
                        $isPrimary = (int) ($get($row, 'is_primary (1/0)') ?? 0);
                        if ($isPrimary) {
                            $guru->kontakDarurat()->update(['is_primary' => 0]);
                        }
                        $guru->kontakDarurat()->create(array_filter([
                            'nama' => $get($row, 'nama*'),
                            'hubungan' => $get($row, 'hubungan*'),
                            'no_hp' => $get($row, 'no_hp*'),
                            'alamat' => $get($row, 'alamat'),
                            'is_primary' => $isPrimary,
                        ], fn($v) => $v !== null));
                        $countRelasi('kontak_darurat');
                    } catch (\Exception $e) {
                        $results['errors'][] = "Kontak Darurat Baris {$baris}: " . $e->getMessage();
                    }
                }
            }
        }

        $relasiMsg = collect($results['relasi'])
            ->map(fn($v, $k) => "{$v} {$k}")
            ->join(', ');

        return response()->json([
            'success' => true,
            'message' => "Import selesai: {$results['berhasil']} guru ditambahkan, {$results['diperbarui']} diperbarui, {$results['gagal']} gagal."
                . ($relasiMsg ? " Relasi: {$relasiMsg}." : ''),
            'data' => $results,
        ]);
    }

    /**
     * GET /guru/export — Multi-sheet export lengkap
     */
    public function export(Request $request)
    {
        $gurus = Guru::query()
            ->with([
                'keluarga',
                'anaks',
                'rekenings' => fn($q) => $q->where('is_primary', 1),
                'pendidikans',
                'sertifikasis',
                'diklats',
                'jabatans',
                'inpassings',
                'mutasi',
                'kompetensi',
                'kontakDarurat',
                'dokumens',
                'waliKelas' => fn($q) => $q->where('is_active', 1)->with('kelas:id,nama_kelas'),
            ])

            ->when($request->jenis_ptk, fn($q) => $q->where('jenis_ptk', $request->jenis_ptk))
            ->when($request->status_kepegawaian, fn($q) => $q->where('status_kepegawaian', $request->status_kepegawaian))
            ->when($request->status_keaktifan, fn($q) => $q->where('status_keaktifan', $request->status_keaktifan))
            ->when($request->search, fn($q) => $q->where('nama', 'like', "%{$request->search}%")->orWhere('nuptk', 'like', "%{$request->search}%"))
            ->orderBy('nama')
            ->get();

        $fmt = fn($d) => $d ? \Carbon\Carbon::parse($d)->format('d/m/Y') : '';

        // ── Sheet 1: Data Utama ─────────────────────────────────────────
        $hUtama = [
            'No',
            'NUPTK',
            'NIP',
            'NIP Lama',
            'No. Karpeg',
            'No. Karis/Karsu',
            'NIK',
            'No. KK',
            'Nama',
            'Gelar Depan',
            'Gelar Belakang',
            'Jenis Kelamin',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Agama',
            'Golongan Darah',
            'Kewarganegaraan',
            'Status Hidup',
            'Nama Ibu Kandung',
            'No. HP',
            'No. WA',
            'Email',
            'Alamat Jalan',
            'RT',
            'RW',
            'Dusun',
            'Desa/Kelurahan',
            'Kecamatan',
            'Kabupaten/Kota',
            'Provinsi',
            'Kode Pos',
            'Jenis PTK',
            'Status Kepegawaian',
            'Status Keaktifan',
            'Tanggal Bergabung',
            'TMT PNS',
            'TMT GTY',
            'Masa Kerja (Thn)',
            'No. SK Pengangkatan',
            'Tgl SK Pengangkatan',
            'Instansi Pengangkat',
            'Wali Kelas',
        ];
        $rUtama = $gurus->map(fn($g, $i) => [
            $i + 1,
            $g->nuptk ?? '',
            $g->nip ?? '',
            $g->nip_lama ?? '',
            $g->no_karpeg ?? '',
            $g->no_karis_karsu ?? '',
            $g->nik ?? '',
            $g->no_kk ?? '',
            $g->nama,
            $g->gelar_depan ?? '',
            $g->gelar_belakang ?? '',
            $g->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            $g->tempat_lahir ?? '',
            $fmt($g->tanggal_lahir),
            $g->agama ?? '',
            $g->golongan_darah ?? '',
            $g->kewarganegaraan ?? '',
            $g->status_hidup ?? '',
            $g->nama_ibu_kandung ?? '',
            $g->no_hp ?? '',
            $g->no_wa ?? '',
            $g->email ?? '',
            $g->alamat_jalan ?? '',
            $g->rt ?? '',
            $g->rw ?? '',
            $g->dusun ?? '',
            $g->desa_kelurahan ?? '',
            $g->kecamatan ?? '',
            $g->kota_kabupaten ?? '',
            $g->provinsi ?? '',
            $g->kode_pos ?? '',
            $g->jenis_ptk ?? '',
            $g->status_kepegawaian ?? '',
            $g->status_keaktifan ?? '',
            $fmt($g->tanggal_bergabung),
            $fmt($g->tmt_pns),
            $fmt($g->tmt_gty),
            $g->masa_kerja_tahun ?? '',
            $g->no_sk_pengangkatan ?? '',
            $fmt($g->tgl_sk_pengangkatan),
            $g->instansi_pengangkat ?? '',
            $g->waliKelas->first()?->kelas?->nama_kelas ?? '',
        ])->values()->toArray();

        // ── Sheet 2: Keluarga & Anak ────────────────────────────────────
        $hKeluarga = [
            'NUPTK',
            'Nama Guru',
            'Status Perkawinan',
            'Nama Pasangan',
            'NIK Pasangan',
            'Pekerjaan Pasangan',
            'Jumlah Anak',
            'Nama Anak',
            'JK Anak',
            'Tgl Lahir Anak',
            'Urutan Anak'
        ];
        $rKeluarga = [];
        foreach ($gurus as $g) {
            $kel = $g->keluarga;
            $anaks = $g->anaks;
            if (!$kel && $anaks->isEmpty())
                continue;
            $kelRow = [
                $g->nuptk,
                $g->nama,
                $kel?->status_perkawinan ?? '',
                $kel?->nama_pasangan ?? '',
                $kel?->nik_pasangan ?? '',
                $kel?->pekerjaan_pasangan ?? '',
                $kel?->jumlah_anak ?? ''
            ];
            if ($anaks->isEmpty()) {
                $rKeluarga[] = array_merge($kelRow, ['', '', '', '']);
            } else {
                foreach ($anaks as $ai => $anak) {
                    $rKeluarga[] = array_merge(
                        $ai === 0 ? $kelRow : [$g->nuptk, $g->nama, '', '', '', '', ''],
                        [$anak->nama, $anak->jenis_kelamin ?? '', $fmt($anak->tanggal_lahir), $anak->urutan ?? '']
                    );
                }
            }
        }

        // ── Sheet 3: Rekening & Administrasi ───────────────────────────
        $hRekening = [
            'NUPTK',
            'Nama Guru',
            'Nama Bank',
            'No. Rekening',
            'Atas Nama',
            'Cabang',
            'NPWP',
            'No. BPJS Kesehatan',
            'No. BPJS Ketenagakerjaan',
            'Gaji Pokok',
            'Tunjangan Fungsional',
            'Tunjangan Profesi'
        ];
        $rRekening = [];
        foreach ($gurus as $g) {
            $rek = $g->rekenings->first();
            $rRekening[] = [
                $g->nuptk,
                $g->nama,
                $rek?->nama_bank ?? '',
                $rek?->no_rekening ?? '',
                $rek?->atas_nama ?? '',
                $rek?->cabang ?? '',
                $rek?->npwp ?? '',
                $rek?->no_bpjs_kesehatan ?? '',
                $rek?->no_bpjs_ketenagakerjaan ?? '',
                $rek?->gaji_pokok ?? '',
                $rek?->tunjangan_fungsional ?? '',
                $rek?->tunjangan_profesi ?? '',
            ];
        }

        // ── Sheet 4: Pendidikan ─────────────────────────────────────────
        $hPendidikan = [
            'NUPTK',
            'Nama Guru',
            'Jenjang',
            'Nama Sekolah',
            'Jurusan',
            'Prodi',
            'Tahun Masuk',
            'Tahun Lulus',
            'No. Ijazah',
            'File Ijazah (path)'
        ];
        $rPendidikan = [];
        foreach ($gurus as $g) {
            foreach ($g->pendidikans as $p) {
                $rPendidikan[] = [
                    $g->nuptk,
                    $g->nama,
                    $p->jenjang,
                    $p->nama_sekolah,
                    $p->jurusan ?? '',
                    $p->prodi ?? '',
                    $p->tahun_masuk ?? '',
                    $p->tahun_lulus ?? '',
                    $p->no_ijazah ?? '',
                    $p->file_ijazah ?? ''
                ];
            }
        }

        // ── Sheet 5: Sertifikasi ────────────────────────────────────────
        $hSertifikasi = [
            'NUPTK',
            'Nama Guru',
            'Jenis Sertifikasi',
            'No. Sertifikat',
            'NRG',
            'Tahun Sertifikasi',
            'LPTK',
            'Bidang Studi',
            'Tanggal Terbit',
            'Expired',
            'File Sertifikat (path)'
        ];
        $rSertifikasi = [];
        foreach ($gurus as $g) {
            foreach ($g->sertifikasis as $s) {
                $rSertifikasi[] = [
                    $g->nuptk,
                    $g->nama,
                    $s->jenis_sertifikasi,
                    $s->no_sertifikat ?? '',
                    $s->nrg ?? '',
                    $s->tahun_sertifikasi ?? '',
                    $s->lptk ?? '',
                    $s->bidang_studi ?? '',
                    $fmt($s->tanggal_terbit),
                    $fmt($s->expired_at),
                    $s->file_sertifikat ?? ''
                ];
            }
        }

        // ── Sheet 6: Diklat ─────────────────────────────────────────────
        $hDiklat = [
            'NUPTK',
            'Nama Guru',
            'Nama Diklat',
            'Penyelenggara',
            'Jenis',
            'Tingkat',
            'Tgl Mulai',
            'Tgl Selesai',
            'Jumlah Jam',
            'Peran',
            'No. Sertifikat',
            'Keterangan',
            'File Sertifikat Diklat (path)'
        ];
        $rDiklat = [];
        foreach ($gurus as $g) {
            foreach ($g->diklats as $d) {
                $rDiklat[] = [
                    $g->nuptk,
                    $g->nama,
                    $d->nama_diklat,
                    $d->penyelenggara ?? '',
                    $d->jenis ?? '',
                    $d->tingkat ?? '',
                    $fmt($d->tanggal_mulai),
                    $fmt($d->tanggal_selesai),
                    $d->jumlah_jam ?? '',
                    $d->peran ?? '',
                    $d->no_sertifikat ?? '',
                    $d->keterangan ?? '',
                    $d->file_sertifikat ?? ''
                ];
            }
        }

        // ── Sheet 7: Jabatan ────────────────────────────────────────────
        $hJabatan = [
            'NUPTK',
            'Nama Guru',
            'Jenis Jabatan',
            'Jabatan',
            'Unit Kerja',
            'Instansi Pengangkat',
            'Golongan',
            'Pangkat',
            'Jenis Pengangkatan',
            'Status Kepegawaian',
            'No. SK',
            'Tgl SK',
            'Pejabat TTD',
            'TMT Jabatan',
            'Tgl Selesai',
            'Status Jabatan',
            'Is Current',
            'Uraian Tugas'
        ];
        $rJabatan = [];
        foreach ($gurus as $g) {
            foreach ($g->jabatans as $j) {
                $rJabatan[] = [
                    $g->nuptk,
                    $g->nama,
                    $j->jenis_jabatan,
                    $j->jabatan,
                    $j->unit_kerja ?? '',
                    $j->instansi_pengangkat ?? '',
                    $j->golongan ?? '',
                    $j->pangkat ?? '',
                    $j->jenis_pengangkatan ?? '',
                    $j->status_kepegawaian ?? '',
                    $j->no_sk ?? '',
                    $fmt($j->tanggal_sk),
                    $j->pejabat_penandatangan ?? '',
                    $fmt($j->tmt_jabatan),
                    $fmt($j->tanggal_selesai),
                    $j->status_jabatan ?? '',
                    $j->is_current ? 'Ya' : 'Tidak',
                    $j->uraian_tugas ?? ''
                ];
            }
        }

        // ── Sheet 8: Inpassing ──────────────────────────────────────────
        $hInpassing = [
            'NUPTK',
            'Nama Guru',
            'No. SK',
            'Tanggal SK',
            'TMT Inpassing',
            'Golongan Sesudah',
            'Jabatan Fungsional',
            'Angka Kredit',
            'File SK (path)'
        ];
        $rInpassing = [];
        foreach ($gurus as $g) {
            foreach ($g->inpassings as $inp) {
                $rInpassing[] = [
                    $g->nuptk,
                    $g->nama,
                    $inp->no_sk,
                    $fmt($inp->tanggal_sk),
                    $fmt($inp->tmt_inpassing),
                    $inp->golongan_sesudah ?? '',
                    $inp->jabatan_fungsional ?? '',
                    $inp->angka_kredit ?? '',
                    $inp->file_sk ?? ''
                ];
            }
        }

        // ── Sheet 9: Mutasi ─────────────────────────────────────────────
        $hMutasi = [
            'NUPTK',
            'Nama Guru',
            'Jenis Mutasi',
            'Sekolah Asal',
            'NPSN Asal',
            'Sekolah Tujuan',
            'NPSN Tujuan',
            'Tgl Mutasi',
            'No. SK',
            'Tgl SK',
            'Keterangan',
            'File SK Mutasi (path)'
        ];
        $rMutasi = [];
        foreach ($gurus as $g) {
            foreach ($g->mutasi as $m) {
                $rMutasi[] = [
                    $g->nuptk,
                    $g->nama,
                    $m->jenis_mutasi,
                    $m->sekolah_asal ?? '',
                    $m->npsn_asal ?? '',
                    $m->sekolah_tujuan ?? '',
                    $m->npsn_tujuan ?? '',
                    $fmt($m->tanggal_mutasi),
                    $m->no_sk ?? '',
                    $fmt($m->tanggal_sk),
                    $m->keterangan ?? '',
                    $m->file_sk ?? ''
                ];
            }
        }

        // ── Sheet 10: Kompetensi ────────────────────────────────────────
        $hKompetensi = ['NUPTK', 'Nama Guru', 'Jenis', 'Nama Kompetensi', 'Tingkat', 'Keterangan'];
        $rKompetensi = [];
        foreach ($gurus as $g) {
            foreach ($g->kompetensi as $k) {
                $rKompetensi[] = [
                    $g->nuptk,
                    $g->nama,
                    $k->jenis,
                    $k->nama,
                    $k->tingkat ?? '',
                    $k->keterangan ?? ''
                ];
            }
        }

        // ── Sheet 11: Kontak Darurat ────────────────────────────────────
        $hKontak = ['NUPTK', 'Nama Guru', 'Nama Kontak', 'Hubungan', 'No. HP', 'Alamat', 'Primary'];
        $rKontak = [];
        foreach ($gurus as $g) {
            foreach ($g->kontakDarurat as $kd) {
                $rKontak[] = [
                    $g->nuptk,
                    $g->nama,
                    $kd->nama,
                    $kd->hubungan,
                    $kd->no_hp,
                    $kd->alamat ?? '',
                    $kd->is_primary ? 'Ya' : 'Tidak'
                ];
            }
        }

        // ── Sheet 12: Dokumen Umum (guru_dokumens) ─────────────────────────
        $hDokumen = [
            'NUPTK',
            'Nama Guru',
            'Kategori',
            'Nama Dokumen',
            'Nomor Dokumen',
            'Tanggal Dokumen',
            'Tanggal Berlaku',
            'Tanggal Kadaluarsa',
            'Penerbit',
            'File Path',
            'Terverifikasi',
            'Keterangan'
        ];
        $rDokumen = [];
        foreach ($gurus as $g) {
            foreach ($g->dokumens as $dok) {
                $rDokumen[] = [
                    $g->nuptk,
                    $g->nama,
                    $dok->kategori ?? '',
                    $dok->nama_dokumen,
                    $dok->nomor_dokumen ?? '',
                    $fmt($dok->tanggal_dokumen),
                    $fmt($dok->tanggal_berlaku),
                    $fmt($dok->tanggal_kadaluarsa),
                    $dok->penerbit ?? '',
                    $dok->file_path ?? '',
                    $dok->is_verified ? 'Ya' : 'Tidak',
                    $dok->keterangan ?? ''
                ];
            }
        }

        $sheets = [
            ['name' => 'Data Utama', 'headers' => $hUtama, 'rows' => $rUtama],
            ['name' => 'Keluarga & Anak', 'headers' => $hKeluarga, 'rows' => $rKeluarga],
            ['name' => 'Rekening', 'headers' => $hRekening, 'rows' => $rRekening],
            ['name' => 'Pendidikan', 'headers' => $hPendidikan, 'rows' => $rPendidikan],
            ['name' => 'Sertifikasi', 'headers' => $hSertifikasi, 'rows' => $rSertifikasi],
            ['name' => 'Diklat', 'headers' => $hDiklat, 'rows' => $rDiklat],
            ['name' => 'Jabatan', 'headers' => $hJabatan, 'rows' => $rJabatan],
            ['name' => 'Inpassing', 'headers' => $hInpassing, 'rows' => $rInpassing],
            ['name' => 'Mutasi', 'headers' => $hMutasi, 'rows' => $rMutasi],
            ['name' => 'Kompetensi', 'headers' => $hKompetensi, 'rows' => $rKompetensi],
            ['name' => 'Kontak Darurat', 'headers' => $hKontak, 'rows' => $rKontak],
            ['name' => 'Dokumen Umum', 'headers' => $hDokumen, 'rows' => $rDokumen],
        ];

        $filename = 'data_guru_' . now()->format('Ymd_His') . '.xlsx';
        $xlsx = $this->buildMultiSheetXlsx($sheets);
        return response($xlsx, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Content-Length' => strlen($xlsx),
            'Cache-Control' => 'max-age=0',
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
     * GET /guru/backup
     */
    public function exportBackup()
    {
        $gurus = Guru::with([
            'keluarga',
            'anaks',
            'rekenings' => fn($q) => $q->where('is_primary', 1),
            'pendidikans',
            'sertifikasis',
            'diklats',
            'jabatans',
            'inpassings',
            'mutasi',
            'kompetensi',
            'kontakDarurat',
            'dokumens',
            'waliKelas' => fn($q) => $q->where('is_active', 1)->with('kelas:id,nama_kelas'),
        ])->orderBy('nama')->get();

        $fmt = fn($d) => $d ? \Carbon\Carbon::parse($d)->format('d/m/Y') : '';

        // ── bangun multi-sheet identik dengan export() ──────────────────
        $hUtama = [
            'No',
            'NUPTK',
            'NIP',
            'NIP Lama',
            'No. Karpeg',
            'No. Karis/Karsu',
            'NIK',
            'No. KK',
            'Nama',
            'Gelar Depan',
            'Gelar Belakang',
            'Jenis Kelamin',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Agama',
            'Golongan Darah',
            'Kewarganegaraan',
            'Status Hidup',
            'Nama Ibu Kandung',
            'No. HP',
            'No. WA',
            'Email',
            'Alamat Jalan',
            'RT',
            'RW',
            'Dusun',
            'Desa/Kelurahan',
            'Kecamatan',
            'Kabupaten/Kota',
            'Provinsi',
            'Kode Pos',
            'Jenis PTK',
            'Status Kepegawaian',
            'Status Keaktifan',
            'Tanggal Bergabung',
            'TMT PNS',
            'TMT GTY',
            'Masa Kerja (Thn)',
            'No. SK Pengangkatan',
            'Tgl SK Pengangkatan',
            'Instansi Pengangkat',
            'Wali Kelas',
        ];
        $rUtama = $gurus->map(fn($g, $i) => [
            $i + 1,
            $g->nuptk ?? '',
            $g->nip ?? '',
            $g->nip_lama ?? '',
            $g->no_karpeg ?? '',
            $g->no_karis_karsu ?? '',
            $g->nik ?? '',
            $g->no_kk ?? '',
            $g->nama,
            $g->gelar_depan ?? '',
            $g->gelar_belakang ?? '',
            $g->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            $g->tempat_lahir ?? '',
            $fmt($g->tanggal_lahir),
            $g->agama ?? '',
            $g->golongan_darah ?? '',
            $g->kewarganegaraan ?? '',
            $g->status_hidup ?? '',
            $g->nama_ibu_kandung ?? '',
            $g->no_hp ?? '',
            $g->no_wa ?? '',
            $g->email ?? '',
            $g->alamat_jalan ?? '',
            $g->rt ?? '',
            $g->rw ?? '',
            $g->dusun ?? '',
            $g->desa_kelurahan ?? '',
            $g->kecamatan ?? '',
            $g->kota_kabupaten ?? '',
            $g->provinsi ?? '',
            $g->kode_pos ?? '',
            $g->jenis_ptk ?? '',
            $g->status_kepegawaian ?? '',
            $g->status_keaktifan ?? '',
            $fmt($g->tanggal_bergabung),
            $fmt($g->tmt_pns),
            $fmt($g->tmt_gty),
            $g->masa_kerja_tahun ?? '',
            $g->no_sk_pengangkatan ?? '',
            $fmt($g->tgl_sk_pengangkatan),
            $g->instansi_pengangkat ?? '',
            $g->waliKelas->first()?->kelas?->nama_kelas ?? '',
        ])->values()->toArray();

        $hKeluarga = [
            'NUPTK',
            'Nama Guru',
            'Status Perkawinan',
            'Nama Pasangan',
            'NIK Pasangan',
            'Pekerjaan Pasangan',
            'Jumlah Anak',
            'Nama Anak',
            'JK Anak',
            'Tgl Lahir Anak',
            'Urutan Anak'
        ];
        $rKeluarga = [];
        foreach ($gurus as $g) {
            $kel = $g->keluarga;
            $anaks = $g->anaks;
            if (!$kel && $anaks->isEmpty())
                continue;
            $kelRow = [
                $g->nuptk,
                $g->nama,
                $kel?->status_perkawinan ?? '',
                $kel?->nama_pasangan ?? '',
                $kel?->nik_pasangan ?? '',
                $kel?->pekerjaan_pasangan ?? '',
                $kel?->jumlah_anak ?? ''
            ];
            if ($anaks->isEmpty()) {
                $rKeluarga[] = array_merge($kelRow, ['', '', '', '']);
            } else {
                foreach ($anaks as $ai => $anak) {
                    $rKeluarga[] = array_merge(
                        $ai === 0 ? $kelRow : [$g->nuptk, $g->nama, '', '', '', '', ''],
                        [$anak->nama, $anak->jenis_kelamin ?? '', $fmt($anak->tanggal_lahir), $anak->urutan ?? '']
                    );
                }
            }
        }

        $hRekening = [
            'NUPTK',
            'Nama Guru',
            'Nama Bank',
            'No. Rekening',
            'Atas Nama',
            'Cabang',
            'NPWP',
            'No. BPJS Kesehatan',
            'No. BPJS Ketenagakerjaan',
            'Gaji Pokok',
            'Tunjangan Fungsional',
            'Tunjangan Profesi'
        ];
        $rRekening = [];
        foreach ($gurus as $g) {
            $rek = $g->rekenings->first();
            $rRekening[] = [
                $g->nuptk,
                $g->nama,
                $rek?->nama_bank ?? '',
                $rek?->no_rekening ?? '',
                $rek?->atas_nama ?? '',
                $rek?->cabang ?? '',
                $rek?->npwp ?? '',
                $rek?->no_bpjs_kesehatan ?? '',
                $rek?->no_bpjs_ketenagakerjaan ?? '',
                $rek?->gaji_pokok ?? '',
                $rek?->tunjangan_fungsional ?? '',
                $rek?->tunjangan_profesi ?? ''
            ];
        }

        $hPendidikan = [
            'NUPTK',
            'Nama Guru',
            'Jenjang',
            'Nama Sekolah',
            'Jurusan',
            'Prodi',
            'Tahun Masuk',
            'Tahun Lulus',
            'No. Ijazah',
            'File Ijazah (path)'
        ];
        $rPendidikan = [];
        foreach ($gurus as $g) {
            foreach ($g->pendidikans as $p) {
                $rPendidikan[] = [
                    $g->nuptk,
                    $g->nama,
                    $p->jenjang,
                    $p->nama_sekolah,
                    $p->jurusan ?? '',
                    $p->prodi ?? '',
                    $p->tahun_masuk ?? '',
                    $p->tahun_lulus ?? '',
                    $p->no_ijazah ?? '',
                    $p->file_ijazah ?? ''
                ];
            }
        }

        $hSertifikasi = [
            'NUPTK',
            'Nama Guru',
            'Jenis Sertifikasi',
            'No. Sertifikat',
            'NRG',
            'Tahun Sertifikasi',
            'LPTK',
            'Bidang Studi',
            'Tanggal Terbit',
            'Expired',
            'File Sertifikat (path)'
        ];
        $rSertifikasi = [];
        foreach ($gurus as $g) {
            foreach ($g->sertifikasis as $s) {
                $rSertifikasi[] = [
                    $g->nuptk,
                    $g->nama,
                    $s->jenis_sertifikasi,
                    $s->no_sertifikat ?? '',
                    $s->nrg ?? '',
                    $s->tahun_sertifikasi ?? '',
                    $s->lptk ?? '',
                    $s->bidang_studi ?? '',
                    $fmt($s->tanggal_terbit),
                    $fmt($s->expired_at),
                    $s->file_sertifikat ?? ''
                ];
            }
        }

        $hDiklat = [
            'NUPTK',
            'Nama Guru',
            'Nama Diklat',
            'Penyelenggara',
            'Jenis',
            'Tingkat',
            'Tgl Mulai',
            'Tgl Selesai',
            'Jumlah Jam',
            'Peran',
            'No. Sertifikat',
            'Keterangan',
            'File Sertifikat Diklat (path)'
        ];
        $rDiklat = [];
        foreach ($gurus as $g) {
            foreach ($g->diklats as $d) {
                $rDiklat[] = [
                    $g->nuptk,
                    $g->nama,
                    $d->nama_diklat,
                    $d->penyelenggara ?? '',
                    $d->jenis ?? '',
                    $d->tingkat ?? '',
                    $fmt($d->tanggal_mulai),
                    $fmt($d->tanggal_selesai),
                    $d->jumlah_jam ?? '',
                    $d->peran ?? '',
                    $d->no_sertifikat ?? '',
                    $d->keterangan ?? '',
                    $d->file_sertifikat ?? ''
                ];
            }
        }

        $hJabatan = [
            'NUPTK',
            'Nama Guru',
            'Jenis Jabatan',
            'Jabatan',
            'Unit Kerja',
            'Instansi Pengangkat',
            'Golongan',
            'Pangkat',
            'Jenis Pengangkatan',
            'Status Kepegawaian',
            'No. SK',
            'Tgl SK',
            'Pejabat TTD',
            'TMT Jabatan',
            'Tgl Selesai',
            'Status Jabatan',
            'Is Current',
            'Uraian Tugas'
        ];
        $rJabatan = [];
        foreach ($gurus as $g) {
            foreach ($g->jabatans as $j) {
                $rJabatan[] = [
                    $g->nuptk,
                    $g->nama,
                    $j->jenis_jabatan,
                    $j->jabatan,
                    $j->unit_kerja ?? '',
                    $j->instansi_pengangkat ?? '',
                    $j->golongan ?? '',
                    $j->pangkat ?? '',
                    $j->jenis_pengangkatan ?? '',
                    $j->status_kepegawaian ?? '',
                    $j->no_sk ?? '',
                    $fmt($j->tanggal_sk),
                    $j->pejabat_penandatangan ?? '',
                    $fmt($j->tmt_jabatan),
                    $fmt($j->tanggal_selesai),
                    $j->status_jabatan ?? '',
                    $j->is_current ? 'Ya' : 'Tidak',
                    $j->uraian_tugas ?? ''
                ];
            }
        }

        $hInpassing = [
            'NUPTK',
            'Nama Guru',
            'No. SK',
            'Tanggal SK',
            'TMT Inpassing',
            'Golongan Sesudah',
            'Jabatan Fungsional',
            'Angka Kredit',
            'File SK (path)'
        ];
        $rInpassing = [];
        foreach ($gurus as $g) {
            foreach ($g->inpassings as $inp) {
                $rInpassing[] = [
                    $g->nuptk,
                    $g->nama,
                    $inp->no_sk,
                    $fmt($inp->tanggal_sk),
                    $fmt($inp->tmt_inpassing),
                    $inp->golongan_sesudah ?? '',
                    $inp->jabatan_fungsional ?? '',
                    $inp->angka_kredit ?? '',
                    $inp->file_sk ?? ''
                ];
            }
        }

        $hMutasi = [
            'NUPTK',
            'Nama Guru',
            'Jenis Mutasi',
            'Sekolah Asal',
            'NPSN Asal',
            'Sekolah Tujuan',
            'NPSN Tujuan',
            'Tgl Mutasi',
            'No. SK',
            'Tgl SK',
            'Keterangan',
            'File SK Mutasi (path)'
        ];
        $rMutasi = [];
        foreach ($gurus as $g) {
            foreach ($g->mutasi as $m) {
                $rMutasi[] = [
                    $g->nuptk,
                    $g->nama,
                    $m->jenis_mutasi,
                    $m->sekolah_asal ?? '',
                    $m->npsn_asal ?? '',
                    $m->sekolah_tujuan ?? '',
                    $m->npsn_tujuan ?? '',
                    $fmt($m->tanggal_mutasi),
                    $m->no_sk ?? '',
                    $fmt($m->tanggal_sk),
                    $m->keterangan ?? '',
                    $m->file_sk ?? ''
                ];
            }
        }

        $hKompetensi = ['NUPTK', 'Nama Guru', 'Jenis', 'Nama Kompetensi', 'Tingkat', 'Keterangan'];
        $rKompetensi = [];
        foreach ($gurus as $g) {
            foreach ($g->kompetensi as $k) {
                $rKompetensi[] = [
                    $g->nuptk,
                    $g->nama,
                    $k->jenis,
                    $k->nama,
                    $k->tingkat ?? '',
                    $k->keterangan ?? ''
                ];
            }
        }

        $hKontak = ['NUPTK', 'Nama Guru', 'Nama Kontak', 'Hubungan', 'No. HP', 'Alamat', 'Primary'];
        $rKontak = [];
        foreach ($gurus as $g) {
            foreach ($g->kontakDarurat as $kd) {
                $rKontak[] = [
                    $g->nuptk,
                    $g->nama,
                    $kd->nama,
                    $kd->hubungan,
                    $kd->no_hp,
                    $kd->alamat ?? '',
                    $kd->is_primary ? 'Ya' : 'Tidak'
                ];
            }
        }

        $hDokumen = [
            'NUPTK',
            'Nama Guru',
            'Kategori',
            'Nama Dokumen',
            'Nomor Dokumen',
            'Tanggal Dokumen',
            'Tanggal Berlaku',
            'Tanggal Kadaluarsa',
            'Penerbit',
            'File Path',
            'Terverifikasi',
            'Keterangan'
        ];
        $rDokumen = [];
        foreach ($gurus as $g) {
            foreach ($g->dokumens as $dok) {
                $rDokumen[] = [
                    $g->nuptk,
                    $g->nama,
                    $dok->kategori ?? '',
                    $dok->nama_dokumen,
                    $dok->nomor_dokumen ?? '',
                    $fmt($dok->tanggal_dokumen),
                    $fmt($dok->tanggal_berlaku),
                    $fmt($dok->tanggal_kadaluarsa),
                    $dok->penerbit ?? '',
                    $dok->file_path ?? '',
                    $dok->is_verified ? 'Ya' : 'Tidak',
                    $dok->keterangan ?? ''
                ];
            }
        }

        $sheets = [
            ['name' => 'Data Utama', 'headers' => $hUtama, 'rows' => $rUtama],
            ['name' => 'Keluarga & Anak', 'headers' => $hKeluarga, 'rows' => $rKeluarga],
            ['name' => 'Rekening', 'headers' => $hRekening, 'rows' => $rRekening],
            ['name' => 'Pendidikan', 'headers' => $hPendidikan, 'rows' => $rPendidikan],
            ['name' => 'Sertifikasi', 'headers' => $hSertifikasi, 'rows' => $rSertifikasi],
            ['name' => 'Diklat', 'headers' => $hDiklat, 'rows' => $rDiklat],
            ['name' => 'Jabatan', 'headers' => $hJabatan, 'rows' => $rJabatan],
            ['name' => 'Inpassing', 'headers' => $hInpassing, 'rows' => $rInpassing],
            ['name' => 'Mutasi', 'headers' => $hMutasi, 'rows' => $rMutasi],
            ['name' => 'Kompetensi', 'headers' => $hKompetensi, 'rows' => $rKompetensi],
            ['name' => 'Kontak Darurat', 'headers' => $hKontak, 'rows' => $rKontak],
            ['name' => 'Dokumen Umum', 'headers' => $hDokumen, 'rows' => $rDokumen],
        ];
        $xlsxBinary = $this->buildMultiSheetXlsx($sheets);

        // ── ZIP: xlsx + foto + semua file dokumen ───────────────────────
        $tmpFile = tempnam(sys_get_temp_dir(), 'backup_guru_');
        $zip = new \ZipArchive();
        $zip->open($tmpFile, \ZipArchive::OVERWRITE);
        $zip->addFromString('data_guru.xlsx', $xlsxBinary);

        // Foto profil
        foreach ($gurus as $guru) {
            if (!$guru->foto)
                continue;
            $path = storage_path('app/public/' . $guru->foto);
            if (file_exists($path)) {
                $ext = pathinfo($path, PATHINFO_EXTENSION);
                $zip->addFile($path, 'foto-guru/' . ($guru->nuptk ?? $guru->id) . '.' . $ext);
            }
        }

        // File ijazah (pendidikan)
        foreach ($gurus as $guru) {
            foreach ($guru->pendidikans as $p) {
                if (!$p->file_ijazah)
                    continue;
                $path = storage_path('app/public/' . $p->file_ijazah);
                if (file_exists($path)) {
                    $zip->addFile($path, 'file-ijazah/' . ($guru->nuptk ?? $guru->id) . '_' . $p->id . '.' . pathinfo($path, PATHINFO_EXTENSION));
                }
            }
        }

        // File sertifikat (sertifikasi)
        foreach ($gurus as $guru) {
            foreach ($guru->sertifikasis as $s) {
                if (!$s->file_sertifikat)
                    continue;
                $path = storage_path('app/public/' . $s->file_sertifikat);
                if (file_exists($path)) {
                    $zip->addFile($path, 'file-sertifikasi/' . ($guru->nuptk ?? $guru->id) . '_' . $s->id . '.' . pathinfo($path, PATHINFO_EXTENSION));
                }
            }
        }

        // File sertifikat diklat
        foreach ($gurus as $guru) {
            foreach ($guru->diklats as $d) {
                if (!$d->file_sertifikat)
                    continue;
                $path = storage_path('app/public/' . $d->file_sertifikat);
                if (file_exists($path)) {
                    $zip->addFile($path, 'file-diklat/' . ($guru->nuptk ?? $guru->id) . '_' . $d->id . '.' . pathinfo($path, PATHINFO_EXTENSION));
                }
            }
        }

        // File SK inpassing
        foreach ($gurus as $guru) {
            foreach ($guru->inpassings as $inp) {
                if (!$inp->file_sk)
                    continue;
                $path = storage_path('app/public/' . $inp->file_sk);
                if (file_exists($path)) {
                    $zip->addFile($path, 'file-inpassing/' . ($guru->nuptk ?? $guru->id) . '_' . $inp->id . '.' . pathinfo($path, PATHINFO_EXTENSION));
                }
            }
        }

        // File SK mutasi
        foreach ($gurus as $guru) {
            foreach ($guru->mutasi as $m) {
                if (!$m->file_sk)
                    continue;
                $path = storage_path('app/public/' . $m->file_sk);
                if (file_exists($path)) {
                    $zip->addFile($path, 'file-mutasi/' . ($guru->nuptk ?? $guru->id) . '_' . $m->id . '.' . pathinfo($path, PATHINFO_EXTENSION));
                }
            }
        }

        // Dokumen umum
        foreach ($gurus as $guru) {
            foreach ($guru->dokumens as $dok) {
                if (!$dok->file_path)
                    continue;
                $path = storage_path('app/public/' . $dok->file_path);
                if (file_exists($path)) {
                    $zip->addFile($path, 'file-dokumen/' . ($guru->nuptk ?? $guru->id) . '_' . $dok->id . '.' . pathinfo($path, PATHINFO_EXTENSION));
                }
            }
        }

        $totalGuru = count($gurus);
        $zip->addFromString(
            'README.txt',
            "BACKUP DATA GURU - " . now()->format('d/m/Y H:i:s') . "\r\n"
            . "SIAKAD MI Nurul Huda 3\r\n\r\n"
            . "Isi backup:\r\n"
            . "  data_guru.xlsx       — {$totalGuru} guru, 12 sheet (data lengkap)\r\n"
            . "  foto-guru/           — foto profil guru\r\n"
            . "  file-ijazah/         — scan ijazah (dari riwayat pendidikan)\r\n"
            . "  file-sertifikasi/    — file sertifikat pendidik\r\n"
            . "  file-diklat/         — sertifikat pelatihan/diklat\r\n"
            . "  file-inpassing/      — SK inpassing\r\n"
            . "  file-mutasi/         — SK mutasi\r\n"
            . "  file-dokumen/        — dokumen umum guru\r\n\r\n"
            . "Nama file: <nuptk>_<id>.<ext>\r\n"
            . "Referensi path ada di kolom 'File * (path)' di masing-masing sheet xlsx.\r\n"
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

    // ── Private: Multi-Sheet XLSX Builder ─────────────────────────────
    private function buildMultiSheetXlsx(array $sheets): string
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $spreadsheet->removeSheetByIndex(0); // hapus sheet default

        foreach ($sheets as $si => $sheet) {
            $ws = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, $sheet['name']);
            $spreadsheet->addSheet($ws, $si);

            // Header row
            foreach ($sheet['headers'] as $ci => $header) {
                $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($ci + 1);
                $cell = $ws->getCell("{$col}1");
                $cell->setValue($header);
                // Style header: bold, background ungu, teks putih
                $cell->getStyle()->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '5B21B6']],
                    'alignment' => ['horizontal' => 'center'],
                ]);
            }

            // Data rows
            foreach ($sheet['rows'] as $ri => $row) {
                $rowNum = $ri + 2;
                $bg = $ri % 2 === 0 ? 'FFFFFF' : 'F5F3FF';
                foreach ($row as $ci => $val) {
                    $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($ci + 1);
                    $cell = $ws->getCell("{$col}{$rowNum}");
                    $cell->setValueExplicit((string) $val, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                    $cell->getStyle()->getFill()->setFillType('solid')->getStartColor()->setRGB($bg);
                }
            }

            // Auto width
            foreach (range(1, count($sheet['headers'])) as $colIdx) {
                $ws->getColumnDimensionByColumn($colIdx)->setAutoSize(true);
            }
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        return ob_get_clean();
    }

    // ── Private: Multi-Sheet XLSX Parser ──────────────────────────────
    private function parseMultiSheetXlsx(string $filePath): array
    {
        $zip = new \ZipArchive();
        if ($zip->open($filePath) !== true)
            return [];

        // shared strings
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

        // workbook — get sheet names & targets
        $wbXml = $zip->getFromName('xl/workbook.xml');
        $wbRelsXml = $zip->getFromName('xl/_rels/workbook.xml.rels');
        $sheetList = [];

        if ($wbXml && $wbRelsXml) {
            $wb = simplexml_load_string($wbXml);
            $wbRels = simplexml_load_string($wbRelsXml);

            $relMap = [];
            foreach ($wbRels->Relationship as $rel) {
                $relMap[(string) $rel['Id']] = (string) $rel['Target'];
            }

            $ns = $wb->getNamespaces(true);
            $rNs = $ns['r'] ?? 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

            foreach ($wb->sheets->sheet as $sheet) {
                $rId = (string) $sheet->attributes($rNs)['id'];
                $target = $relMap[$rId] ?? null;
                if (!$target)
                    continue;
                // target could be "worksheets/sheet1.xml" or absolute
                $path = (strpos($target, '/') === 0) ? ltrim($target, '/') : 'xl/' . $target;
                $sheetList[] = ['name' => (string) $sheet['name'], 'path' => $path];
            }
        } else {
            // fallback: try sheet1..sheetN
            for ($i = 1; $i <= 15; $i++) {
                $path = "xl/worksheets/sheet{$i}.xml";
                if ($zip->getFromName($path) !== false) {
                    $sheetList[] = ['name' => "Sheet{$i}", 'path' => $path];
                }
            }
        }

        $result = [];
        foreach ($sheetList as $sheetMeta) {
            $sheetXml = $zip->getFromName($sheetMeta['path']);
            if ($sheetXml === false)
                continue;

            $sheet = simplexml_load_string($sheetXml);
            $rows = [];
            foreach ($sheet->sheetData->row as $row) {
                $rowArr = [];
                $maxCol = 0;
                foreach ($row->c as $cell) {
                    $ref = (string) $cell['r'];
                    $colLetter = preg_replace('/[0-9]/', '', $ref);
                    $colIdx = $this->colLetterToIndex($colLetter);
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
            $result[] = ['name' => $sheetMeta['name'], 'rows' => $rows];
        }

        $zip->close();
        return $result;
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