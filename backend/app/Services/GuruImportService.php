<?php

namespace App\Services;

use App\Models\Guru;
use App\Services\Excel\MultiSheetXlsxService;

/**
 * GuruImportService
 *
 * Extracted from GuruImportController@import (was ~600 lines of inline logic).
 * Responsible for: parsing all 11 sheets, upsert guru + relasi,
 * dan mengembalikan $results array.
 */
class GuruImportService
{
    public function __construct(private MultiSheetXlsxService $xlsx)
    {
    }

    // ─────────────────────────────────────────────────────────────────
    // PUBLIC
    // ─────────────────────────────────────────────────────────────────

    /**
     * Parse dan proses file XLSX multi-sheet guru.
     *
     * @param  string  $filePath  Real path ke file upload.
     * @return array{berhasil:int,diperbarui:int,gagal:int,relasi:array,errors:array}
     */
    public function import(string $filePath): array
    {
        $allSheets = $this->xlsx->parse($filePath);
        if (empty($allSheets)) {
            return $this->emptyResult(['File kosong atau tidak bisa dibaca.']);
        }

        $results = $this->emptyResult();
        $getSheet = $this->sheetFinder($allSheets);

        // Closure helper: cari guru by nuptk, catat error jika tidak ada
        $findGuru = function (string $nuptk, string $sheet, int $baris) use (&$results): ?Guru {
            $guru = Guru::where('nuptk', $nuptk)->first();
            if (!$guru) {
                $results['errors'][] = "{$sheet} Baris {$baris}: NUPTK {$nuptk} tidak ditemukan di DB.";
            }
            return $guru;
        };

        $countRelasi = function (string $key) use (&$results) {
            $results['relasi'][$key] = ($results['relasi'][$key] ?? 0) + 1;
        };

        $this->processSheetUtama($getSheet, $results);
        $this->processSheetKeluarga($getSheet, $findGuru, $countRelasi, $results);
        $this->processSheetRekening($getSheet, $findGuru, $countRelasi, $results);
        $this->processSheetPendidikan($getSheet, $findGuru, $countRelasi, $results);
        $this->processSheetSertifikasi($getSheet, $findGuru, $countRelasi, $results);
        $this->processSheetDiklat($getSheet, $findGuru, $countRelasi, $results);
        $this->processSheetJabatan($getSheet, $findGuru, $countRelasi, $results);
        $this->processSheetInpassing($getSheet, $findGuru, $countRelasi, $results);
        $this->processSheetMutasi($getSheet, $findGuru, $countRelasi, $results);
        $this->processSheetKompetensi($getSheet, $findGuru, $countRelasi, $results);
        $this->processSheetKontakDarurat($getSheet, $findGuru, $countRelasi, $results);

        return $results;
    }

    /**
     * Proses hanya sheet relasi (Sheet 2–11) dari allSheets yang sudah di-parse.
     * Digunakan oleh importExecute setelah sheet utama diproses inline dengan chunking.
     *
     * @param  array  $allSheets  Output dari MultiSheetXlsxService::parse()
     * @param  array  &$stats     Array stats yang sama dipakai oleh caller (by reference)
     */
    public function importRelasi(array $allSheets, array &$stats): void
    {
        $getSheet = $this->sheetFinder($allSheets);

        $findGuru = function (string $nuptk) use (&$stats): ?Guru {
            $guru = Guru::where('nuptk', $nuptk)->first();
            if (!$guru) {
                $stats['errors'][] = "NUPTK {$nuptk} tidak ditemukan di DB (relasi).";
            }
            return $guru;
        };

        $countRelasi = function (string $key) use (&$stats) {
            $stats['relasi'][$key] = ($stats['relasi'][$key] ?? 0) + 1;
        };

        $this->processSheetKeluarga($getSheet, $findGuru, $countRelasi, $stats);
        $this->processSheetRekening($getSheet, $findGuru, $countRelasi, $stats);
        $this->processSheetPendidikan($getSheet, $findGuru, $countRelasi, $stats);
        $this->processSheetSertifikasi($getSheet, $findGuru, $countRelasi, $stats);
        $this->processSheetDiklat($getSheet, $findGuru, $countRelasi, $stats);
        $this->processSheetJabatan($getSheet, $findGuru, $countRelasi, $stats);
        $this->processSheetInpassing($getSheet, $findGuru, $countRelasi, $stats);
        $this->processSheetMutasi($getSheet, $findGuru, $countRelasi, $stats);
        $this->processSheetKompetensi($getSheet, $findGuru, $countRelasi, $stats);
        $this->processSheetKontakDarurat($getSheet, $findGuru, $countRelasi, $stats);
    }

    /**
     * Bangun summary message dari hasil import.
     */
    public function buildSummaryMessage(array $results): string
    {
        $relasiMsg = collect($results['relasi'])
            ->map(fn($v, $k) => "{$v} {$k}")
            ->join(', ');

        return "Import selesai: {$results['berhasil']} guru ditambahkan, "
            . "{$results['diperbarui']} diperbarui, {$results['gagal']} gagal."
            . ($relasiMsg ? " Relasi: {$relasiMsg}." : '');
    }

    // ─────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────

    private function emptyResult(array $errors = []): array
    {
        return ['berhasil' => 0, 'diperbarui' => 0, 'gagal' => 0, 'relasi' => [], 'errors' => $errors];
    }

    /**
     * Kembalikan closure untuk mencari sheet by nama (case-insensitive) atau index.
     */
    private function sheetFinder(array $sheets): \Closure
    {
        return function (string|int $nameOrIdx) use ($sheets): ?array {
            if (is_int($nameOrIdx)) {
                return $sheets[$nameOrIdx] ?? null;
            }
            foreach ($sheets as $s) {
                if (strtolower($s['name']) === strtolower($nameOrIdx)) {
                    return $s;
                }
            }
            return null;
        };
    }

    /**
     * Kembalikan closure untuk mengambil nilai sel dari row berdasar header map.
     */
    private function cellGetter(array $headerMap): \Closure
    {
        return fn(array $row, string $key): ?string =>
            (($idx = $headerMap[$key] ?? null) !== null && trim($row[$idx] ?? '') !== '')
            ? trim($row[$idx])
            : null;
    }

    /**
     * Cek apakah row kosong (semua kolom blank).
     */
    private function isBlankRow(array $row): bool
    {
        return empty(array_filter($row, fn($v) => trim($v) !== ''));
    }

    // ─────────────────────────────────────────────────────────────────
    // SHEET PROCESSORS
    // ─────────────────────────────────────────────────────────────────

    private function processSheetUtama(\Closure $getSheet, array &$results): void
    {
        $sheet = $getSheet('Data Utama') ?? $getSheet(0);
        if (!$sheet)
            return;

        $rows = $sheet['rows'];
        if (empty($rows))
            return;

        $headerRow = array_map('trim', array_shift($rows));
        $get = $this->cellGetter(array_flip($headerRow));

        foreach ($rows as $rowIdx => $row) {
            $baris = $rowIdx + 2;
            if ($this->isBlankRow($row))
                continue;

            $nuptk = $get($row, 'nuptk*');
            $nama = $get($row, 'nama*');

            if (!$nuptk) {
                $results['gagal']++;
                $results['errors'][] = "Utama Baris {$baris}: NUPTK wajib.";
                continue;
            }
            if (!$nama) {
                $results['gagal']++;
                $results['errors'][] = "Utama Baris {$baris}: Nama wajib (NUPTK: {$nuptk}).";
                continue;
            }

            $payload = array_filter([
                'nuptk' => $nuptk,
                'nip' => $get($row, 'nip'),
                'nip_lama' => $get($row, 'nip_lama'),
                'no_karpeg' => $get($row, 'no_karpeg'),
                'no_karis_karsu' => $get($row, 'no_karis_karsu'),
                'nik' => $get($row, 'nik'),
                'no_kk' => $get($row, 'no_kk'),
                'nama' => $nama,
                'gelar_depan' => $get($row, 'gelar_depan'),
                'gelar_belakang' => $get($row, 'gelar_belakang'),
                'jenis_kelamin' => strtoupper($get($row, 'jenis_kelamin (L/P)*') ?? 'L'),
                'tempat_lahir' => $get($row, 'tempat_lahir*'),
                'tanggal_lahir' => $get($row, 'tanggal_lahir (YYYY-MM-DD)*'),
                'agama' => $get($row, 'agama') ?? 'Islam',
                'golongan_darah' => $get($row, 'golongan_darah'),
                'kewarganegaraan' => $get($row, 'kewarganegaraan') ?? 'WNI',
                'status_hidup' => $get($row, 'status_hidup') ?? 'Aktif',
                'nama_ibu_kandung' => $get($row, 'nama_ibu_kandung'),
                'no_hp' => $get($row, 'no_hp*') ?? '-',
                'no_wa' => $get($row, 'no_wa'),
                'email' => $get($row, 'email'),
                'alamat_jalan' => $get($row, 'alamat_jalan'),
                'rt' => $get($row, 'rt'),
                'rw' => $get($row, 'rw'),
                'dusun' => $get($row, 'dusun'),
                'desa_kelurahan' => $get($row, 'desa_kelurahan'),
                'kecamatan' => $get($row, 'kecamatan'),
                'kota_kabupaten' => $get($row, 'kota_kabupaten'),
                'provinsi' => $get($row, 'provinsi'),
                'kode_pos' => $get($row, 'kode_pos'),
                'jenis_ptk' => $get($row, 'jenis_ptk*') ?? 'Guru Kelas',
                'status_kepegawaian' => $get($row, 'status_kepegawaian*') ?? 'GTT',
                'status_keaktifan' => $get($row, 'status_keaktifan') ?? 'Aktif',
                'tanggal_bergabung' => $get($row, 'tanggal_bergabung (YYYY-MM-DD)'),
                'tmt_pns' => $get($row, 'tmt_pns (YYYY-MM-DD)'),
                'tmt_gty' => $get($row, 'tmt_gty (YYYY-MM-DD)'),
                'masa_kerja_tahun' => $get($row, 'masa_kerja_tahun'),
                'no_sk_pengangkatan' => $get($row, 'no_sk_pengangkatan'),
                'tgl_sk_pengangkatan' => $get($row, 'tgl_sk_pengangkatan (YYYY-MM-DD)'),
                'instansi_pengangkat' => $get($row, 'instansi_pengangkat'),
            ], fn($v) => $v !== null);

            try {
                $existing = Guru::where('nuptk', $nuptk)->first();
                if ($existing) {
                    unset($payload['nuptk']);
                    $existing->update($payload);
                    $results['diperbarui']++;
                } else {
                    Guru::create($payload);
                    $results['berhasil']++;
                }
            } catch (\Exception $e) {
                $results['gagal']++;
                $results['errors'][] = "Utama Baris {$baris} ({$nama}): " . $e->getMessage();
            }
        }
    }

    private function processSheetKeluarga(\Closure $getSheet, \Closure $findGuru, \Closure $countRelasi, array &$results): void
    {
        $sheet = $getSheet('Keluarga & Anak') ?? $getSheet(2);
        if (!$sheet)
            return;

        $rows = $sheet['rows'];
        if (empty($rows))
            return;

        $get = $this->cellGetter(array_flip(array_map('trim', array_shift($rows))));

        foreach ($rows as $idx => $row) {
            $baris = $idx + 2;
            if ($this->isBlankRow($row))
                continue;

            $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
            if (!$nuptk)
                continue;

            $guru = $findGuru($nuptk, 'Keluarga', $baris);
            if (!$guru)
                continue;

            try {
                $spk = $get($row, 'status_perkawinan');
                if ($spk || $get($row, 'nama_pasangan')) {
                    $guru->keluarga()->updateOrCreate(
                        ['guru_id' => $guru->id],
                        array_filter([
                            'status_perkawinan' => $spk,
                            'nama_pasangan' => $get($row, 'nama_pasangan'),
                            'nik_pasangan' => $get($row, 'nik_pasangan'),
                            'pekerjaan_pasangan' => $get($row, 'pekerjaan_pasangan'),
                            'jumlah_anak' => $get($row, 'jumlah_anak'),
                        ], fn($v) => $v !== null)
                    );
                    $countRelasi('keluarga');
                }

                $namaAnak = $get($row, 'nama_anak');
                if ($namaAnak) {
                    $guru->anaks()->create(array_filter([
                        'nama' => $namaAnak,
                        'jenis_kelamin' => $get($row, 'jenis_kelamin_anak (L/P)'),
                        'tanggal_lahir' => $get($row, 'tanggal_lahir_anak (YYYY-MM-DD)'),
                        'urutan' => $get($row, 'urutan_anak'),
                    ], fn($v) => $v !== null));
                    $countRelasi('anak');
                }
            } catch (\Exception $e) {
                $results['errors'][] = "Keluarga Baris {$baris}: " . $e->getMessage();
            }
        }
    }

    private function processSheetRekening(\Closure $getSheet, \Closure $findGuru, \Closure $countRelasi, array &$results): void
    {
        $sheet = $getSheet('Rekening') ?? $getSheet(3);
        if (!$sheet)
            return;

        $rows = $sheet['rows'];
        if (empty($rows))
            return;

        $get = $this->cellGetter(array_flip(array_map('trim', array_shift($rows))));

        foreach ($rows as $idx => $row) {
            $baris = $idx + 2;
            if ($this->isBlankRow($row))
                continue;

            $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
            if (!$nuptk)
                continue;

            $guru = $findGuru($nuptk, 'Rekening', $baris);
            if (!$guru)
                continue;

            try {
                $guru->rekenings()->updateOrCreate(
                    ['guru_id' => $guru->id, 'is_primary' => 1],
                    array_filter([
                        'nama_bank' => $get($row, 'nama_bank'),
                        'no_rekening' => $get($row, 'no_rekening'),
                        'atas_nama' => $get($row, 'atas_nama'),
                        'cabang' => $get($row, 'cabang'),
                        'npwp' => $get($row, 'npwp'),
                        'no_bpjs_kesehatan' => $get($row, 'no_bpjs_kesehatan'),
                        'no_bpjs_ketenagakerjaan' => $get($row, 'no_bpjs_ketenagakerjaan'),
                        'gaji_pokok' => $get($row, 'gaji_pokok'),
                        'tunjangan_fungsional' => $get($row, 'tunjangan_fungsional'),
                        'tunjangan_profesi' => $get($row, 'tunjangan_profesi'),
                        'is_primary' => 1,
                    ], fn($v) => $v !== null)
                );
                $countRelasi('rekening');
            } catch (\Exception $e) {
                $results['errors'][] = "Rekening Baris {$baris}: " . $e->getMessage();
            }
        }
    }

    private function processSheetPendidikan(\Closure $getSheet, \Closure $findGuru, \Closure $countRelasi, array &$results): void
    {
        $sheet = $getSheet('Pendidikan') ?? $getSheet(4);
        if (!$sheet)
            return;

        $rows = $sheet['rows'];
        if (empty($rows))
            return;

        $get = $this->cellGetter(array_flip(array_map('trim', array_shift($rows))));

        foreach ($rows as $idx => $row) {
            $baris = $idx + 2;
            if ($this->isBlankRow($row))
                continue;

            $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
            if (!$nuptk)
                continue;

            $guru = $findGuru($nuptk, 'Pendidikan', $baris);
            if (!$guru)
                continue;

            $jenjang = $get($row, 'jenjang (SD/SMP/SMA-SMK/D1/D2/D3/D4/S1/S2/S3)*');
            $namaSekolah = $get($row, 'nama_sekolah*');

            if (!$jenjang || !$namaSekolah) {
                $results['errors'][] = "Pendidikan Baris {$baris}: jenjang dan nama_sekolah wajib.";
                continue;
            }

            try {
                $guru->pendidikans()->create(array_filter([
                    'jenjang' => str_replace('-', '/', $jenjang),
                    'nama_sekolah' => $namaSekolah,
                    'jurusan' => $get($row, 'jurusan'),
                    'prodi' => $get($row, 'prodi'),
                    'tahun_masuk' => $get($row, 'tahun_masuk'),
                    'tahun_lulus' => $get($row, 'tahun_lulus'),
                    'no_ijazah' => $get($row, 'no_ijazah'),
                ], fn($v) => $v !== null));
                $countRelasi('pendidikan');
            } catch (\Exception $e) {
                $results['errors'][] = "Pendidikan Baris {$baris}: " . $e->getMessage();
            }
        }
    }

    private function processSheetSertifikasi(\Closure $getSheet, \Closure $findGuru, \Closure $countRelasi, array &$results): void
    {
        $sheet = $getSheet('Sertifikasi') ?? $getSheet(5);
        if (!$sheet)
            return;

        $rows = $sheet['rows'];
        if (empty($rows))
            return;

        $get = $this->cellGetter(array_flip(array_map('trim', array_shift($rows))));

        foreach ($rows as $idx => $row) {
            $baris = $idx + 2;
            if ($this->isBlankRow($row))
                continue;

            $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
            if (!$nuptk)
                continue;

            $guru = $findGuru($nuptk, 'Sertifikasi', $baris);
            if (!$guru)
                continue;

            $jenisSert = $get($row, 'jenis_sertifikasi*');
            if (!$jenisSert) {
                $results['errors'][] = "Sertifikasi Baris {$baris}: jenis_sertifikasi wajib.";
                continue;
            }

            try {
                $guru->sertifikasis()->create(array_filter([
                    'jenis_sertifikasi' => $jenisSert,
                    'no_sertifikat' => $get($row, 'no_sertifikat'),
                    'nrg' => $get($row, 'nrg'),
                    'tahun_sertifikasi' => $get($row, 'tahun_sertifikasi'),
                    'lptk' => $get($row, 'lptk'),
                    'bidang_studi' => $get($row, 'bidang_studi'),
                    'tanggal_terbit' => $get($row, 'tanggal_terbit (YYYY-MM-DD)'),
                    'expired_at' => $get($row, 'expired_at (YYYY-MM-DD)'),
                ], fn($v) => $v !== null));
                $countRelasi('sertifikasi');
            } catch (\Exception $e) {
                $results['errors'][] = "Sertifikasi Baris {$baris}: " . $e->getMessage();
            }
        }
    }

    private function processSheetDiklat(\Closure $getSheet, \Closure $findGuru, \Closure $countRelasi, array &$results): void
    {
        $sheet = $getSheet('Diklat') ?? $getSheet(6);
        if (!$sheet)
            return;

        $rows = $sheet['rows'];
        if (empty($rows))
            return;

        $get = $this->cellGetter(array_flip(array_map('trim', array_shift($rows))));

        foreach ($rows as $idx => $row) {
            $baris = $idx + 2;
            if ($this->isBlankRow($row))
                continue;

            $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
            if (!$nuptk)
                continue;

            $guru = $findGuru($nuptk, 'Diklat', $baris);
            if (!$guru)
                continue;

            $namaDiklat = $get($row, 'nama_diklat*');
            if (!$namaDiklat) {
                $results['errors'][] = "Diklat Baris {$baris}: nama_diklat wajib.";
                continue;
            }

            try {
                $tingkat = $get($row, 'tingkat (Kecamatan/Kabupaten-Kota/Provinsi/Nasional/Internasional)');
                $guru->diklats()->create(array_filter([
                    'nama_diklat' => $namaDiklat,
                    'penyelenggara' => $get($row, 'penyelenggara'),
                    'jenis' => $get($row, 'jenis (diklat/bimtek/workshop/seminar/pelatihan/kursus)'),
                    'tingkat' => $tingkat ? str_replace('-', '/', $tingkat) : null,
                    'tanggal_mulai' => $get($row, 'tanggal_mulai (YYYY-MM-DD)'),
                    'tanggal_selesai' => $get($row, 'tanggal_selesai (YYYY-MM-DD)'),
                    'jumlah_jam' => $get($row, 'jumlah_jam'),
                    'peran' => $get($row, 'peran (peserta/narasumber/panitia/moderator)'),
                    'no_sertifikat' => $get($row, 'no_sertifikat'),
                    'keterangan' => $get($row, 'keterangan'),
                ], fn($v) => $v !== null));
                $countRelasi('diklat');
            } catch (\Exception $e) {
                $results['errors'][] = "Diklat Baris {$baris}: " . $e->getMessage();
            }
        }
    }

    private function processSheetJabatan(\Closure $getSheet, \Closure $findGuru, \Closure $countRelasi, array &$results): void
    {
        $sheet = $getSheet('Jabatan') ?? $getSheet(7);
        if (!$sheet)
            return;

        $rows = $sheet['rows'];
        if (empty($rows))
            return;

        $get = $this->cellGetter(array_flip(array_map('trim', array_shift($rows))));

        foreach ($rows as $idx => $row) {
            $baris = $idx + 2;
            if ($this->isBlankRow($row))
                continue;

            $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
            if (!$nuptk)
                continue;

            $guru = $findGuru($nuptk, 'Jabatan', $baris);
            if (!$guru)
                continue;

            $jabatan = $get($row, 'jabatan*');
            $jenisJab = $get($row, 'jenis_jabatan (Struktural/Fungsional/Tambahan)*');

            if (!$jabatan || !$jenisJab) {
                $results['errors'][] = "Jabatan Baris {$baris}: jabatan dan jenis_jabatan wajib.";
                continue;
            }

            try {
                $isCurrent = (int) ($get($row, 'is_current (1/0)') ?? 0);
                if ($isCurrent) {
                    $guru->jabatans()->update(['is_current' => false]);
                }
                $guru->jabatans()->create(array_filter([
                    'jenis_jabatan' => $jenisJab,
                    'jabatan' => $jabatan,
                    'unit_kerja' => $get($row, 'unit_kerja'),
                    'instansi_pengangkat' => $get($row, 'instansi_pengangkat'),
                    'golongan' => $get($row, 'golongan'),
                    'pangkat' => $get($row, 'pangkat'),
                    'jenis_pengangkatan' => $get($row, 'jenis_pengangkatan'),
                    'status_kepegawaian' => $get($row, 'status_kepegawaian_jabatan (CPNS/PNS/PPPK/GTY/GTT/Honorer/Kontrak)'),
                    'no_sk' => $get($row, 'no_sk'),
                    'tanggal_sk' => $get($row, 'tanggal_sk (YYYY-MM-DD)'),
                    'pejabat_penandatangan' => $get($row, 'pejabat_penandatangan'),
                    'tmt_jabatan' => $get($row, 'tmt_jabatan (YYYY-MM-DD)'),
                    'tanggal_selesai' => $get($row, 'tanggal_selesai (YYYY-MM-DD)'),
                    'status_jabatan' => $get($row, 'status_jabatan (Aktif/Berakhir/Nonaktif/Mutasi/Pensiun)'),
                    'is_current' => $isCurrent,
                    'uraian_tugas' => $get($row, 'uraian_tugas'),
                ], fn($v) => $v !== null && $v !== ''));
                $countRelasi('jabatan');
            } catch (\Exception $e) {
                $results['errors'][] = "Jabatan Baris {$baris}: " . $e->getMessage();
            }
        }
    }

    private function processSheetInpassing(\Closure $getSheet, \Closure $findGuru, \Closure $countRelasi, array &$results): void
    {
        $sheet = $getSheet('Inpassing') ?? $getSheet(8);
        if (!$sheet)
            return;

        $rows = $sheet['rows'];
        if (empty($rows))
            return;

        $get = $this->cellGetter(array_flip(array_map('trim', array_shift($rows))));

        foreach ($rows as $idx => $row) {
            $baris = $idx + 2;
            if ($this->isBlankRow($row))
                continue;

            $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
            if (!$nuptk)
                continue;

            $guru = $findGuru($nuptk, 'Inpassing', $baris);
            if (!$guru)
                continue;

            try {
                $guru->inpassings()->create(array_filter([
                    'no_sk' => $get($row, 'no_sk*'),
                    'tanggal_sk' => $get($row, 'tanggal_sk (YYYY-MM-DD)*'),
                    'tmt_inpassing' => $get($row, 'tmt_inpassing (YYYY-MM-DD)*'),
                    'golongan_sesudah' => $get($row, 'golongan_sesudah'),
                    'jabatan_fungsional' => $get($row, 'jabatan_fungsional'),
                    'angka_kredit' => $get($row, 'angka_kredit'),
                ], fn($v) => $v !== null));
                $countRelasi('inpassing');
            } catch (\Exception $e) {
                $results['errors'][] = "Inpassing Baris {$baris}: " . $e->getMessage();
            }
        }
    }

    private function processSheetMutasi(\Closure $getSheet, \Closure $findGuru, \Closure $countRelasi, array &$results): void
    {
        $sheet = $getSheet('Mutasi') ?? $getSheet(9);
        if (!$sheet)
            return;

        $rows = $sheet['rows'];
        if (empty($rows))
            return;

        $get = $this->cellGetter(array_flip(array_map('trim', array_shift($rows))));

        foreach ($rows as $idx => $row) {
            $baris = $idx + 2;
            if ($this->isBlankRow($row))
                continue;

            $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
            if (!$nuptk)
                continue;

            $guru = $findGuru($nuptk, 'Mutasi', $baris);
            if (!$guru)
                continue;

            try {
                $jenisMutasi = $get($row, 'jenis_mutasi (Masuk/Keluar/Internal)*');
                $guru->mutasi()->create(array_filter([
                    'jenis_mutasi' => $jenisMutasi,
                    'sekolah_asal' => $get($row, 'sekolah_asal'),
                    'npsn_asal' => $get($row, 'npsn_asal'),
                    'sekolah_tujuan' => $get($row, 'sekolah_tujuan'),
                    'npsn_tujuan' => $get($row, 'npsn_tujuan'),
                    'tanggal_mutasi' => $get($row, 'tanggal_mutasi (YYYY-MM-DD)*'),
                    'no_sk' => $get($row, 'no_sk'),
                    'tanggal_sk' => $get($row, 'tanggal_sk (YYYY-MM-DD)'),
                    'keterangan' => $get($row, 'keterangan'),
                ], fn($v) => $v !== null));

                match ($jenisMutasi) {
                    'Keluar' => $guru->update(['status_keaktifan' => 'Keluar']),
                    'Masuk', 'Kembali Bertugas' => $guru->update(['status_keaktifan' => 'Aktif']),
                    default => null,
                };

                $countRelasi('mutasi');
            } catch (\Exception $e) {
                $results['errors'][] = "Mutasi Baris {$baris}: " . $e->getMessage();
            }
        }
    }

    private function processSheetKompetensi(\Closure $getSheet, \Closure $findGuru, \Closure $countRelasi, array &$results): void
    {
        $sheet = $getSheet('Kompetensi') ?? $getSheet(10);
        if (!$sheet)
            return;

        $rows = $sheet['rows'];
        if (empty($rows))
            return;

        $get = $this->cellGetter(array_flip(array_map('trim', array_shift($rows))));

        foreach ($rows as $idx => $row) {
            $baris = $idx + 2;
            if ($this->isBlankRow($row))
                continue;

            $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
            if (!$nuptk)
                continue;

            $guru = $findGuru($nuptk, 'Kompetensi', $baris);
            if (!$guru)
                continue;

            try {
                $guru->kompetensi()->create(array_filter([
                    'jenis' => $get($row, 'jenis (bahasa/it/bidang_keahlian/lainnya)*'),
                    'nama' => $get($row, 'nama*'),
                    'tingkat' => $get($row, 'tingkat (Dasar/Menengah/Mahir/Ahli)'),
                    'keterangan' => $get($row, 'keterangan'),
                ], fn($v) => $v !== null));
                $countRelasi('kompetensi');
            } catch (\Exception $e) {
                $results['errors'][] = "Kompetensi Baris {$baris}: " . $e->getMessage();
            }
        }
    }

    private function processSheetKontakDarurat(\Closure $getSheet, \Closure $findGuru, \Closure $countRelasi, array &$results): void
    {
        $sheet = $getSheet('Kontak Darurat') ?? $getSheet(11);
        if (!$sheet)
            return;

        $rows = $sheet['rows'];
        if (empty($rows))
            return;

        $get = $this->cellGetter(array_flip(array_map('trim', array_shift($rows))));

        foreach ($rows as $idx => $row) {
            $baris = $idx + 2;
            if ($this->isBlankRow($row))
                continue;

            $nuptk = $get($row, 'nuptk* (harus ada di Sheet1)');
            if (!$nuptk)
                continue;

            $guru = $findGuru($nuptk, 'Kontak Darurat', $baris);
            if (!$guru)
                continue;

            try {
                $isPrimary = (int) ($get($row, 'is_primary (1/0)') ?? 0);
                if ($isPrimary) {
                    $guru->kontakDarurat()->update(['is_primary' => 0]);
                }
                $guru->kontakDarurat()->create(array_filter([
                    'nama' => $get($row, 'nama*'),
                    'hubungan' => $get($row, 'hubungan*'),
                    'no_hp' => $get($row, 'no_hp*'),
                    'alamat' => $get($row, 'alamat'),
                    'is_primary' => $isPrimary,
                ], fn($v) => $v !== null));
                $countRelasi('kontak_darurat');
            } catch (\Exception $e) {
                $results['errors'][] = "Kontak Darurat Baris {$baris}: " . $e->getMessage();
            }
        }
    }
}