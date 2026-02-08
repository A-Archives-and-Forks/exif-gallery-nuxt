<script setup lang="ts">
const {
  showAdmin = false,
  showLogout = false,
} = defineProps<{
  links: { icon: string, to: string, tooltip: string }[]
  showAdmin?: boolean
  showLogout?: boolean
}>()

const config = useRuntimeConfig()
const { path } = toRefs(useRoute())
const localePath = useLocalePath()

const disconnect = ref(false)
const { loggedIn, clear } = useUserSession()

async function clearSession() {
  disconnect.value = true
  await clear().finally(() => disconnect.value = false)
  navigateTo(localePath('/admin/login'))
}

const uiStore = useUIStore()
const { fullscreen, idle } = toRefs(uiStore)

const route = useRoute()

// 只在首页、grid 页和 admin/index 页显示排序按钮（使用 route.name 支持多语言）
const showSortButton = computed(() => {
  const name = String(route.name).split('_')[0]
  return ['index', 'grid', 'admin'].includes(name as string)
})
</script>

<template>
  <header
    class="px-4 border-b border-dashed bg-background/60 flex h-12 w-full transition-transform duration-300 items-center top-0 justify-between z-50 backdrop-blur"
    :class="fullscreen ? (idle ? 'absolute -translate-y-full' : 'absolute translate-y-0') : 'sticky'"
  >
    <nav div class="flex flex-auto min-w-0 items-center justify-items-start">
      <NuxtLinkLocale to="/" class="font-medium me-2 flex-[0_1_auto] min-w-0 truncate">
        <Logo class="text-primary op-80 size-6" />
      </NuxtLinkLocale>
      <NuxtLinkLocale to="/" class="font-medium flex-[0_1_auto] min-w-0 truncate lt-md:hidden">
        {{ config.public.title || $t('title') }}
      </NuxtLinkLocale>
    </nav>
    <nav div class="flex flex-auto min-w-0 items-center justify-items-start">
      <TooltipIconButton
        v-for="link in links"
        :key="link.to"
        :label="link.tooltip"
      >
        <NuxtLink
          :to="link.to"
          class="text-sm font-medium px-4 text-center rounded-md flex h-7 transition-colors items-center justify-center data-[active=true]:text-primary hover:text-primary data-[active=true]:bg-muted"
          :data-active="path === link.to"
        >
          <div :class="link.icon" />
        </NuxtLink>
      </TooltipIconButton>
    </nav>
    <nav class="flex items-center">
      <HeaderSortMenu v-if="showSortButton" />
      <NuxtLinkLocale to="https://github.com/wiidede/exif-gallery-nuxt" target="_blank">
        <TooltipIconButton :label="$t('header.github')" icon="i-lucide-github op-50" variant="ghost" size="icon" />
      </NuxtLinkLocale>
      <NuxtLinkLocale v-if="showAdmin" to="/admin">
        <TooltipIconButton :label="$t('header.admin')" icon="i-lucide-server-cog op-50" variant="ghost" size="icon" />
      </NuxtLinkLocale>
      <TooltipIconButton
        v-if="showLogout && loggedIn"
        :loading="disconnect"
        :label="$t('header.logout')"
        icon="i-lucide-power text-red"
        variant="ghost"
        size="icon"
        @click="clearSession()"
      />
      <ThemePopover class="flex-shrink-0" />
    </nav>
  </header>
</template>
