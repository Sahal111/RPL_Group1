<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        $user = $request->user();

        if (!$user || !$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $slugMap = [
            1 => 'operator',
            2 => 'guru',
            3 => 'ortu',
            4 => 'kepsek',
        ];

        $userSlug = $slugMap[$user->role_id] ?? null;

        if (!in_array($userSlug, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Role kamu tidak memiliki izin.',
            ], 403);
        }

        return $next($request);
    }
}