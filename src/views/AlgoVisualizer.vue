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

      <div class="space-y-4">
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
            class="w-full py-2 px-4 rounded-md font-medium transition-colors duration-300"
            :class="
              isDark
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            "
          >
            Generate Packing Solution
          </button>
        </form>
        <div
          v-if="packingResult"
          class="p-4 rounded-lg shadow-md"
          :class="isDark ? 'bg-neutral-700' : 'bg-white'"
        >
          <h3 class="text-xl font-bold mb-2">Packing Result</h3>
          <p>Fitness: {{ packingResult.fitness.toFixed(4) }}</p>
          <p>Boxes Packed: {{ packingResult.boxes.length }}</p>
        </div>
        <div v-if="isloading">
          <Loading />
        </div>
      </div>
    </div>

    <div class="w-full h-[600px] mt-4 rounded-lg" ref="threeContainer"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { geneticAlgorithm } from '../../supabase/functions/packing/algorithm'
import { supabase } from '../supabase'
import Loading from '../views/Loading.vue'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const containerDimensions = reactive({
  width: '2000',
  height: '1500',
  length: '2500'
})
const boxCount = ref('')
const packingResult = ref(null)
const threeContainer = ref(null)
const isloading = ref(false)

let scene, camera, renderer, controls

const toggleDarkMode = () => {
  toggleDark()
  if (scene && renderer) {
    updateSceneColors()
  }
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
    const randomBoxes = await generateRandomBoxes(Number(boxCount.value), containerSize)
    const result = await geneticAlgorithm(randomBoxes, containerSize, 150, 300, 0.01)
    packingResult.value = result.data
    initThreeJS(containerSize, result.data.boxes)
    isloading.value = false
  } catch (error) {
    console.error('Error generating packing solution:', error)
    alert('Failed to generate packing solution. Please try again.')
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
  }

  scene = new THREE.Scene()
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
  console.log('Creating boxes:', boxesData)
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

const handleResize = () => {
  if (camera && renderer && threeContainer.value) {
    camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
  }
}

watch(isDark, updateSceneColors)
</script>
