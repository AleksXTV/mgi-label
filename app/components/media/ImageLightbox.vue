<script setup lang="ts">
const props = defineProps<{ open: boolean, src: string, alt: string, target?: string }>()
const emit = defineEmits<{ close: [] }>()
function onKey(event: KeyboardEvent) { if (event.key === 'Escape') emit('close') }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
watch(() => props.open, (value) => { if (import.meta.client) document.body.style.overflow = value ? 'hidden' : '' })
onBeforeUnmount(() => { if (import.meta.client) document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div v-if="open" class="image-lightbox" @click.self="emit('close')">
        <button type="button" class="lightbox-close" aria-label="Close image" @click="emit('close')">×</button>
        <img :src="src" :alt="alt" />
        <NuxtLink v-if="target && target.startsWith('/')" class="lightbox-target" :to="target" @click="emit('close')">Open link →</NuxtLink>
        <a v-else-if="target" class="lightbox-target" :href="target" target="_blank" rel="noopener noreferrer">Open link ↗</a>
      </div>
    </Transition>
  </Teleport>
</template>
