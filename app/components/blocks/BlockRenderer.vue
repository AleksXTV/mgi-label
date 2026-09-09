<script setup lang="ts">
import type { PageBlock } from '#shared/types'
import { localize, localizeText } from '~/utils/content'

const props = defineProps<{ block: PageBlock, language: string, fallback: string, index: number }>()
const title = computed(() => localize(props.block.title, props.language, props.fallback))
const subtitle = computed(() => localize(props.block.subtitle, props.language, props.fallback))
const paragraphs = computed(() => localizeText(props.block.text, props.language, props.fallback))
const media = computed(() => props.block.media || [])
const actions = computed(() => props.block.actions || [])
</script>

<template>
  <section class="content-block" :class="[`layout-${block.layout}`, `block-${index + 1}`]" :data-block="block.id">
    <div class="block-index">{{ String(index + 1).padStart(2, '0') }}</div>

    <div class="block-copy">
      <h2 v-if="title">{{ title }}</h2>
      <p v-if="subtitle" class="block-subtitle">{{ subtitle }}</p>
      <div v-if="paragraphs.length" class="block-text">
        <p v-for="(paragraph, pIndex) in paragraphs" :key="pIndex">{{ paragraph }}</p>
      </div>
      <div v-if="actions.length" class="block-actions">
        <template v-for="action in actions" :key="`${action.type}-${action.target}`">
          <NuxtLink v-if="action.type === 'internal'" class="text-action" :to="action.target">{{ localize(action.title, language, fallback) }} →</NuxtLink>
          <a v-else class="text-action" :href="action.target" target="_blank" rel="noopener noreferrer">{{ localize(action.title, language, fallback) }} ↗</a>
        </template>
      </div>
    </div>

    <div v-if="media.length" class="block-media" :class="{ 'media-grid': media.length > 1 }">
      <MediaRenderer v-for="(item, mediaIndex) in media" :key="`${block.id}-${mediaIndex}-${item.source}`" :item="item" :block-id="block.id" :index="mediaIndex" :language="language" :fallback="fallback" />
    </div>

    <ContactForm v-if="block.layout === 'contact-form' && block.form" :labels="block.form" :language="language" :fallback="fallback" />
  </section>
</template>
