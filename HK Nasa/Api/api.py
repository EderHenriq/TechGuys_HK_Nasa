# api.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# --- Lógica para o Dataset Histórico  ---
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, 'weatherHistory.csv')
try:
    weather_df = pd.read_csv(csv_path)
    weather_df['Formatted Date'] = pd.to_datetime(weather_df['Formatted Date'], utc=True)
    print(">>> Dataset 'weatherHistory.csv' carregado com sucesso.")
except FileNotFoundError:
    print(f">>> ERRO: Arquivo 'weatherHistory.csv' não encontrado.")
    weather_df = None

@app.route('/api/historical_weather', methods=['GET'])
def get_historical_weather():
    if weather_df is None: return jsonify({"error": "Dataset não carregado."}), 500
    try:
        day = int(request.args.get('day'))
        month = int(request.args.get('month'))
    except (TypeError, ValueError):
        return jsonify({"error": "Parâmetros 'day' e 'month' são obrigatórios."}), 400
    filtered_data = weather_df[(weather_df['Formatted Date'].dt.day == day) & (weather_df['Formatted Date'].dt.month == month)]
    result = filtered_data.to_dict(orient='records')
    return jsonify(result)

# --- Lógica para Reports de Usuários ---
REPORTS_FILE = os.path.join(script_dir, 'reports.json')

@app.route('/api/report_weather', methods=['POST'])
def report_weather():
    data = request.get_json()
    if not data or 'condition' not in data or 'lat' not in data or 'lon' not in data:
        return jsonify({"error": "Dados inválidos"}), 400
    new_report = {
        "condition": data['condition'], "lat": data['lat'], "lon": data['lon'],
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    reports = []
    if os.path.exists(REPORTS_FILE):
        with open(REPORTS_FILE, 'r', encoding='utf-8') as f:
            try: reports = json.load(f)
            except json.JSONDecodeError: reports = []
    reports.append(new_report)
    with open(REPORTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(reports, f, indent=2)
    return jsonify({"success": True, "message": "Report recebido!"}), 201

@app.route('/api/get_reports', methods=['GET'])
def get_reports():
    reports = []
    if os.path.exists(REPORTS_FILE):
        with open(REPORTS_FILE, 'r', encoding='utf-8') as f:
            try: reports = json.load(f)
            except json.JSONDecodeError: reports = []
    return jsonify(reports)

if __name__ == '__main__':
    print(">>> Iniciando servidor Flask. Acesse http://127.0.0.1:5000")
    app.run(debug=True, port=5000)