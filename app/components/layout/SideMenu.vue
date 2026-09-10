<script setup lang="ts">
import type { SiteConfig } from '#shared/types'
import { localize } from '~/utils/content'

const props = defineProps<{ site: SiteConfig, open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const siteRef = computed(() => props.site)
const language = useLanguage(siteRef)
const items = computed(() => [...props.site.menu].filter((item) => item.enabled).sort((a, b) => a.order - b.order))

function closeOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') emit('close') }
onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <Teleport to="body">
    <Transition name="menu-fade">
      <div v-if="open" class="menu-layer" @click.self="emit('close')">
        <aside class="menu-panel" aria-label="Main menu">
          <button class="menu-close" type="button" aria-label="Close menu" @click="emit('close')">×</button>
          <nav>
            <NuxtLink
              v-for="item in items"
              :key="item.id"
              :to="item.route"
              class="menu-link"
              @click="emit('close')"
            >
              <span>{{ localize(item.title, language, props.site.defaultLanguage) }}</span>
            </NuxtLink>
          </nav>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
