<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Guru extends Model
{
    use SoftDeletes;

    protected $table = 'gurus';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $appends = ['nama_lengkap'];
    protected $fillable = [
        // Identitas
        'user_id',
        'nuptk',
        'nip',
        'nip_lama',
        'no_karpeg',
        'no_karis_karsu',
        'nik',
        'no_kk',
        'nama',
        'gelar_depan',
        'gelar_belakang',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'golongan_darah',
        'agama',
        'kewarganegaraan',
        'status_hidup',
        'nama_ibu_kandung',
        // Kontak
        'no_hp',
        'no_wa',
        'email',
        // Alamat
        'alamat_jalan',
        'rt',
        'rw',
        'dusun',
        'desa_kelurahan',
        'kecamatan',
        'kota_kabupaten',
        'provinsi',
        'kode_pos',
        // Kepegawaian
        'jenis_ptk',
        'status_kepegawaian',
        'status_aktif',
        'status_keaktifan',
        'tanggal_bergabung',
        'tmt_pns',
        'tmt_gty',
        'no_sk_pengangkatan',
        'tgl_sk_pengangkatan',
        'instansi_pengangkat',
        'masa_kerja_tahun',
        // Foto & verifikasi
        'foto',
        'is_verified',
        'verified_at',
        'verified_by',
        // Audit
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'status_aktif' => 'boolean',
        'is_verified' => 'boolean',
        'tanggal_lahir' => 'date',
        'tanggal_bergabung' => 'date',
        'tmt_pns' => 'date',
        'tmt_gty' => 'date',
        'tgl_sk_pengangkatan' => 'date',
        'verified_at' => 'datetime',
    ];
    protected static function booted(): void
    {
        // Saat guru baru dibuat — isi created_by
        static::creating(function (Guru $guru) {
            if (empty($guru->created_by) && auth()->check()) {
                $guru->created_by = auth()->id();
            }
            // is_verified default 0 sudah dari DB, tapi eksplisitkan
            if (!isset($guru->is_verified)) {
                $guru->is_verified = false;
            }
        });

        // Saat data guru diupdate — isi updated_by
        static::updating(function (Guru $guru) {
            if (auth()->check()) {
                $guru->updated_by = auth()->id();
            }
        });

        // Saat guru di-soft delete — isi deleted_by
        static::deleting(function (Guru $guru) {
            if (auth()->check()) {
                $guru->deleted_by = auth()->id();
                $guru->saveQuietly(); // save deleted_by dulu sebelum soft delete
            }
        });
    }
    
    // ── Accessor ─────────────────────────────────────────────

    public function getNamaLengkapAttribute(): string
    {
        $depan = $this->gelar_depan ? $this->gelar_depan . ' ' : '';
        $belakang = $this->gelar_belakang ? ', ' . $this->gelar_belakang : '';
        return $depan . $this->nama . $belakang;
    }

    // ── Relasi: Akun & Sistem ────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // ── Relasi: Mengajar ─────────────────────────────────────

    public function kelasWali()
    {
        return $this->hasMany(Kelas::class, 'wali_kelas_id');
    }

    public function kelas() // alias backward-compat
    {
        return $this->kelasWali();
    }

    public function plotGuruMapels()
    {
        return $this->hasMany(PlotGuruMapel::class, 'guru_id');
    }

    public function jadwals()
    {
        return $this->hasMany(JadwalPelajaran::class, 'guru_id');
    }

    public function waliKelas()
    {
        return $this->hasMany(UserWaliKelas::class, 'guru_id');
    }

    // ── Relasi: Data Lengkap Guru ────────────────────────────

    public function keluarga()
    {
        return $this->hasOne(GuruKeluarga::class, 'guru_id');
    }

    public function anaks()
    {
        return $this->hasMany(GuruAnak::class, 'guru_id')->orderBy('urutan');
    }

    public function kontakDarurat()
    {
        return $this->hasMany(GuruKontakDarurat::class, 'guru_id');
    }

    public function pendidikans()
    {
        return $this->hasMany(GuruPendidikan::class, 'guru_id')->orderByDesc('tahun_lulus');
    }

    public function pendidikanTerakhir()
    {
        return $this->hasOne(GuruPendidikan::class, 'guru_id')->latestOfMany('tahun_lulus');
    }

    public function sertifikasis()
    {
        return $this->hasMany(GuruSertifikasi::class, 'guru_id');
    }

    public function jabatans()
    {
        return $this->hasMany(GuruJabatan::class, 'guru_id')->orderByDesc('tmt_jabatan');
    }

    public function jabatanAktif()
    {
        return $this->hasOne(GuruJabatan::class, 'guru_id')->where('is_current', 1);
    }

    public function dokumens()
    {
        return $this->hasMany(GuruDokumen::class, 'guru_id');
    }

    public function rekenings()
    {
        return $this->hasMany(GuruRekening::class, 'guru_id');
    }

    public function rekeningUtama()
    {
        return $this->hasOne(GuruRekening::class, 'guru_id')->where('is_primary', 1);
    }

    public function kompetensi()
    {
        return $this->hasMany(GuruKompetensi::class, 'guru_id');
    }

    public function diklats()
    {
        return $this->hasMany(GuruDiklat::class, 'guru_id')->orderByDesc('tanggal_mulai');
    }

    public function mutasi()
    {
        return $this->hasMany(GuruMutasi::class, 'guru_id')->orderByDesc('tanggal_mutasi');
    }

    public function pkgs()
    {
        return $this->hasMany(GuruPkg::class, 'guru_id')->orderByDesc('tanggal_penilaian');
    }

    public function absensis()
    {
        return $this->hasMany(GuruAbsensi::class, 'guru_id');
    }

    public function inpassings()
    {
        return $this->hasMany(GuruInpassing::class, 'guru_id');
    }
}