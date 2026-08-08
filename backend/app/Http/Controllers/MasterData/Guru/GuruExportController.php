<?php

namespace App\Http\Controllers\MasterData\Guru;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use App\Models\GuruImportLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class GuruExportController extends Controller
{
    public function __construct()
    {
        $this->middleware(fn($req, $next) => $this->authorize('export', Guru::class) ?? $next($req));
    }

    public function export(Request $request)
    {
        $gurus = Guru::query()
            ->with([
                'keluarga',
                'anaks',
                'rekenings' => fn($q) => $q->where('is_primary', 1),
                'pendidikans',
                'sertifikasis',
                'diklats',
                'jabatans',
                'inpassings',
                'mutasi',
                'kompetensi',
                'kontakDarurat',
                'dokumens',
                'waliKelas' => fn($q) => $q->where('is_active', 1)->with('kelas:id,nama_kelas'),
            ])

            ->when($request->jenis_ptk, fn($q) => $q->where('jenis_ptk', $request->jenis_ptk))
            ->when($request->status_kepegawaian, fn($q) => $q->where('status_kepegawaian', $request->status_kepegawaian))
            ->when($request->status_keaktifan, fn($q) => $q->where('status_keaktifan', $request->status_keaktifan))
            ->when($request->search, fn($q) => $q->where('nama', 'like', "%{$request->search}%")->orWhere('nuptk', 'like', "%{$request->search}%"))
            ->orderBy('nama')
            ->get();

        $fmt = fn($d) => $d ? \Carbon\Carbon::parse($d)->format('d/m/Y') : '';

        // ── Sheet 1: Data Utama ─────────────────────────────────────────
        $hUtama = [
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
        $rUtama = $gurus->map(fn($g, $i) => [
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

        // ── Sheet 2: Keluarga & Anak ────────────────────────────────────
        $hKeluarga = [
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
            'Urutan Anak'
        ];
        $rKeluarga = [];
        foreach ($gurus as $g) {
            $kel = $g->keluarga;
            $anaks = $g->anaks;
            if (!$kel && $anaks->isEmpty())
                continue;
            $kelRow = [
                $g->nuptk,
                $g->nama,
                $kel?->status_perkawinan ?? '',
                $kel?->nama_pasangan ?? '',
                $kel?->nik_pasangan ?? '',
                $kel?->pekerjaan_pasangan ?? '',
                $kel?->jumlah_anak ?? ''
            ];
            if ($anaks->isEmpty()) {
                $rKeluarga[] = array_merge($kelRow, ['', '', '', '']);
            } else {
                foreach ($anaks as $ai => $anak) {
                    $rKeluarga[] = array_merge(
                        $ai === 0 ? $kelRow : [$g->nuptk, $g->nama, '', '', '', '', ''],
                        [$anak->nama, $anak->jenis_kelamin ?? '', $fmt($anak->tanggal_lahir), $anak->urutan ?? '']
                    );
                }
            }
        }

        // ── Sheet 3: Rekening & Administrasi ───────────────────────────
        $hRekening = [
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
            'Tunjangan Profesi'
        ];
        $rRekening = [];
        foreach ($gurus as $g) {
            $rek = $g->rekenings->first();
            $rRekening[] = [
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

        // ── Sheet 4: Pendidikan ─────────────────────────────────────────
        $hPendidikan = [
            'NUPTK',
            'Nama Guru',
            'Jenjang',
            'Nama Sekolah',
            'Jurusan',
            'Prodi',
            'Tahun Masuk',
            'Tahun Lulus',
            'No. Ijazah',
            'File Ijazah (path)'
        ];
        $rPendidikan = [];
        foreach ($gurus as $g) {
            foreach ($g->pendidikans as $p) {
                $rPendidikan[] = [
                    $g->nuptk,
                    $g->nama,
                    $p->jenjang,
                    $p->nama_sekolah,
                    $p->jurusan ?? '',
                    $p->prodi ?? '',
                    $p->tahun_masuk ?? '',
                    $p->tahun_lulus ?? '',
                    $p->no_ijazah ?? '',
                    $p->file_ijazah ?? ''
                ];
            }
        }

        // ── Sheet 5: Sertifikasi ────────────────────────────────────────
        $hSertifikasi = [
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
            'File Sertifikat (path)'
        ];
        $rSertifikasi = [];
        foreach ($gurus as $g) {
            foreach ($g->sertifikasis as $s) {
                $rSertifikasi[] = [
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
                    $s->file_sertifikat ?? ''
                ];
            }
        }

        // ── Sheet 6: Diklat ─────────────────────────────────────────────
        $hDiklat = [
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
            'File Sertifikat Diklat (path)'
        ];
        $rDiklat = [];
        foreach ($gurus as $g) {
            foreach ($g->diklats as $d) {
                $rDiklat[] = [
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
                    $d->file_sertifikat ?? ''
                ];
            }
        }

        // ── Sheet 7: Jabatan ────────────────────────────────────────────
        $hJabatan = [
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
            'Uraian Tugas'
        ];
        $rJabatan = [];
        foreach ($gurus as $g) {
            foreach ($g->jabatans as $j) {
                $rJabatan[] = [
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
                    $j->uraian_tugas ?? ''
                ];
            }
        }

        // ── Sheet 8: Inpassing ──────────────────────────────────────────
        $hInpassing = [
            'NUPTK',
            'Nama Guru',
            'No. SK',
            'Tanggal SK',
            'TMT Inpassing',
            'Golongan Sesudah',
            'Jabatan Fungsional',
            'Angka Kredit',
            'File SK (path)'
        ];
        $rInpassing = [];
        foreach ($gurus as $g) {
            foreach ($g->inpassings as $inp) {
                $rInpassing[] = [
                    $g->nuptk,
                    $g->nama,
                    $inp->no_sk,
                    $fmt($inp->tanggal_sk),
                    $fmt($inp->tmt_inpassing),
                    $inp->golongan_sesudah ?? '',
                    $inp->jabatan_fungsional ?? '',
                    $inp->angka_kredit ?? '',
                    $inp->file_sk ?? ''
                ];
            }
        }

        // ── Sheet 9: Mutasi ─────────────────────────────────────────────
        $hMutasi = [
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
            'File SK Mutasi (path)'
        ];
        $rMutasi = [];
        foreach ($gurus as $g) {
            foreach ($g->mutasi as $m) {
                $rMutasi[] = [
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
                    $m->file_sk ?? ''
                ];
            }
        }

        // ── Sheet 10: Kompetensi ────────────────────────────────────────
        $hKompetensi = ['NUPTK', 'Nama Guru', 'Jenis', 'Nama Kompetensi', 'Tingkat', 'Keterangan'];
        $rKompetensi = [];
        foreach ($gurus as $g) {
            foreach ($g->kompetensi as $k) {
                $rKompetensi[] = [
                    $g->nuptk,
                    $g->nama,
                    $k->jenis,
                    $k->nama,
                    $k->tingkat ?? '',
                    $k->keterangan ?? ''
                ];
            }
        }

        // ── Sheet 11: Kontak Darurat ────────────────────────────────────
        $hKontak = ['NUPTK', 'Nama Guru', 'Nama Kontak', 'Hubungan', 'No. HP', 'Alamat', 'Primary'];
        $rKontak = [];
        foreach ($gurus as $g) {
            foreach ($g->kontakDarurat as $kd) {
                $rKontak[] = [
                    $g->nuptk,
                    $g->nama,
                    $kd->nama,
                    $kd->hubungan,
                    $kd->no_hp,
                    $kd->alamat ?? '',
                    $kd->is_primary ? 'Ya' : 'Tidak'
                ];
            }
        }

        // ── Sheet 12: Dokumen Umum (guru_dokumens) ─────────────────────────
        $hDokumen = [
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
            'Keterangan'
        ];
        $rDokumen = [];
        foreach ($gurus as $g) {
            foreach ($g->dokumens as $dok) {
                $rDokumen[] = [
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
                    $dok->keterangan ?? ''
                ];
            }
        }

        $sheets = [
            ['name' => 'Data Utama', 'headers' => $hUtama, 'rows' => $rUtama],
            ['name' => 'Keluarga & Anak', 'headers' => $hKeluarga, 'rows' => $rKeluarga],
            ['name' => 'Rekening', 'headers' => $hRekening, 'rows' => $rRekening],
            ['name' => 'Pendidikan', 'headers' => $hPendidikan, 'rows' => $rPendidikan],
            ['name' => 'Sertifikasi', 'headers' => $hSertifikasi, 'rows' => $rSertifikasi],
            ['name' => 'Diklat', 'headers' => $hDiklat, 'rows' => $rDiklat],
            ['name' => 'Jabatan', 'headers' => $hJabatan, 'rows' => $rJabatan],
            ['name' => 'Inpassing', 'headers' => $hInpassing, 'rows' => $rInpassing],
            ['name' => 'Mutasi', 'headers' => $hMutasi, 'rows' => $rMutasi],
            ['name' => 'Kompetensi', 'headers' => $hKompetensi, 'rows' => $rKompetensi],
            ['name' => 'Kontak Darurat', 'headers' => $hKontak, 'rows' => $rKontak],
            ['name' => 'Dokumen Umum', 'headers' => $hDokumen, 'rows' => $rDokumen],
        ];

        $filename = 'data_guru_' . now()->format('Ymd_His') . '.xlsx';
        $xlsx = $this->buildMultiSheetXlsx($sheets);
        return response($xlsx, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Content-Length' => strlen($xlsx),
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * POST /guru/import-preview
     * Baca header + 5 baris pertama — tanpa menyimpan ke DB.
     */
    public function exportBackup()
    {
        $gurus = Guru::with([
            'keluarga',
            'anaks',
            'rekenings' => fn($q) => $q->where('is_primary', 1),
            'pendidikans',
            'sertifikasis',
            'diklats',
            'jabatans',
            'inpassings',
            'mutasi',
            'kompetensi',
            'kontakDarurat',
            'dokumens',
            'waliKelas' => fn($q) => $q->where('is_active', 1)->with('kelas:id,nama_kelas'),
        ])->orderBy('nama')->get();

        $fmt = fn($d) => $d ? \Carbon\Carbon::parse($d)->format('d/m/Y') : '';

        // ── bangun multi-sheet identik dengan export() ──────────────────
        $hUtama = [
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
        $rUtama = $gurus->map(fn($g, $i) => [
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

        $hKeluarga = [
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
            'Urutan Anak'
        ];
        $rKeluarga = [];
        foreach ($gurus as $g) {
            $kel = $g->keluarga;
            $anaks = $g->anaks;
            if (!$kel && $anaks->isEmpty())
                continue;
            $kelRow = [
                $g->nuptk,
                $g->nama,
                $kel?->status_perkawinan ?? '',
                $kel?->nama_pasangan ?? '',
                $kel?->nik_pasangan ?? '',
                $kel?->pekerjaan_pasangan ?? '',
                $kel?->jumlah_anak ?? ''
            ];
            if ($anaks->isEmpty()) {
                $rKeluarga[] = array_merge($kelRow, ['', '', '', '']);
            } else {
                foreach ($anaks as $ai => $anak) {
                    $rKeluarga[] = array_merge(
                        $ai === 0 ? $kelRow : [$g->nuptk, $g->nama, '', '', '', '', ''],
                        [$anak->nama, $anak->jenis_kelamin ?? '', $fmt($anak->tanggal_lahir), $anak->urutan ?? '']
                    );
                }
            }
        }

        $hRekening = [
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
            'Tunjangan Profesi'
        ];
        $rRekening = [];
        foreach ($gurus as $g) {
            $rek = $g->rekenings->first();
            $rRekening[] = [
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
                $rek?->tunjangan_profesi ?? ''
            ];
        }

        $hPendidikan = [
            'NUPTK',
            'Nama Guru',
            'Jenjang',
            'Nama Sekolah',
            'Jurusan',
            'Prodi',
            'Tahun Masuk',
            'Tahun Lulus',
            'No. Ijazah',
            'File Ijazah (path)'
        ];
        $rPendidikan = [];
        foreach ($gurus as $g) {
            foreach ($g->pendidikans as $p) {
                $rPendidikan[] = [
                    $g->nuptk,
                    $g->nama,
                    $p->jenjang,
                    $p->nama_sekolah,
                    $p->jurusan ?? '',
                    $p->prodi ?? '',
                    $p->tahun_masuk ?? '',
                    $p->tahun_lulus ?? '',
                    $p->no_ijazah ?? '',
                    $p->file_ijazah ?? ''
                ];
            }
        }

        $hSertifikasi = [
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
            'File Sertifikat (path)'
        ];
        $rSertifikasi = [];
        foreach ($gurus as $g) {
            foreach ($g->sertifikasis as $s) {
                $rSertifikasi[] = [
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
                    $s->file_sertifikat ?? ''
                ];
            }
        }

        $hDiklat = [
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
            'File Sertifikat Diklat (path)'
        ];
        $rDiklat = [];
        foreach ($gurus as $g) {
            foreach ($g->diklats as $d) {
                $rDiklat[] = [
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
                    $d->file_sertifikat ?? ''
                ];
            }
        }

        $hJabatan = [
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
            'Uraian Tugas'
        ];
        $rJabatan = [];
        foreach ($gurus as $g) {
            foreach ($g->jabatans as $j) {
                $rJabatan[] = [
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
                    $j->uraian_tugas ?? ''
                ];
            }
        }

        $hInpassing = [
            'NUPTK',
            'Nama Guru',
            'No. SK',
            'Tanggal SK',
            'TMT Inpassing',
            'Golongan Sesudah',
            'Jabatan Fungsional',
            'Angka Kredit',
            'File SK (path)'
        ];
        $rInpassing = [];
        foreach ($gurus as $g) {
            foreach ($g->inpassings as $inp) {
                $rInpassing[] = [
                    $g->nuptk,
                    $g->nama,
                    $inp->no_sk,
                    $fmt($inp->tanggal_sk),
                    $fmt($inp->tmt_inpassing),
                    $inp->golongan_sesudah ?? '',
                    $inp->jabatan_fungsional ?? '',
                    $inp->angka_kredit ?? '',
                    $inp->file_sk ?? ''
                ];
            }
        }

        $hMutasi = [
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
            'File SK Mutasi (path)'
        ];
        $rMutasi = [];
        foreach ($gurus as $g) {
            foreach ($g->mutasi as $m) {
                $rMutasi[] = [
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
                    $m->file_sk ?? ''
                ];
            }
        }

        $hKompetensi = ['NUPTK', 'Nama Guru', 'Jenis', 'Nama Kompetensi', 'Tingkat', 'Keterangan'];
        $rKompetensi = [];
        foreach ($gurus as $g) {
            foreach ($g->kompetensi as $k) {
                $rKompetensi[] = [
                    $g->nuptk,
                    $g->nama,
                    $k->jenis,
                    $k->nama,
                    $k->tingkat ?? '',
                    $k->keterangan ?? ''
                ];
            }
        }

        $hKontak = ['NUPTK', 'Nama Guru', 'Nama Kontak', 'Hubungan', 'No. HP', 'Alamat', 'Primary'];
        $rKontak = [];
        foreach ($gurus as $g) {
            foreach ($g->kontakDarurat as $kd) {
                $rKontak[] = [
                    $g->nuptk,
                    $g->nama,
                    $kd->nama,
                    $kd->hubungan,
                    $kd->no_hp,
                    $kd->alamat ?? '',
                    $kd->is_primary ? 'Ya' : 'Tidak'
                ];
            }
        }

        $hDokumen = [
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
            'Keterangan'
        ];
        $rDokumen = [];
        foreach ($gurus as $g) {
            foreach ($g->dokumens as $dok) {
                $rDokumen[] = [
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
                    $dok->keterangan ?? ''
                ];
            }
        }

        $sheets = [
            ['name' => 'Data Utama', 'headers' => $hUtama, 'rows' => $rUtama],
            ['name' => 'Keluarga & Anak', 'headers' => $hKeluarga, 'rows' => $rKeluarga],
            ['name' => 'Rekening', 'headers' => $hRekening, 'rows' => $rRekening],
            ['name' => 'Pendidikan', 'headers' => $hPendidikan, 'rows' => $rPendidikan],
            ['name' => 'Sertifikasi', 'headers' => $hSertifikasi, 'rows' => $rSertifikasi],
            ['name' => 'Diklat', 'headers' => $hDiklat, 'rows' => $rDiklat],
            ['name' => 'Jabatan', 'headers' => $hJabatan, 'rows' => $rJabatan],
            ['name' => 'Inpassing', 'headers' => $hInpassing, 'rows' => $rInpassing],
            ['name' => 'Mutasi', 'headers' => $hMutasi, 'rows' => $rMutasi],
            ['name' => 'Kompetensi', 'headers' => $hKompetensi, 'rows' => $rKompetensi],
            ['name' => 'Kontak Darurat', 'headers' => $hKontak, 'rows' => $rKontak],
            ['name' => 'Dokumen Umum', 'headers' => $hDokumen, 'rows' => $rDokumen],
        ];
        $xlsxBinary = $this->buildMultiSheetXlsx($sheets);

        // ── ZIP: xlsx + foto + semua file dokumen ───────────────────────
        $tmpFile = tempnam(sys_get_temp_dir(), 'backup_guru_');
        $zip = new \ZipArchive();
        $zip->open($tmpFile, \ZipArchive::OVERWRITE);
        $zip->addFromString('data_guru.xlsx', $xlsxBinary);

        // Foto profil
        foreach ($gurus as $guru) {
            if (!$guru->foto)
                continue;
            $path = storage_path('app/public/' . $guru->foto);
            if (file_exists($path)) {
                $ext = pathinfo($path, PATHINFO_EXTENSION);
                $zip->addFile($path, 'foto-guru/' . ($guru->nuptk ?? $guru->id) . '.' . $ext);
            }
        }

        // File ijazah (pendidikan)
        foreach ($gurus as $guru) {
            foreach ($guru->pendidikans as $p) {
                if (!$p->file_ijazah)
                    continue;
                $path = storage_path('app/public/' . $p->file_ijazah);
                if (file_exists($path)) {
                    $zip->addFile($path, 'file-ijazah/' . ($guru->nuptk ?? $guru->id) . '_' . $p->id . '.' . pathinfo($path, PATHINFO_EXTENSION));
                }
            }
        }

        // File sertifikat (sertifikasi)
        foreach ($gurus as $guru) {
            foreach ($guru->sertifikasis as $s) {
                if (!$s->file_sertifikat)
                    continue;
                $path = storage_path('app/public/' . $s->file_sertifikat);
                if (file_exists($path)) {
                    $zip->addFile($path, 'file-sertifikasi/' . ($guru->nuptk ?? $guru->id) . '_' . $s->id . '.' . pathinfo($path, PATHINFO_EXTENSION));
                }
            }
        }

        // File sertifikat diklat
        foreach ($gurus as $guru) {
            foreach ($guru->diklats as $d) {
                if (!$d->file_sertifikat)
                    continue;
                $path = storage_path('app/public/' . $d->file_sertifikat);
                if (file_exists($path)) {
                    $zip->addFile($path, 'file-diklat/' . ($guru->nuptk ?? $guru->id) . '_' . $d->id . '.' . pathinfo($path, PATHINFO_EXTENSION));
                }
            }
        }

        // File SK inpassing
        foreach ($gurus as $guru) {
            foreach ($guru->inpassings as $inp) {
                if (!$inp->file_sk)
                    continue;
                $path = storage_path('app/public/' . $inp->file_sk);
                if (file_exists($path)) {
                    $zip->addFile($path, 'file-inpassing/' . ($guru->nuptk ?? $guru->id) . '_' . $inp->id . '.' . pathinfo($path, PATHINFO_EXTENSION));
                }
            }
        }

        // File SK mutasi
        foreach ($gurus as $guru) {
            foreach ($guru->mutasi as $m) {
                if (!$m->file_sk)
                    continue;
                $path = storage_path('app/public/' . $m->file_sk);
                if (file_exists($path)) {
                    $zip->addFile($path, 'file-mutasi/' . ($guru->nuptk ?? $guru->id) . '_' . $m->id . '.' . pathinfo($path, PATHINFO_EXTENSION));
                }
            }
        }

        // Dokumen umum
        foreach ($gurus as $guru) {
            foreach ($guru->dokumens as $dok) {
                if (!$dok->file_path)
                    continue;
                $path = storage_path('app/public/' . $dok->file_path);
                if (file_exists($path)) {
                    $zip->addFile($path, 'file-dokumen/' . ($guru->nuptk ?? $guru->id) . '_' . $dok->id . '.' . pathinfo($path, PATHINFO_EXTENSION));
                }
            }
        }

        $totalGuru = count($gurus);
        $fileCount = $zip->numFiles;
        $manifest = [
            'versi' => '2.0',
            'aplikasi' => 'SIAKAD MI Nurul Huda 3',
            'tanggal' => now()->toIso8601String(),
            'jumlah_guru' => $totalGuru,
            'jumlah_file' => $fileCount,
            'checksum_xlsx' => md5($xlsxBinary),
            'dibuat_oleh' => auth()->user()?->name ?? 'system',
            'format' => 'backup_v2',
        ];
        $zip->addFromString('manifest.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $zip->addFromString(
            'README.txt',
            "BACKUP DATA GURU - " . now()->format('d/m/Y H:i:s') . "\r\n"
            . "SIAKAD MI Nurul Huda 3\r\n\r\n"
            . "Isi backup:\r\n"
            . "  data_guru.xlsx       — {$totalGuru} guru, 12 sheet (data lengkap)\r\n"
            . "  foto-guru/           — foto profil guru\r\n"
            . "  file-ijazah/         — scan ijazah (dari riwayat pendidikan)\r\n"
            . "  file-sertifikasi/    — file sertifikat pendidik\r\n"
            . "  file-diklat/         — sertifikat pelatihan/diklat\r\n"
            . "  file-inpassing/      — SK inpassing\r\n"
            . "  file-mutasi/         — SK mutasi\r\n"
            . "  file-dokumen/        — dokumen umum guru\r\n\r\n"
            . "Nama file: <nuptk>_<id>.<ext>\r\n"
            . "Referensi path ada di kolom 'File * (path)' di masing-masing sheet xlsx.\r\n"
        );
        $zip->close();

        $zipBinary = file_get_contents($tmpFile);
        unlink($tmpFile);

        $filename = 'backup_guru_' . now()->format('Ymd_His') . '.zip';
        return response($zipBinary, 200, [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Content-Length' => strlen($zipBinary),
            'Cache-Control' => 'no-cache',
        ]);
    }

    // ── Private: Multi-Sheet XLSX Builder ─────────────────────────────
    private function buildMultiSheetXlsx(array $sheets): string
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $spreadsheet->removeSheetByIndex(0); // hapus sheet default

        foreach ($sheets as $si => $sheet) {
            $ws = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, $sheet['name']);
            $spreadsheet->addSheet($ws, $si);

            // Header row
            foreach ($sheet['headers'] as $ci => $header) {
                $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($ci + 1);
                $cell = $ws->getCell("{$col}1");
                $cell->setValue($header);
                // Style header: bold, background ungu, teks putih
                $cell->getStyle()->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '5B21B6']],
                    'alignment' => ['horizontal' => 'center'],
                ]);
            }

            // Data rows
            foreach ($sheet['rows'] as $ri => $row) {
                $rowNum = $ri + 2;
                $bg = $ri % 2 === 0 ? 'FFFFFF' : 'F5F3FF';
                foreach ($row as $ci => $val) {
                    $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($ci + 1);
                    $cell = $ws->getCell("{$col}{$rowNum}");
                    $cell->setValueExplicit((string) $val, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                    $cell->getStyle()->getFill()->setFillType('solid')->getStartColor()->setRGB($bg);
                }
            }

            // Auto width
            foreach (range(1, count($sheet['headers'])) as $colIdx) {
                $ws->getColumnDimensionByColumn($colIdx)->setAutoSize(true);
            }
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        return ob_get_clean();
    }
    private function parseMultiSheetXlsx(string $filePath): array
    {
        $zip = new \ZipArchive();
        if ($zip->open($filePath) !== true)
            return [];

        // shared strings
        $sharedStrings = [];
        $ssXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($ssXml !== false) {
            $ss = simplexml_load_string($ssXml);
            foreach ($ss->si as $si) {
                $t = '';
                foreach ($si->r as $r)
                    $t .= (string) $r->t;
                if ($t === '' && isset($si->t))
                    $t = (string) $si->t;
                $sharedStrings[] = $t;
            }
        }

        // workbook — get sheet names & targets
        $wbXml = $zip->getFromName('xl/workbook.xml');
        $wbRelsXml = $zip->getFromName('xl/_rels/workbook.xml.rels');
        $sheetList = [];

        if ($wbXml && $wbRelsXml) {
            $wb = simplexml_load_string($wbXml);
            $wbRels = simplexml_load_string($wbRelsXml);

            $relMap = [];
            foreach ($wbRels->Relationship as $rel) {
                $relMap[(string) $rel['Id']] = (string) $rel['Target'];
            }

            $ns = $wb->getNamespaces(true);
            $rNs = $ns['r'] ?? 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

            foreach ($wb->sheets->sheet as $sheet) {
                $rId = (string) $sheet->attributes($rNs)['id'];
                $target = $relMap[$rId] ?? null;
                if (!$target)
                    continue;
                // target could be "worksheets/sheet1.xml" or absolute
                $path = (strpos($target, '/') === 0) ? ltrim($target, '/') : 'xl/' . $target;
                $sheetList[] = ['name' => (string) $sheet['name'], 'path' => $path];
            }
        } else {
            // fallback: try sheet1..sheetN
            for ($i = 1; $i <= 15; $i++) {
                $path = "xl/worksheets/sheet{$i}.xml";
                if ($zip->getFromName($path) !== false) {
                    $sheetList[] = ['name' => "Sheet{$i}", 'path' => $path];
                }
            }
        }

        $result = [];
        foreach ($sheetList as $sheetMeta) {
            $sheetXml = $zip->getFromName($sheetMeta['path']);
            if ($sheetXml === false)
                continue;

            $sheet = simplexml_load_string($sheetXml);
            $rows = [];
            foreach ($sheet->sheetData->row as $row) {
                $rowArr = [];
                $maxCol = 0;
                foreach ($row->c as $cell) {
                    $ref = (string) $cell['r'];
                    $colLetter = preg_replace('/[0-9]/', '', $ref);
                    $colIdx = $this->colLetterToIndex($colLetter);
                    $maxCol = max($maxCol, $colIdx);
                    $t = (string) $cell['t'];
                    $val = isset($cell->v) ? (string) $cell->v : '';
                    if ($t === 's' && $val !== '')
                        $val = $sharedStrings[(int) $val] ?? '';
                    $rowArr[$colIdx] = $val;
                }
                for ($i = 0; $i <= $maxCol; $i++) {
                    if (!isset($rowArr[$i]))
                        $rowArr[$i] = '';
                }
                ksort($rowArr);
                $rows[] = array_values($rowArr);
            }
            $result[] = ['name' => $sheetMeta['name'], 'rows' => $rows];
        }

        $zip->close();
        return $result;
    }


    private function indexToColLetter(int $index): string
    {
        $letter = '';
        $index++;
        while ($index > 0) {
            $index--;
            $letter = chr(65 + ($index % 26)) . $letter;
            $index = intdiv($index, 26);
        }
        return $letter;
    }

    private function colLetterToIndex(string $col): int
    {
        $col = strtoupper($col);
        $index = 0;
        for ($i = 0; $i < strlen($col); $i++) {
            $index = $index * 26 + (ord($col[$i]) - 64);
        }
        return $index - 1;
    }
}
