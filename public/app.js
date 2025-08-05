// 自动每3分钟刷新页面
setInterval(() => location.reload(), 180000);

// 页面加载时触发数据获取
document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/status")
        .then(res => res.json())
        .then(data => {
            // 更新时间
            document.getElementById("updated").textContent = data.timestamp;
            document.getElementById("market-structure").textContent = data.structure;
            document.getElementById("score").textContent = data.score;
            document.getElementById("action").textContent = data.action;

            // 填充交易记录表格
            const table = document.getElementById("tradeTable");
            data.trades.slice(-20).reverse().forEach(trade => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${trade.time}</td>
                    <td>${trade.direction}</td>
                    <td>${trade.score}</td>
                    <td>${trade.hit ? "✅" : "❌"}</td>
                    <td style="color:${trade.profit > 0 ? 'green' : 'red'}">${trade.profit}</td>
                `;
                table.appendChild(row);
            });

            // 渲染胜率图表
            renderWinrateChart(data.winrate_history);
        });
});

// 导出CSV
document.getElementById("export").addEventListener("click", () => {
    window.location.href = "/api/export";
});

// 胜率曲线渲染
function renderWinrateChart(history) {
    const ctx = document.getElementById("winrateChart").getContext("2d");
    const labels = history.map((_, i) => i + 1);
    const values = history;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '胜率(%)',
                data: values,
                borderColor: 'blue',
                backgroundColor: 'rgba(0,0,255,0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            scales: {
                y: { min: 0, max: 100 }
            },
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}
