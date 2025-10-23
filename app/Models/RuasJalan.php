<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RuasJalan extends Model
{
    use HasFactory;

    protected $table = 'ruas_jalan';

    protected $fillable = [
        'Kl_Dat_Das',
        'Nm_Ruas',
        'Thn_Data',
        'Status',
        'Fungsi',
        'Mendukung',
        'Ura_Dukung',
        'Kd_Bd_PU',
        'Kd_Jns_Inf',
        'Kd_Inf',
        'Propinsi',
        'Kab_Kot',
        'Kecamatan',
        'Desa_Kel',
        'Tk_Ruas_Aw',
        'Tk_Ruas_Ak',
        'Kd_Patok',
        'Km_Awal',
        'Km_Akhir',
        'Nm_Lintas',
        'Kon_Baik',
        'Kon_Sdg',
        'Kon_Rgn',
        'Kon_Rusak',
        'Kon_Mntp',
        'Kon_T_Mntp',
        'Panjang',
        'Lbr_Keras',
        'LHRT',
        'VCR',
        'Tipe_Jln',
        'MST',
        'Tipe_Keras',
        'Tanah_Kri',
        'Macadam',
        'Aspal',
        'Rigid',
        'Thn_Pen_Ak',
        'Jns_Pen',
        'Koord_X_Aw',
        'Koord_Y_Aw',
        'Koord_X_Ak',
        'Koord_Y_Ak',
        'REMARK',
        'Shape_Leng'
    ];

    public function koordinat()
    {
        return $this->hasMany(KoordinatRuas::class);
    }
}

