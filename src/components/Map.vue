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
  // console.log('Dark mode:', isDark.value ? 'on' : 'off')
}
export default {
  props: {
    destination: {
      type: String,
      default: '1268 Burnett Street, Pretoria' // Default destination address
    }
  },
  setup(props) {
    const coordinates = ref({ lat: null, long: null })
    const destinationCoords = ref({ lat: null, long: null })
    const errorMessage = ref('')
    const isNavigating = ref(false)
    const currentStep = ref('')
    const directionsRenderer = ref(null)
    const steps = ref([])
    const currentStepIndex = ref(0)
    let map = null
    let google = null
    let watchId = null

    // console.log('HERE IS PROPS FROM MAPS', props)

    const loader = new Loader({
      apiKey: 'AIzaSyC6di1BTu_1U6KrADXOmy21xmsLwJ-an9g',
      version: 'weekly',
      libraries: ['places']
    })

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

    const geocodeDestination = async () => {
      if (!google) {
        console.error('Google Maps API not loaded')
        return
      }

      const geocoder = new google.maps.Geocoder()
      try {
        // console.log('Geocoding address:', props.destination) // Log the input address
        const result = await new Promise((resolve, reject) => {
          const fullAddress = `${props.destination}, South Africa`
          geocoder.geocode({ address: fullAddress }, (results, status) => {
            // console.log('Geocode status:', status) // Log the status
            if (status === 'OK') {
              resolve(results[0].geometry.location)
            } else {
              reject(new Error(`Geocode was not successful. Status: ${status}`))
            }
          })
        })

        destinationCoords.value = {
          lat: result.lat(),
          long: result.lng()
        }
        // console.log('Geocoded coordinates:', destinationCoords.value) // Log the result
      } catch (error) {
        console.error('Error geocoding destination:', error)
        errorMessage.value = `Unable to find the destination address. Error: ${error.message}`
      }
    }

    const initMap = async () => {
      if (coordinates.value.lat === null || coordinates.value.long === null) {
        console.error('Coordinates are not available yet')
        return
      }

      try {
        const { Map } = await loader.importLibrary('maps')
        google = window.google
        // console.log('Google Maps API loaded successfully')

        map = new Map(document.getElementById('map'), {
          center: { lat: coordinates.value.lat, lng: coordinates.value.long },
          zoom: 12
        })

        await geocodeDestination()

        const { Marker } = await loader.importLibrary('marker')

        new Marker({
          position: { lat: coordinates.value.lat, lng: coordinates.value.long },
          map: map,
          title: 'Current Location'
        })

        if (destinationCoords.value.lat && destinationCoords.value.long) {
          new Marker({
            position: { lat: destinationCoords.value.lat, lng: destinationCoords.value.long },
            map: map,
            title: 'Destination'
          })
        }

        const { DirectionsRenderer } = await loader.importLibrary('routes')
        directionsRenderer.value = new DirectionsRenderer()
        directionsRenderer.value.setMap(map)
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        errorMessage.value = 'Error loading Google Maps. Please try again later.'
      }
    }

    const calculateRoute = async () => {
      if (!google || !google.maps.DirectionsService) {
        console.error('Google Maps DirectionsService is not available')
        return
      }
      try {
        const { DirectionsService } = await loader.importLibrary('routes')
        const directionsService = new DirectionsService()
        const request = {
          origin: new google.maps.LatLng(coordinates.value.lat, coordinates.value.long),
          destination: new google.maps.LatLng(
            destinationCoords.value.lat,
            destinationCoords.value.long
          ),
          travelMode: google.maps.TravelMode.DRIVING
        }
        const result = await directionsService.route(request)
        directionsRenderer.value.setDirections(result)
        steps.value = result.routes[0].legs[0].steps
        currentStep.value = steps.value[0].instructions
      } catch (error) {
        console.error('Directions request failed:', error)
        errorMessage.value = 'Unable to calculate route. Please check your API key permissions.'
      }
    }

    const startNavigation = () => {
      if (!google || !map) {
        console.error('Google Maps not initialized yet')
        return
      }
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

    watch(
      () => props.destination,
      () => {
        geocodeDestination().then(() => {
          if (map) {
            initMap()
          }
        })
      }
    )

    return {
      coordinates,
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
