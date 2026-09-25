<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import gsap from "gsap";
import { chapters, chapterEntries, entries, guide, phrases, sceneGroups, type ChapterId } from "../catalog";
import groupCopy from "../data/scene-summaries.json";
import guideCopy from "../data/scene-guidance.json";
import GuideKeepsake from "../components/GuideKeepsake.vue";
import ReadingPanel from "../components/ReadingPanel.vue";
import GuidedJourneys from "../components/GuidedJourneys.vue";
import JournalShelf from "../components/JournalShelf.vue";
import ExploreScene from "../components/scenes/ExploreScene.vue";
import MakeScene from "../components/scenes/MakeScene.vue";
import CultureScene from "../components/scenes/CultureScene.vue";
import LiveScene from "../components/scenes/LiveScene.vue";
import { usePageMotion } from "../composables/usePageMotion";
import { useMotionPolicy } from "../composables/useMotionPolicy";
const props = defineProps<{ chapterId: ChapterId }>();
const route = useRoute();
const router = useRouter();
const chapter = computed(() => chapters.find(item => item.id === props.chapterId)!);
const groups = computed(() => sceneGroups[props.chapterId]);
const selected = ref(groups.value[0]!.id);
const selectedGroup = computed(() => groups.value.find(item => item.id === selected.value)!);
const summaries: Record<ChapterId, Record<string, string>> = groupCopy;
const guidance: Record<ChapterId, Record<string, string>> = guideCopy;
const selectedEntries = computed(() => selectedGroup.value.slugs.map(slug => entries.find(entry => entry.slug === slug)!));
const contextMetric = computed(() => guide.metrics[selected.value === "work" ? 1 : 2]!);
const allEntries = computed(() => chapterEntries(props.chapterId));
const readableEntries = computed(() => props.chapterId === "culture" ? [...allEntries.value, ...phrases] : allEntries.value);
const reading = computed(() => readableEntries.value.find(entry => `#${entry.slug}` === route.hash));
const currentIndex = computed(() => chapters.findIndex(item => item.id === props.chapterId));
const nextChapter = computed(() => chapters[(currentIndex.value + 1) % chapters.length]!);
const nextDestination = computed(() => props.chapterId === "live"
  ? { path: "/journal", title: "Field notes", color: "#f3e1dc", image: "/art/small/prop-postcard.webp" }
  : { path: `/${nextChapter.value.id}`, title: nextChapter.value.title, color: nextChapter.value.color, image: `/art/small/prop-${nextChapter.value.prop}.webp` });
const root = ref<HTMLElement | null>(null);
const selectionPanel = ref<HTMLElement | null>(null);
const scenes = { explore: ExploreScene, make: MakeScene, culture: CultureScene, live: LiveScene };
const facts = {
  explore: { text: "Ohio’s waterways flow toward two different destinations: Lake Erie and the Ohio River.", source: "Ohio Department of Natural Resources", url: "https://dam.assets.ohio.gov/image/upload/ohiodnr.gov/documents/water/WIPP/Bulletin47.pdf" },
  make: { text: "NASA’s Glenn Research Center began in Cleveland in 1941 as an aircraft engine laboratory.", source: "NASA", url: "https://www.nasa.gov/glenn/history/" },
  culture: { text: "Eight monumental earthworks. The Hopewell Ceremonial Earthworks joined the World Heritage List in 2023.", source: "UNESCO", url: "https://whc.unesco.org/en/list/1689" },
  live: { text: "Libraries Connect Ohio brings online research resources to people across the state through the Ohio Web Library.", source: "Ohio Public Library Information Network", url: "https://www.oplin.ohio.gov/databases/selection/lco" },
};
usePageMotion(root);
let selectionMotion: gsap.core.Tween | undefined;
const canAnimate = useMotionPolicy(() => { selectionMotion?.progress(1).kill(); });
async function selectGroup(id: string) {
  if (id === selected.value) return;
  selected.value = id;
  await nextTick();
  selectionMotion?.kill();
  if (canAnimate()) {
    selectionMotion = gsap.fromTo(selectionPanel.value, { y: 8, opacity: .3 }, { y: 0, opacity: 1, duration: .3, ease: "power3.out", clearProps: "transform,opacity" });
  }
}
function openEntry(slug: string) { router.push({ hash: `#${slug}`, query: route.query, state: { readerFrom: route.path } }); }
function closeEntry() {
  if (window.history.state.readerFrom === route.path) router.back();
  else router.replace({ hash: "", query: route.query });
}
watch(reading, entry => {
  if (entry) { const group = groups.value.find(item => item.slugs.includes(entry.slug)); if (group) selected.value = group.id; }
}, { immediate: true });
onUnmounted(() => { selectionMotion?.kill(); });
</script>
<template>
  <main id="main-content" ref="root" tabindex="-1" :class="['world-page', `world-${chapterId}`]" :style="{'--world-color':chapter.color}">
    <section class="world-intro">
      <div class="world-kicker" data-hero-copy><RouterLink to="/">OH, OHIO</RouterLink><span> / </span><span>{{ chapter.symbol }}</span></div>
      <div class="world-title-line"><h1 data-hero-copy>{{ chapter.title }}<span class="world-period">.</span></h1><p data-hero-copy>{{ chapter.headline }}</p><a class="index-jump" href="#all-topics" data-hero-copy>All topics <span>↓</span></a></div>
    </section>
    <section class="world-body" data-parallax-stage :aria-label="`${chapter.title} scene`">
      <div class="world-scene" data-hero-art><component :is="scenes[chapterId]" :groups="groups" :selected="selected" @select="selectGroup" /></div>
      <aside id="scene-selection" ref="selectionPanel" class="scene-selection" aria-label="Selected topic" data-hero-detail>
        <div class="selection-overview">
        <div class="selection-heading"><span class="selection-number">{{ String(groups.findIndex(group => group.id === selected) + 1).padStart(2,'0') }}</span><p class="eyebrow">{{ chapter.title }} / {{ selectedEntries.length }} {{ selectedEntries.length === 1 ? 'STORY' : 'STORIES' }}</p></div>
        <h2 aria-live="polite">{{ selectedGroup.title }}</h2>
        <p class="selected-summary">{{ summaries[chapterId][selected] }}</p>
        <div class="chan-whisper"><span>Ohio-chan <span aria-hidden="true">♡</span></span><p>{{ guidance[chapterId][selected] }}</p></div>
        </div>
        <div class="selection-details">
        <div class="selection-stories"><button v-for="entry in selectedEntries" :key="entry.slug" @click="openEntry(entry.slug)"><span>{{ entry.title }}</span><span aria-hidden="true">↗</span></button></div>
        <a v-if="chapterId === 'make'" class="selection-metric" :href="contextMetric.url" target="_blank" rel="noopener noreferrer"><span>STATEWIDE / {{ contextMetric.label }}</span><strong>{{ contextMetric.value }}</strong><span>{{ contextMetric.unit }} · {{ contextMetric.period }}</span><span>{{ contextMetric.source }} ↗</span></a>
        <GuideKeepsake :chapter="chapterId" />
        </div>
      </aside>
    </section>
    <section v-if="chapterId === 'make'" class="economy-board" aria-labelledby="numbers-title" data-reveal>
      <div class="board-heading"><p class="eyebrow">THE BIGGER PICTURE</p><h2 id="numbers-title">Ohio, by the numbers<span>.</span></h2></div>
      <div class="economy-numbers"><article v-for="metric in guide.metrics" :key="metric.label"><p>{{ metric.label }}</p><strong>{{ metric.value }}<span v-if="metric.unit === 'percent'">%</span></strong><span>{{ metric.unit }}</span><time>{{ metric.period }}</time><a :href="metric.url" target="_blank" rel="noopener noreferrer">{{ metric.source }} ↗</a></article></div>
    </section>
    <section v-if="chapterId === 'culture'" class="word-collection" aria-labelledby="words-title" data-reveal>
      <div><p class="eyebrow">A FEW LOCAL WORDS</p><h2 id="words-title">Say <em>what?</em></h2></div>
      <div class="word-slips"><button v-for="(phrase,index) in phrases" :key="phrase.slug" :style="{'--slip-angle':`${index % 2 ? 3 : -3}deg`}" @click="openEntry(phrase.slug)"><span>0{{ index + 1 }}</span><strong>“{{ phrase.title }}”</strong><span>What does it mean? ↗</span></button></div>
    </section>
    <section class="field-note" data-reveal><img :src="`/art/small/prop-${chapter.prop}.webp`" alt="" width="160" height="160" loading="lazy" /><div><p>{{ facts[chapterId].text }}</p><a :href="facts[chapterId].url" target="_blank" rel="noopener noreferrer">{{ facts[chapterId].source }} ↗</a></div><span class="field-note-mark" aria-hidden="true">Ooh!</span></section>
    <JournalShelf :chapter="chapterId" />
    <GuidedJourneys :chapter-id="chapterId" @read="openEntry" />
    <section id="all-topics" class="world-index" data-reveal>
      <details><summary><span>All {{ chapter.title.toLowerCase() }} topics</span><span class="index-count">{{ allEntries.length }} STORIES</span><span class="index-plus" aria-hidden="true">+</span></summary><div class="topic-groups"><div v-for="group in groups" :key="group.id"><h3>{{ group.title }}</h3><button v-for="slug in group.slugs" :key="slug" @click="openEntry(slug)">{{ allEntries.find(entry => entry.slug === slug)!.title }}<span aria-hidden="true">↗</span></button></div></div></details>
    </section>
    <RouterLink class="world-next" :to="nextDestination.path" :style="{'--next-color':nextDestination.color}"><span>WHERE TO NEXT? ♡</span><strong>{{ nextDestination.title }}<span>↗</span></strong><img :src="nextDestination.image" width="160" height="160" alt="" loading="lazy" /></RouterLink>
    <ReadingPanel :entry="reading" @close="closeEntry" />
  </main>
</template>
