<template>
  <div class="main-container">
    <Sidebar />
    <div class="container">
      <div class="square"></div>
      <div class="card">
        <div class="header">Shipment #345290</div>
        <Timeline :value="events" class="custom-timeline">
          <template #content="slotProps">
            <div class="timeline-content">
              <div v-if="slotProps.item.status">{{ slotProps.item.status }}</div>
              <div v-if="slotProps.item.coordinates">{{ slotProps.item.coordinates }}</div>
              <div v-if="slotProps.item.location">{{ slotProps.item.location }}</div>
              <div v-if="slotProps.item.date">{{ slotProps.item.date }}</div>
              <div v-if="slotProps.item.finish">{{ slotProps.item.finish }}</div>
              <div v-if="slotProps.item.add">{{ slotProps.item.add }}</div>
            </div>
          </template>
        </Timeline>
        <button class="delivered-button">Delivered</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import { ref } from "vue";

const events = ref([
  { status: 'Starting Location', icon: 'pi pi-circle', color: '#9C27B0'},
  { location: 'Cape Town', coordinates: '-33.9249, 18.4241', date: '15/10/2020', time: '10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0'},
  { location: 'Durban', coordinates: '-29.8587, 31.0218', date: '16/10/2020', time: '10:30', icon: 'pi pi-check', color: '#607D8B' },
  { add: '124 more ships', icon: 'pi pi-check', color: '#607D8B' },
  { location: 'Cape Town', coordinates: '-33.9249, 18.4241', date: '15/10/2020', time: '10:30', icon: 'pi pi-cog', color: '#673AB7' },
  { location: 'Johannesburg', coordinates: '-26.2041, 28.0473', date: '15/10/2020', time: '10:30', icon: 'pi pi-shopping-cart', color: '#FF9800' },
  { location: 'Durban', coordinates: '-29.8587, 31.0218', date: '16/10/2020', time: '10:30', icon: 'pi pi-check', color: '#607D8B' },
  { finish: 'Finishing State', icon: 'pi pi-circle', color: '#9C27B0'}
]);
</script>

<style>
.main-container {
  display: flex;
}

.container {
  display: flex;
  flex-grow: 1;
  flex-wrap: wrap;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  box-sizing: border-box;
  width: 50%; /* Default width on larger screens */
}

.header {
  text-align: center;
  font-size: 1.5rem;
  font-family: Arial Black, sans-serif;
  margin-bottom: 1rem;
}

.custom-timeline .p-timeline-event-content {
  margin-bottom: 2rem;
}

.timeline-content {
  padding: 0.1rem;
  border: 1px solid #ccc;
  width: 15rem;
}

.delivered-button {
  background-color: blue;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  margin-top: 1rem;
}

.delivered-button:hover {
  background-color: darkblue;
}

.square {
  background-color: lightgray;
  width: 50%; /* 50% of the screen size */
  aspect-ratio: 1 / 1; /* Ensure the square aspect ratio */
  flex-shrink: 0; /* Prevent the square from shrinking */
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: row;
  }

  .container {
    flex-direction: column;
    width: 100%; /* Full width on medium and small screens */
  }

  .card, .square {
    width: 100%; /* Full width on medium and small screens */
  }
}
</style>
