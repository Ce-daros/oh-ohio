<script setup lang="ts">
import { metrics } from "../../content/registries";
</script>
<template>
  <section class="economy-board" aria-labelledby="numbers-title">
    <div class="board-heading" data-reveal><p class="eyebrow">STATEWIDE / THE BIGGER PICTURE</p><h2 id="numbers-title">Ohio, by the numbers<span>.</span></h2></div>
    <div class="economy-numbers"><article v-for="metric in metrics" :key="metric.id"><p>{{ metric.label }}</p><strong>{{ metric.value }}<span v-if="metric.unit === 'percent'">%</span></strong><span>{{ metric.unit }}</span><time>{{ metric.period }}</time><a :href="metric.url" target="_blank" rel="noopener noreferrer">{{ metric.source }} ↗</a></article></div>
  </section>
</template>
