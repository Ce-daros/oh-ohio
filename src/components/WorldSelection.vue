<script setup lang="ts">
import { computed } from "vue";
import { getCollection, getContent, type SceneGroup, type WorldId } from "../content";
import guidance from "../data/scene-guidance.json";
import metrics from "../content/data/metrics.json";
import GuideKeepsake from "./GuideKeepsake.vue";
const props = defineProps<{ world: WorldId; group: SceneGroup; position: number }>();
defineEmits<{ read: [event: MouseEvent, slug: string] }>();
const selectedEntries = computed(() => props.group.slugs.map(getContent));
const metricIds: Record<string, string[]> = { work: ['household-income', 'unemployment'], factory: ['employer-establishments'] };
const contextualMetrics = computed(() => props.world === 'make' ? metrics.filter(metric => (metricIds[props.group.id] ?? []).includes(metric.id)) : []);
</script>
<template>
  <aside id="scene-selection" class="scene-selection" aria-label="Selected topic">
    <Transition name="selection-swap" mode="out-in">
      <div class="selection-overview" :key="group.id"><div class="selection-heading"><span class="selection-number">{{ String(position).padStart(2,'0') }}</span><p class="eyebrow">{{ selectedEntries.length }} {{ selectedEntries.length === 1 ? 'STORY' : 'STORIES' }}</p></div><h2 aria-live="polite">{{ group.title }}</h2><p class="selected-summary">{{ getCollection(group.collectionId).dek }}</p><div class="chan-whisper"><span>Ohio-chan <span aria-hidden="true">♡</span></span><p>{{ guidance[world][group.id as keyof typeof guidance[typeof world]] }}</p></div></div>
    </Transition>
    <div class="selection-details">
      <Transition name="selection-swap" mode="out-in">
        <div class="selection-changing" :key="group.id">
          <div class="selection-stories"><a v-for="entry in selectedEntries" :key="entry.id" :href="entry.canonicalPath" @click="$emit('read', $event, entry.slug)"><span>{{ entry.title }}</span><span aria-hidden="true">↗</span></a></div>
          <a v-for="metric in contextualMetrics" :key="metric.id" class="selection-metric" :href="metric.url" target="_blank" rel="noopener noreferrer"><span>{{ metric.scope }} / {{ metric.label }}</span><strong>{{ metric.value }}</strong><span>{{ metric.unit }} · {{ metric.period }}</span><span>{{ metric.source }} ↗</span></a>
        </div>
      </Transition>
      <GuideKeepsake :world="world" />
    </div>
  </aside>
</template>
<style scoped>
.selection-swap-enter-active{transition:opacity .28s var(--ease),transform .28s var(--ease),filter .28s var(--ease)}
.selection-swap-leave-active{transition:opacity .14s var(--ease),transform .14s var(--ease)}
.selection-swap-enter-from{opacity:0;transform:translateY(10px);filter:blur(5px)}
.selection-swap-leave-to{opacity:0;transform:translateY(-6px)}
:global(html[data-input=keyboard]) .selection-swap-enter-active,:global(html[data-input=keyboard]) .selection-swap-leave-active{transition:none}
</style>
