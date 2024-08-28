import os
from flask import Flask, request, jsonify
from supabase import create_client, Client
from packing import genetic_algorithm  
import json
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()

# Initialize Supabase client
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(url, key)

@app.route('/uploadSolution', methods=['POST'])
def get_solution():
    data = request.json
    shipment_id = data.get('shipmentID')
    container_dimensions = data.get('containerSize',[])
    
    box_data = data.get('boxes', {}).get('data', [])

    # Validate shipment_id and box_data
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

    # container_dimensions = (1200, 1380, 2800) 
    container_width, container_height, container_depth = container_dimensions
    # Run the genetic algorithm with the provided box data
    solution_json = genetic_algorithm(box_data, (container_width, container_height, container_depth), sio)
    solution_string = json.dumps(solution_json)

    # Upload the solution to the Supabase bucket (private)
    file_name = f"{shipment_id}.json"
    file_path = f"solutions/{file_name}"

    try:
        # Upload the file
        response = supabase.storage.from_("solutions").upload(file_path, solution_string.encode('utf-8'))
        print("File upload response:", response)

        if response.status_code == 200:
            return jsonify({"message": "Solution uploaded successfully", "file_path": file_path}), 200
        else:
            return jsonify({"error": "File upload failed", "details": response.text}), response.status_code
    except Exception as e:
        print("File upload failed:", str(e))
        return jsonify({"error": "File upload failed", "details": str(e)}), 500



@app.route('/getSolution', methods=['POST'])
def get_solution2():
    data = request.json
    shipment_id = data.get('shipmentID')

    # Validate shipment_id
    if shipment_id is None:
        return jsonify({"error": "shipmentID is required"}), 400

    file_name = f"{shipment_id}.json"  # Name the file using shipmentId
    file_path = f"solutions/{file_name}"  # Define the path in the bucket

    try:
        # Download the file from the Supabase bucket
        file_content = supabase.storage.from_("solutions").download(file_path)
        
        # Decode the file content
        solution_data = file_content.decode('utf-8')
        solution_json = json.loads(solution_data)
        return jsonify(solution_json), 200

    except Exception as e:
        print("File retrieval failed:", str(e))
        return jsonify({"error": "File retrieval failed", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)