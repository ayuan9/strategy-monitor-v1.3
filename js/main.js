// 导入工具函数
import { fetchMarketData, fetchKlines } from './api.js';
import { initChart, updateChart } from './chart.js';

// DOM元素
const btcPriceEl = document.getElementById('btc-price');
const btcChangeEl = document.getElementById('btc-change');
const marketsTableEl = document.getElementById('markets-table');
const refreshBtn = document.getElementById('refresh-btn');
const searchInput = document.getElementById('search-input');
const intervalBtns = document.querySelectorAll('.time-interval-btn');

// 全局状态
let currentInterval = '1h';
let allMarketData = [];

// 格式化货币
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: value < 1 ? 6 : 2,
        maximumFractionDigits: value < 1 ? 6 : 2
    }).format(value);
}

// 格式化大数字
function formatLargeNumber(value) {
    if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
    return value.toFixed(0);
}

// 填充市场表格
function renderMarketsTable(filteredData = null) {
    const data = filteredData || allMarketData;
    marketsTableEl.innerHTML = '';

    data.slice(0, 20).forEach((coin, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-700 hover:bg-gray-900/50 transition-colors';
        
        const changeClass = coin.priceChangePercent >= 0 ? 'text-crypto-green' : 'text-crypto-red';
        const changeIcon = coin.priceChangePercent >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

        row.innerHTML = `
            <td class="py-4 px-2">${index + 1}</td>
            <td class="py-4 px-2">
                <div class="flex items-center space-x-3">
                    <img src="https://cryptologos.cc/logos/${coin.symbol.toLowerCase()}-${coin.symbol.toLowerCase()}-logo.png?v=023" 
                         alt="${coin.name}" class="w-8 h-8 rounded-full" 
                         onerror="this.src='https://picsum.photos/200/200'">
                    <div>
                        <div class="font-medium">${coin.name}</div>
                        <div class="text-gray-400 text-sm">${coin.symbol}</div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-2 text-right">${formatCurrency(coin.lastPrice)}</td>
            <td class="py-4 px-2 text-right ${changeClass}">
                <<i class="fa ${changeIcon} mr-1"></</i>${Math.abs(coin.priceChangePercent).toFixed(2)}%
            </td>
            <td class="py-4 px-2 text-right text-gray-400">${formatLargeNumber(coin.volume)}</td>
        `;
        
        marketsTableEl.appendChild(row);
    });
}

// 更新BTC价格展示
function updateBTCInfo(marketData) {
    const btcData = marketData.find(item => item.symbol === 'BTCUSDT');
    if (!btcData) return;

    btcPriceEl.textContent = formatCurrency(btcData.lastPrice);
    
    const changeClass = btcData.priceChangePercent >= 0 ? 'text-crypto-green' : 'text-crypto-red';
    const changeIcon = btcData.priceChangePercent >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    
    btcChangeEl.className = `flex items-center justify-end ${changeClass}`;
    btcChangeEl.innerHTML = `<<i class="fa ${changeIcon} mr-1"></</i><span>${Math.abs(btcData.priceChangePercent).toFixed(2)}%</span>`;
}

// 初始化页面
async function init() {
    try {
        // 加载市场数据
        const marketData = await fetchMarketData();
        allMarketData = marketData.sort((a, b) => a.symbol.localeCompare(b.symbol));
        renderMarketsTable();
        updateBTCInfo(marketData);

        // 初始化图表
        const klinesData = await fetchKlines('BTCUSDT', currentInterval);
        initChart(klinesData);

    } catch (error) {
        console.error('初始化失败:', error);
        alert('加载数据失败，请重试');
    }
}

// 事件监听
refreshBtn.addEventListener('click', async () => {
    refreshBtn.classList.add('animate-spin');
    try {
        const marketData = await fetchMarketData();
        allMarketData = marketData;
        renderMarketsTable();
        updateBTCInfo(marketData);
        
        const klinesData = await fetchKlines('BTCUSDT', currentInterval);
        updateChart(klinesData);
    } catch (error) {
        console.error('刷新失败:', error);
    } finally {
        refreshBtn.classList.remove('animate-spin');
    }
});

// 搜索功能
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allMarketData.filter(
        item => item.name.toLowerCase().includes(query) || item.symbol.toLowerCase().includes(query)
    );
    renderMarketsTable(filtered);
});

// 时间周期切换
intervalBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        // 更新按钮样式
        intervalBtns.forEach(b => b.className = 'time-interval-btn bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full text-sm');
        btn.className = 'time-interval-btn bg-blue-600 text-white px-3 py-1 rounded-full text-sm';
        
        // 更新图表
        currentInterval = btn.dataset.interval;
        try {
            const klinesData = await fetchKlines('BTCUSDT', currentInterval);
            updateChart(klinesData);
        } catch (error) {
            console.error('更新K线失败:', error);
        }
    });
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
