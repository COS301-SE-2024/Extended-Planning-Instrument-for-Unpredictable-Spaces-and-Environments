<template>
    <div>
        <h1>
            Your coordinates
        </h1>
        <p>{{ coordinates.lat }} Latitude, {{ coordinates.lng }} Longitude</p>
    </div>
</template>

<script>
    export default{
        data(){
            return{
                coordinates: {
                    lat: 0,
                    lng: 0
                }
            }
        },
        created(){
            //get users coordinates from browser request
        }
    }

</script>