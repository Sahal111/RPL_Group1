<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\JadwalPelajaran; // tabel: jadwals
use Illuminate\Http\Request;

class JadwalPelajaranController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|string',
            'tahun_ajarans' => 'required|string',
            'semester' => 'required|in:1,2',
        ]);

        $jadwal = JadwalPelajaran::with(['mataPelajaran', 'gurus'])
            ->where('kelas_id', $request->kelas_id)
            ->where('tahun_ajarans', $request->tahun_ajaran)
            ->where('semester', $request->semester)
            ->orderBy('hari')
            ->orderBy('jam_mulai')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $jadwal,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|string|exists:kelas,id',
            'id_mapel' => 'required|integer|exists:mata_pelajaran,id',
            'nuptk' => 'required|string|exists:gurus,nuptk',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'semester' => 'required|in:1,2',
            'tahun_ajarans' => 'required|string',
        ]);

        if ($bentrok = $this->cekBentrok($request)) {
            return response()->json($bentrok, 422);
        }

        $jadwal = JadwalPelajaran::create($request->only(['kelas_id', 'id_mapel', 'nuptk', 'hari', 'jam_mulai', 'jam_selesai', 'semester', 'tahun_ajarans']));

        return response()->json([
            'success' => true,
            'message' => 'Jadwal pelajaran berhasil ditambahkan.',
            'data' => $jadwal->load(['mataPelajaran', 'gurus']),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $jadwal = JadwalPelajaran::findOrFail($id);

        $request->validate([
            'kelas_id' => 'required|string|exists:kelas,id',
            'id_mapel' => 'required|integer|exists:mata_pelajaran,id',
            'nuptk' => 'required|string|exists:gurus,nuptk',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'semester' => 'required|in:1,2',
            'tahun_ajarans' => 'required|string',
        ]);

        if ($bentrok = $this->cekBentrok($request, $id)) {
            return response()->json($bentrok, 422);
        }

        $jadwal->update($request->only(['kelas_id', 'id_mapel', 'nuptk', 'hari', 'jam_mulai', 'jam_selesai', 'semester', 'tahun_ajarans']));

        return response()->json([
            'success' => true,
            'message' => 'Jadwal pelajaran berhasil diperbarui.',
            'data' => $jadwal->load(['mataPelajaran', 'gurus']),
        ]);
    }

    public function destroy($id)
    {
        $jadwal = JadwalPelajaran::findOrFail($id);
        $jadwal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal pelajaran berhasil dihapus.',
        ]);
    }

    private function cekBentrok(Request $request, $ignoreId = null)
    {
        // 1. Cek Bentrok Kelas (Tidak boleh ada jadwal lain di kelas ini pada waktu yg sama)
        $bentrokKelas = JadwalPelajaran::where('id_kelas', $request->kelas_id)
            ->where('hari', $request->hari)
            ->where('tahun_ajarans', $request->tahun_ajaran)
            ->where('semester', $request->semester)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->where(function ($query) use ($request) {
                $query->where('jam_mulai', '<', $request->jam_selesai)
                      ->where('jam_selesai', '>', $request->jam_mulai);
            })->with('mataPelajaran')->first();

        if ($bentrokKelas) {
            $namaMapel = $bentrokKelas->mataPelajaran->nama_mapel ?? 'Mapel lain';
            return [
                'success' => false,
                'message' => "Jadwal bentrok dengan {$namaMapel} di kelas ini pada pukul " .
                             date('H:i', strtotime($bentrokKelas->jam_mulai)) . " - " .
                             date('H:i', strtotime($bentrokKelas->jam_selesai)) . ".",
            ];
        }

        // 2. Cek Bentrok Guru (Guru tidak boleh mengajar di kelas lain pada waktu yg sama)
        $bentrokGuru = JadwalPelajaran::where('nuptk', $request->nuptk)
            ->where('hari', $request->hari)
            ->where('tahun_ajarans', $request->tahun_ajaran)
            ->where('semester', $request->semester)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->where(function ($query) use ($request) {
                $query->where('jam_mulai', '<', $request->jam_selesai)
                      ->where('jam_selesai', '>', $request->jam_mulai);
            })->with('kelas')->first();

        if ($bentrokGuru) {
            $namaKelas = $bentrokGuru->kelas->nama_kelas ?? 'Kelas lain';
            return [
                'success' => false,
                'message' => "Guru tersebut sudah memiliki jadwal mengajar di {$namaKelas} pada pukul " .
                             date('H:i', strtotime($bentrokGuru->jam_mulai)) . " - " .
                             date('H:i', strtotime($bentrokGuru->jam_selesai)) . ".",
            ];
        }

        return false;
    }
}
