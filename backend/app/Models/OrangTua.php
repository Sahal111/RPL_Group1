<?php

namespace App\Models;

use App\Casts\EncryptedString;
use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrangTua extends Model
{
    use SoftDeletes, HasSchoolScope;

    protected $table = 'orang_tuas';

    protected $fillable = [
        'school_id',
        'user_id',
        'nama',
        'nik',
        'hubungan',
        'status',
        'status_hidup',
        'tempat_lahir',
        'tahun_lahir',
        'jenis_kelamin',
        'agama',
        'kewarganegaraan',
        'kebutuhan_khusus',
        'pendidikan',
        'pekerjaan',
        'penghasilan',
        'no_hp',
        'email',
        'alamat',
    ];

    protected $hidden = [
        'nik',  // NIK sensitif
    ];

    protected $casts = [
        // PII — UU PDP No. 27/2022: wajib dienkripsi
        'nik' => EncryptedString::class,
        'no_kk' => EncryptedString::class,
        'tahun_lahir' => 'integer',
    ];

    // ── Relasi ──────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function siswa()
    {
        return $this->belongsToMany(Siswa::class, 'orang_tua_siswa', 'orang_tua_id', 'siswa_id')
            ->withTimestamps();
    }
}