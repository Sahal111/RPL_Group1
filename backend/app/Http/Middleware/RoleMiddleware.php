<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Map role_id → slug
     * Sesuaikan dengan tabel `roles` di database.
     */
    private const SLUG_MAP = [
        1 => 'operator',
        2 => 'guru',
        3 => 'ortu',
        4 => 'kepsek',
        5 => 'bendahara',
        6 => 'walikelas',
    ];

    /**
     * Handle an incoming request.
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

        // Dapatkan slug role user dari map
        $userSlug = self::SLUG_MAP[$user->role_id] ?? null;

        // Cek apakah slug user ada di daftar role yang diizinkan
        if ($userSlug && in_array($userSlug, $roles)) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Akses ditolak. Kamu tidak memiliki izin untuk mengakses halaman ini.',
        ], 403);
    }
}