<script setup lang="ts">
import type { MediaItem } from '#shared/types'
import { absoluteMediaUrl, localize } from '~/utils/content'

const props = defineProps<{ item: MediaItem, id: string, language: string, fallback: string }>()
const audio = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const duration = ref(0)
const current = ref(0)
const volume = ref(0.8)
const { activeId, activate } = useMediaCoordinator()
const source = computed(() => /^https?:\/\//i.test(props.item.source) ? props.item.source : absoluteMediaUrl(props.item.source))
const title = computed(() => localize(props.item.title, props.language, props.fallback) || props.item.source)
const artist = computed(() => localize(props.item.artist, props.language, props.fallback))

watch(activeId, (id) => {
  if (id !== props.id && audio.value && !audio.value.paused) {
    audio.value.pause()
    playing.value = false
  }
})

function toggle() {
  if (!audio.value) return
  if (audio.value.paused) {
    activate(props.id)
    void audio.value.play()
  } else audio.value.pause()
}
function seek(event: Event) {
  if (!audio.value) return
  audio.value.currentTime = Number((event.target as HTMLInputElement).value)
}
function changeVolume(event: Event) {
  volume.value = Number((event.target as HTMLInputElement).value)
  if (audio.value) audio.value.volume = volume.value
}
function fmt(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
</script>

<template>
  <div class="audio-player">
    <audio
      ref="audio"
      :src="source"
      preload="metadata"
      @play="playing = true"
      @pause="playing = false"
      @timeupdate="current = audio?.currentTime || 0"
      @loadedmetadata="duration = audio?.duration || 0; if (audio) audio.volume = volume"
      @ended="playing = false"
    />
    <div class="audio-meta"><small>{{ artist }}</small><strong>{{ title }}</strong></div>
    <div class="audio-controls">
      <button type="button" :aria-label="playing ? 'Pause' : 'Play'" @click="toggle">{{ playing ? 'Ⅱ' : '▶' }}</button>
      <span>{{ fmt(current) }}</span>
      <input class="audio-progress" type="range" min="0" :max="duration || 0" step="0.1" :value="current" @input="seek" />
      <span>{{ fmt(duration) }}</span>
      <span class="volume-icon">◖</span>
      <input class="audio-volume" type="range" min="0" max="1" step="0.01" :value="volume" @input="changeVolume" />
    </div>
  </div>
</template>
