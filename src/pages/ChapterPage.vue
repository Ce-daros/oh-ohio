<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getContent, queryContent, scenes, worlds, resolveLegacySlug, type WorldId } from "../content";
import { readingContext } from "../reading-context";
import ReadingPanel from "../components/ReadingPanel.vue";
import PageMasthead from "../components/PageMasthead.vue";
import WorldSelection from "../components/WorldSelection.vue";
import GuidedJourneys from "../components/GuidedJourneys.vue";
import JournalShelf from "../components/JournalShelf.vue";
import WorldNumbers from "../components/world/WorldNumbers.vue";
import WordCollection from "../components/world/WordCollection.vue";
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
      <div class="world-scene" data-hero-art><component :is="sceneComponents[chapterId]" :groups="groups" :selected="selected" @select="selectGroup" /></div>
      <WorldSelection :world="chapterId" :group="selectedGroup" :position="groups.indexOf(selectedGroup)+1" @read="openEntry" />
    </section>
    <section v-else class="world-index" aria-label="Topic index"><div class="topic-groups" data-reveal-grid><section v-for="group in groups" :key="group.id"><h2>{{ group.title }}</h2><a v-for="entry in group.slugs.map(getContent)" :key="entry.id" :href="entry.canonicalPath" @click="openEntry($event,entry.slug)">{{ entry.title }}<span aria-hidden="true">↗</span></a></section></div></section>
    </Transition>
    <WorldNumbers v-if="chapterId === 'make'" />
    <WordCollection v-if="chapterId === 'culture'" @read="openEntry" />
    <JournalShelf data-reveal :chapter="chapterId" />
    <GuidedJourneys data-reveal :chapter-id="chapterId" />
    <RouterLink data-reveal-art class="world-next" :to="`/${nextWorld.id}`" :style="{'--next-color':nextWorld.color}"><span>WHERE TO NEXT? ♡</span><strong>{{ nextWorld.title }}<span>↗</span></strong><img :src="`/art/small/prop-${nextWorld.prop}.webp`" width="160" height="160" alt="" loading="lazy" /></RouterLink>
    <ReadingPanel :entry="reading" :world="chapterId" :scene-id="readingScene" @close="closeEntry" />
  </main>
</template>
<style scoped>
.topic-groups h2{font-size:24px;line-height:1.2;color:var(--accent);margin-bottom:18px;letter-spacing:-.04em}.topic-groups a{display:flex;justify-content:space-between;gap:15px;border-bottom:1px solid var(--rule);padding:15px 0;font-size:16px;line-height:1.5}.topic-groups a:hover{color:var(--accent)}.world-index{padding-bottom:45px}
.view-swap-enter-active{transition:opacity .3s var(--ease),transform .3s var(--ease),filter .3s var(--ease)}
.view-swap-leave-active{transition:opacity .15s var(--ease)}
.view-swap-enter-from{opacity:0;transform:translateY(14px);filter:blur(6px)}
.view-swap-leave-to{opacity:0}
:global(html[data-input=keyboard]) .view-swap-enter-active,:global(html[data-input=keyboard]) .view-swap-leave-active{transition:none}

</style>
