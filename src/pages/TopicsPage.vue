<script setup lang="ts">
import { ref } from "vue";
import PageMasthead from "../components/PageMasthead.vue";
import { usePageMotion } from "../composables/usePageMotion";
import { collections, getContent, getMedia } from "../content";
const dossiers = collections.filter(item => item.kind === 'dossier').sort((a,b) => a.order - b.order);
function cover(id: string) { const content = getContent(id); return content.kind === 'feature' ? getMedia(content.coverMediaId).src : ''; }
const root = ref<HTMLElement | null>(null);
usePageMotion(root);
</script>
<template>
  <main id="main-content" ref="root" class="topics-page" tabindex="-1"><PageMasthead label="COLLECTIONS" description="A sound, a street, a little piece of clay. See where each one leads."><template #title>Follow a <em>thread.</em></template><template #actions><a href="#collections">All collections <span>{{ dossiers.length }}</span></a><RouterLink to="/journal">Field notes</RouterLink><RouterLink to="/search">Search ↗</RouterLink></template></PageMasthead><div id="collections" class="topics-grid" data-reveal-grid><RouterLink v-for="(item, index) in dossiers" :key="item.id" :to="`/topics/${item.slug}`" class="topic-tile"><div><img :src="cover(item.featuredId)" alt="" width="1536" height="1024" loading="lazy" /><span>{{ String(index + 1).padStart(2,'0') }}</span></div><p class="eyebrow">{{ item.itemIds.length }} CONNECTED STORIES</p><h2>{{ item.title }}</h2><p>{{ item.dek }}</p><span class="topic-arrow" aria-hidden="true">↗</span></RouterLink></div></main>
</template>
<style scoped>
.topics-page{padding-bottom:90px}.topics-grid{max-width:var(--page-width);margin:auto;padding:0 var(--page-gutter);display:grid;grid-template-columns:1fr 1fr;gap:55px 45px}.topic-tile{position:relative;border-bottom:1px solid var(--rule);padding-bottom:25px}.topic-tile>div{position:relative;aspect-ratio:16/9;overflow:hidden;margin-bottom:22px}.topic-tile img{height:100%;width:100%;object-fit:cover}.topic-tile>div>span{position:absolute;bottom:15px;left:20px;color:white;font:italic 58px var(--font-editorial);text-shadow:0 1px 12px #18243c80}.topic-tile h2{font-size:clamp(27px,3vw,42px);line-height:1.13;letter-spacing:-.045em;margin:12px 0 15px}.topic-tile>p:not(.eyebrow){font-size:17px;color:var(--ink-soft);max-width:48ch;padding-right:25px}.topic-arrow{position:absolute;right:0;bottom:25px;font-size:28px;color:var(--accent);transition:transform .3s var(--ease)}.topic-tile:hover h2{color:var(--accent)}
.topic-tile img{transition:transform .5s var(--ease)}
@media(hover:hover) and (prefers-reduced-motion:no-preference){.topic-tile:hover img{transform:scale(1.04)}.topic-tile:hover .topic-arrow{transform:translate(4px,-4px)}}
:global(html[data-input=keyboard]) .topic-tile img,:global(html[data-input=keyboard]) .topic-arrow{transform:none;transition:none}
@media(max-width:600px){.topics-grid{grid-template-columns:1fr;gap:38px}}
</style>
