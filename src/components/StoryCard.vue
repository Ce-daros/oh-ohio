<script setup lang="ts">
import { ref } from "vue";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Entry } from "../catalog";
defineProps<{ entry: Entry; index: number }>();
const expanded = ref(false);
function syncExpanded(event: Event) {
  expanded.value = (event.target as HTMLDetailsElement).open;
  ScrollTrigger.refresh();
}
</script>
<template>
  <article :id="entry.slug" class="story-card" data-reveal>
    <div class="story-meta">
      <span>{{ String(index + 1).padStart(2, "0") }}</span
      ><span>{{ entry.kicker }}</span>
    </div>
    <h3>{{ entry.title }}</h3>
    <p class="story-summary">{{ entry.summary }}</p>
    <details @toggle="syncExpanded">
      <summary>
        <span>{{ expanded ? "A little less" : "Ooh, tell me more" }}</span
        ><span aria-hidden="true">{{ expanded ? "−" : "+" }}</span>
      </summary>
      <div class="story-body">
        <p v-for="paragraph in entry.body" :key="paragraph">{{ paragraph }}</p>
      </div>
    </details>
    <a
      class="source-link"
      :href="entry.url"
      target="_blank"
      rel="noopener noreferrer"
      >{{ entry.source }} <span aria-hidden="true">↗</span></a
    >
    <a
      v-if="entry.supportingUrl"
      class="source-link supporting-source"
      :href="entry.supportingUrl"
      target="_blank"
      rel="noopener noreferrer"
      >{{ entry.supportingSource }} <span aria-hidden="true">↗</span></a
    >
  </article>
</template>
