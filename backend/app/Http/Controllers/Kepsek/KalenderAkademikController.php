<?php

namespace App\Http\Controllers\Kepsek;

use App\Http\Controllers\Controller;
use App\Models\KalenderAkademik;
use Illuminate\Http\Request;

class KalenderAkademikController extends Controller
{
    // -------------------------------------------------------
    // GET /kepsek/kalender
    // Query params: tahun (int), jenis (string)
    // -------------------------------------------------------
    public function index(Request $request)
    {
        $tahun = $request->query('tahun', now()->year);
        $jenis = $request->query('jenis');

        $query = KalenderAkademik::with('pembuat:id,username')
            ->whereYear('tanggal_mulai', $tahun)
            ->orderBy('tanggal_mulai');

        if ($jenis && $jenis !== 'semua') {
            $query->where('jenis', $jenis);
        }

        $data = $query->get()->map(fn($k) => [
            'id' => $k->id,
            'judul' => $k->judul,
            'deskripsi' => $k->deskripsi,
            'jenis' => $k->jenis,
            'tanggal_mulai' => $k->tanggal_mulai->format('Y-m-d'),
            'tanggal_selesai' => $k->tanggal_selesai->format('Y-m-d'),
            'durasi_hari' => $k->tanggal_mulai->diffInDays($k->tanggal_selesai) + 1,
            'dibuat_oleh' => $k->pembuat?->username,
            'created_at' => $k->created_at,
        ]);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    // -------------------------------------------------------
    // POST /kepsek/kalender
    // -------------------------------------------------------
    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'jenis' => 'required|in:jadwal_ujian,libur_nasional,libur_semester,kegiatan,rapat',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
        ]);

        $kalender = KalenderAkademik::create([
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'jenis' => $request->jenis,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'dibuat_oleh' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil ditambahkan.',
            'data' => $kalender,
        ], 201);
    }

    // -------------------------------------------------------
    // PUT /kepsek/kalender/{id}
    // -------------------------------------------------------
    public function update(Request $request, $id)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'jenis' => 'required|in:jadwal_ujian,libur_nasional,libur_semester,kegiatan,rapat',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
        ]);

        $kalender = KalenderAkademik::findOrFail($id);
        $kalender->update([
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'jenis' => $request->jenis,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil diperbarui.',
            'data' => $kalender,
        ]);
    }

    // -------------------------------------------------------
    // DELETE /kepsek/kalender/{id}
    // -------------------------------------------------------
    public function destroy($id)
    {
        $kalender = KalenderAkademik::findOrFail($id);
        $kalender->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil dihapus.',
        ]);
    }
}