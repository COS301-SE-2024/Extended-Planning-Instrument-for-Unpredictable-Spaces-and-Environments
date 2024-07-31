from flask import Flask, render_template, send_from_directory
from flask_socketio import SocketIO, emit, join_room
import os
import math

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Mock initialization of containers and boxes data
data = {
    "containers": [
        {
            "id": 1,
            "width": 100,
            "height": 100,
            "length": 100,
            "boxes": []
        }
    ],
    "generations": []
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/truck/<path:filename>')
def truck_files(filename):
    print("Request for truck file:", filename)  # Debug statement
    print("Directory contents:", os.listdir(os.path.join('templates', 'truck')))  # Debug statement
    return send_from_directory(os.path.join('templates', 'truck'), filename)

@socketio.on('connect')
def handle_connect():
    join_room('main_room')  # Join the default room
    print("Client connected. Sending initial data:", data)  # Debug statement
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
    print("Data after adding box:", data)  # Debug statement
    emit('update_data', data, room='main_room', broadcast=True)

@socketio.on('update_generation')
def handle_update_generation(generation_data):
    for container in generation_data['containers']:
        container['layers'] = organize_boxes_into_layers(container)
        del container['boxes']  # Remove the flat list of boxes
    data["generations"] = [generation_data]  # Store only the latest generation data
    print("Data after updating generation:", data)  # Debug statement
    emit('update_data', data, room='main_room', broadcast=True)

@socketio.on('remaining_volume')
def handle_remaining_volume(volume_data):
    for container in data["containers"]:
        if container["id"] == volume_data["container_id"]:
            container["total_remaining_volume"] = volume_data["total_remaining_volume"]
            break
    emit('update_data', data, room='main_room', broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
