<?php

namespace App\Services;

use App\Models\Guru;
use App\Models\GuruCuti;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;

class GuruCutiService
{
    // ══════════════════════════════════════════════════
    // VALIDASI
    // ══════════════════════════════════════════════════

    public function validate(Guru $guru, array $input, ?int $cutiId = null): array
    {
        $errors = [];
        $warnings = [];

        $mulai = $input['tanggal_mulai'] ?? null;
        $selesai = $input['tanggal_selesai'] ?? null;
        $jenis = $input['jenis_cuti'] ?? null;

        // Guru harus Aktif untuk mengajukan cuti baru
        if (!$cutiId && $guru->status_keaktifan !== 'Aktif') {
            $errors[] = "Guru berstatus {$guru->status_keaktifan}. Cuti hanya dapat diajukan saat guru berstatus Aktif.";
        }

        // Guru tidak boleh punya cuti aktif yang tumpang tindih
        if ($mulai && $selesai) {
            if ($selesai < $mulai) {
                $errors[] = 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.';
            }

            $tumpang = $guru->cutis()
                ->where('status', 'Disetujui')
                ->where(
                    fn($q) =>
                    $q->whereBetween('tanggal_mulai', [$mulai, $selesai])
                        ->orWhereBetween('tanggal_selesai', [$mulai, $selesai])
                        ->orWhere(
                            fn($q2) =>
                            $q2->where('tanggal_mulai', '<=', $mulai)
                                ->where('tanggal_selesai', '>=', $selesai)
                        )
                )
                ->when($cutiId, fn($q) => $q->where('id', '!=', $cutiId))
                ->first();

            if ($tumpang) {
                $errors[] = 'Periode cuti bertabrakan dengan cuti lain ('
                    . $tumpang->tanggal_mulai->format('d/m/Y') . ' s.d. '
                    . $tumpang->tanggal_selesai->format('d/m/Y') . ').';
            }
        }

        // Hitung jumlah_hari otomatis dan beri warning jika > 90 hari
        if ($mulai && $selesai && $selesai >= $mulai) {
            $hari = (int) \Carbon\Carbon::parse($mulai)->diffInDays(\Carbon\Carbon::parse($selesai)) + 1;
            if ($hari > 90) {
                $warnings[] = "Durasi cuti {$hari} hari (> 90 hari). Pastikan ini sudah sesuai persetujuan.";
            }
        }

        return compact('errors', 'warnings');
    }

    // ══════════════════════════════════════════════════
    // CREATE
    // ══════════════════════════════════════════════════

    public function store(Guru $guru, array $data): GuruCuti
    {
        return DB::transaction(function () use ($guru, $data) {
            // Hitung jumlah hari otomatis
            $data['jumlah_hari'] = (int) \Carbon\Carbon::parse($data['tanggal_mulai'])
                ->diffInDays(\Carbon\Carbon::parse($data['tanggal_selesai'])) + 1;

            $data['guru_id'] = $guru->id;
            $data['status'] = 'Disetujui';
            $data['created_by'] = auth()->id();

            $cuti = GuruCuti::create($data);

            // Sync status guru → Cuti (jika mulai hari ini atau sudah lewat)
            if ($data['tanggal_mulai'] <= now()->toDateString()) {
                $guru->update(['status_keaktifan' => 'Cuti']);
            }

            $this->auditLog($guru, 'Mulai Cuti', $cuti->id);

            return $cuti->fresh();
        });
    }

    // ══════════════════════════════════════════════════
    // UPDATE
    // ══════════════════════════════════════════════════

    public function update(GuruCuti $cuti, array $data): GuruCuti
    {
        return DB::transaction(function () use ($cuti, $data) {
            $data['jumlah_hari'] = (int) \Carbon\Carbon::parse($data['tanggal_mulai'])
                ->diffInDays(\Carbon\Carbon::parse($data['tanggal_selesai'])) + 1;
            $data['updated_by'] = auth()->id();

            $cuti->update($data);

            $this->auditLog($cuti->guru, 'Edit Cuti', $cuti->id);

            return $cuti->fresh();
        });
    }

    // ══════════════════════════════════════════════════
    // SELESAI CUTI — tombol "Tandai Selesai"
    // Mengaktifkan kembali guru setelah cuti berakhir
    // ══════════════════════════════════════════════════

    public function selesai(GuruCuti $cuti): GuruCuti
    {
        return DB::transaction(function () use ($cuti) {
            $cuti->update([
                'status' => 'Selesai',
                'updated_by' => auth()->id(),
            ]);

            // Kembalikan status guru ke Aktif
            // (hanya jika tidak ada cuti aktif lain)
            $guru = $cuti->guru;
            $masihAdaCutiLain = $guru->cutis()
                ->where('id', '!=', $cuti->id)
                ->aktif()
                ->exists();

            if (!$masihAdaCutiLain) {
                $guru->update(['status_keaktifan' => 'Aktif']);
            }

            $this->auditLog($guru, 'Selesai Cuti', $cuti->id);

            return $cuti->fresh();
        });
    }

    // ══════════════════════════════════════════════════
    // DELETE (soft)
    // ══════════════════════════════════════════════════

    public function destroy(GuruCuti $cuti): void
    {
        DB::transaction(function () use ($cuti) {
            $guru = $cuti->guru;

            $cuti->delete();

            // Jika yang dihapus adalah cuti aktif — kembalikan status guru
            if ($cuti->status === 'Disetujui') {
                $masihAda = $guru->cutis()->aktif()->exists();
                if (!$masihAda) {
                    $guru->update(['status_keaktifan' => 'Aktif']);
                }
            }

            $this->auditLog($guru, 'Hapus Cuti', $cuti->id);
        });
    }

    // ══════════════════════════════════════════════════
    // STATE MACHINE INTEGRATION
    // Dipanggil dari MutasiGuruService saat jenis = 'Kembali Bertugas'
    // agar cuti aktif ditandai Selesai secara otomatis
    // ══════════════════════════════════════════════════

    public function tutupCutiAktif(Guru $guru): void
    {
        $guru->cutis()
            ->aktif()
            ->get()
            ->each(function (GuruCuti $c) {
                $c->update([
                    'status' => 'Selesai',
                    'tanggal_selesai' => now()->toDateString(),
                    'updated_by' => auth()->id(),
                    'keterangan' => ($c->keterangan ? $c->keterangan . ' | ' : '') . 'Ditutup otomatis saat Kembali Bertugas.',
                ]);
            });
    }

    // ──────────────────────────────────────────────────
    private function auditLog(Guru $guru, string $aksi, int $cutiId): void
    {
        try {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'cuti_guru',
                'module' => 'guru',
                'subject_id' => $guru->id,
                'keterangan' => "{$aksi} untuk {$guru->nama_lengkap} (cuti_id: {$cutiId}) | IP: " . request()->ip(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
            ]);
        } catch (\Throwable) {
            // Log gagal tidak membatalkan transaksi
        }
    }
}