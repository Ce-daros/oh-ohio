<script setup lang="ts">
import type { BodyBlock } from "../../content";
defineProps<{ block: Extract<BodyBlock, { type: 'timeline' }> }>();
</script>
<template>
  <ol class="timeline"><li v-for="event in block.events" :key="event.label"><strong>{{ event.label }}</strong><p>{{ event.text }}</p></li></ol>
</template>
<style scoped>
.timeline{list-style:none;padding:0;margin:40px 0;border-left:1px solid var(--rule)}.timeline li{padding:0 0 25px 28px;position:relative}.timeline li::before{content:'';position:absolute;left:-5px;top:8px;width:9px;height:9px;border-radius:50%;background:var(--accent)}.timeline strong{color:var(--accent);font-size:15px}.timeline p{margin-top:6px;line-height:1.85}
</style>
