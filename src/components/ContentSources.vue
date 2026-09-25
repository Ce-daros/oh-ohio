<script setup lang="ts">
import { getSource, type ContentMeta } from "../content";
defineProps<{ content: Readonly<ContentMeta> }>();
</script>
<template>
  <section id="reading-sources" class="content-sources" aria-labelledby="sources-title">
    <h2 id="sources-title">Reading &amp; sources</h2>
    <p v-if="content.verification.status === 'verified'" class="verified">Last checked <time :datetime="content.verification.verifiedAt">{{ content.verification.verifiedAt }}</time></p>
    <ol><li v-for="source in content.sourceRefs" :key="source.id"><a :href="getSource(source.id).url" target="_blank" rel="noopener noreferrer"><span>{{ source.label }}</span><span aria-hidden="true">↗</span></a><small v-if="source.kind">{{ source.kind }}</small></li></ol>
  </section>
</template>
<style scoped>
.content-sources{padding-top:38px;scroll-margin-top:var(--anchor-offset)}h2{font-size:25px;letter-spacing:-.035em}.verified{font-size:var(--text-small);color:var(--ink-muted);margin-top:12px}ol{list-style:decimal-leading-zero;padding-left:25px;margin:25px 0 0}li{border-top:1px solid var(--rule);padding:15px 0 15px 8px;color:var(--ink-muted);font-size:var(--text-small)}li a{display:flex;gap:15px;justify-content:space-between;color:var(--ink);font-size:var(--text-meta);line-height:1.65}li a:hover{text-decoration:underline;text-underline-offset:4px}small{display:block;font-size:12px;margin-top:4px}
</style>
