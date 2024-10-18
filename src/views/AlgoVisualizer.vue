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
                  <h3 class="text-lg font-semibold mb-2">
                    Please enter the quantity desired for each box type:
                  </h3>
                  <div v-for="(box, index) in boxConfigurations" :key="index" class="mb-4">
                    <p class="mb-2">
                      Box {{ index + 1 }} ({{ box.width }}x{{ box.length }}x{{ box.height }} mm)
                    </p>
                    <input
                      v-model.number="box.count"
                      type="number"
                      min="0"
                      max="100"
                      required
                      :placeholder="'Enter count (max 100)'"
                      class="w-full px-3 py-2 rounded-md"
                      :class="
                        isDark
                          ? 'bg-neutral-800 text-white'
                          : 'bg-gray-100 text-black border border-gray-300'
                      "
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  class="w-full py-2 px-4 rounded-md font-medium transition-colors duration-300 bg-orange-500 text-white hover:bg-orange-600"
                >
                  Generate Packing Solution
                </button>
              </form>
            </div>

            <!-- Genetic Algorithm Parameters (Moved here) -->
            <div
              :class="[
                isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
                'flex flex-col p-4 rounded-xl w-full md:w-[50%]'
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
          </div>
        </div>

        <div class="flex flex-wrap">
          <div class="justify-center w-full mb-4 flex flex-wrap gap-4 md:flex-nowrap">
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

            <!-- Fitness Attributes -->
            <div
              :class="[
                isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
                'flex flex-col p-4 rounded-xl w-full md:w-[50%]'
              ]"
            >
              <h2 class="text-xl font-bold mb-4">Fitness Attributes</h2>
              <div class="space-y-4">
                <!-- Volume Utilization and Weight Distribution -->
                <div v-for="(value, key, index) in mainAttributes" :key="key" class="space-y-2">
                  <label
                    v-tooltip.bottom="attributeDescriptions[key]"
                    :for="key"
                    class="block text-sm font-medium"
                    :class="isDark ? 'text-gray-300' : 'text-gray-700'"
                  >
                    {{ formatAttributeName(key) }} ({{ value.toFixed(2) }}%)
                  </label>
                  <Slider
                    v-model="mainAttributes[key]"
                    :min="0"
                    :max="100"
                    :step="1"
                    @change="updateMainAttributes(key)"
                    :class="`custom-slider-${index}`"
                  />
                </div>
                <div class="mt-2 text-center" :class="[isDark ? 'text-gray-300' : 'text-gray-700']">
                  Total: {{ totalMainPercentage.toFixed(2) }}%
                  <span v-if="totalMainPercentage !== 100" class="text-red-500 ml-2">
                    (Adjust to reach 100%)
                  </span>
                </div>

                <!-- Support Area and Max Weight Ratio -->
                <div
                  v-for="(value, key, index) in secondaryAttributes"
                  :key="key"
                  class="space-y-2"
                >
                  <label
                    v-tooltip.bottom="attributeDescriptions[key]"
                    :for="key"
                    class="block text-sm font-medium"
                    :class="isDark ? 'text-gray-300' : 'text-gray-700'"
                  >
                    {{ formatAttributeName(key) }} ({{ value.toFixed(2) }})
                  </label>
                  <Slider
                    v-model="secondaryAttributes[key]"
                    :min="0"
                    :max="100"
                    :step="1"
                    :class="`custom-slider-${index + Object.keys(mainAttributes).length}`"
                  />
                </div>
              </div>
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
import Slider from 'primevue/slider'
import LoadingScreen from '@/components/loadingPercentage.vue'

const attributeDescriptions = {
  volumeUtilization:
    'Container volume usage. Higher: tighter packing, less space waste. Lower: more gaps, easier loading.',
  weightDistribution:
    'Weight spread across container. Higher: more balanced load, safer. Lower: allows concentrated weight areas.',
  requiredSupportArea:
    'Support needed for stacked boxes. Higher: more stable stacking. Lower: allows overhang, less stable.',
  maxWeightRatio:
    'Weight difference between stacked boxes. Higher: allows heavier on lighter. Lower: enforces similar weights when stacked.'
}

let scene, camera, renderer, controls

const isDark = useDark()
const toggleDark = useToggle(isDark)

const containerDimensions = reactive({
  width: '1000',
  height: '1000',
  length: '1500'
})

const boxConfigurations = reactive([
  { width: 400, length: 400, height: 200, count: 0 },
  { width: 250, length: 250, height: 250, count: 0 },
  { width: 400, length: 250, height: 250, count: 0 }
])
const packingResult = ref(null)
const threeContainer = ref(null)
const isLoading = ref(false)
const loadingProgress = ref(0)
const loadingStatusMessage = ref('')

const mainAttributes = reactive({
  volumeUtilization: 40,
  weightDistribution: 60
})

const secondaryAttributes = reactive({
  requiredSupportArea: 85,
  maxWeightRatio: 20
})

const totalMainPercentage = computed(() => {
  return Object.values(mainAttributes).reduce((sum, value) => sum + value, 0)
})

const fitnessAttributes = computed(() => ({
  ...mainAttributes,
  ...secondaryAttributes
}))

const parameters = reactive({
  populationSize: 150,
  generations: 300,
  mutationRate: 0.01
})

const updateMainAttributes = (changedKey) => {
  const total = totalMainPercentage.value
  if (total > 100) {
    const excess = total - 100
    const otherKey = Object.keys(mainAttributes).find((key) => key !== changedKey)
    mainAttributes[otherKey] = Math.max(0, mainAttributes[otherKey] - excess)
  } else if (total < 100) {
    const deficit = 100 - total
    const otherKey = Object.keys(mainAttributes).find((key) => key !== changedKey)
    mainAttributes[otherKey] = Math.min(100, mainAttributes[otherKey] + deficit)
  }
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

const handleSubmit = async () => {
  const containerSize = [
    Number(containerDimensions.width),
    Number(containerDimensions.height),
    Number(containerDimensions.length)
  ]

  if (containerSize.some(isNaN) || boxConfigurations.some((box) => isNaN(Number(box.count)))) {
    alert('Please enter valid numbers for all fields.')
    return
  }

  try {
    isLoading.value = true
    loadingProgress.value = 0
    loadingStatusMessage.value = 'Generating boxes...'

    let boxId = 1
    const boxes = boxConfigurations.flatMap((config) =>
      Array(config.count)
        .fill()
        .map(() => ({
          id: boxId++,
          Shipment_id: 0,
          Packed_time: null,
          Width: config.width,
          Length: config.length,
          Height: config.height,
          Weight: Math.random() * 40 + 60,
          Volume: config.width * config.length * config.height
        }))
    )
    // const boxes = await generateRandomBoxes(10)

    loadingProgress.value = 10
    loadingStatusMessage.value = 'Initializing genetic algorithm...'

    const startTime = performance.now()

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
      const fitnessAttributesPlain = {
        ...mainAttributes,
        ...secondaryAttributes
      }

      worker.postMessage({
        boxesData: boxes,
        containerDimensions: containerSize,
        populationSize: Number(parameters.populationSize),
        generations: Number(parameters.generations),
        mutationRate: Number(parameters.mutationRate),
        fitnessAttributes: fitnessAttributesPlain
      })
    })

    const endTime = performance.now()
    solutionTime.value = ((endTime - startTime) / 1000).toFixed(2)

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

const chartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']

const chartData = ref({
  labels: [],
  datasets: [{ data: [], backgroundColor: chartColors }]
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
  chartData.value.labels = Object.keys(fitnessAttributes.value).map(formatAttributeName)
  chartData.value.datasets[0].data = Object.values(fitnessAttributes.value)
}

const solutionTime = ref(0)

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
  style.textContent = `
    ${chartColors
      .map(
        (color, index) => `
      .custom-slider-${index} .p-slider-range {
        background: ${color} !important;
      }
    `
      )
      .join('\n')}
  `
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
watch(() => ({ ...mainAttributes, ...secondaryAttributes }), updateChartData, {
  deep: true,
  immediate: true
})
</script>

<style scoped>
.p-slider {
  height: 0.5rem !important;
}

.p-slider .p-slider-handle {
  height: 1.2rem !important;
  width: 1.2rem !important;
  top: 50% !important;
  margin-top: -0.6rem !important;
  background: #ffffff !important;
  border: 2px solid #3f83f8 !important;
}

.dark .p-slider .p-slider-handle {
  background: #4a5568 !important;
  border-color: #718096 !important;
}
</style>
