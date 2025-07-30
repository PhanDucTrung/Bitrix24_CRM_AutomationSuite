@extends('layouts.app')

@section('content')

<!-- Nút chuyển theme -->
<button id="toggleTheme" class="fixed top-4 right-4 z-50 bg-gray-200 dark:bg-gray-800 text-black dark:text-white px-3 py-2 rounded flex items-center gap-2">
    <span id="themeIcon">🌞</span>

</button>

<div class="container mx-auto p-4 text-gray-900 dark:text-gray">
    <h1 class="text-3xl font-bold mb-4">Dashboard Phân tích</h1>

    <div class="mb-4 flex gap-4 items-center">
        <label for="startDate">Từ ngày:</label>
        <input type="date" id="startDate" class="border px-2 py-1 rounded bg-gray-800 dark:text-gray">

        <label for="endDate">Đến ngày:</label>
        <input type="date" id="endDate" class="border px-2 py-1 rounded bg-gray-800 dark:text-gray">

        <button id="applyFilter" class="bg-blue-500 text-white px-4 py-1 rounded">Áp dụng</button>
    </div>

    <div id="leadSummary" class="bg-white bg-gray-800 rounded shadow p-4 mb-4 text-sm text-gray-900 dark:text-gray"></div>

    <div class="flex justify-center gap-6 tasklead">
        <canvas id="leadPieChart" width="300" height="300" class="bg-white dark:bg-gray-800 rounded shadow mt-6"></canvas>
        <canvas id="conversionPieChart" width="300" height="300" class="bg-white dark:bg-gray-800 rounded shadow mt-6"></canvas>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div class="w-full">
        <canvas id="leadChart" class="bg-white dark:bg-gray-800 rounded shadow p-4 w-full h-72"></canvas>
    </div>
    <div class="w-full">
        <canvas id="revenueChart" class="bg-white dark:bg-gray-800 rounded shadow p-4 w-full h-72"></canvas>
    </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    function getDateRangeArray(start, end) {
        const dates = [];
        const current = new Date(start);
        const endDate = new Date(end);
        while (current <= endDate) {
            const yyyy = current.getFullYear();
            const mm = String(current.getMonth() + 1).padStart(2, '0');
            const dd = String(current.getDate()).padStart(2, '0');
            dates.push(`${yyyy}-${mm}-${dd}`);
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }

    async function loadCharts(startDate = null, endDate = null) {
        let url = '/dashboard/data';
        if (startDate && endDate) {
            url += `?start=${startDate}&end=${endDate}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        const leadCounts = data.leads;
        const revenueByDate = data.deals.revenueByDate;
        const conversionRate = Math.floor(data.deals.conversionRate);

        const leadSummaryDiv = document.getElementById('leadSummary');
        leadSummaryDiv.innerHTML = Object.entries(data.tasks)
            .map(([status, count]) => `<p><strong> Số task đã hoàn thành của 
            ${status}</strong>: ${count}</p>`)
            .join('');

        // Xóa và tạo lại các biểu đồ
        document.getElementById('leadChart').remove(); 
        document.getElementById('revenueChart').remove();
        document.getElementById('leadPieChart').remove();
        document.getElementById('conversionPieChart').remove();

        document.querySelector('.grid').innerHTML = `
    <div class="w-full">
        <canvas id="leadChart" class="bg-white dark:bg-gray-800 rounded shadow p-4 w-full h-72"></canvas>
    </div>
    <div class="w-full">
        <canvas id="revenueChart" class="bg-white dark:bg-gray-800 rounded shadow p-4 w-full h-72"></canvas>
    </div>
`;


        document.querySelector('.tasklead').innerHTML = `
            <canvas id="leadPieChart" width="300" height="300" class="bg-white dark:bg-gray-800 rounded shadow mt-6"></canvas>
            <canvas id="conversionPieChart" width="300" height="300" class="bg-white dark:bg-gray-800 rounded shadow mt-6"></canvas>
        `;

        // Biểu đồ cột trạng thái lead
        new Chart(document.getElementById('leadChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(leadCounts),
                datasets: [{
                    label: 'Trạng thái Lead',
                    data: Object.values(leadCounts),
                    backgroundColor: ['#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EF4444']
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } },
                plugins: {
                    title: { display: true, text: 'Thống kê Lead' }
                }
            }
        });

        // Biểu đồ tròn phân bố trạng thái Lead
        new Chart(document.getElementById('leadPieChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(leadCounts),
                datasets: [{
                    label: 'Trạng thái Lead',
                    data: Object.values(leadCounts),
                    backgroundColor: ['#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EF4444']
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Phân bố trạng thái Lead' }
                }
            }
        });

        // Biểu đồ tròn tỷ lệ chuyển đổi
        const remaining = 100 - conversionRate;
        new Chart(document.getElementById('conversionPieChart'), {
            type: 'pie',
            data: {
                labels: ['Đã chuyển sang Deal', 'Chưa chuyển'],
                datasets: [{
                    data: [conversionRate, remaining],
                    backgroundColor: ['#10B981', '#E5E7EB']
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Tỷ lệ chuyển đổi Lead → Deal (%)' },
                    legend: { position: 'bottom' }
                }
            }
        });

        // Biểu đồ doanh thu
        let from = startDate, to = endDate;
        if (!from || !to) {
            const now = new Date();
            to = now.toISOString().slice(0, 10);
            const past = new Date();
            past.setDate(now.getDate() - 6);
            from = past.toISOString().slice(0, 10);
        }

        const fullDates = getDateRangeArray(from, to);
        const values = fullDates.map(date => revenueByDate[date] || 0);

        new Chart(document.getElementById('revenueChart'), {
            type: 'line',
            data: {
                labels: fullDates,
                datasets: [{
                    label: 'Doanh thu dự kiến',
                    data: values,
                    borderColor: '#3B82F6',
                    fill: false
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } },
                plugins: {
                    title: { display: true, text: `Doanh thu dự kiến (${from} → ${to})` }
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadCharts();

        document.getElementById('applyFilter').addEventListener('click', () => {
            const start = document.getElementById('startDate').value;
            const end = document.getElementById('endDate').value;
            if (start && end) {
                loadCharts(start, end);
            } else {
                alert('Vui lòng chọn đủ cả 2 ngày.');
            }
        });



        function applyThemeClasses(isDark) {
    const elements = [
        document.getElementById('leadPieChart'),
        document.getElementById('conversionPieChart'),
        document.getElementById('leadChart'),
        document.getElementById('revenueChart'),
        document.getElementById('toggleTheme'),
    ];

    elements.forEach(el => {
        if (!el) return;
        if (isDark) {
            el.classList.add('dark:bg-gray-800');
            el.classList.remove('bg-white');
        } else {
            el.classList.remove('dark:bg-gray-800');
            el.classList.add('bg-white');
        }
    });
        }


        // Theme toggle
        const toggleBtn = document.getElementById('toggleTheme');
        const themeIcon = document.getElementById('themeIcon');

        const updateIcon = () => {
            const isDark = document.documentElement.classList.contains('dark');
            themeIcon.textContent = isDark ? '🌙' : '🌞';
        };

        updateIcon();

toggleBtn.addEventListener('click', async () => {
       const isDarkNow = document.documentElement.classList.contains('dark');
    const newTheme = isDarkNow ? 'light' : 'dark';

    // Toggle class trên <html>
    document.documentElement.classList.toggle('dark');

    // Gửi theme lên server nếu cần
    await fetch('/toggle-theme', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify({ theme: newTheme }),
    });

    // Cập nhật class theo theme mới
    applyThemeClasses(newTheme === 'dark');

    
    updateIcon();
});


    });
</script>
@endsection
