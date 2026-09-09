<script setup lang="ts">
import type { MediaItem } from '#shared/types'
const props = defineProps<{ item: MediaItem, blockId: string, index: number, language: string, fallback: string }>()
const id = computed(() => `${props.blockId}-media-${props.index}`)
</script>

<template>
  <MediaImage v-if="item.type === 'image'" :item="item" :language="language" :fallback="fallback" />
  <ExternalEmbed v-else-if="item.type === 'embed'" :item="item" :id="id" :language="language" :fallback="fallback" />
  <AudioPlayer v-else-if="item.type === 'audio'" :item="item" :id="id" :language="language" :fallback="fallback" />
</template>
