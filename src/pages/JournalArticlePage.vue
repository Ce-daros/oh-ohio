<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { articleBySlug, categoryFor } from "../journal";
import JournalCover from "../components/JournalCover.vue";
import { useJournalMotion } from "../composables/useJournalMotion";

const props = defineProps<{ slug: string }>();
const article = computed(() => articleBySlug(props.slug));
const titleLead = computed(() => article.value.title.slice(0, -article.value.titleAccent.length));
const category = computed(() => categoryFor(article.value.category));
const related = computed(() => article.value.related.map(articleBySlug));
const root = ref<HTMLElement | null>(null);
const story = ref<HTMLElement | null>(null);
const activeSection = ref(article.value.sections[0]!.id);
const progress = ref(0);
const character = computed(() => ({ guides: "travel", making: "industry", table: "culture", everyday: "life" })[article.value.category]);
let frame = 0;

function measureReading() {
  const top = story.value!.getBoundingClientRect().top;
  progress.value = Math.min(1, Math.max(0, (window.innerHeight * .25 - top) / (story.value!.offsetHeight - window.innerHeight * .5)));
  const passed = article.value.sections.filter(section => document.getElementById(section.id)!.getBoundingClientRect().top <= window.innerHeight * .35);
  activeSection.value = passed.length ? passed[passed.length - 1]!.id : article.value.sections[0]!.id;
  frame = 0;
}
function scheduleReading() {
  if (!frame) frame = requestAnimationFrame(measureReading);
}
onMounted(() => {
  measureReading();
  window.addEventListener("scroll", scheduleReading, { passive: true });
  window.addEventListener("resize", scheduleReading);
});
onUnmounted(() => {
  window.removeEventListener("scroll", scheduleReading);
  window.removeEventListener("resize", scheduleReading);
  cancelAnimationFrame(frame);
});
useJournalMotion(root);
</script>

<template>
  <main id="main-content" ref="root" tabindex="-1" class="journal-article-page" :style="{ '--article-color': category.color, '--article-ink': category.ink }">
    <div class="reading-progress" aria-hidden="true"><span :style="{ transform: `scaleX(${progress})` }"></span></div>
    <header class="article-masthead">
      <nav class="article-breadcrumb" aria-label="Breadcrumb" data-journal-enter>
        <RouterLink to="/journal">Field notes</RouterLink><span aria-hidden="true">/</span><RouterLink :to="{ path: '/journal', query: { category: article.category } }">{{ category.label }}</RouterLink>
      </nav>
      <div class="article-hero-grid">
        <div class="article-heading">
          <p class="article-kicker" data-journal-enter><span></span>{{ category.eyebrow }}</p>
          <h1 data-journal-enter>{{ titleLead }}<em>{{ article.titleAccent }}</em><span class="article-heart" aria-hidden="true"> ♡</span></h1>
          <p class="article-dek" data-journal-enter>{{ article.dek }}</p>
          <div class="article-byline" data-journal-enter><img :src="`/art/small/prop-${category.prop}.webp`" alt="" width="64" height="64" /><div><span>WITH OHIO-CHAN ♡</span><span>{{ article.readTime }}<span class="byline-dot">·</span>{{ article.duration }}</span></div></div>
        </div>
        <figure class="article-hero-art" data-journal-enter>
          <JournalCover :article="article" priority />
          <figcaption><span>{{ article.location }}</span><span>{{ category.label }}</span></figcaption>
        </figure>
      </div>
    </header>

    <div class="article-layout">
      <aside class="article-sidebar">
        <div class="article-sidebar-inner">
          <p class="sidebar-label">{{ article.category === 'guides' ? 'ALONG THE WAY' : 'IN THIS STORY' }}</p>
          <nav aria-label="Article sections">
            <a v-for="(section, index) in article.sections" :key="section.id" :href="`#${section.id}`" :class="{ current: activeSection === section.id }" :aria-current="activeSection === section.id ? 'location' : undefined"><span>{{ String(index + 1).padStart(2, '0') }}</span><span>{{ section.title }}</span></a>
          </nav>
          <a class="sidebar-source-link" href="#reading-sources">Reading &amp; sources <span>↗</span></a>
          <img :src="`/art/small/prop-${category.prop}.webp`" width="150" height="150" alt="" loading="lazy" />
          <p class="sidebar-signature">Take your time.<br />I’m right here. ♡</p>
        </div>
      </aside>

      <article ref="story" class="article-prose">
        <p class="article-intro">{{ article.intro }}</p>
        <template v-for="(section, index) in article.sections" :key="section.id">
          <section :id="section.id" class="prose-section">
            <div class="section-ordinal" aria-hidden="true"><span>{{ String(index + 1).padStart(2, '0') }}</span><i></i><span>{{ section.eyebrow }}</span></div>
            <h2>{{ section.title }}</h2>
            <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
          </section>
          <aside v-if="index === 1" class="chan-margin-note" data-journal-reveal>
            <div><span>A NOTE FROM OHIO-CHAN</span><h3>{{ article.aside.title }}</h3><p>{{ article.aside.text }}</p></div>
            <img :src="`/art/characters/${character}-480.webp`" width="480" height="720" alt="Ohio-chan" loading="lazy" />
          </aside>
        </template>
        <section class="article-practical" aria-labelledby="practical-title">
          <p class="article-kicker">A FEW THINGS TO KNOW</p>
          <h2 id="practical-title">{{ article.category === 'guides' ? 'Before we go.' : 'A little closer.' }}</h2>
          <dl><div v-for="item in article.practical" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.text }}</dd></div></dl>
        </section>
        <div class="article-signoff"><img src="/art/small/prop-carnation.webp" width="80" height="80" alt="" loading="lazy" /><p>{{ article.signoff }}</p><span>OHIO-CHAN ♡</span></div>
        <section id="reading-sources" class="article-sources" aria-labelledby="source-title">
          <h2 id="source-title">Reading &amp; sources</h2>
          <ul><li v-for="(source, index) in article.sources" :key="source.url"><span class="source-ordinal">{{ String(index + 1).padStart(2, '0') }}</span><a :href="source.url" target="_blank" rel="noopener noreferrer"><span>{{ source.label }}</span><small>{{ source.kind }}</small></a><span aria-hidden="true">↗</span></li></ul>
        </section>
      </article>
    </div>

    <section class="article-related" aria-labelledby="related-title">
      <div class="related-heading"><div><p class="article-kicker">ONE MORE STORY?</p><h2 id="related-title">Where to <em>next?</em></h2></div><RouterLink to="/journal">All field notes <span>↗</span></RouterLink></div>
      <div class="related-grid">
        <RouterLink v-for="item in related" :key="item.slug" :to="`/journal/${item.slug}`" class="related-story">
          <JournalCover :article="item" />
          <div><p>{{ categoryFor(item.category).label }}<span>·</span>{{ item.readTime }}</p><h3>{{ item.title }}</h3><span class="related-arrow" aria-hidden="true">↗</span></div>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.journal-article-page{background:var(--paper);--article-ink:#345c68}
.reading-progress{position:fixed;top:88px;left:0;right:0;height:3px;z-index:45;pointer-events:none}.reading-progress span{display:block;height:100%;background:var(--red);transform-origin:left}
.article-masthead{padding:36px max(6vw,24px) 70px;max-width:1600px;margin:auto}
.article-breadcrumb{display:flex;gap:13px;align-items:center;font-size:12px;color:#64717b;margin-bottom:48px}.article-breadcrumb a{padding:5px 0}.article-breadcrumb a:hover{text-decoration:underline;text-underline-offset:5px}
.article-hero-grid{display:grid;grid-template-columns:1fr 1.05fr;gap:6%;align-items:center}
.article-heading{padding-bottom:15px;min-width:0}.article-kicker{font-size:10px;font-weight:650;letter-spacing:.16em;display:flex;align-items:center;gap:10px;color:var(--article-ink)}.article-kicker>span{display:inline-block;width:7px;height:7px;background:currentColor;border-radius:50%}
.article-heading h1{font-size:clamp(43px,4.9vw,76px);line-height:1.04;letter-spacing:-.065em;margin:23px 0 26px;text-wrap:balance}.article-heading h1 em{color:var(--red)}.article-heart{font:32px Georgia,serif;color:var(--red);white-space:nowrap}.article-dek{font-size:18px;line-height:1.75;max-width:580px;color:#596474}
.article-byline{display:flex;align-items:center;gap:13px;margin-top:31px}.article-byline img{width:60px;height:60px;object-fit:contain;transform:rotate(-8deg)}.article-byline>div{display:grid;gap:7px}.article-byline>div>span:first-child{font-size:9px;letter-spacing:.15em;font-weight:650}.article-byline>div>span:last-child{font-size:11px;color:#68717a}.byline-dot{margin:0 10px}
.article-hero-art{min-width:0}.article-hero-art :deep(.journal-cover){aspect-ratio:3/2;border-radius:65px 8px 8px 8px}.article-hero-art figcaption{display:flex;justify-content:space-between;gap:15px;padding:16px 4px;font-size:9px;letter-spacing:.07em;color:#68717a}.article-hero-art figcaption span:last-child{white-space:nowrap}
.article-layout{max-width:1180px;margin:0 auto;padding:64px 40px 100px;display:grid;grid-template-columns:220px minmax(0,710px);gap:9%;border-top:1px solid var(--line)}
.article-sidebar-inner{position:sticky;top:120px}.sidebar-label{font-size:9px;letter-spacing:.14em;margin-bottom:23px;color:#68717a}.article-sidebar nav{display:grid}.article-sidebar nav a{display:flex;align-items:baseline;gap:12px;padding:11px 10px 11px 0;font-size:12px;line-height:1.6;border-bottom:1px solid var(--line);color:#7b7d7c}.article-sidebar nav a>span:first-child{font-size:9px;color:#6f7573;flex:none}.article-sidebar nav a.current{color:var(--article-ink);font-weight:650}.article-sidebar nav a.current>span:first-child{color:var(--article-ink)}.sidebar-source-link{display:flex;justify-content:space-between;font-size:10px;padding:22px 0;color:#677078}.article-sidebar-inner>img{margin:25px auto 10px;width:96px;height:96px;object-fit:contain;transform:rotate(-9deg)}.sidebar-signature{font:italic 20px/1.4 Georgia,serif;text-align:center;color:var(--article-ink)}
.article-prose{min-width:0}.article-intro{font-size:21px;line-height:1.9;color:#35495b;margin-bottom:63px}
.prose-section{scroll-margin-top:115px;margin-bottom:58px}.section-ordinal{display:flex;align-items:center;gap:14px;color:var(--article-ink);margin-bottom:20px}.section-ordinal>span:first-child{font:italic 21px Georgia,serif}.section-ordinal i{width:35px;height:1px;background:currentColor;opacity:.4}.section-ordinal>span:last-child{font-size:9px;letter-spacing:.14em;text-transform:uppercase}.prose-section h2{font-size:clamp(29px,2.9vw,41px);line-height:1.15;letter-spacing:-.04em;margin:0 0 25px;text-wrap:balance}.prose-section>p{font-size:17px;line-height:1.95;color:#495767;margin-top:21px}
.chan-margin-note{display:grid;grid-template-columns:1fr 160px;position:relative;background:var(--article-color);border-radius:3px 45px 3px 3px;margin:62px -20px;padding:32px 28px 32px 34px;gap:10px;overflow:hidden}.chan-margin-note>div{position:relative;z-index:1}.chan-margin-note>div>span{font-size:8px;letter-spacing:.14em;color:var(--article-ink)}.chan-margin-note h3{font:italic 28px/1.2 Georgia,serif;margin:14px 0;color:var(--article-ink)}.chan-margin-note p{font-size:14px;line-height:1.8;color:#465768}.chan-margin-note>img{position:absolute;right:-14px;bottom:-70px;width:190px;height:290px;object-fit:contain;transform:rotate(5deg)}
.article-practical{padding:32px;background:#eaf0f6;border-radius:5px 35px 5px 5px;margin-top:12px}.article-practical h2{font:italic 34px/1.2 Georgia,serif;margin:14px 0 26px;letter-spacing:-.04em}.article-practical dl{margin:0}.article-practical dl>div{display:grid;grid-template-columns:110px 1fr;gap:20px;padding:17px 0;border-top:1px solid #d3dce6}.article-practical dt{font-size:12px;font-weight:650}.article-practical dd{font-size:14px;line-height:1.8;color:#58616a;margin:0}
.article-signoff{padding:62px 24px 56px;text-align:center}.article-signoff img{width:70px;height:70px;object-fit:contain;margin:auto}.article-signoff p{font:italic 24px/1.5 Georgia,serif;margin:18px auto;color:var(--article-ink);max-width:550px}.article-signoff>span{font-size:9px;letter-spacing:.17em}
.article-sources{scroll-margin-top:120px}.article-sources h2{font-size:21px;letter-spacing:-.025em;margin-bottom:22px}.article-sources ul{list-style:none;padding:0;margin:0}.article-sources li{display:flex;gap:17px;align-items:baseline;border-top:1px solid var(--line);padding:16px 0}.source-ordinal{font-size:9px;color:#798078}.article-sources li>a{flex:1;min-width:0;font-size:12px;line-height:1.6}.article-sources li>a:hover>span{text-decoration:underline;text-underline-offset:3px}.article-sources li>a>small{display:block;font-size:9px;color:#788078;margin-top:4px}.article-sources li>span:last-child{font-size:15px}
.article-related{background:#eaf0f6;padding:75px max(6vw,24px) 90px}.related-heading{max-width:1260px;margin:0 auto 40px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px}.related-heading h2{font-size:clamp(35px,4vw,55px);margin-top:15px}.related-heading h2 em{color:var(--red)}.related-heading>a{display:flex;gap:25px;font-size:12px;padding-bottom:7px;border-bottom:1px solid #9caaa5;white-space:nowrap}.related-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;max-width:1260px;margin:auto}.related-story{display:grid;grid-template-columns:43% 1fr;gap:25px;align-items:center}.related-story :deep(.journal-cover){aspect-ratio:1;border-radius:45px 3px 3px 3px}.related-story>div>p{font-size:9px;color:#6f7778;line-height:1.6}.related-story>div>p span{margin:0 8px}.related-story h3{font-size:25px;letter-spacing:-.04em;line-height:1.2;margin:14px 0}.related-arrow{font-size:23px;display:inline-block;transition:transform .2s var(--ease)}.related-story:hover .related-arrow{transform:translate(3px,-3px)}
@media(min-width:1500px){.article-masthead{padding-left:90px;padding-right:90px}}
@media(max-width:1000px){.article-layout{gap:6%;grid-template-columns:170px minmax(0,1fr);padding-left:30px;padding-right:30px}.article-heading h1{font-size:47px}.article-dek{font-size:16px}.article-hero-grid{gap:5%}.related-story{gap:18px}.related-story h3{font-size:21px}.related-grid{gap:25px}.related-story>div>p span{margin:0 4px}}
@media(max-width:760px){.article-masthead{padding:30px 25px 35px}.article-breadcrumb{margin-bottom:30px}.article-hero-grid{grid-template-columns:1fr;gap:30px}.article-heading h1{font-size:clamp(40px,7.5vw,62px);max-width:650px;margin:20px 0}.article-heading{padding:0}.article-dek{font-size:17px}.article-byline{margin-top:22px}.article-hero-art{max-width:640px;width:100%;margin:auto}.article-hero-art :deep(.journal-cover){aspect-ratio:3/2;border-top-left-radius:55px}.article-layout{padding:25px 25px 65px;display:block}.article-sidebar-inner{position:static}.article-sidebar nav{grid-template-columns:1fr 1fr;gap:0 20px}.article-sidebar-inner>img,.sidebar-signature{display:none}.sidebar-label{margin:0 0 10px}.sidebar-source-link{padding:17px 0 30px;justify-content:flex-start;gap:25px}.article-intro{font-size:20px;margin:12px 0 44px}.prose-section{margin-bottom:43px}.prose-section h2{font-size:31px}.prose-section>p{font-size:16px;line-height:1.9}.chan-margin-note{margin:40px 0;padding:27px;grid-template-columns:1fr 125px}.chan-margin-note>img{width:160px;right:-18px;bottom:-75px}.related-heading{display:block}.related-heading>a{display:inline-flex;margin-top:22px}.related-grid{grid-template-columns:1fr;gap:30px}.related-story{grid-template-columns:38% 1fr;gap:25px}.related-story h3{font-size:27px}.article-related{padding:50px 25px 60px}}
@media(max-width:560px){.reading-progress{top:72px}}
@media(max-width:420px){.article-masthead{padding-left:20px;padding-right:20px}.article-heading h1{font-size:40px}.article-layout{padding-left:20px;padding-right:20px}.article-sidebar nav{gap:0 12px}.article-sidebar nav a{font-size:11px;gap:8px}.article-practical{padding:25px}.article-practical dl>div{grid-template-columns:1fr;gap:7px}.chan-margin-note{padding:24px;grid-template-columns:1fr 80px}.chan-margin-note>img{width:135px;right:-30px;bottom:-80px}.chan-margin-note h3{font-size:25px}.article-hero-art figcaption{font-size:8px}.related-story h3{font-size:23px}.related-story{gap:18px}.related-story>div>p{font-size:8px}}
@media(prefers-reduced-motion:reduce){.related-arrow{transition:none;transform:none!important}}
:global(html[data-input=keyboard]) .related-arrow{transition:none;transform:none}
@media print{.reading-progress,.article-sidebar,.article-related{display:none}.article-masthead{padding-top:30px}.article-layout{display:block;padding:30px}.article-prose{max-width:none}.article-hero-art{max-width:300px}.article-sources a{overflow-wrap:anywhere}.chan-margin-note{break-inside:avoid}}
</style>
