import requests
import numpy as np
from indicators.indicators import rsi, skdj, macd, bollinger, atr, adx
import random

def get_binance_klines(symbol="BTCUSDT", interval="3m", limit=50):
    url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval={interval}&limit={limit}"
    try:
        data = requests.get(url, timeout=3).json()
        closes = [float(k[4]) for k in data]
        highs = [float(k[2]) for k in data]
        lows = [float(k[3]) for k in data]
        return closes, highs, lows
    except:
        return [], [], []

def evaluate_strategy():
    closes, highs, lows = get_binance_klines()
    if len(closes) < 30:
        return {
            "structure": "数据不足",
            "score": 0,
            "action": "观望",
            "direction": "无",
            "hit": False
        }

    rsi_vals = rsi(closes)
    k_vals, d_vals = skdj(closes)
    macd_line, macd_signal = macd(closes)
    upper, middle, lower = bollinger(closes)
    atr_vals = atr(highs, lows, closes)
    adx_vals = adx(highs, lows, closes)

    # 趋势判断
    is_trending = (
        adx_vals[-1] > 25 and
        (upper[-1] - lower[-1]) / middle[-1] > 0.05 and
        macd_line[-1] > macd_signal[-1]
    )
    structure = "趋势行情" if is_trending else "震荡行情"

    # 打分逻辑
    score = 0
    if rsi_vals[-1] < 20: score += 1
    if rsi_vals[-1] > 80: score += 1
    if k_vals[-1] > d_vals[-1]: score += 1
    if macd_line[-1] > macd_signal[-1]: score += 1
    if closes[-1] < lower[-1] or closes[-1] > upper[-1]: score += 1
    if atr_vals[-1] > np.mean(atr_vals[-5:]) * 1.2: score += 1

    if score >= 5:
        action = "强信号，建议重仓"
    elif score >= 3:
        action = "信号成立，可轻仓"
    else:
        action = "信号不足，观望"

    direction = "多单" if rsi_vals[-1] < 30 else "空单"

    # 模拟 hit 概率（震荡胜率高）
    hit = random.random() < (0.7 if not is_trending else 0.45)

    return {
        "structure": structure,
        "score": score,
        "action": action,
        "direction": direction,
        "hit": hit
    }
