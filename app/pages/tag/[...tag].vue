<script setup lang="ts">
definePageMeta({
  layout: 'home',
})

const route = useRoute()
const localePath = useLocalePath()

const tag = route.params.tag?.[0]
if (!tag) {
  navigateTo(localePath('/'))
  throw new Error('id is required')
}

const currentPhoto = useState<string>('currentPhoto', () => ref(''))

const LIMIT = 36
const params = {
  hidden: false,
  tag,
}
const { photos, hasMore, loadMore, loading } = usePhotosInfinite(params, LIMIT)
const { data: initPhotos } = await useFetch('/api/photos', {
  params: {
    ...params,
    limit: LIMIT,
    offset: photos.value.length,
  },
})
if (initPhotos.value) {
  if (initPhotos.value.data.length < LIMIT)
    hasMore.value = false
  photos.value.push(...initPhotos.value.data.map(deserializePhoto))
}

useInfiniteScroll(window, loadMore, { distance: 240, canLoadMore: () => hasMore.value })

// Initial load
onMounted(() => loadMore())

// 设置导航上下文
const { setupNavigation } = useNavigationSetup('tag', params, photos, hasMore, LIMIT)
setupNavigation()

function getPhotoThumbnail(photo: IPhoto) {
  const path = photo.thumbnail || photo.jpeg || photo.webp || photo.avif
  if (!path)
    throw new Error('Photo has no Image File')
  return path
}
</script>

<template>
  <section class="p-4 relative">
    <h3 class="text-xl font-medium mb-2">
      {{ tag }}
    </h3>
    <div
      v-if="photos && photos.length"
      class="flex-[3] gap-1 grid grid-cols-3 2xl:grid-cols-8 lg:grid-cols-5 sm:grid-cols-4 xl:grid-cols-6"
    >
      <PhotoItemCard
        v-for="photo in photos"
        :key="photo.id"
        :photo="photo"
        :image-class="{ 'current-image': currentPhoto === photo.id }"
      >
        <div class="group relative">
          <NuxtLinkLocale
            :to="`/p/${photo.id}`"
          >
            <img
              v-if="photo"
              :src="`/photos/${getPhotoThumbnail(photo)}`"
              :class="{ 'current-image': currentPhoto === photo.id }"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              :alt="photo.semanticDescription || photo.caption || photo.title"
              @click="currentPhoto = photo.id"
            >
          </NuxtLinkLocale>
        </div>
      </PhotoItemCard>
      <template v-if="loading">
        <Skeleton
          v-for="i in LIMIT"
          :key="i"
          class="rounded-lg w-full aspect-[4/3]"
        />
      </template>
    </div>
  </section>
</template>

<style scoped>
.current-image {
  view-transition-name: vtn-image;
}
</style>
