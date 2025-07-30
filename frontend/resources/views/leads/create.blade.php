@extends('layouts.app')

@section('content')
<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Thêm Lead mới</h1>

    @if ($errors->any())
        <div class="bg-red-100 text-red-800 p-2 rounded">
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

  <form action="{{ route('leads.store') }}" method="POST" class="space-y-4">
    @csrf

    <div>
        <label class="block">Tiêu đề</label>
        <input type="text" name="TITLE" class="border p-2 w-full" required>
    </div>

    <div>
        <label class="block">Tên</label>
        <input type="text" name="NAME" class="border p-2 w-full" required>
    </div>
       <div>
        <label class="block">Giá trị </label>
        <input type="number" name="OPPORTUNITY" class="border p-2 w-full" required>
    </div>


    <div>
        <label class="block">Nguồn Dữ liệu </label>      
        <select name="SOURCE_ID" class="border p-2 rounded">
            <option value="WEB" >Trang Web</option>
            <option value="CALL">CALL</option>
            <option value="EMAIL">EMAIL</option>
            <option value="ADVERTISING">Quảng cáo</option>
            <option value="PARTNER">Khách hàng</option>
            <option value="RECOMMENDATION">Gợi ý</option>
            <option value="TRADE_SHOW">Triển lãm thương mại</option>
            <option value="WEBFORM">WEBFORM</option>
            <option value="CALLBACK">Đặt hàng</option>
            <option value="RC_GENERATOR">Người bán hàng</option>
            <option value="STORE">Cửa hàng trực tuyến </option>
            <option value="OTHER">Nguồn khác</option>
        </select>
    </div>

    <div>
        <label class="block">Trạng Thái</label>      
        <select name="STATUS_ID" class="border p-2 rounded">
            <option value="NEW" >Mới</option>
            <option value="IN_PROCESS">Đang Xử Lý</option>
            <option value="PROCESSED">Đã xử lý</option>
            <option value="JUNK">Chất lượng thấp</option>
            <option value="CONVERTED">Chất lượng cao </option>
        </select>
    </div>
    <div>
        <label class="block">Email</label>
        <input type="email" name="EMAIL[0][VALUE]" class="border p-2 w-full" required>
        <input type="hidden" name="EMAIL[0][VALUE_TYPE]" value="WORK">
    </div>

    <div>
        <label class="block">Phone</label>
        <input type="text" name="PHONE[0][VALUE]" class="border p-2 w-full" required>
        <input type="hidden" name="PHONE[0][VALUE_TYPE]" value="WORK">
    </div>

    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Thêm</button>
</form>

</div>
@endsection
