<?php

namespace App\Http\Controllers;

use App\Models\RuasJalan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TitikController extends Controller
{
    public function index()
    {
        // Buat Union untuk memisahkan titik awal dan akhir
        $titikAwal = RuasJalan::select(
            'id',
            'nm_ruas',
            'tk_ruas_aw as nm_titik',
            DB::raw("'Awal' as tipe")
        )->toBase();

        $titikAkhir = RuasJalan::select(
            'id',
            'nm_ruas',
            'tk_ruas_ak as nm_titik',
            DB::raw("'Akhir' as tipe")
        )->toBase();

        $ResultTitik = $titikAwal
            ->unionAll($titikAkhir)
            ->orderBy('id')
            ->orderBy('tipe', 'desc')
            ->get();

        $ruasList = RuasJalan::select('id', 'nm_ruas')
            ->orderBy('nm_ruas')
            ->get();

        return Inertia::render('titik/Index', [
            'titik' => $ResultTitik,
            'ruas' => $ruasList,
        ]);
    }

    public function destroy($id, $tipe)
    {
        $ruas = RuasJalan::findOrFail($id);

        // Update kolom titik jadi null
        if ($tipe === 'Awal') {
            $ruas->update(['tk_ruas_aw' => null]);
        } elseif ($tipe === 'Akhir') {
            $ruas->update(['tk_ruas_ak' => null]);
        }

        Log::info("🗑️ Titik dihapus dari ruas: {$ruas->nm_ruas}");

        return redirect()->route('titik.index')->with('success', 'Titik berhasil dihapus dari ruas.');
    }

    public function save(Request $request, $id)
    {
        $validated = $request->validate([
            'ruas_id' => 'required|exists:ruas_jalan,id',
            'nm_titik' => 'required|string|max:255',
            'tipe' => 'required|in:Awal,Akhir',
        ]);

        $ruas_id = $validated['ruas_id'];
        $nm_titik = $validated['nm_titik'];
        $tipe = $validated['tipe'];
        $mode = $request->input('mode');

        if ($mode) {
            if ($tipe === 'Awal') {
                $exists = RuasJalan::where('id', $ruas_id)
                    ->whereNotNull('tk_ruas_aw')
                    ->exists();
            } else {
                $exists = RuasJalan::where('id', $ruas_id)
                    ->whereNotNull('tk_ruas_ak')
                    ->exists();
            }

            if ($exists) {
                return response()->json([
                    'message' => ['Titik gagal disimpan karena sudah ada titik tersebut!']
                ], 422);
            }
        }

        $saveTitik = RuasJalan::findOrFail($id);

        if ($tipe === 'Awal') {
            $saveTitik->tk_ruas_aw = $nm_titik;
        } else {
            $saveTitik->tk_ruas_ak = $nm_titik;
        }

        $saveTitik->save();

        return response()->json(['message' => 'Titik berhasil diperbarui!']);
    }

    public function datatable()
    {
        return Inertia::render('datatable/Index');
    }
}
