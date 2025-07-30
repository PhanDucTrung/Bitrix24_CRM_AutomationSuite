@extends('layouts.app')

@section('content')
<div class="container mx-auto p-4">
    <h2 class="text-2xl font-bold mb-4">Tasks & Deals liên quan đến lead: <strong>{{ $title }}</strong></h2>
     <a href="{{ route('leads.related',$title)}}" class="bg-green-500 text-white px-4 py-2 rounded mb-4"> ReLoad</a>
     <br><br>
    {{-- Tasks --}}
    <h4 class="text-2xl font-bold mb-4">Tasks</h4>
    <table class="table-auto w-full mt-4 border-collapse border border-gray-300">
        <thead>
            <tr  class="bg-gray-100" >
                <th class="px-4 py-2 ">ID</th>
                <th class="px-4 py-2 ">Tiêu đề</th>
                <th class="px-4 py-2 ">Trạng thái</th>
                <th class="px-4 py-2 ">Người phụ trách</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($tasks as $task)
                <tr class="text-center align-middle" >
                    <td class="px-4 py-2 ">{{ $task['id'] }}</td>
                    <td class="px-4 py-2 ">
                        <a href="{{ url('/task/' . $task['id']) }}">{{ $task['title'] }}</a>
                    </td >
                    <td class="px-4 py-2 ">{{ $task['description'] }}</td>
                    <td class="px-4 py-2 ">{{ $task['creator']['name'] ?? 'N/A' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4">Không có task liên quan</td>
                </tr>
            @endforelse
        </tbody>
    </table>




    <br><br><br>
    {{-- Deals --}}
    <h4 class="text-2xl font-bold mb-4">Deals</h4>
    <table class="table-auto w-full mt-4 border-collapse border border-gray-300">
        <thead>
            <tr  class="bg-gray-100" >
                <th class="px-4 py-2 ">ID</th>
                <th class="px-4 py-2 ">Tiêu đề</th>
                <th class="px-4 py-2 ">Giai đoạn</th>
                <th class="px-4 py-2 ">Giá trị</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($deals as $deal)
                <tr  class="text-center align-middle" >
                    <td class="px-4 py-2 ">{{ $deal['ID'] }}</td>
                    <td class="px-4 py-2 ">
                        <a href="{{ url('/deal/' . $deal['ID']) }}">{{ $deal['TITLE'] }}</a>
                    </td>
                    <td class="px-4 py-2 ">{{ $deal['STAGE_ID'] }}</td>
                    <td class="px-4 py-2 ">{{ $deal['OPPORTUNITY'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4">Không có deal liên quan</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
