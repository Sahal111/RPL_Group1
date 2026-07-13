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

    protected $fillable = [
        'user_id',
        'nuptk',
        'nip',
        'nik',
        'nama',
        'jenis_kelamin',
        'tanggal_lahir',
        'tempat_lahir',
        'agama',
        'jenis_ptk',
        'status_kepegawaian',
        'status_aktif',
        'no_hp',
        'email',
        'alamat_jalan',
        'rt',
        'rw',
        'desa_kelurahan',
        'kecamatan',
        'kota_kabupaten',
        'provinsi',
        'kode_pos',
        'foto',
        'tanggal_bergabung',
    ];

    protected $casts = ['status_aktif' => 'boolean'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function kelas()
    {
        return $this->hasMany(Kelas::class, 'wali_kelas_id');
    }
}