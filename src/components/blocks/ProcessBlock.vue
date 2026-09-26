<script setup lang="ts">
import type { BodyBlock } from "../../content";
defineProps<{ block: Extract<BodyBlock, { type: 'process' }> }>();
</script>
<template>
  <section class="process" :class="{'process-parallel':block.layout === 'parallel'}"><h3>{{ block.title }}</h3><component :is="block.layout === 'parallel' ? 'ul' : 'ol'"><li v-for="(step, position) in block.steps" :key="step.title"><span aria-hidden="true">{{ String(position + 1).padStart(2, '0') }}</span><div><h4>{{ step.title }}</h4><p>{{ step.text }}</p></div></li></component></section>
</template>
<style scoped>
.process{background:var(--surface-note);padding:30px;border-top:3px solid var(--ink);margin:36px 0}
.process h3{font-size:25px;color:var(--ink)}.process :is(ol,ul){list-style:none;margin:24px 0 0;padding:0}.process li{display:flex;gap:20px;padding:18px 0;border-top:1px solid var(--rule)}
.process li>span{font:italic 27px var(--font-editorial);color:var(--accent)}.process h4{font-size:17px;margin:0 0 6px;color:var(--ink)}.process p{font-size:16px;line-height:1.85}
.process-parallel ul{display:grid;grid-template-columns:1fr 1fr;gap:16px 26px}.process-parallel li{display:block;padding:20px 0 6px}.process-parallel li>span{display:block;margin-bottom:14px;font-size:21px}.process-parallel h4{font-size:19px}.process:not(.process-parallel) li{position:relative;border:0;padding-block:15px}.process:not(.process-parallel) li:not(:last-child)::after{content:'';position:absolute;left:15px;top:54px;bottom:-7px;width:1px;background:#9cacbc}.process:not(.process-parallel) li>span{display:grid;place-items:center;flex:none;width:31px;height:31px;border:1px solid var(--rule);border-radius:50%;font:500 12px var(--font-body);background:var(--surface);margin-top:2px}
@media(max-width:560px){.process{padding:24px}.process li{gap:15px}.process-parallel ul{grid-template-columns:1fr}}
</style>
