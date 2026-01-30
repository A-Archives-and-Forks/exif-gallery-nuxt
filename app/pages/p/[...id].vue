<script setup lang="ts">
definePageMeta({
  layout: 'home',
})

const route = useRoute()
const localePath = useLocalePath()
const uiStore = useUIStore()

const id = route.params.id?.[0]
if (!id) {
  navigateTo(localePath('/'))
  throw new Error('id is required')
}

const { loggedIn } = useUserSession()

const { photo } = usePhoto(id)

const pStore = usePhotosStore()
const photosStore = pStore.photosStore

function onDeleted() {
  photosStore.clear()
  navigateTo(localePath('/'))
}

const { idle } = useIdle(2000, { initialState: true })

watch(idle, (value) => {
  uiStore.idle = value
}, { immediate: true })

uiStore.fullscreen = true
onUnmounted(() => {
  uiStore.fullscreen = false
})
</script>

<template>
  <section
    v-if="photo"
    class="relative"
  >
    <PhotoItem
      :photo="photo"
      :logged-in="loggedIn"
      image-class="current-image"
      :fullscreen="true"
      :idle="idle"
      editable
      @deleted="onDeleted()"
    />
  </section>
  <section v-else>
    <Skeleton class="w-full aspect-[4/3]" />
  </section>
</template>

<style scoped>
.current-image {
  view-transition-name: vtn-image;
}
</style>
