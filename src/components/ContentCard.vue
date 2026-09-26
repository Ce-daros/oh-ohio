<script setup lang="ts">
import { computed } from "vue";
import { getMedia, places, worlds, type ContentMeta } from "../content";
const props = withDefaults(defineProps<{ content: Readonly<ContentMeta>; variant?: 'story' | 'compact'; reason?: string; imageSizes?: string }>(), { variant: 'story', imageSizes: '(max-width: 600px) 90vw, (max-width: 1000px) 44vw, 29vw' });
const world = computed(() => worlds.find(item => item.id === props.content.primaryWorld)!);
const cover = computed(() => props.content.kind === 'feature' ? getMedia(props.content.coverMediaId) : undefined);
const location = computed(() => props.content.kind === 'feature' ? props.content.location : props.content.places.filter(id => id !== 'ohio').map(id => places.find(place => place.id === id)!.title).join(' · '));
const labels = { feature: 'Field note', note: 'Guide note', phrase: 'Local words' };
</script>
<template>
  <RouterLink :to="content.canonicalPath" :class="['content-card', `card-${variant}`]" :style="{ '--card-color': world.color }">
    <div v-if="cover && variant === 'story'" class="content-card-art"><img :src="cover.src" :alt="content.kind === 'feature' ? content.coverAlt : ''" width="1536" height="1024" loading="lazy" :srcset="cover.variants?.map(item => `${item.src} ${item.width}w`).join(', ')" :sizes="imageSizes" /></div>
    <div class="content-card-copy">
      <p class="content-card-meta"><span>{{ world.title }} / {{ labels[content.kind] }}</span><span v-if="content.kind === 'feature'">{{ content.readTime }}</span></p>
      <h3>{{ content.title }}</h3>
      <p class="content-card-summary">{{ reason || content.summary }}</p>
      <div class="content-card-bottom"><span>{{ location }}</span><span aria-hidden="true">↗</span></div>
    </div>
  </RouterLink>
</template>
<style scoped>
.content-card{display:flex;flex-direction:column;min-width:0;color:var(--ink)}
.content-card-art{aspect-ratio:3/2;overflow:hidden;border-radius:3px 46px 3px 3px;background:var(--card-color)}
.content-card-art img{width:100%;height:100%;object-fit:cover;transition:transform .35s var(--ease)}
.content-card-copy{display:flex;flex-direction:column;flex:1;padding:20px 0 0}
.content-card-meta{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:var(--ink-muted);font-size:var(--text-small);line-height:1.5;margin-bottom:13px}
.content-card h3{font-size:clamp(24px,2.4vw,34px);line-height:1.16;letter-spacing:-.045em;text-wrap:balance}
.content-card-summary{font-size:16px;line-height:1.7;color:var(--ink-soft);margin-top:15px}
.content-card-bottom{display:flex;justify-content:space-between;gap:16px;align-items:end;margin-top:auto;padding-top:24px;color:var(--ink-muted);font-size:var(--text-small)}
.content-card-bottom>span:last-child{font-size:25px;color:var(--accent)}
.content-card:hover h3{color:var(--accent)}
.card-compact{border-top:1px solid var(--rule)}
.card-compact .content-card-copy{padding:24px 0}
.card-compact h3{font-size:25px}
@media(hover:hover) and (prefers-reduced-motion:no-preference){.content-card:hover img{transform:scale(1.025)}}
:global(html[data-input=keyboard]) .content-card-art img{transform:none;transition:none}
@media(max-width:600px){.content-card h3{font-size:29px}.content-card-summary{font-size:16px}}
</style>
