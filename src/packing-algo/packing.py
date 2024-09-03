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
        for space in sorted(self.remaining_space, key=lambda s: (s[2],s[1])):
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
        required_area = 0.85 * box.width * box.length  # At least 60% of the bottom face should be supported

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

class GeneticAlgorithmSolver:
    def __init__(self):
        self.best_fitness = float('-inf')
        self.best_container = None
        self.best_individual = None
        self.iteration_count = 0
        self.rng = np.random.RandomState()

    def initialize_population(self, pop_size, boxes):
        population = []
        for _ in range(pop_size):
            individual = sorted(boxes, key=lambda b: -(b.volume))  # descending
            population.append(individual)
        return population

    def calculate_above_weight(self, box, x, y, z, placed_boxes):
        above_weight = 0
        for other_box, bx, by, bz in placed_boxes:
            if (bx < x + box.width and bx + other_box.width > x and
                bz < z + box.length and bz + other_box.length > z and
                by > y):
                above_weight += other_box.weight
        return above_weight

    def evaluate_fitness(self, individual, container_dimensions):
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

        volume_utilization = placed_volume / total_box_volume if total_box_volume > 0 else 0
        unplaced_penalty = len(unplaced_boxes) / len(individual) * 1.5

        for box, x, y, z in container.boxes:
            above_weight = self.calculate_above_weight(box, x, y, z, container.boxes)
            if above_weight > box.weight:
                weight_penalty += above_weight - box.weight

        fitness = volume_utilization / (1 + unplaced_penalty + weight_penalty)
        fitness -= unplaced_penalty
        
        return fitness, container, unplaced_boxes

    def clone_container(self, container):
        new_container = Container(container.width, container.height, container.length)
        new_container.boxes = [(box.rotate(box.width, box.height, box.length), x, y, z) for box, x, y, z in container.boxes]
        new_container.remaining_space = list(container.remaining_space)
        new_container.total_remaining_volume = container.total_remaining_volume
        return new_container

    def update_best_solution(self, individual, container, fitness):
        if fitness > self.best_fitness:
            self.best_fitness = fitness
            self.best_container = container
            self.best_individual = individual
            self.iteration_count = 0
        else:
            self.iteration_count += 1

    def select_parents(self, population, fitness, num_parents):
        if len(population) <= 1:
            return population

        ranks = np.argsort(np.argsort(fitness))
        rank_sum = np.sum(ranks)
        if rank_sum == 0:
            selection_probs = np.ones(len(population)) / len(population)
        else:
            selection_probs = ranks / rank_sum
        parents_indices = self.rng.choice(len(population), size=min(num_parents, len(population)), replace=False, p=selection_probs)
        return [population[idx] for idx in parents_indices]

    def crossover(self, parent1, parent2):
        if len(parent1) <= 1:
            return parent1, parent2  
        crossover_point = self.rng.randint(0, len(parent1))
        child1 = parent1[:crossover_point] + [b for b in parent2 if b not in parent1[:crossover_point]]
        child2 = parent2[:crossover_point] + [b for b in parent1 if b not in parent2[:crossover_point]]
        return child1, child2

    def mutate(self, individual, mutation_rate):
        if len(individual) <= 1:
            return
        for i in range(len(individual)):
            if self.rng.random() < mutation_rate:
                j = self.rng.randint(0, len(individual) - 1)
                individual[i], individual[j] = individual[j], individual[i]

    def emit_solution(self, sio, container, generation, fitness):
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

    def emit_local_solution(self, sio, container, generation, fitness):
        self.emit_solution(sio, container, generation, fitness)

    def solve(self, box_data, container_dimensions, sio, pop_size=150, num_generations=300, mutation_rate=0.01):
        boxes_data = [
            {
                'id': box['id'],
                'width': box['Width'],
                'depth': box['Length'],
                'height': box['Height'],
                'weight': box['Weight']
            }
            for box in box_data 
        ]

        boxes = [Box(box['id'], box['width'], box['height'], box['depth'], box['weight']) for box in boxes_data]
        population = self.initialize_population(pop_size, boxes)

        for generation in range(num_generations):
            fitness_results = [self.evaluate_fitness(individual, container_dimensions) for individual in population]
            fitness = [result[0] for result in fitness_results]
            containers = [result[1] for result in fitness_results]
            unplaced_boxes_list = [result[2] for result in fitness_results]

            current_best_fitness = max(fitness)
            current_best_index = fitness.index(current_best_fitness)
            current_best_individual = population[current_best_index]
            current_best_container = containers[current_best_index]
            current_unplaced_boxes = unplaced_boxes_list[current_best_index]

            self.emit_local_solution(sio, current_best_container, generation, current_best_fitness)
            self.update_best_solution(current_best_individual, current_best_container, current_best_fitness)

            parents = self.select_parents(population, fitness, pop_size // 2)
            next_population = []
            
            for i in range(0, len(parents), 2):
                parent1 = parents[i]
                parent2 = parents[i + 1] if i + 1 < len(parents) else parents[0]
                child1, child2 = self.crossover(parent1, parent2)
                self.mutate(child1, mutation_rate)
                self.mutate(child2, mutation_rate)
                next_population.extend([child1, child2])

            best_individual_clone = self.best_individual[:]
            best_container_clone = self.clone_container(self.best_container)
            next_population[0] = best_individual_clone

            population = next_population
            
            if self.iteration_count > 15:
                break

        self.emit_solution(sio, self.best_container, num_generations, self.best_fitness)

        print(f"Best Fitness = {self.best_fitness}")
        if self.best_container:
            unplaced_boxes = current_unplaced_boxes[:]
            for box in unplaced_boxes:
                print(f"Box {box.id}: {box.width}x{box.height}x{box.length}")

            if unplaced_boxes:
                print("Attempting to place remaining boxes...")
                for box in unplaced_boxes[:]:
                    if self.best_container.add_box(box):
                        print(f"Successfully added Box {box.id}")
                        unplaced_boxes.remove(box)
                    else:
                        print(f"Failed to add Box {box.id}")
            if len(unplaced_boxes) < len(current_unplaced_boxes):
                new_fitness, _, _ = self.evaluate_fitness(self.best_individual, container_dimensions)
                self.best_fitness = new_fitness
                print(f"Updated Best Fitness = {self.best_fitness}")
                self.emit_solution(sio, self.best_container, num_generations, self.best_fitness)

            if unplaced_boxes:
                print("Final Unplaced Boxes:")
                for box in unplaced_boxes:
                    print(f"Box {box.id}: {box.width}x{box.height}x{box.length}")
            else:
                print("All boxes placed successfully!")

        solution = {
            "fitness": float(self.best_fitness),
            "boxes": [
                {
                    "id": box.id,
                    "width": int(box.width),
                    "height": int(box.height),
                    "length": int(box.length),
                    "weight": int(box.weight),
                    "volume": int(box.volume),
                    "x": int(x),
                    "y": int(y),
                    "z": int(z)
                }
                for box, x, y, z in self.best_container.boxes
            ]
        }
        
        return solution

def genetic_algorithm(box_data, container_dimensions, sio, pop_size=150, num_generations=300, mutation_rate=0.01):
    solver = GeneticAlgorithmSolver()
    return solver.solve(box_data, container_dimensions, sio, pop_size, num_generations, mutation_rate)


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
    container_depth = 2800
    container_height = 1380

    container_dimensions = (container_width, container_height, container_depth)

    best_individual, best_container = genetic_algorithm('products.csv', container_dimensions, sio)

    print(f"Final Best Container:")
    if best_container:
        for box, x, y, z in best_container.boxes:
            print(f"  Box {box.id}: {box.width}x{box.height}x{box.length} at position ({x}, {y}, {z})")

if __name__ == "__main__":
    main()
