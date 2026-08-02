<?php

namespace App\Console\Commands;

use App\Models\GuruDokumen;
use App\Models\ActivityLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class CheckDokumenExpired extends Command
{
    protected $signature = 'dokumen:check-expired';
    protected $description = 'Tandai dokumen kadaluarsa dan kirim reminder 30 & 7 hari sebelumnya';

    public function handle(): void
    {
        $this->updateStatusKadaluarsa();
        $this->kirimReminderHariIni(30);
        $this->kirimReminderHariIni(7);

        $this->info('✓ Cek dokumen expired selesai — ' . now()->toDateTimeString());
    }

    // ── 1. Update status → 'kadaluarsa' jika tanggal sudah lewat ──
    private function updateStatusKadaluarsa(): void
    {
        $jumlah = GuruDokumen::query()
            ->whereNotNull('tanggal_kadaluarsa')
            ->where('tanggal_kadaluarsa', '<', now()->toDateString())
            ->whereNotIn('status', [
                GuruDokumen::STATUS_KADALUARSA,
                GuruDokumen::STATUS_DITOLAK,
            ])
            ->whereNull('deleted_at')
            ->update(['status' => GuruDokumen::STATUS_KADALUARSA]);

        if ($jumlah > 0) {
            $this->line("  → {$jumlah} dokumen ditandai kadaluarsa");
            Log::info("[DokumenExpired] {$jumlah} dokumen diupdate ke status kadaluarsa");
        }
    }

    // ── 2. Kirim email reminder N hari sebelum expired ──
    private function kirimReminderHariIni(int $hariSebelum): void
    {
        $targetDate = now()->addDays($hariSebelum)->toDateString();

        $dokumens = GuruDokumen::query()
            ->with(['guru.user'])          // ambil relasi guru → user (untuk email)
            ->whereNotNull('tanggal_kadaluarsa')
            ->whereDate('tanggal_kadaluarsa', $targetDate)
            ->whereNotIn('status', [
                GuruDokumen::STATUS_KADALUARSA,
                GuruDokumen::STATUS_DITOLAK,
            ])
            ->whereNull('deleted_at')
            ->get();

        if ($dokumens->isEmpty()) {
            $this->line("  → Tidak ada dokumen yang expired dalam {$hariSebelum} hari");
            return;
        }

        $this->line("  → {$dokumens->count()} dokumen akan expired dalam {$hariSebelum} hari — kirim reminder...");

        foreach ($dokumens as $dok) {
            $guru = $dok->guru;
            $email = $guru?->email ?? $guru?->user?->email;

            if (!$email) {
                $this->warn("    ✗ Guru ID {$dok->guru_id} tidak punya email — skip");
                continue;
            }

            try {
                Mail::send(
                    'emails.dokumen-reminder',  // view blade (dibuat di langkah 2)
                    [
                        'namaGuru' => $guru->nama,
                        'namaDokumen' => $dok->nama_dokumen,
                        'tanggalKadaluarsa' => $dok->tanggal_kadaluarsa->format('d F Y'),
                        'hariSebelum' => $hariSebelum,
                    ],
                    function ($message) use ($email, $dok, $hariSebelum) {
                        $message
                            ->to($email)
                            ->subject("[SIAKAD] Dokumen \"{$dok->nama_dokumen}\" akan kadaluarsa dalam {$hariSebelum} hari");
                    }
                );

                $this->line("    ✓ Reminder terkirim ke {$email} ({$dok->nama_dokumen})");

                // Catat di activity log
                ActivityLog::create([
                    'user_id' => null,
                    'action' => 'reminder_sent',
                    'module' => 'guru_dokumen',
                    'subject_id' => $dok->id,
                    'keterangan' => "Reminder {$hariSebelum}h sebelum expired dikirim ke {$email}",
                    'ip_address' => '127.0.0.1',
                    'user_agent' => 'Artisan Scheduler',
                ]);

            } catch (\Exception $e) {
                $this->error("    ✗ Gagal kirim ke {$email}: " . $e->getMessage());
                Log::error("[DokumenReminder] Gagal kirim ke {$email}: " . $e->getMessage());
            }
        }
    }
}