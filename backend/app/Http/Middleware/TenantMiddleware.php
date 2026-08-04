<?php

namespace App\Http\Middleware;

use App\Models\School;
use App\Models\SchoolDomain;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Identifikasi tenant dari request dan set app('current_school_id').
 * Harus dijalankan sebelum auth middleware supaya SchoolScope bisa bekerja.
 *
 * Urutan deteksi:
 * 1. Subdomain request  → cari di school_domains
 * 2. Header X-School-ID → untuk keperluan testing atau API eksternal
 * 3. user->school_id    → fallback setelah auth (untuk app mobile yang tidak pakai subdomain)
 *
 * Kalau school ditemukan tapi status bukan active/trial → return 403.
 */
class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $schoolId = $this->resolveSchoolId($request);

        if ($schoolId) {
            app()->instance('current_school_id', $schoolId);

            // Cek status school
            $school = School::withoutGlobalScopes()->find($schoolId);

            if ($school && !$school->isAccessible()) {
                return response()->json([
                    'success' => false,
                    'code' => 'SCHOOL_SUSPENDED',
                    'message' => 'Akses sekolah kamu sedang ditangguhkan. Hubungi tim SIAKAD.',
                ], 403);
            }
        } else {
            // Belum bisa resolve school — set null, biarkan auth middleware yang handle
            app()->instance('current_school_id', null);
        }

        return $next($request);
    }

    private function resolveSchoolId(Request $request): ?int
    {
        // 1. Dari subdomain
        $host = $request->getHost();
        $subdomain = $this->extractSubdomain($host);

        if ($subdomain) {
            $domain = SchoolDomain::withoutGlobalScopes()
                ->where('domain', $host)
                ->orWhere('domain', $subdomain)
                ->first();

            if ($domain) {
                return $domain->school_id;
            }
        }

        // 2. Dari header X-School-ID (untuk testing atau API mobile)
        $headerSchoolId = $request->header('X-School-ID');
        if ($headerSchoolId && is_numeric($headerSchoolId)) {
            return (int) $headerSchoolId;
        }

        // 3. Dari user yang sudah login
        $user = $request->user();
        if ($user && $user->school_id) {
            return $user->school_id;
        }

        return null;
    }

    private function extractSubdomain(string $host): ?string
    {
        // Hapus port kalau ada (misal: localhost:8001)
        $host = explode(':', $host)[0];

        $parts = explode('.', $host);

        // Kalau hanya satu segment (misal: localhost) → tidak ada subdomain
        if (count($parts) <= 1) {
            return null;
        }

        // siakad.id → tidak ada subdomain
        // sdn1.siakad.id → subdomain = sdn1
        // www.siakad.id → bukan tenant subdomain
        $subdomain = $parts[0];

        if (in_array($subdomain, ['www', 'api', 'app', 'admin'])) {
            return null;
        }

        return $subdomain;
    }
}