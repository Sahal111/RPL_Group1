<?php

namespace App\Http\Controllers\Lms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lms\StoreExamRequest;
use App\Http\Requests\Lms\UpdateExamRequest;
use App\Http\Requests\Lms\StoreExamQuestionRequest;
use App\Http\Requests\Lms\SubmitExamAnswerRequest;
use App\Http\Requests\Lms\NilaiEsaiRequest;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\ExamStudentSession;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    use ApiResponse;

    // ── GURU: Kelola Ujian ────────────────────────────────────────────

    public function index(Request $request)
    {
        $query = Exam::with([
            'mapel:id,nama_mapel',
            'kelas:id,nama_kelas',
            'semester:id,nama',
        ])
            ->when($request->mapel_id, fn($q) => $q->where('mapel_id', $request->mapel_id))
            ->when($request->kelas_id, fn($q) => $q->where('kelas_id', $request->kelas_id))
            ->when($request->semester_id, fn($q) => $q->where('semester_id', $request->semester_id))
            ->when($request->tipe, fn($q) => $q->where('tipe', $request->tipe))
            ->when(
                $request->filled('is_published'),
                fn($q) =>
                $q->where('is_published', $request->boolean('is_published'))
            )
            ->when(
                $request->search,
                fn($q) =>
                $q->where('judul', 'like', "%{$request->search}%")
            )
            ->withCount(['questions', 'sessions'])
            ->latest();

        $data = $request->boolean('all')
            ? $query->get()
            : $query->paginate(15);

        return $this->success($data);
    }

    public function store(StoreExamRequest $request)
    {
        $validated = $request->validated();
        $validated['guru_id'] = auth()->user()->guru?->id;
        $validated['created_by'] = auth()->id();

        $ujian = Exam::create($validated);

        return $this->created(
            $ujian->load(['mapel:id,nama_mapel', 'kelas:id,nama_kelas', 'semester:id,nama']),
            'Ujian berhasil dibuat.'
        );
    }

    public function show($id)
    {
        $ujian = Exam::with([
            'mapel:id,nama_mapel',
            'kelas:id,nama_kelas',
            'semester:id,nama',
            'questions' => fn($q) => $q->orderBy('nomor'),
        ])
            ->withCount([
                'sessions',
                'sessions as selesai_count' => fn($q) => $q->where('status', 'submitted'),
            ])
            ->findOrFail($id);

        return $this->success($ujian);
    }

    public function update(UpdateExamRequest $request, $id)
    {
        $ujian = Exam::findOrFail($id);

        // Cegah edit ujian yang sudah ada session berjalan
        if ($ujian->sessions()->where('status', 'in_progress')->exists()) {
            return $this->conflict('Tidak dapat mengedit ujian yang sedang berlangsung.');
        }

        $validated = $request->validated();

        if (($validated['is_published'] ?? false) && !$ujian->is_published) {
            $validated['published_at'] = now();
        }

        $ujian->update($validated);

        return $this->success(
            $ujian->fresh(['mapel:id,nama_mapel', 'kelas:id,nama_kelas', 'semester:id,nama']),
            'Ujian berhasil diperbarui.'
        );
    }

    public function destroy($id)
    {
        $ujian = Exam::findOrFail($id);

        if ($ujian->sessions()->exists()) {
            return $this->conflict('Ujian yang sudah memiliki sesi tidak dapat dihapus. Nonaktifkan saja.');
        }

        $ujian->delete();

        return $this->success(null, 'Ujian berhasil dihapus.');
    }

    public function togglePublish($id)
    {
        $ujian = Exam::withCount('questions')->findOrFail($id);

        // Cegah publish ujian tanpa soal
        if (!$ujian->is_published && $ujian->questions_count === 0) {
            return $this->conflict('Tambahkan soal terlebih dahulu sebelum mempublikasikan ujian.');
        }

        $ujian->update([
            'is_published' => !$ujian->is_published,
            'published_at' => !$ujian->is_published ? now() : $ujian->published_at,
        ]);

        $status = $ujian->is_published ? 'dipublikasikan' : 'disembunyikan';

        return $this->success($ujian, "Ujian berhasil {$status}.");
    }

    // ── GURU: Kelola Soal ─────────────────────────────────────────────

    public function storeQuestion(StoreExamQuestionRequest $request, $id)
    {
        $ujian = Exam::findOrFail($id);

        // Tentukan nomor soal berikutnya
        $nomor = $ujian->questions()->max('nomor') + 1;

        $soal = ExamQuestion::create([
            ...$request->validated(),
            'school_id' => $ujian->school_id,
            'exam_id' => $ujian->id,
            'nomor' => $nomor,
        ]);

        return $this->created($soal, 'Soal berhasil ditambahkan.');
    }

    public function updateQuestion(StoreExamQuestionRequest $request, $id, $questionId)
    {
        $ujian = Exam::findOrFail($id);
        $soal = ExamQuestion::where('exam_id', $ujian->id)->findOrFail($questionId);

        $soal->update($request->validated());

        return $this->success($soal, 'Soal berhasil diperbarui.');
    }

    public function destroyQuestion($id, $questionId)
    {
        $ujian = Exam::findOrFail($id);
        $soal = ExamQuestion::where('exam_id', $ujian->id)->findOrFail($questionId);

        $soal->delete();

        // Re-number soal setelah hapus
        $ujian->questions()->orderBy('nomor')->each(function ($q, $idx) {
            $q->update(['nomor' => $idx + 1]);
        });

        return $this->success(null, 'Soal berhasil dihapus dan nomor urut diperbarui.');
    }

    // ── GURU: Monitoring & Rekap ──────────────────────────────────────

    /**
     * Daftar semua session/hasil siswa untuk satu ujian
     */
    public function sessions($id)
    {
        $ujian = Exam::findOrFail($id);

        $sessions = ExamStudentSession::with('siswa:id,nama_lengkap,nisn')
            ->where('exam_id', $ujian->id)
            ->orderBy('mulai_at')
            ->get();

        return $this->success($sessions);
    }

    /**
     * Nilai esai manual untuk satu session
     */
    public function nilaiEsai(NilaiEsaiRequest $request, $id, $sessionId)
    {
        $ujian = Exam::findOrFail($id);
        $session = ExamStudentSession::where('exam_id', $ujian->id)->findOrFail($sessionId);

        $session->update([
            'nilai_akhir' => $request->nilai_akhir,
            'lulus' => $request->nilai_akhir >= $ujian->nilai_lulus,
            'dinilai_at' => now(),
        ]);

        return $this->success($session->fresh('siswa:id,nama_lengkap'), 'Nilai esai berhasil disimpan.');
    }

    // ── SISWA: Kerjakan Ujian ─────────────────────────────────────────

    /**
     * Siswa mulai mengerjakan ujian — buat session baru
     */
    public function mulai($id)
    {
        $ujian = Exam::where('is_published', true)->findOrFail($id);
        $siswa = auth()->user()->siswa;

        if (!$siswa) {
            return $this->forbidden('Hanya siswa yang dapat mengerjakan ujian.');
        }

        // Cek waktu ujian
        if (now()->lt($ujian->waktu_mulai)) {
            return $this->conflict('Ujian belum dimulai.');
        }
        if (now()->gt($ujian->waktu_selesai)) {
            return $this->conflict('Waktu ujian sudah berakhir.');
        }

        // Cek session yang sudah ada
        $existing = ExamStudentSession::where('exam_id', $ujian->id)
            ->where('siswa_id', $siswa->id)
            ->first();

        if ($existing) {
            if ($existing->status === 'in_progress') {
                // Kembalikan session yang masih aktif + soal
                $soal = $this->getSoalForSession($ujian, $existing);
                return $this->success(['session' => $existing, 'soal' => $soal]);
            }

            if (!$ujian->boleh_buka_lagi) {
                return $this->conflict('Kamu sudah mengerjakan ujian ini dan tidak dapat mengerjakan ulang.');
            }
        }

        // Tentukan urutan soal
        $urutanSoal = $ujian->questions()->orderBy('nomor')->pluck('id')->toArray();
        if ($ujian->acak_soal) {
            shuffle($urutanSoal);
        }

        $session = ExamStudentSession::create([
            'school_id' => $ujian->school_id,
            'exam_id' => $ujian->id,
            'siswa_id' => $siswa->id,
            'mulai_at' => now(),
            'status' => 'in_progress',
            'urutan_soal' => $urutanSoal,
        ]);

        $soal = $this->getSoalForSession($ujian, $session);

        return $this->success(['session' => $session, 'soal' => $soal]);
    }

    /**
     * Siswa simpan jawaban per soal
     */
    public function jawab(SubmitExamAnswerRequest $request, $id, $sessionId)
    {
        $ujian = Exam::where('is_published', true)->findOrFail($id);
        $session = ExamStudentSession::where('exam_id', $ujian->id)
            ->where('siswa_id', auth()->user()->siswa?->id)
            ->findOrFail($sessionId);

        if ($session->status !== 'in_progress') {
            return $this->conflict('Sesi ujian sudah berakhir.');
        }

        $soal = ExamQuestion::where('exam_id', $ujian->id)
            ->findOrFail($request->question_id);

        // Upsert jawaban
        $jawaban = $session->answers()->updateOrCreate(
            ['question_id' => $soal->id],
            [
                'school_id' => $session->school_id,
                'jawaban' => $request->jawaban,
                'dijawab_at' => now(),
            ]
        );

        // Auto-grade untuk soal objective
        if (in_array($soal->tipe, ['pilihan_ganda', 'benar_salah'])) {
            $benar = json_decode($soal->jawaban_benar, true);
            $jawabanSiswa = (array) json_decode($request->jawaban, true);
            $isCorrect = $jawabanSiswa === $benar;

            $jawaban->update([
                'is_correct' => $isCorrect,
                'skor' => $isCorrect ? $soal->bobot : 0,
            ]);
        }

        return $this->success($jawaban, 'Jawaban tersimpan.');
    }

    /**
     * Siswa submit (selesaikan) ujian
     */
    public function submit($id, $sessionId)
    {
        $ujian = Exam::findOrFail($id);
        $session = ExamStudentSession::where('exam_id', $ujian->id)
            ->where('siswa_id', auth()->user()->siswa?->id)
            ->findOrFail($sessionId);

        if ($session->status !== 'in_progress') {
            return $this->conflict('Sesi ini sudah disubmit atau berakhir.');
        }

        // Hitung skor mentah dari jawaban objective
        $skorMentah = $session->answers()->sum('skor');
        $totalBobot = $ujian->questions()->sum('bobot');
        $nilaiAkhir = $totalBobot > 0 ? round(($skorMentah / $totalBobot) * 100, 2) : null;

        // Cek apakah ada soal esai yang belum dinilai
        $adaEsai = $ujian->questions()
            ->whereIn('tipe', ['esai', 'isian_singkat', 'menjodohkan'])
            ->exists();

        $session->update([
            'selesai_at' => now(),
            'status' => 'submitted',
            'skor_mentah' => $skorMentah,
            'nilai_akhir' => $adaEsai ? null : $nilaiAkhir,
            'lulus' => $adaEsai ? null : ($nilaiAkhir >= $ujian->nilai_lulus),
            'dinilai_at' => $adaEsai ? null : now(),
        ]);

        $pesan = $adaEsai
            ? 'Ujian selesai. Nilai akan tersedia setelah guru menilai soal esai.'
            : "Ujian selesai. Nilai kamu: {$nilaiAkhir}.";

        return $this->success($session->fresh(), $pesan);
    }

    // ── Private Helper ────────────────────────────────────────────────

    private function getSoalForSession(Exam $ujian, ExamStudentSession $session): array
    {
        $urutan = $session->urutan_soal ?? $ujian->questions()->pluck('id')->toArray();

        $soalAll = ExamQuestion::where('exam_id', $ujian->id)->get()->keyBy('id');

        // Sembunyikan jawaban_benar dari siswa
        return collect($urutan)->map(function ($soalId) use ($soalAll, $ujian) {
            $soal = $soalAll[$soalId] ?? null;
            if (!$soal)
                return null;

            $data = $soal->toArray();

            // Acak pilihan jika diperlukan
            if ($ujian->acak_pilihan && isset($data['pilihan'])) {
                $pilihan = $data['pilihan'];
                shuffle($pilihan);
                $data['pilihan'] = $pilihan;
            }

            // Hapus jawaban_benar dan pembahasan dari response siswa
            unset($data['jawaban_benar'], $data['pembahasan']);

            return $data;
        })->filter()->values()->all();
    }
}