export function getAssetURL(path) {
  return new URL(`/assets/${path}`, import.meta.url).href
}
