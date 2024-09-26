<template>
  <Dialog
    v-model:visible="props.visible"
    :modal="true"
    header="Select Container Size"
    :style="{ width: '50vw' }"
    :class="
      (isDark ? 'dark bg-neutral-800 text-white' : 'bg-gray-100 text-black',
      ' flex flex-col gap-10 justify-center items-center p-4')
    "
    ]
  >
    <div
      :class="
        (isDark ? 'dark bg-neutral-800 text-white' : 'bg-gray-100 text-black',
        ' flex flex-col gap-10 justify-center items-center p-4')
      "
    >
      <div :class="isDark ? 'dark bg-neutral-800 text-white' : 'bg-gray-100 text-black'">
        <img
          src="../assets/Photos/ContainerSizes.png"
          alt="Container Preview"
          class="preview-image"
        />
      </div>
      <div
        v-for="(container, index) in containerSizes"
        :key="index"
        :class="isDark ? 'dark bg-neutral-800 text-white' : 'bg-gray-100 text-black'"
      >
        <div :class="isDark ? 'dark bg-neutral-800 text-white' : 'bg-gray-100 text-black'">
          <RadioButton
            :inputId="'container_' + index"
            name="container"
            :value="container"
            v-model="selectedContainer"
            :class="isDark ? 'dark bg-neutral-800 text-white' : 'bg-gray-100 text-black'"
          />
          <label :for="'container_' + index" class="ml-2">
            {{ `${container[0]} x ${container[1]} x ${container[2]} mm` }}
          </label>
        </div>
      </div>
    </div>

    <div class="flex flex-row gap-4 justify-center items-center p-4">
      <Button
        label="Cancel"
        icon="pi pi-times"
        @click="closeDialog"
        class="p-button-text bg-red-600 p-2 rounded-md"
      />
      <Button
        label="Confirm"
        class="bg-green-600 p-2 rounded-md"
        icon="pi pi-check"
        @click="confirmSelection"
        autofocus
      />
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import RadioButton from 'primevue/radiobutton'
import Button from 'primevue/button'

const props = defineProps({
  visible: Boolean,
  isDark: Boolean
})

const emit = defineEmits(['update:visible', 'containerSelected', 'confirmed'])

const selectedContainer = ref(null)

const containerSizes = [
  [2350, 2390, 3932],
  [2350, 2390, 4423],
  [2350, 2390, 5898]
]

// Close dialog
const closeDialog = () => {
  emit('update:visible', false)
}

// Confirm selection
const confirmSelection = () => {
  if (selectedContainer.value) {
    emit('containerSelected', selectedContainer.value)
    emit('confirmed')
    closeDialog()
  }
}
</script>

<style scoped>
.container-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.option-content {
  display: flex;
  align-items: center;
}

.container-preview {
  width: 250px;
  height: 200px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  padding-top: 20px;
}

.dark-dialog {
  background-color: #333;
  color: white;
}

.light-dialog {
  background-color: white;
  color: black;
}
</style>
