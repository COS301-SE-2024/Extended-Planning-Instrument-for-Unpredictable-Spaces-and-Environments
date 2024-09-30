<script setup>
import { useDark } from '@vueuse/core'
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import * as THREE from 'three'
import PackerSidebar from '@/components/PackerSidebar.vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import { useToast } from 'primevue/usetoast'
import DialogComponent from '@/components/DialogComponent.vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { geneticAlgorithm } from '../../supabase/functions/packing/algorithm'
import { useToggleDialog, isLoading } from '../components/packerDialog'
import Loading from '../views/Loading.vue'
import { supabase } from '../supabase.js'

const packingData = ref([])
const truckpackingData = ref([])
let CONTAINER_SIZE = [1200, 1930, 1000]
const dialogVisible = ref(false)
const activeShipment = ref(null)
const iscurrentShipmentPacked = ref(false)

const toast = useToast()
const isDark = useDark()

const numberShipments = ref(null)
const truckSize = [2350, 2390, 5898]
const isNewSceneVisible = ref(false)
const cratePacked = ref(false)
const remainingShipmentToPack = ref(0)

const shipments = ref([])

const cameraRef = ref(null)
const controlsRef = ref(null)

const { showStartPackingOvererlay, toggleDialog } = useToggleDialog()

const { loadingShipments, startLoading, stopLoading } = isLoading()

const showHelpDialog = ref(false)

const isScannedBoxesCollapsed = ref(false)

const isKeyVisible = ref(true)

const currentView = ref('front')

function toggleKeyVisibility() {
  isKeyVisible.value = !isKeyVisible.value
}

const toggleDialogHelp = () => {
  showHelpDialog.value = !showHelpDialog.value
}

const toggleScannedBoxes = () => {
  isScannedBoxesCollapsed.value = !isScannedBoxesCollapsed.value
}

function startNewDelivery() {
  packingData.value = []
  shipments.value = []
  activeShipment.value = null

  isNewSceneVisible.value = false
  cratePacked.value = false
  toggleDialog()
}

const updateShipmentStatus = async (shipmentID, status) => {
  try {
    const { error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'updateShipmentStatus',
        shipmentId: shipmentID,
        newStatus: status
      }),
      method: 'POST'
    })
    if (error) {
      console.error(`API Error for updating Status for shipment ${shipmentID}:`, error)
    }
  } catch (error) {
    console.error(`API Error for updating Status for shipment ${shipmentID}:`, error)
  }
}

const updateDeliveryStatus = async (deliveryID, status) => {
  try {
    const { error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'updateDeliveryStatus',
        deliveryId: deliveryID,
        newStatus: status
      }),
      method: 'POST'
    })
    if (error) {
      console.error(`API Error for updating Status for delivery ${deliveryID}:`, error)
    }
  } catch (error) {
    console.error(`API Error for updating Status for delivery ${deliveryID}:`, error)
  }
}

const updateShipmentEndTime = async (shipmentID) => {
  const currentDateTime = new Date()
  const formattedTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ')
  try {
    const { error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'updateShipmentEndTime',
        shipmentId: shipmentID,
        newEndTime: formattedTime
      }),
      method: 'POST'
    })
    if (error) {
      console.error(`API Error for updating Start Time for shipment ${shipmentID}:`, error)
    }
  } catch (error) {
    console.error(`API Error for updating Status for shipment ${shipmentID}:`, error)
  }
}

function saveProgress() {
  localStorage.removeItem('packingProgress')
  const progressData = {
    packingData: packingData.value,
    activeShipment: activeShipment.value,
    remainingShipmentToPack: remainingShipmentToPack.value,
    shipments: shipments.value,
    iscurrentShipmentPacked: iscurrentShipmentPacked.value,
    truckpackingData: truckpackingData.value,
    cratePacked: cratePacked.value
  }
  localStorage.setItem('packingProgress', JSON.stringify(progressData))
}

function loadProgress() {
  const savedProgress = localStorage.getItem('packingProgress')
  if (savedProgress) {
    const progressData = JSON.parse(savedProgress)
    packingData.value = progressData.packingData
    activeShipment.value = progressData.activeShipment
    remainingShipmentToPack.value = progressData.remainingShipmentToPack
    shipments.value = progressData.shipments
    iscurrentShipmentPacked.value = progressData.iscurrentShipmentPacked
    numberShipments.value = shipments.value.length
    truckpackingData.value = progressData.truckpackingData
    cratePacked.value = progressData.cratePacked

    if (cratePacked.value) {
      getShipmentByID()
    } else {
      toggleShipment(activeShipment.value)
    }

    return true
  }
  return false
}

function closeDelivery() {
  localStorage.removeItem('packingProgress')
  localStorage.removeItem('printingStorage')
  updateDeliveryStatus(shipments.value[0].Delivery_id, 'Shipped')

  cleanupThreeJS()

  packingData.value = []
  activeShipment.value = null
  remainingShipmentToPack.value = 0
  shipments.value = []
  iscurrentShipmentPacked.value = false
  numberShipments.value = null
  isNewSceneVisible.value = false
  cratePacked.value = false
  truckpackingData.value = []

  showStartPackingOvererlay.value = true
  dialogVisible.value = false
  isScannedBoxesCollapsed.value = false

  toast.add({
    severity: 'success',
    summary: 'Delivery Closed',
    detail: 'All progress has been reset. You can start a new delivery.',
    life: 3000
  })
}

onMounted(() => {
  if (loadProgress()) {
    showStartPackingOvererlay.value = false

    nextTick(() => {
      if (activeShipment.value) {
        const activePackingData = packingData.value.find(
          (data) => data.shipmentId === activeShipment.value
        )
        if (activePackingData) {
          initThreeJS(`three-container-${activeShipment.value}`, isDark.value, activePackingData)
        }
      }
    })
  }
  watch(isDark, (newValue) => {
    if (scene && renderer) {
      renderer.setClearColor(newValue ? '#171717' : 0xffffff)

      scene.traverse((object) => {
        if (object.type === 'LineSegments') {
          object.material.color.set(newValue ? 0xffffff : 0x000000) // Set wireframe color based on theme
          object.material.needsUpdate = true // Mark the material for update
        }
      })
    }
  })

  watch(
    [packingData, shipments],
    ([newPackingData, newShipments]) => {
      if (newPackingData.length > 0 && newShipments.length > 0 && activeShipment.value) {
        CONTAINER_SIZE = [1200, 1930, 1000]
        nextTick(() => {
          const activePackingData = newPackingData.find(
            (data) => data.shipmentId === activeShipment.value
          )
          if (activePackingData && activePackingData.length > 0) {
            initThreeJS(`three-container-${activeShipment.value}`, isDark.value, activePackingData)
          } else {
            console.error(`No valid packing data found for active shipment ${activeShipment.value}`)
          }
        })
      }
    },
    { immediate: true, deep: true }
  )
})

async function getShipmentByID() {
  if (shipments.value && Array.isArray(shipments.value)) {
    isNewSceneVisible.value = true

    await CreateJSONBoxes(shipments.value, CONTAINER_SIZE)
    cratePacked.value = true
    nextTick(() => {
      cleanupThreeJS()
      initThreeJS('new-three-container', isDark.value, truckpackingData.value[0])
    })
    saveProgress()
  } else {
    console.warn('No shipments available to process.')
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
  truckpackingData.value[0] = await geneticAlgorithm(shipmentJson, truckSize, 150, 350, 0.01).data
}

function getColorForWeight(weight, minWeight, maxWeight) {
  if (minWeight === maxWeight) {
    return '#facc15'
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
  if (cratePacked.value) {
    camera.position.set(truckSize[0], truckSize[1], truckSize[2])
  } else {
    camera.position.set(CONTAINER_SIZE[0], CONTAINER_SIZE[1], CONTAINER_SIZE[2])
  }
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setClearColor(isDark ? '#171717' : 0xffffff)
  container.appendChild(renderer.domElement)

  cameraRef.value = camera

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.25
  controls.screenSpacePanning = false
  controls.maxPolarAngle = Math.PI / 2

  controlsRef.value = controls

  if (cratePacked.value) {
    createContainer(scene, truckSize, isDark)
    createBoxesFromData(scene, packingDataType.boxes, true)
  } else {
    createContainer(scene, CONTAINER_SIZE, isDark)
    createBoxesFromData(scene, packingDataType, false)
  }

  addScale(scene, CONTAINER_SIZE)

  animate()

  window.addEventListener('resize', () => {
    const width = container.clientWidth
    const height = container.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  })
}

let animationFrameId

function animate() {
  animationFrameId = requestAnimationFrame(animate)
  if (controls) {
    controls.update()
  }
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function cleanupThreeJS() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  // Dispose of scene objects
  if (scene) {
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
  }

  if (renderer) {
    renderer.dispose()
    const container = renderer.domElement.parentElement
    if (container) {
      container.removeChild(renderer.domElement)
    }
  }

  if (controls) {
    controls.dispose()
  }

  scene = null
  camera = null
  renderer = null
  controls = null
}

function createContainer(scene, CONTAINER_SIZE, isDark) {
  const geometry = new THREE.BoxGeometry(CONTAINER_SIZE[0], CONTAINER_SIZE[1], CONTAINER_SIZE[2])
  const material = new THREE.MeshBasicMaterial({
    color: '#64748b',
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(CONTAINER_SIZE[0] / 2, CONTAINER_SIZE[1] / 2, CONTAINER_SIZE[2] / 2)
  scene.add(mesh)

  // Add wireframe
  const edgesGeometry = new THREE.EdgesGeometry(geometry)
  const edgesMaterial = new THREE.LineBasicMaterial({ color: isDark ? 0xffffff : 0x000000 })
  const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial)
  mesh.add(wireframe)
}

function createBoxesFromData(scene, boxesData, truckPacked) {
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

    let color
    if (box.scanned) {
      color = '#16a34a'
    } else if (box.unplaced) {
      return '#3b82f6'
    } else {
      color = getColorForWeight(box.weight, minWeight, maxWeight)
    }

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.7
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(box.x + box.width / 2, box.y + box.height / 2, box.z + box.length / 2)

    // Set the name of the mesh to identify it later
    if (truckPacked) {
      mesh.name = `shipment-${box.id}`
    } else {
      mesh.name = `box-${box.id}`
    }

    scene.add(mesh)

    // Add wireframe
    const edgesGeometry = new THREE.EdgesGeometry(geometry)
    const edgesMaterial = new THREE.LineBasicMaterial({ color: isDark ? 0xffffff : 0x000000 })
    const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial)
    wireframe.material.color.set(isDark.value ? 0xffffff : 0x000000)
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
  console.info('Camera is ready')
}

const onError = (error) => {
  console.error('QR code scanning error:', error)
}
const scannedShipments = computed(() => {
  return shipments.value.reduce((acc, shipment) => {
    const shipmentIndex = shipments.value.findIndex((s) => s.id === shipment.id)
    const shipmentData = packingData.value[shipmentIndex]

    if (shipmentData && Array.isArray(shipmentData)) {
      acc[shipment.id] = shipmentData.every((box) => box.scanned)
    } else {
      acc[shipment.id] = false
    }

    return acc
  }, {})
})
function checkAllBoxesScanned(shipmentIndex) {
  const currentSoln = packingData.value[shipmentIndex]

  if (currentSoln && Array.isArray(currentSoln) && currentSoln.every((box) => box.scanned)) {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'All boxes for this shipment have been scanned!',
      life: 3000
    })
    iscurrentShipmentPacked.value = true
  } else {
    iscurrentShipmentPacked.value = false
    console.warn('Not all boxes have been scanned yet or invalid data structure.')
  }
}
const checkIfBoxIdInRange = (scannedBoxId, activePackingData) => {
  const boxIds = activePackingData.map((box) => box.id)
  const minBoxId = Math.min(...boxIds)
  const maxBoxId = Math.max(...boxIds)

  return scannedBoxId >= minBoxId && scannedBoxId <= maxBoxId
}
const onDetect = (result) => {
  setTimeout(() => {
    dialogVisible.value = false
  }, 750)

  try {
    const parsedData = JSON.parse(result[0].rawValue)

    if (!activeShipment.value) {
      console.error('No active shipment selected')
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No active shipment selected',
        life: 3000
      })
      return
    }

    const shipmentIndex = shipments.value.findIndex(
      (shipment) => shipment.id === activeShipment.value
    )
    if (shipmentIndex !== -1) {
      const activePackingData = packingData.value[shipmentIndex]
      if (Array.isArray(activePackingData)) {
        const isValidBox = checkIfBoxIdInRange(parsedData.id, activePackingData)

        if (!isValidBox) {
          toast.add({
            severity: 'warn',
            summary: 'Wrong Box detected',
            detail: `The Box ${parsedData.id} is not part of the valid range for shipment ${activeShipment.value}`,
            life: 3000
          })
          return
        }

        activePackingData.forEach((box) => {
          const matchingBox = scene.getObjectByName(`box-${box.id}`)

          if (box.scanned) {
            if (box.id === parsedData.id) {
              toast.add({
                severity: 'info',
                summary: 'Already Scanned',
                detail: 'This box has already been scanned.',
                life: 3000
              })
              return
            } else {
              matchingBox.material.color.set('#16a34a')
              matchingBox.material.opacity = 1.0

              const wireframe = matchingBox.children.find(
                (child) => child instanceof THREE.LineSegments
              )
              if (wireframe) {
                wireframe.material.color.set(isDark.value ? 0xffffff : 0x000000)
              }
            }
          } else {
            if (box.id === parsedData.id) {
              matchingBox.material.color.set('#c084fc')
              matchingBox.material.opacity = 1.0
              box.scanned = true

              const wireframe = matchingBox.children.find(
                (child) => child instanceof THREE.LineSegments
              )
              if (wireframe) {
                wireframe.material.color.set('#27272a')
              }

              toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'QR code scanned and Box detected!',
                life: 3000
              })

              checkAllBoxesScanned(shipmentIndex)
            } else {
              // not the box so make it opace
              matchingBox.material.color.set('#f0f9ff')
              matchingBox.material.opacity = 0.1

              const wireframe = matchingBox.children.find(
                (child) => child instanceof THREE.LineSegments
              )
              if (wireframe) {
                wireframe.material.color.set('#f0f9ff')
              }
            }
          }
        })
      } else {
        console.error('Invalid activePackingData structure:', activePackingData)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid packing data structure',
          life: 3000
        })
      }
    }

    if (renderer) {
      renderer.render(scene, camera)
    }
    saveProgress()
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

  const updatedData = newPackingData.map((box) => ({
    ...box,
    scanned: false
  }))

  packingData.value[counter++] = updatedData

  saveProgress()
}

const handleShipmentsLoaded = (loadedShipments) => {
  const sortedShipments = loadedShipments.sort((a, b) => a.id - b.id)
  shipments.value = sortedShipments
  numberShipments.value = shipments.value.length
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

const scannedBoxes = computed(() => {
  if (isNewSceneVisible.value) {
    return shipments.value.map((shipment) => ({
      id: shipment.id,
      type: 'shipment'
    }))
  } else if (activeShipment.value) {
    const shipmentIndex = shipments.value.findIndex(
      (shipment) => shipment.id === activeShipment.value
    )
    if (shipmentIndex === -1) return []

    if (!packingData.value[shipmentIndex]) return []

    return packingData.value[shipmentIndex]
      .filter((box) => box.scanned)
      .map((box) => ({
        id: box.id,
        type: 'box'
      }))
  }
  return []
})

function highlightItem(id, type) {
  if (type === 'box') {
    highlightBox(id)
  } else if (type === 'shipment') {
    highlightShipment(id)
  }
}

function highlightShipment(shipmentId) {
  if (!scene || !isNewSceneVisible.value) return

  const shipmentObject = scene.getObjectByName(`shipment-${shipmentId}`)

  if (shipmentObject) {
    if (!shipmentObject.userData.originalColor) {
      shipmentObject.userData.originalColor = shipmentObject.material.color.getHex()
    }

    shipmentObject.material.color.set('#ef4444')
    shipmentObject.material.opacity = 1.0

    // Ensure wireframe color is correct
    shipmentObject.children.forEach((child) => {
      if (child instanceof THREE.LineSegments) {
        child.material.color.set(isDark.value ? 0xffffff : 0x000000)
      }
    })

    setTimeout(() => {
      shipmentObject.material.color.setHex(shipmentObject.userData.originalColor)
      shipmentObject.material.opacity = 0.7
      renderer.render(scene, camera)
    }, 4000)

    renderer.render(scene, camera)
  } else {
    console.warn(`Shipment with ID ${shipmentId} not found in the scene.`)
  }
}

function highlightBox(boxId) {
  const box = scene.getObjectByName(`box-${boxId}`)
  if (box) {
    if (!box.userData.originalColor) {
      box.userData.originalColor = box.material.color.getHex()
    }

    box.material.color.set('#ef4444')
    box.material.opacity = 1.0

    // Ensure wireframe color is correct
    box.children.forEach((child) => {
      if (child instanceof THREE.LineSegments) {
        child.material.color.set(isDark.value ? 0xffffff : 0x000000)
      }
    })

    setTimeout(() => {
      box.material.color.setHex(box.userData.originalColor)
      renderer.render(scene, camera)
    }, 4000)

    renderer.render(scene, camera)
  }
}

function resetShipment() {
  if (numberShipments.value === remainingShipmentToPack.value) {
    iscurrentShipmentPacked.value = true
  } else {
    iscurrentShipmentPacked.value = false
    remainingShipmentToPack.value += 1
  }

  updateShipmentStatus(activeShipment.value, 'Shipped')
  updateShipmentEndTime(activeShipment.value)
  saveProgress()
}

async function generateNewSolution(shipmentID) {
  startLoading()
  try {
    const { error } = await supabase.functions.invoke('packing', {
      body: JSON.stringify({
        type: 'deleteSavedSoln',
        shipmentId: shipmentID
      }),
      method: 'POST'
    })

    if (error) {
      console.error(`API Error for deleting saved solution for shipment ${shipmentID}:`, error)
    }

    const { data, error2 } = await supabase.functions.invoke('packing', {
      body: JSON.stringify({
        type: 'getPackages',
        ShipmentID: shipmentID
      }),
      method: 'POST'
    })
    if (error2) {
      console.error('Error fetching packages for shipment: ', error)
      return
    }

    if (!data || !data.data) {
      console.error('Invalid data structure received:', data)
      return
    }

    const result = data

    const response = geneticAlgorithm(result.data, CONTAINER_SIZE, 150, 300, 0.01).data

    const { error: errorSaving } = await supabase.functions.invoke('packing', {
      body: JSON.stringify({
        type: 'uploadSolution',
        shipmentId: shipmentID,
        jsonObject: response
      }),
      method: 'POST'
    })
    if (errorSaving) {
      console.error('Failed to store solution')
    } else {
      if (response == null) {
        console.error('Failed to upload solution', response)
      } else {
        const { error: updateError } = await supabase.functions.invoke('packing', {
          body: JSON.stringify({
            type: 'updateFitnessValue',
            ShipmentId: shipmentID,
            newFitnessValue: parseFloat(response.fitness)
          }),
          method: 'POST'
        })

        if (updateError) {
          console.error('ERROR UPDATING FITNESS VALUE: ', updateError)
        } else {
          const json = response.boxes
          const newPackingData = json._isRef ? json.value : json
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
          const shipmentIndex = shipments.value.findIndex((shipment) => shipment.id === shipmentID)

          const updatedData = newPackingData.map((box) => ({
            ...box,
            scanned: false
          }))

          packingData.value[shipmentIndex] = updatedData

          saveProgress()
          toggleShipment(shipmentID)
        }
      }
    }
  } catch (error) {
    console.error('Error in generateNewSolution:', error)
  } finally {
    stopLoading()
  }
}

function changeView(view) {
  currentView.value = view

  let SIZE = CONTAINER_SIZE
  if (remainingShipmentToPack.value === numberShipments.value) {
    if (!cameraRef.value || !controlsRef.value) return

    switch (view) {
      case 'front':
        cameraRef.value.position.set(SIZE[0] / 3, SIZE[1] / 3, SIZE[2] * 8)
        break
      case 'left':
        cameraRef.value.position.set(-3 * SIZE[0], SIZE[1] / 3, SIZE[2] / 3)
        break
      case 'back':
        cameraRef.value.position.set(SIZE[0] / 3, SIZE[1] / 3, -3 * SIZE[2])
        break
      case 'right':
        cameraRef.value.position.set(SIZE[0] * 4, SIZE[1] / 4, SIZE[2] / 4)
        break
    }

    controlsRef.value.target.set(SIZE[0] / 2, SIZE[1] / 2, SIZE[2] / 2)
    controlsRef.value.update()
  } else {
    if (!cameraRef.value || !controlsRef.value) return

    switch (view) {
      case 'front':
        cameraRef.value.position.set(SIZE[0] / 3, SIZE[1] / 3, SIZE[2] * 3)
        break
      case 'left':
        cameraRef.value.position.set(-2 * SIZE[0], SIZE[1] / 3, SIZE[2] / 3)
        break
      case 'back':
        cameraRef.value.position.set(SIZE[0] / 3, SIZE[1] / 3, -2 * SIZE[2])
        break
      case 'right':
        cameraRef.value.position.set(SIZE[0] * 3, SIZE[1] / 3, SIZE[2] / 3)
        break
    }

    controlsRef.value.target.set(SIZE[0] / 3, SIZE[1] / 3, SIZE[2] / 3)
    controlsRef.value.update()
  }
}
</script>

<template>
  <div
    :class="[
      isDark ? 'dark bg-neutral-800 text-white' : 'bg-gray-100 text-black',
      'h-full flex flex-col shadow-lg'
    ]"
  >
    <PackerSidebar @handle-json="handleJsonData" @shipments-loaded="handleShipmentsLoaded" />
    <div
      class="loading-new"
      v-if="loadingShipments"
      :class="[isDark ? 'dark bg-neutral-900 text-white' : 'light bg-gray-200 text-black']"
    >
      <Loading />
    </div>

    <div
      v-if="showStartPackingOvererlay"
      :class="[
        isDark ? 'dark text-neutral-400' : 'light text-neutral-800',
        'h-[100vh] flex flex-col items-center justify-center'
      ]"
    >
      <div class="w-full max-w-2xl px-4 mb-8">
        <img
          :src="
            isDark
              ? getAssetURL('Photos/Logos/Wording-Thin-Dark.svg')
              : getAssetURL('Photos/Logos/Wording-Thin-Light.svg')
          "
          :alt="isDark ? 'Dark Logo' : 'Light Logo'"
          class="w-full h-auto max-h-48 object-contain"
        />
      </div>
      <h2 class="text-4xl text-center mb-4 p-4">Please Click To Start Packing A New Delivery</h2>
      <Button
        @click="startNewDelivery"
        class="bg-orange-500 mb-4 text-white px-4 py-2 rounded-xl hover:bg-orange-600"
      >
        Start New Delivery
      </Button>
      <p
        @click="toggleDialogHelp"
        class="flex items-center justify-center mt-4 text-orange-500 font-bold text-center hover:-translate-y-1 underline cursor-pointer transition duration-300"
      >
        Help
      </p>
    </div>
    <div v-else :class="[isDark ? 'dark text-neutral-400' : 'light text-neutral-800', 'h-[100vh]']">
      <div v-if="!loadingShipments" class="flex flex-wrap justify-center gap-4 p-4">
        <Button
          v-for="shipment in shipments"
          :key="shipment.id"
          :class="[
            scannedShipments[shipment.id] ? 'bg-green-700' : 'bg-orange-500',
            'text-gray-200 rounded-xl p-2',
            { 'opacity-50': activeShipment === shipment.id }
          ]"
          @click="toggleShipment(shipment.id)"
        >
          Show Shipment #{{ shipment.id }}
        </Button>
      </div>
      <div v-if="activeShipment && !loadingShipments" class="mt-4 flex flex-row justify-center">
        <Button
          @click="generateNewSolution(activeShipment)"
          :class="[
            isDark ? ' text-neutral-200' : ' text-neutral-200',
            'mb-4 w-1/8 bg-blue-500 p-2 rounded-xl'
          ]"
        >
          Generate New Solution
        </Button>
      </div>
      <div
        v-if="activeShipment && !loadingShipments"
        :class="[
          isDark ? ' text-neutral-200' : ' text-neutral-200',
          'flex justify-center space-x-4 p-4'
        ]"
      >
        <button
          v-for="view in ['front', 'left', 'right', 'back']"
          :key="view"
          @click="changeView(view)"
          :class="[
            'hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-xl',
            currentView === view ? 'opacity-45 bg-orange-500	' : 'bg-orange-500'
          ]"
        >
          {{ view.charAt(0).toUpperCase() + view.slice(1) }}
        </button>
      </div>
      <div v-if="activeShipment && !loadingShipments" class="flex">
        <div
          :class="[
            isDark ? 'bg-zinc-800 text-neutral-200' : 'bg-gray-100 text-neutral-800',
            isScannedBoxesCollapsed ? 'w-16' : 'w-1/4',
            'transition-all duration-300 p-4 overflow-y-auto max-h-[80vh] shadow-inner'
          ]"
          :style="{ minWidth: isScannedBoxesCollapsed ? '4rem' : '25%' }"
        >
          <div class="flex flex-wrap flex-col justify-between items-center">
            <div
              v-if="
                activeShipment &&
                numberShipments &&
                !isScannedBoxesCollapsed &&
                remainingShipmentToPack !== numberShipments
              "
              class="mt-4"
            >
              <h3
                class="text-center sm:text-xl text-sm mb-4 font-bold"
                :class="[isDark ? ' text-neutral-200' : ' text-neutral-800']"
              >
                {{ remainingShipmentToPack }} / {{ numberShipments }} Shipments to Pack
              </h3>
            </div>
            <button
              @click="toggleScannedBoxes"
              class="rounded-xl bg-orange-500 text-white p-2 w-full mb-4"
              :class="isScannedBoxesCollapsed ? 'rotate-180' : ''"
            >
              <i class="pi pi-chevron-left"></i>
            </button>
            <h3 class="sm:text-lg text-sm font-bold mb-2" v-if="!isScannedBoxesCollapsed">
              Scanned Boxes : Shipment {{ activeShipment }}
            </h3>
          </div>
          <ul v-if="!isScannedBoxesCollapsed">
            <li
              v-for="item in scannedBoxes"
              :key="item.id"
              @click="highlightItem(item.id, item.type)"
              class="border border-gray-400 cursor-pointer hover:bg-gray-200 hover:text-black rounded-xl p-2 mb-4"
            >
              {{ item.type === 'shipment' ? 'Shipment' : 'Box' }} {{ item.id }}
            </li>
          </ul>
          <Button
            v-if="!isScannedBoxesCollapsed"
            class="w-full bg-violet-500 rounded-xl text-white mt-2 flex items-center justify-center p-2 sm:p-3"
            @click="dialogVisible = true"
          >
            <span class="hidden sm:inline sm:text-lg sm:mr-2">Scan Barcode</span>
            <i class="pi pi-barcode"></i>
          </Button>
          <div v-if="iscurrentShipmentPacked && !isScannedBoxesCollapsed">
            <Button
              @click="resetShipment"
              class="w-full p-2 mt-4 rounded-xl justify-center bg-green-700 text-white"
              >Confirm Pallet</Button
            >
          </div>
          <div
            v-if="
              !cratePacked &&
              numberShipments &&
              !isScannedBoxesCollapsed &&
              remainingShipmentToPack === numberShipments
            "
            class="flex justify-center mt-4"
          >
            <Button
              class="w-full bg-orange-500 text-gray-200 rounded-xl p-2 flex items-center justify-center"
              @click="getShipmentByID"
            >
              Confirm Shipment
              <i class="pi pi-check indent-2"></i>
            </Button>
          </div>
          <div v-if="!isScannedBoxesCollapsed && cratePacked" class="flex justify-center mt-4">
            <Button
              class="w-full bg-red-600 text-gray-200 rounded-xl p-2 flex items-center justify-center space-x-2"
              @click="closeDelivery"
            >
              Close Delivery
              <i class="pi pi-times indent-2"></i>
            </Button>
          </div>
        </div>
        <div :class="['flex-grow h-[80vh] mb-4 relative']">
          <div
            v-if="isNewSceneVisible"
            :class="[
              isDark ? 'dark bg-neutral-950 text-white' : 'bg-gray-200 text-black',
              'h-full flex flex-col relative'
            ]"
          >
            <div id="new-three-container" class="w-full h-full"></div>
          </div>
          <div
            v-else
            :id="`three-container-${activeShipment}`"
            class="w-full h-full flex justify-center align-center"
          >
            <div
              v-if="isKeyVisible"
              :class="[
                isDark ? 'bg-zinc-800 text-neutral-400' : 'bg-white text-neutral-800',
                'absolute top-2 right-12 p-2 shadow-lg rounded z-20'
              ]"
            >
              <div class="flex items-center mb-1">
                <span class="w-4 h-4 inline-block mr-2" style="background-color: #16a34a"></span>
                <span>Placed and/or Scanned</span>
              </div>
              <div class="flex items-center mb-1">
                <span class="w-4 h-4 inline-block mr-2" style="background-color: #c084fc"></span>
                <span>Last Scanned</span>
              </div>
              <div class="flex items-center mb-1">
                <span
                  class="w-4 h-4 inline-block mr-2"
                  style="background-color: #facc15; opacity: 1"
                ></span>
                <span>Unscanned</span>
              </div>
              <div class="flex items-center mb-1">
                <span
                  class="w-4 h-4 inline-block mr-2"
                  style="background-color: #ef4444; opacity: 1"
                ></span>
                <span>Highlighted</span>
              </div>
              <div class="flex items-center mb-1">
                <span
                  class="w-4 h-4 inline-block mr-2"
                  style="background-color: #3b82f6; opacity: 1"
                ></span>
                <span>Unplaced</span>
              </div>
            </div>
            <button
              @click="toggleKeyVisibility"
              :class="[
                isDark ? 'bg-neutral-700 text-white' : 'bg-gray-200 text-black',
                'absolute top-2 right-2 p-2 rounded-full shadow-lg z-30'
              ]"
            >
              <i :class="isKeyVisible ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div>
    <DialogComponent
      v-if="showHelpDialog"
      :images="images"
      title="Help Menu"
      :contacts="[
        { name: 'Call', phone: '+27 12 345 6789', underline: true },
        { name: 'Email', phone: 'janeeb.solutions@gmail.com', underline: true }
      ]"
      :dialogVisible="showHelpDialog"
      @close-dialog="toggleDialogHelp"
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
    <div class="rounded-xl flex flex-col items-center align-center">
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
import { getAssetURL } from '@/assetHelper'
export default {
  components: {
    DialogComponent
  }
}

const images = computed(() => [
  { src: getAssetURL('Photos/Help/Packer/1.png'), alt: 'Alternative Image 1' },
  { src: getAssetURL('Photos/Help/Packer/8.png'), alt: 'Alternative Image 4' },
  { src: getAssetURL('Photos/Help/Packer/7.png'), alt: 'Alternative Image 3' },
  { src: getAssetURL('Photos/Help/Packer/5.png'), alt: 'Alternative Image 4' },
  { src: getAssetURL('Photos/Help/Packer/6.png'), alt: 'Alternative Image 6' },
  { src: getAssetURL('Photos/Help/Packer/4.png'), alt: 'Alternative Image 4' },
  { src: getAssetURL('Photos/Help/Packer/2.png'), alt: 'Alternative Image 2' },
  { src: getAssetURL('Photos/Help/Packer/3.png'), alt: 'Alternative Image 3' }
])
</script>
<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>

<style>
/* General styles */
/* General styles for light mode */
.qrcode-stream video {
  transform: scaleX(-1);
}

.logo {
  width: 500px; /* Adjust size as needed */
  margin-bottom: 20px; /* Space between logo and spinner */
}

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
  z-index: 99999;
}

.disabled-link {
  pointer-events: none;
  opacity: 1;
}

/* Common styles for both light and dark themes */
.packer-sidebar .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content {
  border-bottom: 2px solid transparent;
  padding-bottom: 2px;
  transition:
    border-bottom 0.3s ease,
    color 0.3s ease;
}

.packer-sidebar .p-menubar .p-menubar-root-list > .p-menuitem:hover > .p-menuitem-content {
  background-color: transparent !important;
  cursor: pointer;
  padding-bottom: 2px;
}

/* Light theme styles */
.packer-sidebar .p-menubar .p-menubar-root-list > .p-menuitem:hover > .p-menuitem-content {
  color: black !important;
  border-bottom: 2px solid black !important;
  background-color: white !important;
}

/* Dark theme styles */
.packer-sidebar.dark .p-menubar .p-menubar-root-list > .p-menuitem:hover > .p-menuitem-content {
  color: white !important;
  border-bottom: 2px solid white !important;
  background-color: #0a0a0a !important;
}

/* Focus styles */
.packer-sidebar
  .p-menubar
  .p-menuitem:not(.p-highlight):not(.p-disabled).p-focus
  > .p-menuitem-content {
  background-color: white !important;
}

.packer-sidebar.dark
  .p-menubar
  .p-menuitem:not(.p-highlight):not(.p-disabled).p-focus
  > .p-menuitem-content {
  background-color: #0a0a0a !important;
}
</style>
