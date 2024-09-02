import os
import json
import time
from flask import Flask, request, jsonify
from supabase import create_client, Client
from packing import genetic_algorithm
from dotenv import load_dotenv
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(url, key)

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

@app.route('/uploadSolution', methods=['POST'])
def get_solution():
    try:
        data = request.json
        shipment_id = data.get('shipmentID')
        container_dimensions = data.get('containerSize', [])
        box_data = data.get('boxes', {}).get('data', [])

        if shipment_id is None or not isinstance(shipment_id, int):
            return jsonify({"error": "Invalid shipmentID provided"}), 400
        if len(container_dimensions) != 3:
            return jsonify({"error": "Invalid containerSize provided"}), 400
        if not box_data:
            return jsonify({"error": "No box data provided"}), 400

        class MockSocketIO:
            def emit(self, event, data):
                pass

        sio = MockSocketIO()

        container_width, container_height, container_depth = container_dimensions
        solution_json = genetic_algorithm(box_data, (container_width, container_height, container_depth), sio)
        solution_string = json.dumps(solution_json)

        file_name = f"{shipment_id}_{int(time.time())}.json"
        file_path = f"solutions/{file_name}"

        response = supabase.storage.from_("solutions").upload(file_path, solution_string.encode('utf-8'))

        if response.status_code == 200:
            return jsonify({"boxes": solution_json["boxes"], "fitness": solution_json["fitness"]}), 200
        else:
            return jsonify({"error": "File upload failed", "details": response.text}), response.status_code

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

@app.route('/getSolution', methods=['POST'])
def get_solution2():
    try:
        data = request.json
        shipment_id = data.get('shipmentID')

        if shipment_id is None:
            return jsonify({"error": "shipmentID is required"}), 400

        file_name = f"{shipment_id}.json"
        file_path = f"solutions/{file_name}"

        files = supabase.storage.from_("solutions").list()

        file_content = supabase.storage.from_("solutions").download(file_path)

        solution_data = file_content.decode('utf-8')
        solution_json = json.loads(solution_data)
        return jsonify(solution_json), 200

    except Exception as e:
        logging.exception(f"Error retrieving file {file_path}")
        return jsonify({"info": f'File for shipmentid {shipment_id} does not exist, calculating new solution now', "details": str(e)}), 250

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)