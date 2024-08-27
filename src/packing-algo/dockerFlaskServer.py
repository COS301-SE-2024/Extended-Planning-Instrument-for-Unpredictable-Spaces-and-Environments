from flask import Flask, request, jsonify
import socketio
from supabase import create_client, Client
from packing import genetic_algorithm  
import json

app = Flask(__name__)

# Initialize Supabase client
url: str = "https://rgisazefakhdieigrylb.supabase.co/"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXNhemVmYWtoZGllaWdyeWxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNjMxMzE1MSwiZXhwIjoyMDMxODg5MTUxfQ.ctQmfWfRjY77afjwWuynIL4lRdjrtBD7Xqh75SxQBeo"
supabase: Client = create_client(url, key)

@app.route('/uploadSolution', methods=['POST'])
def get_solution():
    data = request.json
    shipment_id = data.get('shipmentID')

    # Validate shipment_id
    if shipment_id is None or not isinstance(shipment_id, int):
        return jsonify({"error": "Invalid shipmentID provided"}), 400

    class MockSocketIO:
        def emit(self, event, data):
            pass

    sio = MockSocketIO()

    container_dimensions = (1200, 1380, 2800)  # width, height, depth

    # Run the genetic algorithm to get the solution (uncomment when needed)
    solution_json = genetic_algorithm('products.csv', container_dimensions, sio)
    # For now, using a test solution string
    solution_string = json.dumps(solution_json)

    # Upload the solution to the Supabase bucket (private)
    file_name = f"{shipment_id}.json"  # Name the file using shipmentId
    file_path = f"solutions/{file_name}"  # Define the path in the bucket

    try:
        # Upload the file
        response = supabase.storage.from_("solutions").upload(file_path, solution_string.encode('utf-8'))
        print("File upload response:", response)

        # Extract relevant information from the response
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
    app.run(debug=True)