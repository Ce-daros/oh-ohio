<script setup lang="ts">
import { chapters, entries } from "../catalog";
import notes from "../data/guided-tours.json";
const invitations = chapters.map(chapter => ({
  chapter,
  ...notes[chapter.id].homeSpotlight,
  entry: entries.find(entry => entry.slug === notes[chapter.id].homeSpotlight.slug)!,
}));
</script>
<template>
  <section class="home-dispatches section-pad" aria-labelledby="dispatch-title">
    <div class="dispatch-heading" data-reveal>
      <div><p class="eyebrow">OOH, YOU’LL LIKE THIS…</p><h2 id="dispatch-title">A few stories<br />worth <em>knowing.</em></h2></div>
      <p>A little place. A big idea.<br />Someone whose story might stay with you.<br /><span>Ready? ♡</span></p>
    </div>
    <div class="dispatch-list">
      <article v-for="(item,index) in invitations" :key="item.slug" :class="['dispatch',`dispatch-${item.chapter.id}`]" data-reveal="story">
        <RouterLink :to="`/${item.chapter.id}#${item.slug}`" class="dispatch-image" :aria-label="item.entry.title">
          <img :src="`/art/scenes/${item.chapter.id}-768.webp`" width="768" height="512" loading="lazy" alt="" />
          <span>{{ item.chapter.title }} <span aria-hidden="true">↗</span></span>
        </RouterLink>
        <div class="dispatch-copy">
          <p class="dispatch-place"><span>0{{ index+1 }}</span>{{ item.entry.kicker }}</p>
          <h3>{{ item.entry.title }}</h3>
          <p class="dispatch-voice">{{ item.text }}</p>
          <RouterLink :to="`/${item.chapter.id}#${item.slug}`">Read this story <span aria-hidden="true">↗</span></RouterLink>
        </div>
      </article>
    </div>
  </section>
</template>
<style scoped>
.home-dispatches { background:#faf6ed; }
.dispatch-heading { display:flex; justify-content:space-between; align-items:flex-end; gap:40px; margin-bottom:60px; }
.dispatch-heading h2 { font-size:clamp(42px,5.5vw,78px); margin-top:15px; }
.dispatch-heading h2 em { color:var(--red); }
.dispatch-heading > p { color:#566578; line-height:1.8; font-size:17px; margin-bottom:8px; }
.dispatch-heading > p > span { display:inline-block; margin-top:10px; font:italic 25px Georgia,serif; color:#a9495a; }
.dispatch-list { display:grid; grid-template-columns:1fr 1fr; gap:65px 7%; }
.dispatch { min-width:0; }
.dispatch:nth-child(even) { padding-top:95px; }
.dispatch-image { position:relative; display:block; overflow:hidden; border-radius:100px 8px 8px 8px; aspect-ratio:1.7; }
.dispatch-image img { width:100%; height:100%; object-fit:cover; transition:transform .45s var(--ease); }
.dispatch-image:hover img { transform:scale(1.035); }
.dispatch-image > span { position:absolute; right:18px; bottom:18px; background:#fff9ed; color:var(--navy); padding:10px 17px; display:flex; gap:35px; font-size:14px; }
.dispatch-image > span > span { font-size:19px; }
.dispatch-make .dispatch-image { border-radius:8px; }.dispatch-culture .dispatch-image { border-radius:8px 100px 8px 8px; }.dispatch-live .dispatch-image { border-radius:80px 80px 8px 8px; }
.dispatch-copy { padding:25px 4px 0; }
.dispatch-place { font-size:11px; letter-spacing:.08em; color:#63738a; display:flex; gap:15px; align-items:center; line-height:1.6; }
.dispatch-place > span { color:#a74758; font-size:13px; }
.dispatch-copy h3 { font-size:clamp(28px,2.8vw,39px); line-height:1.1; letter-spacing:-.045em; margin:15px 0 20px; max-width:470px; }
.dispatch-voice { font-size:17px; line-height:1.85; color:#485a73; }
.dispatch-copy > a { display:inline-flex; gap:35px; align-items:center; padding:15px 0 9px; border-bottom:1px solid #a5a9ad; margin-top:8px; font-size:14px; font-weight:550; }
.dispatch-copy > a > span { font-size:23px; transition:transform .2s var(--ease); }.dispatch-copy > a:hover > span { transform:translate(3px,-3px); }
@media(max-width:800px) { .dispatch-heading { gap:25px; }.dispatch-heading > p { font-size:15px; }.dispatch-list { gap:40px 5%; }.dispatch:nth-child(even) { padding-top:65px; }.dispatch-voice { font-size:16px; }.dispatch-image { border-top-left-radius:65px; }.dispatch-culture .dispatch-image { border-top-left-radius:8px; border-top-right-radius:65px; } }
@media(max-width:560px) { .dispatch-heading { display:block; margin-bottom:35px; }.dispatch-heading > p { margin-top:22px; font-size:16px; }.dispatch-list { grid-template-columns:1fr; gap:45px; }.dispatch:nth-child(even) { padding-top:0; }.dispatch-copy h3 { font-size:31px; }.dispatch-image { aspect-ratio:1.55; }.dispatch-copy { padding-top:20px; } }
@media(prefers-reduced-motion:reduce) { * { transition:none!important; } }
</style>
