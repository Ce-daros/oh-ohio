<script setup lang="ts">
import { computed, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getContent, getWorld, type WorldId } from "../../content";
import { journeys } from "../../content/registries";
import CharacterArt from "../CharacterArt.vue";
const props = defineProps<{ worldId: WorldId }>();
const route = useRoute();
const router = useRouter();
const choices = computed(() => journeys.filter(item => item.world === props.worldId));
const journey = computed(() => choices.value.find(item => item.id === route.query.journey) ?? choices.value[0]!);
const stops = computed(() => journey.value.stops.map(stop => ({ ...stop, content:getContent(stop.contentId) })));
async function select(id:string, replace=false) {
  await router[replace ? 'replace' : 'push']({query:{...route.query,journey:id},hash:''});
}
async function switchWithKeys(event:KeyboardEvent) {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const current = choices.value.indexOf(journey.value);
  const index = event.key === 'Home' ? 0 : event.key === 'End' ? choices.value.length-1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + choices.value.length) % choices.value.length;
  const target = choices.value[index]!;
  await select(target.id,true);
  await nextTick();
  document.getElementById(`journey-tab-${target.id}`)!.focus();
}
</script>
<template>
  <section :class="['guided-journeys',`journeys-${worldId}`]" aria-labelledby="journey-heading">
    <header class="journeys-header"><div><p class="eyebrow">A READING JOURNEY</p><h2 id="journey-heading">One story leads<br />to <em>another.</em></h2></div><CharacterArt :character="getWorld(worldId).portrait" alt="Ohio-chan with a few reading suggestions" sizes="180px" /></header>
    <div class="journey-selector" role="tablist" aria-label="Reading journeys" @keydown="switchWithKeys"><button v-for="(item,index) in choices" :id="`journey-tab-${item.id}`" :key="item.id" role="tab" :aria-selected="journey.id === item.id" :aria-controls="`journey-panel-${worldId}`" :tabindex="journey.id === item.id ? 0 : -1" @click="select(item.id)"><span>{{ String(index+1).padStart(2,'0') }}</span>{{ item.title }}<span aria-hidden="true">↗</span></button></div>
    <div :id="`journey-panel-${worldId}`" class="journey-panel" role="tabpanel" :aria-labelledby="`journey-tab-${journey.id}`" tabindex="0"><p class="journey-intro">{{ journey.intro }}</p><ol class="journey-stops"><li v-for="(stop,index) in stops" :key="stop.contentId"><span class="stop-number">{{ index+1 }}</span><div><p class="stop-world">{{ stop.content.primaryWorld }} / {{ stop.content.kind === 'feature' ? 'Field note' : 'Guide note' }}</p><h3>{{ stop.content.title }}</h3><p class="stop-voice">{{ stop.note }}</p><RouterLink :to="stop.content.canonicalPath">Read this story <span aria-hidden="true">↗</span></RouterLink></div></li></ol></div>
  </section>
</template>
<style scoped>
.guided-journeys{padding:50px var(--page-gutter) 75px;max-width:var(--page-width);margin:auto}.journeys-header{display:flex;justify-content:space-between;gap:30px;align-items:center;margin-bottom:30px;max-width:850px}.journeys-header h2{font-size:clamp(37px,4.5vw,59px);line-height:1.07;margin-top:16px}.journeys-header h2 em{color:var(--accent)}.journeys-header img{height:190px;width:160px;object-fit:contain}.journey-selector{display:grid;grid-template-columns:1fr 1fr;gap:15px;padding-bottom:15px;border-bottom:1px solid var(--rule)}.journey-selector button{background:transparent;border:0;text-align:left;display:flex;gap:18px;align-items:center;min-height:65px;padding:16px 22px;color:var(--ink);font:550 17px/1.5 var(--font-body)}.journey-selector button>span:first-child{font-size:13px;color:var(--ink-muted)}.journey-selector button>span:last-child{margin-left:auto;font-size:22px}.journey-selector button[aria-selected=true]{background:var(--ink);color:white}.journey-selector button[aria-selected=true]>span:first-child{color:#edafbb}.journey-intro{max-width:920px;margin:28px 0 35px;color:var(--ink-soft);font-size:17px;line-height:1.8}.journey-stops{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));list-style:none;gap:35px;padding:0;margin:0}.stop-number{display:grid;place-items:center;width:38px;height:38px;border:1px solid var(--rule);border-radius:50%;font:500 19px var(--font-heading);margin-bottom:20px}.stop-world{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-muted)}.journey-stops h3{font-size:27px;letter-spacing:-.04em;line-height:1.16;margin:12px 0}.stop-voice{font-size:16px;line-height:1.8;color:var(--ink-soft)}.journey-stops a{display:flex;justify-content:space-between;border-bottom:1px solid var(--rule);padding:12px 0;margin-top:18px;gap:15px;font-size:14px;min-height:44px}.journey-stops a:hover{color:var(--accent)}.journeys-make .stop-number{border-radius:3px;background:var(--ink);color:white}.journeys-culture .stop-number{background:#eed09a}.journeys-live .stop-number{background:#c4dbc9}
@media(max-width:760px){.journey-selector button{font-size:16px;padding:14px;gap:12px}.journey-stops{gap:23px}.journey-stops h3{font-size:24px}}
@media(max-width:560px){.guided-journeys{padding-block:30px 50px}.journeys-header{gap:15px}.journeys-header h2{font-size:38px}.journeys-header img{height:160px;width:90px;object-fit:cover;object-position:top}.journey-selector{grid-template-columns:1fr;gap:5px}.journey-selector button{font-size:16px;min-height:62px}.journey-stops{grid-template-columns:1fr;gap:30px}.journey-stops li{display:grid;grid-template-columns:38px minmax(0,1fr);gap:18px}.journey-stops h3{font-size:27px}}
</style>
