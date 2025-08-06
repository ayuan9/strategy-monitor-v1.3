/**
 * 图表渲染相关功能
 */

let chartInstance = null;

// 初始化图表
export function initChart(klinesData) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // 准备数据
    const labels = klinesData.map(item => new Date(item.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    }));
    
    const prices = klinesData.map(item => item.close);

    // 创建渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    // 销毁已有图表
    if (chartInstance) chartInstance.destroy();

    // 创建新图表
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'BTC Price (USDT)',
                data: prices,
                borderColor: '#3B82F6',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#3B82F6',
                tension: 0.2,
                fill: true,
                backgroundColor: gradient
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (ctx) => `$${ctx.raw.toFixed(2)}`,
                        title: (ctx) => new Date(klinesData[ctx[0].dataIndex].time).toLocaleString()
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: 'rgba(156, 163, 175, 0.7)' }
                },
                y: {
                    position: 'right',
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    ticks: { 
                        color: 'rgba(156, 163, 175, 0.7)',
                        callback: (value) => `$${value.toLocaleString()}`
                    }
                }
            },
            animation: { duration: 500 }
        }
    });
}

// 更新图表数据
export function updateChart(klinesData) {
    if (!chartInstance) return initChart(klinesData);

    const labels = klinesData.map(item => new Date(item.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    }));
    
    const prices = klinesData.map(item => item.close);

    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = prices;
    chartInstance.update();
}
