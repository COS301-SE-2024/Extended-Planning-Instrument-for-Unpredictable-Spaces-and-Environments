from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room
import math
from packing import genetic_algorithm  # Import your genetic algorithm function

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Store the container and boxes data in memory
data = {
    "containers": [],  # Now handles multiple containers
    "generations": [],
    "config": {
        "weightDistributionTolerance": 1.1,
        "supportAreaRatio": 0.65,
        "sortMethod": "weight_volume_ratio"
    }
}

@app.route('/')
def index():
    return render_template('index.html')

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
        if 'boxes' in container:
            del container['boxes']  # Remove the flat list of boxes if it exists
    data["generations"] = [generation_data]  # Store only the latest generation data
    data["generations"][0]["config"] = data["config"]  # Add the current configuration to the generation data
    emit('update_data', data, room='main_room', broadcast=True)

@socketio.on('remaining_volume')
def handle_remaining_volume(volume_data):
    for container in data["containers"]:
        if container["id"] == volume_data["container_id"]:
            container["total_remaining_volume"] = volume_data["total_remaining_volume"]
            break
    emit('update_data', data, room='main_room', broadcast=True)

@socketio.on('run_algorithm')
def handle_run_algorithm(config):
    # Update the configuration
    data["config"] = config
    
    emit('algorithm_started', {"message": "Algorithm started with new configuration"}, room='main_room')
    
    # Run the genetic algorithm with the new configuration
    container_dimensions = (1200, 1930, 1000)  # Adjust these values as needed
    best_individual, best_container = genetic_algorithm(
        container_dimensions,
        socketio,
        weight_distribution_tolerance=config['weightDistributionTolerance'],
        support_area_ratio=config['supportAreaRatio'],
        sort_method=config['sortMethod']
    )
    
    # Prepare the result data
    result_data = prepare_result_data(best_individual, best_container)
    
    # Update the generation data and emit to clients
    handle_update_generation(result_data)

def prepare_result_data(best_individual, best_container):
    # Convert the best solution to a format suitable for the client
    result_data = {
        "fitness": best_container.total_volume - best_container.total_remaining_volume,
        "containers": [{
            "width": best_container.width,
            "height": best_container.height,
            "length": best_container.length,
            "boxes": [
                {
                    "id": box.id,
                    "width": box.width,
                    "height": box.height,
                    "length": box.length,
                    "x": x,
                    "y": y,
                    "z": z,
                    "weight": box.weight
                }
                for box, x, y, z in best_container.boxes
            ]
        }]
    }
    return result_data

if __name__ == '__main__':
    socketio.run(app, debug=True)