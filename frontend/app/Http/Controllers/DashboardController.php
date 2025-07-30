<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DashboardController extends Controller
{
  public function index() {
    return view('dashboard');
}

public function data() {

    $leads = Http::get("http://localhost:3000/api/analytics/leads")->json();
    $deals = Http::get("http://localhost:3000/api/analytics/deals")->json();
    $tasks = Http::get("http://localhost:3000/api/analytics/tasks")->json() ?? [0];

    return response()->json(compact('leads', 'deals','tasks'));
}

}