// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: true,
  pnpm: true,
  formatters: true,
  ignores: [
    'server/db/migrations/*',
    'app/components/ui/**/*',
  ],
  overrides: {
    typescript: {
      'node/prefer-global/process': 'off',
    },
  },
})
