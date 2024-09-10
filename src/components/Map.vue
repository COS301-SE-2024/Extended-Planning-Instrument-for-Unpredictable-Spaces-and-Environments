<template>
  <div class="h-auto flex flex-col rounded-md">
    <div id="map" style="width: 100%; height: 400px"></div>
    <p v-if="errorMessage" class="error-message mt-4">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import loader from '../googleMapsLoader.js'

export default {
  props: {
    destination: {
      type: String,
      default: '1268 Burnett Street, Pretoria'
    }
  },
  setup(props) {
    const startingPosition = ref(null)
    const coordinates = ref({ lat: null, long: null })
    const destinationCoords = ref({ lat: null, long: null })
    const errorMessage = ref('')
    const isNavigating = ref(false)
    const currentStep = ref('')
    // const currentDirectionsRenderer = ref(null)
    const directionsRenderer = ref(null)
    const steps = ref([])
    const currentStepIndex = ref(0)
    let map = null
    let markers = []

    const deleteSavedTripData = () => {
      localStorage.removeItem('lastTripData')
      // Reset the relevant data in the component
      coordinates.value = { lat: null, long: null }
      destinationCoords.value = { lat: null, long: null }
      errorMessage.value = ''
      isNavigating.value = false
      currentStep.value = ''
      steps.value = []
      currentStepIndex.value = 0

      // Clear the map
      if (map) {
        markers.forEach((marker) => marker.setMap(null))
        markers = []
        if (directionsRenderer.value) {
          directionsRenderer.value.setMap(null)
        }
      }

      console.log('Saved trip data has been deleted')
    }

    const saveTripData = () => {
      localStorage.setItem(
        'lastTripData',
        JSON.stringify({
          coordinates: coordinates.value,
          destination: props.destination,
          destinationCoords: destinationCoords.value
        })
      )
    }

    const loadTripData = () => {
      const savedData = localStorage.getItem('lastTripData')
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        coordinates.value = parsedData.coordinates
        destinationCoords.value = parsedData.destinationCoords
      }
    }

    const getLocation = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
          })
          coordinates.value = {
            lat: position.coords.latitude,
            long: position.coords.longitude
          }
          return coordinates.value
        } catch (error) {
          console.error(`Error getting location (attempt ${i + 1}):`, error)
          if (i === retries - 1) {
            errorMessage.value = 'Unable to get your location. Please check your browser settings.'
            throw error
          }
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }
    }

    const geocodeDestination = async () => {
      try {
        const { Geocoder } = await loader.importLibrary('geocoding')
        const geocoder = new Geocoder()
        const fullAddress = `${props.destination}, South Africa`
        const result = await geocoder.geocode({ address: fullAddress })
        if (result.results.length > 0) {
          const location = result.results[0].geometry.location
          destinationCoords.value = {
            lat: location.lat(),
            long: location.lng()
          }
        } else {
          throw new Error('No results found')
        }
      } catch (error) {
        console.error('Error geocoding destination:', error)
        errorMessage.value = `Unable to find the destination address. Error: ${error.message}`
      }
    }

    const initMap = async () => {
      try {
        const { Map } = await loader.importLibrary('maps')
        const { AdvancedMarkerElement } = await loader.importLibrary('marker')
        const { DirectionsRenderer } = await loader.importLibrary('routes')

        if (!coordinates.value.lat || !coordinates.value.long) {
          await getLocation()
        }

        if (!map) {
          map = new Map(document.getElementById('map'), {
            center: { lat: coordinates.value.lat, lng: coordinates.value.long },
            zoom: 12,
            mapId: 'DeliveryMap1'
          })
        }

        await geocodeDestination()

        // Clear existing markers
        markers.forEach((marker) => marker.setMap(null))
        markers = []

        const startMarker = new AdvancedMarkerElement({
          position: { lat: coordinates.value.lat, lng: coordinates.value.long },
          map: map,
          title: 'Current Location'
        })
        markers.push(startMarker)

        if (destinationCoords.value.lat && destinationCoords.value.long) {
          const destinationMarker = new AdvancedMarkerElement({
            position: { lat: destinationCoords.value.lat, lng: destinationCoords.value.long },
            map: map,
            title: 'Destination'
          })
          markers.push(destinationMarker)
        }

        directionsRenderer.value = new DirectionsRenderer()
        directionsRenderer.value.setMap(map)

        saveTripData()
      } catch (error) {
        console.error('Error initializing map:', error)
        errorMessage.value = 'Error initializing map. Please try again later.'
      }
    }

    const calculateRoute = async () => {
      try {
        const { DirectionsService } = await loader.importLibrary('routes')
        const { LatLng } = await loader.importLibrary('core')
        const directionsService = new DirectionsService()
        const result = await directionsService.route({
          origin: new LatLng(coordinates.value.lat, coordinates.value.long),
          destination: new LatLng(destinationCoords.value.lat, destinationCoords.value.long),
          travelMode: 'DRIVING'
        })
        directionsRenderer.value.setDirections(result)
        steps.value = result.routes[0].legs[0].steps
        currentStep.value = steps.value[0].instructions
        isNavigating.value = true
      } catch (error) {
        console.error('Directions request failed:', error)
        errorMessage.value = 'Unable to calculate route. Please check your API key permissions.'
      }
    }
    const startNavigation = () => {
      isNavigating.value = true
      calculateRoute()
    }

    const nextStep = () => {
      if (currentStepIndex.value < steps.value.length - 1) {
        currentStepIndex.value++
        currentStep.value = steps.value[currentStepIndex.value].instructions
      } else {
        currentStep.value = 'You have reached your destination!'
      }
    }

    const updateMap = async () => {
      await initMap()
      await calculateRoute()
    }

    onMounted(async () => {
      loadTripData()
      await initMap()
    })

    watch(
      () => props.destination,
      async (newDestination) => {
        if (newDestination) {
          try {
            if (startingPosition.value) {
              coordinates.value = { ...destinationCoords.value }
            } else {
              startingPosition.value = { ...coordinates.value }
            }
            await geocodeDestination()
            await updateMap()
          } catch (error) {
            console.error('Error updating map:', error)
            errorMessage.value = 'Unable to update the map. Please try again later.'
          }
        }
      },
      { immediate: true }
    )

    return {
      coordinates,
      errorMessage,
      isNavigating,
      currentStep,
      startNavigation,
      nextStep,
      deleteSavedTripData
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
