/**
 * Vercel Serverless Function - 代理币安市场数据API
 * 用于解决前端跨域问题
 */
export default async function handler(req, res) {
    try {
        // 调用币安公开API（24小时行情数据）
        const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!binanceRes.ok) throw new Error('币安API请求失败');
        
        const rawData = await binanceRes.json();
        
        // 筛选USDT交易对并添加名称（简化处理）
        const usdtPairs = rawData
            .filter(item => item.symbol.endsWith('USDT') && !item.symbol.includes('UP') && !item.symbol.includes('DOWN'))
            .map(item => ({
                ...item,
                name: getCryptoName(item.symbol.replace('USDT', '')) // 简单映射名称
            }));

        res.status(200).json(usdtPairs);
    } catch (error) {
        console.error('市场数据代理错误:', error);
        res.status(500).json({ error: '获取市场数据失败' });
    }
}

// 简单的币种名称映射（实际应用中可使用更完整的映射表）
function getCryptoName(symbol) {
    const nameMap = {
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum',
        'BNB': 'Binance Coin',
        'SOL': 'Solana',
        'ADA': 'Cardano',
        'XRP': 'Ripple',
        'DOT': 'Polkadot',
        'DOGE': 'Dogecoin',
        'LINK': 'Chainlink',
        'UNI': 'Uniswap'
    };
    return nameMap[symbol] || symbol;
}
