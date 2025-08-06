/**
 * Vercel Serverless Function - 代理币安K线数据API
 */
export default async function handler(req, res) {
    // 获取请求参数
    const { 
        symbol = 'BTCUSDT', 
        interval = '1h', 
        limit = 100 
    } = req.query;

    // 验证参数（防止恶意请求）
    const validIntervals = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
    if (!validIntervals.includes(interval)) {
        return res.status(400).json({ error: '无效的时间周期' });
    }

    try {
        // 调用币安K线API
        const binanceRes = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
        );
        
        if (!binanceRes.ok) throw new Error('币安K线API请求失败');
        
        // 格式化数据
        const rawData = await binanceRes.json();
        const formattedData = rawData.map(item => ({
            time: item[0], // 时间戳
            open: parseFloat(item[1]),
            high: parseFloat(item[2]),
            low: parseFloat(item[3]),
            close: parseFloat(item[4]),
            volume: parseFloat(item[5])
        }));

        res.status(200).json(formattedData);
    } catch (error) {
        console.error('K线数据代理错误:', error);
        res.status(500).json({ error: '获取K线数据失败' });
    }
}
