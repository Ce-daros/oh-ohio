<script setup lang="ts">
import { ref } from 'vue';
import HomeWelcome from '../components/home/HomeWelcome.vue';
import HomeWorlds from '../components/home/HomeWorlds.vue';
import HomeTheme from '../components/home/HomeTheme.vue';
import HomeFieldNotes from '../components/home/HomeFieldNotes.vue';
import HomeDiscoveries from '../components/home/HomeDiscoveries.vue';
import HomeNeighborhood from '../components/home/HomeNeighborhood.vue';
import { useHomeChapters, homeChapters } from '../composables/useHomeChapters';
const root = ref<HTMLElement | null>(null);
const active = useHomeChapters(root);
</script>
<template>
  <main id="main-content" ref="root" tabindex="-1" class="home-page">
    <HomeWelcome /><HomeWorlds /><HomeTheme /><HomeFieldNotes /><HomeDiscoveries /><HomeNeighborhood />
    <nav class="home-chapters" aria-label="Homepage chapters">
      <a v-for="chapter in homeChapters" :key="chapter.id" :href="`#${chapter.id}`" :aria-label="chapter.label" :aria-current="active === chapter.id ? 'location' : undefined"><span>{{ chapter.label }}</span><i aria-hidden="true" /></a>
    </nav>
  </main>
</template>
<style src="../styles/home.css"></style>
