<template>
  <div
    class="flex h-screen overflow-hidden"
    :class="[isDark ? 'dark bg-neutral-900 text-white' : 'bg-gray-200 text-black']"
  >
    <Sidebar class="flex-shrink-0 w-64" />

    <div class="flex-1 overflow-x-hidden overflow-y-auto">
      <div class="p-4 ml-2 w-full">
        <h2 :class="[isDark ? 'text-white' : 'text-black', 'my-4 font-normal text-3xl']">
          <span class="font-bold">Custom Container Packer</span>
        </h2>

        <div class="flex flex-wrap mb-4">
          <div class="justify-center w-full mb-4 flex flex-wrap gap-4 md:flex-nowrap">
            <!-- Container Configuration -->
            <div
              :class="[
                isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
                'flex flex-col p-4 rounded-xl w-full md:w-[50%]'
              ]"
            >
              <h2 class="text-xl font-bold mb-4">Container Configuration</h2>
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div v-for="dim in ['width', 'height', 'length']" :key="dim">
                    <label
                      :for="dim"
                      class="block text-sm font-medium mb-1"
                      :class="isDark ? 'text-gray-300' : 'text-gray-700'"
                    >
                      {{ dim.charAt(0).toUpperCase() + dim.slice(1) }} (mm)
                    </label>
                    <input
                      :id="dim"
                      v-model="containerDimensions[dim]"
                      type="number"
                      required
                      :placeholder="`Enter ${dim}`"
                      class="w-full px-3 py-2 rounded-md"
                      :class="
                        isDark
                          ? 'bg-neutral-800 text-white'
                          : 'bg-gray-100 text-black border border-gray-300'
                      "
                    />
                  </div>
                </div>
                <div>
                  <label
                    for="boxCount"
                    class="block text-sm font-medium mb-1"
                    :class="isDark ? 'text-gray-300' : 'text-gray-700'"
                  >
                    Number of Boxes
                  </label>
                  <input
                    id="boxCount"
                    v-model="boxCount"
                    type="number"
                    required
                    placeholder="Enter number of boxes"
                    class="w-full px-3 py-2 rounded-md"
                    :class="
                      isDark
                        ? 'bg-neutral-800 text-white'
                        : 'bg-gray-100 text-black border border-gray-300'
                    "
                  />
                </div>
                <button
                  type="submit"
                  class="w-full py-2 px-4 rounded-md font-medium transition-colors duration-300 bg-orange-500 text-white hover:bg-orange-600"
                >
                  Generate Packing Solution
                </button>
              </form>
            </div>

            <!-- Algorithm Parameters Visualization -->
            <div
              :class="[
                isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
                'flex flex-col p-4 rounded-xl w-full md:w-[50%]'
              ]"
            >
              <h2 class="text-xl font-bold mb-4">Algorithm Parameters Visualization</h2>
              <div class="flex justify-center items-center w-full h-full">
                <div class="w-[300px] h-[300px] text-white">
                  <Chart
                    type="polarArea"
                    :data="chartData"
                    :options="chartOptions"
                    class="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap mb-4 gap-4">
          <!-- Genetic Algorithm Parameters -->
          <div
            :class="[
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
              'flex flex-col p-4 rounded-xl w-full md:w-[calc(50%-0.5rem)]'
            ]"
          >
            <h2 class="text-xl font-bold mb-4">Genetic Algorithm Parameters</h2>
            <div class="space-y-4">
              <div v-for="(value, key) in parameters" :key="key" class="space-y-2">
                <label
                  :for="key"
                  class="block text-sm font-medium"
                  :class="isDark ? 'text-gray-300' : 'text-gray-700'"
                >
                  {{ formatParameterName(key) }}
                </label>
                <input
                  :id="key"
                  v-model.number="parameters[key]"
                  type="number"
                  :step="key === 'mutationRate' ? 0.01 : 1"
                  :min="key === 'mutationRate' ? 0 : 1"
                  :max="key === 'mutationRate' ? 1 : undefined"
                  class="w-full px-3 py-2 rounded-md"
                  :class="
                    isDark
                      ? 'bg-neutral-800 text-white'
                      : 'bg-gray-100 text-black border border-gray-300'
                  "
                />
              </div>
            </div>
          </div>

          <!-- Fitness Attributes -->
          <div
            :class="[
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
              'flex flex-col p-4 rounded-xl w-full md:w-[calc(50%-0.5rem)]'
            ]"
          >
            <h2 class="text-xl font-bold mb-4">Fitness Attributes</h2>
            <div class="space-y-4">
              <div v-for="(value, key, index) in fitnessAttributes" :key="key" class="space-y-2">
                <label
                  :for="key"
                  class="block text-sm font-medium"
                  :class="isDark ? 'text-gray-300' : 'text-gray-700'"
                >
                  {{ formatAttributeName(key) }} ({{ value.toFixed(2) }}%)
                </label>
                <Slider
                  v-model="fitnessAttributes[key]"
                  :min="0"
                  :max="100"
                  :step="1"
                  @change="updateAttributes(key)"
                  :class="`custom-slider-${index}`"
                />
              </div>
            </div>
            <div class="mt-4 text-center" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
              Total: {{ totalPercentage.toFixed(2) }}%
              <span v-if="totalPercentage !== 100" class="text-red-500 ml-2">
                (Adjust to reach 100%)
              </span>
            </div>
          </div>
        </div>

        <!-- Packing Result and 3D Visualization -->
        <div class="flex flex-wrap mb-4 gap-4">
          <div
            v-if="packingResult"
            :class="[
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
              'flex flex-col p-4 rounded-xl w-full md:w-[calc(50%-0.5rem)]'
            ]"
          >
            <h2 class="text-xl font-bold mb-2">Packing Result</h2>
            <p>Fitness: {{ packingResult.fitness.toFixed(4) }}</p>
            <p>Boxes Packed: {{ packingResult.boxes.length }}</p>
            <p>Solution Time: {{ solutionTime }} seconds</p>
          </div>
        </div>

        <div
          :class="[
            isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
            'flex flex-col p-4 rounded-xl w-full mb-4'
          ]"
        >
          <div class="w-full h-[400px] sm:h-[500px] lg:h-[600px]" ref="threeContainer"></div>
        </div>
      </div>

      <LoadingScreen
        :show="isLoading"
        :progress="loadingProgress"
        :status-message="loadingStatusMessage"
      />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { geneticAlgorithm } from '../../supabase/functions/packing/algorithm'
import { supabase } from '../supabase'
import Loading from '../views/Loading.vue'
import Slider from 'primevue/slider'
import LoadingScreen from '@/components/loadingPercentage.vue'

let scene, camera, renderer, controls

const isDark = useDark()
const toggleDark = useToggle(isDark)

const containerDimensions = reactive({
  width: '2000',
  height: '1500',
  length: '2500'
})
const boxCount = ref(0)
const packingResult = ref(null)
const threeContainer = ref(null)
const isLoading = ref(false)
const loadingProgress = ref(0)
const loadingStatusMessage = ref('')

const fitnessAttributes = reactive({
  volumeUtilization: 20,
  spreadFactor: 10,
  averageLayerUtilization: 25,
  weightDistributionPenalty: 5,
  packingRatio: 20,
  compactness: 10,
  proximityPenalty: 10
})

const parameters = reactive({
  populationSize: 150,
  generations: 300,
  mutationRate: 0.01
})

const totalPercentage = computed(() => {
  return Object.values(fitnessAttributes).reduce((sum, value) => sum + value, 0)
})

const updateAttributes = (changedKey) => {
  const total = totalPercentage.value
  if (total > 100) {
    const excess = total - 100
    const changedValue = fitnessAttributes[changedKey]
    fitnessAttributes[changedKey] = Math.max(0, changedValue - excess)
  }
  updateChartData()
}

const formatAttributeName = (key) => {
  return key
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatParameterName = (key) => {
  return key
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const chartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384']

const chartData = ref({
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: chartColors
    }
  ]
})

const chartOptions = computed(() => ({
  responsive: true,
  plugins: {
    legend: {
      position: 'left',
      labels: {
        color: isDark.value ? 'white' : 'black',
        font: {
          size: 12
        }
      }
    }
  },
  scales: {
    r: {
      grid: {
        color: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      },
      angleLines: {
        color: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        color: isDark.value ? 'white' : 'black',
        font: {
          size: 10
        },
        backdropColor: 'transparent'
      }
    }
  }
}))

const updateChartData = () => {
  chartData.value.labels = Object.keys(fitnessAttributes).map(formatAttributeName)
  chartData.value.datasets[0].data = Object.values(fitnessAttributes)
}
const solutionTime = ref(0)

const handleSubmit = async () => {
  const containerSize = [
    Number(containerDimensions.width),
    Number(containerDimensions.height),
    Number(containerDimensions.length)
  ]

  if (containerSize.some(isNaN) || isNaN(Number(boxCount.value))) {
    alert('Please enter valid numbers for all fields.')
    return
  }

  try {
    isLoading.value = true
    loadingProgress.value = 0
    loadingStatusMessage.value = 'Generating random boxes...'

    const startTime = performance.now()

    const randomBoxes = await generateRandomBoxes(Number(boxCount.value), containerSize)

    loadingProgress.value = 10
    loadingStatusMessage.value = 'Initializing genetic algorithm...'

    const result = await new Promise((resolve) => {
      const worker = new Worker(
        new URL('../../supabase/functions/packing/algorithm.ts', import.meta.url),
        { type: 'module' }
      )

      worker.onmessage = (event) => {
        if (event.data.type === 'progress') {
          loadingProgress.value = 10 + event.data.progress * 90
          loadingStatusMessage.value = `Generation ${event.data.generation} of ${parameters.generations}`
        } else if (event.data.type === 'result') {
          resolve(event.data.result)
          worker.terminate()
        }
      }

      // Ensure we're only passing cloneable data
      const cloneableBoxesData = randomBoxes.map((box) => ({
        id: box.id,
        Shipment_id: box.Shipment_id,
        Packed_time: box.Packed_time,
        Width: box.Width,
        Length: box.Length,
        Height: box.Height,
        Weight: box.Weight,
        Volume: box.Volume
      }))

      const cloneableFitnessAttributes = Object.fromEntries(
        Object.entries(fitnessAttributes).map(([key, value]) => [key, Number(value)])
      )

      worker.postMessage({
        boxesData: cloneableBoxesData,
        containerDimensions: containerSize,
        populationSize: Number(parameters.populationSize),
        generations: Number(parameters.generations),
        mutationRate: Number(parameters.mutationRate),
        fitnessAttributes: cloneableFitnessAttributes
      })
    })

    const endTime = performance.now()
    solutionTime.value = ((endTime - startTime) / 1000).toFixed(2) // Convert to seconds and round to 2 decimal places

    if (result.data) {
      packingResult.value = result.data
      initThreeJS(containerSize, result.data.boxes)
    } else {
      alert('No valid packing solution found. Try adjusting the parameters.')
    }
  } catch (error) {
    console.error('Error generating packing solution:', error)
    alert('Failed to generate packing solution. Please try again.')
  } finally {
    isLoading.value = false
    loadingProgress.value = 0
    loadingStatusMessage.value = ''
  }
}

const generateRandomBoxes = async (count) => {
  try {
    const { data, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({ type: 'getXPackages', numberBoxes: count }),
      method: 'POST'
    })

    if (error) {
      console.error('API Error:', error)
      return []
    }
    console.log(JSON.stringify(data.data))

    return data.data
  } catch (error) {
    console.error('API Error:', error)
    return []
  }
}

const initThreeJS = (containerSize, boxes) => {
  if (scene) {
    scene.clear()
    renderer.dispose()
  } else {
    scene = new THREE.Scene()
  }

  camera = new THREE.PerspectiveCamera(
    75,
    threeContainer.value.clientWidth / threeContainer.value.clientHeight,
    0.1,
    10000
  )
  renderer = new THREE.WebGLRenderer({ antialias: true })

  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
  renderer.setClearColor(isDark.value ? '#171717' : 0xffffff)
  threeContainer.value.innerHTML = ''
  threeContainer.value.appendChild(renderer.domElement)

  camera.position.set(containerSize[0] * 1.5, containerSize[1] * 1.5, containerSize[2] * 1.5)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.25
  controls.screenSpacePanning = false
  controls.maxPolarAngle = Math.PI / 2

  createContainer(scene, containerSize, isDark.value)
  createBoxesFromData(scene, boxes, isDark.value)

  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
}

const createContainer = (scene, containerSize, isDark) => {
  const geometry = new THREE.BoxGeometry(containerSize[0], containerSize[1], containerSize[2])
  const material = new THREE.MeshBasicMaterial({
    color: '#64748b',
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(containerSize[0] / 2, containerSize[1] / 2, containerSize[2] / 2)
  scene.add(mesh)

  const edgesGeometry = new THREE.EdgesGeometry(geometry)
  const edgesMaterial = new THREE.LineBasicMaterial({ color: isDark ? 0xffffff : 0x000000 })
  const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial)

  mesh.add(wireframe)
}

const createBoxesFromData = (scene, boxesData, isDark) => {
  const weights = boxesData.map((box) => box.weight)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)

  boxesData.forEach((box) => {
    if (box.unplaced) return // Skip unplaced boxes

    const geometry = new THREE.BoxGeometry(box.width, box.height, box.length)
    const color = getColorForWeight(box.weight, minWeight, maxWeight)
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.7
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(box.x + box.width / 2, box.y + box.height / 2, box.z + box.length / 2)
    scene.add(mesh)

    const edgesGeometry = new THREE.EdgesGeometry(geometry)
    const edgesMaterial = new THREE.LineBasicMaterial({ color: isDark ? 0xffffff : 0x000000 })
    const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial)
    mesh.add(wireframe)
  })
}

const getColorForWeight = (weight, minWeight, maxWeight) => {
  if (minWeight === maxWeight) return '#facc15'
  const normalizedWeight = (weight - minWeight) / (maxWeight - minWeight)
  const red = 255
  const green = Math.floor((1 - normalizedWeight) * 255)
  return `rgb(${red}, ${green}, 0)`
}

const updateSceneColors = () => {
  if (renderer) {
    renderer.setClearColor(isDark.value ? '#171717' : 0xffffff)
  }
  if (scene) {
    scene.traverse((object) => {
      if (object instanceof THREE.LineSegments) {
        object.material.color.set(isDark.value ? 0xffffff : 0x000000)
        object.material.needsUpdate = true
      }
    })
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

onMounted(() => {
  const style = document.createElement('style')
  style.textContent = chartColors
    .map(
      (color, index) => `
    .custom-slider-${index} .p-slider-range {
      background: ${color} !important;
    }
  `
    )
    .join('\n')
  document.head.appendChild(style)
})

const handleResize = () => {
  if (camera && renderer && threeContainer.value) {
    camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
  }
}

watch(isDark, updateSceneColors)
watch(fitnessAttributes, updateChartData, { deep: true, immediate: true })
</script>
