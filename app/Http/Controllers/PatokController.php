<?php

namespace App\Http\Controllers;

use App\Models\RuasJalan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PatokController extends Controller
{
    public function index()
    {
        // Ambil semua data dari tabel ruas_jalan
        $patokList = \App\Models\RuasJalan::select('id', 'nm_ruas', 'kd_patok')
            ->orderBy('id', 'asc')
            ->get();

        // Kalau kamu mau dropdown filter "Ruas", bisa ambil daftar ruas unik juga
        // $ruasList = \App\Models\RuasJalan::select('id', 'nm_ruas')->orderBy('nm_ruas')->get();
        $ruasList = RuasJalan::whereNull('kd_patok')
            ->select('id', 'nm_ruas')
            ->orderBy('nm_ruas')
            ->get();

        return Inertia::render('patok/Index', [
            'patokList' => $patokList,
            'ruasList' => $ruasList,
        ]);
    }

    public function destroy($id)
    {
        $ruas = RuasJalan::findOrFail($id);

        // hanya hapus kd_patok dari ruas
        $ruas->update(['kd_patok' => null]);

        \Log::info("🗑️ Patok dihapus dari ruas: {$ruas->nm_ruas}");

        return redirect()->route('patok.index')->with('success', 'Patok berhasil dihapus dari ruas.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'kd_patok' => 'nullable|string|max:255',
        ]);

        $ruas = \App\Models\RuasJalan::findOrFail($id);
        $ruas->update($validated);

        return redirect()->route('patok.index')->with('success', 'Nama patok berhasil diperbarui.');
    }
    public function updatePatok(Request $request, $id)
    {
        $request->validate([
            'kd_patok' => 'required|string|max:255',
        ]);

        $ruas = \App\Models\RuasJalan::findOrFail($id);
        $ruas->kd_patok = $request->kd_patok;
        $ruas->save();

        return back()->with('success', 'Nama patok berhasil disimpan.');
    }


}
