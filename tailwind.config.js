/**
 * Tailwind CSS 自定义配置
 */
module.exports = {
    theme: {
        extend: {
            colors: {
                'crypto-green': '#00B578', // 上涨颜色
                'crypto-red': '#F53F3F',   // 下跌颜色
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        }
    }
}
