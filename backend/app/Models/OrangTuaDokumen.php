<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrangTuaDokumen extends Model
{
    protected $table = 'orang_tua_dokumen';
    public $timestamps = false;

    protected $fillable = ['id_ortu', 'jenis_dokumen', 'nama_file', 'path_file', 'uploaded_at'];

    protected $casts = ['uploaded_at' => 'datetime'];

    public function orangTua()
    {
        return $this->belongsTo(OrangTua::class, 'id_ortu');
    }
}