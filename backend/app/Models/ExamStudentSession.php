<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class ExamStudentSession extends Model
{
    use HasSchoolScope;

    protected $table = 'exam_student_sessions';

    protected $fillable = [
        'school_id',
        'exam_id',
        'siswa_id',
        'mulai_at',
        'selesai_at',
        'status',
        'skor_mentah',
        'nilai_akhir',
        'lulus',
        'dinilai_at',
        'urutan_soal',
    ];

    protected $casts = [
        'mulai_at' => 'datetime',
        'selesai_at' => 'datetime',
        'dinilai_at' => 'datetime',
        'skor_mentah' => 'decimal:2',
        'nilai_akhir' => 'decimal:2',
        'lulus' => 'boolean',
        'urutan_soal' => 'array',
    ];

    // ── Relasi ───────────────────────────────────────────────

    public function exam()
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    // ── Scope ────────────────────────────────────────────────

    public function scopeSelesai($query)
    {
        return $query->where('status', 'selesai');
    }

    public function scopeSedangDikerjakan($query)
    {
        return $query->where('status', 'aktif');
    }
}