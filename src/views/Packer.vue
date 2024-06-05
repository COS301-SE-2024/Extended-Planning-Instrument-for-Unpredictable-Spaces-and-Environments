<script setup>
import { useDark } from '@vueuse/core'
import { ref, onMounted, nextTick } from 'vue'
import * as THREE from 'three'
import PackerSidebar from '@/components/PackerSidebar.vue'
import { supabase } from '../supabase'

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
    initThreeJS('three-container-1') // Initialize Three.js scene for each container
    initThreeJS('three-container-2')
    initThreeJS('three-container-3')
  })
})

const chartData = ref({
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Algorithm 1',
      data: [1, 2, 1, 3, 3, 2, 1],
      borderColor: '#f5a142',
      backgroundColor: '#000000'
    },
    {
      label: 'Algorithm 2',
      data: [2, 3, 1, 2, 2, 1, 1],
      borderColor: '#4300a1',
      backgroundColor: '#000000'
    }
  ],
  options: {
    scales: {
      x: {
        grid: {
          color: 'red' // Change the color of the x-axis grid lines
        }
      },
      y: {
        grid: {
          color: 'blue' // Change the color of the y-axis grid lines
        }
      }
    }
  }
})

function initThreeJS(containerId) {
  const container = document.getElementById(containerId)
  if (!container) {
    console.error(`No container found for Three.js scene: ${containerId}`)
    return
  }
  console.log(`Container found: ${containerId}`, container) // Debugging line

  // Create scene
  const scene = new THREE.Scene()

  // Create camera
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 10 // Move the camera further back

  // Create renderer
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setClearColor(0x000000) // Set a clear color to confirm canvas rendering
  container.appendChild(renderer.domElement)
  console.log(`Renderer appended to container: ${containerId}`) // Debugging line

  // Create a cube
  const geometry = new THREE.BoxGeometry(5, 3, 3) // Cube dimensions
  const material = new THREE.MeshBasicMaterial({ color: 0x808080, transparent: true, opacity: 0.1 }) // Transparent cube material
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)
  console.log(`Cube added to scene: ${containerId}`, cube) // Debugging line

  // Create edges
  const edges = new THREE.EdgesGeometry(geometry)
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xa16207 })
  const line = new THREE.LineSegments(edges, lineMaterial)
  scene.add(line)
  console.log(`Edges added to scene: ${containerId}`, line) // Debugging line

  // Add labels to each side
  const labels = ['Top', 'Bottom', 'Left', 'Right', 'Front', 'Back']
  const positions = [
    { x: 0, y: 1.5, z: 0 }, // Top
    { x: 0, y: -1.5, z: 0 }, // Bottom
    { x: -2.5, y: 0, z: 0 }, // Left
    { x: 2.5, y: 0, z: 0 }, // Right
    { x: 0, y: 0, z: 1.5 }, // Front
    { x: 0, y: 0, z: -1.5 } // Back
  ]

  labels.forEach((label, index) => {
    const sprite = createTextSprite(label)
    sprite.position.set(positions[index].x, positions[index].y, positions[index].z)
    cube.add(sprite) // Attach label to the cube
  })

  // Drag state
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

  // Animation loop
  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    console.log(`Rendering scene: ${containerId}`) // Debugging line
  }
  animate()

  // Handle window resize
  window.addEventListener('resize', () => {
    const width = container.clientWidth
    const height = container.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    console.log(`Window resized, updated renderer size: ${containerId}`) // Debugging line
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
</script>

<template>
  <div
    :class="[
      isDark ? 'dark bg-neutral-950 text-white' : 'bg-gray-100 text-black',
      ' h-full flex flex-col shadow-lg'
    ]"
  >
    <PackerSidebar />
    <!-- Main Content -->
    <div :class="[isDark ? 'dark text-neutral-400' : 'light text-neutral-900']">
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
            @click="onRemoveThing(slotProps.data)"
          >
            <span>Scan Barcode</span>
            <i class="pi pi-barcode"></i>
          </Button>
        </AccordionTab>
      </Accordion>
    </div>
  </div>
</template>
<style>
/* General styles */
/* General styles for light mode */
.light-calendar {
  background-color: white;
  color: black;
}

.light-calendar .p-datepicker {
  background-color: white;
  border: 1px solid #ccc;
  color: black;
}

.light-calendar .p-datepicker-header {
  background-color: #f7f7f7;
  color: black;
}

.dark-calendar .p-datepicker {
  background-color: #0a0a0a;
  border: 1px solid #444;
}

.dark-calendar .p-datepicker-header {
  background-color: #171717;
  color: white;
}
.dark .p-knob-text {
  stroke: white;
  color: white;
  fill: white;
}
.light .p-knob-text {
  stroke: #171717;
  color: #171717;
  fill: #171717;
}

/* Additional custom styles */
.dark-calendar .p-datepicker .p-datepicker-prev,
.dark-calendar .p-datepicker .p-datepicker-next {
  color: white;
}

.light-calendar .p-datepicker .p-datepicker-prev,
.light-calendar .p-datepicker .p-datepicker-next {
  color: black;
}

.light .custom-accordion .p-accordion-header .p-accordion-header-link {
  background-color: #f3f4f6;
  color: black;
  border: none;
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
