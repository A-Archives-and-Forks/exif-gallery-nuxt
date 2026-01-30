export function useTheme(init = false) {
  const theme = useLocalStorage('shadcn-theme', 'blue')
  const radius = useLocalStorage('shadcn-radius', '0.5')
  const config = useRuntimeConfig()
  const { isDesktop } = useDevice()
  const disable3DCard = useCookie<boolean>('disable-3d-card', {
    default: () => {
      return ({ true: true, false: false }[config.public.disable3DCardDefault] ?? !isDesktop)
    },
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })

  if (init && !import.meta.env.SSR) {
    watch(theme, (value) => {
      const oldClass = Array.from(document.body.classList).filter(className => className.startsWith('theme-'))
      if (oldClass.length)
        document.body.classList.remove(...oldClass)
      document.body.classList.add(`theme-${value}`)
    }, { immediate: true })

    watch(radius, (radius) => {
      const base = Number.parseFloat(radius)

      const sm = Math.max(0, base * 0.6).toFixed(2) // 小：约 60%
      const md = base.toFixed(2) // 中：基准值
      const lg = Math.min(2, base * 1.5).toFixed(2) // 大：约 150%，但不超过 2rem（防过大）

      document.body.style.setProperty('--radius', ` ${md}rem`)
      document.body.style.setProperty('--radius-DEFAULT', ` ${md}rem`)
      document.body.style.setProperty('--radius-sm', ` ${sm}rem`)
      document.body.style.setProperty('--radius-md', ` ${md}rem`)
      document.body.style.setProperty('--radius-lg', ` ${lg}rem`)
    }, { immediate: true })
  }

  return {
    theme,
    radius,
    disable3DCard,
  }
}
