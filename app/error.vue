<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number, statusMessage?: string, message?: string } }>()
function goHome() { clearError({ redirect: '/' }) }
</script>

<template>
  <main class="error-page">
    <div class="error-code">{{ props.error.statusCode || 500 }}</div>
    <h1>{{ props.error.statusCode === 404 ? 'This frequency is silent.' : 'Signal interrupted.' }}</h1>
    <p>{{ props.error.statusMessage || props.error.message || 'An unexpected error occurred.' }}</p>
    <button type="button" class="text-action" @click="goHome">Return home →</button>
  </main>
</template>
