/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

interface Box {
  id: number
  width: number
  height: number
  length: number
  weight: number
  volume: number
}

interface Container {
  width: number
  height: number
  length: number
  boxes: Box[]
  remaining_space: [number, number, number, number, number, number][]
  total_volume: number
  total_remaining_volume: number
}

class ContainerClass implements Container {
  width: number
  height: number
  length: number
  boxes: Box[]
  remaining_space: [number, number, number, number, number, number][]
  total_volume: number
  total_remaining_volume: number

  constructor(width: number, height: number, length: number) {
    this.width = width
    this.height = height
    this.length = length
    this.boxes = []
    this.remaining_space = [[0, 0, 0, width, height, length]]
    this.total_volume = width * height * length
    this.total_remaining_volume = this.total_volume
  }

  can_fit(box: Box, space: [number, number, number, number, number, number]): boolean {
    const [_, __, ___, w, h, l] = space
    return box.width <= w && box.height <= h && box.length <= l
  }

  add_box(box: Box): boolean {
    for (const space of this.remaining_space.sort((a, b) => a[1] - b[1] || a[0] - b[0])) {
      const orientations = this.generate_orientations(box)
      for (const orientation of orientations) {
        if (this.can_fit(orientation, space)) {
          const [x, y, z, w, h, l] = space
          if (
            !this.check_overlap(orientation, x, y, z) &&
            this.is_supported(orientation, x, y, z)
          ) {
            if (this.check_weight_distribution(orientation, x, y, z)) {
              this.boxes.push({ ...orientation, x, y, z })
              this.remaining_space = this.remaining_space.filter((s) => s !== space)
              this.split_space(x, y, z, orientation)
              this.total_remaining_volume -= orientation.volume
              return true
            }
          }
        }
      }
    }
    return false
  }

  check_weight_distribution(new_box: Box, x: number, y: number, z: number): boolean {
    for (const box of this.boxes) {
      if (
        box.x < x + new_box.width &&
        box.x + box.width > x &&
        box.z < z + new_box.length &&
        box.z + box.length > z
      ) {
        if (box.y > y && new_box.weight > box.weight * 1.1) {
          return false
        }
      }
    }
    return true
  }

  split_space(x: number, y: number, z: number, box: Box) {
    const new_spaces: [number, number, number, number, number, number][] = []
    const [_, __, ___, w, h, l] = [x, y, z, this.width - x, this.height - y, this.length - z]

    if (w - box.width > 0) {
      new_spaces.push([x + box.width, y, z, w - box.width, box.height, box.length])
    }
    if (h - box.height > 0) {
      new_spaces.push([x, y + box.height, z, box.width, h - box.height, box.length])
    }
    if (l - box.length > 0) {
      new_spaces.push([x, y, z + box.length, box.width, box.height, l - box.length])
    }

    this.remaining_space.push(...new_spaces)
  }

  generate_orientations(box: Box): Box[] {
    const dimensions = [box.width, box.height, box.length]
    const permutations = new Set(
      dimensions.flatMap((d, i) =>
        dimensions.flatMap((e, j) => dimensions.map((f, k) => [d, e, f]))
      )
    )
    return Array.from(permutations).map(([width, height, length]) => ({
      ...box,
      width,
      height,
      length,
      volume: width * height * length
    }))
  }

  check_overlap(new_box: Box, new_x: number, new_y: number, new_z: number): boolean {
    return this.boxes.some(
      (box) =>
        new_x < box.x + box.width &&
        new_x + new_box.width > box.x &&
        new_y < box.y + box.height &&
        new_y + new_box.height > box.y &&
        new_z < box.z + box.length &&
        new_z + new_box.length > box.z
    )
  }

  is_supported(box: Box, x: number, y: number, z: number): boolean {
    if (y === 0) {
      return true // The box is on the container floor
    }
    let support_area = 0
    const required_area = 0.6 * box.width * box.length // At least 60% of the bottom face should be supported

    for (const other_box of this.boxes) {
      if (other_box.y + other_box.height === y) {
        // Check if other box is directly below
        const overlap_width = Math.max(
          0,
          Math.min(x + box.width, other_box.x + other_box.width) - Math.max(x, other_box.x)
        )
        const overlap_length = Math.max(
          0,
          Math.min(z + box.length, other_box.z + other_box.length) - Math.max(z, other_box.z)
        )
        support_area += overlap_width * overlap_length
      }
    }

    return support_area >= required_area
  }

  apply_gravity() {
    let moved = true
    while (moved) {
      moved = false
      for (let i = 0; i < this.boxes.length; i++) {
        const box = this.boxes[i]
        let new_y = box.y
        while (
          new_y > 0 &&
          !this.check_overlap(box, box.x, new_y - 1, box.z) &&
          this.is_supported(box, box.x, new_y - 1, box.z)
        ) {
          new_y -= 1
        }
        if (new_y !== box.y) {
          this.boxes[i] = { ...box, y: new_y }
          moved = true
        }
      }
    }
  }
}

function initialize_population(pop_size: number, boxes: Box[]): Box[][] {
  const population = []
  for (let i = 0; i < pop_size; i++) {
    const individual = [...boxes].sort((a, b) => b.weight / b.volume - a.weight / a.volume) // descending
    population.push(individual)
  }
  return population
}

function calculate_above_weight(
  box: Box,
  x: number,
  y: number,
  z: number,
  placed_boxes: Box[]
): number {
  return placed_boxes.reduce((acc, other_box) => {
    if (
      other_box.x < x + box.width &&
      other_box.x + other_box.width > x &&
      other_box.z < z + box.length &&
      other_box.z + other_box.length > z &&
      other_box.y > y
    ) {
      return acc + other_box.weight
    }
    return acc
  }, 0)
}

function evaluate_fitness(
  individual: Box[],
  container_dimensions: [number, number, number]
): [number, ContainerClass, Box[]] {
  const [container_width, container_height, container_length] = container_dimensions
  const container = new ContainerClass(container_width, container_height, container_length)
  const unplaced_boxes = []
  let weight_penalty = 0

  for (const box of individual) {
    if (!container.add_box(box)) {
      unplaced_boxes.push(box)
    }
  }

  container.apply_gravity()

  const placed_volume = container.total_volume - container.total_remaining_volume
  const total_box_volume = individual.reduce((acc, box) => acc + box.volume, 0)

  // Calculate the percentage of placed volume
  const volume_utilization = total_box_volume > 0 ? placed_volume / total_box_volume : 0

  // Penalize unplaced boxes, but not as severely
  const unplaced_penalty = (unplaced_boxes.length / individual.length) * 1.5

  // Calculate weight penalty for boxes at the bottom
  for (const box of container.boxes) {
    const above_weight = calculate_above_weight(box, box.x, box.y, box.z, container.boxes)
    if (above_weight > box.weight) {
      weight_penalty += above_weight - box.weight
    }
  }

  // Combine the factors
  let fitness = volume_utilization / (1 + unplaced_penalty + weight_penalty) // This will always be between 0 and 1
  fitness -= unplaced_penalty

  return [fitness, container, unplaced_boxes]
}

let best_fitness = -Infinity
let best_container: ContainerClass | null = null
let best_individual: Box[] | null = null

function clone_container(container: ContainerClass): ContainerClass {
  const new_container = new ContainerClass(container.width, container.height, container.length)
  new_container.boxes = container.boxes.map((box) => ({ ...box }))
  new_container.remaining_space = [...container.remaining_space]
  new_container.total_remaining_volume = container.total_remaining_volume
  return new_container
}

function update_best_solution(individual: Box[], container: ContainerClass, fitness: number) {
  if (fitness > best_fitness) {
    best_fitness = fitness
    best_container = clone_container(container)
    best_individual = [...individual]
  }
}

function select_parents(population: Box[][], fitness: number[], num_parents: number): Box[][] {
  const ranks = fitness.map((_, i) => i).sort((a, b) => fitness[a] - fitness[b])
  const rank_sum = ranks.reduce((acc, rank) => acc + rank, 0)
  if (rank_sum === 0) {
    throw new Error('Sum of ranks is zero, check ranking method.')
  }
  const selection_probs = ranks.map((rank) => rank / rank_sum)
  const parents_indices = new Array(num_parents).fill(0).map(() => {
    let rand = Math.random()
    for (let i = 0; i < selection_probs.length; i++) {
      rand -= selection_probs[i]
      if (rand <= 0) {
        return i
      }
    }
    return 0
  })
  return parents_indices.map((idx) => population[idx])
}

function crossover(parent1: Box[], parent2: Box[]): [Box[], Box[]] {
  const crossover_point = Math.floor(Math.random() * parent1.length)
  const child1 = [
    ...parent1.slice(0, crossover_point),
    ...parent2.filter((box) => !parent1.includes(box))
  ]
  const child2 = [
    ...parent2.slice(0, crossover_point),
    ...parent1.filter((box) => !parent2.includes(box))
  ]
  return [child1, child2]
}

function mutate(individual: Box[], mutation_rate: number) {
  for (let i = 0; i < individual.length; i++) {
    if (Math.random() < mutation_rate) {
      const j = Math.floor(Math.random() * individual.length)
      ;[individual[i], individual[j]] = [individual[j], individual[i]]
    }
  }
}

async function genetic_algorithm(
  boxes_data: Box[],
  container_dimensions: [number, number, number],
  pop_size = 150,
  num_generations = 300,
  mutation_rate = 0.01
) {
  const boxes = boxes_data.map((box) => ({ ...box }))
  boxes.sort((a, b) => b.weight - a.weight) // Sort boxes by weight, heaviest first

  let population = initialize_population(pop_size, boxes)

  for (let generation = 0; generation < num_generations; generation++) {
    const fitness_results = population.map((individual) =>
      evaluate_fitness(individual, container_dimensions)
    )
    const fitness = fitness_results.map((result) => result[0])
    const containers = fitness_results.map((result) => result[1])
    const unplaced_boxes_list = fitness_results.map((result) => result[2])

    const current_best_fitness = Math.max(...fitness)
    const current_best_index = fitness.indexOf(current_best_fitness)
    const current_best_individual = population[current_best_index]
    const current_best_container = containers[current_best_index]
    const current_unplaced_boxes = unplaced_boxes_list[current_best_index]

    update_best_solution(current_best_individual, current_best_container, current_best_fitness)

    const parents = select_parents(population, fitness, Math.floor(pop_size / 2))
    const next_population: Box[][] = []

    for (let i = 0; i < parents.length; i += 2) {
      const parent1 = parents[i]
      const parent2 = parents[i + 1] || parents[0]
      const [child1, child2] = crossover(parent1, parent2)
      mutate(child1, mutation_rate)
      mutate(child2, mutation_rate)
      next_population.push(child1, child2)
    }

    // Elitism: Keep the best individual in the new population
    next_population[0] = best_individual ? [...best_individual] : []

    population = next_population
  }

  return {
    best_individual,
    best_container,
    best_fitness
  }
}
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
  'Access-Control-Allow-Headers':
    'apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization'
}

function defaultResponse() {
  return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 404
  })
}

function responseBuilder(data: any) {
  if (!data) {
    const error = { error: 'No data returned' }
    return new Response(JSON.stringify(error), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 404
    })
  }
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  })
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }
    if (req.method === 'POST') {
      const requestBody = await req.json()
      console.log(requestBody)

      // Perform the genetic algorithm
      const result = await genetic_algorithm(
        requestBody.boxes_data,
        requestBody.container_dimensions
      )

      return responseBuilder(result)
    }

    return new Response(JSON.stringify({ error: 'Invalid request method' }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error processing request:', error.message)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
