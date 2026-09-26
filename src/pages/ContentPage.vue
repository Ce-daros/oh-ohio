<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from "vue";
import { useRoute } from "vue-router";
import { collections, getContent, getMedia, getWorld, loadContentBody, type BodyBlock } from "../content";
import { relatedStories } from "../content/related";
import { readingContext, worldReturnTarget } from "../reading-context";
import ContentBody from "../components/ContentBody.vue";
import ContentSources from "../components/ContentSources.vue";
import ContentCard from "../components/ContentCard.vue";
import SaveButton from "../components/SaveButton.vue";
import { useJournalMotion } from "../composables/useJournalMotion";
const props = defineProps<{ slug: string }>();
const route = useRoute();
const content = getContent(props.slug);
const world = getWorld(content.primaryWorld);
const cover = content.kind === 'feature' ? getMedia(content.coverMediaId) : undefined;
const related = relatedStories(content);
const dossiers = collections.filter(item => item.kind === 'dossier' && item.itemIds.includes(content.id));
const context = readingContext(route.query);
const returnWorld = context.from ?? content.primaryWorld;
const returnWorldTitle = getWorld(returnWorld).title;
const returnTarget = worldReturnTarget(returnWorld, context);
const root = ref<HTMLElement | null>(null);
const prose = ref<HTMLElement | null>(null);
const blocks = shallowRef<readonly Readonly<BodyBlock>[]>([]);
const headings = computed(() => blocks.value.filter(block => block.type === 'heading'));
const progress = ref(0);
const active = ref('');
let frame = 0;
function measure() {
  const bounds = prose.value!.getBoundingClientRect();
  const distance = Math.max(1, bounds.height - window.innerHeight * .5);
  progress.value = Math.min(1, Math.max(0, (window.innerHeight * .25 - bounds.top) / distance));
  const passed = headings.value.filter(item => document.getElementById(item.id)!.getBoundingClientRect().top <= window.innerHeight * .35);
  active.value = passed.length ? passed[passed.length - 1]!.id : '';
  frame = 0;
}
function schedule() { if (!frame) frame = requestAnimationFrame(measure); }
onMounted(() => { measure(); window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule); });
onUnmounted(() => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); cancelAnimationFrame(frame); });
useJournalMotion(root);
blocks.value = await loadContentBody(content.id);
</script>
<template>
  <main id="main-content" ref="root" tabindex="-1" class="reading-page" :style="{ '--reading-color': world.color }">
    <div class="reading-progress" aria-hidden="true"><span :style="{ transform: `scaleX(${progress})` }"></span></div>
    <header class="reading-masthead">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><RouterLink :to="returnTarget">{{ returnWorldTitle }}</RouterLink><span>/</span><RouterLink v-if="content.kind === 'feature'" to="/journal">Field notes</RouterLink><span v-else>{{ content.kind === 'phrase' ? 'Local words' : 'Guide notes' }}</span></nav>
      <div :class="['reading-hero', { 'without-cover': !cover }]">
        <div data-journal-enter><p class="eyebrow">{{ content.kind === 'feature' ? content.location : world.title }}</p><h1 v-if="content.kind === 'feature'">{{ content.title.slice(0, -content.titleAccent.length) }}<em>{{ content.titleAccent }}</em></h1><h1 v-else>{{ content.title }}</h1><p class="reading-dek">{{ content.summary }}</p><div class="reading-meta"><span>{{ content.kind === 'feature' ? content.readTime : 'Guide note' }}</span><SaveButton :id="content.id" /></div></div>
        <figure v-if="cover" data-journal-enter><img :src="cover.src" :alt="content.kind === 'feature' ? content.coverAlt : ''" :srcset="cover.variants?.map(item => `${item.src} ${item.width}w`).join(', ')" sizes="(max-width: 760px) 90vw, 46vw" width="1536" height="1024" fetchpriority="high" /><figcaption>{{ cover.use === 'atmosphere' ? 'Illustration' : cover.caption }}</figcaption></figure>
      </div>
    </header>
    <div class="reading-layout">
      <aside class="reading-sidebar"><div><p class="eyebrow">IN THIS STORY</p><nav aria-label="Article sections"><a v-for="(heading, index) in headings" :key="heading.id" :href="`#${heading.id}`" :aria-current="active === heading.id ? 'location' : undefined"><span>{{ String(index + 1).padStart(2, '0') }}</span>{{ heading.title }}</a><a href="#reading-sources">Reading &amp; sources</a></nav><RouterLink class="world-return" :to="`/${world.id}`">More from {{ world.title }} ↗</RouterLink></div></aside>
      <article ref="prose" class="reading-prose"><ContentBody :blocks="blocks" :world="content.primaryWorld" /><ContentSources :content="content" /><nav v-if="dossiers.length" class="story-collections" aria-label="Collections with this story"><p class="eyebrow">FOLLOW THE THREAD</p><RouterLink v-for="dossier in dossiers" :key="dossier.id" :to="`/topics/${dossier.slug}`">{{ dossier.title }} <span aria-hidden="true">↗</span></RouterLink></nav><div class="reading-end"><SaveButton :id="content.id" /><RouterLink to="/saved">Your reading list ↗</RouterLink></div></article>
    </div>
    <section class="reading-related" aria-labelledby="related-heading"><div class="section-heading"><div><p class="eyebrow">KEEP FOLLOWING THE STORY</p><h2 id="related-heading">A little <em>further.</em></h2></div><RouterLink :to="`/${world.id}`">{{ world.title }} stories ↗</RouterLink></div><div class="content-grid"><ContentCard v-for="item in related" :key="item.content.id" :content="item.content" :reason="item.reason" /></div></section>
  </main>
</template>
<style scoped>
.reading-page{background:var(--surface)}.reading-progress{position:fixed;top:var(--header-height);left:0;right:0;height:3px;z-index:45;pointer-events:none}.reading-progress span{display:block;height:100%;background:var(--accent);transform-origin:left}
.reading-masthead{max-width:var(--page-width);margin:auto;padding:30px var(--page-gutter) 65px}.breadcrumbs{display:flex;gap:14px;font-size:var(--text-meta);color:var(--ink-muted);margin-bottom:48px}.breadcrumbs a:hover{text-decoration:underline;text-underline-offset:4px}
.reading-hero{display:grid;grid-template-columns:1fr 1fr;gap:6%;align-items:center}.reading-hero h1{font-size:clamp(40px,4.7vw,70px);line-height:1.06;letter-spacing:-.06em;margin:22px 0;text-wrap:balance}.reading-hero h1 em{color:var(--accent)}.reading-dek{font-size:var(--text-lead);color:var(--ink-soft);line-height:1.7;max-width:40ch}.reading-meta{display:flex;gap:24px;align-items:center;margin-top:24px;font-size:var(--text-meta);color:var(--ink-muted)}.reading-meta>span{border-right:1px solid var(--rule);padding-right:24px}
.reading-hero figure{min-width:0}.reading-hero img{aspect-ratio:3/2;width:100%;height:auto;object-fit:cover;border-radius:55px 3px 3px 3px}.reading-hero figcaption{font-size:var(--text-small);color:var(--ink-muted);margin-top:10px}.without-cover{grid-template-columns:1fr;max-width:860px}.without-cover h1{max-width:15ch}.without-cover .reading-hero h1 em{color:var(--accent)}.reading-dek{max-width:62ch}
.reading-layout{display:grid;grid-template-columns:200px minmax(0, var(--prose-width));gap:7%;max-width:1180px;padding:55px var(--page-gutter) 80px;margin:auto;border-top:1px solid var(--rule)}.reading-prose{min-width:0}.reading-sidebar>div{position:sticky;top:var(--anchor-offset)}.reading-sidebar nav{display:grid;margin-top:18px}.reading-sidebar nav a{display:flex;gap:12px;padding:13px 0;border-bottom:1px solid var(--rule);font-size:var(--text-meta);line-height:1.55;color:var(--ink-muted)}.reading-sidebar nav a>span{font-size:12px;color:var(--accent)}.reading-sidebar nav a[aria-current]{color:var(--accent);font-weight:650}.world-return{display:block;margin-top:30px;font-size:var(--text-meta);color:var(--accent)}.reading-end{border-top:1px solid var(--rule);margin-top:38px;padding-top:18px;display:flex;justify-content:space-between;align-items:center;gap:15px;font-size:var(--text-meta)}
.reading-related{background:var(--surface-note);padding:65px var(--page-gutter) 80px}.reading-related>div{max-width:1280px;margin-inline:auto}.content-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:35px}.reading-related .section-heading{margin-bottom:40px}.reading-related h2{font-size:clamp(36px,4vw,56px)}.reading-related h2 em{color:var(--accent)}
@media(max-width:900px){.reading-layout{grid-template-columns:160px minmax(0,1fr);gap:5%;padding-inline:30px}.content-grid{gap:24px}}
@media(max-width:760px){.reading-masthead{padding-bottom:38px}.breadcrumbs{margin-bottom:30px}.reading-hero{grid-template-columns:1fr;gap:30px}.reading-hero h1{font-size:clamp(38px,8vw,56px)}.reading-hero figure{max-width:650px}.reading-layout{display:block;padding:28px var(--page-gutter) 55px}.reading-sidebar>div{position:static}.reading-sidebar nav{display:flex;gap:0 20px;flex-wrap:wrap;margin-bottom:30px}.reading-sidebar nav a{padding:9px 0}.world-return{display:none}.reading-sidebar .eyebrow{font-size:12px}.content-grid{grid-template-columns:1fr 1fr}.reading-related{padding-block:45px 55px}}
@media(max-width:520px){.content-grid{grid-template-columns:1fr;gap:35px}.reading-related .section-heading{display:block}.reading-related .section-heading>a{display:inline-block;margin-top:22px}.reading-end{flex-wrap:wrap}}
@media print{.reading-sidebar,.reading-related,.reading-progress,.reading-end{display:none}.reading-layout{display:block}.reading-hero img{max-height:250px;object-fit:contain}.reading-prose{max-width:none}}
</style>

<style scoped>
.story-collections{margin-top:40px}.story-collections>a{display:flex;justify-content:space-between;gap:20px;padding:17px 0;border-bottom:1px solid var(--rule);font-size:17px;line-height:1.5}.story-collections>a:hover{color:var(--accent)}
</style>

