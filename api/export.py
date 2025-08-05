from flask import Response
import os

# CSV 路径
CSV_PATH = os.path.join(os.path.dirname(__file__), "../data/trade_log.csv")

def handler(request):
    if not os.path.exists(CSV_PATH):
        return Response("CSV file not found", status=404)

    with open(CSV_PATH, "r") as f:
        csv_data = f.read()

    return Response(
        csv_data,
        content_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=trade_log.csv"
        }
    )
