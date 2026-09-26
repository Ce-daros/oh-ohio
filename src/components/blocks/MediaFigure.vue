<script setup lang="ts">
// Shared figure wrapper for illustration and video blocks. The caption
// always renders (matching the original templates, even when empty); the
// optional foot slot carries content that sits after it (video transcript).
defineProps<{ caption?: string }>();
</script>
<template>
  <figure>
    <slot />
    <figcaption>{{ caption }}</figcaption>
    <slot name="foot" />
  </figure>
</template>
<style scoped>
figcaption{font-size:var(--text-small);line-height:1.65;margin-top:12px;color:var(--ink-muted)}
</style>
