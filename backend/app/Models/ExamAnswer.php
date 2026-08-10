<?php

namespace App\Models;

use App\Traits\HasSchoolScope;
use Illuminate\Database\Eloquent\Model;

class ExamAnswer extends Model
{
    use HasSchoolScope;

    protected $table = 'exam_answers';

    protected $fillable = [
        'school_id',
        'session_id',
        'question_id',
        'jawaban',
        'file_path',
        'is_correct',
        'skor',
        'feedback',
        'dijawab_at',
    ];

    protected $casts = [
        'jawaban' => 'array',
        'is_correct' => 'boolean',
        'skor' => 'decimal:2',
        'dijawab_at' => 'datetime',
    ];

    // ── Relasi ───────────────────────────────────────────────

    public function session()
    {
        return $this->belongsTo(ExamStudentSession::class, 'session_id');
    }

    public function question()
    {
        return $this->belongsTo(ExamQuestion::class, 'question_id');
    }

    // ── Scope ────────────────────────────────────────────────

    public function scopeBenar($query)
    {
        return $query->where('is_correct', true);
    }

    public function scopeBelumDinilai($query)
    {
        return $query->whereNull('is_correct');
    }
}