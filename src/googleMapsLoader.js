import { Loader } from '@googlemaps/js-api-loader'

// Create a singleton instance of the Loader
const loader = new Loader({
  apiKey: 'AIzaSyC6di1BTu_1U6KrADXOmy21xmsLwJ-an9g',
  version: 'weekly',
  libraries: ['places']
})

export default loader
