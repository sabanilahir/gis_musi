<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
     public function up(): void
    {
        Schema::create('koordinat_ruas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ruas_jalan_id')->constrained('ruas_jalan')->onDelete('cascade');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->integer('urutan')->nullable(); // urutan titik ke berapa
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('koordinat_ruas');
    }
};
