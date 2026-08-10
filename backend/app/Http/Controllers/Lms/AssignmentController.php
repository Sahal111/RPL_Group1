<?php

namespace App\Http\Controllers\Lms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lms\StoreAssignmentRequest;
use App\Http\Requests\Lms\UpdateAssignmentRequest;
use App\Http\Requests\Lms\SubmitAssignmentRequest;
use App\Http\Requests\Lms\NilaiSubmissionRequest;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssignmentController extends Controller
{
    use ApiResponse;

    // ── GURU: Kelola Tugas ────────────────────────────────────────────

    public function index(Request $request)
    {
        $query = Assignment::with([
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
            ->withCount('submissions')
            ->latest();

        $data = $request->boolean('all')
            ? $query->get()
            : $query->paginate(15);

        return $this->success($data);
    }

    public function store(StoreAssignmentRequest $request)
    {
        $validated = $request->validated();
        $validated['guru_id'] = auth()->user()->guru?->id;
        $validated['created_by'] = auth()->id();

        if ($request->hasFile('lampiran')) {
            $validated['lampiran'] = $request->file('lampiran')->store('lms/assignments', 'public');
        }

        if ($validated['is_published'] ?? false) {
            $validated['published_at'] = now();
        }

        $tugas = Assignment::create($validated);

        return $this->created(
            $tugas->load(['mapel:id,nama_mapel', 'kelas:id,nama_kelas', 'semester:id,nama']),
            'Tugas berhasil ditambahkan.'
        );
    }

    public function show($id)
    {
        $tugas = Assignment::with([
            'mapel:id,nama_mapel',
            'kelas:id,nama_kelas',
            'semester:id,nama',
            'submissions' => fn($q) => $q->with('siswa:id,nama_lengkap,nisn'),
        ])
            ->withCount([
                'submissions',
                'submissions as submitted_count' => fn($q) => $q->whereIn('status', ['submitted', 'late', 'graded']),
                'submissions as graded_count' => fn($q) => $q->where('status', 'graded'),
            ])
            ->findOrFail($id);

        return $this->success($tugas);
    }

    public function update(UpdateAssignmentRequest $request, $id)
    {
        $tugas = Assignment::findOrFail($id);
        $validated = $request->validated();

        if ($request->hasFile('lampiran')) {
            if ($tugas->lampiran) {
                Storage::disk('public')->delete($tugas->lampiran);
            }
            $validated['lampiran'] = $request->file('lampiran')->store('lms/assignments', 'public');
        }

        if (($validated['is_published'] ?? false) && !$tugas->is_published) {
            $validated['published_at'] = now();
        }

        $validated['updated_by'] = auth()->id();
        $tugas->update($validated);

        return $this->success(
            $tugas->fresh(['mapel:id,nama_mapel', 'kelas:id,nama_kelas', 'semester:id,nama']),
            'Tugas berhasil diperbarui.'
        );
    }

    public function destroy($id)
    {
        $tugas = Assignment::findOrFail($id);

        if ($tugas->lampiran) {
            Storage::disk('public')->delete($tugas->lampiran);
        }

        $tugas->delete();

        return $this->success(null, 'Tugas berhasil dihapus.');
    }

    public function togglePublish($id)
    {
        $tugas = Assignment::findOrFail($id);
        $tugas->update([
            'is_published' => !$tugas->is_published,
            'published_at' => !$tugas->is_published ? now() : $tugas->published_at,
            'updated_by' => auth()->id(),
        ]);

        $status = $tugas->is_published ? 'dipublikasikan' : 'disembunyikan';

        return $this->success($tugas, "Tugas berhasil {$status}.");
    }

    // ── GURU: Kelola Submission ───────────────────────────────────────

    /**
     * Daftar semua submission untuk satu tugas
     */
    public function submissions($id)
    {
        $tugas = Assignment::findOrFail($id);

        $submissions = AssignmentSubmission::with('siswa:id,nama_lengkap,nisn')
            ->where('assignment_id', $tugas->id)
            ->orderBy('submitted_at', 'asc')
            ->get();

        return $this->success($submissions);
    }

    /**
     * Guru nilai submission siswa
     */
    public function nilaiSubmission(NilaiSubmissionRequest $request, $id, $submissionId)
    {
        $tugas = Assignment::findOrFail($id);
        $submission = AssignmentSubmission::where('assignment_id', $tugas->id)
            ->findOrFail($submissionId);

        $submission->update([
            'nilai' => $request->nilai,
            'feedback_guru' => $request->feedback_guru,
            'status' => 'graded',
            'dinilai_oleh' => auth()->id(),
            'dinilai_at' => now(),
        ]);

        return $this->success($submission->fresh('siswa:id,nama_lengkap'), 'Nilai berhasil disimpan.');
    }

    // ── SISWA: Kumpulkan Tugas ────────────────────────────────────────

    /**
     * Siswa ambil detail tugas yang aktif
     */
    public function showForSiswa($id)
    {
        $tugas = Assignment::with(['mapel:id,nama_mapel', 'kelas:id,nama_kelas'])
            ->where('is_published', true)
            ->findOrFail($id);

        // Cek submission siswa ini
        $siswaId = auth()->user()->siswa?->id;
        $submission = $siswaId
            ? AssignmentSubmission::where('assignment_id', $tugas->id)
                ->where('siswa_id', $siswaId)
                ->first()
            : null;

        return $this->success([
            'tugas' => $tugas,
            'submission' => $submission,
        ]);
    }

    /**
     * Siswa kumpulkan jawaban tugas
     */
    public function submit(SubmitAssignmentRequest $request, $id)
    {
        $tugas = Assignment::where('is_published', true)->findOrFail($id);
        $siswa = auth()->user()->siswa;

        if (!$siswa) {
            return $this->forbidden('Hanya siswa yang bisa mengumpulkan tugas.');
        }

        $isLate = now()->gt($tugas->batas_pengumpulan);

        // Cek late_policy reject
        if ($isLate && $tugas->late_policy === 'reject') {
            return $this->conflict('Batas waktu pengumpulan telah lewat dan tidak dapat menerima tugas terlambat.');
        }

        $submission = AssignmentSubmission::firstOrNew([
            'assignment_id' => $tugas->id,
            'siswa_id' => $siswa->id,
        ]);

        // Hapus file lama jika ada
        if ($submission->exists && $submission->storage_path) {
            Storage::disk('public')->delete($submission->storage_path);
        }

        $path = null;
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store("lms/submissions/{$tugas->id}", 'public');
        }

        $submission->fill([
            'school_id' => auth()->user()->school_id,
            'catatan_siswa' => $request->catatan_siswa,
            'storage_path' => $path ?? $submission->storage_path,
            'url_eksternal' => $request->url_eksternal,
            'status' => $isLate ? 'late' : 'submitted',
            'submitted_at' => now(),
        ]);

        $submission->save();

        return $this->success($submission, 'Tugas berhasil dikumpulkan.');
    }
}