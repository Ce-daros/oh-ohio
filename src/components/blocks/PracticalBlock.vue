<script setup lang="ts">
import type { BodyBlock } from "../../content";
defineProps<{ block: Extract<BodyBlock, { type: 'practical' }> }>();
</script>
<template>
  <dl class="practical"><div v-for="item in block.items" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.text }}</dd></div></dl>
</template>
<style scoped>
.practical{background:var(--surface-note);padding:12px 28px;margin:35px 0}.practical>div{display:grid;grid-template-columns:120px 1fr;gap:25px;padding:20px 0;border-bottom:1px solid var(--rule)}.practical>div:last-child{border:0}.practical dt{font-weight:650;color:var(--ink);font-size:15px}.practical dd{margin:0;font-size:16px;line-height:1.75}
@media(max-width:560px){.practical{padding:8px 22px}.practical>div{display:block}.practical dt{margin-bottom:8px}}
</style>
