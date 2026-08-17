<?php

use App\Http\Controllers\Lms\AssignmentController;
use App\Http\Controllers\Lms\CourseMaterialController;
use App\Http\Controllers\Lms\ExamController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| LMS Routes — Learning Management System
|--------------------------------------------------------------------------
|
| Semua route di sini membutuhkan auth:sanctum.
|
| Role yang terlibat:
|   Guru / Wali Kelas → buat & kelola materi, tugas, ujian
|   Siswa             → akses materi published, kumpulkan tugas, kerjakan ujian
|   Operator          → akses monitoring LMS
|
| Prefix: /lms
|
*/

Route::middleware(['auth:sanctum'])->prefix('lms')->group(function () {

    // ══════════════════════════════════════════════════════════════════════
    // GURU & OPERATOR — Kelola Materi, Tugas, Ujian
    // ══════════════════════════════════════════════════════════════════════

    Route::middleware(['role:guru,wali_kelas,operator'])
        ->group(function () {

        // ── MATERI (Course Materials) ──────────────────────────────────────
        Route::prefix('materi')->group(function () {
            Route::get('/', [CourseMaterialController::class, 'index']);
            Route::post('/', [CourseMaterialController::class, 'store']);
            Route::get('/{id}', [CourseMaterialController::class, 'show']);
            Route::put('/{id}', [CourseMaterialController::class, 'update']);
            Route::delete('/{id}', [CourseMaterialController::class, 'destroy']);
            Route::patch('/{id}/toggle-publish', [CourseMaterialController::class, 'togglePublish']);
        });

        // ── TUGAS (Assignments) ────────────────────────────────────────────
        Route::prefix('tugas')->group(function () {
            Route::get('/', [AssignmentController::class, 'index']);
            Route::post('/', [AssignmentController::class, 'store']);
            Route::get('/{id}', [AssignmentController::class, 'show']);
            Route::put('/{id}', [AssignmentController::class, 'update']);
            Route::delete('/{id}', [AssignmentController::class, 'destroy']);
            Route::patch('/{id}/toggle-publish', [AssignmentController::class, 'togglePublish']);

            // Submission management — guru lihat & nilai
            Route::get('/{id}/submissions', [AssignmentController::class, 'submissions']);
            Route::post('/{id}/submissions/{submissionId}/nilai', [AssignmentController::class, 'nilaiSubmission']);
        });

        // ── UJIAN (Exams) ──────────────────────────────────────────────────
        Route::prefix('ujian')->group(function () {
            Route::get('/', [ExamController::class, 'index']);
            Route::post('/', [ExamController::class, 'store']);
            Route::get('/{id}', [ExamController::class, 'show']);
            Route::put('/{id}', [ExamController::class, 'update']);
            Route::delete('/{id}', [ExamController::class, 'destroy']);
            Route::patch('/{id}/toggle-publish', [ExamController::class, 'togglePublish']);

            // Kelola Soal
            Route::post('/{id}/soal', [ExamController::class, 'storeQuestion']);
            Route::put('/{id}/soal/{questionId}', [ExamController::class, 'updateQuestion']);
            Route::delete('/{id}/soal/{questionId}', [ExamController::class, 'destroyQuestion']);

            // Monitoring & Penilaian
            Route::get('/{id}/sessions', [ExamController::class, 'sessions']);
            Route::post('/{id}/sessions/{sessionId}/nilai-esai', [ExamController::class, 'nilaiEsai']);
        });
    });

    // ══════════════════════════════════════════════════════════════════════
    // SISWA — Akses Materi & Kerjakan Tugas/Ujian
    // ══════════════════════════════════════════════════════════════════════

    Route::middleware(['role:siswa'])->prefix('siswa')->group(function () {

        // ── MATERI ────────────────────────────────────────────────────────
        // Siswa hanya bisa akses materi yang sudah dipublish
        Route::get('/materi', [CourseMaterialController::class, 'index']);
        Route::get('/materi/{id}', [CourseMaterialController::class, 'show']);

        // ── TUGAS ─────────────────────────────────────────────────────────
        // Siswa lihat detail tugas + status pengumpulan dirinya
        Route::get('/tugas/{id}', [AssignmentController::class, 'showForSiswa']);
        // Siswa kumpulkan tugas
        Route::post('/tugas/{id}/submit', [AssignmentController::class, 'submit']);

        // ── UJIAN ─────────────────────────────────────────────────────────
        // Siswa mulai mengerjakan ujian → buat session
        Route::post('/ujian/{id}/mulai', [ExamController::class, 'mulai']);
        // Siswa simpan jawaban per soal
        Route::post('/ujian/{id}/sessions/{sessionId}/jawab', [ExamController::class, 'jawab']);
        // Siswa submit (selesaikan) ujian
        Route::post('/ujian/{id}/sessions/{sessionId}/submit', [ExamController::class, 'submit']);
    });
});