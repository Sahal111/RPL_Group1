<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RiwayatKelas extends Model
{
    use SoftDeletes;

    protected $table = 'riwayat_kelas';

    protected $fillable = [
        'siswa_id',
        'kelas_id',
        'nama_kelas_snapshot',
        'tahun_ajaran_id',
        'semester_id',
        'no_absen',
        'tanggal_masuk',
        'tanggal_keluar',
        'jenis_perubahan',
        'catatan',
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
        'tanggal_keluar' => 'date',
        'no_absen' => 'integer',
    ];

    // ── Relasi ──────────────────────────────────────────────

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }

    // ── Scopes ──────────────────────────────────────────────

    /**
     * Siswa yang masih aktif di kelas (belum keluar)
     */
    public function scopeAktif($query)
    {
        return $query->whereNull('tanggal_keluar')
            ->whereNotIn('jenis_perubahan', [
                'mutasi_keluar',
                'lulus',
                'nonaktif',
                'meninggal',
            ]);
    }
}