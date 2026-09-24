<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { articles, categoryFor, journalCategories } from "../journal";
import type { JournalArticle, JournalCategory } from "../data/journal-types";
import JournalCover from "../components/JournalCover.vue";
import { useJournalMotion } from "../composables/useJournalMotion";

const root = ref<HTMLElement | null>(null);
const route = useRoute();
const featured = articles[0]!;

const selectedCategory = computed<JournalCategory | "all">(() => {
  const category = route.query.category;
  return journalCategories.some(item => item.id === category)
    ? category as JournalCategory
    : "all";
});

const tabs = computed(() => [
  { id: "all" as const, label: "All stories", count: articles.length },
  ...journalCategories.map(category => ({
    id: category.id,
    label: category.label,
    count: articles.filter(article => article.category === category.id).length,
  })),
]);

const visibleArticles = computed(() => selectedCategory.value === "all"
  ? articles
  : articles.filter(article => article.category === selectedCategory.value));

function storyNumber(article: JournalArticle) {
  return String(articles.indexOf(article) + 1).padStart(2, "0");
}

useJournalMotion(root);
</script>

<template>
  <main id="main-content" ref="root" class="journal-page" tabindex="-1">
    <section class="journal-hero" aria-labelledby="journal-title">
      <div class="hero-inner">
        <div class="journal-hero-copy">
          <p class="kicker" data-journal-enter>OH, OHIO <span aria-hidden="true">/</span> OHIO-CHAN’S FIELD NOTES</p>
          <h1 id="journal-title" data-journal-enter>Field notes<span class="title-period">.</span></h1>
          <p class="hero-intro" data-journal-enter>Good stories are worth staying for. The people, places, and little everyday things make Ohio feel like Ohio. I saved you a few favorites. ♡</p>
          <a class="hero-jump" href="#stories" data-journal-enter>Find your next read <span aria-hidden="true">↓</span></a>
        </div>
        <div class="hero-art" data-journal-enter>
          <img src="/ohio-chan-vtuber.webp" width="1024" height="1536" alt="Ohio-chan welcomes readers to the journal" fetchpriority="high" />
        </div>
      </div>
      <div class="hero-rule" aria-hidden="true"><span>STORIES FROM AROUND THE STATE</span><span>OHIO · USA</span></div>
    </section>

    <section class="journal-feature page-gutter" aria-labelledby="feature-title">
      <div class="section-index" data-journal-reveal><span>START HERE</span><span>LET’S MAKE A DAY OF IT</span></div>
      <RouterLink class="feature-link" :to="`/journal/${featured.slug}`" data-journal-reveal>
        <div class="journal-feature-image"><JournalCover :article="featured" priority /></div>
        <div class="journal-feature-copy">
          <span class="feature-flag">LET’S START HERE <span aria-hidden="true">✳</span></span>
          <span class="feature-category">{{ categoryFor(featured.category).label }} <span aria-hidden="true">/</span> {{ featured.location }}</span>
          <h2 id="feature-title">{{ featured.title }}</h2>
          <p>{{ featured.dek }}</p>
          <span class="feature-foot"><span>{{ featured.readTime }}</span><span class="feature-read">Read the story <span aria-hidden="true">↗</span></span></span>
        </div>
      </RouterLink>
    </section>

    <section id="stories" class="journal-index page-gutter" aria-labelledby="stories-title">
      <div class="index-heading" data-journal-reveal>
        <div><p class="kicker">WHAT CAUGHT YOUR EYE?</p><h2 id="stories-title">Pick a page.<br /><em>Stay awhile.</em></h2></div>
        <p>A place to start, a place to linger, and plenty to save for another day.</p>
      </div>

      <nav class="category-nav" aria-label="Filter journal stories">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.id"
          :to="{ path: '/journal', query: { category: tab.id === 'all' ? undefined : tab.id } }"
          :class="['category-link', { active: selectedCategory === tab.id }]"
          :aria-current="selectedCategory === tab.id ? 'page' : undefined"
        >{{ tab.label }} <span>{{ tab.count }}</span></RouterLink>
      </nav>

      <div class="index-meta"><span>{{ selectedCategory === 'all' ? 'ALL STORIES' : categoryFor(selectedCategory).eyebrow }}</span><span>{{ visibleArticles.length }} {{ visibleArticles.length === 1 ? 'STORY' : 'STORIES' }}</span></div>

      <div class="story-grid">
        <RouterLink v-for="article in visibleArticles" :key="article.slug" :to="`/journal/${article.slug}`" class="story-link">
          <JournalCover :article="article" />
          <div class="story-topline"><span>{{ storyNumber(article) }} <span aria-hidden="true">/</span> {{ categoryFor(article.category).label }}</span><span>{{ article.readTime }}</span></div>
          <h3>{{ article.title }}</h3>
          <p>{{ article.dek }}</p>
          <div class="story-bottom"><span>{{ article.location }}</span><span class="story-arrow" aria-label="Read story">↗</span></div>
        </RouterLink>
      </div>
    </section>

    <div class="journal-end page-gutter" aria-hidden="true"><span>OHIO-CHAN ♡</span><span>THERE'S ALWAYS ANOTHER STORY.</span><span>✳</span></div>
  </main>
</template>

<style scoped>
.journal-page{background:var(--paper);color:var(--navy)}
.page-gutter{padding-left:max(6%,calc((100vw - 1360px)/2));padding-right:max(6%,calc((100vw - 1360px)/2))}
.kicker,.section-index,.hero-rule,.index-meta,.story-topline,.story-bottom,.feature-category,.feature-flag,.feature-foot,.journal-end{font-family:"Space Grotesk Variable",sans-serif;font-size:11px;font-weight:600;letter-spacing:.13em;text-transform:uppercase}
.journal-hero{position:relative;overflow:hidden;background:#f5f7fb}
.hero-inner{min-height:560px;max-width:1600px;margin:auto;padding:55px max(6%,calc((100vw - 1360px)/2)) 0;display:grid;grid-template-columns:minmax(0,1.2fr) minmax(330px,.8fr);align-items:end;gap:4%;position:relative}
.journal-hero-copy{align-self:center;position:relative;z-index:2;padding-bottom:42px}
.journal-hero-copy .kicker{color:var(--navy);margin-bottom:30px;display:flex;align-items:center;gap:15px}
.journal-hero-copy .kicker span{color:var(--red)}
.journal-hero-copy h1{font-size:clamp(72px,9vw,142px);line-height:1;max-width:830px;letter-spacing:-.075em;font-weight:600}
.journal-hero-copy .title-period{color:var(--red)}
.hero-intro{max-width:490px;margin-top:28px;font-size:18px;line-height:1.65}
.hero-jump{display:inline-flex;gap:28px;align-items:center;margin-top:30px;border-bottom:1px solid currentColor;padding-bottom:8px;font-size:14px;font-weight:700}
.hero-jump span{font-size:20px;line-height:1;transition:transform .2s var(--ease)}
.hero-jump:hover span{transform:translateY(3px)}
.hero-art{position:relative;height:505px;min-width:0}
.hero-art img{position:absolute;z-index:1;bottom:-10%;left:0;height:116%;width:100%;object-fit:contain;object-position:bottom center;filter:drop-shadow(0 11px 14px #17243b18)}
.hero-rule{position:relative;z-index:3;display:flex;justify-content:space-between;padding:20px max(6%,calc((100vw - 1360px)/2));background:var(--navy);color:#fff;gap:20px}
.journal-feature{padding-top:84px;padding-bottom:100px}
.section-index{display:flex;justify-content:space-between;border-top:1px solid #aab4c2;padding-top:17px;color:#667185}
.feature-link{margin-top:30px;display:grid;grid-template-columns:minmax(0,1.43fr) minmax(300px,.75fr);background:#e9eff6;min-height:460px;border-radius:5px 70px 5px 5px;overflow:hidden}
.journal-feature-image{min-width:0;overflow:hidden}
.journal-feature-image :deep(.journal-cover){height:100%;aspect-ratio:auto}
.journal-feature-copy{padding:clamp(30px,4.3vw,72px);display:flex;flex-direction:column;align-items:flex-start;min-width:0}
.feature-flag{background:var(--red);color:#fff;padding:10px 13px;letter-spacing:.1em}
.feature-flag span{margin-left:10px}
.feature-category{display:block;margin-top:auto;color:#746e6c;line-height:1.5;padding-top:35px}
.feature-category span{padding:0 5px}
.journal-feature-copy h2{font-size:clamp(42px,4vw,69px);line-height:1.02;letter-spacing:-.07em;margin-top:16px;overflow-wrap:anywhere}
.journal-feature-copy p{font-size:17px;line-height:1.6;margin-top:20px;max-width:380px}
.feature-foot{width:100%;display:flex;justify-content:space-between;gap:15px;align-items:center;margin-top:34px;border-top:1px solid #acaaa7;padding-top:17px;color:#65636b;letter-spacing:.06em}
.feature-read{color:var(--navy);white-space:nowrap}
.feature-read span{display:inline-block;font-size:19px;line-height:0;vertical-align:-2px;margin-left:8px;transition:transform .2s var(--ease)}
.feature-link:hover .feature-read span{transform:translate(3px,-3px)}
.journal-index{padding-top:100px;padding-bottom:110px;background:var(--paper)}
.index-heading{display:flex;justify-content:space-between;align-items:end;gap:35px}
.index-heading .kicker{color:var(--red);margin-bottom:20px}
.index-heading h2{font-size:clamp(50px,5.5vw,82px)}
.index-heading h2 em{color:var(--red)}
.index-heading>p{max-width:295px;font-size:16px;line-height:1.65;color:var(--muted);padding-bottom:6px}
.category-nav{margin-top:60px;border-top:1px solid #c7cbd1;border-bottom:1px solid #c7cbd1;display:flex;align-items:stretch;gap:clamp(20px,2.6vw,43px);overflow-x:auto;scrollbar-width:thin}
.category-link{position:relative;display:flex;align-items:center;gap:8px;white-space:nowrap;padding:22px 0 21px;font-size:14px;font-weight:700;color:#727986;transition:color .2s var(--ease)}
.category-link span{font:600 10px "Space Grotesk Variable",sans-serif;color:#8b939f;align-self:flex-start;margin-top:0}
.category-link:after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--red);transform:scaleX(0);transform-origin:left;transition:transform .2s var(--ease)}
.category-link:hover,.category-link.active{color:var(--navy)}
.category-link.active:after{transform:scaleX(1)}
.index-meta{display:flex;justify-content:space-between;padding:35px 0 22px;color:#788291}
.story-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:clamp(20px,2.5vw,42px);row-gap:65px}
.story-link{min-width:0;display:flex;flex-direction:column;border-bottom:1px solid #cdd2da;padding-bottom:18px}
.story-link :deep(.journal-cover){width:100%;border-radius:5px 40px 5px 5px}
.story-topline{display:flex;justify-content:space-between;gap:10px;color:#6d7685;letter-spacing:.07em;margin-top:19px;font-size:10px}
.story-topline span span{color:var(--red);padding:0 4px}
.story-topline>span:last-child{white-space:nowrap}
.story-link h3{font-size:clamp(25px,2.3vw,35px);line-height:1.13;letter-spacing:-.05em;margin-top:15px;overflow-wrap:anywhere;transition:color .2s var(--ease)}
.story-link:hover h3{color:var(--red)}
.story-link p{font-size:15px;line-height:1.65;color:#626b7b;margin-top:12px;max-width:41ch}
.story-bottom{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-top:auto;padding-top:25px;color:#677383;letter-spacing:.06em;font-size:10px}
.story-arrow{font-size:23px;line-height:1;color:var(--navy);transition:transform .2s var(--ease)}
.story-link:hover .story-arrow{transform:translate(3px,-3px)}
.journal-end{display:flex;justify-content:space-between;gap:20px;align-items:center;padding-top:24px;padding-bottom:24px;color:#f2ece6;background:var(--navy);font-size:10px}
.journal-end span:last-child{color:#f6a7b5;font-size:21px}
@media(max-width:950px){.hero-inner{min-height:500px;grid-template-columns:minmax(0,1fr) minmax(240px,.65fr)}.hero-art{height:450px}.feature-link{grid-template-columns:1fr 1fr;min-height:420px}.journal-feature-copy{padding:32px}.story-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:650px){.hero-inner{display:block;min-height:0;padding-top:54px}.journal-hero-copy{padding-bottom:0}.journal-hero-copy .kicker{margin-bottom:25px}.journal-hero-copy h1{font-size:clamp(58px,12vw,80px)}.hero-intro{font-size:16px;margin-top:25px;max-width:440px}.hero-jump{margin-top:20px}.hero-art{height:310px;max-width:330px;margin:30px auto 0}.hero-art img{height:119%;bottom:-13%}.hero-rule span:last-child{display:none}.hero-rule{font-size:9px}.journal-feature{padding-top:52px;padding-bottom:65px}.feature-link{display:block;min-height:0;border-radius:5px 45px 5px 5px}.journal-feature-image :deep(.journal-cover){aspect-ratio:3/2}.journal-feature-copy{min-height:320px}.feature-category{margin-top:14px;padding-top:0}.journal-feature-copy h2{font-size:42px}.journal-feature-copy p{font-size:15px}.feature-foot{margin-top:auto}.journal-index{padding-top:65px;padding-bottom:75px}.index-heading{display:block}.index-heading h2{font-size:55px}.index-heading>p{margin-top:23px;max-width:390px}.category-nav{margin-top:38px;gap:24px}.category-link{font-size:13px}.story-grid{grid-template-columns:1fr;row-gap:45px}.story-link h3{font-size:29px}.journal-end span:nth-child(2){display:none}}
@media(prefers-reduced-motion:reduce){.journal-page :deep(*),.journal-page :deep(*::before),.journal-page :deep(*::after){transition:none!important;animation:none!important;scroll-behavior:auto!important}}
:global(html[data-input=keyboard]) .journal-page :deep(*),:global(html[data-input=keyboard]) .journal-page :deep(*::before),:global(html[data-input=keyboard]) .journal-page :deep(*::after){transition:none!important;animation:none!important}
</style>
