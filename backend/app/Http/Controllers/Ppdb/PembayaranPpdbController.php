<?php

namespace App\Http\Controllers\Ppdb;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ppdb\StorePembayaranPpdbRequest;
use App\Http\Requests\Ppdb\UpdatePembayaranPpdbRequest;
use App\Models\CalonSiswa;
use App\Models\PembayaranPpdb;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class PembayaranPpdbController extends Controller
{
    use ApiResponse;

    public function index($calonSiswaId)
    {
        $calon = CalonSiswa::findOrFail($calonSiswaId);

        $pembayaran = PembayaranPpdb::where('calon_siswa_id', $calon->id)
            ->orderBy('tanggal_bayar', 'desc')
            ->get();

        $total = $pembayaran->sum('nominal');

        return $this->success([
            'pembayaran' => $pembayaran,
            'total' => $total,
        ]);
    }

    public function store(StorePembayaranPpdbRequest $request, $calonSiswaId)
    {
        $calon = CalonSiswa::findOrFail($calonSiswaId);

        $bayar = PembayaranPpdb::create([
            ...$request->validated(),
            'school_id' => $calon->school_id,
            'calon_siswa_id' => $calon->id,
        ]);

        return $this->created($bayar, 'Pembayaran PPDB berhasil dicatat.');
    }

    public function update(UpdatePembayaranPpdbRequest $request, $calonSiswaId, $bayarId)
    {
        $calon = CalonSiswa::findOrFail($calonSiswaId);
        $bayar = PembayaranPpdb::where('calon_siswa_id', $calon->id)
            ->findOrFail($bayarId);

        $bayar->update($request->validated());

        return $this->success($bayar, 'Data pembayaran berhasil diperbarui.');
    }

    public function destroy($calonSiswaId, $bayarId)
    {
        $calon = CalonSiswa::findOrFail($calonSiswaId);
        $bayar = PembayaranPpdb::where('calon_siswa_id', $calon->id)
            ->findOrFail($bayarId);

        $bayar->delete();

        return $this->success(null, 'Data pembayaran berhasil dihapus.');
    }
}