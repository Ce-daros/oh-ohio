<script setup lang="ts">
import type { BodyBlock } from "../../content";
defineProps<{ block: Extract<BodyBlock, { type: 'heading' }> }>();
</script>
<template>
  <header :id="block.id" class="prose-heading"><p class="eyebrow">{{ block.eyebrow }}</p><h2>{{ block.title }}</h2></header>
</template>
<style scoped>
.prose-heading{padding-top:24px;scroll-margin-top:var(--anchor-offset)}
.prose-heading h2{font-size:clamp(30px,3vw,40px);line-height:1.15;letter-spacing:-.045em;margin-top:12px;color:var(--ink)}
/* Formerly forced past .eyebrow's 1.5 by .prose-block p. */
p{line-height:1.85}
</style>
