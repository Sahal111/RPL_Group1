<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Keuangan\StorePembayaranRequest;
use App\Models\Pembayaran;
use App\Models\Tagihan;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PembayaranController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Pembayaran::with([
            'tagihan.jenisTagihan:id,nama_tagihan',
            'siswa:id,nisn,nama',
            'createdBy:id,name',
        ])
            ->when(
                $request->search,
                fn($q) =>
                $q->whereHas(
                    'siswa',
                    fn($s) =>
                    $s->where('nama', 'like', "%{$request->search}%")
                        ->orWhere('nisn', 'like', "%{$request->search}%")
                )
            )
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->metode_bayar, fn($q) => $q->where('metode_bayar', $request->metode_bayar))
            ->when(
                $request->tanggal_dari,
                fn($q) =>
                $q->whereDate('tanggal_bayar', '>=', $request->tanggal_dari)
            )
            ->when(
                $request->tanggal_sampai,
                fn($q) =>
                $q->whereDate('tanggal_bayar', '<=', $request->tanggal_sampai)
            )
            ->when($request->siswa_id, fn($q) => $q->where('siswa_id', $request->siswa_id))
            ->latest('tanggal_bayar');

        return $this->success($query->paginate(20));
    }

    public function store(StorePembayaranRequest $request)
    {
        $tagihan = Tagihan::findOrFail($request->tagihan_id);

        if ($tagihan->status === 'lunas' || $tagihan->status === 'bebas') {
            return $this->conflict('Tagihan ini sudah ' . $tagihan->status . '.');
        }

        $pembayaran = DB::transaction(function () use ($request, $tagihan) {
            $pembayaran = Pembayaran::create([
                ...$request->validated(),
                'siswa_id' => $tagihan->siswa_id,
                'created_by' => auth()->id(),
            ]);

            // Hitung total yang sudah dibayar untuk tagihan ini
            $totalBayar = Pembayaran::where('tagihan_id', $tagihan->id)
                ->where('status', 'valid')
                ->sum('nominal_bayar');

            // Update status tagihan
            if ($totalBayar >= $tagihan->nominal_bersih) {
                $tagihan->update(['status' => 'lunas']);
            } elseif ($totalBayar > 0) {
                $tagihan->update(['status' => 'cicil']);
            }

            return $pembayaran;
        });

        return $this->created(
            $pembayaran->load(['tagihan.jenisTagihan:id,nama_tagihan', 'siswa:id,nisn,nama']),
            'Pembayaran berhasil dicatat.'
        );
    }

    public function show($id)
    {
        $pembayaran = Pembayaran::with([
            'tagihan.jenisTagihan',
            'tagihan.tahunAjaran:id,nama',
            'siswa:id,nisn,nama',
            'createdBy:id,name',
            'updatedBy:id,name',
        ])->findOrFail($id);

        return $this->success($pembayaran);
    }

    public function batalkan(Request $request, $id)
    {
        $pembayaran = Pembayaran::findOrFail($id);

        if ($pembayaran->status === 'batal') {
            return $this->conflict('Pembayaran ini sudah dibatalkan.');
        }

        $request->validate([
            'alasan' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($pembayaran, $request) {
            $pembayaran->update([
                'status' => 'batal',
                'catatan' => ($pembayaran->catatan ? $pembayaran->catatan . ' | ' : '') . 'BATAL: ' . $request->alasan,
                'updated_by' => auth()->id(),
            ]);

            // Recalculate status tagihan
            $tagihan = $pembayaran->tagihan;
            $totalBayarValid = Pembayaran::where('tagihan_id', $tagihan->id)
                ->where('status', 'valid')
                ->sum('nominal_bayar');

            if ($totalBayarValid <= 0) {
                $tagihan->update(['status' => 'belum']);
            } elseif ($totalBayarValid < $tagihan->nominal_bersih) {
                $tagihan->update(['status' => 'cicil']);
            }
        });

        return $this->success(null, 'Pembayaran berhasil dibatalkan.');
    }

    /**
     * Dashboard stats untuk bendahara.
     */
    public function dashboardStats(Request $request)
    {
        $bulan = $request->bulan ?? now()->month;
        $tahun = $request->tahun ?? now()->year;

        $pemasukanBulanIni = Pembayaran::where('status', 'valid')
            ->whereMonth('tanggal_bayar', $bulan)
            ->whereYear('tanggal_bayar', $tahun)
            ->sum('nominal_bayar');

        $totalTagihanAktif = Tagihan::whereIn('status', ['belum', 'cicil'])->sum('nominal_bersih');
        $totalSiswaLunas = Tagihan::where('status', 'lunas')->distinct('siswa_id')->count('siswa_id');
        $totalTunggakan = Tagihan::tunggakan()->sum('nominal_bersih');

        $transaksiHariIni = Pembayaran::where('status', 'valid')
            ->whereDate('tanggal_bayar', today())
            ->count();

        return $this->success([
            'pemasukan_bulan_ini' => (float) $pemasukanBulanIni,
            'total_tagihan_aktif' => (float) $totalTagihanAktif,
            'total_siswa_lunas' => $totalSiswaLunas,
            'total_tunggakan' => (float) $totalTunggakan,
            'transaksi_hari_ini' => $transaksiHariIni,
        ]);
    }

    /**
     * Laporan pemasukan per periode.
     */
    public function laporan(Request $request)
    {
        $request->validate([
            'dari' => 'required|date',
            'sampai' => 'required|date|after_or_equal:dari',
        ]);

        $pembayarans = Pembayaran::with(['siswa:id,nisn,nama', 'tagihan.jenisTagihan:id,nama_tagihan'])
            ->where('status', 'valid')
            ->whereBetween('tanggal_bayar', [$request->dari, $request->sampai])
            ->orderBy('tanggal_bayar')
            ->get();

        $totalPemasukan = $pembayarans->sum('nominal_bayar');

        $perMetode = $pembayarans->groupBy('metode_bayar')->map(fn($g) => [
            'jumlah_transaksi' => $g->count(),
            'total' => $g->sum('nominal_bayar'),
        ]);

        return $this->success([
            'periode' => ['dari' => $request->dari, 'sampai' => $request->sampai],
            'total_pemasukan' => (float) $totalPemasukan,
            'per_metode' => $perMetode,
            'transaksi' => $pembayarans,
        ]);
    }
}