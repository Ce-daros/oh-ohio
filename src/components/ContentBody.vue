<script setup lang="ts">
import { computed } from "vue";
import { getWorld, getMedia, getSource, type BodyBlock, type WorldId } from "../content";
import PlaceMap from './PlaceMap.vue';
import CharacterArt from './CharacterArt.vue';
const props = defineProps<{ blocks: readonly Readonly<BodyBlock>[]; world: WorldId }>();
const asideCharacter = computed(() => getWorld(props.world).art);
</script>
<template>
  <div class="content-prose">
    <div v-for="(block, index) in blocks" :key="index" class="prose-block">
      <p v-if="block.type === 'paragraph'" :class="block.role">{{ block.text }}</p>
      <PlaceMap v-else-if="block.type === 'placeMap'" :title="block.title" :place-ids="block.placeIds" :caption="block.caption" />
      <header v-else-if="block.type === 'heading'" :id="block.id" class="prose-heading"><p class="eyebrow">{{ block.eyebrow }}</p><h2>{{ block.title }}</h2></header>
      <figure v-else-if="block.type === 'illustration'"><img :src="getMedia(block.mediaId).src" :alt="getMedia(block.mediaId).alt" loading="lazy" /><figcaption>{{ block.caption }}</figcaption></figure>
      <section v-else-if="block.type === 'process'" class="process" :class="{'process-parallel':block.layout === 'parallel'}"><h3>{{ block.title }}</h3><component :is="block.layout === 'parallel' ? 'ul' : 'ol'"><li v-for="(step, position) in block.steps" :key="step.title"><span aria-hidden="true">{{ String(position + 1).padStart(2, '0') }}</span><div><h4>{{ step.title }}</h4><p>{{ step.text }}</p></div></li></component></section>
      <blockquote v-else-if="block.type === 'quote'"><p>{{ block.text }}</p><cite>{{ block.attribution }}</cite><a v-if="block.sourceId" :href="getSource(block.sourceId).url">Source ↗</a></blockquote>
      <ol v-else-if="block.type === 'timeline'" class="timeline"><li v-for="event in block.events" :key="event.label"><strong>{{ event.label }}</strong><p>{{ event.text }}</p></li></ol>
      <dl v-else-if="block.type === 'practical'" class="practical"><div v-for="item in block.items" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.text }}</dd></div></dl>
      <aside v-else-if="block.type === 'characterAside'" class="character-note"><div><span class="eyebrow">OHIO-CHAN</span><h3>{{ block.title }}</h3><p>{{ block.text }}</p></div><CharacterArt :character="asideCharacter" alt="Ohio-chan" sizes="150px" /></aside>
      <figure v-else-if="block.type === 'video'" class="audio"><video controls preload="none" :src="getMedia(block.mediaId).src" playsinline></video><figcaption>{{ getMedia(block.mediaId).caption }}</figcaption><details><summary>Transcript &amp; listening notes</summary><p>{{ block.transcript }}</p></details></figure>
      <ol v-else-if="block.type === 'route'" class="route-stops"><li v-for="(stop, position) in block.stops" :key="stop.id"><span>{{ position + 1 }}</span><div><h3>{{ stop.title }}</h3><p>{{ stop.note }}</p></div></li></ol>
      <p v-if="block.sourceIds?.length" class="block-sources"><a v-for="id in block.sourceIds" :key="id" :href="getSource(id).url">{{ getSource(id).title }} ↗</a></p>
    </div>
  </div>
</template>
<style scoped>
.content-prose{font-size:var(--text-body);line-height:1.85;color:var(--ink-soft)}
.prose-block{margin-bottom:25px}.prose-block p{line-height:1.85}
.prose-block .intro{font-size:var(--text-lead);line-height:1.75;color:var(--ink);margin-bottom:42px}
.prose-block .signoff{font:italic 25px/1.6 var(--font-editorial);text-align:center;color:var(--accent);padding:30px 0}
.prose-heading{padding-top:24px;scroll-margin-top:var(--anchor-offset)}
.prose-heading h2{font-size:clamp(30px,3vw,40px);line-height:1.15;letter-spacing:-.045em;margin-top:12px;color:var(--ink)}
figure img{width:100%;height:auto;border-radius:3px}figcaption{font-size:var(--text-small);line-height:1.65;margin-top:12px;color:var(--ink-muted)}
.process{background:var(--surface-note);padding:30px;border-top:3px solid var(--ink);margin:36px 0}
.process h3{font-size:25px;color:var(--ink)}.process :is(ol,ul){list-style:none;margin:24px 0 0;padding:0}.process li{display:flex;gap:20px;padding:18px 0;border-top:1px solid var(--rule)}
.process li>span{font:italic 27px var(--font-editorial);color:var(--accent)}.process h4{font-size:17px;margin:0 0 6px;color:var(--ink)}.process p{font-size:16px}
blockquote{margin:35px 0;padding:10px 0 10px 28px;border-left:3px solid var(--accent);color:var(--ink)}blockquote p{font:italic 27px/1.5 var(--font-editorial)}blockquote cite{display:block;font:normal var(--text-meta) var(--font-body);margin-top:18px}blockquote a{font-size:var(--text-small);text-decoration:underline}
.timeline{list-style:none;padding:0;margin:40px 0;border-left:1px solid var(--rule)}.timeline li{padding:0 0 25px 28px;position:relative}.timeline li::before{content:'';position:absolute;left:-5px;top:8px;width:9px;height:9px;border-radius:50%;background:var(--accent)}.timeline strong{color:var(--accent);font-size:15px}.timeline p{margin-top:6px}
.practical{background:var(--surface-note);padding:12px 28px;margin:35px 0}.practical>div{display:grid;grid-template-columns:120px 1fr;gap:25px;padding:20px 0;border-bottom:1px solid var(--rule)}.practical>div:last-child{border:0}.practical dt{font-weight:650;color:var(--ink);font-size:15px}.practical dd{margin:0;font-size:16px;line-height:1.75}
.character-note{display:grid;grid-template-columns:minmax(0,1fr) 135px;gap:20px;background:var(--surface-note);border-radius:3px 40px 3px 3px;padding:30px 25px 0 30px;margin:40px 0;overflow:hidden;align-items:end}.character-note>div{padding-bottom:30px}.character-note h3{font:italic 28px/1.15 var(--font-editorial);color:var(--accent);margin:12px 0}.character-note p{font-size:16px}.character-note img{width:150px;height:230px;object-fit:cover;object-position:top;margin-bottom:-35px}
.audio{padding:25px;background:var(--surface-note)}video{width:100%}details{font-size:15px;margin-top:15px}summary{cursor:pointer;padding:8px 0}
.route-stops{list-style:none;padding:0;margin:35px 0}.route-stops li{display:flex;gap:24px;padding:22px 0;border-top:1px solid var(--rule)}.route-stops li>span{flex:none;display:grid;place-items:center;background:var(--ink);color:white;width:34px;height:34px;border-radius:50%;font-size:15px}.route-stops h3{font-size:22px;color:var(--ink);margin-bottom:8px}.route-stops p{font-size:16px}
.block-sources{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:12px;font-size:12px}.block-sources a{text-decoration:underline;text-underline-offset:3px;color:var(--ink-muted)}
@media(max-width:560px){.content-prose{font-size:17px}.character-note{grid-template-columns:minmax(0,1fr) 70px;padding:23px 15px 0 23px;gap:10px}.character-note img{width:100px;max-width:none;height:170px}.practical{padding:8px 22px}.practical>div{display:block}.practical dt{margin-bottom:8px}.process{padding:24px}.process li{gap:15px}}
</style>

<style scoped>
.process-parallel ul{display:grid;grid-template-columns:1fr 1fr;gap:16px 26px}.process-parallel li{display:block;padding:20px 0 6px}.process-parallel li>span{display:block;margin-bottom:14px;font-size:21px}.process-parallel h4{font-size:19px}.process:not(.process-parallel) li{position:relative;border:0;padding-block:15px}.process:not(.process-parallel) li:not(:last-child)::after{content:'';position:absolute;left:15px;top:54px;bottom:-7px;width:1px;background:#9cacbc}.process:not(.process-parallel) li>span{display:grid;place-items:center;flex:none;width:31px;height:31px;border:1px solid var(--rule);border-radius:50%;font:500 12px var(--font-body);background:var(--surface);margin-top:2px}@media(max-width:560px){.process-parallel ul{grid-template-columns:1fr}}
</style>
