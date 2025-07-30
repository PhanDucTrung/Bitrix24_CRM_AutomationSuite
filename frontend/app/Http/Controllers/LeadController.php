<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LeadController extends Controller
{
    protected $apiUrl;

    public function __construct()
    {
        $this->apiUrl = env('BACKEND_API_URL') . '/api/leads';
    }

public function index(Request $request)
{
    $query = $request->query();
    $response = Http::get($this->apiUrl, $query);
    $data = $response->json(); // Gồm cả leads và customFields

    // Lấy đúng phần leads ra
    $leads = $data['leads'] ?? [];
 
     $uniqueSourceIds = $data['uniqueSourceIds'] ?? []; 
     $uniqueStatusIds = $data['uniqueStatusIds'] ?? [];

    return view('leads.index', compact('leads','uniqueStatusIds','uniqueSourceIds'));
}


    public function create()
    {
        return view('leads.create');
    }

   
public function store(Request $request)
{
        
    // Lấy raw dữ liệu đầy đủ (bao gồm cả array lồng)
    $formData = $request->all();

    // Build đúng định dạng payload
    $data = [
        'TITLE' => $formData['TITLE'],
        'NAME' => $formData['NAME'],
        'SOURCE_ID' => $formData['SOURCE_ID'], 
        'STATUS_ID' => $formData['STATUS_ID'], 
        'PHONE' => $formData['PHONE'], 
        'EMAIL' => $formData['EMAIL'],
        'OPPORTUNITY' => $formData['OPPORTUNITY'],
        
    ];
        
  
    // Gửi đến NestJS
    $response = Http::post('http://localhost:3000/api/leads', $data);

    if ($response->successful()) {
        return redirect()->route('leads.index')->with('success', 'Lead created successfully in Bitrix24!');
    } else {
        return back()->withErrors(['error' => 'Failed to create lead: ' . $response->body()]);
    }
}

    public function edit($id)
    {
        $response = Http::get("{$this->apiUrl}/{$id}/edit");
        $lead = $response->json();
        return view('leads.edit', compact('lead'));
    }

    public function update(Request $request, $id)
    {
        $formData = $request->all();

    // Build đúng định dạng payload
    $data = [
        'TITLE' => $formData['TITLE'],
        'NAME' => $formData['NAME'],
        'SOURCE_ID' => $formData['SOURCE_ID'], 
        'STATUS_ID' => $formData['STATUS_ID'], 
        'PHONE' => $formData['PHONE'], 
        'COMMENTS' => $formData['COMMENTS'], 
        'EMAIL' => $formData['EMAIL'],
        'OPPORTUNITY' => $formData['OPPORTUNITY'],
    ];
    
        Http::patch("{$this->apiUrl}/{$id}", $data);

        return redirect()->route('leads.index')->with('success', 'Lead đã được cập nhật');
    }

    public function destroy($id)
    {
        Http::delete("{$this->apiUrl}/{$id}");

        return redirect()->route('leads.index')->with('success', 'Lead đã bị xóa');
    }

    public function search(Request $request)
{
    $query = $request->all();
    $response = Http::get( $this->apiUrl.'/search', $query);
    $data = $response->json(); // Gồm cả leads và customFields

    // Lấy đúng phần leads ra
    $leads = $data['leads'] ?? [];
       $uniqueSourceIds = $data['uniqueSourceIds'] ?? []; 
     $uniqueStatusIds = $data['uniqueStatusIds'] ?? [];

     return view('leads.index', compact('leads','uniqueStatusIds','uniqueSourceIds'));
}



public function showRelated($name)
{
    $response = Http::get("http://localhost:3000/api/leads/{$name}/related");

    if ($response->failed()) {
        return back()->with('error', 'Không thể lấy dữ liệu liên quan.');
    }

    $data = $response->json();
//  dd($data);
    return view('leads.related', [
        'title' => $name,
        'tasks' => $data['tasks'] ?? [],
        'deals' => $data['deals'] ?? [],
    ]);
}



}