<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('koordinat_ruas', function (Blueprint $table) {
            // Pastikan kolom sesuai spesifikasi
            if (!Schema::hasColumn('koordinat_ruas', 'urutan')) {
                $table->unsignedInteger('urutan')->default(0)->after('longitude');
            }

            if (!Schema::hasColumn('koordinat_ruas', 'segment_ke')) {
                $table->unsignedInteger('segment_ke')->default(0)->after('urutan');
            }

            // Jika relasi ke ruas_jalan belum pakai foreign key, tambahkan
            if (!Schema::hasColumn('koordinat_ruas', 'ruas_jalan_id')) {
                $table->foreignId('ruas_jalan_id')
                      ->constrained('ruas_jalan')
                      ->onDelete('cascade')
                      ->after('id');
            }

            // Ubah tipe data jika belum sesuai
            $table->decimal('latitude', 10, 7)->change();
            $table->decimal('longitude', 10, 7)->change();
        });
    }

    public function down(): void
    {
        Schema::table('koordinat_ruas', function (Blueprint $table) {
            $table->dropColumn(['urutan', 'segment_ke']);
        });
    }
};
