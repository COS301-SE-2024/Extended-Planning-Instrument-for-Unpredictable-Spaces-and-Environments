<template>
  <div class="main-container">
    <Sidebar />
    <div class="container">
      <img src="@/assets/image.png" alt="Image" class="square">
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
          <template #op="slotProps">
            <span :style="{ color: slotProps.item.color }" :class="slotProps.item.icon"></span>
          </template>
        </Timeline>
        <button class="delivered-button" @click="showDialog = true">Delivered</button>
      </div>
    </div>
    <Dialog header="Confirmation" v-model:visible="showDialog" :modal="true" :closable="false" :draggable="false">
      <div class="dialog-content">
        <div class="picture-section">
          <h3>Picture</h3>
          <FileUpload name="demo[]" url="./upload" accept="image/*" :auto="true" />
        </div>
        <div class="signature-section">
          <h3>Signature</h3>
          <!-- Signature component or area can be added here -->
        </div>
      </div>
      <div class="p-dialog-footer">
        <button @click="showDialog = false" class="p-button p-component p-button-text">Cancel</button>
        <button @click="submitImage" class="p-button p-component p-button-primary">Submit</button>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import Sidebar from '@/components/Sidebar.vue';
import { ref } from 'vue';
import Timeline from 'primevue/timeline';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';
// import Map from '@/components/Map.vue';

const events = ref([
  { status: 'Starting Location', icon: 'pi pi-circle', color: '#9C27B0' },
  { location: 'Cape Town', coordinates: '-33.9249, 18.4241', date: '15/10/2020', time: '10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0' },
  { add: '124 more ships', icon: 'pi pi-check', color: '#607D8B' },
  { location: 'Johannesburg', coordinates: '-26.2041, 28.0473', date: '15/10/2020', time: '10:30', icon: 'pi pi-shopping-cart', color: '#FF9800' },
  { finish: 'Finishing State', icon: 'pi pi-flag', color: '#9C27B0' }
]);

const showDialog = ref(false);

const submitImage = () => {
  console.log('Image submitted');
  showDialog.value = false;
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

html, body, .main-container, .container {
  height: 100%;
  margin: 0;
}

.main-container {
  display: flex;
}

.container {
  display: flex;
  flex-grow: 1;
  flex-wrap: wrap;
  height: 100%;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  box-sizing: border-box;
  width: 50%;
  height: 100vh;
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

.custom-timeline .p-timeline-event-op {
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-content {
  padding: 0.1rem;
  border: 1px solid #ccc;
  width: 15rem;
}

.bold-text {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 32px;
  color: black;
}

.light-text {
  font-family: 'Montserrat', sans-serif;
  font-weight: 100;
  color: gray;
}

.small-text {
  font-size: 15px;
}

.delivered-button {
  background-color: #a16207;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  margin-top: 1rem;
}

.delivered-button:hover {
  background-color: #000;
}

.square {
  width: 50%;
  height: 100vh;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
}

.custom-timeline .p-timeline-event {
  border-color: #000; 
}

.custom-timeline .p-timeline-event-marker {
  background-color: #000; 
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.picture-section, .signature-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .container {
    flex-direction: column;
    width: 100%;
  }

  .card, .square {
    width: 100%;
  }
}
</style>
