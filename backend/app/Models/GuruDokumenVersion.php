<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuruDokumenVersion extends Model
{
    protected $table = 'guru_dokumen_versions';

    protected $fillable = [
        'guru_dokumen_id',
        'versi',
        'file_path',
        'file_type',
        'file_size',
        'file_hash',
        'original_filename',
        'uploaded_by',
        'catatan',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'versi' => 'integer',
    ];

    public function dokumen()
    {
        return $this->belongsTo(GuruDokumen::class, 'guru_dokumen_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}