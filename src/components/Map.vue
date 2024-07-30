<template>
  <div>
    <h1>Your Coordinates</h1>
    <p>{{ coordinates.lat }} Latitude</p>
    <p>{{ coordinates.long }} Longitude</p>
    <div id="map" style="width: 100%; height: 400px"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'

export default {
  setup() {
    const coordinates = ref({ lat: 0, long: 0 })
    const destination = ref({ lat: -25.7465, long: 28.2587 }) // Coordinates for 1268 Burnett Street
    let map = null
    let google = null

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            coordinates.value = {
              lat: position.coords.latitude,
              long: position.coords.longitude
            }
            initMap()
          },
          (error) => {
            console.error('Error getting location:', error)
          }
        )
      } else {
        console.error('Geolocation is not supported by this browser.')
      }
    }

    const initMap = async () => {
      const loader = new Loader({
        apiKey: 'AIzaSyCN_j1aJRd3lvq4koaghz5L_rsCVOiiJAI',
        version: 'weekly',
        libraries: ['places']
      })

      try {
        google = await loader.load()
        map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: coordinates.value.lat, lng: coordinates.value.long },
          zoom: 12
        })

        new google.maps.marker.AdvancedMarkerElement({
          position: { lat: coordinates.value.lat, lng: coordinates.value.long },
          map: map,
          title: 'Current Location'
        })

        new google.maps.marker.AdvancedMarkerElement({
          position: { lat: destination.value.lat, lng: destination.value.long },
          map: map,
          title: 'Destination'
        })

        const directionsService = new google.maps.DirectionsService()
        const directionsRenderer = new google.maps.DirectionsRenderer()
        directionsRenderer.setMap(map)

        const request = {
          origin: new google.maps.LatLng(coordinates.value.lat, coordinates.value.long),
          destination: new google.maps.LatLng(destination.value.lat, destination.value.long),
          travelMode: google.maps.TravelMode.DRIVING
        }

        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result)
          } else {
            console.error('Directions request failed due to ' + status)
          }
        })
      } catch (error) {
        console.error('Error loading Google Maps:', error)
      }
    }

    onMounted(() => {
      getLocation()
    })

    return {
      coordinates,
      destination
    }
  }
}
</script>
