import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', () => {
  const fullscreen = ref(false)
  const idle = ref(true)

  return {
    fullscreen,
    idle,
  }
})
