<!DOCTYPE html>
<html lang="en" class="{{ session('theme', 'light') === 'dark' ? 'dark' : '' }}">
<!-- class="" phải để trống, hoặc có thể viết class="dark" nếu bạn muốn mặc định dark -->

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bitrix24 CRM Automation</title>
    @vite('resources/css/app.css')
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body class="bg-gray-50 text-gray-900">


    <div class="min-h-screen">
        @yield('content')
    </div>

</body>
</html>
