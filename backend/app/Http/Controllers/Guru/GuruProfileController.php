<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\StoreGuruRequest;
use App\Http\Requests\Guru\UpdateGuruRequest;
use App\Http\Resources\GuruResource;
use App\Models\Guru;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuruProfileController extends Controller
{
    /**
     * Display a listing of teachers with filtering & pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Guru::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('nuptk', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status_aktif')) {
            $query->where('status_aktif', filter_var($request->status_aktif, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('jenis_ptk')) {
            $query->where('jenis_ptk', $request->jenis_ptk);
        }

        $perPage = (int) $request->get('per_page', 15);
        $gurus = $query->latest()->paginate($perPage);

        return $this->success(GuruResource::collection($gurus));
    }

    /**
     * Store a newly created teacher profile.
     */
    public function store(StoreGuruRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('foto-guru', 'public');
            $data['foto'] = $path;
        }

        $guru = Guru::create($data);

        return $this->created(new GuruResource($guru), 'Data guru berhasil ditambahkan.');
    }

    /**
     * Display the specified teacher profile.
     */
    public function show(string $id): JsonResponse
    {
        $guru = Guru::with(['user', 'dokumens', 'pendidikans', 'keluarga'])->find($id)
            ?? Guru::where('ulid', $id)->first();

        if (!$guru) {
            return $this->notFound('Data guru tidak ditemukan.');
        }

        return $this->success(new GuruResource($guru));
    }

    /**
     * Update the specified teacher profile.
     */
    public function update(UpdateGuruRequest $request, string $id): JsonResponse
    {
        $guru = Guru::find($id) ?? Guru::where('ulid', $id)->first();

        if (!$guru) {
            return $this->notFound('Data guru tidak ditemukan.');
        }

        $data = $request->validated();

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('foto-guru', 'public');
            $data['foto'] = $path;
        }

        $guru->update($data);

        return $this->success(new GuruResource($guru), 'Data guru berhasil diperbarui.');
    }

    /**
     * Remove the specified teacher profile (soft delete).
     */
    public function destroy(string $id): JsonResponse
    {
        $guru = Guru::find($id) ?? Guru::where('ulid', $id)->first();

        if (!$guru) {
            return $this->notFound('Data guru tidak ditemukan.');
        }

        $guru->delete();

        return $this->success(null, 'Data guru berhasil dihapus.');
    }
}
