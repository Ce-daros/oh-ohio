<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { collections, getCollection, getContent, getMedia, queryContent, worlds } from "../content";
import PageMasthead from "../components/PageMasthead.vue";
import ContentCard from "../components/ContentCard.vue";
import { useReadingEnter } from "../composables/useReadingEnter";
const route = useRoute();
const root = ref<HTMLElement | null>(null);
const articles = queryContent({ kind: 'feature' });
const categories = collections.filter(item => item.kind === 'category');
const selected = computed(() => typeof route.query.category === 'string' ? route.query.category : '');
const selectedWorld = computed(() => typeof route.query.world === 'string' ? route.query.world : '');
const visible = computed(() => articles.filter(item => item.kind === 'feature' && (!selected.value || item.category === selected.value) && (!selectedWorld.value || item.worlds.includes(selectedWorld.value as typeof item.primaryWorld))));
const featured = getContent(getCollection('home:field-notes').featuredId);
const cover = featured.kind === 'feature' ? getMedia(featured.coverMediaId) : undefined;
useReadingEnter(root, () => visible.value);
</script>
<template>
  <main id="main-content" ref="root" tabindex="-1" class="journal-page">
    <PageMasthead label="FIELD NOTES" description="Places, objects, and people worth getting to know. I’ve picked a few stories to linger over with you. ♡"><template #title>Field <em>notes.</em></template><template #actions><a href="#journal-feature-title">Ohio-chan’s pick</a><a href="#stories">All stories <span>{{ articles.length }}</span></a><RouterLink :to="{path:'/search',query:{kind:'feature'}}">Search ↗</RouterLink></template></PageMasthead>
    <section class="journal-feature" aria-labelledby="journal-feature-title">
      <RouterLink v-if="cover" :to="featured.canonicalPath" class="journal-feature-art" :aria-label="featured.title" data-journal-enter><img :src="cover.src" :alt="featured.kind === 'feature' ? featured.coverAlt : ''" width="1536" height="1024" fetchpriority="high" /></RouterLink>
      <div class="journal-feature-copy" data-journal-enter><p class="eyebrow">OHIO-CHAN’S PICK</p><h2 id="journal-feature-title">{{ featured.title }}</h2><p>{{ featured.summary }}</p><RouterLink class="text-link" :to="featured.canonicalPath">Read the story <span>↗</span></RouterLink><span v-if="featured.kind === 'feature'" class="feature-time">{{ featured.location }} · {{ featured.readTime }}</span></div>
    </section>
    <section id="stories" class="journal-archive" aria-labelledby="archive-heading">
      <div class="archive-heading" data-reveal><h2 id="archive-heading">The reading <em>room.</em></h2><RouterLink to="/topics">Explore collections ↗</RouterLink></div>
      <nav class="journal-filters" aria-label="Filter field notes"><RouterLink :to="{path:'/journal',query:selectedWorld ? {world:selectedWorld} : {}}" :aria-current="!selected ? 'page' : undefined">All stories <span>{{ articles.length }}</span></RouterLink><RouterLink v-for="item in categories" :key="item.id" :to="{path:'/journal',query:{category:item.presentation!.id, ...(selectedWorld ? {world:selectedWorld} : {})}}" :aria-current="selected === item.presentation!.id ? 'page' : undefined">{{ item.title }}</RouterLink></nav>
      <div class="archive-context"><p aria-live="polite">{{ visible.length }} {{ visible.length === 1 ? 'story' : 'stories' }}</p><nav aria-label="World"><RouterLink :to="{path:'/journal',query:selected ? {category:selected} : {}}" :aria-current="!selectedWorld ? 'page' : undefined">All worlds</RouterLink><RouterLink v-for="world in worlds" :key="world.id" :to="{path:'/journal',query:{world:world.id,...(selected ? {category:selected} : {})}}" :aria-current="selectedWorld === world.id ? 'page' : undefined">{{ world.title }}</RouterLink></nav></div>
      <div class="journal-grid" data-reveal-grid><ContentCard v-for="content in visible" :key="content.id" :content="content" /></div><p v-if="!visible.length" class="no-stories">No stories in this selection. Choose another world or category.</p>
    </section>
  </main>
</template>
<style scoped>
.journal-page{background:var(--surface);padding-bottom:80px}.journal-feature{display:grid;grid-template-columns:1.3fr 1fr;gap:6%;align-items:center;max-width:var(--page-width);margin:auto;padding:0 var(--page-gutter) 65px}.journal-feature-art{display:block;overflow:hidden;border-radius:3px 70px 3px 3px}.journal-feature-art img{width:100%;height:auto;aspect-ratio:3/2;object-fit:cover}.journal-feature-copy h2{font-size:clamp(32px,3.7vw,53px);line-height:1.1;margin:20px 0;letter-spacing:-.045em}.journal-feature-copy>p:not(.eyebrow){font-size:18px;color:var(--ink-soft);line-height:1.75}.journal-feature-copy .text-link{margin-top:28px}.feature-time{display:block;color:var(--ink-muted);font-size:var(--text-meta);margin-top:22px}.journal-archive{max-width:var(--page-width);margin:auto;padding:55px var(--page-gutter) 0;border-top:1px solid var(--rule)}.archive-heading{display:flex;justify-content:space-between;gap:25px;align-items:end;margin-bottom:35px}.archive-heading h2{font-size:clamp(36px,4vw,54px)}.archive-heading em{color:var(--accent)}.archive-heading>a{font-size:var(--text-meta);border-bottom:1px solid var(--rule);padding-bottom:5px}.journal-filters{display:flex;gap:12px 27px;flex-wrap:wrap;border-bottom:1px solid var(--rule)}.journal-filters a{padding:15px 0;min-height:48px;color:var(--ink-soft);font-size:15px;border-bottom:2px solid transparent}.journal-filters a[aria-current]{color:var(--accent);border-color:var(--accent)}.journal-filters span{margin-left:9px;font-size:12px}.archive-context{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:25px 0 30px;font-size:var(--text-small);color:var(--ink-muted)}.archive-context nav{display:flex;gap:18px;flex-wrap:wrap}.archive-context a[aria-current]{color:var(--accent);text-decoration:underline;text-underline-offset:5px}.journal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:45px 30px}.no-stories{padding:30px 0}
@media(max-width:850px){.journal-feature{gap:5%;grid-template-columns:1.1fr 1fr}.journal-grid{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.journal-feature{grid-template-columns:1fr;gap:27px;padding-top:0;padding-bottom:40px}.journal-feature h2{font-size:36px}.journal-archive{padding-top:35px}.archive-heading{display:block}.archive-heading>a{display:inline-block;margin-top:20px}.journal-grid{grid-template-columns:1fr}.journal-filters{gap:0 22px}.journal-filters a{font-size:14px}.archive-context{gap:18px}}
</style>

