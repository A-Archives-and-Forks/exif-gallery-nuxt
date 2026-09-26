<script setup lang="ts">
type SlideshowMode = 'loop' | 'sequential' | 'random'

const playing = defineModel<boolean>('playing', { default: false })
const interval = defineModel<number>('interval', { default: 60 })
const mode = defineModel<SlideshowMode>('mode', { default: 'loop' })

const intervalOptions = [5, 15, 30, 60, 120, 300, 1800, 3600]
const intervalValue = computed({
  get: () => String(interval.value),
  set: value => interval.value = Number(value),
})
</script>

<template>
  <div class="p-1 rounded-md bg-background/30 flex gap-1 shadow-2xl items-center backdrop-blur">
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="text-foreground/80 hover:bg-background/50"
          :aria-label="playing ? $t('slideshow.pause') : $t('slideshow.play')"
          @click="playing = !playing"
        >
          <div :class="playing ? 'i-lucide-pause' : 'i-lucide-play'" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{{ playing ? $t('slideshow.pause') : $t('slideshow.play') }}</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <div>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="text-foreground/80 hover:bg-background/50"
                :aria-label="$t('slideshow.settings')"
              >
                <div class="i-lucide-settings-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="center" class="w-72 space-y-4">
              <div class="space-y-2">
                <Label for="slideshow-interval">{{ $t('slideshow.interval') }}</Label>
                <Select v-model="intervalValue">
                  <SelectTrigger id="slideshow-interval" class="w-full">
                    <SelectValue :placeholder="$t('slideshow.interval')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="option in intervalOptions"
                      :key="option"
                      :value="String(option)"
                    >
                      {{ $t('slideshow.seconds', { seconds: option }) }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label>{{ $t('slideshow.mode') }}</Label>
                <RadioGroup v-model="mode" class="p-1 rounded-md bg-muted gap-1">
                  <div class="px-2 py-1.5 rounded-sm flex gap-2 items-center">
                    <RadioGroupItem id="slideshow-mode-loop" value="loop" />
                    <Label for="slideshow-mode-loop" class="flex-1 gap-1.5 cursor-pointer">
                      <div class="i-lucide-repeat" />
                      <span>{{ $t('slideshow.loop') }}</span>
                    </Label>
                  </div>
                  <div class="px-2 py-1.5 rounded-sm flex gap-2 items-center">
                    <RadioGroupItem id="slideshow-mode-sequential" value="sequential" />
                    <Label for="slideshow-mode-sequential" class="flex-1 gap-1.5 cursor-pointer">
                      <div class="i-lucide-list-ordered" />
                      <span>{{ $t('slideshow.sequential') }}</span>
                    </Label>
                  </div>
                  <div class="px-2 py-1.5 rounded-sm flex gap-2 items-center">
                    <RadioGroupItem id="slideshow-mode-random" value="random" />
                    <Label for="slideshow-mode-random" class="flex-1 gap-1.5 cursor-pointer">
                      <div class="i-lucide-shuffle" />
                      <span>{{ $t('slideshow.random') }}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{{ $t('slideshow.settings') }}</p>
      </TooltipContent>
    </Tooltip>
  </div>
</template>
