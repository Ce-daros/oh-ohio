<script setup lang="ts">
import { computed, ref } from "vue";
import { entries, type ChapterId, type CharacterId } from "../catalog";
import guideNotes from "../data/guided-tours.json";
import CharacterArt from "./CharacterArt.vue";
const props = defineProps<{ chapterId: ChapterId }>();
defineEmits<{ read: [slug: string] }>();
const selected = ref(0);
const notes = computed(() => guideNotes[props.chapterId]);
const journey = computed(() => notes.value.journeys[selected.value]!);
const stops = computed(() => journey.value.stops.map(stop => ({ ...stop, entry: entries.find(entry => entry.slug === stop.slug)! })));
const portraits: Record<ChapterId, CharacterId> = { explore: "discover", make: "economy", culture: "language", live: "government" };
function switchWithKeys(event: KeyboardEvent) {
  const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
  if (!keys.includes(event.key)) return;
  event.preventDefault();
  selected.value = event.key === "Home" ? 0 : event.key === "End" ? notes.value.journeys.length - 1 : (selected.value + (event.key === "ArrowRight" ? 1 : -1) + notes.value.journeys.length) % notes.value.journeys.length;
  document.getElementById(`journey-tab-${props.chapterId}-${selected.value}`)!.focus();
}
</script>
<template>
  <section :class="['guided-journeys', `journeys-${chapterId}`]" aria-labelledby="journey-heading">
    <div class="guide-invitation" data-reveal>
      <div class="invitation-portrait"><CharacterArt :chapter="portraits[chapterId]" alt="Ohio-chan has a few places to show you" sizes="(max-width: 560px) 45vw, 240px" /><span>Ohio-chan <span aria-hidden="true">♡</span></span></div>
      <div><p class="eyebrow">COME ALONG WITH ME ♡</p><h2 id="journey-heading">Ooh, I know a few<br /><em>places to start.</em></h2><p class="guide-welcome">{{ notes.welcome }}</p></div>
    </div>
    <div class="journey-selector" role="tablist" aria-label="Ohio-chan’s guided stories" @keydown="switchWithKeys">
      <button v-for="(item,index) in notes.journeys" :id="`journey-tab-${chapterId}-${index}`" :key="item.title" role="tab" :aria-selected="selected===index" :aria-controls="`journey-panel-${chapterId}`" :tabindex="selected===index ? 0 : -1" @click="selected=index"><span>0{{ index+1 }}</span>{{ item.title }}<span class="journey-tab-arrow" aria-hidden="true">↗</span></button>
    </div>
    <div :id="`journey-panel-${chapterId}`" class="journey-panel" role="tabpanel" :aria-labelledby="`journey-tab-${chapterId}-${selected}`" tabindex="0">
    <Transition name="journey" mode="out-in">
      <div :key="selected" class="journey-content">
        <p class="journey-intro">{{ journey.intro }}</p>
        <ol class="journey-stops">
          <li v-for="(stop,index) in stops" :key="stop.slug"><span class="stop-number" aria-hidden="true">{{ index+1 }}</span><div><p class="stop-place">{{ stop.entry.kicker }}</p><h3>{{ stop.entry.title }}</h3><p class="stop-voice">{{ stop.note }}</p><button @click="$emit('read',stop.slug)">Come see! <span aria-hidden="true">↗</span></button></div></li>
        </ol>
      </div>
    </Transition>
    </div>
  </section>
</template>
<style scoped>
.guided-journeys { margin:80px auto 55px; padding:0 6%; max-width:1450px; }
.guide-invitation { display:grid; grid-template-columns:250px 1fr; gap:50px; align-items:center; max-width:1040px; margin:0 auto 50px; }
.invitation-portrait { position:relative; height:330px; }
.invitation-portrait img { width:100%; height:100%; object-fit:contain; }
.invitation-portrait > span { position:absolute; left:20px; bottom:5px; background:#fffdf8; padding:9px 20px; font:italic 23px Georgia,serif; color:#8d3e52; transform:rotate(-6deg); }
.guide-invitation h2 { font-size:clamp(35px,4.2vw,58px); margin:15px 0 22px; }
.guide-invitation h2 em { color:var(--red); }
.guide-welcome { font-size:17px; line-height:1.85; color:#455a72; }
.journey-selector { display:grid; grid-template-columns:1fr 1fr; gap:12px; border-bottom:1px solid #b9c7d7; padding-bottom:15px; }
.journey-selector button { background:transparent; color:var(--navy); border:1px solid transparent; text-align:left; padding:18px 20px; border-radius:4px; display:flex; gap:18px; align-items:center; font-size:17px; font-weight:550; line-height:1.4; transition:background .2s var(--ease),transform .25s var(--ease); }
.journey-selector button > span:first-child { font-size:12px; color:#687990; letter-spacing:.1em; }
.journey-selector button[aria-selected=true] { background:var(--navy); color:#fff; }
.journey-selector button[aria-selected=true] > span:first-child { color:#e9b6c1; }
.journey-tab-arrow { margin-left:auto; font-size:23px; }
.journey-selector button:not([aria-selected=true]):hover { background:#18243c09; transform:translateY(-2px); }
.journey-intro { max-width:920px; margin:30px auto 35px; font-size:17px; line-height:1.85; color:#52657b; }
.journey-stops { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:30px; }
.journey-stops li { position:relative; padding-top:8px; }
.journey-stops li::before { content:''; position:absolute; top:26px; left:48px; width:calc(100% - 30px); height:1px; background:#b9c7d7; }
.journey-stops li:last-child::before { display:none; }
.stop-number { width:38px; height:38px; border:1px solid #b9c7d7; background:var(--world-color); border-radius:50%; display:grid; place-items:center; font:500 19px 'Space Grotesk Variable',sans-serif; margin-bottom:22px; }
.stop-place { font-size:11px; letter-spacing:.08em; color:#647389; }
.journey-stops h3 { font-size:27px; letter-spacing:-.04em; line-height:1.15; margin:12px 0; }
.stop-voice { font-size:16px; line-height:1.8; color:#485c74; }
.journey-stops button { border:0; border-bottom:1px solid #9aaaba; background:transparent; padding:14px 0 9px; display:flex; align-items:center; justify-content:space-between; gap:20px; color:var(--navy); font-size:14px; font-weight:600; margin-top:15px; width:100%; }
.journey-stops button span { font-size:22px; transition:transform .2s var(--ease); }.journey-stops button:hover span { transform:translate(3px,-3px); }
.journeys-make .stop-number { border-radius:4px; background:#263b5b; color:#edf3fb; }
.journeys-culture .journey-stops li:nth-child(2) { padding-top:30px; }.journeys-culture .stop-number { background:#eed09a; border-color:#d1b17b; }
.journeys-live .stop-number { background:#c4dbc9; }
.journey-enter-active { transition:opacity .28s var(--ease),transform .28s var(--ease); }.journey-leave-active { transition:opacity .12s var(--ease); }.journey-enter-from { opacity:0; transform:translateY(8px); }.journey-leave-to { opacity:0; }
@media(max-width:800px) { .guide-invitation { grid-template-columns:190px 1fr; gap:25px; }.invitation-portrait { height:280px; }.guide-welcome,.journey-intro { font-size:16px; }.journey-stops { gap:20px; }.journey-stops h3 { font-size:24px; }.journey-selector button { font-size:15px; padding:15px 12px; gap:10px; } }
@media(max-width:560px) {
  .guided-journeys { margin:55px auto 35px; }.guide-invitation { grid-template-columns:1fr; gap:20px; margin-bottom:30px; }.invitation-portrait { width:55%; height:235px; margin:auto; }.invitation-portrait > span { font-size:20px; left:0; white-space:nowrap; }.guide-invitation h2 { font-size:39px; }
  .journey-selector { grid-template-columns:1fr; gap:5px; }.journey-selector button { min-height:60px; font-size:16px; }.journey-intro { margin:23px 0; }
  .journey-stops { grid-template-columns:1fr; gap:25px; }.journey-stops li,.journeys-culture .journey-stops li:nth-child(2) { display:grid; grid-template-columns:38px 1fr; gap:16px; padding:0; }.journey-stops li::before { left:18px; top:48px; width:1px; height:calc(100% - 30px); }.journey-stops h3 { font-size:27px; }.stop-place { font-size:11px; }.journey-stops button { width:auto; min-width:170px; }
}
@media(prefers-reduced-motion:reduce) { * { transition:none!important; } }
</style>
