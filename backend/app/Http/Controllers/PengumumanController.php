<?php

namespace App\Http\Controllers;

use App\Models\Pengumuman;
use Illuminate\Http\Request;

class PengumumanController extends Controller
{
    public function index(Request $request)
    {
        $query = Pengumuman::with('penulis:id,username')
            ->whereIn('target', ['semua', 'internal'])
            ->orderBy('created_at', 'desc');

        // Operator & kepsek (role_id 1 dan 4) lihat semua termasuk terjadwal
        if (!in_array($request->user()->role_id, [1, 4])) {
            $query->where(function ($q) {
                $q->whereNull('publish_at')
                    ->orWhere('publish_at', '<=', now());
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'konten' => 'required|string',
            'kategori' => 'required|string',
            'target' => 'required|in:semua,internal,ortu',
            'publish_at' => 'nullable|date|after:now',
        ]);

        $pengumuman = Pengumuman::create([
            'judul' => $request->judul,
            'konten' => $request->konten,
            'kategori' => $request->kategori,
            'target' => $request->target,
            'penulis_id' => $request->user()->id,
            'publish_at' => $request->publish_at ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil ditambahkan.',
            'data' => $pengumuman,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'konten' => 'required|string',
            'kategori' => 'required|string',
            'target' => 'required|in:semua,internal,ortu',
            'publish_at' => 'nullable|date',
        ]);

        $pengumuman = Pengumuman::findOrFail($id);
        $pengumuman->update([
            'judul' => $request->judul,
            'konten' => $request->konten,
            'kategori' => $request->kategori,
            'target' => $request->target,
            'publish_at' => $request->publish_at ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil diperbarui.',
            'data' => $pengumuman,
        ]);
    }

    public function destroy($id)
    {
        $pengumuman = Pengumuman::findOrFail($id);
        $pengumuman->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil dihapus.'
        ]);
    }
}