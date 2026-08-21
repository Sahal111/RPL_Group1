<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Nullable: token milik platform_admin tidak punya school_id
            $table->unsignedBigInteger('school_id')->nullable()->after('tokenable_id')
                ->comment('NULL = platform admin token. Tenant user token wajib punya nilai ini.');

            // Index untuk revoke semua token sekolah tertentu (suspend/offboard)
            $table->index(['school_id', 'tokenable_id'], 'idx_pat_school_tokenable');
        });
    }

    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropIndex('idx_pat_school_tokenable');
            $table->dropColumn('school_id');
        });
    }
};
