<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getContent, queryContent, scenes, worlds, resolveLegacySlug, type WorldId } from "../content";
import { readingContext } from "../reading-context";
import { metrics } from "../content/registries";
import ReadingPanel from "../components/ReadingPanel.vue";
import PageMasthead from "../components/PageMasthead.vue";
import WorldSelection from "../components/WorldSelection.vue";
import GuidedJourneys from "../components/GuidedJourneys.vue";
import JournalShelf from "../components/JournalShelf.vue";
import ExploreScene from "../components/scenes/ExploreScene.vue";
import MakeScene from "../components/scenes/MakeScene.vue";
import CultureScene from "../components/scenes/CultureScene.vue";
import LiveScene from "../components/scenes/LiveScene.vue";
import { useWorldMotion } from "../composables/usePageMotion";
const props = defineProps<{ chapterId: WorldId }>();
const route = useRoute();
const router = useRouter();
const chapter = computed(() => worlds.find(item => item.id === props.chapterId)!);
const groups = computed(() => scenes[props.chapterId]);
const allEntries = computed(() => queryContent({world:props.chapterId}).filter(item => item.kind !== 'feature'));
const phrases = queryContent({kind:'phrase'});
const reading = computed(() => allEntries.value.find(item => item.slug === resolveLegacySlug(route.hash.slice(1))));
const readingScene = computed(() => groups.value.find(item => reading.value && item.slugs.includes(reading.value.slug))?.id);
const selectedGroup = computed(() => {
  const requested = groups.value.find(item => item.id === route.query.scene);
  if (requested) return requested;
  const opened = groups.value.find(item => reading.value && item.slugs.includes(reading.value.slug));
  return opened ?? groups.value[0]!;
});
const selected = computed(() => selectedGroup.value.id);
const view = computed(() => route.query.view === 'index' ? 'index' : 'scene');
const nextWorld = computed(() => worlds[(worlds.findIndex(item => item.id === props.chapterId) + 1) % worlds.length]!);
const root = ref<HTMLElement | null>(null);
const sceneComponents = { explore:ExploreScene, make:MakeScene, culture:CultureScene, live:LiveScene };
useWorldMotion(root);
function selectGroup(id:string) { router.push({query:{...route.query,scene:id},hash:''}); }
// Session-local flag: a close action goes back only if this session
// pushed the reading entry onto the history stack; deep links just
// strip the hash.
let readerPushed = false;
watch(() => route.hash, hash => { if (!hash) readerPushed = false; });
function openEntry(event:MouseEvent,slug:string) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  readerPushed = true;
  router.push({hash:`#${slug}`,query:{ ...readingContext(route.query) }});
}
function closeEntry() {
  if (readerPushed) router.back();
  else router.replace({hash:'',query:{ ...readingContext(route.query) }});
}
</script>
<template>
  <main id="main-content" ref="root" tabindex="-1" :class="['world-page', `world-${chapterId}`]" :style="{'--world-color':chapter.color}">
    <PageMasthead :label="chapter.symbol" :description="chapter.headline" :title-style="chapterId === 'culture' ? 'italic' : 'roman'">
      <template #title>{{ chapter.title }}<span class="title-period">.</span></template>
      <template #actions><RouterLink :to="{query:{...route.query,view:undefined},hash:''}" :aria-current="view === 'scene' ? 'page' : undefined">Explore the scene</RouterLink><RouterLink :to="{query:{...route.query,view:'index'},hash:''}" :aria-current="view === 'index' ? 'page' : undefined">Topic index <span>{{ allEntries.length }}</span></RouterLink><RouterLink :to="{path:'/search',query:{world:chapterId}}">Search ↗</RouterLink></template>
    </PageMasthead>
    <Transition name="view-swap" mode="out-in">
    <section v-if="view === 'scene'" class="world-body" :aria-label="`${chapter.title} scene`">
      <WorldSelection v-if="chapterId === 'make'" :world="chapterId" :group="selectedGroup" :position="groups.indexOf(selectedGroup)+1" @read="openEntry" />
      <div class="world-scene" data-hero-art><component :is="sceneComponents[chapterId]" :groups="groups" :selected="selected" @select="selectGroup" /></div>
      <WorldSelection v-if="chapterId !== 'make'" :world="chapterId" :group="selectedGroup" :position="groups.indexOf(selectedGroup)+1" @read="openEntry" />
    </section>
    <section v-else class="world-index" aria-label="Topic index"><div class="topic-groups" data-reveal-grid><section v-for="group in groups" :key="group.id"><h2>{{ group.title }}</h2><a v-for="slug in group.slugs" :key="slug" :href="getContent(slug).canonicalPath" @click="openEntry($event,slug)">{{ getContent(slug).title }}<span aria-hidden="true">↗</span></a></section></div></section>
    </Transition>
    <section v-if="chapterId === 'make'" class="economy-board" aria-labelledby="numbers-title"><div class="board-heading" data-reveal><p class="eyebrow">STATEWIDE / THE BIGGER PICTURE</p><h2 id="numbers-title">Ohio, by the numbers<span>.</span></h2></div><div class="economy-numbers"><article v-for="metric in metrics" :key="metric.id"><p>{{ metric.label }}</p><strong>{{ metric.value }}<span v-if="metric.unit === 'percent'">%</span></strong><span>{{ metric.unit }}</span><time>{{ metric.period }}</time><a :href="metric.url" target="_blank" rel="noopener noreferrer">{{ metric.source }} ↗</a></article></div></section>
    <section v-if="chapterId === 'culture'" class="word-collection" aria-labelledby="words-title"><div data-reveal><p class="eyebrow">A FEW LOCAL WORDS</p><h2 id="words-title">Say <em>what?</em></h2></div><div class="word-slips"><a v-for="(phrase,index) in phrases" :key="phrase.id" :href="phrase.canonicalPath" :style="{'--slip-angle':`${index % 2 ? 3 : -3}deg`}" @click="openEntry($event,phrase.slug)"><span>0{{ index+1 }}</span><strong>“{{ phrase.title }}”</strong><span>What does it mean? ↗</span></a></div></section>
    <JournalShelf data-reveal :chapter="chapterId" />
    <GuidedJourneys data-reveal :chapter-id="chapterId" />
    <RouterLink data-reveal-art class="world-next" :to="`/${nextWorld.id}`" :style="{'--next-color':nextWorld.color}"><span>WHERE TO NEXT? ♡</span><strong>{{ nextWorld.title }}<span>↗</span></strong><img :src="`/art/small/prop-${nextWorld.prop}.webp`" width="160" height="160" alt="" loading="lazy" /></RouterLink>
    <ReadingPanel :entry="reading" :world="chapterId" :scene-id="readingScene" @close="closeEntry" />
  </main>
</template>
<style scoped>
.topic-groups h2{font-size:24px;line-height:1.2;color:var(--accent);margin-bottom:18px;letter-spacing:-.04em}.topic-groups a{display:flex;justify-content:space-between;gap:15px;border-bottom:1px solid var(--rule);padding:15px 0;font-size:16px;line-height:1.5}.topic-groups a:hover{color:var(--accent)}.world-index{padding-bottom:45px}.word-slips a{min-width:0;height:195px;background:#ffe4a9;color:#28354a;padding:20px 15px;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;text-align:left;transform:rotate(var(--slip-angle))}.word-slips a:nth-child(2){background:#c9dfeb}.word-slips a:nth-child(3){background:#f4c2ca}.word-slips a:nth-child(4){background:#d3dfcc}.word-slips a>span{font-size:13px}.word-slips a:hover{outline:1px solid var(--accent)}
.view-swap-enter-active{transition:opacity .3s var(--ease),transform .3s var(--ease),filter .3s var(--ease)}
.view-swap-leave-active{transition:opacity .15s var(--ease)}
.view-swap-enter-from{opacity:0;transform:translateY(14px);filter:blur(6px)}
.view-swap-leave-to{opacity:0}
:global(html[data-input=keyboard]) .view-swap-enter-active,:global(html[data-input=keyboard]) .view-swap-leave-active{transition:none}
@media(max-width:560px){.word-slips a{height:170px}}
</style>
