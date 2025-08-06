from flask import Flask, Response
import json
import time
import os
import csv
from logic.strategy_logic import evaluate_strategy

app = Flask(__name__)
TRADE_LOG_PATH = os.path.join(os.path.dirname(__file__), "../data/trade_log.csv")

@app.route("/", methods=["GET"])
def handler():
    now = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    result = evaluate_strategy()

    if result["score"] >= 3:
        trade = {
            "time": now,
            "direction": result["direction"],
            "score": result["score"],
            "hit": result["hit"],
            "profit": 0.8 if result["hit"] else -1
        }
        write_trade(trade)

    trades = read_trades()
    last_hits = [t["hit"] for t in trades[-30:]]
    winrate_history = [
        round(sum(last_hits[:i]) / i * 100, 2) for i in range(1, len(last_hits) + 1)
    ]

    body = {
        "timestamp": now,
        "structure": result["structure"],
        "score": result["score"],
        "action": result["action"],
        "trades": trades[-20:],
        "winrate_history": winrate_history
    }

    return Response(json.dumps(body), content_type="application/json")


def read_trades():
    if not os.path.exists(TRADE_LOG_PATH):
        return []
    with open(TRADE_LOG_PATH, "r") as f:
        rows = list(csv.reader(f))[1:]
        trades = []
        for row in rows[-50:]:
            trades.append({
                "time": row[0],
                "direction": row[1],
                "score": int(row[2]),
                "hit": row[3] == "True",
                "profit": float(row[4])
            })
        return trades

def write_trade(trade):
    exists = os.path.exists(TRADE_LOG_PATH)
    with open(TRADE_LOG_PATH, "a", newline="") as f:
        writer = csv.writer(f)
        if not exists:
            writer.writerow(["time", "direction", "score", "hit", "profit"])
        writer.writerow([
            trade["time"],
            trade["direction"],
            trade["score"],
            trade["hit"],
            trade["profit"]
        ])

# 必须提供这一行，Vercel 才能识别 Flask app
app = app
