import { ref } from 'vue'

const dialogVisible = ref(false)
const showStartPackingOvererlay = ref(true)

const loadingShipments = ref(false)

export function useToggleDialog() {
  const toggleDialog = () => {
    dialogVisible.value = !dialogVisible.value
  }

  const toggleStartNewPacking = () => {
    showStartPackingOvererlay.value = false
  }
  return {
    showStartPackingOvererlay,
    dialogVisible,
    toggleStartNewPacking,
    toggleDialog
  }
}

export function isLoading() {
  const startLoading = () => {
    loadingShipments.value = true
  }
  const stopLoading = () => {
    loadingShipments.value = false
  }

  return {
    loadingShipments,
    startLoading,
    stopLoading
  }
}
