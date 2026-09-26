<script setup lang="ts">
import { computed } from "vue";
import { getCollection, getContent, type SceneGroup, type WorldId } from "../../content";
import { metrics, sceneGuidance } from "../../content/registries";

import GuideKeepsake from "./GuideKeepsake.vue";
const props = defineProps<{ world: WorldId; group: SceneGroup; position: number }>();
defineEmits<{ read: [event: MouseEvent, slug: string] }>();
const selectedEntries = computed(() => props.group.slugs.map(getContent));
const contextualMetrics = computed(() => metrics.filter(metric => props.group.metricIds?.includes(metric.id)));
</script>
<template>
  <aside id="scene-selection" class="scene-selection" aria-label="Selected topic">
    <Transition name="swap" mode="out-in">
      <div class="selection-overview" :key="group.id"><div class="selection-heading"><span class="selection-number">{{ String(position).padStart(2,'0') }}</span><p class="eyebrow">{{ selectedEntries.length }} {{ selectedEntries.length === 1 ? 'STORY' : 'STORIES' }}</p></div><h2 aria-live="polite">{{ group.title }}</h2><p class="selected-summary">{{ getCollection(group.collectionId).dek }}</p><div class="chan-whisper"><span>Ohio-chan <span aria-hidden="true">♡</span></span><p>{{ sceneGuidance[world][group.id] }}</p></div></div>
    </Transition>
    <div class="selection-details">
      <Transition name="swap" mode="out-in">
        <div class="selection-changing" :key="group.id">
          <div class="selection-stories"><a v-for="entry in selectedEntries" :key="entry.id" :href="entry.canonicalPath" @click="$emit('read', $event, entry.slug)"><span>{{ entry.title }}</span><span aria-hidden="true">↗</span></a></div>
          <a v-for="metric in contextualMetrics" :key="metric.id" class="selection-metric" :href="metric.url" target="_blank" rel="noopener noreferrer"><span>{{ metric.scope }} / {{ metric.label }}</span><strong>{{ metric.value }}</strong><span>{{ metric.unit }} · {{ metric.period }}</span><span>{{ metric.source }} ↗</span></a>
        </div>
      </Transition>
      <GuideKeepsake :world="world" />
    </div>
  </aside>
</template>
