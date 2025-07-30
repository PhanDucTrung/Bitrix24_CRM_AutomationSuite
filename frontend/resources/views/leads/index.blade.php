@extends('layouts.app')

@section('content')
<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Danh sách Lead</h1>
    <div class="mb-4 flex gap-4 items-center">
        <a href="{{ route('leads.create') }}" class="bg-blue-500 text-white px-4 py-2 rounded">Thêm Lead</a>
    <br>
    <a href="{{ route('dashboard') }}" class="bg-blue-500 text-white px-4 py-2 rounded">xem biểu đồ </a>
    <br>
    </div>
    


    
    @if(session('success'))
        <div class="bg-green-100 text-green-800 p-2 mt-2 rounded">{{ session('success') }}</div>
    @endif

        <form method="GET" action="{{ route('leads.search') }}" class="my-4 flex flex-wrap gap-2">
        <input type="text" name="keyword" value="{{ request('keyword') }}" placeholder="Tìm theo tên, email, phone, title"
            class="border p-2 rounded w-full sm:w-auto" />

            <select name="status" class="border p-2 rounded">
            <option value="">-- Trạng thái --</option>
            @foreach ($uniqueStatusIds as $status)
                <option value="{{ $status }}" {{ request('status') == $status ? 'selected' : '' }}>
                    {{ $status }}
                </option>
            @endforeach
        </select>

        <select name="source" class="border p-2 rounded">
        <option value="">-- Trạng thái --</option>
        @foreach ($uniqueSourceIds as $source)
            <option value="{{ $source }}" {{ request('source') == $source ? 'selected' : '' }}>
                {{ $source }}
            </option>
        @endforeach
        </select>   

        <select name="sortBy" class="border p-2 rounded">
            <option value="">-- Sắp xếp theo --</option>
            <option value="DATE_CREATE" {{ request('sortBy') == 'DATE_CREATE' ? 'selected' : '' }}>Ngày tạo</option>
            <option value="TITLE" {{ request('sortBy') == 'TITLE' ? 'selected' : '' }}>Tiêu đề</option>
        <!-- <option value="">Sắp xếp theo</option>
        <option value="DATE_CREATE">Ngày tạo</option>
        <option value="TITLE">Tiêu đề</option> -->
        </select>

        <select name="order" class="border p-2 rounded">
            <option value="asc" {{ request('order') == 'asc' ? 'selected' : '' }}>Tăng dần</option>
            <option value="desc" {{ request('order') == 'desc' ? 'selected' : '' }}>Giảm dần</option> -->
                <!-- <option value="asc">Tăng dần</option>
                <option value="desc">Giảm dần</option> -->
        </select>

        <button type="submit" class="bg-blue-600 text-black px-4 py-2 rounded">Lọc</button>
    </form>

    <table class="table-auto w-full mt-4 border-collapse border border-gray-300">

        <thead>
    <tr class="bg-gray-100" text-center>
        <th class="px-4 py-2 ">Tiêu đề</th>
        <th class="px-4 py-2 ">Tên</th>
        <th class="px-4 py-2 ">Email</th>
        <th class="px-4 py-2 ">Phone</th>
        <th class="px-4 py-2 ">Giá trị </th>
        <th class="px-4 py-2 ">Trạng thái</th>
        <!-- <th class="px-4 py-2 ">Bình luận</th> -->
        <!-- <th class="px-4 py-2 ">Nguồn</th> -->
        <!-- <th class="px-4 py-2 ">Ngày tạo</th> -->
        <th class="px-4 py-2 ">Hành động</th>
    </tr>
</thead>

        <tbody>
            @foreach ($leads as $lead)
            
            <tr class="text-center align-middle">  
        <td>
         <a href="{{ route('leads.related',$lead['TITLE']) }}">
        {{ $lead['TITLE'] }}
        </a>
        </td>
        <td class="px-4 py-2 ">{{ $lead['NAME'] }}</td>
        <td class="px-4 py-2 ">{{ $lead['EMAIL'] }}</td>
        <td class="px-4 py-2 ">{{ $lead['PHONE'] }}</td>
        <td class="px-4 py-2 ">{{ $lead['OPPORTUNITY'] }}</td>
        <td class="px-4 py-2 ">{{ $lead['STATUS_ID'] }}</td>
        <!-- <td class="px-4 py-2 ">{{ $lead['COMMENTS'] }}</td> -->
        <!-- <td class="px-4 py-2 ">{{ $lead['SOURCE_ID'] }}</td> -->
        <!-- <td class="px-4 py-2 ">{{ $lead['DATE_CREATE'] }}</td> -->
        <td class="px-4 py-2 ">
                    <a href="{{ route('leads.edit', $lead['ID']) }}" class="text-blue-500">Sửa</a>
                    <form action="{{ route('leads.destroy', $lead['ID']) }}" method="POST" class="inline">
                        @csrf
                        @method('DELETE')
                        <button type="submit" onclick="return confirm('Xác nhận xóa?')" class="text-red-500">Xóa</button>
                    </form>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection
