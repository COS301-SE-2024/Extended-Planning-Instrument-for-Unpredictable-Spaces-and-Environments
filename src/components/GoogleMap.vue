<!-- src/components/GoogleMap.vue -->
<template>
    <div ref="map" class="map"></div>
</template>

<script>
import * as VueGoogleMaps from 'vue2-google-maps';

export default {
    name: "GoogleMap",
    mounted() {
        this.initMap();
    },
    methods: {
        initMap() {
            const mapOptions = {
                center: { lat: -34.397, lng: 150.644 }, // Center the map
                zoom: 8, // Zoom level
            };

            // Create the map
            this.map = new VueGoogleMaps.Map(this.$refs.map, mapOptions);
        },
    },
    plugins: [VueGoogleMaps],
};
</script>

<style>
.map {
    width: 100%;
    height: 100%;
}
</style>
  