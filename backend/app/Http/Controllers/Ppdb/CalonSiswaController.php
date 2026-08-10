<?php

namespace App\Http\Controllers\Ppdb;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ppdb\StoreCalonSiswaRequest;
use App\Http\Requests\Ppdb\UpdateCalonSiswaRequest;
use App\Http\Requests\Ppdb\VerifikasiCalonSiswaRequest;
use App\Http\Requests\Ppdb\KonversiSiswaRequest;
use App\Models\CalonSiswa;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CalonSiswaController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = CalonSiswa::with([
            'tahunAjaran:id,nama',
            'siswa:id,nama_lengkap,nisn',
        ])
            ->when(
                $request->search,
                fn($q) =>
                $q->where('nama_lengkap', 'like', "%{$request->search}%")
                    ->orWhere('no_pendaftaran', 'like', "%{$request->search}%")
                    ->orWhere('no_hp', 'like', "%{$request->search}%")
            )
            ->when(
                $request->status,
                fn($q) =>
                $q->where('status', $request->status)
            )
            ->when(
                $request->tahun_ajaran_id,
                fn($q) =>
                $q->where('tahun_ajaran_id', $request->tahun_ajaran_id)
            )
            ->when(
                $request->jalur,
                fn($q) =>
                $q->where('jalur', $request->jalur)
            )
            ->latest();

        $data = $request->boolean('all')
            ? $query->get()
            : $query->paginate(15);

        return $this->success($data);
    }

    public function store(StoreCalonSiswaRequest $request)
    {
        $validated = $request->validated();

        // Generate no_pendaftaran otomatis
        $tahunAjaran = TahunAjaran::findOrFail($validated['tahun_ajaran_id']);
        $tahun = now()->year;
        $urut = CalonSiswa::whereYear('created_at', $tahun)->count() + 1;
        $validated['no_pendaftaran'] = 'PPDB-' . $tahun . '-' . str_pad($urut, 3, '0', STR_PAD_LEFT);

        $calon = CalonSiswa::create($validated);

        return $this->created(
            $calon->load('tahunAjaran:id,nama'),
            'Pendaftaran PPDB berhasil ditambahkan.'
        );
    }

    public function show($id)
    {
        $calon = CalonSiswa::with([
            'tahunAjaran:id,nama',
            'berkas',
            'pembayaranPpdb',
            'siswa:id,nama_lengkap,nisn',
        ])
            ->findOrFail($id);

        return $this->success($calon);
    }

    public function update(UpdateCalonSiswaRequest $request, $id)
    {
        $calon = CalonSiswa::findOrFail($id);

        if (in_array($calon->status, ['converted', 'dibatalkan'])) {
            return $this->conflict('Data pendaftar dengan status ini tidak dapat diubah.');
        }

        $calon->update($request->validated());

        return $this->success(
            $calon->fresh('tahunAjaran:id,nama'),
            'Data pendaftar berhasil diperbarui.'
        );
    }

    public function destroy($id)
    {
        $calon = CalonSiswa::findOrFail($id);

        if ($calon->status === 'converted') {
            return $this->conflict('Pendaftar yang sudah dikonversi menjadi siswa tidak dapat dihapus.');
        }

        $calon->delete();

        return $this->success(null, 'Data pendaftar berhasil dihapus.');
    }

    /**
     * Verifikasi status calon siswa (lulus, tidak_lulus, cadangan, dll)
     */
    public function verifikasi(VerifikasiCalonSiswaRequest $request, $id)
    {
        $calon = CalonSiswa::findOrFail($id);

        if ($calon->status === 'converted') {
            return $this->conflict('Pendaftar yang sudah dikonversi tidak dapat diverifikasi ulang.');
        }

        $calon->update([
            'status' => $request->status,
            'catatan_verifikasi' => $request->catatan_verifikasi,
        ]);

        return $this->success(
            $calon->fresh('tahunAjaran:id,nama'),
            "Status pendaftar berhasil diubah menjadi '{$request->status}'."
        );
    }

    /**
     * Konversi calon siswa yang lulus menjadi siswa aktif
     */
    public function konversi(KonversiSiswaRequest $request, $id)
    {
        $calon = CalonSiswa::with('tahunAjaran')->findOrFail($id);

        if ($calon->status !== 'lulus') {
            return $this->conflict('Hanya pendaftar dengan status "lulus" yang dapat dikonversi.');
        }

        if ($calon->siswa_id !== null) {
            return $this->conflict('Pendaftar ini sudah dikonversi sebelumnya.');
        }

        // Buat siswa baru dari data calon siswa
        $siswa = Siswa::create([
            'school_id' => $calon->school_id,
            'nama_lengkap' => $calon->nama_lengkap,
            'jenis_kelamin' => $calon->jenis_kelamin,
            'tempat_lahir' => $calon->tempat_lahir,
            'tanggal_lahir' => $calon->tanggal_lahir,
            'agama' => $calon->agama,
            'alamat' => $calon->alamat,
            'nisn' => $request->nisn ?? null,
            'nik' => $request->nik ?? null,
            'no_kk' => $request->no_kk ?? null,
            'status' => 'aktif',
        ]);

        // Update calon siswa: link ke siswa baru dan ubah status
        $calon->update([
            'siswa_id' => $siswa->id,
            'status' => 'converted',
        ]);

        return $this->created([
            'calon_siswa' => $calon->fresh(['siswa:id,nama_lengkap,nisn', 'tahunAjaran:id,nama']),
            'siswa' => $siswa,
        ], 'Calon siswa berhasil dikonversi menjadi siswa aktif.');
    }

    /**
     * Dashboard statistik PPDB
     */
    public function dashboardStats(Request $request)
    {
        $tahunAjaranId = $request->tahun_ajaran_id
            ?? TahunAjaran::where('is_aktif', true)->value('id');

        $base = CalonSiswa::when(
            $tahunAjaranId,
            fn($q) =>
            $q->where('tahun_ajaran_id', $tahunAjaranId)
        );

        $stats = [
            'total_pendaftar' => (clone $base)->count(),
            'pending' => (clone $base)->where('status', 'pending')->count(),
            'verifikasi' => (clone $base)->where('status', 'verifikasi')->count(),
            'lulus' => (clone $base)->where('status', 'lulus')->count(),
            'tidak_lulus' => (clone $base)->where('status', 'tidak_lulus')->count(),
            'cadangan' => (clone $base)->where('status', 'cadangan')->count(),
            'converted' => (clone $base)->where('status', 'converted')->count(),
            'dibatalkan' => (clone $base)->where('status', 'dibatalkan')->count(),
        ];

        return $this->success($stats);
    }
}