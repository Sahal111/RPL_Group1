<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuruImportLog extends Model
{
    protected $table = 'guru_import_logs';

    protected $fillable = [
        'user_id',
        'batch_id',
        'tipe',
        'nama_file',
        'status',
        'mode_duplikat',
        'total_baris',
        'jumlah_insert',
        'jumlah_update',
        'jumlah_skip',
        'jumlah_gagal',
        'progress_persen',
        'error_detail',
        'statistik_relasi',
        'preview_data',
        'column_mapping',
        'ip_address',
        'durasi_detik',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'error_detail' => 'array',
        'statistik_relasi' => 'array',
        'preview_data' => 'array',
        'column_mapping' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}