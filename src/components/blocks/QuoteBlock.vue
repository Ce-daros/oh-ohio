<script setup lang="ts">
import { computed } from "vue";
import { getSource, type BodyBlock } from "../../content";
const props = defineProps<{ block: Extract<BodyBlock, { type: 'quote' }> }>();
const source = computed(() => props.block.sourceId ? getSource(props.block.sourceId) : undefined);
</script>
<template>
  <blockquote><p>{{ block.text }}</p><cite>{{ block.attribution }}</cite><a v-if="source" :href="source.url">Source ↗</a></blockquote>
</template>
<style scoped>
blockquote{margin:35px 0;padding:10px 0 10px 28px;border-left:3px solid var(--accent);color:var(--ink)}
/* The old .prose-block p rule out-ranked the shorthand's 1.5; 1.85 was the
   effective line-height, so the shorthand carries it now. */
blockquote p{font:italic 27px/1.85 var(--font-editorial)}
blockquote cite{display:block;font:normal var(--text-meta) var(--font-body);margin-top:18px}
blockquote a{font-size:var(--text-small);text-decoration:underline}
</style>
