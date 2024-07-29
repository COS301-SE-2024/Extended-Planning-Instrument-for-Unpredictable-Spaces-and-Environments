import pandas as pd
import random
import socketio
from itertools import permutations
import numpy as np

class Box:
    def __init__(self, box_id, width, height, length, weight):
        self.id = box_id
        self.width = width
        self.height = height
        self.length = length
        self.volume = width * height * length
        self.weight = weight
        self.density = weight / self.volume

    def rotate(self, new_width, new_height, new_length):
        return Box(self.id, new_width, new_height, new_length, self.weight)

class Container:
    def __init__(self, width, height, length):
        self.width = width
        self.height = height
        self.length = length
        self.boxes = []
        self.remaining_space = [(0, 0, 0, width, height, length)]
        self.total_volume = width * height * length
        self.total_remaining_volume = self.total_volume

    def can_fit(self, box, space):
        _, _, _, w, h, l = space
        return box.width <= w and box.height <= h and box.length <= l

    def add_box(self, box):
        for space in sorted(self.remaining_space, key=lambda s: (s[1], s[0])):  # Sort by y then x
            for orientation in self.generate_orientations(box):
                if self.can_fit(orientation, space):
                    x, y, z, w, h, l = space
                    if not self.check_overlap(orientation, x, y, z) and self.is_supported(orientation, x, y, z):
                        if self.check_weight_distribution(orientation, x, y, z):
                            self.boxes.append((orientation, x, y, z))
                            self.remaining_space.remove(space)
                            self.split_space(x, y, z, orientation)
                            self.total_remaining_volume -= orientation.volume
                            return True
        return False

    def check_weight_distribution(self, new_box, x, y, z):
        for box, bx, by, bz in self.boxes:
            if bx < x + new_box.width and bx + box.width > x and bz < z + new_box.length and bz + box.length > z:
                if by > y and new_box.density > box.density * 1.1:  # Allowing some tolerance
                    return False
        return True

    def split_space(self, x, y, z, box):
        new_spaces = []
        _, _, _, w, h, l = x, y, z, self.width - x, self.height - y, self.length - z

        if w - box.width > 0:
            new_spaces.append((x + box.width, y, z, w - box.width, box.height, box.length))
        if h - box.height > 0:
            new_spaces.append((x, y + box.height, z, box.width, h - box.height, box.length))
        if l - box.length > 0:
            new_spaces.append((x, y, z + box.length, box.width, box.height, l - box.length))

        self.remaining_space.extend(new_spaces)

    def generate_orientations(self, box):
        dimensions = [box.width, box.height, box.length]
        for perm in set(permutations(dimensions)):
            yield box.rotate(perm[0], perm[1], perm[2])

    def check_overlap(self, new_box, new_x, new_y, new_z):
        for box, x, y, z in self.boxes:
            if (new_x < x + box.width and new_x + new_box.width > x and
                new_y < y + box.height and new_y + new_box.height > y and
                new_z < z + box.length and new_z + new_box.length > z):
                return True
        return False

    def is_supported(self, box, x, y, z):
        if y == 0:
            return True  # The box is on the container floor
        support_area = 0
        required_area = 0.6 * box.width * box.length  # At least 60% of the bottom face should be supported

        for other_box, ox, oy, oz in self.boxes:
            if oy + other_box.height == y:  # Check if other box is directly below
                overlap_width = max(0, min(x + box.width, ox + other_box.width) - max(x, ox))
                overlap_length = max(0, min(z + box.length, oz + other_box.length) - max(z, oz))
                support_area += overlap_width * overlap_length

        return support_area >= required_area

    def apply_gravity(self):
        moved = True
        while moved:
            moved = False
            for i, (box, x, y, z) in enumerate(self.boxes):
                new_y = y
                while new_y > 0 and not self.check_overlap(box, x, new_y - 1, z) and self.is_supported(box, x, new_y - 1, z):
                    new_y -= 1
                if new_y != y:
                    self.boxes[i] = (box, x, new_y, z)
                    moved = True

    def print_remaining_space(self):
        print("Remaining spaces:")
        for space in self.remaining_space:
            print(f"Space at ({space[0]}, {space[1]}, {space[2]}) with dimensions {space[3]}x{space[4]}x{space[5]}")

def initialize_population(pop_size, boxes):
    population = []
    for _ in range(pop_size):
        individual = sorted(boxes, key=lambda b: -(b.weight / b.volume)) # descending
        population.append(individual)
    return population

def calculate_above_weight(box, x, y, z, placed_boxes):
    above_weight = 0
    for other_box, bx, by, bz in placed_boxes:
        if (bx < x + box.width and bx + other_box.width > x and
            bz < z + box.length and bz + other_box.length > z and
            by > y):
            above_weight += other_box.weight
    return above_weight

def evaluate_fitness(individual, container_dimensions):
    container_width, container_height, container_length = container_dimensions
    container = Container(container_width, container_height, container_length)
    unplaced_boxes = []
    weight_penalty = 0

    for box in individual:
        if not container.add_box(box):
            unplaced_boxes.append(box)

    container.apply_gravity()

    placed_volume = container.total_volume - container.total_remaining_volume
    total_box_volume = sum(box.volume for box in individual)

    # Calculate the percentage of placed volume
    volume_utilization = placed_volume / total_box_volume if total_box_volume > 0 else 0

    # Penalize unplaced boxes, but not as severely
    unplaced_penalty = len(unplaced_boxes) / len(individual) * 1.5

    # Calculate weight penalty for boxes at the bottom
    for box, x, y, z in container.boxes:
        above_weight = calculate_above_weight(box, x, y, z, container.boxes)
        if above_weight > box.weight:
            weight_penalty += above_weight - box.weight

    # Combine the factors
    fitness = volume_utilization / (1 + unplaced_penalty + weight_penalty)  # This will always be between 0 and 1
    fitness -= unplaced_penalty
    
    return fitness, container, unplaced_boxes

best_fitness = float('-inf')
best_container = None
best_individual = None

def clone_container(container):
    new_container = Container(container.width, container.height, container.length)
    new_container.boxes = [(box.rotate(box.width, box.height, box.length), x, y, z) for box, x, y, z in container.boxes]
    new_container.remaining_space = list(container.remaining_space)
    new_container.total_remaining_volume = container.total_remaining_volume
    return new_container

def update_best_solution(individual, container, fitness):
    global best_fitness, best_container, best_individual
    if fitness > best_fitness:
        best_fitness = fitness
        best_container = container
        best_individual = individual

def select_parents(population, fitness, num_parents):
    ranks = np.argsort(np.argsort(fitness))
    rank_sum = np.sum(ranks)
    if rank_sum == 0:
        raise ValueError("Sum of ranks is zero, check ranking method.")
    selection_probs = ranks / rank_sum
    parents_indices = np.random.choice(len(population), size=num_parents, replace=False, p=selection_probs)
    return [population[idx] for idx in parents_indices]

def crossover(parent1, parent2):
    crossover_point = random.randint(0, len(parent1))
    child1 = parent1[:crossover_point] + [b for b in parent2 if b not in parent1[:crossover_point]]
    child2 = parent2[:crossover_point] + [b for b in parent1 if b not in parent2[:crossover_point]]
    return child1, child2

def mutate(individual, mutation_rate):
    for i in range(len(individual)):
        if random.random() < mutation_rate:
            j = random.randint(0, len(individual) - 1)
            individual[i], individual[j] = individual[j], individual[i]

def genetic_algorithm(csv_file, container_dimensions, sio, pop_size=150, num_generations=300, mutation_rate=0.01):
    boxes_data = [
        {'id': 1, 'width': 400, 'depth': 250, 'height': 480, 'weight': 100},
        {'id': 2, 'width': 200, 'depth': 250, 'height': 480, 'weight': 100},
        {'id': 3, 'width': 400, 'depth': 250, 'height': 240, 'weight': 85},
        {'id': 4, 'width': 400, 'depth': 250, 'height': 480, 'weight': 100},
        {'id': 5, 'width': 400, 'depth': 250, 'height': 480, 'weight': 100},
        {'id': 6, 'width': 400, 'depth': 250, 'height': 360, 'weight': 100},
        {'id': 7, 'width': 400, 'depth': 250, 'height': 480, 'weight': 100},
        {'id': 8, 'width': 400, 'depth': 250, 'height': 480, 'weight': 100},
        {'id': 9, 'width': 400, 'depth': 250, 'height': 480, 'weight': 65},
        {'id': 10, 'width': 400, 'depth': 125, 'height': 240, 'weight': 60},
        {'id': 11, 'width': 400, 'depth': 250, 'height': 480, 'weight': 60},
        {'id': 12, 'width': 800, 'depth': 250, 'height': 480, 'weight': 70},
        {'id': 13, 'width': 400, 'depth': 250, 'height': 480, 'weight': 60},
        {'id': 14, 'width': 400, 'depth': 250, 'height': 480, 'weight': 60},
        {'id': 15, 'width': 400, 'depth': 250, 'height': 480, 'weight': 50},
        {'id': 16, 'width': 400, 'depth': 250, 'height': 480, 'weight': 60},
        {'id': 17, 'width': 200, 'depth': 125, 'height': 480, 'weight': 40},
        {'id': 18, 'width': 400, 'depth': 250, 'height': 240, 'weight': 40},
        {'id': 19, 'width': 400, 'depth': 250, 'height': 480, 'weight': 40},
        {'id': 20, 'width': 300, 'depth': 250, 'height': 240, 'weight': 40},
        {'id': 21, 'width': 400, 'depth': 125, 'height': 240, 'weight': 60},
        {'id': 22, 'width': 400, 'depth': 250, 'height': 480, 'weight': 60},
        {'id': 23, 'width': 800, 'depth': 250, 'height': 240, 'weight': 100},
        {'id': 24, 'width': 400, 'depth': 250, 'height': 480, 'weight': 60},
        {'id': 25, 'width': 400, 'depth': 250, 'height': 240, 'weight': 60},
        {'id': 26, 'width': 400, 'depth': 250, 'height': 240, 'weight': 60},
        {'id': 27, 'width': 400, 'depth': 250, 'height': 480, 'weight': 60},
        {'id': 28, 'width': 200, 'depth': 125, 'height': 480, 'weight': 40},
        {'id': 29, 'width': 400, 'depth': 250, 'height': 240, 'weight': 40},
        {'id': 30, 'width': 100, 'depth': 250, 'height': 240, 'weight': 30},
    ]

    boxes = [Box(box['id'], box['width'], box['height'], box['depth'], box['weight']) for box in boxes_data]
    boxes.sort(key=lambda b: b.weight, reverse=True)  # Sort boxes by weight, heaviest first

    population = initialize_population(pop_size, boxes)

    global best_fitness, best_container, best_individual

    for generation in range(num_generations):
        fitness_results = [evaluate_fitness(individual, container_dimensions) for individual in population]
        fitness = [result[0] for result in fitness_results]
        containers = [result[1] for result in fitness_results]
        unplaced_boxes_list = [result[2] for result in fitness_results]

        current_best_fitness = max(fitness)
        current_best_index = fitness.index(current_best_fitness)
        current_best_individual = population[current_best_index]
        current_best_container = containers[current_best_index]
        current_unplaced_boxes = unplaced_boxes_list[current_best_index]

        emit_local_solution(sio, current_best_container, generation, current_best_fitness)

        update_best_solution(current_best_individual, current_best_container, current_best_fitness)

        parents = select_parents(population, fitness, pop_size // 2)
        next_population = []

        for i in range(0, len(parents), 2):
            parent1 = parents[i]
            parent2 = parents[i + 1] if i + 1 < len(parents) else parents[0]
            child1, child2 = crossover(parent1, parent2)
            mutate(child1, mutation_rate)
            mutate(child2, mutation_rate)
            next_population.extend([child1, child2])

        # Elitism: Keep the best individual in the new population
        best_individual_clone = best_individual[:]  # Clone the best individual
        best_container_clone = clone_container(best_container)
        next_population[0] = best_individual_clone

        population = next_population

    # Emit the best global solution at the end
    emit_solution(sio, best_container, num_generations, best_fitness)

    print(f"Best Fitness = {best_fitness}")
    if best_container:
        unplaced_boxes = current_unplaced_boxes[:]  # Create a copy of unplaced boxes
        for box in unplaced_boxes:
            print(f"Box {box.id}: {box.width}x{box.height}x{box.length}")

        if unplaced_boxes:
            print("Attempting to place remaining boxes...")
            for box in unplaced_boxes[:]:  # Iterate over a copy of the list
                if best_container.add_box(box):
                    print(f"Successfully added Box {box.id}")
                    unplaced_boxes.remove(box)
                else:
                    print(f"Failed to add Box {box.id}")
        if len(unplaced_boxes) < len(current_unplaced_boxes):
            new_fitness, _, _ = evaluate_fitness(best_individual, container_dimensions)
            best_fitness = new_fitness
            print(f"Updated Best Fitness = {best_fitness}")
            emit_solution(sio, best_container, num_generations, best_fitness)

        if unplaced_boxes:
            print("Final Unplaced Boxes:")
            for box in unplaced_boxes:
                print(f"Box {box.id}: {box.width}x{box.height}x{box.length}")
        else:
            print("All boxes placed successfully!")

    return best_individual, best_container

def emit_solution(sio, container, generation, fitness):
    generation_data = {
        "generation": generation,
        "fitness": float(fitness),
        "containers": [
            {
                "width": container.width,
                "height": container.height,
                "length": container.length,
                "boxes": [
                    {
                        "id": box.id,
                        "width": int(box.width),
                        "height": int(box.height),
                        "length": int(box.length),
                        "x": int(x),
                        "y": int(y),
                        "z": int(z),
                        "weight": int(box.weight),
                    }
                    for box, x, y, z in container.boxes
                ],
                "total_remaining_volume": float(container.total_remaining_volume)
            }
        ]
    }
    sio.emit('update_generation', generation_data)

def emit_local_solution(sio, container, generation, fitness):
    generation_data = {
        "generation": generation,
        "fitness": float(fitness),
        "containers": [
            {
                "width": container.width,
                "height": container.height,
                "length": container.length,
                "boxes": [
                    {
                        "id": box.id,
                        "width": int(box.width),
                        "height": int(box.height),
                        "length": int(box.length),
                        "x": int(x),
                        "y": int(y),
                        "z": int(z),
                        "weight": int(box.weight),
                    }
                    for box, x, y, z in container.boxes
                ],
                "total_remaining_volume": float(container.total_remaining_volume)
            }
        ]
    }
    sio.emit('update_generation', generation_data)

def main():
    sio = socketio.Client()

    @sio.event
    def connect():
        print('Connected to server')

    @sio.on('update_data')
    def on_update_data(data):
        pass

    sio.connect('http://localhost:5000')
    sio.emit('get_data')

    container_width = 1200
    container_depth = 1000
    container_height = 2000

    container_dimensions = (container_width, container_height, container_depth)

    best_individual, best_container = genetic_algorithm('products.csv', container_dimensions, sio)

    print(f"Final Best Container:")
    if best_container:
        for box, x, y, z in best_container.boxes:
            print(f"  Box {box.id}: {box.width}x{box.height}x{box.length} at position ({x}, {y}, {z})")

if __name__ == "__main__":
    main()
