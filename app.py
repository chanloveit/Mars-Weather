from flask import Flask, jsonify, render_template
import requests
import pandas as pd
from sklearn.linear_model import LinearRegression
import os
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)

API_KEY = os.environ.get("NASA_API_KEY")


def get_mars_data():
    url = f"https://api.nasa.gov/insight_weather/?api_key={API_KEY}&feedtype=json&ver=1.0"
    data = requests.get(url).json()
    sols = data['sol_keys']
    temps = [data[sol]['AT']['av'] for sol in sols]
    df = pd.DataFrame({'sol': list(map(int, sols)), 'temp': temps})
    return df


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict")
def predict():
    df = get_mars_data()
    X = df['sol'].values.reshape(-1, 1)
    y = df['temp'].values
    model = LinearRegression().fit(X, y)
    tomorrow_sol = max(df['sol']) + 1
    pred_temp = float(model.predict([[tomorrow_sol]]))
    return jsonify({"sol": tomorrow_sol, "pred_temp": pred_temp})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

