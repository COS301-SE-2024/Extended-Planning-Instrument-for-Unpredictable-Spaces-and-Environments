import { Loader } from '@googlemaps/js-api-loader'

// Create a singleton instance of the Loader
const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_DISTANCE_API,
  version: 'weekly',
  libraries: ['places']
})


export default loader
