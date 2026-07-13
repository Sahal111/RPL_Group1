<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Role sekarang disimpan di pivot `user_roles` (many-to-many),
     * bukan kolom `role_id` di tabel `users` (kolom itu sudah dihapus
     * dari skema baru). Cek akses langsung lewat slug di tabel `roles`,
     * jadi tidak perlu mapping ID → slug lagi — dan otomatis ikut
     * kalau ada role baru ditambahkan di DB tanpa perlu ubah kode ini.
     *
     * Pemakaian di routes:
     *   ->middleware('role:operator')
     *   ->middleware('role:guru,operator')
     *   ->middleware('role:kepsek,operator,bendahara')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // Belum login
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Kamu belum login. Silakan login terlebih dahulu.',
            ], 401);
        }

        // Akun tidak aktif
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun kamu belum aktif. Hubungi operator sekolah.',
            ], 403);
        }

        // User bisa punya lebih dari satu role (misal: guru + wali_kelas).
        // Izinkan akses kalau SALAH SATU role user cocok dengan role yang diizinkan route ini.
        $userSlugs = $user->roles->pluck('slug');

        if ($userSlugs->intersect($roles)->isNotEmpty()) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Akses ditolak. Kamu tidak memiliki izin untuk mengakses halaman ini.',
        ], 403);
    }
}