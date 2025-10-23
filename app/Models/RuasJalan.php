<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RuasJalan extends Model
{
    use HasFactory;

    protected $table = 'ruas_jalan';

    protected $fillable = [
        'kl_dat_das',
        'nm_ruas',
        'thn_data',
        'status',
        'fungsi',
        'mendukung',
        'ura_dukung',
        'kd_bd_pu',
        'kd_jns_inf',
        'kd_inf',
        'propinsi',
        'kab_kot',
        'kecamatan',
        'desa_kel',
        'tk_ruas_aw',
        'tk_ruas_ak',
        'kd_patok',
        'km_awal',
        'km_akhir',
        'nm_lintas',
        'kon_baik',
        'kon_sdg',
        'kon_rgn',
        'kon_rusak',
        'kon_mntp',
        'kon_t_mntp',
        'panjang',
        'lbr_keras',
        'lhrt',
        'vcr',
        'tipe_jln',
        'mst',
        'tipe_keras',
        'tanah_kri',
        'macadam',
        'aspal',
        'rigid',
        'thn_pen_ak',
        'jns_pen',
        'koord_x_aw',
        'koord_y_aw',
        'koord_x_ak',
        'koord_y_ak',
        'remark',
        'shape_leng',

    ];

    public function koordinat()
    {
        return $this->hasMany(KoordinatRuas::class);
    }
}

