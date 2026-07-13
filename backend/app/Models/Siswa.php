<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Siswa extends Model
{
    use SoftDeletes;

    protected $table = 'siswas';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'nisn',
        'nis',
        'nik',
        'no_kk',
        'nama_kepala_keluarga',
        'kode_anak',
        'nama',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'agama',
        'golongan_darah',
        'kewarganegaraan',
        'nama_ibu_kandung',
        'anak_ke',
        'jumlah_saudara',
        'status_dalam_keluarga',
        'pembiaya_sekolah',
        'kebutuhan_khusus',
        'riwayat_penyakit',
        'imunisasi',
        'alamat_jalan',
        'rt',
        'rw',
        'desa_kelurahan',
        'kecamatan',
        'kota_kabupaten',
        'provinsi',
        'kode_pos',
        'jarak_tempat_tinggal',
        'waktu_tempuh',
        'moda_transportasi',
        'asal_sekolah',
        'tanggal_masuk',
        'tingkat',
        'status',
        'foto',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'anak_ke' => 'integer',
        'jumlah_saudara' => 'integer',
        'tingkat' => 'integer',
        'waktu_tempuh' => 'integer',
        'jarak_tempat_tinggal' => 'decimal:2',
        'tanggal_lahir' => 'date',
        'tanggal_masuk' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (Siswa $siswa) {
            if (empty($siswa->kode_anak)) {
                $siswa->kode_anak = static::generateKodeAnak();
            }
        });
    }

    public static function generateKodeAnak(): string
    {
        do {
            $kode = strtoupper(\Illuminate\Support\Str::random(10));
        } while (static::where('kode_anak', $kode)->exists());

        return $kode;
    }

    // ── Relasi ──────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function riwayatKelas()
    {
        return $this->hasMany(RiwayatKelas::class, 'siswa_id');
    }

    // Alias backward-compat
    public function kelas()
    {
        return $this->riwayatKelas();
    }

    public function kelasAktif()
    {
        return $this->belongsToMany(Kelas::class, 'riwayat_kelas', 'siswa_id', 'kelas_id')
            ->whereNull('riwayat_kelas.tanggal_keluar')
            ->whereNotIn('riwayat_kelas.jenis_perubahan', ['mutasi_keluar', 'lulus', 'nonaktif', 'meninggal'])
            ->where('kelas.is_active', 1)
            ->withPivot('no_absen', 'tanggal_masuk', 'tanggal_keluar', 'jenis_perubahan', 'nama_kelas_snapshot');
    }

    public function orangTua()
    {
        return $this->belongsToMany(OrangTua::class, 'orang_tua_siswa', 'siswa_id', 'orang_tua_id')
            ->withTimestamps();
    }

    public function absensis()
    {
        return $this->hasMany(Absensi::class, 'siswa_id');
    }
}