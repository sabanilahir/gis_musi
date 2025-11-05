<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class DashboardUserController extends Controller
{
    public function index()
    {
        $jumlahRuas = DB::table('ruas_jalan')->count();
        $jumlahJembatan = 0;

        // Titik: hanya jumlahkan baris dengan nilai angka valid
        $jumlahTitik = 0;

        // Patok: hitung jumlah ruas unik yang punya patok tidak null
        $jumlahPatok = DB::table('ruas_jalan')
            ->whereNotNull('kd_patok')
            ->where('kd_patok', '<>', '')
            ->distinct('nm_ruas')
            ->count('nm_ruas');

        return inertia('dashboarduser', [
            'jumlahRuas' => $jumlahRuas,
            'jumlahJembatan' => $jumlahJembatan,
            'jumlahTitik' => $jumlahTitik,
            'jumlahPatok' => $jumlahPatok,
        ]);
    }
}
