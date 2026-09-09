<script setup lang="ts">
import PageRenderer from '~/components/blocks/PageRenderer.vue'
const route = useRoute()
</script>
<template><PageRenderer :route-path="route.path" /></template>
