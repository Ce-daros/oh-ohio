<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { places, worlds } from "../content";
import { searchContent } from "../content/search";
import ContentCard from "../components/ContentCard.vue";
import { usePageMotion } from "../composables/usePageMotion";
import { useGridFlip } from "../composables/useGridFlip";
const route = useRoute();
const router = useRouter();
const query = ref('');
const world = ref('');
const kind = ref('');
const place = ref('');
watch(() => route.query, value => {
  query.value = typeof value.q === 'string' ? value.q : '';
  world.value = typeof value.world === 'string' ? value.world : '';
  kind.value = typeof value.kind === 'string' ? value.kind : '';
  place.value = typeof value.place === 'string' ? value.place : '';
}, { immediate: true });
const results = computed(() => searchContent({ q: query.value, world: world.value, kind: kind.value, place: place.value }));
function search() {
  router.push({ path: '/search', query: { ...(query.value.trim() ? { q: query.value.trim() } : {}), ...(world.value ? { world: world.value } : {}), ...(kind.value ? { kind: kind.value } : {}), ...(place.value ? { place: place.value } : {}) } });
}
function clear() { query.value = ''; world.value = ''; kind.value = ''; place.value = ''; search(); }
const root = ref<HTMLElement | null>(null);
usePageMotion(root);
useGridFlip(root, ".search-grid", () => results.value);
</script>
<template>
  <main id="main-content" ref="root" class="browse-page" tabindex="-1">
    <header class="browse-heading" data-reveal><p class="eyebrow">FIND A STORY</p><h1>What caught<br />your <em>curiosity?</em></h1></header>
    <form class="search-form" role="search" data-reveal @submit.prevent="search">
      <div class="search-field"><label class="sr-only" for="story-search">Search stories</label><input id="story-search" v-model="query" type="search" placeholder="A place, a sound, a little brass whistle…" /><button type="submit">Search <span aria-hidden="true">↗</span></button></div>
      <div class="search-filters"><label>World<select v-model="world" @change="search"><option value="">All four worlds</option><option v-for="item in worlds" :key="item.id" :value="item.id">{{ item.title }}</option></select></label><label>Reading<select v-model="kind" @change="search"><option value="">All stories</option><option value="feature">Field notes</option><option value="note">Guide notes</option><option value="phrase">Local words</option></select></label><label>Place<select v-model="place" @change="search"><option value="">All places</option><option v-for="item in places" :key="item.id" :value="item.id">{{ item.title }}</option></select></label><button class="clear-filters" type="button" @click="clear">Clear filters</button></div>
    </form>
    <div class="results-heading" data-reveal><p aria-live="polite">{{ results.length }} {{ results.length === 1 ? 'story' : 'stories' }}</p><RouterLink to="/saved">Your reading list ↗</RouterLink></div>
    <div v-if="results.length" class="search-grid" data-reveal><ContentCard v-for="item in results" :key="item.id" :content="item" variant="compact" /></div>
    <div v-else class="empty-reading" data-reveal><h2>No stories found.</h2><p>Try a place name or clear a filter.</p><button class="text-link" @click="clear">Show all stories ↗</button></div>
  </main>
</template>
<style scoped>
.browse-page{max-width:var(--page-width);margin:auto;padding:60px var(--page-gutter) 90px}.browse-heading h1{font-size:clamp(45px,6.5vw,90px);margin:18px 0 45px;line-height:1.02}.browse-heading em{color:var(--accent)}.search-form{margin-bottom:40px}.search-field{display:flex;border-bottom:2px solid var(--ink);padding-bottom:15px;gap:20px}.search-field input{min-width:0;flex:1;border:0;border-radius:0;background:transparent;font:400 clamp(18px,2.2vw,26px) var(--font-body);color:var(--ink);padding:14px 0}.search-field button{background:var(--ink);color:white;border:0;padding:14px 25px;display:flex;gap:35px;align-items:center}.search-filters{display:flex;flex-wrap:wrap;gap:25px;margin-top:30px;align-items:end}.search-filters label{display:flex;flex-direction:column;gap:9px;font-size:13px;color:var(--ink-muted);min-width:180px}.search-filters select{border:1px solid var(--rule);border-radius:0;background:var(--surface);padding:12px 35px 12px 13px;font:15px var(--font-body);color:var(--ink);max-width:270px}.clear-filters{background:none;border:0;border-bottom:1px solid var(--rule);padding:14px 0;font-size:14px;color:var(--ink-soft)}.results-heading{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:12px;font-size:var(--text-meta);color:var(--ink-muted)}.search-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px 35px}.empty-reading{padding:45px 0}.empty-reading h2{font-size:32px}.empty-reading p{margin:18px 0}.empty-reading button{background:none;border:0;padding:10px 0}
@media(max-width:850px){.search-grid{grid-template-columns:1fr 1fr}.search-filters{gap:18px}.search-filters label{min-width:140px}}
@media(max-width:540px){.browse-page{padding-top:35px}.browse-heading h1{font-size:49px}.search-field{gap:10px}.search-field input{font-size:17px}.search-field button{padding:14px 18px}.search-field button span{display:none}.search-grid{grid-template-columns:1fr}.search-filters label{flex:1;min-width:120px}.search-filters select{max-width:100%;width:100%}.search-filters{gap:18px 12px}}
</style>

