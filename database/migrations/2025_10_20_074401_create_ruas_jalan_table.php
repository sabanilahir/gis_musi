<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ruas_jalan', function (Blueprint $table) {
            $table->id();
            $table->string('Kl_Dat_Das')->nullable();
            $table->string('Nm_Ruas')->nullable();
            $table->integer('Thn_Data')->nullable();
            $table->string('Status')->nullable();
            $table->string('Fungsi')->nullable();
            $table->string('Mendukung')->nullable();
            $table->string('Ura_Dukung')->nullable();
            $table->string('Kd_Bd_PU')->nullable();
            $table->string('Kd_Jns_Inf')->nullable();
            $table->string('Kd_Inf')->nullable();
            $table->string('Propinsi')->nullable();
            $table->string('Kab_Kot')->nullable();
            $table->string('Kecamatan')->nullable();
            $table->string('Desa_Kel')->nullable();
            $table->string('Tk_Ruas_Aw')->nullable();
            $table->string('Tk_Ruas_Ak')->nullable();
            $table->string('Kd_Patok')->nullable();
            $table->float('Km_Awal')->nullable();
            $table->float('Km_Akhir')->nullable();
            $table->string('Nm_Lintas')->nullable();
            $table->float('Kon_Baik')->nullable();
            $table->float('Kon_Sdg')->nullable();
            $table->float('Kon_Rgn')->nullable();
            $table->float('Kon_Rusak')->nullable();
            $table->float('Kon_Mntp')->nullable();
            $table->float('Kon_T_Mntp')->nullable();
            $table->float('Panjang')->nullable();
            $table->float('Lbr_Keras')->nullable();
            $table->integer('LHRT')->nullable();
            $table->float('VCR')->nullable();
            $table->integer('Tipe_Jln')->nullable();
            $table->integer('MST')->nullable();
            $table->string('Tipe_Keras')->nullable();
            $table->float('Tanah_Kri')->nullable();
            $table->float('Macadam')->nullable();
            $table->float('Aspal')->nullable();
            $table->float('Rigid')->nullable();
            $table->integer('Thn_Pen_Ak')->nullable();
            $table->string('Jns_Pen')->nullable();
            $table->float('Koord_X_Aw')->nullable();
            $table->float('Koord_Y_Aw')->nullable();
            $table->float('Koord_X_Ak')->nullable();
            $table->float('Koord_Y_Ak')->nullable();
            $table->string('REMARK')->nullable();
            $table->float('Shape_Leng')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ruas_jalan');
    }
};
