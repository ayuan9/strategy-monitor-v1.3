from flask import Flask, Response

app = Flask(__name__)

@app.route("/", methods=["GET"])
def handler():
    return Response('{"message": "hello world"}', content_type="application/json")

handler = app
