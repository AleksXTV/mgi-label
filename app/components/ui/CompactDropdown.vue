<script setup lang="ts">
interface DropdownOption {
  value: string
  label: string
  icon?: string
}

const props = defineProps<{
  modelValue: string
  options: DropdownOption[]
  ariaLabel: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const root = ref<HTMLElement | null>(null)
const open = ref(false)
const activeIndex = ref(0)

const selected = computed(() => props.options.find((option) => option.value === props.modelValue) || props.options[0])

function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

function openAt(index?: number) {
  if (!props.options.length) return
  const selectedIndex = Math.max(0, props.options.findIndex((option) => option.value === props.modelValue))
  activeIndex.value = index ?? selectedIndex
  open.value = true
}

function move(delta: number) {
  if (!props.options.length) return
  if (!open.value) return openAt()
  activeIndex.value = (activeIndex.value + delta + props.options.length) % props.options.length
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') { event.preventDefault(); open.value ? move(1) : openAt() }
  else if (event.key === 'ArrowUp') { event.preventDefault(); open.value ? move(-1) : openAt(props.options.length - 1) }
  else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open.value ? select(props.options[activeIndex.value]?.value || props.modelValue) : openAt() }
  else if (event.key === 'Escape') { open.value = false }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (root.value && !root.value.contains(event.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))
</script>

<template>
  <div ref="root" class="compact-dropdown" :class="{ open }">
    <button
      type="button"
      class="compact-dropdown-trigger"
      :aria-label="ariaLabel"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="open ? open = false : openAt()"
      @keydown="onTriggerKeydown"
    >
      <span v-if="selected?.icon" class="compact-dropdown-icon" aria-hidden="true">{{ selected.icon }}</span>
      <span class="compact-dropdown-label">{{ selected?.label }}</span>
      <span class="compact-dropdown-chevron" aria-hidden="true">⌄</span>
    </button>

    <Transition name="dropdown-pop">
      <div v-if="open" class="compact-dropdown-menu" role="listbox" :aria-label="ariaLabel">
        <button
          v-for="(option, index) in options"
          :key="option.value"
          type="button"
          role="option"
          class="compact-dropdown-option"
          :class="{ active: option.value === modelValue, focused: index === activeIndex }"
          :aria-selected="option.value === modelValue"
          @mouseenter="activeIndex = index"
          @click="select(option.value)"
        >
          <span v-if="option.icon" class="compact-dropdown-icon" aria-hidden="true">{{ option.icon }}</span>
          <span>{{ option.label }}</span>
          <span v-if="option.value === modelValue" class="compact-dropdown-check" aria-hidden="true">✓</span>
        </button>
      </div>
    </Transition>
  </div>
</template>
