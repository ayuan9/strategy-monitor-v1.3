
document.addEventListener("DOMContentLoaded", function () {
  const statusBox = document.getElementById("status-box");
  const tradesTable = document.getElementById("trades-body");
  const winrateChart = document.getElementById("winrate-chart").getContext("2d");

  fetch("/api/status")
    .then(res => res.json())
    .then(data => {
      // 显示当前策略状态
      statusBox.innerHTML = `
        <p><strong>当前时间：</strong>${data.timestamp}</p>
        <p><strong>结构判断：</strong>${data.structure}</p>
        <p><strong>策略打分：</strong>${data.score}</p>
        <p><strong>当前方向：</strong>${data.action}</p>
      `;

      // 填充交易记录表格
      tradesTable.innerHTML = "";
      data.trades.forEach(trade => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${trade.time}</td>
          <td>${trade.direction}</td>
          <td>${trade.score}</td>
          <td>${trade.hit ? "✔️" : "❌"}</td>
          <td>${trade.profit}</td>
        `;
        tradesTable.appendChild(row);
      });

      // 绘制胜率曲线
      new Chart(winrateChart, {
        type: "line",
        data: {
          labels: data.winrate_history.map((_, i) => i + 1),
          datasets: [{
            label: "胜率历史 (%)",
            data: data.winrate_history,
            fill: false,
            borderColor: "blue",
            tension: 0.2
          }]
        },
        options: {
          scales: {
            y: {
              min: 0,
              max: 100
            }
          }
        }
      });
    })
    .catch(err => {
      statusBox.innerHTML = "<p style='color:red;'>数据加载失败：" + err + "</p>";
      console.error("请求失败：", err);
    });
});
