<script setup lang="ts">
import { computed } from "vue";
import { articles, categoryFor } from "../journal";
import type { ChapterId } from "../catalog";
import JournalCover from "./JournalCover.vue";
const props = defineProps<{ chapter?: ChapterId }>();
const selected = computed(() => props.chapter ? articles.filter(article => article.chapter === props.chapter) : [articles[0]!, articles.find(article => article.slug === "rookwood-clay")!, articles.find(article => article.slug === "library-afternoon")!]);
const labels = { explore: { title: "Let's make", emphasis: "a day of it.", kicker: "FOUR LITTLE ADVENTURES", intro: "A market morning, a day by the lake. I’ve got a few ideas." }, make: { title: "A closer look at", emphasis: "what we make.", kicker: "HOW IT'S MADE", intro: "A little clay, a piece of brass. Follow each from start to finish." }, culture: { title: "There’s a story", emphasis: "at the table.", kicker: "AROUND THE TABLE", intro: "Something sweet, a familiar order, a market full of choices. I saved you a seat." }, live: { title: "Stay for", emphasis: "the everyday.", kicker: "AN AFTERNOON IN OHIO", intro: "A library, a garden, a walk across campus. A little more time together. ♡" } };
const copy = computed(() => props.chapter ? labels[props.chapter] : { title: "A little closer", emphasis: "to Ohio.", kicker: "OHIO-CHAN’S FIELD NOTES", intro: "A day out, a maker at work, then something good to eat." });
const category = computed(() => props.chapter ? articles.find(article => article.chapter === props.chapter)!.category : undefined);
</script>
<template>
  <section class="journal-shelf" :class="{ 'chapter-shelf': chapter }" :aria-labelledby="`journal-shelf-${chapter || 'home'}`">
    <div class="shelf-heading">
      <div><p class="eyebrow">{{ copy.kicker }}</p><h2 :id="`journal-shelf-${chapter || 'home'}`">{{ copy.title }}<br /><em>{{ copy.emphasis }}</em></h2></div>
      <div><p>{{ copy.intro }}</p><RouterLink :to="{path: '/journal', query: category ? { category } : {}}">{{ chapter ? 'Read the stories' : 'All 14 field notes' }} <span>↗</span></RouterLink></div>
    </div>
    <div class="shelf-grid" :class="{ 'shelf-four': selected.length === 4 }">
      <RouterLink v-for="(article, index) in selected" :key="article.slug" :to="`/journal/${article.slug}`" class="shelf-story">
        <JournalCover :article="article" />
        <p class="shelf-meta"><span>{{ String(index + 1).padStart(2,'0') }} / {{ categoryFor(article.category).label }}</span><span>{{ article.readTime }}</span></p>
        <h3>{{ article.title }}</h3><p class="shelf-dek">{{ article.dek }}</p><span class="shelf-arrow" aria-hidden="true">↗</span>
      </RouterLink>
    </div>
  </section>
</template>
<style scoped>
.journal-shelf{padding:90px max(6vw,24px) 95px;background:var(--paper);color:var(--navy)}.shelf-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:40px;max-width:1280px;margin:0 auto 45px}.shelf-heading h2{font-size:clamp(40px,4.5vw,64px);margin-top:18px}.shelf-heading h2 em{color:var(--red)}.shelf-heading>div:last-child{max-width:320px}.shelf-heading>div:last-child>p{font-size:15px;line-height:1.8;color:#5d6876;margin-bottom:20px}.shelf-heading a{display:inline-flex;gap:30px;border-bottom:1px solid #a5a9a4;font-size:12px;padding-bottom:8px}.shelf-heading a>span{font-size:16px}.shelf-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:35px;max-width:1280px;margin:auto}.shelf-four{grid-template-columns:repeat(4,minmax(0,1fr));gap:25px}.shelf-story{min-width:0}.shelf-story :deep(.journal-cover){border-radius:70px 4px 4px 4px;aspect-ratio:3/2}.shelf-story:nth-child(even) :deep(.journal-cover){border-radius:4px 70px 4px 4px}.shelf-meta{display:flex;justify-content:space-between;gap:8px;font-size:9px;letter-spacing:.015em;color:#64717b;margin:22px 0 13px;line-height:1.6}.shelf-meta>span:last-child{white-space:nowrap}.shelf-story h3{font-size:clamp(23px,2.25vw,32px);line-height:1.15;letter-spacing:-.045em;max-width:370px}.shelf-dek{font-size:14px;line-height:1.8;color:#65717b;margin-top:15px}.shelf-arrow{display:inline-block;font-size:25px;margin-top:15px;transition:transform .2s var(--ease)}.shelf-story:hover .shelf-arrow{transform:translate(3px,-3px)}.chapter-shelf{border-top:1px solid var(--line)}.shelf-four .shelf-story h3{font-size:26px}.shelf-four .shelf-meta{flex-wrap:wrap}
@media(max-width:1050px){.shelf-four{grid-template-columns:1fr 1fr;gap:40px 30px}}
@media(max-width:760px){.journal-shelf{padding:55px 25px 65px}.shelf-heading{display:block;margin-bottom:35px}.shelf-heading>div:last-child{margin-top:25px;max-width:450px}.shelf-heading>div:last-child>p{margin-bottom:16px}.shelf-grid{grid-template-columns:1fr 1fr;gap:35px 23px}.shelf-story h3{font-size:25px}.shelf-meta{flex-wrap:wrap}.shelf-dek{font-size:13px}.shelf-story:last-child:nth-child(odd){grid-column:1 / -1;max-width:calc(50% - 12px)}}
@media(max-width:480px){.shelf-heading h2{font-size:41px}.shelf-grid{grid-template-columns:1fr;gap:38px}.shelf-story:last-child:nth-child(odd){grid-column:auto;max-width:none}.shelf-story :deep(.journal-cover){aspect-ratio:3/2}.shelf-story h3,.shelf-four .shelf-story h3{font-size:28px}.shelf-meta{margin-top:19px}.shelf-dek{font-size:14px}.shelf-arrow{margin-top:10px}}
@media(prefers-reduced-motion:reduce){.shelf-arrow{transition:none;transform:none!important}}
:global(html[data-input=keyboard]) .shelf-arrow{transition:none;transform:none}
</style>
