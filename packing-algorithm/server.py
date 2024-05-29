from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Store the container and boxes data in memory
data = {
    "container": {"width": 10, "height": 10, "length": 10},
    "boxes": []
}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    join_room('main_room')  # Join the default room
    emit('update_data', data, room='main_room')

@socketio.on('add_box')
def handle_add_box(box_data):
    data["boxes"].append(box_data)
    emit('update_data', data, room='main_room', broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)