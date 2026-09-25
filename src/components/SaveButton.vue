<script setup lang="ts">
import { computed } from "vue";
import { useReadingList } from "../composables/useReadingList";
const props = defineProps<{ id: string }>();
const { ids, ready, toggle } = useReadingList();
const saved = computed(() => ids.value.includes(props.id));
</script>
<template>
  <button class="save-button" :aria-pressed="saved" :disabled="!ready" @click="toggle(id)">
    <svg viewBox="0 0 20 24" width="15" height="18" aria-hidden="true"><path d="M3 2h14v20l-7-5-7 5Z" :fill="saved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" /></svg>
    {{ saved ? 'Saved' : 'Save for later' }}
  </button>
</template>
<style scoped>
.save-button{display:inline-flex;align-items:center;gap:9px;padding:10px 0;min-height:44px;background:none;border:0;font-size:var(--text-meta);color:var(--ink-soft)}
.save-button[aria-pressed=true]{color:var(--accent)}
.save-button:hover{color:var(--accent)}
</style>
