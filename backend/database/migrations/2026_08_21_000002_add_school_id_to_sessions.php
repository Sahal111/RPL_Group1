<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sessions', function (Blueprint $table) {
            // Nullable: guest session dan platform_admin tidak punya school_id
            $table->unsignedBigInteger('school_id')->nullable()->after('user_id')
                ->comment('NULL = guest atau platform admin. Tenant user wajib punya nilai ini. Divalidasi di TenantSessionMiddleware');

            // Index untuk invalidasi semua session milik sekolah tertentu (misal: suspend sekolah)
            $table->index(['school_id', 'last_activity'], 'idx_sessions_school_activity');
        });
    }

    public function down(): void
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropIndex('idx_sessions_school_activity');
            $table->dropColumn('school_id');
        });
    }
};
