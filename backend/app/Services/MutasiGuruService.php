<?php

namespace App\Services;

use App\Models\Guru;
use App\Models\GuruMutasi;
use App\Models\ActivityLog;
use App\Models\Kelas;
use App\Models\UserBendahara;
use App\Models\UserWaliKelas;
use Illuminate\Support\Facades\DB;

class MutasiGuruService
{
    // ═══════════════════════════════════════════════════════════
    // STATE MACHINE — Status flow yang diizinkan
    // Key   = status_keaktifan guru saat ini
    // Value = jenis_mutasi yang boleh dibuat
    // ═══════════════════════════════════════════════════════════

    public const STATE_TRANSITIONS = [
        'Aktif' => ['Internal', 'Penugasan Sementara', 'Keluar'],
        'Keluar' => ['Masuk'],
        'Mutasi' => ['Masuk'],   // nilai lama di ENUM = 'Mutasi'
        'Penugasan Sementara' => ['Kembali Bertugas'],
        'Cuti' => ['Kembali Bertugas'],
        'Nonaktif' => ['Masuk'],
        'Pensiun' => [],           // tidak ada transisi
    ];

    // Status guru sesudah masing-masing jenis mutasi
    public const STATUS_SETELAH = [
        'Masuk' => 'Aktif',
        'Keluar' => 'Keluar',
        'Internal' => 'Aktif',
        'Penugasan Sementara' => 'Penugasan Sementara',
        'Kembali Bertugas' => 'Aktif',
    ];

    // ═══════════════════════════════════════════════════════════
    // A. ANALYZE — Validasi + Impact Analysis (read-only)
    //    Dipanggil dari frontend sebelum user klik Simpan.
    //    Return: { errors[], warnings[], dampak[], sistemAkan[] }
    // ═══════════════════════════════════════════════════════════

    /**
     * Kembalikan daftar jenis mutasi yang boleh dilakukan
     * berdasarkan status guru saat ini.
     * Juga sertakan reason untuk yang tidak boleh.
     */
    public function allowedTransitions(Guru $guru): array
    {
        $status = $guru->status_keaktifan ?? 'Aktif';
        $allowed = self::STATE_TRANSITIONS[$status] ?? [];

        $allJenis = ['Masuk', 'Keluar', 'Internal', 'Penugasan Sementara', 'Kembali Bertugas'];

        $result = [];
        foreach ($allJenis as $jenis) {
            $isAllowed = in_array($jenis, $allowed);
            $result[] = [
                'jenis' => $jenis,
                'allowed' => $isAllowed,
                'reason' => $isAllowed ? null : $this->blockedReason($jenis, $status),
                'status_setelah' => self::STATUS_SETELAH[$jenis] ?? null,
            ];
        }

        return $result;
    }

    private function blockedReason(string $jenis, string $status): string
    {
        $map = [
            'Masuk' => [
                'Aktif' => 'Guru sudah Aktif. Mutasi Masuk tidak diperlukan.',
                'Penugasan Sementara' => 'Guru sedang Penugasan Sementara. Lakukan Kembali Bertugas terlebih dahulu.',
                'Cuti' => 'Guru sedang Cuti. Lakukan Kembali Bertugas terlebih dahulu.',
            ],
            'Keluar' => [
                'Keluar' => 'Guru sudah Mutasi Keluar.',
                'Mutasi' => 'Guru sudah Mutasi Keluar.',
                'Penugasan Sementara' => 'Guru sedang Penugasan Sementara. Lakukan Kembali Bertugas dulu.',
                'Cuti' => 'Guru sedang Cuti. Tidak bisa Mutasi Keluar.',
                'Nonaktif' => 'Guru Nonaktif. Tidak bisa Mutasi Keluar.',
            ],
            'Internal' => [
                'Keluar' => 'Guru sudah Mutasi Keluar. Lakukan Mutasi Masuk terlebih dahulu.',
                'Mutasi' => 'Guru sudah Mutasi Keluar. Lakukan Mutasi Masuk terlebih dahulu.',
                'Penugasan Sementara' => 'Guru sedang Penugasan Sementara.',
                'Cuti' => 'Guru sedang Cuti.',
                'Nonaktif' => 'Guru Nonaktif.',
            ],
            'Penugasan Sementara' => [
                'Keluar' => 'Guru sudah Mutasi Keluar.',
                'Mutasi' => 'Guru sudah Mutasi Keluar.',
                'Penugasan Sementara' => 'Guru sudah dalam Penugasan Sementara.',
                'Cuti' => 'Guru sedang Cuti.',
                'Nonaktif' => 'Guru Nonaktif.',
            ],
            'Kembali Bertugas' => [
                'Aktif' => 'Guru sudah Aktif. Tidak perlu Kembali Bertugas.',
                'Keluar' => 'Guru Mutasi Keluar. Gunakan Mutasi Masuk, bukan Kembali Bertugas.',
                'Mutasi' => 'Guru Mutasi Keluar. Gunakan Mutasi Masuk, bukan Kembali Bertugas.',
                'Nonaktif' => 'Guru Nonaktif. Gunakan Mutasi Masuk.',
            ],
        ];

        return $map[$jenis][$status]
            ?? "Tidak tersedia saat status guru adalah {$status}.";
    }

    public function analyze(Guru $guru, array $input): array
    {
        $jenis = $input['jenis_mutasi'] ?? '';
        $tanggalMutasi = $input['tanggal_mutasi'] ?? null;
        $noSk = $input['no_sk'] ?? null;
        $mutasiIdEdit = $input['mutasi_id'] ?? null; // saat edit

        $errors = [];
        $warnings = [];
        $dampak = [];
        $sistemAkan = [];

        // ── A0. State Machine Validation ─────────────────────
        $statusGuru = $guru->status_keaktifan ?? 'Aktif';
        $allowedList = self::STATE_TRANSITIONS[$statusGuru] ?? [];
        if ($jenis && !in_array($jenis, $allowedList)) {
            $reason = $this->blockedReason($jenis, $statusGuru);
            $errors[] = "Transisi tidak valid: {$reason}";
            // Langsung return — tidak perlu cek lebih lanjut
            return compact('errors', 'warnings', 'dampak', 'sistemAkan');
        }

        // ── A1. Validasi Umum ────────────────────────────────
        if ($tanggalMutasi && $guru->tanggal_bergabung) {
            if ($tanggalMutasi < $guru->tanggal_bergabung->toDateString()) {
                $errors[] = 'Tanggal mutasi tidak boleh lebih awal dari tanggal bergabung guru (' . $guru->tanggal_bergabung->format('d/m/Y') . ').';
            }
        }

        if ($tanggalMutasi && $tanggalMutasi > now()->toDateString()) {
            $warnings[] = 'Tanggal mutasi melebihi hari ini — akan dicatat sebagai mutasi terjadwal.';
        }

        // Cek duplikasi No. SK pada guru yang sama
        if ($noSk) {
            $dupSk = $guru->mutasi()
                ->where('no_sk', $noSk)
                ->when($mutasiIdEdit, fn($q) => $q->where('id', '!=', $mutasiIdEdit))
                ->exists();
            if ($dupSk) {
                $errors[] = "Nomor SK '{$noSk}' sudah digunakan pada riwayat mutasi guru ini.";
            }
        }

        // Cek duplikasi jenis+tanggal+SK
        if ($jenis && $tanggalMutasi) {
            $dupRec = $guru->mutasi()
                ->where('jenis_mutasi', $jenis)
                ->where('tanggal_mutasi', $tanggalMutasi)
                ->when($noSk, fn($q) => $q->where('no_sk', $noSk))
                ->when($mutasiIdEdit, fn($q) => $q->where('id', '!=', $mutasiIdEdit))
                ->exists();
            if ($dupRec) {
                $errors[] = 'Riwayat mutasi dengan jenis, tanggal, dan nomor SK yang sama sudah pernah dibuat.';
            }
        }

        // Cek kronologi
        if ($tanggalMutasi) {
            $mutasiSetelah = $guru->mutasi()
                ->where('tanggal_mutasi', '>', $tanggalMutasi)
                ->when($mutasiIdEdit, fn($q) => $q->where('id', '!=', $mutasiIdEdit))
                ->orderBy('tanggal_mutasi')
                ->first();

            $mutasiSebelum = $guru->mutasi()
                ->where('tanggal_mutasi', '<', $tanggalMutasi)
                ->when($mutasiIdEdit, fn($q) => $q->where('id', '!=', $mutasiIdEdit))
                ->orderByDesc('tanggal_mutasi')
                ->first();

            // Keluar tidak boleh sebelum Masuk
            if ($jenis === 'Keluar' && $mutasiSetelah) {
                $errors[] = 'Riwayat mutasi tidak kronologis: sudah ada mutasi pada ' . \Carbon\Carbon::parse($mutasiSetelah->tanggal_mutasi)->format('d/m/Y') . ' setelah tanggal ini.';
            }

            if ($jenis === 'Masuk' && $mutasiSebelum && $mutasiSebelum->jenis_mutasi === 'Masuk') {
                $warnings[] = 'Sudah ada Mutasi Masuk sebelumnya pada ' . \Carbon\Carbon::parse($mutasiSebelum->tanggal_mutasi)->format('d/m/Y') . '.';
            }
        }

        // ── A2. Validasi Per Jenis ───────────────────────────
        match ($jenis) {
            'Masuk' => $this->validateMasuk($guru, $input, $errors, $warnings),
            'Keluar' => $this->validateKeluar($guru, $input, $errors, $warnings),
            'Internal' => $this->validateInternal($guru, $input, $errors, $warnings),
            'Penugasan Sementara' => $this->validatePenugasanSementara($guru, $input, $errors, $warnings),
            'Kembali Bertugas' => $this->validateKembali($guru, $input, $errors, $warnings),
            default => $errors[] = 'Jenis mutasi tidak valid.',
        };

        // ── A3. Impact Analysis (relasi data) ────────────────
        $this->buildImpact($guru, $jenis, $dampak, $sistemAkan);

        return compact('errors', 'warnings', 'dampak', 'sistemAkan');
    }

    // ── Validasi per jenis ───────────────────────────────────

    private function validateMasuk(Guru $guru, array $input, array &$errors, array &$warnings): void
    {
        if ($guru->status_keaktifan === 'Aktif') {
            $errors[] = 'Guru sudah berstatus Aktif. Mutasi Masuk hanya untuk guru yang belum atau tidak sedang aktif.';
        }

        $sudahMasukAktif = $guru->mutasi()
            ->where('jenis_mutasi', 'Masuk')
            ->where('tanggal_mutasi', '>=', $input['tanggal_mutasi'] ?? now())
            ->exists();
        if ($sudahMasukAktif) {
            $warnings[] = 'Sudah ada Mutasi Masuk yang lebih baru. Pastikan urutan histori benar.';
        }
    }

    private function validateKeluar(Guru $guru, array $input, array &$errors, array &$warnings): void
    {
        if ($guru->status_keaktifan !== 'Aktif') {
            $errors[] = 'Guru tidak berstatus Aktif. Mutasi Keluar hanya bisa dilakukan pada guru yang sedang aktif.';
        }

        // ── Validasi jenis_keluar ──────────────────────────────
        $jenisKeluar = $input['jenis_keluar'] ?? null;
        $validJenisKeluar = [
            'Pindah Sekolah',
            'Mengundurkan Diri',
            'Pensiun',
            'Kontrak Berakhir',
            'Meninggal Dunia',
            'PHK',
            'Lainnya',
        ];
        if (empty($jenisKeluar)) {
            $errors[] = 'Jenis Keluar wajib dipilih (Pindah Sekolah, Pensiun, dll).';
        } elseif (!in_array($jenisKeluar, $validJenisKeluar)) {
            $errors[] = "Jenis Keluar '{$jenisKeluar}' tidak valid.";
        } elseif ($jenisKeluar === 'Pindah Sekolah' && empty($input['sekolah_tujuan'])) {
            $errors[] = 'Sekolah Tujuan wajib diisi jika Jenis Keluar adalah Pindah Sekolah.';
        }

        $sudahKeluar = $guru->mutasi()
            ->where('jenis_mutasi', 'Keluar')
            ->whereNull('tanggal_berakhir')
            ->exists();
        if ($sudahKeluar) {
            $errors[] = 'Guru sudah memiliki Mutasi Keluar aktif yang belum diselesaikan.';
        }

        // Wali kelas & mapel → warning (bukan error, operator boleh lanjut)
        $kelasWali = Kelas::where('wali_kelas_id', $guru->id)->where('is_active', 1)->pluck('nama_kelas')->toArray();
        if (count($kelasWali)) {
            $warnings[] = 'Guru masih menjadi wali kelas: ' . implode(', ', $kelasWali) . '. Sistem akan melepaskan penugasan ini.';
        }

        $mapelAktif = $guru->plotGuruMapels()->where('is_active', 1)->with('mapel:id,nama_mapel')->get();
        if ($mapelAktif->count()) {
            $namaMapel = $mapelAktif->pluck('mapel.nama_mapel')->filter()->join(', ');
            $warnings[] = 'Guru mengampu ' . $mapelAktif->count() . ' mata pelajaran aktif' . ($namaMapel ? ": {$namaMapel}" : '') . '. Penugasan akan dinonaktifkan.';
        }

        $jadwalAktif = $guru->jadwals()->count();
        if ($jadwalAktif) {
            $warnings[] = "Guru memiliki {$jadwalAktif} jadwal mengajar. Jadwal baru tidak dapat dibuat, jadwal lama tetap tersimpan.";
        }

        $bendahara = UserBendahara::where('guru_id', $guru->id)->where('is_active', 1)->pluck('jenis_bendahara')->toArray();
        if (count($bendahara)) {
            $warnings[] = 'Guru menjabat sebagai Bendahara: ' . implode(', ', $bendahara) . '. Harap atur penggantinya setelah mutasi.';
        }
    }

    private function validateInternal(Guru $guru, array $input, array &$errors, array &$warnings): void
    {
        $jabatanBaru = trim($input['jabatan_sesudah'] ?? '');
        $jabatanLama = $guru->jabatanAktif?->jabatan ?? '';

        if ($jabatanBaru && $jabatanLama && strtolower($jabatanBaru) === strtolower($jabatanLama)) {
            $errors[] = "Jabatan baru ({$jabatanBaru}) sama dengan jabatan lama. Mutasi Internal harus menghasilkan perubahan.";
        }

        if (empty($jabatanBaru)) {
            $warnings[] = 'Jabatan Sesudah tidak diisi. Jabatan aktif guru tidak akan berubah.';
        }
    }

    private function validatePenugasanSementara(Guru $guru, array $input, array &$errors, array &$warnings): void
    {
        $mulai = $input['tanggal_mutasi'] ?? null;
        $selesai = $input['tanggal_berakhir'] ?? null;

        if ($mulai && $selesai && $selesai <= $mulai) {
            $errors[] = 'Tanggal selesai penugasan harus lebih besar dari tanggal mulai.';
        }

        if ($mulai && $selesai) {
            $tabrakan = $guru->mutasi()
                ->where('jenis_mutasi', 'Penugasan Sementara')
                ->whereNotNull('tanggal_berakhir')
                ->where(function ($q) use ($mulai, $selesai) {
                    $q->whereBetween('tanggal_mutasi', [$mulai, $selesai])
                        ->orWhereBetween('tanggal_berakhir', [$mulai, $selesai])
                        ->orWhere(function ($q2) use ($mulai, $selesai) {
                            $q2->where('tanggal_mutasi', '<=', $mulai)
                                ->where('tanggal_berakhir', '>=', $selesai);
                        });
                })
                ->when($input['mutasi_id'] ?? null, fn($q) => $q->where('id', '!=', $input['mutasi_id']))
                ->first();

            if ($tabrakan) {
                $errors[] = 'Penugasan sementara bertabrakan dengan periode lain: '
                    . \Carbon\Carbon::parse($tabrakan->tanggal_mutasi)->format('d/m/Y')
                    . ' s.d. '
                    . \Carbon\Carbon::parse($tabrakan->tanggal_berakhir)->format('d/m/Y')
                    . '.';
            }
        }
    }

    private function validateKembali(Guru $guru, array $input, array &$errors, array &$warnings): void
    {
        $statusAktif = in_array($guru->status_keaktifan, ['Aktif']);
        if ($statusAktif) {
            $errors[] = 'Guru sudah berstatus Aktif. Kembali Bertugas hanya untuk guru yang sedang nonaktif atau dalam penugasan sementara.';
        }

        $adaPenugasan = $guru->mutasi()
            ->where('jenis_mutasi', 'Penugasan Sementara')
            ->whereNull('tanggal_berakhir')
            ->exists();

        $adaKeluar = $guru->mutasi()
            ->where('jenis_mutasi', 'Keluar')
            ->exists();

        if (!$adaPenugasan && !$adaKeluar && $guru->status_keaktifan === 'Aktif') {
            $errors[] = 'Tidak ditemukan riwayat mutasi keluar atau penugasan sementara yang perlu diselesaikan.';
        }
    }

    // ── Build impact items ───────────────────────────────────

    private function buildImpact(Guru $guru, string $jenis, array &$dampak, array &$sistemAkan): void
    {
        $hasUser = (bool) $guru->user_id;
        $userAktif = $guru->user?->is_active ?? false;
        $kelasWali = Kelas::where('wali_kelas_id', $guru->id)->where('is_active', 1)->pluck('nama_kelas')->toArray();
        $mapelCount = $guru->plotGuruMapels()->where('is_active', 1)->count();
        $jadwalCount = $guru->jadwals()->count();
        $bendahara = UserBendahara::where('guru_id', $guru->id)->where('is_active', 1)->pluck('jenis_bendahara')->toArray();
        $jabatanAktif = $guru->jabatanAktif?->jabatan;

        switch ($jenis) {
            case 'Masuk':
                $dampak = array_filter([
                    ['icon' => 'info', 'color' => 'neutral', 'label' => 'Status saat ini: ' . ($guru->status_keaktifan ?? '-')],
                    $hasUser && !$userAktif ? ['icon' => 'lock', 'color' => 'warning', 'label' => 'Akun login saat ini nonaktif'] : null,
                ]);
                $sistemAkan = array_filter([
                    ['icon' => 'check_circle', 'color' => 'success', 'label' => 'Status guru → Aktif'],
                    $hasUser ? ['icon' => 'login', 'color' => 'success', 'label' => 'Akun login diaktifkan'] : null,
                    ['icon' => 'bar_chart', 'color' => 'success', 'label' => 'Masuk statistik guru aktif'],
                    ['icon' => 'history', 'color' => 'neutral', 'label' => 'Riwayat mutasi dicatat'],
                    ['icon' => 'manage_search', 'color' => 'neutral', 'label' => 'Audit log disimpan'],
                ]);
                break;

            case 'Keluar':
                $dampak = array_filter([
                    ['icon' => 'person', 'color' => 'neutral', 'label' => 'Status saat ini: ' . ($guru->status_keaktifan ?? '-')],
                    $hasUser && $userAktif ? ['icon' => 'login', 'color' => 'warning', 'label' => 'Akun login: Aktif'] : null,
                    count($kelasWali) ? ['icon' => 'class', 'color' => 'warning', 'label' => 'Wali kelas: ' . implode(', ', $kelasWali)] : null,
                    $mapelCount ? ['icon' => 'menu_book', 'color' => 'warning', 'label' => "Pengampu {$mapelCount} mata pelajaran aktif"] : null,
                    $jadwalCount ? ['icon' => 'schedule', 'color' => 'warning', 'label' => "{$jadwalCount} jadwal mengajar"] : null,
                    count($bendahara) ? ['icon' => 'account_balance', 'color' => 'warning', 'label' => 'Bendahara: ' . implode(', ', $bendahara)] : null,
                    $jabatanAktif ? ['icon' => 'badge', 'color' => 'neutral', 'label' => 'Jabatan aktif: ' . $jabatanAktif] : null,
                ]);
                $sistemAkan = array_filter([
                    ['icon' => 'cancel', 'color' => 'error', 'label' => 'Status guru → Keluar'],
                    $hasUser ? ['icon' => 'lock', 'color' => 'error', 'label' => 'Akun login dinonaktifkan'] : null,
                    count($kelasWali) ? ['icon' => 'person_off', 'color' => 'error', 'label' => 'Wali kelas dilepaskan: ' . implode(', ', $kelasWali)] : null,
                    $mapelCount ? ['icon' => 'remove_circle', 'color' => 'error', 'label' => "{$mapelCount} penugasan mapel dinonaktifkan"] : null,
                    ['icon' => 'history', 'color' => 'neutral', 'label' => 'Riwayat mengajar & nilai lama tetap utuh'],
                    ['icon' => 'history', 'color' => 'neutral', 'label' => 'Riwayat mutasi dicatat'],
                    ['icon' => 'manage_search', 'color' => 'neutral', 'label' => 'Audit log disimpan'],
                ]);
                break;

            case 'Internal':
                $dampak = array_filter([
                    ['icon' => 'badge', 'color' => 'neutral', 'label' => 'Jabatan aktif: ' . ($jabatanAktif ?? 'Belum ada')],
                    count($kelasWali) ? ['icon' => 'class', 'color' => 'neutral', 'label' => 'Wali kelas: ' . implode(', ', $kelasWali)] : null,
                    $mapelCount ? ['icon' => 'menu_book', 'color' => 'neutral', 'label' => "{$mapelCount} penugasan mapel aktif"] : null,
                ]);
                $sistemAkan = array_filter([
                    ['icon' => 'swap_horiz', 'color' => 'warning', 'label' => 'Status tetap Aktif'],
                    $jabatanAktif ? ['icon' => 'badge', 'color' => 'warning', 'label' => "Jabatan aktif ({$jabatanAktif}) diakhiri, jabatan baru dibuat"] : null,
                    ['icon' => 'history', 'color' => 'neutral', 'label' => 'Riwayat mutasi dicatat'],
                    ['icon' => 'manage_search', 'color' => 'neutral', 'label' => 'Audit log disimpan'],
                ]);
                break;

            case 'Penugasan Sementara':
                $dampak = array_filter([
                    ['icon' => 'person', 'color' => 'neutral', 'label' => 'Status saat ini: ' . ($guru->status_keaktifan ?? '-')],
                    $mapelCount ? ['icon' => 'menu_book', 'color' => 'neutral', 'label' => "{$mapelCount} penugasan mapel tetap aktif"] : null,
                    count($kelasWali) ? ['icon' => 'class', 'color' => 'neutral', 'label' => 'Wali kelas tetap: ' . implode(', ', $kelasWali)] : null,
                ]);
                $sistemAkan = [
                    ['icon' => 'schedule', 'color' => 'warning', 'label' => 'Status tetap Aktif selama penugasan'],
                    ['icon' => 'work', 'color' => 'neutral', 'label' => 'Penugasan utama tidak terganggu'],
                    ['icon' => 'notifications', 'color' => 'neutral', 'label' => 'Notifikasi menjelang batas penugasan'],
                    ['icon' => 'history', 'color' => 'neutral', 'label' => 'Riwayat mutasi dicatat'],
                    ['icon' => 'manage_search', 'color' => 'neutral', 'label' => 'Audit log disimpan'],
                ];
                break;

            case 'Kembali Bertugas':
                $dampak = array_filter([
                    ['icon' => 'person', 'color' => 'neutral', 'label' => 'Status saat ini: ' . ($guru->status_keaktifan ?? '-')],
                    $hasUser && !$userAktif ? ['icon' => 'lock', 'color' => 'warning', 'label' => 'Akun login saat ini nonaktif'] : null,
                ]);
                $sistemAkan = array_filter([
                    ['icon' => 'check_circle', 'color' => 'success', 'label' => 'Status guru → Aktif'],
                    $hasUser ? ['icon' => 'login', 'color' => 'success', 'label' => 'Akun login diaktifkan kembali'] : null,
                    ['icon' => 'school', 'color' => 'success', 'label' => 'Dapat menerima penugasan baru'],
                    ['icon' => 'history', 'color' => 'neutral', 'label' => 'Histori sebelumnya tetap utuh'],
                    ['icon' => 'manage_search', 'color' => 'neutral', 'label' => 'Audit log disimpan'],
                ]);
                break;
        }

        $dampak = array_values(array_filter($dampak));
        $sistemAkan = array_values(array_filter($sistemAkan));
    }

    // ═══════════════════════════════════════════════════════════
    // B. EXECUTE — Simpan + Sinkronisasi (dalam DB transaction)
    // ═══════════════════════════════════════════════════════════

    public function execute(Guru $guru, array $data, ?int $mutasiId = null): GuruMutasi
    {
        return DB::transaction(function () use ($guru, $data, $mutasiId) {

            // Inject status_sebelum & status_setelah otomatis
            $data['status_sebelum'] = $guru->status_keaktifan ?? 'Aktif';
            $data['status_setelah'] = self::STATUS_SETELAH[$data['jenis_mutasi']] ?? null;

            // 1. Simpan / update record mutasi
            if ($mutasiId) {
                $mutasi = $guru->mutasi()->findOrFail($mutasiId);
                // is_locked tidak boleh diubah lewat execute
                $mutasi->update(array_diff_key($data, ['is_locked' => true]));
            } else {
                $data['is_locked'] = false; // baru dibuat, belum locked
                $mutasi = $guru->mutasi()->create($data);
            }

            // 2. Sync berdasarkan jenis
            match ($data['jenis_mutasi']) {
                'Masuk' => $this->syncMasuk($guru),
                'Keluar' => $this->syncKeluar($guru),
                'Internal' => $this->syncInternal($guru, $data),
                'Penugasan Sementara' => $this->syncPenugasanSementara($guru),
                'Kembali Bertugas' => $this->syncKembali($guru),
                default => null,
            };

            // 3. Lock mutasi — sudah memengaruhi modul lain
            $mutasi->update(['is_locked' => true]);

            // 4. Audit log
            $this->auditLog(
                $guru,
                $data['jenis_mutasi'],
                $mutasi->id,
                $data['status_sebelum'] ?? '',
                $data['status_setelah'] ?? '',
            );

            return $mutasi->fresh();
        });
    }

    // ── Sync Handlers ────────────────────────────────────────

    private function syncMasuk(Guru $guru): void
    {
        $guru->update(['status_keaktifan' => 'Aktif', 'status_aktif' => true]);
        if ($guru->user_id) {
            $guru->user()->update(['is_active' => true]);
        }
    }

    private function syncKeluar(Guru $guru): void
    {
        $guru->update(['status_keaktifan' => 'Keluar', 'status_aktif' => false]);

        if ($guru->user_id) {
            $guru->user()->update(['is_active' => false]);
        }

        // Copot dari wali kelas aktif
        Kelas::where('wali_kelas_id', $guru->id)
            ->where('is_active', 1)
            ->update(['wali_kelas_id' => null]);

        // Nonaktifkan penugasan mapel
        $guru->plotGuruMapels()->where('is_active', 1)->update(['is_active' => false]);

        // Histori mengajar, nilai, absensi TIDAK dihapus — dipreservasi
    }

    private function syncInternal(Guru $guru, array $data): void
    {
        $guru->update(['status_keaktifan' => 'Aktif']);

        if (!empty($data['jabatan_sesudah'])) {
            $jabatanLama = $guru->jabatanAktif;
            if ($jabatanLama) {
                $jabatanLama->update([
                    'status_jabatan' => 'Berakhir',
                    'is_current' => false,
                    'tanggal_selesai' => $data['tanggal_mutasi'] ?? now()->toDateString(),
                    'alasan_berakhir' => 'Mutasi',
                ]);
            }
            $guru->jabatans()->create([
                'jabatan' => $data['jabatan_sesudah'],
                'jenis_jabatan' => $jabatanLama?->jenis_jabatan ?? 'Fungsional',
                'unit_kerja' => $jabatanLama?->unit_kerja ?? '',
                'instansi_pengangkat' => $data['instansi_penerbit_sk'] ?? null,
                'status_kepegawaian' => $data['status_kepegawaian'] ?? $jabatanLama?->status_kepegawaian,
                'no_sk' => $data['no_sk'] ?? null,
                'tanggal_sk' => $data['tanggal_sk'] ?? null,
                'tmt_jabatan' => $data['tmt_mutasi'] ?? $data['tanggal_mutasi'],
                'status_jabatan' => 'Aktif',
                'is_current' => true,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);
        }
    }

    private function syncPenugasanSementara(Guru $guru): void
    {
        // Status berubah ke 'Penugasan Sementara' agar state machine bisa baca
        $guru->update(['status_keaktifan' => 'Penugasan Sementara']);
    }

    private function syncKembali(Guru $guru): void
    {
        // Tutup cuti aktif jika ada (modul cuti terpisah)
        (new \App\Services\GuruCutiService())->tutupCutiAktif($guru);

        $guru->update(['status_keaktifan' => 'Aktif', 'status_aktif' => true]);
        if ($guru->user_id) {
            $guru->user()->update(['is_active' => true]);
        }
    }
    private function auditLog(Guru $guru, string $jenis, int $mutasiId, string $statusSebelum = '', string $statusSetelah = ''): void
    {
        try {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'mutasi_guru',
                'module' => 'guru',
                'subject_id' => $guru->id,
                'keterangan' => implode(' | ', array_filter([
                    "Mutasi {$jenis} untuk {$guru->nama_lengkap}",
                    $statusSebelum ? "Status: {$statusSebelum} → {$statusSetelah}" : null,
                    "mutasi_id: {$mutasiId}",
                    "IP: " . request()->ip(),
                ])),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
            ]);
        } catch (\Throwable) {
            // Log gagal tidak membatalkan mutasi
        }
    }
}