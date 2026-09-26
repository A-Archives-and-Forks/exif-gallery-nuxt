import type { SerializeObject } from 'nitropack'

export type NavigationType = 'home' | 'tag' | 'camera' | 'lens' | 'grid' | 'admin' | 'direct'

export interface NavigationContext {
  type: NavigationType
  params?: {
    tag?: string
    camera?: string
    lens?: string
    orderBy?: string
    order?: string
  }
}

export interface NavigationState {
  context: NavigationContext | null
  photoIds: string[]
  hasMore: boolean
  loading: boolean
  offset: number
  limit: number
}

export const useNavigationStore = defineStore('navigation', () => {
  // 使用 sessionStorage 持久化，刷新页面后可以恢复上下文
  const context = useSessionStorage<NavigationContext | null>('nav-context', null)
  const photoIds = useSessionStorage<string[]>('nav-photo-ids', [])
  const hasMore = useSessionStorage<boolean>('nav-has-more', false)
  const offset = useSessionStorage<number>('nav-offset', 0)
  const limit = useSessionStorage<number>('nav-limit', 12)

  // 本地状态，不持久化
  const loading = ref(false)

  // 设置浏览上下文
  function setContext(
    navContext: NavigationContext,
    initialPhotos: IPhoto[],
    initialHasMore: boolean,
    initialLimit: number,
  ) {
    context.value = navContext
    photoIds.value = initialPhotos.map(p => p.id)
    hasMore.value = initialHasMore
    offset.value = initialPhotos.length
    limit.value = initialLimit
  }

  // 清空上下文
  function clearContext() {
    context.value = null
    photoIds.value = []
    hasMore.value = false
    offset.value = 0
    limit.value = 12
  }

  // 检查是否有有效的浏览上下文
  function hasValidContext(photoId: string): boolean {
    if (!context.value)
      return false
    return photoIds.value.includes(photoId)
  }

  // 获取当前照片在队列中的索引
  function getCurrentIndex(photoId: string): number {
    return photoIds.value.indexOf(photoId)
  }

  // 是否有上一张
  function hasPrev(photoId: string): boolean {
    const index = getCurrentIndex(photoId)
    return index > 0
  }

  // 是否有下一张
  function hasNext(photoId: string): boolean {
    const index = getCurrentIndex(photoId)
    if (index === -1)
      return false
    if (index < photoIds.value.length - 1)
      return true
    return hasMore.value
  }

  // 获取上一张ID
  function getPrevId(photoId: string): string | null {
    const index = getCurrentIndex(photoId)
    if (index <= 0)
      return null
    return photoIds.value[index - 1] ?? null
  }

  // 获取下一张ID
  async function getNextId(photoId: string): Promise<string | null> {
    const index = getCurrentIndex(photoId)
    if (index === -1)
      return null

    // 如果下一张已在队列中
    if (index < photoIds.value.length - 1) {
      return photoIds.value[index + 1] ?? null
    }

    // 需要加载更多
    if (hasMore.value) {
      await loadMorePhotos()
      return photoIds.value[index + 1] ?? null
    }

    return null
  }

  // 加载更多照片
  async function loadMorePhotos(): Promise<void> {
    if (loading.value || !hasMore.value || !context.value)
      return

    loading.value = true

    try {
      const response = await $fetch('/api/photos', {
        params: {
          ...context.value.params,
          limit: limit.value,
          offset: offset.value,
        },
      })

      const newPhotos = (response.data as unknown as SerializeObject<APIDataPhoto>[]).map(deserializePhoto)

      hasMore.value = response.hasMore
      photoIds.value.push(...newPhotos.map(p => p.id))
      offset.value += newPhotos.length
    }
    catch (err: any) {
      console.error('Failed to load more photos:', err)
      toast.error('加载失败', { description: err?.data?.message || err?.message || '无法加载更多照片' })
    }
    finally {
      loading.value = false
    }
  }

  return {
    context,
    photoIds,
    hasMore,
    loading,
    setContext,
    clearContext,
    hasValidContext,
    getCurrentIndex,
    hasPrev,
    hasNext,
    getPrevId,
    getNextId,
    loadMorePhotos,
  }
})
