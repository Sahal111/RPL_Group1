<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use App\Models\SiswaKelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MasterDataSiswaController extends Controller
{
    public function index(Request $request)
    {
        $query = Siswa::query()
            ->when($request->search, function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', "%{$request->search}%")
                    ->orWhere('nisn', 'like', "%{$request->search}%")
                    ->orWhere('no_induk', 'like', "%{$request->search}%");
            })
            ->when($request->status, function ($q) use ($request) {
                $q->where('status_pd', $request->status);
            })
            ->orderBy('nama_lengkap')
            ->paginate(15);

        return response()->json(['success' => true, 'data' => $query]);
    }

    public function show($nisn)
    {
        $siswa = Siswa::with(['kelas.kelas'])->where('nisn', $nisn)->firstOrFail();
        return response()->json(['success' => true, 'data' => $siswa]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nisn' => 'required|string|size:10|unique:siswa,nisn',
            'nik' => 'nullable|string|max:16',
            'no_induk' => 'nullable|string|max:20',
            'nama_lengkap' => 'required|string|max:100',
            'jenis_kelamin' => 'required|in:L,P',
            'tanggal_lahir' => 'required|date',
            'tempat_lahir' => 'required|string|max:60',
            'agama' => 'required|in:Islam,Kristen Protestan,KristenKatolik,Hindu,Buddha,Khonghucu',
            'status_dalam_keluarga' => 'required|in:Anak Kandung,AnakTiri,Anak Angkat',
            'anak_ke' => 'nullable|integer|min:1',
            'no_kk' => 'nullable|string|max:16',
            'no_akta_lahir' => 'nullable|string|max:50',
            'nama_ibu_kandung' => 'required|string|max:100',
            'kewarganegaraan' => 'required|in:WNI,WNA',
            'alamat_jalan' => 'required|string',
            'rt' => 'nullable|string|max:5',
            'rw' => 'nullable|string|max:5',
            'desa' => 'nullable|string|max:60',
            'kecamatan' => 'nullable|string|max:60',
            'kabupaten' => 'nullable|string|max:60',
            'provinsi' => 'nullable|string|max:60',
            'kode_pos' => 'nullable|string|max:10',
            'no_hp' => 'nullable|string|max:20',
            'status_pd' => 'required|in:Aktif,Mutasi Keluar,Lulus,Dropout,Meninggal',
            'asal_sekolah' => 'nullable|string|max:100',
            'tanggal_masuk' => 'required|date',
        ]);

        $siswa = Siswa::create($request->only([
            'nisn',
            'nik',
            'no_induk',
            'nama_lengkap',
            'jenis_kelamin',
            'tanggal_lahir',
            'tempat_lahir',
            'agama',
            'status_dalam_keluarga',
            'anak_ke',
            'no_kk',
            'no_akta_lahir',
            'nama_ibu_kandung',
            'kewarganegaraan',
            'alamat_jalan',
            'rt',
            'rw',
            'desa',
            'kecamatan',
            'kabupaten',
            'provinsi',
            'kode_pos',
            'no_hp',
            'status_pd',
            'asal_sekolah',
            'tanggal_masuk',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Data siswa berhasil ditambahkan.',
            'data' => $siswa,
        ], 201);
    }

    public function update(Request $request, $nisn)
    {
        $siswa = Siswa::where('nisn', $nisn)->firstOrFail();

        $request->validate([
            'nik' => 'nullable|string|max:16',
            'no_induk' => 'nullable|string|max:20',
            'nama_lengkap' => 'required|string|max:100',
            'jenis_kelamin' => 'required|in:L,P',
            'tanggal_lahir' => 'required|date',
            'tempat_lahir' => 'required|string|max:60',
            'agama' => 'required|in:Islam,Kristen Protestan,KristenKatolik,Hindu,Buddha,Khonghucu',
            'status_dalam_keluarga' => 'required|in:Anak Kandung,AnakTiri,Anak Angkat',
            'anak_ke' => 'nullable|integer|min:1',
            'no_kk' => 'nullable|string|max:16',
            'no_akta_lahir' => 'nullable|string|max:50',
            'nama_ibu_kandung' => 'required|string|max:100',
            'kewarganegaraan' => 'required|in:WNI,WNA',
            'alamat_jalan' => 'required|string',
            'rt' => 'nullable|string|max:5',
            'rw' => 'nullable|string|max:5',
            'desa' => 'nullable|string|max:60',
            'kecamatan' => 'nullable|string|max:60',
            'kabupaten' => 'nullable|string|max:60',
            'provinsi' => 'nullable|string|max:60',
            'kode_pos' => 'nullable|string|max:10',
            'no_hp' => 'nullable|string|max:20',
            'status_pd' => 'required|in:Aktif,Mutasi Keluar,Lulus,Dropout,Meninggal',
            'asal_sekolah' => 'nullable|string|max:100',
            'tanggal_masuk' => 'required|date',
        ]);

        $siswa->update($request->only([
            'nik',
            'no_induk',
            'nama_lengkap',
            'jenis_kelamin',
            'tanggal_lahir',
            'tempat_lahir',
            'agama',
            'status_dalam_keluarga',
            'anak_ke',
            'no_kk',
            'no_akta_lahir',
            'nama_ibu_kandung',
            'kewarganegaraan',
            'alamat_jalan',
            'rt',
            'rw',
            'desa',
            'kecamatan',
            'kabupaten',
            'provinsi',
            'kode_pos',
            'no_hp',
            'status_pd',
            'asal_sekolah',
            'tanggal_masuk',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Data siswa berhasil diperbarui.',
            'data' => $siswa,
        ]);
    }

    public function uploadFoto(Request $request, $nisn)
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $siswa = Siswa::where('nisn', $nisn)->firstOrFail();

        if ($siswa->foto && file_exists(storage_path('app/public/' . $siswa->foto))) {
            unlink(storage_path('app/public/' . $siswa->foto));
        }

        $path = $request->file('foto')->store('foto-siswa', 'public');
        $siswa->update(['foto' => $path]);

        return response()->json([
            'success' => true,
            'message' => 'Foto berhasil diupload.',
            'data' => ['foto_url' => asset('storage/' . $path)],
        ]);
    }

    public function destroy($nisn)
    {
        $siswa = Siswa::where('nisn', $nisn)->firstOrFail();

        if ($siswa->userOrtu()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa ini terhubung dengan akun orang tua. Hapus akun ortu terlebih dahulu.',
            ], 422);
        }

        DB::transaction(function () use ($siswa) {
            SiswaKelas::where('nisn', $siswa->nisn)->delete();
            $siswa->delete();
        });

        return response()->json(['success' => true, 'message' => 'Data siswa berhasil dihapus.']);
    }

    // Assign siswa ke kelas
    public function assignKelas(Request $request, $nisn)
    {
        $request->validate([
            'id_kelas' => 'required|string|exists:kelas,id',
            'no_absen' => 'required|integer',
            'tahun_ajaran' => 'required|string',
            'semester' => 'required|in:1,2',
        ]);

        Siswa::where('nisn', $nisn)->firstOrFail();

        // Cek apakah sudah ada di kelas yang sama
        $sudahAda = SiswaKelas::where('nisn', $nisn)
            ->where('id_kelas', $request->id_kelas)
            ->whereNull('status_keluar')
            ->exists();

        if ($sudahAda) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa sudah terdaftar di kelas ini.',
            ], 422);
        }

        SiswaKelas::create([
            'nisn' => $nisn,
            'id_kelas' => $request->id_kelas,
            'no_absen' => $request->no_absen,
            'tahun_ajaran' => $request->tahun_ajaran,
            'semester' => $request->semester,
            'status_masuk' => 'Baru',
            'tanggal_masuk' => now()->toDateString(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil ditambahkan ke kelas.',
        ]);
    }
}