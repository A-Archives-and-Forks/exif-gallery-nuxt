<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { cn } from '@/lib/utils'

type SlideshowMode = 'loop' | 'sequential' | 'random'

definePageMeta({
  layout: 'home',
})

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()

const id = ref(route.params.id?.[0] || '')
if (!id.value) {
  navigateTo(localePath('/'))
  throw new Error('id is required')
}

watch(() => route.params.id, (params) => {
  const nextId = params?.[0]
  if (nextId)
    id.value = nextId
})

const { loggedIn } = useUserSession()

const { photo } = usePhoto(id)

const pStore = usePhotosStore()
const photosStore = pStore.photosStore

function onDeleted() {
  photosStore.clear()
  navigateTo(localePath('/'))
}

const idleState = useState('p-idle', () => true)
const { idle } = useIdle(2000, { initialState: idleState.value })
watch(idle, val => idleState.value = val, { immediate: true })

// 照片翻页导航
const { hasContext, canGoPrev, canGoNext, loading, goPrev, goNext }
  = usePhotoNavigation(id)
const navStore = useNavigationStore()

const slideshowPlaying = useState('slideshow-playing', () => false)
const slideshowInterval = useLocalStorage('slideshow-interval-seconds', 60)
const slideshowMode = useLocalStorage<SlideshowMode>('slideshow-playback-mode', 'loop')

const cursorHidden = computed(() => slideshowPlaying.value && idle.value)
watch(cursorHidden, (hidden) => {
  if (import.meta.client)
    document.documentElement.classList.toggle('cursor-none', hidden)
}, { immediate: true })

const randomVisited = new Set<string>()
let slideshowTimer: ReturnType<typeof setTimeout> | undefined
let slideshowTimerToken = 0
let advancing = false

function clearSlideshowTimer() {
  slideshowTimerToken += 1
  if (slideshowTimer) {
    clearTimeout(slideshowTimer)
    slideshowTimer = undefined
  }
}

async function goToPhoto(photoId: string) {
  await router.replace(localePath(`/p/${photoId}`))
}

async function goToFirstPhoto() {
  const firstId = navStore.photoIds[0]
  if (!firstId || firstId === id.value)
    return false

  await goToPhoto(firstId)
  return true
}

async function goToRandomPhoto() {
  if (navStore.hasMore)
    await navStore.loadMorePhotos()

  let candidates = navStore.photoIds.filter(photoId => photoId !== id.value && !randomVisited.has(photoId))
  if (candidates.length === 0 && slideshowMode.value === 'random') {
    randomVisited.clear()
    candidates = navStore.photoIds.filter(photoId => photoId !== id.value)
  }

  const nextId = candidates[Math.floor(Math.random() * candidates.length)]
  if (!nextId)
    return false

  randomVisited.add(id.value)
  randomVisited.add(nextId)
  await goToPhoto(nextId)
  return true
}

function scheduleSlideshow() {
  clearSlideshowTimer()
  if (!slideshowPlaying.value || !photo.value || !hasContext.value)
    return

  const timerToken = slideshowTimerToken
  slideshowTimer = setTimeout(() => {
    if (timerToken !== slideshowTimerToken)
      return

    slideshowTimer = undefined
    void advanceSlideshow(timerToken)
  }, slideshowInterval.value * 1000)
}

async function advanceSlideshow(timerToken: number) {
  if (timerToken !== slideshowTimerToken || !slideshowPlaying.value || advancing)
    return

  advancing = true
  let moved = false
  try {
    if (slideshowMode.value === 'random') {
      moved = await goToRandomPhoto()
    }
    else if (canGoNext.value) {
      await goNext()
      moved = true
    }
    else if (slideshowMode.value === 'loop') {
      moved = await goToFirstPhoto()
    }
  }
  finally {
    advancing = false
  }

  if (timerToken !== slideshowTimerToken || !slideshowPlaying.value)
    return

  if (moved)
    scheduleSlideshow()
  else
    slideshowPlaying.value = false
}

watch([slideshowPlaying, slideshowInterval, slideshowMode], () => {
  randomVisited.clear()
  scheduleSlideshow()
})
watch([photo, hasContext, () => route.params.id], scheduleSlideshow, { immediate: true })
onBeforeRouteLeave((to) => {
  if (to.name !== route.name)
    slideshowPlaying.value = false
})
onBeforeUnmount(clearSlideshowTimer)

// 移动端滑动支持
const imageContainerRef = ref<HTMLElement>()
const { isSwiping, direction } = useSwipe(imageContainerRef, {
  threshold: 50,
  onSwipeEnd: () => {
    if (direction.value === 'left' && canGoNext.value) {
      goNext()
    }
    else if (direction.value === 'right' && canGoPrev.value) {
      goPrev()
    }
  },
})
</script>

<template>
  <section
    v-if="photo"
    ref="imageContainerRef"
    class="relative overflow-hidden h-dvh"
  >
    <div
      v-if="hasContext"
      class="transition-all duration-300 right-4 top-14 absolute z-20"
      :class="idle
        ? '-translate-y-full opacity-0 pointer-events-none'
        : 'translate-y-0 opacity-100'"
    >
      <SlideshowControls
        v-model:playing="slideshowPlaying"
        v-model:interval="slideshowInterval"
        v-model:mode="slideshowMode"
      />
    </div>
    <div
      v-if="hasContext && canGoPrev"
      class="group cursor-pointer left-2 top-1/2 absolute z-10 -translate-y-1/2"
    >
      <Button
        variant="ghost"
        class="text-xl text-foreground/67 rounded-lg bg-background/30 size-16 shadow-lg transition-all duration-300 backdrop-blur hover:bg-background/50"
        :class="cn(
          (isSwiping ? direction === 'right' : !idle) ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none',
          'group-hover:translate-x-0 group-hover:opacity-100 group-hover:pointer-events-auto',
        )"
        @click="goPrev"
      >
        <div class="i-lucide-chevron-left" />
      </Button>
    </div>
    <div
      v-if="hasContext && canGoNext"
      class="group cursor-pointer right-2 top-1/2 absolute z-10 -translate-y-1/2"
    >
      <ProButton
        variant="ghost"
        class="text-xl text-foreground/67 rounded-lg bg-background/30 size-16 shadow-lg transition-all duration-300 backdrop-blur hover:bg-background/50"
        :class="cn(
          (isSwiping ? direction === 'left' : !idle) ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none',
          'group-hover:translate-x-0 group-hover:opacity-100 group-hover:pointer-events-auto',
        )"
        :loading="loading"
        @click="goNext"
      >
        <div class="i-lucide-chevron-right" />
      </ProButton>
    </div>

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
