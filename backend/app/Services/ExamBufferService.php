<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;

/**
 * ExamBufferService — Redis Buffer untuk Jawaban CBT
 *
 * MASALAH YANG DISELESAIKAN:
 * Saat ujian serentak (ratusan siswa menjawab dalam detik yang sama),
 * setiap `jawab()` request langsung menulis ke MySQL → lock contention tinggi
 * pada tabel exam_answers.
 *
 * SOLUSI:
 * Jawaban siswa disimpan dulu ke Redis Hash (in-memory, microsecond latency),
 * lalu di-flush ke MySQL secara batch setiap 30 detik via job queue.
 * Submit akhir siswa tetap langsung ke MySQL untuk konsistensi.
 *
 * STRUKTUR DATA DI REDIS:
 *
 *   Hash  cbt:answers:{session_id}
 *         field = question_id
 *         value = JSON {jawaban, dijawab_at, is_correct, skor, school_id}
 *         TTL   = durasi_ujian + 2 jam (safety margin)
 *
 *   Set   cbt:dirty_sessions
 *         member = session_id yang sudah di-update tapi belum di-flush ke MySQL
 *
 *   Hash  cbt:session_meta:{session_id}
 *         field = school_id, exam_id, siswa_id, durasi_menit, mulai_at
 *         TTL   = sama dengan answers hash
 *
 * ALUR:
 *   1. siswa jawab soal → ExamBufferService::buffer()
 *      → simpan ke Redis Hash, tambahkan session_id ke dirty_sessions
 *   2. FlushExamBuffer Job jalan tiap 30 detik
 *      → baca semua dirty_sessions, upsert ke MySQL, clear dari dirty set
 *   3. siswa submit → ExamController::submit()
 *      → ExamBufferService::flushSession() sync, hapus dari Redis
 */
class ExamBufferService
{
    /**
     * Prefix key Redis. Dipisah dari prefix global app supaya mudah di-inspect.
     */
    const KEY_ANSWERS  = 'cbt:answers:';
    const KEY_META     = 'cbt:session_meta:';
    const KEY_DIRTY    = 'cbt:dirty_sessions';

    /**
     * Extra TTL setelah ujian selesai (detik).
     * Memberi jendela waktu untuk flush terakhir setelah waktu ujian habis.
     */
    const TTL_BUFFER_EXTRA = 7200; // 2 jam

    // ─────────────────────────────────────────────────────────────────

    /**
     * Simpan jawaban siswa ke Redis buffer.
     * Dipanggil dari ExamController::jawab() — TIDAK menulis ke MySQL.
     *
     * @param  int         $sessionId   exam_student_sessions.id
     * @param  int         $questionId  exam_questions.id
     * @param  array       $payload     {jawaban, is_correct, skor, school_id, dijawab_at}
     * @param  int         $ttlDetik    TTL Redis = sisa durasi ujian + buffer
     */
    public function buffer(
        int   $sessionId,
        int   $questionId,
        array $payload,
        int   $ttlDetik,
    ): void {
        $answersKey = self::KEY_ANSWERS . $sessionId;

        // Simpan jawaban ke Hash field = question_id
        Redis::hset($answersKey, $questionId, json_encode($payload));

        // Set/refresh TTL pada hash (reset setiap ada jawaban baru)
        Redis::expire($answersKey, $ttlDetik + self::TTL_BUFFER_EXTRA);

        // Tandai session ini sebagai dirty (perlu di-flush)
        Redis::sadd(self::KEY_DIRTY, $sessionId);
    }

    /**
     * Simpan metadata session ke Redis.
     * Dipanggil satu kali saat siswa mulai ujian (ExamController::mulai).
     * Dipakai oleh FlushExamBuffer untuk tahu school_id dst tanpa query MySQL.
     */
    public function setSessionMeta(
        int   $sessionId,
        int   $schoolId,
        int   $examId,
        int   $siswaId,
        int   $durasiMenit,
        string $mulaiAt,
    ): void {
        $metaKey = self::KEY_META . $sessionId;
        $ttl     = ($durasiMenit * 60) + self::TTL_BUFFER_EXTRA;

        Redis::hmset($metaKey, [
            'school_id'     => $schoolId,
            'exam_id'       => $examId,
            'siswa_id'      => $siswaId,
            'durasi_menit'  => $durasiMenit,
            'mulai_at'      => $mulaiAt,
        ]);

        Redis::expire($metaKey, $ttl);
    }

    /**
     * Ambil semua jawaban dari Redis untuk satu session.
     * Return: array [question_id => payload_array]
     */
    public function getBufferedAnswers(int $sessionId): array
    {
        $raw = Redis::hgetall(self::KEY_ANSWERS . $sessionId);

        if (empty($raw)) {
            return [];
        }

        $result = [];
        foreach ($raw as $questionId => $json) {
            $result[(int) $questionId] = json_decode($json, true);
        }

        return $result;
    }

    /**
     * Flush jawaban satu session dari Redis ke MySQL — synchronous.
     * Dipanggil saat submit (harus konsisten sebelum return response).
     *
     * @return int Jumlah baris yang di-upsert
     */
    public function flushSession(int $sessionId): int
    {
        $answers = $this->getBufferedAnswers($sessionId);

        if (empty($answers)) {
            return 0;
        }

        $meta    = Redis::hgetall(self::KEY_META . $sessionId);
        $schoolId = (int) ($meta['school_id'] ?? 0);
        $count   = 0;

        foreach ($answers as $questionId => $payload) {
            \DB::table('exam_answers')->upsert(
                [
                    'school_id'   => $schoolId ?: ($payload['school_id'] ?? null),
                    'session_id'  => $sessionId,
                    'question_id' => $questionId,
                    'jawaban'     => is_array($payload['jawaban'])
                        ? json_encode($payload['jawaban'])
                        : $payload['jawaban'],
                    'is_correct'  => $payload['is_correct'] ?? null,
                    'skor'        => $payload['skor'] ?? null,
                    'dijawab_at'  => $payload['dijawab_at'] ?? now(),
                    'created_at'  => $payload['dijawab_at'] ?? now(),
                    'updated_at'  => now(),
                ],
                uniqueBy: ['school_id', 'session_id', 'question_id'],
                update:   ['jawaban', 'is_correct', 'skor', 'dijawab_at', 'updated_at'],
            );
            $count++;
        }

        // Hapus dari Redis setelah berhasil flush
        $this->clearSession($sessionId);

        return $count;
    }

    /**
     * Ambil semua session ID yang perlu di-flush (set dirty_sessions).
     *
     * @return int[]
     */
    public function getDirtySessions(): array
    {
        $members = Redis::smembers(self::KEY_DIRTY);
        return array_map('intval', $members ?: []);
    }

    /**
     * Hapus session dari dirty set dan Redis setelah flush berhasil.
     */
    public function clearSession(int $sessionId): void
    {
        Redis::del(self::KEY_ANSWERS . $sessionId);
        Redis::del(self::KEY_META . $sessionId);
        Redis::srem(self::KEY_DIRTY, $sessionId);
    }

    /**
     * Hapus session dari dirty set saja (tanpa hapus buffer).
     * Dipakai setelah batch flush berhasil — buffer dihapus terpisah.
     */
    public function markFlushed(int $sessionId): void
    {
        Redis::srem(self::KEY_DIRTY, $sessionId);
    }

    /**
     * Cek apakah session masih punya buffer di Redis.
     * Berguna untuk fallback: jika Redis down, controller bisa langsung ke MySQL.
     */
    public function hasBuffer(int $sessionId): bool
    {
        return (bool) Redis::exists(self::KEY_ANSWERS . $sessionId);
    }

    /**
     * Jumlah jawaban yang sedang di-buffer untuk satu session.
     * Dipakai di monitoring/debug endpoint.
     */
    public function getBufferCount(int $sessionId): int
    {
        return (int) Redis::hlen(self::KEY_ANSWERS . $sessionId);
    }

    /**
     * Jumlah total session yang sedang dirty (belum di-flush).
     * Dipakai untuk health check / monitoring.
     */
    public function getDirtyCount(): int
    {
        return (int) Redis::scard(self::KEY_DIRTY);
    }
}
