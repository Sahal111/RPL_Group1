<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Keuangan\StoreTagihanRequest;
use App\Http\Requests\Keuangan\GenerateTagihanRequest;
use App\Models\JenisTagihan;
use App\Models\Siswa;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TagihanController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Tagihan::with([
                'siswa:id,nisn,nama',
                'jenisTagihan:id,nama_tagihan,kategori',
                'tahunAjaran:id,nama',
            ])
            ->when($request->search, fn($q) =>
                $q->whereHas('siswa', fn($s) =>
                    $s->where('nama', 'like', "%{$request->search}%")
                      ->orWhere('nisn', 'like', "%{$request->search}%")
                )
            )
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->siswa_id, fn($q) => $q->where('siswa_id', $request->siswa_id))
            ->when($request->jenis_tagihan_id, fn($q) =>
                $q->where('jenis_tagihan_id', $request->jenis_tagihan_id)
            )
            ->when($request->tahun_ajaran_id, fn($q) =>
                $q->where('tahun_ajaran_id', $request->tahun_ajaran_id)
            )
            ->when($request->bulan, fn($q) => $q->where('bulan', $request->bulan))
            ->latest();

        return $this->success($query->paginate(20));
    }

    public function store(StoreTagihanRequest $request)
    {
        $data = $request->validated();
        $data['nominal_bersih'] = $data['nominal_tagihan'] - ($data['nominal_diskon'] ?? 0);
        $data['created_by'] = auth()->id();

        $tagihan = Tagihan::create($data);

        return $this->created(
            $tagihan->load(['siswa:id,nisn,nama', 'jenisTagihan:id,nama_tagihan']),
            'Tagihan berhasil ditambahkan.'
        );
    }

    public function show($id)
    {
        $tagihan = Tagihan::with([
            'siswa:id,nisn,nama',
            'jenisTagihan:id,nama_tagihan,kategori',
            'tahunAjaran:id,nama',
            'pembayarans',
        ])->findOrFail($id);

        return $this->success($tagihan);
    }

    public function update(Request $request, $id)
    {
        $tagihan = Tagihan::findOrFail($id);

        if ($tagihan->status === 'lunas') {
            return $this->conflict('Tagihan yang sudah lunas tidak bisa diubah.');
        }

        $request->validate([
            'nominal_tagihan' => 'sometimes|numeric|min:0',
            'nominal_diskon'  => 'sometimes|numeric|min:0',
            'jatuh_tempo'     => 'sometimes|nullable|date',
            'keterangan'      => 'sometimes|nullable|string|max:500',
            'status'          => 'sometimes|in:belum,lunas,cicil,bebas',
        ]);

        $data = $request->only(['nominal_tagihan', 'nominal_diskon', 'jatuh_tempo', 'keterangan', 'status']);

        if (isset($data['nominal_tagihan']) || isset($data['nominal_diskon'])) {
            $nominal  = $data['nominal_tagihan'] ?? $tagihan->nominal_tagihan;
            $diskon   = $data['nominal_diskon']  ?? $tagihan->nominal_diskon;
            $data['nominal_bersih'] = $nominal - $diskon;
        }

        $tagihan->update($data);

        return $this->success($tagihan->fresh(), 'Tagihan berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $tagihan = Tagihan::findOrFail($id);

        if ($tagihan->pembayarans()->exists()) {
            return $this->conflict('Tagihan ini sudah memiliki riwayat pembayaran. Gunakan status "Bebas" untuk membebaskan tagihan.');
        }

        $tagihan->delete();

        return $this->success(null, 'Tagihan berhasil dihapus.');
    }

    /**
     * Generate tagihan massal untuk semua siswa aktif berdasarkan JenisTagihan rutin.
     */
    public function generate(GenerateTagihanRequest $request)
    {
        $jenis = JenisTagihan::findOrFail($request->jenis_tagihan_id);
        $siswaList = Siswa::where('status', 'aktif')->get();

        if ($siswaList->isEmpty()) {
            return $this->error('Tidak ada siswa aktif.', 'NO_DATA', 422);
        }

        $bulan       = $request->bulan;
        $tahunAjaranId = $request->tahun_ajaran_id;
        $jatuhTempo  = $request->jatuh_tempo;
        $createdBy   = auth()->id();
        $count       = 0;

        DB::transaction(function () use ($siswaList, $jenis, $bulan, $tahunAjaranId, $jatuhTempo, $createdBy, &$count) {
            foreach ($siswaList as $siswa) {
                // Skip jika sudah ada tagihan yang sama
                $sudahAda = Tagihan::where('siswa_id', $siswa->id)
                    ->where('jenis_tagihan_id', $jenis->id)
                    ->when($bulan, fn($q) => $q->where('bulan', $bulan))
                    ->when($tahunAjaranId, fn($q) => $q->where('tahun_ajaran_id', $tahunAjaranId))
                    ->exists();

                if ($sudahAda) continue;

                Tagihan::create([
                    'siswa_id'          => $siswa->id,
                    'jenis_tagihan_id'  => $jenis->id,
                    'tahun_ajaran_id'   => $tahunAjaranId,
                    'bulan'             => $bulan,
                    'nominal_tagihan'   => $jenis->nominal_default,
                    'nominal_diskon'    => 0,
                    'nominal_bersih'    => $jenis->nominal_default,
                    'jatuh_tempo'       => $jatuhTempo,
                    'status'            => 'belum',
                    'created_by'        => $createdBy,
                ]);
                $count++;
            }
        });

        return $this->success(
            ['generated' => $count, 'skipped' => $siswaList->count() - $count],
            "Berhasil membuat {$count} tagihan baru. {$siswaList->count() -> $count} siswa sudah memiliki tagihan."
        );
    }

    /**
     * Rekap tunggakan per siswa.
     */
    public function tunggakan(Request $request)
    {
        $query = Tagihan::with('siswa:id,nisn,nama')
            ->tunggakan()
            ->when($request->tahun_ajaran_id, fn($q) =>
                $q->where('tahun_ajaran_id', $request->tahun_ajaran_id)
            )
            ->selectRaw('siswa_id, COUNT(*) as jumlah_tunggakan, SUM(nominal_bersih) as total_tunggakan')
            ->groupBy('siswa_id')
            ->orderByDesc('total_tunggakan');

        return $this->success($query->paginate(20));
    }

    /**
     * Rekap tagihan per siswa (summary card).
     */
    public function rekapSiswa($siswaId)
    {
        $siswa = Siswa::findOrFail($siswaId);

        $tagihans = Tagihan::where('siswa_id', $siswaId)
            ->with(['jenisTagihan:id,nama_tagihan', 'pembayarans'])
            ->latest()
            ->get();

        $summary = [
            'total_tagihan'  => $tagihans->sum('nominal_bersih'),
            'total_lunas'    => $tagihans->where('status', 'lunas')->sum('nominal_bersih'),
            'total_belum'    => $tagihans->whereIn('status', ['belum', 'cicil'])->sum('nominal_bersih'),
            'jumlah_lunas'   => $tagihans->where('status', 'lunas')->count(),
            'jumlah_belum'   => $tagihans->where('status', 'belum')->count(),
            'jumlah_cicil'   => $tagihans->where('status', 'cicil')->count(),
        ];

        return $this->success([
            'siswa'    => $siswa->only(['id', 'nisn', 'nama']),
            'summary'  => $summary,
            'tagihans' => $tagihans,
        ]);
    }
}