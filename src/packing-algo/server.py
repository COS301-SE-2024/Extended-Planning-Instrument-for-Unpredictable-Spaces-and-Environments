from flask import Flask, render_template, send_from_directory
from flask_socketio import SocketIO, emit, join_room
import math
import os
import subprocess

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Store the container and boxes data in memory
data = {
    "containers": [],  # Now handles multiple containers
    "generations": []
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/truck/<path:filename>')
def truck_files(filename):
    return send_from_directory(os.path.join(app.root_path, 'templates', 'truck'), filename)

@socketio.on('connect')
def handle_connect():
    join_room('main_room')  # Join the default room
    emit('update_data', data, room='main_room')

def fits(container, box, x, y, z):
    # Check if the box fits at the given position in the container
    if x + box['width'] > container['width'] or y + box['height'] > container['height'] or z + box['length'] > container['length']:
        return False
    for existing_box in container['boxes']:
        if not (
            x + box['width'] <= existing_box['x'] or x >= existing_box['x'] + existing_box['width'] or
            y + box['height'] <= existing_box['y'] or y >= existing_box['y'] + existing_box['height'] or
            z + box['length'] <= existing_box['z'] or z >= existing_box['z'] + existing_box['length']
        ):
            return False
    return True

def add_box_to_container(container, box):
    # Try to fit the box in different orientations
    orientations = [
        (box['width'], box['height'], box['length']),
        (box['width'], box['length'], box['height']),
        (box['height'], box['width'], box['length']),
        (box['height'], box['length'], box['width']),
        (box['length'], box['width'], box['height']),
        (box['length'], box['height'], box['width']),
    ]
    for width, height, length in orientations:
        box_dimensions = {'width': width, 'height': height, 'length': length}
        for x in range(container['width']):
            for y in range(container['height']):
                for z in range(container['length']):
                    if fits(container, box_dimensions, x, y, z):
                        box['x'] = x
                        box['y'] = y
                        box['z'] = z
                        box['width'] = width
                        box['height'] = height
                        box['length'] = length
                        container['boxes'].append(box)
                        return True
    return False

def organize_boxes_into_layers(container):
    # Calculate the average height of the boxes
    if not container['boxes']:
        return []
    
    total_height = sum(box['height'] for box in container['boxes'])
    average_height = total_height / len(container['boxes'])
    
    # Organize boxes into layers based on the average height
    layers = {}
    for box in container['boxes']:
        layer = math.floor(box['y'] / average_height)
        if layer not in layers:
            layers[layer] = []
        layers[layer].append(box)
    
    return [layers[key] for key in sorted(layers.keys())]

@socketio.on('add_box')
def handle_add_box(box_data):
    if "containers" in box_data:
        data["containers"] = box_data["containers"]
    for container in data['containers']:
        if add_box_to_container(container, box_data):
            break
    emit('update_data', data, room='main_room', broadcast=True)

@socketio.on('update_generation')
def handle_update_generation(generation_data):
    for container in generation_data['containers']:
        container['layers'] = organize_boxes_into_layers(container)
        del container['boxes']  # Remove the flat list of boxes
    data["generations"] = [generation_data]  # Store only the latest generation data
    emit('update_data', data, room='main_room', broadcast=True)

@socketio.on('remaining_volume')
def handle_remaining_volume(volume_data):
    for container in data["containers"]:
        if container["id"] == volume_data["container_id"]:
            container["total_remaining_volume"] = volume_data["total_remaining_volume"]
            break
    emit('update_data', data, room='main_room', broadcast=True)

@socketio.on('run_packing_algorithm')
def handle_run_packing_algorithm(data):
    print("Received 'run_packing_algorithm' event with dimensions:", data)

    import subprocess
    import sys
    import os

    python_executable = sys.executable  # This will get the current Python interpreter path

    # Define the relative path to the packing.py script
    script_path = os.path.join(os.path.dirname(__file__), 'packing.py')

    # Extract the dimensions from the data received
    container_width = data.get('width', 1200)  # Default to 1200 if not provided
    container_height = data.get('height', 1380)  # Default to 1380 if not provided
    container_length = data.get('length', 2800)  # Default to 2800 if not provided

    print(f"Running packing.py with dimensions: width={container_width}, height={container_height}, length={container_length}")

    try:
        result = subprocess.run(
            [python_executable, script_path, str(container_width), str(container_height), str(container_length)],
            check=True, capture_output=True, text=True
        )
        print("Packing algorithm output:", result.stdout)
    except subprocess.CalledProcessError as e:
        print("Error running packing.py:", e.stderr)

# Global variable to store the updated container dimensions
# Global variable to store the updated container dimensions
# Global variables to store the dimensions
current_width = 1200  # Default starting values
current_height = 1380
current_length = 2800

@socketio.on('update_container_dimensions')
def handle_update_container_dimensions(data):
    global current_width, current_height, current_length
    current_width = data['width']
    current_height = data['height']
    current_length = data['length']
    print(f"Updated container dimensions received: {current_width}x{current_height}x{current_length}")

@socketio.on('run_packing_algorithm')
def handle_run_packing_algorithm(data):
    print("Received 'run_packing_algorithm' event")
    
    global current_width, current_height, current_length
    
    print(f"Running packing algorithm with dimensions: {current_width}x{current_height}x{current_length}")
    
    import subprocess
    import sys
    import os

    python_executable = sys.executable  # This will get the current Python interpreter path

    # Define the relative path to the packing.py script
    script_path = os.path.join(os.path.dirname(__file__), 'DemoDayAlgo.py')

    try:
        # Pass the dimensions as command-line arguments to packing.py
        result = subprocess.run(
            [python_executable, script_path, str(current_width), str(current_height), str(current_length)], 
            check=True, 
            capture_output=True, 
            text=True
        )
        print("Packing algorithm output:", result.stdout)
    except subprocess.CalledProcessError as e:
        print("Error running packing.py:", e.stderr)


if __name__ == '__main__':
    socketio.run(app, debug=True)
