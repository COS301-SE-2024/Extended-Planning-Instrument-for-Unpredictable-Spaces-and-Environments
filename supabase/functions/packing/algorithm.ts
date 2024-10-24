type BoxData = {
  id: number
  Shipment_id: number
  Packed_time: string | null
  Width: number
  Length: number
  Height: number
  Weight: number
  Volume: number
}

class Box {
  id: number
  Shipment_id: number
  Packed_time: string
  width: number
  height: number
  length: number
  volume: number
  weight: number
  density: number

  constructor(boxData: BoxData) {
    this.id = boxData.id
    this.Shipment_id = boxData.Shipment_id
    this.Packed_time = boxData.Packed_time
    this.width = boxData.Width
    this.height = boxData.Height
    this.length = boxData.Length
    this.volume = boxData.Volume
    this.weight = boxData.Weight
    this.density = this.weight / this.volume
  }

  rotate(newWidth: number, newHeight: number, newLength: number): Box {
    const rotatedBoxData: BoxData = {
      id: this.id,
      Shipment_id: this.Shipment_id,
      Packed_time: this.Packed_time,
      Width: newWidth,
      Height: newHeight,
      Length: newLength,
      Weight: this.weight,
      Volume: newWidth * newHeight * newLength
    }
    return new Box(rotatedBoxData)
  }
}

class Container {
  width: number
  height: number
  length: number
  boxes: [Box, number, number, number][]
  remainingSpace: [number, number, number, number, number, number][]
  totalVolume: number
  totalRemainingVolume: number
  requiredArea: number
  maxweightDistribution: number

  constructor(width: number, height: number, length: number) {
    this.width = width
    this.height = height
    this.length = length
    this.boxes = []
    this.remainingSpace = [[0, 0, 0, width, height, length]]
    this.totalVolume = width * height * length
    this.totalRemainingVolume = this.totalVolume
    this.requiredArea = 85
    this.maxweightDistribution = 20
  }
  setSupportArea(supportArea: number) {
    this.requiredArea = supportArea
  }
  setMaxWeightDistribution(maxWeightDist: number) {
    this.maxweightDistribution = maxWeightDist
  }
  canFit(box: Box, space: [number, number, number, number, number, number]): boolean {
    const [, , , w, h, l] = space
    return box.width <= w && box.height <= h && box.length <= l
  }

  addBox(box: Box): boolean {
    // Sort remaining spaces by z, y, and then x coordinates
    this.remainingSpace.sort((a, b) => a[2] - b[2] || a[1] - b[1] || a[0] - b[0])

    for (const space of this.remainingSpace) {
      for (const orientation of this.generateOrientations(box)) {
        if (this.canFit(orientation, space)) {
          const [x, y, z] = space
          if (
            !this.checkOverlap(orientation, x, y, z) &&
            this.isSupported(orientation, x, y, z) &&
            this.checkWeightDistribution(orientation, x, y, z)
          ) {
            this.boxes.push([orientation, x, y, z])
            this.remainingSpace = this.remainingSpace.filter((s) => s !== space)
            this.splitSpace(x, y, z, orientation)
            this.totalRemainingVolume -= orientation.volume
            return true
          }
        }
      }
    }
    return false
  }

  checkWeightDistribution(newBox: Box, x: number, y: number, z: number): boolean {
    const MAX_WEIGHT_RATIO = 1 + this.maxweightDistribution / 100

    for (const [box, bx, by, bz] of this.boxes) {
      if (
        bx < x + newBox.width &&
        bx + box.width > x &&
        bz < z + newBox.length &&
        bz + box.length > z &&
        by + box.height <= y
      ) {
        // If the new box is heavier than the allowed ratio, return false
        if (newBox.weight > box.weight * MAX_WEIGHT_RATIO) {
          return false
        }
      }
    }
    return true
  }

  splitSpace(x: number, y: number, z: number, box: Box): void {
    const newSpaces: [number, number, number, number, number, number][] = []
    const [, , , w, h, l] = [x, y, z, this.width - x, this.height - y, this.length - z]

    if (w - box.width > 0) {
      newSpaces.push([x + box.width, y, z, w - box.width, box.height, box.length])
    }
    if (h - box.height > 0) {
      newSpaces.push([x, y + box.height, z, box.width, h - box.height, box.length])
    }
    if (l - box.length > 0) {
      newSpaces.push([x, y, z + box.length, box.width, box.height, l - box.length])
    }

    this.remainingSpace.push(...newSpaces)
  }

  generateOrientations(box: Box): Box[] {
    const dimensions = [box.width, box.height, box.length]
    const permutations = this.permute(dimensions)

    const uniquePerms = Array.from(new Set(permutations.map((perm) => perm.join(',')))).map((str) =>
      str.split(',').map(Number)
    )

    return uniquePerms.map((perm) => box.rotate(perm[0], perm[1], perm[2]))
  }

  permute(arr: number[]): number[][] {
    if (arr.length <= 1) return [arr]
    const result: number[][] = []
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i]
      const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)]
      const perms = this.permute(remaining)
      for (const perm of perms) {
        result.push([current, ...perm])
      }
    }
    return result
  }

  checkOverlap(newBox: Box, newX: number, newY: number, newZ: number): boolean {
    const EPSILON = 1e-6

    for (const [box, x, y, z] of this.boxes) {
      if (
        newX < x + box.width - EPSILON &&
        newX + newBox.width > x + EPSILON &&
        newY < y + box.height - EPSILON &&
        newY + newBox.height > y + EPSILON &&
        newZ < z + box.length - EPSILON &&
        newZ + newBox.length > z + EPSILON
      ) {
        return true
      }
    }
    return false
  }

  isSupported(box: Box, x: number, y: number, z: number): boolean {
    if (y === 0) return true
    let supportArea = 0
    const calcrequiredArea = (this.requiredArea / 100) * box.width * box.length

    for (const [otherBox, ox, oy, oz] of this.boxes) {
      if (oy + otherBox.height === y) {
        const overlapWidth = Math.max(
          0,
          Math.min(x + box.width, ox + otherBox.width) - Math.max(x, ox)
        )
        const overlapLength = Math.max(
          0,
          Math.min(z + box.length, oz + otherBox.length) - Math.max(z, oz)
        )
        supportArea += overlapWidth * overlapLength
      }
    }

    return supportArea >= calcrequiredArea
  }

  applyGravity(): void {
    let moved = true
    while (moved) {
      moved = false
      for (let i = 0; i < this.boxes.length; i++) {
        const [box, x, y, z] = this.boxes[i]
        let newY = y
        while (
          newY > 0 &&
          !this.checkOverlap(box, x, newY - 1, z) &&
          this.isSupported(box, x, newY - 1, z)
        ) {
          newY--
        }
        if (newY !== y) {
          this.boxes[i] = [box, x, newY, z]
          moved = true
        }
      }
    }
  }
}

function initializePopulation(popSize: number, boxes: Box[]): Box[][] {
  const population: Box[][] = []
  for (let i = 0; i < popSize; i++) {
    const individual = [...boxes].sort(() => Math.random() - 0.5)
    population.push(individual)
  }
  return population
}

function evaluateFitness(
  fitnessAttributes: Record<string, number>,
  individual: Box[],
  containerDimensions: [number, number, number]
): [number, Container, Box[]] {
  const [containerWidth, containerHeight, containerLength] = containerDimensions
  const container = new Container(containerWidth, containerHeight, containerLength)
  const unplacedBoxes: Box[] = []

  container.setSupportArea(fitnessAttributes.requiredSupportArea)
  container.setMaxWeightDistribution(fitnessAttributes.maxWeightRatio)

  for (const box of individual) {
    if (!container.addBox(box)) {
      unplacedBoxes.push(box)
    }
  }

  container.applyGravity()

  const placedVolume = container.totalVolume - container.totalRemainingVolume
  const totalBoxVolume = individual.reduce((sum, box) => sum + box.volume, 0)
  const volumeUtilization = totalBoxVolume > 0 ? placedVolume / totalBoxVolume : 0

  // Weight distribution penalty
  const weightDistributionPenalty = calculateWeightDistributionPenalty(container)

  // Unplaced penalty
  const unplacedPenalty = (unplacedBoxes.length / individual.length) * 1.5

  // Combine the factors
  let fitness =
    (volumeUtilization * (fitnessAttributes.volumeUtilization / 100)) /
    (1 + unplacedPenalty + weightDistributionPenalty * (fitnessAttributes.weightDistribution / 100))

  fitness -= unplacedPenalty

  return [fitness, container, unplacedBoxes]
}

function calculateWeightDistributionPenalty(container: Container): number {
  let totalPenalty = 0
  const totalBoxes = container.boxes.length

  for (const [box, x, y, z] of container.boxes) {
    const aboveWeight = calculateAboveWeight(box, x, y, z, container.boxes)
    if (aboveWeight > box.weight) {
      totalPenalty += (aboveWeight - box.weight) / (box.weight * totalBoxes)
    }
  }

  return totalPenalty
}

function calculateAboveWeight(
  box: Box,
  x: number,
  y: number,
  z: number,
  placedBoxes: [Box, number, number, number][]
): number {
  let aboveWeight = 0
  for (const [otherBox, bx, by, bz] of placedBoxes) {
    if (
      bx < x + box.width &&
      bx + otherBox.width > x &&
      bz < z + box.length &&
      bz + otherBox.length > z &&
      by > y
    ) {
      aboveWeight += otherBox.weight
    }
  }
  return aboveWeight
}

function selectParents(population: Box[][], fitness: number[], numParents: number): Box[][] {
  const ranks = fitness
    .map((_, i) => ({ index: i, value: fitness[i] }))
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({ ...item, rank: index + 1 }))

  const rankSum = ranks.reduce((sum, item) => sum + item.rank, 0)
  const selectionProbs = ranks.map((item) => item.rank / rankSum)

  const parents: Box[][] = []
  for (let i = 0; i < numParents; i++) {
    const rand = Math.random()
    let cumulativeProb = 0
    for (let j = 0; j < selectionProbs.length; j++) {
      cumulativeProb += selectionProbs[j]
      if (rand <= cumulativeProb) {
        parents.push(population[ranks[j].index])
        break
      }
    }
  }

  return parents
}

function crossover(parent1: Box[], parent2: Box[]): [Box[], Box[]] {
  const crossoverPoint = Math.floor(Math.random() * parent1.length)
  const child1 = [
    ...parent1.slice(0, crossoverPoint),
    ...parent2.filter((b) => !parent1.slice(0, crossoverPoint).includes(b))
  ]
  const child2 = [
    ...parent2.slice(0, crossoverPoint),
    ...parent1.filter((b) => !parent2.slice(0, crossoverPoint).includes(b))
  ]
  return [child1, child2]
}

function mutate(individual: Box[], mutationRate: number): void {
  for (let i = 0; i < individual.length; i++) {
    if (Math.random() < mutationRate) {
      const j = Math.floor(Math.random() * individual.length)
      ;[individual[i], individual[j]] = [individual[j], individual[i]]
    }
  }
}

export function geneticAlgorithm(
  boxesData: BoxData[],
  containerDimensions: [number, number, number],
  popSize: number = 150,
  numGenerations: number = 300,
  mutationRate: number = 0.02,
  fitnessAttributes: Record<string, number>
): { data: { fitness: number; boxes: any[] } } {
  if (!boxesData || !Array.isArray(boxesData) || boxesData.length === 0) {
    console.error('Invalid or empty boxesData:', boxesData)
    return { data: { fitness: 0, boxes: [] } }
  }

  const boxes = boxesData.map((data) => new Box(data))
  let population = initializePopulation(popSize, boxes)

  let globalBestFitness = -100000000
  let globalBestContainer: Container | undefined
  let globalBestIndividual: Box[] | undefined

  for (let generation = 0; generation < numGenerations; generation++) {
    const fitnessResults = population.map((individual) =>
      evaluateFitness(fitnessAttributes, individual, containerDimensions)
    )
    const fitness = fitnessResults.map((result) => result[0])
    const containers = fitnessResults.map((result) => result[1])

    const generationBestFitness = Math.max(...fitness)
    const generationBestIndex = fitness.indexOf(generationBestFitness)

    if (generationBestFitness > globalBestFitness) {
      globalBestFitness = generationBestFitness
      globalBestContainer = containers[generationBestIndex]
      globalBestIndividual = population[generationBestIndex]
    }

    const eliteCount = Math.floor(popSize * 0.1)
    const elites = population
      .map((individual, i) => ({ individual, fitness: fitness[i] }))
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, eliteCount)
      .map((elite) => elite.individual)

    const parents = selectParents(population, fitness, popSize - eliteCount)
    const children: Box[][] = []
    const nextPopulation = [...elites]

    for (let i = 0; i < parents.length; i += 2) {
      const parent1 = parents[i]
      const parent2 = parents[i + 1] || parents[0]
      const [child1, child2] = crossover(parent1, parent2)
      mutate(child1, mutationRate)
      mutate(child2, mutationRate)
      children.push(child1, child2)
    }

    population = [...elites, ...children].slice(0, popSize)

    // Report progress
    if (typeof self !== 'undefined' && 'postMessage' in self) {
      self.postMessage({
        type: 'progress',
        progress: (generation + 1) / numGenerations,
        generation: generation + 1,
        currentBestFitness: generationBestFitness
      })
    }

    // Early termination condition
    if (globalBestFitness > 0.95) {
      break
    }
  }

  if (globalBestContainer && globalBestIndividual) {
    const result = {
      data: {
        fitness: globalBestFitness,
        boxes: globalBestContainer.boxes.map(([box, x, y, z]) => ({
          id: box.id,
          width: box.width,
          height: box.height,
          length: box.length,
          weight: box.weight,
          volume: box.volume,
          x,
          y,
          z,
          unplaced: false
        }))
      }
    }

    return result
  } else {
    console.error('No valid solution found.')
    return { data: { fitness: 0, boxes: [] } }
  }
}

// Web Worker setup
if (typeof self !== 'undefined' && 'addEventListener' in self) {
  self.addEventListener('message', (event) => {
    const result = geneticAlgorithm(
      event.data.boxesData,
      event.data.containerDimensions,
      event.data.populationSize,
      event.data.generations,
      event.data.mutationRate,
      event.data.fitnessAttributes
    )
    self.postMessage({ type: 'result', result })
  })
}
