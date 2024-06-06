<script setup>
import { useDark } from '@vueuse/core'
import { ref, onMounted, nextTick } from 'vue'
import * as THREE from 'three'
import PackerSidebar from '@/components/PackerSidebar.vue'
import { supabase } from '../supabase'
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const isDark = useDark()
const activeIndex = ref(0)

let userName
async function getUsername() {
  const { data } = await supabase.auth.getSession()
  userName = data.session.user.identities[0].identity_data.name
  console.log(userName)
}
onMounted(() => {
  getUsername()
  nextTick(() => {
    initThreeJS('three-container-1', isDark.value)
    initThreeJS('three-container-2', isDark.value)
    initThreeJS('three-container-3', isDark.value)
  })
})
const dialogVisible = ref(false)

function initThreeJS(containerId, isDark) {
  const container = document.getElementById(containerId)
  if (!container) {
    console.error(`No container found for Three.js scene: ${containerId}`)
    return
  }
  console.log(`Container found: ${containerId}`, container)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 10

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setClearColor(isDark ? 0x000000 : 0xffffff)
  container.appendChild(renderer.domElement)
  console.log(`Renderer appended to container: ${containerId}`)

  const geometry = new THREE.BoxGeometry(5, 3, 3)
  const material = new THREE.MeshBasicMaterial({ color: 0x808080, transparent: true, opacity: 0.1 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)
  console.log(`Cube added to scene: ${containerId}`, cube)

  const edges = new THREE.EdgesGeometry(geometry)
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xa16207 })
  const line = new THREE.LineSegments(edges, lineMaterial)
  scene.add(line)
  console.log(`Edges added to scene: ${containerId}`, line)

  let isDragging = false
  let previousMousePosition = {
    x: 0,
    y: 0
  }

  container.addEventListener('mousedown', (event) => {
    isDragging = true
  })

  container.addEventListener('mousemove', (event) => {
    if (!isDragging) {
      return
    }

    const deltaMove = {
      x: event.offsetX - previousMousePosition.x,
      y: event.offsetY - previousMousePosition.y
    }

    const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(toRadians(deltaMove.y * 1), toRadians(deltaMove.x * 1), 0, 'XYZ')
    )

    cube.quaternion.multiplyQuaternions(deltaRotationQuaternion, cube.quaternion)
    line.quaternion.multiplyQuaternions(deltaRotationQuaternion, line.quaternion)

    previousMousePosition = {
      x: event.offsetX,
      y: event.offsetY
    }
  })

  window.addEventListener('mouseup', () => {
    isDragging = false
  })

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    // console.log(`Rendering scene: ${containerId}`)
  }
  animate()

  window.addEventListener('resize', () => {
    const width = container.clientWidth
    const height = container.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    console.log(`Window resized, updated renderer size: ${containerId}`)
  })

  function toRadians(angle) {
    return angle * (Math.PI / 180)
  }

  function createTextSprite(message) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    context.font = 'Bold 50px Arial'
    context.fillStyle = 'rgba(255,255,255,0.95)'
    context.fillText(message, 0, 50)

    const texture = new THREE.CanvasTexture(canvas)
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(5, 2.5, 1.0)
    return sprite
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
  toast.add({ severity: 'success', summary: 'Success', detail: 'QR code detected!', life: 3000 })
  dialogVisible.value = false
  console.log('QR code detected:', result)
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
</script>

<template>
  <div
    :class="[
      isDark ? 'dark bg-neutral-950 text-white' : 'bg-gray-100 text-black',
      ' h-full flex flex-col shadow-lg'
    ]"
  >
    <PackerSidebar />
    <div :class="[isDark ? 'dark text-neutral-400' : 'light text-neutral-900', ' h-[100vh]']">
      <Accordion v-model:activeIndex="activeIndex" class="custom-accordion w-full">
        <AccordionTab
          v-for="item in [1, 2, 3]"
          :key="item"
          :header="`Shipment #344${item}`"
          :class="isDark ? 'dark-mode-accordion-tab' : 'light-mode-accordion-tab'"
        >
          <div
            :id="`three-container-${item}`"
            :class="[
              'w-full mb-4',
              { 'h-[80vh]': activeIndex === item - 1, 'h-[300px]': activeIndex !== item - 1 }
            ]"
          ></div>
          <Button
            class="w-full bg-yellow-700 text-gray-100 rounded-xl p-2 flex items-center justify-center space-x-2"
            @click="dialogVisible = true"
          >
            <span>Scan Barcode</span>
            <i class="pi pi-barcode"></i>
          </Button>
        </AccordionTab>
      </Accordion>
    </div>
  </div>
  <Dialog
    :class="[isDark ? 'dark' : '', ' w-[90%]']"
    header="Scan Box"
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
      class="mb-6 rounded-lg"
    />
    <div class="flex flex-col items-center align-center">
      <Button
        icon="pi pi-arrow-left"
        iconPos="left"
        label="Back"
        class="font-semibold w-auto p-button-text text-yellow-700 p-2"
        @click="dialogVisible = false"
      />
    </div>
  </Dialog>
  <Toast />
</template>

<style>
/* General styles */
/* General styles for light mode */

.light .custom-accordion .p-accordion-header .p-accordion-header-link {
  background-color: white;
  color: black;
  border-bottom: 1px solid black; /* Only apply a border to the bottom */
}
.custom-accordion .p-accordion-header .p-accordion-header-link {
  background-color: #0a0a0a;
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
</style>
