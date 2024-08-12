interface BoxData {
    id: number;
    Shipment_id: number;
    Packed_time: string;
    Width: number;
    Length: number;
    Height: number;
    Weight: number;
    Volume: number;
}

class Box {
    id: number;
    width: number;
    height: number;
    length: number;
    volume: number;
    weight: number;
    density: number;

    constructor(boxData: BoxData) {
        this.id = boxData.id;
        this.width = boxData.Width;
        this.height = boxData.Height;
        this.length = boxData.Length;
        this.volume = this.width * this.height * this.length;
        this.weight = boxData.Weight;
        this.density = this.weight / this.volume;
    }

    rotate(newWidth: number, newHeight: number, newLength: number): Box {
        const rotatedBox = new Box({
            ...this,
            Width: newWidth,
            Height: newHeight,
            Length: newLength
        });
        return rotatedBox;
    }
}

class Container {
    width: number;
    height: number;
    length: number;
    boxes: [Box, number, number, number][];
    remainingSpace: [number, number, number, number, number, number][];
    totalVolume: number;
    totalRemainingVolume: number;

    constructor(width: number, height: number, length: number) {
        this.width = width;
        this.height = height;
        this.length = length;
        this.boxes = [];
        this.remainingSpace = [[0, 0, 0, width, height, length]];
        this.totalVolume = width * height * length;
        this.totalRemainingVolume = this.totalVolume;
    }

    canFit(box: Box, space: [number, number, number, number, number, number]): boolean {
        const [, , , w, h, l] = space;
        return box.width <= w && box.height <= h && box.length <= l;
    }

    addBox(box: Box): boolean {
        for (const space of this.remainingSpace.sort((a, b) => a[2] - b[2] || a[1] - b[1])) {
            for (const orientation of this.generateOrientations(box)) {
                if (this.canFit(orientation, space)) {
                    const [x, y, z, , ,] = space;
                    if (!this.checkOverlap(orientation, x, y, z) && this.isSupported(orientation, x, y, z)) {
                        if (this.checkWeightDistribution(orientation, x, y, z)) {
                            this.boxes.push([orientation, x, y, z]);
                            this.remainingSpace = this.remainingSpace.filter(s => s !== space);
                            this.splitSpace(x, y, z, orientation);
                            this.totalRemainingVolume -= orientation.volume;
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    checkWeightDistribution(newBox: Box, x: number, y: number, z: number): boolean {
        for (const [box, bx, by, bz] of this.boxes) {
            if (bx < x + newBox.width && bx + box.width > x && bz < z + newBox.length && bz + box.length > z) {
                if (by > y && newBox.density > box.density * 1.1) {
                    return false;
                }
            }
        }
        return true;
    }

    splitSpace(x: number, y: number, z: number, box: Box): void {
        const newSpaces: [number, number, number, number, number, number][] = [];
        const [, , , w, h, l] = [x, y, z, this.width - x, this.height - y, this.length - z];

        if (w - box.width > 0) {
            newSpaces.push([x + box.width, y, z, w - box.width, box.height, box.length]);
        }
        if (h - box.height > 0) {
            newSpaces.push([x, y + box.height, z, box.width, h - box.height, box.length]);
        }
        if (l - box.length > 0) {
            newSpaces.push([x, y, z + box.length, box.width, box.height, l - box.length]);
        }

        this.remainingSpace.push(...newSpaces);
    }

    *generateOrientations(box: Box): Generator<Box> {
        const dimensions = [box.width, box.height, box.length];
        const permutations = this.permute(dimensions);
        for (const perm of permutations) {
            yield box.rotate(perm[0], perm[1], perm[2]);
        }
    }

    permute(arr: number[]): number[][] {
        if (arr.length <= 1) return [arr];
        const result: number[][] = [];
        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
            const perms = this.permute(remaining);
            for (const perm of perms) {
                result.push([current, ...perm]);
            }
        }
        return result;
    }

    checkOverlap(newBox: Box, newX: number, newY: number, newZ: number): boolean {
        for (const [box, x, y, z] of this.boxes) {
            if (newX < x + box.width && newX + newBox.width > x &&
                newY < y + box.height && newY + newBox.height > y &&
                newZ < z + box.length && newZ + newBox.length > z) {
                return true;
            }
        }
        return false;
    }

    isSupported(box: Box, x: number, y: number, z: number): boolean {
        if (y === 0) return true;
        let supportArea = 0;
        const requiredArea = 0.85 * box.width * box.length;

        for (const [otherBox, ox, oy, oz] of this.boxes) {
            if (oy + otherBox.height === y) {
                const overlapWidth = Math.max(0, Math.min(x + box.width, ox + otherBox.width) - Math.max(x, ox));
                const overlapLength = Math.max(0, Math.min(z + box.length, oz + otherBox.length) - Math.max(z, oz));
                supportArea += overlapWidth * overlapLength;
            }
        }

        return supportArea >= requiredArea;
    }

    applyGravity(): void {
        let moved = true;
        while (moved) {
            moved = false;
            for (let i = 0; i < this.boxes.length; i++) {
                const [box, x, y, z] = this.boxes[i];
                let newY = y;
                while (newY > 0 && !this.checkOverlap(box, x, newY - 1, z) && this.isSupported(box, x, newY - 1, z)) {
                    newY--;
                }
                if (newY !== y) {
                    this.boxes[i] = [box, x, newY, z];
                    moved = true;
                }
            }
        }
    }
}

function initializePopulation(popSize: number, boxes: Box[]): Box[][] {
    const population: Box[][] = [];
    for (let i = 0; i < popSize; i++) {
        const individual = [...boxes].sort((a, b) => b.volume - a.volume);
        population.push(individual);
    }
    return population;
}

function calculateAboveWeight(box: Box, x: number, y: number, z: number, placedBoxes: [Box, number, number, number][]): number {
    let aboveWeight = 0;
    for (const [otherBox, bx, by, bz] of placedBoxes) {
        if (bx < x + box.width && bx + otherBox.width > x &&
            bz < z + box.length && bz + otherBox.length > z &&
            by > y) {
            aboveWeight += otherBox.weight;
        }
    }
    return aboveWeight;
}

function evaluateFitness(individual: Box[], containerDimensions: [number, number, number]): [number, Container, Box[]] {
    const [containerWidth, containerHeight, containerLength] = containerDimensions;
    const container = new Container(containerWidth, containerHeight, containerLength);
    const unplacedBoxes: Box[] = [];
    let weightPenalty = 0;

    for (const box of individual) {
        if (!container.addBox(box)) {
            unplacedBoxes.push(box);
        }
    }

    container.applyGravity();

    const placedVolume = container.totalVolume - container.totalRemainingVolume;
    const totalBoxVolume = individual.reduce((sum, box) => sum + box.volume, 0);

    const volumeUtilization = totalBoxVolume > 0 ? placedVolume / totalBoxVolume : 0;

    const unplacedPenalty = unplacedBoxes.length / individual.length * 1.5;

    for (const [box, x, y, z] of container.boxes) {
        const aboveWeight = calculateAboveWeight(box, x, y, z, container.boxes);
        if (aboveWeight > box.weight) {
            weightPenalty += aboveWeight - box.weight;
        }
    }

    const fitness = volumeUtilization / (1 + unplacedPenalty + weightPenalty) - unplacedPenalty;

    return [fitness, container, unplacedBoxes];
}

function selectParents(population: Box[][], fitness: number[], numParents: number): Box[][] {
    const ranks = fitness.map((_, i) => ({ index: i, value: fitness[i] }))
        .sort((a, b) => b.value - a.value)
        .map((item, index) => ({ ...item, rank: index + 1 }));

    const rankSum = ranks.reduce((sum, item) => sum + item.rank, 0);
    const selectionProbs = ranks.map(item => item.rank / rankSum);

    const parents: Box[][] = [];
    for (let i = 0; i < numParents; i++) {
        const rand = Math.random();
        let cumulativeProb = 0;
        for (let j = 0; j < selectionProbs.length; j++) {
            cumulativeProb += selectionProbs[j];
            if (rand <= cumulativeProb) {
                parents.push(population[ranks[j].index]);
                break;
            }
        }
    }

    return parents;
}

function crossover(parent1: Box[], parent2: Box[]): [Box[], Box[]] {
    const crossoverPoint = Math.floor(Math.random() * parent1.length);
    const child1 = [...parent1.slice(0, crossoverPoint), ...parent2.filter(b => !parent1.slice(0, crossoverPoint).includes(b))];
    const child2 = [...parent2.slice(0, crossoverPoint), ...parent1.filter(b => !parent2.slice(0, crossoverPoint).includes(b))];
    return [child1, child2];
}

function mutate(individual: Box[], mutationRate: number): void {
    for (let i = 0; i < individual.length; i++) {
        if (Math.random() < mutationRate) {
            const j = Math.floor(Math.random() * individual.length);
            [individual[i], individual[j]] = [individual[j], individual[i]];
        }
    }
}

function geneticAlgorithm(boxesData: BoxData[], containerDimensions: [number, number, number], popSize: number = 150, numGenerations: number = 300, mutationRate: number = 0.01): [Box[], Container] {
    const boxes = boxesData.map(data => new Box(data));
    let population = initializePopulation(popSize, boxes);

    let bestFitness = Number.NEGATIVE_INFINITY;
    let bestContainer: Container | null = null;
    let bestIndividual: Box[] | null = null;

    for (let generation = 0; generation < numGenerations; generation++) {
        const fitnessResults = population.map(individual => evaluateFitness(individual, containerDimensions));
        const fitness = fitnessResults.map(result => result[0]);
        const containers = fitnessResults.map(result => result[1]);

        const currentBestFitness = Math.max(...fitness);
        const currentBestIndex = fitness.indexOf(currentBestFitness);
        const currentBestIndividual = population[currentBestIndex];
        const currentBestContainer = containers[currentBestIndex];

        if (currentBestFitness > bestFitness) {
            bestFitness = currentBestFitness;
            bestContainer = currentBestContainer;
            bestIndividual = currentBestIndividual;
        }

        const parents = selectParents(population, fitness, Math.floor(popSize / 2));
        const nextPopulation: Box[][] = [];

        for (let i = 0; i < parents.length; i += 2) {
            const parent1 = parents[i];
            const parent2 = parents[i + 1] || parents[0];
            const [child1, child2] = crossover(parent1, parent2);
            mutate(child1, mutationRate);
            mutate(child2, mutationRate);
            nextPopulation.push(child1, child2);
        }

        // Elitism: Keep the best individual in the new population
        nextPopulation[0] = bestIndividual ? [...bestIndividual] : nextPopulation[0];

        population = nextPopulation;
    }

    return [bestIndividual!, bestContainer!];
}

// Example usage
const boxesData: BoxData[] = [
    // ... (your provided JSON data here)
];

const containerDimensions: [number, number, number] = [1200, 1380, 2800]; // width, height, length

const [bestIndividual, bestContainer] = geneticAlgorithm(boxesData, containerDimensions);

// Prepare the final solution as JSON
const finalSolution = {
    fitness: bestFitness,
    boxes: bestContainer.boxes.map(([box, x, y, z]) => ({
        id: box.id,
        width: box.width,
        height: box.height,
        length: box.length,
        x,
        y,
        z
    }))
};

console.log(JSON.stringify(finalSolution, null, 2));