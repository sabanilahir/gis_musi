<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\UserFileController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\SettingAppController;
use App\Http\Controllers\MediaFolderController;
use App\Http\Controllers\RuasJalanController;
use App\Http\Controllers\PatokController;
use App\Http\Controllers\InformasiRuasController;
use App\Http\Controllers\DashboardUserController;
use App\Http\Controllers\TitikController;

// Route::get('/', function () {
//     return Inertia::render('welcome');
// })->name('home');
Route::get('/', [RuasJalanController::class, 'map'])->name('home');

Route::middleware(['auth', 'menu.permission'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('roles', RoleController::class);
    Route::resource('menus', MenuController::class);
    Route::post('menus/reorder', [MenuController::class, 'reorder'])->name('menus.reorder');
    Route::resource('permissions', PermissionController::class);
    Route::resource('users', UserController::class);
    Route::put('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
    Route::get('/settingsapp', [SettingAppController::class, 'edit'])->name('setting.edit');
    Route::post('/settingsapp', [SettingAppController::class, 'update'])->name('setting.update');
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
    Route::post('/backup/run', [BackupController::class, 'run'])->name('backup.run');
    Route::get('/backup/download/{file}', [BackupController::class, 'download'])->name('backup.download');
    Route::delete('/backup/delete/{file}', [BackupController::class, 'delete'])->name('backup.delete');
    Route::get('/files', [UserFileController::class, 'index'])->name('files.index');
    Route::post('/files', [UserFileController::class, 'store'])->name('files.store');
    Route::delete('/files/{id}', [UserFileController::class, 'destroy'])->name('files.destroy');
    Route::resource('media', MediaFolderController::class);

    Route::resource('ruas-jalan', RuasJalanController::class)->except(['show']);
    Route::get('/ruas-jalan', [RuasJalanController::class, 'index'])
        ->name('ruas-jalan.index');
    Route::post('/ruas-jalan/import', [RuasJalanController::class, 'import'])
        ->name('ruas-jalan.import')
        ->middleware(['auth', 'verified']);
    // Route::get('/ruas-jalan/map', [RuasJalanController::class, 'map'])->name('ruas.map');
    Route::get('/ruas-jalan/{id}', [RuasJalanController::class, 'show'])->name('ruas-jalan.show');

    Route::get('/patok', [PatokController::class, 'index'])->name('patok.index');
    Route::put('/patok/{id}', [PatokController::class, 'update'])->name('patok.update');
    Route::put('/patok/{id}/update-patok', [PatokController::class, 'updatePatok'])
    ->name('patok.updatePatok');
    Route::delete('/patok/{id}', [PatokController::class, 'destroy'])
    ->name('patok.destroy');

    Route::get('/titik', [TitikController::class, 'index'])->name('titik.index');
    Route::put('/titik/save/{id}', [TitikController::class, 'save'])->name('titik.save');
    Route::delete('/titik/{ruas_id}/tipe/{tipe}', [TitikController::class, 'destroy'])->name('titik.destroy');


Route::prefix('informasi-ruas')->group(function () {
    Route::get('/', [InformasiRuasController::class, 'index'])->name('informasi-ruas.index');
    Route::get('/{id}/preview', [InformasiRuasController::class, 'preview'])->name('informasi-ruas.preview');
    Route::get('/{id}/qrcode', [InformasiRuasController::class, 'generateQrCode'])->name('informasi-ruas.qrcode');

});



Route::get('/dashboard-user', [DashboardUserController::class, 'index'])
    ->name('dashboard.user')
    ->middleware(['auth']);

});


Route::get('/log-test', function () {
    Log::info('✅ Log test dari route berhasil!');
    return 'Cek file storage/logs/laravel.log';
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
