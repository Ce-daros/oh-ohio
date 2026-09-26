<script setup lang="ts">
import { ref } from "vue";
import { collections, getContent, getMedia } from "../content";
import ContentCard from "../components/ContentCard.vue";
import { usePageMotion } from "../composables/usePageMotion";
const props = defineProps<{ slug: string }>();
const topic = collections.find(item => item.kind === 'dossier' && item.slug === props.slug)!;
const featured = getContent(topic.featuredId);
const cover = featured.kind === 'feature' ? getMedia(featured.coverMediaId) : undefined;
const stories = topic.itemIds.filter(id => id !== featured.id).map(getContent);
const root = ref<HTMLElement | null>(null);
usePageMotion(root);
</script>
<template>
  <main id="main-content" ref="root" class="topic-page" tabindex="-1"><header class="topic-masthead" data-reveal><RouterLink class="topic-back" to="/topics">← All collections</RouterLink><p class="eyebrow">A THREAD THROUGH OHIO</p><h1>{{ topic.title }}</h1><p class="topic-dek">{{ topic.dek }}</p></header><section class="topic-feature" data-reveal-art><img v-if="cover" :src="cover.src" :alt="featured.kind === 'feature' ? featured.coverAlt : ''" width="1536" height="1024" fetchpriority="high" /><div><p class="eyebrow">START HERE</p><h2>{{ featured.title }}</h2><p>{{ featured.summary }}</p><RouterLink class="text-link" :to="featured.canonicalPath">Read the story <span>↗</span></RouterLink></div></section><section class="topic-reading" data-reveal><div class="section-heading"><h2>Keep <em>following.</em></h2><p>{{ stories.length }} connected stories</p></div><div class="topic-stories" data-reveal-grid><ContentCard v-for="item in stories" :key="item.id" :content="item" :variant="item.kind === 'feature' ? 'story' : 'compact'" /></div></section></main>
</template>
<style scoped>
.topic-page{max-width:var(--page-width);margin:auto;padding:30px var(--page-gutter) 85px}.topic-back{display:inline-block;font-size:var(--text-meta);color:var(--ink-muted);margin-bottom:42px}.topic-masthead h1{font-size:clamp(45px,6vw,84px);max-width:14ch;line-height:1.06;margin:20px 0}.topic-dek{font-size:var(--text-lead);max-width:52ch;color:var(--ink-soft)}.topic-feature{display:grid;grid-template-columns:1.15fr 1fr;gap:6%;align-items:center;padding:50px 0 60px;border-bottom:1px solid var(--rule)}.topic-feature img{aspect-ratio:3/2;object-fit:cover;border-radius:3px 55px 3px 3px}.topic-feature h2{font-size:clamp(32px,3.5vw,48px);line-height:1.12;margin:20px 0}.topic-feature p:not(.eyebrow){color:var(--ink-soft);font-size:18px;line-height:1.75}.topic-feature .text-link{margin-top:30px}.topic-reading{padding-top:50px}.topic-reading h2{font-size:clamp(36px,4vw,54px)}.topic-reading h2 em{color:var(--accent)}.topic-stories{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:35px}.topic-reading .section-heading{margin-bottom:35px}
@media(max-width:800px){.topic-feature{grid-template-columns:1fr;gap:30px}.topic-stories{grid-template-columns:1fr 1fr}}@media(max-width:540px){.topic-stories{grid-template-columns:1fr}.topic-masthead h1{font-size:49px}.topic-reading .section-heading{display:block}.topic-reading .section-heading>p{margin-top:15px}}
</style>
