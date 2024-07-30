<template>
  <div :class="[' h-[auto] flex flex-col rounded-md ']">
    <div id="map" style="width: 100%; height: 400px"></div>
    <button
      v-if="!isNavigating"
      @click="startNavigation"
      class="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Start Navigation
    </button>
    <div v-if="isNavigating" class="mt-4">
      <h2 class="text-xl font-bold mb-2">Current Step:</h2>
      <p v-html="currentStep"></p>
      <button
        @click="nextStep"
        class="w-full mt-2 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600"
      >
        Next Step
      </button>
    </div>
    <p v-if="errorMessage" class="error-message mt-4">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'
import { useDark } from '@vueuse/core'

const isDark = useDark()
const toggleDark = () => {
  isDark.value = !isDark.value
  console.log('Dark mode:', isDark.value ? 'on' : 'off')
}
export default {
  setup() {
    const coordinates = ref({ lat: null, long: null })
    const destination = ref({ lat: -25.7465, long: 28.2587 }) // Coordinates for 1268 Burnett Street
    const errorMessage = ref('')
    const isNavigating = ref(false)
    const currentStep = ref('')
    const directionsRenderer = ref(null)
    const steps = ref([])
    const currentStepIndex = ref(0)
    let map = null
    let google = null
    let watchId = null

    const getLocation = () => {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              coordinates.value = {
                lat: position.coords.latitude,
                long: position.coords.longitude
              }
              resolve(coordinates.value)
            },
            (error) => {
              console.error('Error getting location:', error)
              reject(error)
            }
          )
        } else {
          const error = new Error('Geolocation is not supported by this browser.')
          console.error(error)
          reject(error)
        }
      })
    }

    const initMap = async () => {
      if (coordinates.value.lat === null || coordinates.value.long === null) {
        console.error('Coordinates are not available yet')
        return
      }

      const loader = new Loader({
        apiKey: 'AIzaSyC6di1BTu_1U6KrADXOmy21xmsLwJ-an9g',
        version: 'weekly',
        libraries: ['places']
      })

      try {
        google = await loader.load()
        map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: coordinates.value.lat, lng: coordinates.value.long },
          zoom: 12
        })

        new google.maps.Marker({
          position: { lat: coordinates.value.lat, lng: coordinates.value.long },
          map: map,
          title: 'Current Location'
        })

        new google.maps.Marker({
          position: { lat: destination.value.lat, lng: destination.value.long },
          map: map,
          title: 'Destination'
        })

        directionsRenderer.value = new google.maps.DirectionsRenderer()
        directionsRenderer.value.setMap(map)
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        errorMessage.value = 'Error loading Google Maps. Please try again later.'
      }
    }

    const calculateRoute = () => {
      if (!google || !google.maps.DirectionsService) {
        console.error('Google Maps DirectionsService is not available')
        return
      }

      const directionsService = new google.maps.DirectionsService()

      const request = {
        origin: new google.maps.LatLng(coordinates.value.lat, coordinates.value.long),
        destination: new google.maps.LatLng(destination.value.lat, destination.value.long),
        travelMode: google.maps.TravelMode.DRIVING
      }

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.value.setDirections(result)
          steps.value = result.routes[0].legs[0].steps
          currentStep.value = steps.value[0].instructions
        } else {
          console.error('Directions request failed due to ' + status)
          errorMessage.value = 'Unable to calculate route. Please check your API key permissions.'
        }
      })
    }

    const startNavigation = () => {
      isNavigating.value = true
      calculateRoute()
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          coordinates.value = {
            lat: position.coords.latitude,
            long: position.coords.longitude
          }
          calculateRoute()
        },
        (error) => {
          console.error('Error watching position:', error)
          errorMessage.value = 'Unable to track your location. Please check your browser settings.'
        },
        { enableHighAccuracy: true }
      )
    }

    const nextStep = () => {
      if (currentStepIndex.value < steps.value.length - 1) {
        currentStepIndex.value++
        currentStep.value = steps.value[currentStepIndex.value].instructions
      } else {
        currentStep.value = 'You have reached your destination!'
      }
    }

    onMounted(async () => {
      try {
        await getLocation()
        initMap()
      } catch (error) {
        console.error('Error in onMounted:', error)
        errorMessage.value = 'Unable to get your location. Please check your browser settings.'
      }
    })

    watch(coordinates, (newCoordinates) => {
      if (newCoordinates.lat !== null && newCoordinates.long !== null) {
        initMap()
      }
    })

    return {
      coordinates,
      destination,
      errorMessage,
      isNavigating,
      currentStep,
      startNavigation,
      nextStep
    }
  }
}
</script>
<style scoped>
.error-message {
  color: red;
  font-weight: bold;
}
</style>
