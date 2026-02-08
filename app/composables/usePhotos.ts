export function usePhotosInfinite(params?: MaybeRef<{
  hidden?: boolean
  orderBy?: string
  order?: string
  tag?: string
  camera?: string
  lens?: string
}>, limit = 12): {
  photos: Ref<IPhoto[]>
  hasMore: Ref<boolean>
  loadMore: () => Promise<void>
  loading: Ref<boolean>
} {
  const pStore = usePhotosStore()
  const photosStore = pStore.photosStore
  const paramsValue = computed(() => toValue(params))
  const key = computed(() => JSON.stringify(paramsValue.value))

  function getOrCreateState(k: string): InfiniteState {
    if (!photosStore.has(k)) {
      photosStore.set(k, {
        photos: ref([]),
        hasMore: ref(true),
      })
    }
    return photosStore.get(k)!
  }

  // 当前 state，使用 shallowRef 避免深度响应
  const state = shallowRef<InfiniteState>(getOrCreateState(key.value))

  // loading 不在 store 中，避免 SSR 状态污染
  const loading = ref(false)
  const error = ref()

  const loadMore = async () => {
    if (loading.value || !state.value.hasMore.value)
      return

    error.value = undefined

    try {
      loading.value = true
      const response = await $fetch('/api/photos', {
        params: {
          ...paramsValue.value,
          limit,
          offset: state.value.photos.value.length,
        },
      })

      if (response.data.length < limit) {
        state.value.hasMore.value = false
      }

      state.value.photos.value.push(...response.data.map(deserializePhoto))
    }
    catch (err: any) {
      console.error(err)
      toast.error('An error occurred', { description: err?.data?.message || err?.message || 'Failed to get photos' })
    }
    finally {
      loading.value = false
    }
  }

  // 监听 key 变化（排序变化），切换 state 并加载数据
  watch(key, (newKey) => {
    state.value = getOrCreateState(newKey)
    if (state.value.photos.value.length === 0)
      loadMore()
  })

  return {
    photos: computed({
      get: () => state.value.photos.value,
      set: (v) => { state.value.photos.value = v },
    }),
    hasMore: computed({
      get: () => state.value.hasMore.value,
      set: (v) => { state.value.hasMore.value = v },
    }),
    loadMore,
    loading,
  }
}

export function usePhoto(id: MaybeRef<string>) {
  const photo = ref<IPhoto | null>(null)
  const loading = ref(false)

  async function fetchPhoto() {
    if (loading.value || !toValue(id))
      return
    try {
      loading.value = true
      const response = await $fetch(`/api/photos/${toValue(id) as ':id'}`, {
        method: 'get',
      })
      photo.value = deserializePhoto(response)
    }
    catch (err: any) {
      console.error(err)
      toast.error('An error occurred', { description: err?.data?.message || err?.message || 'Failed to get photo' })
    }
    finally {
      loading.value = false
    }
  }

  watch(() => toValue(id), () => {
    fetchPhoto()
  }, { immediate: true })

  return {
    photo,
    loading,
    refresh: fetchPhoto,
  }
}

export function useDeletePhoto() {
  const { t } = useI18n()
  const deletingPhoto = ref<string>()
  async function deletePhoto(id: string) {
    deletingPhoto.value = id
    await $fetch(`/api/photos/${id}`, { method: 'DELETE' }).then(() => {
      toast.success(t('toast.delete_success'))
    }).catch((e) => {
      toast.error('An error occurred', { description: e.message || 'Please try again' })
    }).finally(() => {
      deletingPhoto.value = ''
    })
  }
  return { deletingPhoto, deletePhoto }
}
