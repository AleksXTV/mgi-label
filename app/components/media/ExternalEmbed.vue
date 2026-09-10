<script setup lang="ts">
import type { MediaItem } from '#shared/types'
import { detectProvider, spotifyEmbed, vimeoId, youtubeId } from '~/utils/providers'
import { localize } from '~/utils/content'

const props = defineProps<{ item: MediaItem, id: string, language: string, fallback: string }>()
const provider = computed(() => detectProvider(props.item.source))
const { activeId, activate } = useMediaCoordinator()
const active = computed(() => activeId.value === props.id)
const resolving = ref(false)
const resolvedBandcamp = ref<string | null>(null)
const pageOrigin = ref('')

onMounted(() => { pageOrigin.value = window.location.origin })

const title = computed(() => localize(props.item.title, props.language, props.fallback) || provider.value.toUpperCase())
const description = computed(() => {
  const raw: any = props.item.description
  if (!raw) return ''
  const selected = raw[props.language] ?? raw[props.fallback] ?? Object.values(raw)[0]
  return Array.isArray(selected) ? selected.join(' ') : String(selected || '')
})
const youtube = computed(() => youtubeId(props.item.source))
const preview = computed(() => youtube.value ? `https://i.ytimg.com/vi/${youtube.value}/hqdefault.jpg` : '')

const iframeUrl = computed(() => {
  if (provider.value === 'youtube' && youtube.value) {
    const params = new URLSearchParams({ autoplay: '1', rel: '0', enablejsapi: '1', playsinline: '1' })
    if (pageOrigin.value) params.set('origin', pageOrigin.value)
    return `https://www.youtube.com/embed/${youtube.value}?${params.toString()}`
  }
  if (provider.value === 'vimeo') {
    const id = vimeoId(props.item.source)
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null
  }
  if (provider.value === 'spotify') return spotifyEmbed(props.item.source)
  if (provider.value === 'soundcloud') return `https://w.soundcloud.com/player/?url=${encodeURIComponent(props.item.source)}&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`
  if (provider.value === 'bandcamp') return resolvedBandcamp.value
  return null
})

async function play() {
  if (provider.value === 'external' ||
      (provider.value === 'youtube' && !youtube.value) ||
      (provider.value === 'vimeo' && !vimeoId(props.item.source)) ||
      (provider.value === 'spotify' && !spotifyEmbed(props.item.source))) {
    window.open(props.item.source, '_blank', 'noopener,noreferrer')
    return
  }
  if (provider.value === 'bandcamp' && !resolvedBandcamp.value) {
    resolving.value = true
    try {
      const result = await $fetch<{ embedUrl: string | null }>('/api/content/resolve-embed', { query: { url: props.item.source } })
      resolvedBandcamp.value = result.embedUrl
      if (!result.embedUrl) {
        window.open(props.item.source, '_blank', 'noopener,noreferrer')
        return
      }
    } finally { resolving.value = false }
  }
  activate(props.id)
}
</script>

<template>
  <div class="embed-shell" :class="`provider-${provider}`">
    <div v-if="active && iframeUrl" class="embed-frame-wrap">
      <iframe
        :src="iframeUrl"
        :title="title"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
      />
    </div>
    <button v-else type="button" class="embed-poster" :disabled="resolving" @click="play">
      <img v-if="preview" :src="preview" alt="" loading="lazy" />
      <span class="embed-shade"></span>
      <span class="embed-provider">{{ provider }}</span>
      <span class="embed-play">{{ resolving ? '…' : '▶' }}</span>
      <span class="embed-copy">
        <strong>{{ title }}</strong>
        <small v-if="description">{{ description }}</small>
      </span>
    </button>
  </div>
</template>
