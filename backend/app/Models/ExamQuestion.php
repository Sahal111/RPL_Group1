<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class ExamQuestion extends Model
{
    use HasSchoolScope;

    protected $table = 'exam_questions';

    protected $fillable = [
        'school_id',
        'exam_id',
        'pertanyaan',
        'gambar',
        'tipe',
        'bobot',
        'pembahasan',
    ];

    protected $casts = [
        'bobot' => 'decimal:2',
    ];

    // ── Relasi ───────────────────────────────────────────────

    public function exam()
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }
}