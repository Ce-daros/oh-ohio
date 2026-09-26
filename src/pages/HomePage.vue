<script setup lang="ts">
import { ref } from 'vue';
import HomeWelcome from '../components/home/HomeWelcome.vue';
import HomeWorlds from '../components/home/HomeWorlds.vue';
import HomeTheme from '../components/home/HomeTheme.vue';
import HomeFieldNotes from '../components/home/HomeFieldNotes.vue';
import HomeDiscoveries from '../components/home/HomeDiscoveries.vue';
import HomeNeighborhood from '../components/home/HomeNeighborhood.vue';
import { useHomeSections, homeSections } from '../composables/home/useHomeSections';
const root = ref<HTMLElement | null>(null);
const active = useHomeSections(root);
</script>
<template>
  <main id="main-content" ref="root" tabindex="-1" class="home-page">
    <HomeWelcome /><HomeWorlds /><HomeTheme /><HomeFieldNotes /><HomeDiscoveries /><HomeNeighborhood />
    <nav class="home-sections" aria-label="Homepage sections">
      <a v-for="section in homeSections" :key="section.id" :href="`#${section.id}`" :aria-label="section.label" :aria-current="active === section.id ? 'location' : undefined"><span>{{ section.label }}</span><i aria-hidden="true" /></a>
    </nav>
  </main>
</template>
<style src="../styles/home.css"></style>
