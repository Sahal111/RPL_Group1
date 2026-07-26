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
            'kategori' => 'required|in:KTP,KK,NPWP,Ijazah,Transkrip,SK Pengangkatan,SK Berkala,Sertifikat Pendidik,Sertifikat Pelatihan,Pakta Integritas,CV,Buku Rekening,Lainnya',
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
        ]);

        $rekening = $guru->rekenings()->updateOrCreate(
            ['guru_id' => $guru->id, 'is_primary' => 1],
            $request->only(['nama_bank', 'no_rekening', 'atas_nama', 'cabang', 'npwp', 'no_bpjs_kesehatan', 'no_bpjs_ketenagakerjaan'])
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
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'jumlah_jam' => 'nullable|integer|min:1',
            'no_sertifikat' => 'nullable|string|max:80',
            'file_sertifikat' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = $request->only(['nama_diklat', 'penyelenggara', 'tanggal_mulai', 'tanggal_selesai', 'jumlah_jam', 'no_sertifikat']);

        if ($request->hasFile('file_sertifikat')) {
            $data['file_sertifikat'] = $request->file('file_sertifikat')->store("guru-dokumen/{$guru->id}/diklat", 'public');
        }

        $diklat = $guru->diklats()->create($data);

        return response()->json(['success' => true, 'message' => 'Riwayat pelatihan ditambahkan.', 'data' => $diklat], 201);
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
}