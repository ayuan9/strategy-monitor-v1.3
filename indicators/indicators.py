import numpy as np
import pandas as pd

def rsi(closes, period=14):
    deltas = np.diff(closes)
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    avg_gain = np.convolve(gains, np.ones(period)/period, mode='valid')
    avg_loss = np.convolve(losses, np.ones(period)/period, mode='valid')
    rs = avg_gain / (avg_loss + 1e-10)
    rsi = 100 - (100 / (1 + rs))
    return np.concatenate((np.full(period, np.nan), rsi))

def skdj(closes, period=9):
    low_list = np.minimum.accumulate(closes)
    high_list = np.maximum.accumulate(closes)
    rsv = (closes - low_list) / (high_list - low_list + 1e-10) * 100
    k = np.zeros_like(closes)
    d = np.zeros_like(closes)
    k[0], d[0] = 50, 50
    for i in range(1, len(closes)):
        k[i] = 2 / 3 * k[i-1] + 1 / 3 * rsv[i]
        d[i] = 2 / 3 * d[i-1] + 1 / 3 * k[i]
    return k, d

def macd(closes, fast=12, slow=26, signal=9):
    fast_ema = pd.Series(closes).ewm(span=fast).mean()
    slow_ema = pd.Series(closes).ewm(span=slow).mean()
    macd = fast_ema - slow_ema
    signal_line = macd.ewm(span=signal).mean()
    return macd.values, signal_line.values

def bollinger(closes, period=20, width=2):
    closes = np.array(closes)
    ma = np.convolve(closes, np.ones(period)/period, mode='valid')
    std = np.std(closes[-period:])
    upper = ma + width * std
    lower = ma - width * std
    pad = len(closes) - len(upper)
    return (
        np.concatenate((np.full(pad, np.nan), upper)),
        np.concatenate((np.full(pad, np.nan), ma)),
        np.concatenate((np.full(pad, np.nan), lower))
    )

def atr(highs, lows, closes, period=14):
    tr = np.maximum(highs[1:] - lows[1:], np.abs(highs[1:] - closes[:-1]), np.abs(lows[1:] - closes[:-1]))
    atr = np.convolve(tr, np.ones(period)/period, mode='valid')
    return np.concatenate((np.full(period, np.nan), atr))

def adx(highs, lows, closes, period=14):
    plus_dm = highs[1:] - highs[:-1]
    minus_dm = lows[:-1] - lows[1:]
    plus_dm = np.where((plus_dm > minus_dm) & (plus_dm > 0), plus_dm, 0)
    minus_dm = np.where((minus_dm > plus_dm) & (minus_dm > 0), minus_dm, 0)
    tr = np.maximum(highs[1:] - lows[1:], np.abs(highs[1:] - closes[:-1]), np.abs(lows[1:] - closes[:-1]))
    atr = np.convolve(tr, np.ones(period)/period, mode='valid')
    plus_di = 100 * np.convolve(plus_dm, np.ones(period)/period, mode='valid') / (atr + 1e-10)
    minus_di = 100 * np.convolve(minus_dm, np.ones(period)/period, mode='valid') / (atr + 1e-10)
    dx = 100 * np.abs(plus_di - minus_di) / (plus_di + minus_di + 1e-10)
    adx = np.convolve(dx, np.ones(period)/period, mode='valid')
    return np.concatenate((np.full(len(highs) - len(adx), np.nan), adx))
