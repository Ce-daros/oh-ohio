<script setup lang="ts">
import type { BodyBlock } from "../../content";
defineProps<{ block: Extract<BodyBlock, { type: 'route' }> }>();
</script>
<template>
  <ol class="route-stops"><li v-for="(stop, position) in block.stops" :key="stop.id"><span>{{ position + 1 }}</span><div><h3>{{ stop.title }}</h3><p>{{ stop.note }}</p></div></li></ol>
</template>
<style scoped>
.route-stops{list-style:none;padding:0;margin:35px 0}.route-stops li{display:flex;gap:24px;padding:22px 0;border-top:1px solid var(--rule)}.route-stops li>span{flex:none;display:grid;place-items:center;background:var(--ink);color:white;width:34px;height:34px;border-radius:50%;font-size:15px}.route-stops h3{font-size:22px;color:var(--ink);margin-bottom:8px}.route-stops p{font-size:16px;line-height:1.85}
</style>
