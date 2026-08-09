<?php

namespace App\Services;

use App\Services\Excel\MultiSheetXlsxService;
use Illuminate\Database\Eloquent\Collection;

/**
 * GuruExportService
 *
 * Extracted from GuruExportController@export and @exportBackup.
 * Both methods shared identical sheet-building logic — now lives here once.
 */
class GuruExportService
{
    public function __construct(private MultiSheetXlsxService $xlsx)
    {
    }

    /**
     * Build XLSX bytes dari koleksi guru yang sudah di-eager-load.
     */
    public function build(Collection $gurus): string
    {
        $sheets = $this->buildSheets($gurus);
        return $this->xlsx->build($sheets);
    }

    /**
     * Susun array sheet definitions dari koleksi guru.
     * Dipisah agar bisa ditest secara independen.
     */
    public function buildSheets(Collection $gurus): array
    {
        $fmt = fn($d) => $d ? \Carbon\Carbon::parse($d)->format('d/m/Y') : '';

        return [
            $this->sheetUtama($gurus, $fmt),
            $this->sheetKeluarga($gurus, $fmt),
            $this->sheetRekening($gurus),
            $this->sheetPendidikan($gurus),
            $this->sheetSertifikasi($gurus, $fmt),
            $this->sheetDiklat($gurus, $fmt),
            $this->sheetJabatan($gurus, $fmt),
            $this->sheetInpassing($gurus, $fmt),
            $this->sheetMutasi($gurus, $fmt),
            $this->sheetKompetensi($gurus),
            $this->sheetKontakDarurat($gurus),
            $this->sheetDokumen($gurus, $fmt),
        ];
    }

    // ─────────────────────────────────────────────────────────────────
    // SHEET BUILDERS
    // ─────────────────────────────────────────────────────────────────

    private function sheetUtama(Collection $gurus, \Closure $fmt): array
    {
        $headers = [
            'No',
            'NUPTK',
            'NIP',
            'NIP Lama',
            'No. Karpeg',
            'No. Karis/Karsu',
            'NIK',
            'No. KK',
            'Nama',
            'Gelar Depan',
            'Gelar Belakang',
            'Jenis Kelamin',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Agama',
            'Golongan Darah',
            'Kewarganegaraan',
            'Status Hidup',
            'Nama Ibu Kandung',
            'No. HP',
            'No. WA',
            'Email',
            'Alamat Jalan',
            'RT',
            'RW',
            'Dusun',
            'Desa/Kelurahan',
            'Kecamatan',
            'Kabupaten/Kota',
            'Provinsi',
            'Kode Pos',
            'Jenis PTK',
            'Status Kepegawaian',
            'Status Keaktifan',
            'Tanggal Bergabung',
            'TMT PNS',
            'TMT GTY',
            'Masa Kerja (Thn)',
            'No. SK Pengangkatan',
            'Tgl SK Pengangkatan',
            'Instansi Pengangkat',
            'Wali Kelas',
        ];

        $rows = $gurus->map(fn($g, $i) => [
            $i + 1,
            $g->nuptk ?? '',
            $g->nip ?? '',
            $g->nip_lama ?? '',
            $g->no_karpeg ?? '',
            $g->no_karis_karsu ?? '',
            $g->nik ?? '',
            $g->no_kk ?? '',
            $g->nama,
            $g->gelar_depan ?? '',
            $g->gelar_belakang ?? '',
            $g->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            $g->tempat_lahir ?? '',
            $fmt($g->tanggal_lahir),
            $g->agama ?? '',
            $g->golongan_darah ?? '',
            $g->kewarganegaraan ?? '',
            $g->status_hidup ?? '',
            $g->nama_ibu_kandung ?? '',
            $g->no_hp ?? '',
            $g->no_wa ?? '',
            $g->email ?? '',
            $g->alamat_jalan ?? '',
            $g->rt ?? '',
            $g->rw ?? '',
            $g->dusun ?? '',
            $g->desa_kelurahan ?? '',
            $g->kecamatan ?? '',
            $g->kota_kabupaten ?? '',
            $g->provinsi ?? '',
            $g->kode_pos ?? '',
            $g->jenis_ptk ?? '',
            $g->status_kepegawaian ?? '',
            $g->status_keaktifan ?? '',
            $fmt($g->tanggal_bergabung),
            $fmt($g->tmt_pns),
            $fmt($g->tmt_gty),
            $g->masa_kerja_tahun ?? '',
            $g->no_sk_pengangkatan ?? '',
            $fmt($g->tgl_sk_pengangkatan),
            $g->instansi_pengangkat ?? '',
            $g->waliKelas->first()?->kelas?->nama_kelas ?? '',
        ])->values()->toArray();

        return ['name' => 'Data Utama', 'headers' => $headers, 'rows' => $rows];
    }

    private function sheetKeluarga(Collection $gurus, \Closure $fmt): array
    {
        $headers = [
            'NUPTK',
            'Nama Guru',
            'Status Perkawinan',
            'Nama Pasangan',
            'NIK Pasangan',
            'Pekerjaan Pasangan',
            'Jumlah Anak',
            'Nama Anak',
            'JK Anak',
            'Tgl Lahir Anak',
            'Urutan Anak',
        ];

        $rows = [];
        foreach ($gurus as $g) {
            $kel = $g->keluarga;
            $anaks = $g->anaks;
            if (!$kel && $anaks->isEmpty())
                continue;

            $baseRow = [
                $g->nuptk,
                $g->nama,
                $kel?->status_perkawinan ?? '',
                $kel?->nama_pasangan ?? '',
                $kel?->nik_pasangan ?? '',
                $kel?->pekerjaan_pasangan ?? '',
                $kel?->jumlah_anak ?? '',
            ];

            if ($anaks->isEmpty()) {
                $rows[] = array_merge($baseRow, ['', '', '', '']);
            } else {
                foreach ($anaks as $ai => $anak) {
                    $rows[] = array_merge(
                        $ai === 0 ? $baseRow : [$g->nuptk, $g->nama, '', '', '', '', ''],
                        [$anak->nama, $anak->jenis_kelamin ?? '', $fmt($anak->tanggal_lahir), $anak->urutan ?? '']
                    );
                }
            }
        }

        return ['name' => 'Keluarga & Anak', 'headers' => $headers, 'rows' => $rows];
    }

    private function sheetRekening(Collection $gurus): array
    {
        $headers = [
            'NUPTK',
            'Nama Guru',
            'Nama Bank',
            'No. Rekening',
            'Atas Nama',
            'Cabang',
            'NPWP',
            'No. BPJS Kesehatan',
            'No. BPJS Ketenagakerjaan',
            'Gaji Pokok',
            'Tunjangan Fungsional',
            'Tunjangan Profesi',
        ];

        $rows = [];
        foreach ($gurus as $g) {
            $rek = $g->rekenings->first();
            $rows[] = [
                $g->nuptk,
                $g->nama,
                $rek?->nama_bank ?? '',
                $rek?->no_rekening ?? '',
                $rek?->atas_nama ?? '',
                $rek?->cabang ?? '',
                $rek?->npwp ?? '',
                $rek?->no_bpjs_kesehatan ?? '',
                $rek?->no_bpjs_ketenagakerjaan ?? '',
                $rek?->gaji_pokok ?? '',
                $rek?->tunjangan_fungsional ?? '',
                $rek?->tunjangan_profesi ?? '',
            ];
        }

        return ['name' => 'Rekening', 'headers' => $headers, 'rows' => $rows];
    }

    private function sheetPendidikan(Collection $gurus): array
    {
        $headers = [
            'NUPTK',
            'Nama Guru',
            'Jenjang',
            'Nama Sekolah',
            'Jurusan',
            'Prodi',
            'Tahun Masuk',
            'Tahun Lulus',
            'No. Ijazah',
            'File Ijazah (path)',
        ];

        $rows = [];
        foreach ($gurus as $g) {
            foreach ($g->pendidikans as $p) {
                $rows[] = [
                    $g->nuptk,
                    $g->nama,
                    $p->jenjang,
                    $p->nama_sekolah,
                    $p->jurusan ?? '',
                    $p->prodi ?? '',
                    $p->tahun_masuk ?? '',
                    $p->tahun_lulus ?? '',
                    $p->no_ijazah ?? '',
                    $p->file_ijazah ?? '',
                ];
            }
        }

        return ['name' => 'Pendidikan', 'headers' => $headers, 'rows' => $rows];
    }

    private function sheetSertifikasi(Collection $gurus, \Closure $fmt): array
    {
        $headers = [
            'NUPTK',
            'Nama Guru',
            'Jenis Sertifikasi',
            'No. Sertifikat',
            'NRG',
            'Tahun Sertifikasi',
            'LPTK',
            'Bidang Studi',
            'Tanggal Terbit',
            'Expired',
            'File Sertifikat (path)',
        ];

        $rows = [];
        foreach ($gurus as $g) {
            foreach ($g->sertifikasis as $s) {
                $rows[] = [
                    $g->nuptk,
                    $g->nama,
                    $s->jenis_sertifikasi,
                    $s->no_sertifikat ?? '',
                    $s->nrg ?? '',
                    $s->tahun_sertifikasi ?? '',
                    $s->lptk ?? '',
                    $s->bidang_studi ?? '',
                    $fmt($s->tanggal_terbit),
                    $fmt($s->expired_at),
                    $s->file_sertifikat ?? '',
                ];
            }
        }

        return ['name' => 'Sertifikasi', 'headers' => $headers, 'rows' => $rows];
    }

    private function sheetDiklat(Collection $gurus, \Closure $fmt): array
    {
        $headers = [
            'NUPTK',
            'Nama Guru',
            'Nama Diklat',
            'Penyelenggara',
            'Jenis',
            'Tingkat',
            'Tgl Mulai',
            'Tgl Selesai',
            'Jumlah Jam',
            'Peran',
            'No. Sertifikat',
            'Keterangan',
            'File Sertifikat Diklat (path)',
        ];

        $rows = [];
        foreach ($gurus as $g) {
            foreach ($g->diklats as $d) {
                $rows[] = [
                    $g->nuptk,
                    $g->nama,
                    $d->nama_diklat,
                    $d->penyelenggara ?? '',
                    $d->jenis ?? '',
                    $d->tingkat ?? '',
                    $fmt($d->tanggal_mulai),
                    $fmt($d->tanggal_selesai),
                    $d->jumlah_jam ?? '',
                    $d->peran ?? '',
                    $d->no_sertifikat ?? '',
                    $d->keterangan ?? '',
                    $d->file_sertifikat ?? '',
                ];
            }
        }

        return ['name' => 'Diklat', 'headers' => $headers, 'rows' => $rows];
    }

    private function sheetJabatan(Collection $gurus, \Closure $fmt): array
    {
        $headers = [
            'NUPTK',
            'Nama Guru',
            'Jenis Jabatan',
            'Jabatan',
            'Unit Kerja',
            'Instansi Pengangkat',
            'Golongan',
            'Pangkat',
            'Jenis Pengangkatan',
            'Status Kepegawaian',
            'No. SK',
            'Tgl SK',
            'Pejabat TTD',
            'TMT Jabatan',
            'Tgl Selesai',
            'Status Jabatan',
            'Is Current',
            'Uraian Tugas',
        ];

        $rows = [];
        foreach ($gurus as $g) {
            foreach ($g->jabatans as $j) {
                $rows[] = [
                    $g->nuptk,
                    $g->nama,
                    $j->jenis_jabatan,
                    $j->jabatan,
                    $j->unit_kerja ?? '',
                    $j->instansi_pengangkat ?? '',
                    $j->golongan ?? '',
                    $j->pangkat ?? '',
                    $j->jenis_pengangkatan ?? '',
                    $j->status_kepegawaian ?? '',
                    $j->no_sk ?? '',
                    $fmt($j->tanggal_sk),
                    $j->pejabat_penandatangan ?? '',
                    $fmt($j->tmt_jabatan),
                    $fmt($j->tanggal_selesai),
                    $j->status_jabatan ?? '',
                    $j->is_current ? 'Ya' : 'Tidak',
                    $j->uraian_tugas ?? '',
                ];
            }
        }

        return ['name' => 'Jabatan', 'headers' => $headers, 'rows' => $rows];
    }

    private function sheetInpassing(Collection $gurus, \Closure $fmt): array
    {
        $headers = [
            'NUPTK',
            'Nama Guru',
            'No. SK',
            'Tanggal SK',
            'TMT Inpassing',
            'Golongan Sesudah',
            'Jabatan Fungsional',
            'Angka Kredit',
            'File SK (path)',
        ];

        $rows = [];
        foreach ($gurus as $g) {
            foreach ($g->inpassings as $inp) {
                $rows[] = [
                    $g->nuptk,
                    $g->nama,
                    $inp->no_sk,
                    $fmt($inp->tanggal_sk),
                    $fmt($inp->tmt_inpassing),
                    $inp->golongan_sesudah ?? '',
                    $inp->jabatan_fungsional ?? '',
                    $inp->angka_kredit ?? '',
                    $inp->file_sk ?? '',
                ];
            }
        }

        return ['name' => 'Inpassing', 'headers' => $headers, 'rows' => $rows];
    }

    private function sheetMutasi(Collection $gurus, \Closure $fmt): array
    {
        $headers = [
            'NUPTK',
            'Nama Guru',
            'Jenis Mutasi',
            'Sekolah Asal',
            'NPSN Asal',
            'Sekolah Tujuan',
            'NPSN Tujuan',
            'Tgl Mutasi',
            'No. SK',
            'Tgl SK',
            'Keterangan',
            'File SK Mutasi (path)',
        ];

        $rows = [];
        foreach ($gurus as $g) {
            foreach ($g->mutasi as $m) {
                $rows[] = [
                    $g->nuptk,
                    $g->nama,
                    $m->jenis_mutasi,
                    $m->sekolah_asal ?? '',
                    $m->npsn_asal ?? '',
                    $m->sekolah_tujuan ?? '',
                    $m->npsn_tujuan ?? '',
                    $fmt($m->tanggal_mutasi),
                    $m->no_sk ?? '',
                    $fmt($m->tanggal_sk),
                    $m->keterangan ?? '',
                    $m->file_sk ?? '',
                ];
            }
        }

        return ['name' => 'Mutasi', 'headers' => $headers, 'rows' => $rows];
    }

    private function sheetKompetensi(Collection $gurus): array
    {
        $headers = ['NUPTK', 'Nama Guru', 'Jenis', 'Nama Kompetensi', 'Tingkat', 'Keterangan'];

        $rows = [];
        foreach ($gurus as $g) {
            foreach ($g->kompetensi as $k) {
                $rows[] = [
                    $g->nuptk,
                    $g->nama,
                    $k->jenis,
                    $k->nama,
                    $k->tingkat ?? '',
                    $k->keterangan ?? '',
                ];
            }
        }

        return ['name' => 'Kompetensi', 'headers' => $headers, 'rows' => $rows];
    }

    private function sheetKontakDarurat(Collection $gurus): array
    {
        $headers = ['NUPTK', 'Nama Guru', 'Nama Kontak', 'Hubungan', 'No. HP', 'Alamat', 'Primary'];

        $rows = [];
        foreach ($gurus as $g) {
            foreach ($g->kontakDarurat as $kd) {
                $rows[] = [
                    $g->nuptk,
                    $g->nama,
                    $kd->nama,
                    $kd->hubungan,
                    $kd->no_hp,
                    $kd->alamat ?? '',
                    $kd->is_primary ? 'Ya' : 'Tidak',
                ];
            }
        }

        return ['name' => 'Kontak Darurat', 'headers' => $headers, 'rows' => $rows];
    }

    private function sheetDokumen(Collection $gurus, \Closure $fmt): array
    {
        $headers = [
            'NUPTK',
            'Nama Guru',
            'Kategori',
            'Nama Dokumen',
            'Nomor Dokumen',
            'Tanggal Dokumen',
            'Tanggal Berlaku',
            'Tanggal Kadaluarsa',
            'Penerbit',
            'File Path',
            'Terverifikasi',
            'Keterangan',
        ];

        $rows = [];
        foreach ($gurus as $g) {
            foreach ($g->dokumens as $dok) {
                $rows[] = [
                    $g->nuptk,
                    $g->nama,
                    $dok->kategori ?? '',
                    $dok->nama_dokumen,
                    $dok->nomor_dokumen ?? '',
                    $fmt($dok->tanggal_dokumen),
                    $fmt($dok->tanggal_berlaku),
                    $fmt($dok->tanggal_kadaluarsa),
                    $dok->penerbit ?? '',
                    $dok->file_path ?? '',
                    $dok->is_verified ? 'Ya' : 'Tidak',
                    $dok->keterangan ?? '',
                ];
            }
        }

        return ['name' => 'Dokumen Umum', 'headers' => $headers, 'rows' => $rows];
    }
}