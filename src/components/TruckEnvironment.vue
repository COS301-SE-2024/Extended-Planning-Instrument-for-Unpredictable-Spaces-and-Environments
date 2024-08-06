<template>
  <div>
    <div id="instructions">Click to start</div>
    <canvas id="canvas"></canvas>
    <button id="showInstructionsButton" @click="toggleInstructions">Show Instructions</button>
    <button id="prevButton" @click="changeLayer(-1)">Previous Layer</button>
    <button id="nextButton" @click="changeLayer(1)">Next Layer</button>
    <div id="layerInfo"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { io } from 'socket.io-client'

export default {
  props: {
    packingData: {
      type: String,
      default: '{}'
    }
  },
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      truck: null,
      socket: null,
      scale: 0.1,
      generations: [],
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      moveUp: false,
      moveDown: false,
      prevTime: performance.now(),
      velocity: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      lastBox: null,
      layerBoxes: [],
      currentSection: 0,
      isShowingInstructions: false
    }
  },
  mounted() {
    this.parsePackingData()
    this.init()
  },
  methods: {
    parsePackingData() {
      try {
        const data = JSON.parse(this.packingData)
        this.layerBoxes = data.best_container.layers
        this.generations = data.generations
      } catch (error) {
        console.error('Error parsing packing data:', error)
      }
    },
    init() {
      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      this.camera.position.set(0, 5, 60)
      this.camera.lookAt(10, 0, 0)

      this.scene.background = new THREE.Color(0x808080)

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
      this.scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
      directionalLight.position.set(50, 50, 50)
      directionalLight.castShadow = true
      this.scene.add(directionalLight)

      this.renderer = new THREE.WebGLRenderer()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      document.body.appendChild(this.renderer.domElement)

      this.controls = new PointerLockControls(this.camera, document.body)

      const instructions = document.getElementById('instructions')
      instructions.addEventListener('click', () => {
        this.controls.lock()
      })

      this.controls.addEventListener('lock', () => {
        instructions.style.display = 'none'
      })

      this.controls.addEventListener('unlock', () => {
        instructions.style.display = ''
      })

      this.scene.add(this.controls.getObject())

      window.addEventListener('resize', this.onWindowResize)
      window.addEventListener('keydown', this.onKeyDown)
      window.addEventListener('keyup', this.onKeyUp)

      this.createAxesHelper()
      this.socket = io()
      this.socket.emit('get_data')
      this.socket.on('update_data', this.updateData)
      this.animate()

      const showInstructionsButton = document.getElementById('showInstructionsButton')
      const prevButton = document.getElementById('prevButton')
      const nextButton = document.getElementById('nextButton')
      const layerInfo = document.getElementById('layerInfo')

      showInstructionsButton.style.position = 'absolute'
      showInstructionsButton.style.right = '10px'
      showInstructionsButton.style.bottom = '10px'

      prevButton.style.position = 'absolute'
      prevButton.style.left = '10px'
      prevButton.style.top = '10px'

      nextButton.style.position = 'absolute'
      nextButton.style.right = '10px'
      nextButton.style.top = '10px'

      layerInfo.style.position = 'absolute'
      layerInfo.style.left = '50%'
      layerInfo.style.top = '10px'
      layerInfo.style.transform = 'translateX(-50%)'

      prevButton.style.display = 'none'
      nextButton.style.display = 'none'
      layerInfo.style.display = 'none'

      const gridHelper = new THREE.GridHelper(200, 50)
      this.scene.add(gridHelper)

      const loader = new GLTFLoader()
      loader.load(
        '/truck/truckpackingView1.glb',
        (gltf) => {
          this.truck = gltf.scene
          this.scene.add(this.truck)

          this.truck.traverse((child) => {
            if (child.isMesh) {
              const basicMaterial = new THREE.MeshBasicMaterial({
                color: child.material.color || new THREE.Color(0xff0000)
              })
              child.material = basicMaterial
              child.material.needsUpdate = true
            }
          })

          this.truck.scale.set(20, 20, 20)
          this.truck.position.set(2, 0, 0)
          this.displayFullSolution()
        },
        undefined,
        (error) => {
          console.error('An error occurred while loading the truck model:', error)
        }
      )
    },
    toggleInstructions() {
      this.isShowingInstructions = !this.isShowingInstructions
      const showInstructionsButton = document.getElementById('showInstructionsButton')

      if (this.isShowingInstructions) {
        showInstructionsButton.textContent = 'Show Full Solution'
        document.getElementById('prevButton').style.display = 'block'
        document.getElementById('nextButton').style.display = 'block'
        document.getElementById('layerInfo').style.display = 'block'
        this.currentSection = 0
        this.displayLayer(this.currentSection)
        this.updateLayerInfo()
      } else {
        showInstructionsButton.textContent = 'Show Instructions'
        document.getElementById('prevButton').style.display = 'none'
        document.getElementById('nextButton').style.display = 'none'
        document.getElementById('layerInfo').style.display = 'none'
        this.displayFullSolution()
      }
    },
    changeLayer(delta) {
      this.currentSection += delta
      if (this.currentSection < 0) this.currentSection = 0
      if (this.currentSection >= this.layerBoxes.length)
        this.currentSection = this.layerBoxes.length - 1
      this.displayLayer(this.currentSection)
      this.updateLayerInfo()
    },
    updateLayerInfo() {
      const layerInfo = document.getElementById('layerInfo')
      layerInfo.textContent = `Section ${this.currentSection + 1} of ${this.layerBoxes.length}`
    },
    displayLayer(sectionIndex) {
      this.scene.children = this.scene.children.filter(
        (child) => child === this.controls.getObject() || child === this.truck
      )

      const containerGeometry = new THREE.BoxGeometry(
        this.layerBoxes[0][0].container.width * this.scale,
        this.layerBoxes[0][0].container.height * this.scale,
        this.layerBoxes[0][0].container.length * this.scale
      )
      const containerMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true
      })
      const containerMesh = new THREE.Mesh(containerGeometry, containerMaterial)
      containerMesh.position.set(
        (this.layerBoxes[0][0].container.width * this.scale) / 2,
        (this.layerBoxes[0][0].container.height * this.scale) / 2,
        (this.layerBoxes[0][0].container.length * this.scale) / 2
      )
      this.scene.add(containerMesh)

      this.layerBoxes.forEach((section, index) => {
        section.forEach((box) => {
          this.addBoxToScene(
            box,
            box.container,
            0,
            box.minWeight,
            box.maxWeight,
            index === sectionIndex
          )
        })
      })
    },
    displayFullSolution() {
      if (this.truck) {
        this.scene.children = this.scene.children.filter(
          (child) =>
            child === this.controls.getObject() ||
            child === this.truck ||
            child.name === 'axesHelper'
        )
        if (this.layerBoxes && this.layerBoxes.length > 0) {
          const containerWidth = 1200
          const containerHeight = 1380
          const containerLength = 2800

          const containerGeometry = new THREE.BoxGeometry(
            containerWidth * this.scale,
            containerHeight * this.scale,
            containerLength * this.scale
          )
          const containerMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true
          })
          const containerMesh = new THREE.Mesh(containerGeometry, containerMaterial)
          containerMesh.position.set(
            (containerWidth * this.scale) / 2,
            (containerHeight * this.scale) / 2,
            (containerLength * this.scale) / 2
          )
          this.scene.add(containerMesh)

          this.layerBoxes.flat().forEach((box) => {
            this.addBoxToScene(box, box.container, 0, box.minWeight, box.maxWeight, true)
          })
        }
        document.getElementById('prevButton').style.display = 'none'
        document.getElementById('nextButton').style.display = 'none'
        document.getElementById('layerInfo').style.display = 'none'
      } else {
        console.error('Truck model is not loaded yet')
      }
    },
    getColorForWeight(weight, minWeight, maxWeight) {
      const normalizedWeight = (weight - minWeight) / (maxWeight - minWeight)
      const red = 255
      const green = Math.floor((1 - normalizedWeight) * 255)
      return `rgb(${red},${green},0)`
    },
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    onKeyDown(event) {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = true
          break
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = true
          break
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = true
          break
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = true
          break
        case 'Space':
          this.moveDown = true
          break
        case 'KeyC':
          this.moveUp = true
          break
      }
    },
    onKeyUp(event) {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = false
          break
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = false
          break
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = false
          break
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = false
          break
        case 'Space':
          this.moveDown = false
          break
        case 'KeyC':
          this.moveUp = false
          break
      }
    },
    updateData(data) {
      this.generations = data.generations
      if (this.generations.length > 0) {
        const lastGeneration = this.generations[this.generations.length - 1]
        const container = lastGeneration.containers[0]
        this.layerBoxes = container.layers

        const allBoxes = this.layerBoxes.flat()
        const weights = allBoxes.map((box) => box.weight)
        const minWeight = Math.min(...weights)
        const maxWeight = Math.max(...weights)

        this.layerBoxes = this.layerBoxes.map((layer) =>
          layer.map((box) => ({ ...box, container, minWeight, maxWeight }))
        )

        if (this.isShowingInstructions) {
          this.displayLayer(this.currentSection)
          this.updateLayerInfo()
        } else {
          this.displayFullSolution()
        }
      } else if (data.containers && data.containers.length > 0) {
        this.displayEmptyContainers(data.containers)
      } else {
        console.error('No container data available.')
      }
    },
    createTextSprite(message, parameters = {}) {
      const fontface = parameters.fontface || 'Arial'
      const fontsize = parameters.fontsize || 70
      const borderThickness = parameters.borderThickness || 4
      const borderColor = parameters.borderColor || { r: 0, g: 0, b: 0, a: 1.0 }
      const backgroundColor = parameters.backgroundColor || { r: 255, g: 255, b: 255, a: 1.0 }

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      context.font = `${fontsize}px ${fontface}`

      context.fillStyle = `rgba(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`
      context.strokeStyle = `rgba(${borderColor.r},${borderColor.g},${borderColor.b},${borderColor.a})`

      context.lineWidth = borderThickness
      context.fillStyle = 'rgba(255, 255, 255, 1.0)'
      context.strokeStyle = 'rgba(0, 0, 0, 1.0)'

      context.fillRect(
        borderThickness,
        borderThickness,
        context.measureText(message).width + borderThickness * 2,
        fontsize * 1.4 + borderThickness * 2
      )

      context.fillStyle = 'rgba(0, 0, 0, 1.0)'
      context.fillText(message, borderThickness, fontsize + borderThickness)

      const texture = new THREE.Texture(canvas)
      texture.needsUpdate = true

      const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.scale.set(10, 5, 1.0)
      return sprite
    },
    createAxesHelper() {
      const axesHelper = new THREE.AxesHelper(10)
      axesHelper.name = 'axesHelper'
      this.scene.add(axesHelper)
      this.addAxisLabels()
    },
    addAxisLabels() {
      if (
        this.scene.getObjectByName('xLabel') ||
        this.scene.getObjectByName('yLabel') ||
        this.scene.getObjectByName('zLabel')
      ) {
        return
      }

      const xLabel = this.createTextSprite('X', {
        fontsize: 24,
        backgroundColor: { r: 255, g: 0, b: 0, a: 1 }
      })
      xLabel.position.set(10, 0, 0)
      xLabel.name = 'xLabel'
      this.scene.add(xLabel)

      const yLabel = this.createTextSprite('Y', {
        fontsize: 24,
        backgroundColor: { r: 0, g: 255, b: 0, a: 1 }
      })
      yLabel.position.set(0, 10, 0)
      yLabel.name = 'yLabel'
      this.scene.add(yLabel)

      const zLabel = this.createTextSprite('Z', {
        fontsize: 24,
        backgroundColor: { r: 0, g: 0, b: 255, a: 1 }
      })
      zLabel.position.set(0, 0, 10)
      zLabel.name = 'zLabel'
      this.scene.add(zLabel)
    },
    addBoxToScene(box, container, containerIndex, minWeight, maxWeight, isCurrentSection) {
      const boxGeometry = new THREE.BoxGeometry(
        box.width * this.scale,
        box.height * this.scale,
        box.length * this.scale
      )

      let boxColor, boxOpacity, lineOpacity
      if (isCurrentSection) {
        boxColor = new THREE.Color(this.getColorForWeight(box.weight, minWeight, maxWeight))
        boxOpacity = 0.6
        lineOpacity = 1
      } else {
        boxColor = new THREE.Color(0xd5d5d5)
        boxOpacity = 0.2
        lineOpacity = 0.2
      }

      const boxMaterial = new THREE.MeshBasicMaterial({
        color: boxColor,
        transparent: true,
        opacity: boxOpacity
      })

      const mesh = new THREE.Mesh(boxGeometry, boxMaterial)

      const edges = new THREE.EdgesGeometry(boxGeometry)
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        opacity: lineOpacity,
        transparent: true
      })
      const line = new THREE.LineSegments(edges, lineMaterial)

      mesh.position.set(
        (box.x + box.width / 2) * this.scale,
        (box.y + box.height / 2) * this.scale,
        (box.z + box.length / 2) * this.scale
      )

      line.position.copy(mesh.position)

      const textSprite = this.createTextSprite(box.id.toString())
      textSprite.position.copy(mesh.position)

      this.scene.add(mesh)
      this.scene.add(line)
      this.scene.add(textSprite)

      this.lastBox = mesh
    },
    animate() {
      requestAnimationFrame(this.animate)

      const time = performance.now()
      const delta = (time - this.prevTime) / 1000

      this.velocity.x -= this.velocity.x * 10.0 * delta
      this.velocity.z -= this.velocity.z * 10.0 * delta
      this.velocity.y -= this.velocity.y * 10.0 * delta

      this.direction.z = Number(this.moveForward) - Number(this.moveBackward)
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft)
      this.direction.y = Number(this.moveUp) - Number(this.moveDown)
      this.direction.normalize()

      if (this.moveForward || this.moveBackward)
        this.velocity.z -= this.direction.z * 1400.0 * delta
      if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 1400.0 * delta
      if (this.moveUp || this.moveDown) this.velocity.y -= this.direction.y * 1400.0 * delta

      this.controls.moveRight(-this.velocity.x * delta)
      this.controls.moveForward(-this.velocity.z * delta)
      this.controls.getObject().position.y += this.velocity.y * delta

      this.prevTime = time

      this.renderer.render(this.scene, this.camera)
    }
  }
}
</script>

<style scoped>
body {
  margin: 0;
  background-color: white;
  overflow: hidden;
}
canvas {
  display: block;
}
#instructions {
  position: absolute;
  top: 50%;
  width: 100%;
  text-align: center;
  color: #000000;
  font-family: Arial, sans-serif;
  font-size: 24px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
