# AGENTS.md

This document provides context for AI agents working with this codebase.

## Project Overview

**EXIF Gallery Nuxt** 是一个全栈照片管理解决方案，集成了 AI 智能处理、浏览器端图片压缩等功能。

### Core Features

- **图片上传与管理**: 支持多种格式（JPEG, WebP, AVIF）上传和显示
- **云存储**: 基于 NuxtHub (Cloudflare R2) 的对象存储
- **AI 集成**: 支持 OpenAI 和 Gemini 智能图片处理
- **图片压缩**: 使用 JSQuash 在浏览器端进行图片压缩
- **EXIF 数据**: 完整的 EXIF 信息读取和展示
- **标签管理**: 支持照片标签的添加和管理
- **现代 UI**: 基于 shadcn-vue 和 inspira-ui 的美观界面
- **响应式设计**: 支持桌面、平板和移动端的完美适配
- **视图过渡**: 使用 Vue View Transition API 实现流畅的页面切换效果

### Tech Stack

- **Framework**: Nuxt 3/4 (Vue 3)
- **Edge Runtime**: [NuxtHub](https://hub.nuxt.com) - Cloudflare 部署
- **Database**: SQLite + [Drizzle ORM](https://orm.drizzle.team/)
- **Storage**: Cloudflare R2 (via NuxtHub Blob)
- **Styling**: [UnoCSS](https://unocss.dev/) + Tailwind CSS
- **UI Components**: [shadcn-vue](https://www.shadcn-vue.com/) + [inspira-ui](https://inspira-ui.com/)
- **State Management**: Pinia
- **Authentication**: [nuxt-auth-utils](https://github.com/Atinux/nuxt-auth-utils)
- **i18n**: @nuxtjs/i18n (English/中文)
- **Validation**: vee-validate + zod
- **AI**: @ai-sdk/openai, @ai-sdk/google
- **Image Processing**: @jsquash/\* (JPEG, WebP, AVIF, PNG, Resize)
- **Device Detection**: @nuxtjs/device

---

## Project Structure

```
exif-gallery-nuxt/
├── app/                    # Frontend application
│   ├── components/         # Vue components
│   │   ├── ui/            # shadcn-vue style components
│   │   ├── inspira/       # inspira-ui components
│   │   ├── AdminIndex.vue # Admin dashboard
│   │   ├── AdminUpload.vue # Admin upload page
│   │   ├── PhotoItem.vue # Photo item component
│   │   ├── PhotoItemCard.vue # Photo card component
│   │   ├── PhotoItemCardDefault.vue # Default photo card
│   │   ├── UploadPhoto.vue # Upload photo component
│   │   ├── LoginForm.vue # Admin login form
│   │   ├── Header.vue # Header component
│   │   ├── Logo.vue # Logo component
│   │   ├── ThemePopover.vue # Theme selector
│   │   ├── ThemeCustomizer.vue # Theme customizer
│   │   ├── Tags.vue # Tags display component
│   │   ├── Tag.vue # Single tag component
│   │   ├── EditPhotoDialog.vue # Edit photo dialog
│   │   ├── DeleteConfirmPopover.vue # Delete confirmation
│   │   ├── UploadConfig.vue # Upload config component
│   │   ├── UploadConfigCard.vue # Upload config card
│   │   ├── UploadPhotoForm.vue # Upload form
│   │   ├── UploadPhotoImage.vue # Upload image preview
│   │   ├── InputDatetime.vue # Datetime input
│   │   ├── ModelCombobox.vue # Model combobox
│   │   ├── ItemStatus.vue # Item status display
│   │   ├── ProviderEditDialog.vue # AI provider edit dialog
│   │   ├── TooltipIconButton.vue # Tooltip icon button
│   │   └── [other components...]
│   ├── composables/       # Vue composables (usePhotos, useTheme, etc.)
│   │   ├── usePhotos.ts   # Photo data fetching logic
│   │   ├── useTheme.ts    # Theme management
│   │   ├── useAIConfig.ts # AI configuration
│   │   ├── useUploadConfig.ts # Upload config
│   │   ├── useFile.ts     # File handling
│   │   ├── useMouseState.ts # Mouse state
│   │   ├── infos.ts       # Info utilities
│   │   └── [other composables...]
│   ├── layouts/           # Page layouts
│   │   ├── admin.vue      # Admin layout
│   │   ├── admin-demo.vue # Admin demo layout
│   │   ├── default.vue    # Default layout
│   │   └── home.vue       # Home layout
│   ├── middleware/        # Route middleware
│   │   ├── auth.ts        # Auth middleware
│   │   └── disable-vue-transitions.global.ts # Transition control
│   ├── pages/             # Application pages
│   │   ├── index.vue      # Home page
│   │   ├── grid.vue       # Grid view page
│   │   ├── admin/         # Admin pages
│   │   │   ├── index.vue  # Admin dashboard
│   │   │   ├── login.vue  # Admin login
│   │   │   ├── upload.vue # Admin upload
│   │   │   └── demo/      # Demo pages
│   │   ├── p/             # Photo detail pages
│   │   │   └── [...id].vue
│   │   └── tag/           # Tag pages
│   │       └── [...tag].vue
│   ├── stores/            # Pinia stores
│   │   ├── photos.ts      # Photos store
│   │   └── ui.ts          # UI store
│   ├── utils/             # Utility functions
│   │   ├── compress.ts    # Browser-side image compression
│   │   ├── exif.ts        # EXIF data extraction
│   │   ├── ai.ts          # AI integration
│   │   ├── aiProviders.ts # AI provider management
│   │   ├── date.ts        # Date utilities
│   │   ├── types.ts       # Type definitions
│   │   ├── worker.ts      # Worker utilities
│   │   ├── cuid.ts        # CUID utilities
│   │   └── [other utils...]
│   ├── workers/           # Web Workers
│   │   ├── encode.worker.ts # Image encoding worker
│   │   └── decode.worker.ts # Image decoding worker
│   ├── lib/               # Library utilities
│   │   └── utils.ts       # Common utilities
│   └── app.vue            # Root Vue component
├── server/                # Backend API
│   ├── api/               # API routes
│   │   ├── auth.post.ts   # Admin authentication
│   │   ├── photos/        # Photo management API
│   │   │   ├── [id].delete.ts # Delete photo
│   │   │   ├── [id].get.ts  # Get photo
│   │   │   ├── [id].put.ts  # Update photo
│   │   │   ├── index.get.ts # List photos
│   │   │   └── upload.post.ts # Upload photo
│   │   └── tags/          # Tags API
│   │       └── index.get.ts # List tags
│   ├── db/                # Database schema and migrations
│   │   ├── schema.ts      # Database schema definitions
│   │   ├── migrations/    # Migration files
│   │   └── scripts/       # Migration scripts
│   ├── routes/            # Additional server routes
│   │   └── photos/        # Photo routes
│   │       └── [pathname].get.ts
│   └── utils/             # Server utilities
│       ├── drizzle.ts     # Drizzle utilities
│       ├── tag.ts         # Tag utilities
│       └── utils.ts       # Common utilities
├── i18n/                  # Internationalization
│   └── locales/           # Translation files
│       ├── en.yml         # English translations
│       └── zh.yml         # Chinese translations
├── types/                 # TypeScript type definitions
│   ├── auth.d.ts          # Auth types
│   └── index.ts           # Main types
├── public/                # Static assets
│   ├── exif-gallery-nuxt.jpg # App preview image
│   ├── exif-gallery.svg   # App icon
│   └── favicon.svg        # Favicon
├── .github/               # GitHub workflows
│   └── workflows/         # Workflow files
│       └── migrate.yml    # Database migration workflow
├── wrangler.jsonc         # Wrangler configuration
├── nuxt.config.ts         # Nuxt configuration
├── tsconfig.json          # TypeScript configuration
├── uno.config.ts          # UnoCSS configuration
├── drizzle.config.ts      # Drizzle configuration
├── package.json           # Dependencies and scripts
└── [other config files...]
```

---

## Development Commands

### Installation

```bash
# Install dependencies
pnpm install

# Enable pnpm if needed
corepack enable pnpm
```

### Development

```bash
# Start development server
pnpm dev

# With remote database connection
pnpm dev --remote

# Build for production
pnpm build

# Preview production build
pnpm preview

# Deploy to Cloudflare Workers (alternative)
npx wrangler deploy

# View deployment logs
pnpm logs

# View preview deployment logs
pnpm logs:preview
```

### Database

```bash
# Generate database migrations
pnpm db:generate

# Run migrations (handled automatically by NuxtHub in dev)
```

### Code Quality

```bash
# Lint and fix
pnpm lint --fix

# TypeScript type check
pnpm typecheck
```

### UI Component Management

```bash
# Add new shadcn-vue component
pnpm ui add <component-name>
```

---

## Database Schema

### Main Tables

**`photos`** - Core photo table

- `id`: Primary key (CUID)
- `fileName`: Original file name
- `fileModified`: File modification timestamp
- `jpeg`, `webp`, `avif`, `thumbnail`: R2 blob paths
- `title`, `caption`, `semanticDescription`: Photo descriptions
- `tags`: Tag names (comma-separated)
- EXIF fields: `make`, `model`, `focalLength`, `fNumber`, `iso`, `exposureTime`, `takenAt`, etc.
- Lens info: `lensMake`, `lensModel`, `focalLengthIn35mmFormat`, `exposureCompensation`
- Location: `locationName`, `latitude`, `longitude`
- `aspectRatio`: Image aspect ratio
- `priorityOrder`: Display order
- `hidden`: Visibility flag
- Timestamps: `createdAt`, `updatedAt`

**`tags`** - Tag registry

- `id`: Primary key (CUID)
- `name`: Unique tag name
- `photoCount`: Number of photos with this tag
- Timestamp: `createdAt`

**`photo_tags`** - Many-to-many junction table

- `photoId`, `tagId`: Foreign keys
- Timestamp: `createdAt`

---

## API Routes

### Photos

| Method | Endpoint             | Description                         | Auth Required |
| ------ | -------------------- | ----------------------------------- | ------------- |
| GET    | `/api/photos`        | List photos (paginated, filterable) | No            |
| GET    | `/api/photos/:id`    | Get single photo                    | No            |
| POST   | `/api/photos/upload` | Upload new photo(s)                 | Yes (admin)   |
| PUT    | `/api/photos/:id`    | Update photo metadata               | Yes (admin)   |
| DELETE | `/api/photos/:id`    | Delete photo                        | Yes (admin)   |

### Tags

| Method | Endpoint    | Description   | Auth Required |
| ------ | ----------- | ------------- | ------------- |
| GET    | `/api/tags` | List all tags | No            |

### Auth

| Method | Endpoint    | Description | Auth Required |
| ------ | ----------- | ----------- | ------------- |
| POST   | `/api/auth` | Admin login | No            |

---

## Frontend Key Composables

### `usePhotos.ts`

- `usePhotosInfinite(params)`: Infinite scroll photo list
- `usePhoto(id)`: Fetch single photo
- `useDeletePhoto()`: Delete photo functionality

### `useUploadConfig.ts`

- Upload configuration management

### `useTheme.ts`

- Theme switching and customization

### `useAIConfig.ts`

- AI configuration (OpenAI/Gemini settings)

### `useFile.ts`

- File handling utilities

### `useMouseState.ts`

- Mouse state management

### `infos.ts`

- Info utilities and breakpoint management

---

## Environment Variables

| Variable                              | Required | Description                            |
| ------------------------------------- | -------- | -------------------------------------- |
| `NUXT_ADMIN_PASSWORD`                 | Yes      | Admin panel access password            |
| `NUXT_SESSION_PASSWORD`               | Yes      | Session encryption key                 |
| `NUXT_PUBLIC_TITLE`                   | No       | Application title                      |
| `NUXT_PUBLIC_DESCRIPTION`             | No       | Application description                |
| `NUXT_PUBLIC_DISABLE_3D_CARD_DEFAULT` | No       | Disable 3D card default in mobile view |

---

## Coding Conventions

### Style Guidelines

- **ESLint**: Configured with `@nuxt/eslint-config`
- **Quotes**: Single quotes (`'`)
- **Semicolons**: No semicolons
- **TypeScript**: Strict mode enabled

### Component Structure

- Use `<script setup lang="ts">`
- Auto-imports enabled for composables and utilities
- shadcn-vue components in `app/components/ui/`
- Custom components in `app/components/`
- Inspirational components in `app/components/inspira/`

### State Management

- Pinia stores in `app/stores/`
- Photo data cached in `photos` store with infinite scroll support
- UI state managed in `ui` store

### Image Processing

- Browser-side compression using JSQuash workers
- Web Workers in `app/workers/` for encode/decode operations
- Multiple format support: JPEG, WebP, AVIF, PNG, thumbnail
- Aspect ratio preservation

### i18n

- Translation files in `i18n/locales/`
- Keys in `en.yml` (English) and `zh.yml` (Chinese)
- Usage: `$t('key')` in templates

### Device Detection

- Uses `@nuxtjs/device` for responsive design
- Mobile-friendly UI with breakpoint management

### View Transitions

- Vue View Transition API enabled for smooth page transitions
- Global middleware controls transitions

---

## Key Files

| File                               | Purpose                                     |
| ---------------------------------- | ------------------------------------------- |
| `nuxt.config.ts`                   | Nuxt configuration, modules, runtime config |
| `tsconfig.json`                    | TypeScript configuration                    |
| `uno.config.ts`                    | UnoCSS configuration                        |
| `drizzle.config.ts`                | Database migration settings                 |
| `wrangler.jsonc`                   | Wrangler deployment configuration           |
| `server/db/schema.ts`              | Database schema definitions                 |
| `app/composables/usePhotos.ts`     | Photo data fetching logic                   |
| `app/composables/useTheme.ts`      | Theme management                            |
| `app/composables/useAIConfig.ts`   | AI configuration                            |
| `server/api/photos/upload.post.ts` | Photo upload API with AI processing         |
| `app/utils/compress.ts`            | Browser-side image compression              |
| `app/utils/exif.ts`                | EXIF data extraction                        |
| `app/utils/ai.ts`                  | AI integration                              |
| `app/utils/aiProviders.ts`         | AI provider management                      |
| `server/api/auth.post.ts`          | Admin authentication                        |

---

## Common Development Tasks

### Adding a New Photo Format

1. Update `server/db/schema.ts` - add new column
2. Update `server/api/photos/upload.post.ts` - handle new format
3. Update `app/composables/usePhotos.ts` - update deserialization
4. Update UI components that display photo info

### Adding New API Endpoint

1. Create file in `server/api/[endpoint].ts` or `server/api/[dir]/[method].ts`
2. Use `eventHandler()` wrapper
3. Access database via `useDB()`
4. Add authentication check if needed: `await requireUserSession(event)`

### Adding New UI Component

```bash
pnpm ui add <component-name>
```

Then customize in `app/components/ui/<component-name>/`

### Modifying Database Schema

1. Edit `server/db/schema.ts`
2. Run `pnpm db:generate` to create migration
3. Commit migration file

### Deploying to Cloudflare

1. **NuxtHub Admin**: Use `npx nuxthub deploy`
2. **Manual**: Use `npx wrangler deploy`
3. **GitHub Actions**: Automated migrations via `.github/workflows/migrate.yml`

---

## Testing Notes

- No explicit test framework configured (as of current state)
- Manual testing via `pnpm dev`
- Use browser DevTools for debugging
- Check Cloudflare dashboard for deployed app logs
- GitHub Actions handle database migrations automatically
