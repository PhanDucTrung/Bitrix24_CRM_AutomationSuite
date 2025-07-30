<?php

use App\Http\Controllers\LeadController;
use App\Http\Controllers\DashboardController;
Route::get('/leads/{name}/related', [LeadController::class, 'showRelated'])->name('leads.related');

Route::get('/leads/search', [LeadController::class, 'search'])->name('leads.search');

Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');

Route::get('/leads/create', [LeadController::class, 'create'])->name('leads.create');

Route::post('/leads', [LeadController::class, 'store'])->name('leads.store');

Route::get('/leads/{id}/edit', [LeadController::class, 'edit'])->name('leads.edit');

Route::patch('/leads/{id}', [LeadController::class, 'update'])->name('leads.update');

Route::delete('/leads/{id}', [LeadController::class, 'destroy'])->name('leads.destroy');


Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/dashboard/data', [DashboardController::class, 'data']);

Route::post('/toggle-theme', function (Illuminate\Http\Request $request) {
    session(['theme' => $request->theme]);
    return response()->json(['status' => 'ok']);
});
