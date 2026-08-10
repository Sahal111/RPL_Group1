<?php

namespace App\Http\Controllers\Ppdb;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ppdb\StoreBerkasPendaftarRequest;
use App\Http\Requests\Ppdb\VerifikasiBerkasRequest;
use App\Models\BerkasPendaftar;
use App\Models\CalonSiswa;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BerkasPendaftarController extends Controller
{
    use ApiResponse;

    public function index($calonSiswaId)
    {
        $calon = CalonSiswa::findOrFail($calonSiswaId);

        $berkas = BerkasPendaftar::where('calon_siswa_id', $calon->id)
            ->orderBy('jenis_berkas')
            ->get();

        return $this->success($berkas);
    }

    public function store(StoreBerkasPendaftarRequest $request, $calonSiswaId)
    {
        $calon = CalonSiswa::findOrFail($calonSiswaId);

        $file = $request->file('file');
        $path = $file->store("ppdb/{$calon->school_id}/{$calon->id}", 'public');
        $ukuran = $file->getSize();

        // Jika sudah ada berkas jenis yang sama, replace
        $existing = BerkasPendaftar::where('calon_siswa_id', $calon->id)
            ->where('jenis_berkas', $request->jenis_berkas)
            ->first();

        if ($existing) {
            // Hapus file lama
            Storage::disk('public')->delete($existing->file_path);

            $existing->update([
                'file_path' => $path,
                'ukuran_file' => $ukuran,
                'status_verifikasi' => 'pending',
                'catatan' => null,
            ]);

            return $this->success($existing, 'Berkas berhasil diperbarui.');
        }

        $berkas = BerkasPendaftar::create([
            'school_id' => $calon->school_id,
            'calon_siswa_id' => $calon->id,
            'jenis_berkas' => $request->jenis_berkas,
            'file_path' => $path,
            'ukuran_file' => $ukuran,
            'status_verifikasi' => 'pending',
        ]);

        return $this->created($berkas, 'Berkas berhasil diunggah.');
    }

    public function destroy($calonSiswaId, $berkasId)
    {
        $calon = CalonSiswa::findOrFail($calonSiswaId);
        $berkas = BerkasPendaftar::where('calon_siswa_id', $calon->id)
            ->findOrFail($berkasId);

        Storage::disk('public')->delete($berkas->file_path);
        $berkas->delete();

        return $this->success(null, 'Berkas berhasil dihapus.');
    }

    /**
     * Admin PPDB verifikasi berkas (approved / rejected)
     */
    public function verifikasi(VerifikasiBerkasRequest $request, $calonSiswaId, $berkasId)
    {
        $calon = CalonSiswa::findOrFail($calonSiswaId);
        $berkas = BerkasPendaftar::where('calon_siswa_id', $calon->id)
            ->findOrFail($berkasId);

        $berkas->update([
            'status_verifikasi' => $request->status_verifikasi,
            'catatan' => $request->catatan,
        ]);

        $label = $request->status_verifikasi === 'approved' ? 'disetujui' : 'ditolak';

        return $this->success($berkas, "Berkas berhasil {$label}.");
    }
}