<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;
use Symfony\Component\HttpFoundation\Response;

class InjectTokenFromCookie
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->bearerToken()) {
            $raw = $request->cookie('auth_token');

            if ($raw) {
                try {
                    $token = Crypt::decryptString($raw);
                } catch (DecryptException) {
                    // Cookie tidak valid / tidak ter-encrypt — pakai as-is
                    $token = $raw;
                }

                $request->headers->set('Authorization', 'Bearer ' . $token);
            }
        }

        return $next($request);
    }
}