<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ruas_jalan', function (Blueprint $table) {
            $table->id();
            $table->string('kl_dat_das')->nullable();
            $table->string('nm_ruas')->unique();
            $table->integer('thn_data')->nullable();
            $table->string('status')->nullable();
            $table->string('fungsi')->nullable();
            $table->string('mendukung')->nullable();
            $table->string('ura_dukung')->nullable();
            $table->string('kd_bd_pu')->nullable();
            $table->string('kd_jns_inf')->nullable();
            $table->string('kd_inf')->nullable();
            $table->string('propinsi')->nullable();
            $table->string('kab_kot')->nullable();
            $table->string('kecamatan')->nullable();
            $table->string('desa_kel')->nullable();
            $table->string('tk_ruas_aw')->nullable();
            $table->string('tk_ruas_ak')->nullable();
            $table->string('kd_patok')->nullable();
            $table->float('km_awal')->nullable();
            $table->float('km_akhir')->nullable();
            $table->string('nm_lintas')->nullable();
            $table->float('kon_baik')->nullable();
            $table->float('kon_sdg')->nullable();
            $table->float('kon_rgn')->nullable();
            $table->float('kon_rusak')->nullable();
            $table->float('kon_mntp')->nullable();
            $table->float('kon_t_mntp')->nullable();
            $table->float('panjang')->nullable();
            $table->float('lbr_keras')->nullable();
            $table->integer('lh_rt')->nullable();
            $table->float('vcr')->nullable();
            $table->integer('tipe_jln')->nullable();
            $table->integer('mst')->nullable();
            $table->string('tipe_keras')->nullable();
            $table->float('tanah_kri')->nullable();
            $table->float('macadam')->nullable();
            $table->float('aspal')->nullable();
            $table->float('rigid')->nullable();
            $table->integer('thn_pen_ak')->nullable();
            $table->string('jns_pen')->nullable();
            $table->float('koord_x_aw')->nullable();
            $table->float('koord_y_aw')->nullable();
            $table->float('koord_x_ak')->nullable();
            $table->float('koord_y_ak')->nullable();
            $table->string('remark')->nullable();
            $table->float('shape_leng')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ruas_jalan');
    }
};
