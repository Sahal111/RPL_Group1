<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuruDokumenLog extends Model
{
    protected $table = 'guru_dokumen_logs';
    // Hanya menyimpan created_at, tidak ada updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'guru_dokumen_id',
        'user_id',
        'aksi',
        'keterangan',
        'ip_address',
        'user_agent',
    ];

    public function dokumen()
    {
        return $this->belongsTo(GuruDokumen::class, 'guru_dokumen_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}