import { Loader } from '@googlemaps/js-api-loader'

const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_DISTANCE_API,
  version: 'weekly'
})

export default {
  importLibrary: (libraryName) => loader.importLibrary(libraryName)
}
