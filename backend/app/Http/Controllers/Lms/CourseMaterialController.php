<?php

namespace App\Http\Controllers\Lms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lms\StoreCourseMaterialRequest;
use App\Http\Requests\Lms\UpdateCourseMaterialRequest;
use App\Models\CourseMaterial;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseMaterialController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = CourseMaterial::with([
            'mapel:id,nama_mapel',
            'kelas:id,nama_kelas',
            'semester:id,nama',
            'createdBy:id,name',
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
            ->orderBy('urutan')
            ->latest();

        $data = $request->boolean('all')
            ? $query->get()
            : $query->paginate(15);

        return $this->success($data);
    }

    public function store(StoreCourseMaterialRequest $request)
    {
        $validated = $request->validated();
        $validated['guru_id'] = auth()->user()->guru?->id;
        $validated['created_by'] = auth()->id();

        // Handle file upload jika ada
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('lms/materials', 'public');
            $validated['storage_path'] = $path;
            $validated['mime_type'] = $file->getMimeType();
            $validated['ukuran_bytes'] = $file->getSize();
        }

        if ($validated['is_published'] ?? false) {
            $validated['published_at'] = now();
        }

        $materi = CourseMaterial::create($validated);

        return $this->created(
            $materi->load(['mapel:id,nama_mapel', 'kelas:id,nama_kelas', 'semester:id,nama']),
            'Materi berhasil ditambahkan.'
        );
    }

    public function show($id)
    {
        $materi = CourseMaterial::with([
            'mapel:id,nama_mapel',
            'kelas:id,nama_kelas',
            'semester:id,nama',
            'guru:id,nuptk',
            'createdBy:id,name',
        ])
            ->findOrFail($id);

        return $this->success($materi);
    }

    public function update(UpdateCourseMaterialRequest $request, $id)
    {
        $materi = CourseMaterial::findOrFail($id);
        $validated = $request->validated();

        // Handle file upload baru
        if ($request->hasFile('file')) {
            // Hapus file lama jika ada
            if ($materi->storage_path) {
                Storage::disk('public')->delete($materi->storage_path);
            }
            $file = $request->file('file');
            $path = $file->store('lms/materials', 'public');
            $validated['storage_path'] = $path;
            $validated['mime_type'] = $file->getMimeType();
            $validated['ukuran_bytes'] = $file->getSize();
        }

        // Set published_at saat pertama kali dipublish
        if (($validated['is_published'] ?? false) && !$materi->is_published) {
            $validated['published_at'] = now();
        }

        $materi->update($validated);

        return $this->success(
            $materi->fresh(['mapel:id,nama_mapel', 'kelas:id,nama_kelas', 'semester:id,nama']),
            'Materi berhasil diperbarui.'
        );
    }

    public function destroy($id)
    {
        $materi = CourseMaterial::findOrFail($id);

        if ($materi->storage_path) {
            Storage::disk('public')->delete($materi->storage_path);
        }

        $materi->delete();

        return $this->success(null, 'Materi berhasil dihapus.');
    }

    /**
     * Toggle publish/unpublish materi
     */
    public function togglePublish($id)
    {
        $materi = CourseMaterial::findOrFail($id);
        $materi->update([
            'is_published' => !$materi->is_published,
            'published_at' => !$materi->is_published ? now() : $materi->published_at,
        ]);

        $status = $materi->is_published ? 'dipublikasikan' : 'disembunyikan';

        return $this->success($materi, "Materi berhasil {$status}.");
    }
}