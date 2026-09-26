<script setup lang="ts">
import type { BodyBlock } from "../../content";
defineProps<{ block: Extract<BodyBlock, { type: 'paragraph' }> }>();
</script>
<template>
  <p :class="block.role">{{ block.text }}</p>
</template>
<style scoped>
/* The former .prose-block p rule set 1.85 on every paragraph here. */
p{line-height:1.85}
.intro{font-size:var(--text-lead);line-height:1.75;color:var(--ink);margin-bottom:42px}
.signoff{font:italic 25px/1.6 var(--font-editorial);text-align:center;color:var(--accent);padding:30px 0;line-height:1.85}
</style>
