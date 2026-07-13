<?php

namespace App\Http\Controllers;

use App\Models\Galeri; // tabel: galeris
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GaleriController extends Controller
{
    // PUBLIC — bisa diakses tanpa login (untuk halaman galeri publik)
    public function index()
    {
        $galeri = Galeri::with('uploader:id,username')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $galeri,
        ]);
    }

    // OPERATOR — upload foto baru ke galeri
    public function store(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'judul' => 'required|string|max:150',
            'deskripsi' => 'nullable|string|max:500',
            'kategori' => 'required|in:kegiatan,prestasi,ekstrakurikuler,fasilitas,acara',
        ]);

        $path = $request->file('foto')->store('galeris', 'public');

        $galeri = Galeri::create([
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'kategori' => $request->kategori,
            'foto' => $path,
            'uploaded_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto berhasil diupload ke galeri.',
            'data' => $galeri,
        ], 201);
    }

    // OPERATOR — hapus foto dari galeri
    public function destroy($id)
    {
        $galeri = Galeri::findOrFail($id);

        // Hapus file fisik dari storage
        if (Storage::disk('public')->exists($galeri->foto)) {
            Storage::disk('public')->delete($galeri->foto);
        }

        $galeri->delete();

        return response()->json([
            'success' => true,
            'message' => 'Foto berhasil dihapus dari galeri.',
        ]);
    }
}
