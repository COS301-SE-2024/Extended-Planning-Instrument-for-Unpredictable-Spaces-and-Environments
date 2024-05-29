import random
import socketio

class Box:
    def __init__(self, width, height, length):
        self.width = width
        self.height = height
        self.length = length

class Container:
    def __init__(self, width, height, length):
        self.width = width
        self.height = height
        self.length = length
        self.boxes = []
        self.remaining_space = [(0, 0, 0, width, height, length)]

    def can_fit(self, box, space):
        _, _, _, w, h, l = space
        return box.width <= w and box.height <= h and box.length <= l

    def add_box(self, box):
        for i, space in enumerate(self.remaining_space):
            if self.can_fit(box, space):
                x, y, z, w, h, l = space
                self.boxes.append((box, x, y, z))
                self.remaining_space.pop(i)
                self.split_space(x, y, z, w, h, l, box)
                return True
        return False

    def split_space(self, x, y, z, w, h, l, box):
        # Calculate the new coordinates based on the position of the newly added box
        new_x = x + box.width
        new_y = y + box.height
        new_z = z + box.length

        # Calculate the dimensions of the new spaces
        remaining_width = w - box.width
        remaining_height = h - box.height
        remaining_length = l - box.length

        # Add new spaces if they have positive dimensions
        if remaining_width > 0:
            self.remaining_space.append((new_x, y, z, remaining_width, h, l))
        if remaining_height > 0:
            self.remaining_space.append((x, new_y, z, box.width, remaining_height, l))
        if remaining_length > 0:
            self.remaining_space.append((x, y, new_z, box.width, box.height, remaining_length))

def main():
    sio = socketio.Client()

    @sio.event
    def connect():
        print('Connected to server')

    @sio.on('update_data')
    def on_update_data(data):
        pass  # No need to print anything here

    sio.connect('http://localhost:5000')
    sio.emit('get_data')  # Request initial data

    container = Container(10, 10, 10)
    while True:
        response = input("Do you want to add the next box? (yes/no): ")
        if response.lower() == "no":
            sio.disconnect()  # Disconnect from the server
            break
        width = random.randint(1, 3)
        height = random.randint(1, 3)
        length = random.randint(1, 3)
        box = Box(width, height, length)
        if container.add_box(box):
            box_data = {
                "width": width,
                "height": height,
                "length": length,
                "x": container.boxes[-1][1],
                "y": container.boxes[-1][2],
                "z": container.boxes[-1][3]
            }
            sio.emit('add_box', box_data)

    sio.wait()

if __name__ == "__main__":
    main()
