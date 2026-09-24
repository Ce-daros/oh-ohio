<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { articles, categoryFor, journalCategories } from "../journal";
import type { JournalArticle, JournalCategory } from "../data/journal-types";
import JournalCover from "../components/JournalCover.vue";
import GuideKeepsake from "../components/GuideKeepsake.vue";
import { useJournalMotion } from "../composables/useJournalMotion";

const root = ref<HTMLElement | null>(null);
const route = useRoute();
const selectedCategory = computed<JournalCategory | "all">(() => {
  const category = route.query.category;
  return journalCategories.some(item => item.id === category)
    ? category as JournalCategory
    : "all";
});
const tabs = [
  { id: "all", label: "All stories", count: articles.length },
  ...journalCategories.map(category => ({
    id: category.id,
    label: category.label,
    count: articles.filter(article => article.category === category.id).length,
  })),
];
const visibleArticles = computed(() => selectedCategory.value === "all"
  ? articles
  : articles.filter(article => article.category === selectedCategory.value));
const featured = computed(() => visibleArticles.value[0]!);
const category = computed(() => categoryFor(featured.value.category));
function storyNumber(article: JournalArticle) {
  return String(articles.indexOf(article) + 1).padStart(2, "0");
}
useJournalMotion(root);
</script>

<template>
  <main id="main-content" ref="root" class="world-page world-journal" tabindex="-1">
    <section class="world-intro" aria-labelledby="journal-title">
      <div class="world-kicker" data-journal-enter><RouterLink to="/">OH, OHIO</RouterLink><span>/</span><span>05</span></div>
      <div class="world-title-line">
        <h1 id="journal-title" data-journal-enter>Field notes<span class="world-period">.</span></h1>
        <p data-journal-enter>Good stories are worth staying for.</p>
        <a class="index-jump" href="#stories" data-journal-enter>All stories <span aria-hidden="true">↓</span></a>
      </div>
    </section>
    <section class="world-body" aria-labelledby="feature-title">
      <div class="journal-scene" data-journal-enter>
        <RouterLink class="featured-cover" :to="`/journal/${featured.slug}`" :aria-label="`Read ${featured.title}`">
          <JournalCover :article="featured" priority />
          <span class="cover-caption"><span>{{ featured.location }}</span><span aria-hidden="true">↗</span></span>
        </RouterLink>
        <nav class="journal-categories" aria-label="Filter journal stories">
          <RouterLink v-for="tab in tabs" :key="tab.id"
            :to="{ path: '/journal', query: tab.id === 'all' ? {} : { category: tab.id } }"
            :class="{ active: selectedCategory === tab.id }"
            :aria-current="selectedCategory === tab.id ? 'page' : undefined">
            <span>{{ tab.label }}</span><span>{{ String(tab.count).padStart(2, '0') }}</span>
          </RouterLink>
        </nav>
      </div>
      <aside class="scene-selection" aria-label="Featured story" data-journal-enter>
        <div class="selection-overview">
          <div class="selection-heading"><span class="selection-number">{{ storyNumber(featured) }}</span><p class="eyebrow">{{ category.label }}</p></div>
          <h2 id="feature-title">{{ featured.title }}</h2>
          <p class="selected-summary">{{ featured.dek }}</p>
          <RouterLink class="feature-read" :to="`/journal/${featured.slug}`"><span>Read the story</span><span aria-hidden="true">↗</span></RouterLink>
          <p class="feature-time">{{ featured.readTime }}</p>
        </div>
        <div class="selection-details">
          <div class="chan-whisper"><span>Ohio-chan <span aria-hidden="true">♡</span></span><p>The people, places, and little everyday things make Ohio feel like Ohio. I saved you a few favorites. ♡</p></div>
          <GuideKeepsake :chapter="featured.chapter" />
        </div>
      </aside>
    </section>
    <section id="stories" class="journal-stories" aria-labelledby="stories-title">
      <div class="stories-heading">
        <div><p class="eyebrow">{{ selectedCategory === 'all' ? 'OHIO-CHAN’S FIELD NOTES' : category.eyebrow }}</p><h2 id="stories-title">{{ selectedCategory === 'all' ? 'All stories' : category.label }}<span class="world-period">.</span></h2></div>
        <p class="story-count" aria-live="polite">{{ visibleArticles.length }} STORIES</p>
      </div>
      <div class="journal-story-grid">
        <RouterLink v-for="article in visibleArticles" :key="article.slug" :to="`/journal/${article.slug}`" class="story-link">
          <JournalCover :article="article" />
          <div class="journal-story-meta"><span>{{ storyNumber(article) }} / {{ categoryFor(article.category).label }}</span><span>{{ article.readTime }}</span></div>
          <h3>{{ article.title }}</h3>
          <p>{{ article.dek }}</p>
          <div class="story-bottom"><span>{{ article.location }}</span><span aria-hidden="true">↗</span></div>
        </RouterLink>
      </div>
    </section>
    <RouterLink class="world-next" to="/explore" style="--next-color:#c9e5ed"><span>WHERE TO NEXT? ♡</span><strong>Explore<span>↗</span></strong><img src="/art/small/prop-camera.webp" width="160" height="160" alt="" loading="lazy" /></RouterLink>
  </main>
</template>

<style scoped>
.world-journal { background:#edf1f5; }
.world-title-line h1 { white-space:nowrap; }
.journal-scene { min-width:0; }
.featured-cover { position:relative; display:block; overflow:hidden; border-radius:5px 70px 5px 5px; }
.featured-cover :deep(.journal-cover) { aspect-ratio:3/2; }
.cover-caption { position:absolute; inset:auto 0 0; display:flex; align-items:center; justify-content:space-between; gap:20px; padding:45px 24px 20px; background:linear-gradient(transparent,#102039bb); color:white; }
.cover-caption > span:first-child { font-size:11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; }
.cover-caption > span:last-child { font-size:30px; }
.journal-categories { display:flex; flex-wrap:wrap; gap:0 24px; margin-top:18px; border-bottom:1px solid #bdc8d7; }
.journal-categories a { display:flex; align-items:center; gap:12px; min-height:52px; padding:12px 0; border-bottom:2px solid transparent; font-size:14px; font-weight:600; color:#59677b; }
.journal-categories a > span:last-child { font-size:10px; color:#67758a; }
.journal-categories a.active { border-color:var(--red); color:var(--red); }
.journal-categories a:hover { color:var(--red); }
.feature-read { display:flex; justify-content:space-between; align-items:center; gap:20px; margin-top:24px; padding:14px 0; border-bottom:1px solid #bdc8d7; font-size:15px; font-weight:600; }
.feature-read > span:last-child { font-size:22px; }
.feature-read:hover { color:var(--red); }
.feature-time { margin-top:12px; font-size:11px; color:#67758a; }
.journal-stories { max-width:1600px; margin:70px auto 0; padding:0 5% 90px; scroll-margin-top:110px; }
.stories-heading { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; border-top:1px solid #bdc8d7; padding-top:35px; margin-bottom:40px; }
.stories-heading h2 { font-size:clamp(40px,4.5vw,64px); margin-top:16px; }
.story-count { flex:none; font-size:11px; letter-spacing:.12em; color:#67758a; padding-bottom:6px; }
.journal-story-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:50px 35px; }
.story-link { min-width:0; display:flex; flex-direction:column; }
.story-link :deep(.journal-cover) { border-radius:70px 4px 4px 4px; }
.story-link:nth-child(even) :deep(.journal-cover) { border-radius:4px 70px 4px 4px; }
.journal-story-meta { display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; font-size:10px; color:#64717b; margin:22px 0 13px; line-height:1.6; }
.journal-story-meta > span:last-child { white-space:nowrap; }
.story-link h3 { font-size:clamp(23px,2.25vw,32px); line-height:1.15; letter-spacing:-.045em; }
.story-link:hover h3 { color:var(--red); }
.story-link > p { font-size:14px; line-height:1.8; color:#65717b; margin-top:15px; }
.story-bottom { display:flex; align-items:center; justify-content:space-between; gap:15px; margin-top:auto; padding-top:18px; }
.story-bottom > span:first-child { font-size:10px; letter-spacing:.06em; color:#64717b; text-transform:uppercase; }
.story-bottom > span:last-child { font-size:25px; }
@media(max-width:1100px) {
  .world-title-line h1 { font-size:clamp(70px,9.5vw,105px); }
  .world-title-line { gap:24px; }
  .world-title-line > p { max-width:180px; }
}
@media(max-width:800px) {
  .world-title-line h1 { font-size:84px; }
  .journal-stories { margin-top:50px; padding-bottom:65px; }
  .journal-story-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:38px 24px; }
  .selection-details .chan-whisper { margin-top:0; }
}
@media(max-width:560px) {
  .world-title-line h1 { font-size:clamp(52px,13vw,72px); }
  .world-title-line { gap:8px 15px; }
  .world-title-line > p { max-width:65%; }
  .featured-cover { border-radius:4px 35px 4px 4px; }
  .cover-caption { padding:30px 16px 12px; }
  .cover-caption > span:first-child { font-size:9px; }
  .journal-categories { gap:0 20px; margin-top:10px; }
  .journal-categories a { min-height:48px; font-size:13px; gap:8px; }
  .selection-details .chan-whisper { margin-top:22px; }
  .stories-heading { align-items:center; margin-bottom:30px; padding-top:25px; }
  .stories-heading h2 { font-size:40px; }
  .stories-heading .eyebrow { font-size:10px; }
  .story-count { font-size:10px; }
  .journal-story-grid { grid-template-columns:1fr; }
  .story-link h3 { font-size:28px; }
}
</style>
