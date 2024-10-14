<template>
  <div
    :class="[
      isDark ? 'dark bg-neutral-800 text-white' : 'bg-gray-100 text-black',
      'min-h-screen flex flex-col shadow-lg'
    ]"
  >
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Custom Container Packer</h1>
        <button
          @click="toggleDarkMode"
          class="px-4 py-2 rounded-md bg-orange-500 text-white transition-colors duration-300"
        >
          {{ isDark ? 'Light Mode' : 'Dark Mode' }}
        </button>
      </div>

      <div class="flex flex-row space-x-4">
        <div class="w-1/2 space-y-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 p-4 rounded-lg shadow-md"
            :class="isDark ? 'bg-neutral-700' : 'bg-white'"
          >
            <h2 class="text-2xl font-bold mb-4">Container Configuration</h2>
            <div class="grid grid-cols-3 gap-4">
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
                      ? 'bg-neutral-600 text-white'
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
                    ? 'bg-neutral-600 text-white'
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

          <div class="p-4 rounded-lg shadow-md" :class="isDark ? 'bg-neutral-700' : 'bg-white'">
            <h3 class="text-xl font-bold mb-4">Algorithm Parameters Visualization</h3>
            <Chart type="polarArea" :data="chartData" :options="chartOptions" class="w-full" />
          </div>
        </div>

        <div class="w-1-2">
          <div
            class="p-4 rounded-lg shadow-md mb-4"
            :class="isDark ? 'bg-neutral-700' : 'bg-white'"
          >
            <h3 class="text-xl font-bold mb-4">Genetic Algorithm Parameters</h3>
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
                      ? 'bg-neutral-600 text-white'
                      : 'bg-gray-100 text-black border border-gray-300'
                  "
                />
              </div>
            </div>
          </div>

          <div class="p-4 rounded-lg shadow-md" :class="isDark ? 'bg-neutral-700' : 'bg-white'">
            <h3 class="text-xl font-bold mb-4">Algorithm Parameters</h3>
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
      </div>

      <div
        v-if="packingResult"
        class="mt-4 p-4 rounded-lg shadow-md"
        :class="isDark ? 'bg-neutral-700' : 'bg-white'"
      >
        <h3 class="text-xl font-bold mb-2">Packing Result</h3>
        <p>Fitness: {{ packingResult.fitness.toFixed(4) }}</p>
        <p>Boxes Packed: {{ packingResult.boxes.length }}</p>
      </div>
      <div v-if="isloading" class="mt-4 rounded-lg">
        <Loading />
      </div>
    </div>

    <div class="w-full h-[600px] mt-4 rounded-lg" ref="threeContainer"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { geneticAlgorithm } from '../../supabase/functions/packing/algorithm'
import { supabase } from '../supabase'
import Loading from '../views/Loading.vue'
import Slider from 'primevue/slider'

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
const isloading = ref(false)

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

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'left',
      labels: {
        color: 'black',
        font: {
          size: 12
        }
      }
    },
    scales: {
      r: {
        ticks: {
          color: 'black',
          font: {
            size: 10
          }
        }
      }
    }
  }
}

chartOptions.plugins.legend.labels.align = 'start'
chartOptions.plugins.legend.labels.padding = 20
chartOptions.plugins.legend.labels.usePointStyle = true

const toggleDarkMode = () => {
  toggleDark()
  if (scene && renderer) {
    updateSceneColors()
  }
}

const updateChartData = () => {
  chartData.value.labels = Object.keys(fitnessAttributes).map(formatAttributeName)
  chartData.value.datasets[0].data = Object.values(fitnessAttributes)
}

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
    isloading.value = true
    console.log(parameters.populationSize, parameters.generations, parameters.mutationRate)
    const randomBoxes = await generateRandomBoxes(Number(boxCount.value), containerSize)
    const result = await geneticAlgorithm(
      randomBoxes,
      containerSize,
      parameters.populationSize,
      parameters.generations,
      parameters.mutationRate,
      fitnessAttributes
    )
    if (result.data) {
      packingResult.value = result.data
      initThreeJS(containerSize, result.data.boxes)
    } else {
      alert('No valid packing solution found. Try adjusting the parameters.')
    }
    isloading.value = false
  } catch (error) {
    console.error('Error generating packing solution:', error)
    alert('Failed to generate packing solution. Please try again.')
    isloading.value = false
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
