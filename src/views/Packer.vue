<script setup>
import { useDark } from '@vueuse/core'
import { ref, onMounted, nextTick, watch } from 'vue'
import * as THREE from 'three'
import PackerSidebar from '@/components/PackerSidebar.vue'
import { supabase } from '../supabase'
import { QrcodeStream } from 'vue-qrcode-reader'
import { useToast } from 'primevue/usetoast'
import DialogComponent from '@/components/DialogComponent.vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { geneticAlgorithm } from '../../supabase/functions/packing/algorithm'

const packingData = ref([]) // Changed to an array
const truckpackingData = ref([])
let CONTAINER_SIZE = [1200, 1930, 1000]
const dialogVisible = ref(false)
const activeShipment = ref(null)
const loading = ref(false)

const toast = useToast()
const isDark = useDark()

const numberShipments = ref(null)
const truckSize = [2350, 2390, 5898]
const isNewSceneVisible = ref(false)
const cratePacked = ref(false)

const shipments = ref([])

let userName
async function getUsername() {
  const { data } = await supabase.auth.getSession()
  userName = data.session.user.identities[0].identity_data.name
}

onMounted(() => {
  watch(
    [packingData, shipments],
    ([newPackingData, newShipments]) => {
      if (newPackingData.length > 0 && newShipments.length > 0 && activeShipment.value) {
        CONTAINER_SIZE = [1000, 1930, 1200]
        nextTick(() => {
          const activePackingData = newPackingData.find(
            (data) => data.shipmentId === activeShipment.value
          )
          console.log('This is active packing data', activePackingData)
          if (activePackingData) {
            initThreeJS(`three-container-${activeShipment.value}`, isDark.value, activePackingData)
          } else {
            console.error(`No valid packing data found for active shipment ${activeShipment.value}`)
            toast.add({
              severity: 'error',
              summary: 'Error',
              detail: `Unable to display packing for shipment ${activeShipment.value}`,
              life: 3000
            })
          }
        })
      }
    },
    { immediate: true, deep: true }
  )
})

async function getShipmentByID() {
  if (shipments.value && Array.isArray(shipments.value)) {
    numberShipments.value = shipments.value.length

    console.log('Number of shipments: ', numberShipments.value)

    isNewSceneVisible.value = true

    await CreateJSONBoxes(shipments.value, CONTAINER_SIZE)
    cratePacked.value = true
    console.log('result of packing pallets', truckpackingData)
    nextTick(() => {
      initThreeJS('new-three-container', isDark.value, truckpackingData.value[0])
    })
  } else {
    console.log('No shipments available to process.')
  }
}
async function CreateJSONBoxes(data, CONTAINER_SIZE) {
  const width = CONTAINER_SIZE[0]
  const height = CONTAINER_SIZE[1]
  const length = CONTAINER_SIZE[2]
  const volume = width * height * length

  // Generate the JSON object
  const shipmentJson = data.map((shipment) => ({
    id: shipment.id,
    Width: width,
    Height: height,
    Length: length,
    Volume: volume,
    Weight: 10000
  }))
  console.log('sending in boxes', shipmentJson)
  console.log('container Dimensions', truckSize)
  truckpackingData.value[0] = await geneticAlgorithm(shipmentJson, truckSize, 150, 300, 0.01).data
}

function getColorForWeight(weight, minWeight, maxWeight) {
  if (minWeight === maxWeight) {
    return 'rgb(128, 0, 128)' // Purple color when all boxes have the same weight
  }

  const normalizedWeight = (weight - minWeight) / (maxWeight - minWeight)
  const red = 255
  const green = Math.floor((1 - normalizedWeight) * 255)

  return `rgb(${red}, ${green}, 0)`
}

let scene, camera, renderer, controls

function initThreeJS(containerId, isDark, packingDataType) {
  const container = document.getElementById(containerId)
  if (!container) {
    console.error(`No container found for Three.js scene: ${containerId}`)
    return
  }

  // Cleanup the previous scene if it exists
  if (scene) {
    cleanupThreeJS()
  }

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    10000
  )
  camera.position.set(CONTAINER_SIZE[0], CONTAINER_SIZE[1], CONTAINER_SIZE[2])

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setClearColor(isDark ? 0x000000 : 0xffffff)
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.25
  controls.screenSpacePanning = false
  controls.maxPolarAngle = Math.PI / 2

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x404040)
  scene.add(ambientLight)

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  if (cratePacked.value) {
    createContainer(scene, truckSize)
    console.log('sending in trucpackingData')
    createBoxesFromData(scene, packingDataType.boxes)
  } else {
    createContainer(scene, CONTAINER_SIZE)
    createBoxesFromData(scene, packingDataType)
  }

  addScale(scene, CONTAINER_SIZE)

  function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  window.addEventListener('resize', () => {
    const width = container.clientWidth
    const height = container.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  })
}

function cleanupThreeJS() {
  // Dispose of scene objects
  scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose()
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose())
      } else {
        object.material.dispose()
      }
    }
  })

  renderer.dispose()

  const container = renderer.domElement.parentElement
  if (container) {
    container.removeChild(renderer.domElement)
  }

  scene = null
  camera = null
  renderer = null
  controls = null
}
function createContainer(scene, CONTAINER_SIZE) {
  console.log('Creating container', CONTAINER_SIZE)

  const geometry = new THREE.BoxGeometry(CONTAINER_SIZE[0], CONTAINER_SIZE[1], CONTAINER_SIZE[2])
  const material = new THREE.MeshPhongMaterial({
    color: 0xcccccc,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(CONTAINER_SIZE[0] / 2, CONTAINER_SIZE[1] / 2, CONTAINER_SIZE[2] / 2)
  scene.add(mesh)

  // Add wireframe
  const edgesGeometry = new THREE.EdgesGeometry(geometry)
  const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 })
  const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial)
  mesh.add(wireframe)
}

function createBoxesFromData(scene, boxesData) {
  console.log('createBoxesFromData', boxesData)

  // Check if boxesData is a Vue ref and extract the actual value
  if (boxesData && boxesData.__v_isRef) {
    boxesData = boxesData._value
  }

  // Further check if boxesData is an array and contains valid data
  if (!boxesData || !Array.isArray(boxesData) || boxesData.length === 0) {
    console.error('Invalid boxes data:', boxesData)
    return
  }

  const weights = boxesData.map((box) => box.weight)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)

  boxesData.forEach((box) => {
    const geometry = new THREE.BoxGeometry(box.width, box.height, box.length)
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(getColorForWeight(box.weight, minWeight, maxWeight)),
      transparent: true,
      opacity: 0.7
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(box.x + box.width / 2, box.y + box.height / 2, box.z + box.length / 2)

    // Set the name of the mesh to identify it later
    mesh.name = `box-${box.id}`

    scene.add(mesh)

    // Add wireframe
    const edgesGeometry = new THREE.EdgesGeometry(geometry)
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 })
    const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial)
    mesh.add(wireframe)
  })
}

function addScale(scene, CONTAINER_SIZE) {
  const axesHelper = new THREE.AxesHelper(CONTAINER_SIZE[0])
  scene.add(axesHelper)

  // Add labels for each axis
  const labels = ['X', 'Y', 'Z']
  const positions = [
    [CONTAINER_SIZE[0], 0, 0],
    [0, CONTAINER_SIZE[1], 0],
    [0, 0, CONTAINER_SIZE[2]]
  ]

  labels.forEach((label, index) => {
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    const textMesh = new THREE.Mesh(new THREE.BufferGeometry(), textMaterial)
    textMesh.position.set(...positions[index])
    scene.add(textMesh)
  })

  // Add scale markers
  for (let i = 0; i <= CONTAINER_SIZE[0]; i += 100) {
    const markerGeometry = new THREE.BoxGeometry(5, 5, 5)
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.position.set(i, 0, 0)
    scene.add(marker)

    // Add text label for the marker
    const labelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    const label = new THREE.Mesh(new THREE.BufferGeometry(), labelMaterial)
    label.position.set(i, -50, 0)
    scene.add(label)
  }
}

const userMediaSupported = ref(true)

const onInit = (promise) => {
  promise.catch(() => {
    userMediaSupported.value = false
  })
}

const onCameraReady = () => {
  console.log('Camera is ready')
}

const onError = (error) => {
  console.error('QR code scanning error:', error)
}

const onDetect = (result) => {
  setTimeout(() => {
    dialogVisible.value = false
  }, 750)
  toast.add({ severity: 'success', summary: 'Success', detail: 'QR code detected!', life: 3000 })
  console.log('QR code detected:', result)

  try {
    // Parse the rawValue field which contains the actual JSON data
    console.log(result[0])
    console.log(result[0].rawValue.id)

    const parsedData = JSON.parse(result[0].rawValue)

    // Now parsedData contains the JSON object, and you can access the id

    // Assume packingData.value contains the current boxes in the scene
    if (packingData.value && Array.isArray(packingData.value.boxes)) {
      packingData.value.boxes.forEach((box) => {
        // Find the box in the Three.js scene with the matching ID
        const matchingBox = scene.getObjectByName(`box-${box.id}`)
        console.log(box.id === parsedData.id)
        if (matchingBox) {
          if (box.id === parsedData.id) {
            // Set the color to purple for the matching box
            matchingBox.material.color.set('rgb(128, 0, 128)')
            matchingBox.material.opacity = 1.0 // Fully opaque
          } else {
            // Set the color to white and lower opacity for other boxes
            matchingBox.material.color.set(0xffffff) // White color
            matchingBox.material.opacity = 0.1 // Lower opacity
          }
        }
      })
    }
  } catch (error) {
    console.error('Failed to parse QR code:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Invalid QR code format', life: 3000 })
  }
}

function paintOutline(detectedCodes, ctx) {
  for (const detectedCode of detectedCodes) {
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints

    ctx.strokeStyle = 'orange'
    ctx.lineWidth = 5

    ctx.beginPath()
    ctx.moveTo(firstPoint.x, firstPoint.y)
    for (const { x, y } of otherPoints) {
      ctx.lineTo(x, y)
    }
    ctx.lineTo(firstPoint.x, firstPoint.y)
    ctx.closePath()
    ctx.stroke()
  }
}

function paintBoundingBox(detectedCodes, ctx) {
  for (const detectedCode of detectedCodes) {
    const {
      boundingBox: { x, y, width, height }
    } = detectedCode

    ctx.lineWidth = 2
    ctx.strokeStyle = '#007bff'
    ctx.strokeRect(x, y, width, height)
  }
}
function paintCenterText(detectedCodes, ctx) {
  for (const detectedCode of detectedCodes) {
    const { boundingBox, rawValue } = detectedCode

    const centerX = boundingBox.x + boundingBox.width / 2
    const centerY = boundingBox.y + boundingBox.height / 2

    const fontSize = Math.max(12, (50 * boundingBox.width) / ctx.canvas.width)

    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.textAlign = 'center'

    ctx.lineWidth = 3
    ctx.strokeStyle = '#35495e'
    ctx.strokeText(detectedCode.rawValue, centerX, centerY)

    ctx.fillStyle = '#5cb984'
    ctx.fillText(rawValue, centerX, centerY)
  }
}
const trackFunctionOptions = [
  { text: 'nothing (default)', value: undefined },
  { text: 'outline', value: paintOutline },
  { text: 'centered text', value: paintCenterText },
  { text: 'bounding box', value: paintBoundingBox }
]
const trackFunctionSelected = ref(trackFunctionOptions[1])

let counter = 0
const handleJsonData = (json) => {
  const newPackingData = json._isRef ? json.value : json
  // console.log('Received packing data:', newPackingData)

  if (!newPackingData) {
    console.error('Invalid packing data received:', newPackingData)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Invalid packing data received',
      life: 3000
    })
    return
  }
  packingData.value[counter++] = newPackingData
  loading.value = false
}

const handleShipmentsLoaded = (loadedShipments) => {
  loading.value = true
  shipments.value = loadedShipments
  // console.log('Shipments loaded:', shipments.value)
}

function toggleShipment(shipmentId) {
  if (activeShipment.value === shipmentId) {
    activeShipment.value = null
  } else {
    cratePacked.value = false
    activeShipment.value = shipmentId
    nextTick(() => {
      // Find the index in the packingData array based on the shipment ID
      const shipmentIndex = shipments.value.findIndex((shipment) => shipment.id === shipmentId)
      if (shipmentIndex !== -1) {
        const activePackingData = packingData.value[shipmentIndex]
        if (activePackingData) {
          initThreeJS(`three-container-${shipmentId}`, isDark.value, activePackingData)
        } else {
          console.error(`No valid packing data found for shipment ${shipmentId}`)
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `Unable to display packing for shipment ${shipmentId}`,
            life: 3000
          })
        }
      } else {
        console.error(`Shipment with ID ${shipmentId} not found`)
      }
    })
  }
}
</script>

<template>
  <div
    :class="[
      isDark ? 'dark bg-neutral-800 text-white' : 'bg-gray-200 text-black',
      ' h-full flex flex-col shadow-lg'
    ]"
  >
    <PackerSidebar @handle-json="handleJsonData" @shipments-loaded="handleShipmentsLoaded" />
    <!-- <div
      class="loading-new"
      v-if="loading"
      :class="[isDark ? 'dark bg-neutral-900 text-white' : 'light bg-gray-200 text-black']"
    >
      <ProgressSpinner
        style="width: 150px; height: 150px"
        strokeWidth="4"
        animationDuration=".5s"
        aria-label="Custom ProgressSpinner"
      />
    </div> -->
    <div :class="[isDark ? 'dark text-neutral-400' : 'light text-neutral-800', 'h-[100vh]']">
      <div v-if="!loading" class="flex flex-wrap justify-center gap-4 p-4">
        <Button
          v-for="shipment in shipments"
          :key="shipment.id"
          :class="[
            'bg-orange-500 text-gray-200 rounded-xl p-2',
            { 'opacity-50': activeShipment === shipment.id }
          ]"
          @click="toggleShipment(shipment.id)"
        >
          Show Shipment #{{ shipment.id }}
        </Button>
      </div>

      <div v-if="activeShipment" class="mt-4">
        <div :id="`three-container-${activeShipment}`" class="w-full h-[80vh] mb-4"></div>
        <Button
          class="w-full bg-orange-500 text-gray-200 rounded-xl p-2 flex items-center justify-center space-x-2"
          @click="dialogVisible = true"
        >
          <span>Scan Barcode</span>
          <i class="pi pi-barcode"></i>
        </Button>
      </div>

      <div class="flex justify-center mt-4">
        <Button
          class="w-[98%] bg-orange-500 text-gray-200 rounded-xl p-2 flex items-center justify-center space-x-2"
          @click="getShipmentByID"
        >
          Confirm Shipment
        </Button>
      </div>
      <div
        v-if="isNewSceneVisible"
        :class="[
          isDark ? 'dark bg-neutral-950 text-white' : 'bg-gray-200 text-black',
          ' h-full flex flex-col shadow-lg'
        ]"
      >
        <div
          :id="'new-three-container'"
          :class="[
            'w-full mb-4',
            { 'h-[80vh]': isNewSceneVisible, 'h-[300px]': !isNewSceneVisible }
          ]"
        ></div>
      </div>

      <p
        @click="toggleDialog"
        class="flex items-center justify-center mt-4 text-orange-500 font-bold text-center hover:-translate-y-1 underline cursor-pointer transition duration-300"
      >
        Help
      </p>
    </div>
  </div>
  <div>
    <DialogComponent
      v-if="showDialog"
      :images="[
        { src: '/Members/Photos/main dashboard (packer).png', alt: 'Alternative Image 1' },
        { src: '/Members/Photos/packer-nav.png', alt: 'Alternative Image 2' },
        { src: '/Members/Photos/adding a box _ pallett.png', alt: 'Alternative Image 3' }
      ]"
      title="Help Menu"
      :contacts="[
        { name: 'Call', phone: '+27 12 345 6789', underline: true },
        { name: 'Email', phone: 'janeeb.solutions@gmail.com', underline: true }
      ]"
      :dialogVisible="showDialog"
      @close-dialog="toggleDialog"
    />
  </div>
  <Dialog
    :class="[isDark ? 'dark' : '', ' w-[90%] py-4']"
    v-model:visible="dialogVisible"
    :modal="true"
    :closable="false"
  >
    <qrcode-stream
      :track="trackFunctionSelected.value"
      @init="onInit"
      @error="onError"
      @detect="onDetect"
      @camera-on="onCameraReady"
      class="mb-6 mt-6 rounded-lg"
    />
    <div class="flex flex-col items-center align-center">
      <Button
        icon="pi pi-arrow-left"
        iconPos="left"
        label="Back"
        class="font-semibold w-auto p-button-text text-orange-500 p-2"
        @click="dialogVisible = false"
      />
    </div>
  </Dialog>

  <Toast />
</template>
<script>
export default {
  components: {
    DialogComponent
  }
}
const showDialog = ref(false)
const toggleDialog = () => {
  showDialog.value = !showDialog.value
}
</script>
<style>
/* General styles */
/* General styles for light mode */

.light .custom-accordion .p-accordion-header .p-accordion-header-link {
  background-color: white;
  color: black;
  border-bottom: 1px solid black;
}
.custom-accordion .p-accordion-header .p-accordion-header-link {
  background-color: #171717;
  color: rgb(255, 255, 255);
  border-bottom: 1px solid rgb(255, 255, 255); /* Only apply a border to the bottom */
}
.custom-accordion .p-accordion-header:hover {
  background-color: #f0f0f0;
  color: black;
}

.dark .custom-accordion .p-accordion-header:hover {
  background-color: #3e3e3e;
  color: white;
}

.custom-accordion .p-accordion-content {
  background-color: inherit;
  color: inherit;
}

.custom-timeline {
  background-color: inherit;
  color: inherit;
}

.custom-timeline .p-timeline-event {
  border-left: 2px solid #ccc;
}

.dark .custom-timeline .p-timeline-event {
  border-left: 2px solid #555;
}

.custom-timeline .p-timeline-event-opposite {
  color: inherit;
}

.custom-timeline .p-timeline-event-content {
  color: inherit;
}

.custom-timeline .p-timeline-event-marker {
  background-color: inherit;
  border: 2px solid #ccc;
}

.dark .custom-timeline .p-timeline-event-marker {
  border: 2px solid #555;
}

.dark .p-accordion .p-accordion-header .p-accordion-header-link {
  background: #0a0a0a !important;
}
.light .p-accordion .p-accordion-header .p-accordion-header-link {
  background: white !important;
}

/* General styles for AccordionTab */
.light-mode-accordion-tab {
  background-color: white;
  color: black;
}

.dark-mode-accordion-tab {
  background-color: #262626;
  color: white;
}

.light-mode-accordion-tab .p-accordion-tab {
  background-color: white;
  color: black;
  border: 1px solid #ccc;
}

.dark-mode-accordion-tab .p-accordion-tab {
  background-color: #262626;
  color: white;
  border: 1px solid #555;
}

.light-mode-accordion-tab .p-accordion-tab-header {
  background-color: white;
  color: black;
}

.dark-mode-accordion-tab .p-accordion-tab-header {
  background-color: #262626;
  color: white;
}

.light-mode-accordion-tab .p-accordion-tab-header:hover {
  background-color: #f0f0f0;
  color: black;
}

.dark-mode-accordion-tab .p-accordion-tab-header:hover {
  background-color: #3e3e3e;
  color: white;
}

.light-mode-accordion-tab .p-accordion-tab-content {
  background-color: white;
  color: black;
}

.dark-mode-accordion-tab .p-accordion-tab-content {
  background-color: #262626;
  color: white;
}
.light .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content {
  background-color: white;
  color: black;
}

.dark .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content {
  background-color: #171717;
  color: white;
}
/* General styles for Timeline */
.light-mode-timeline {
  background-color: white;
  color: black;
}

.dark-mode-timeline {
  background-color: #0a0a0a;
  color: white;
}

.light-mode-timeline .p-timeline-event {
  border-left: 2px solid #ccc;
}

.dark-mode-timeline .p-timeline-event {
  border-left: 2px solid #555;
}

.light-mode-timeline .p-timeline-event-opposite {
  color: black;
}

.dark-mode-timeline .p-timeline-event-opposite {
  color: white;
}

.light-mode-timeline .p-timeline-event-content {
  color: black;
}

.dark-mode-timeline .p-timeline-event-content {
  color: white;
}

.light-mode-timeline .p-timeline-event-marker {
  background-color: white;
  border: 2px solid #ccc;
}

.dark-mode-timeline .p-timeline-event-marker {
  background-color: #262626;
  border: 2px solid #555;
}
.p-dialog-mask {
  background: rgba(0, 0, 0, 0.5) !important; /* Dimmed background */
  z-index: 9998 !important; /* Ensure it is above other elements */
}

.loading-new {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
  overflow: hidden;
  z-index: 9999999999999999999999999;
}
</style>
