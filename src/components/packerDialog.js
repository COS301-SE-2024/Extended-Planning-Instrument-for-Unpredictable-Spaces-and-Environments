import { ref } from 'vue'

const dialogVisible = ref(false)
const showStartPackingOvererlay = ref(true)

export function useToggleDialog() {
  const toggleDialog = () => {
    dialogVisible.value = !dialogVisible.value
  }

  const toggleStartNewPacking = () => {
    showStartPackingOvererlay.value = !showStartPackingOvererlay.value
  }
  return {
    showStartPackingOvererlay,
    dialogVisible,
    toggleStartNewPacking,
    toggleDialog
  }
}
