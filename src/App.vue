<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { chapters } from "./catalog";
const route = useRoute();
const menuOpen = ref(false);
const menuButton = ref<HTMLButtonElement | null>(null);
function closeMenu() { menuOpen.value = false; menuButton.value!.focus(); }
watch(() => route.fullPath, () => { menuOpen.value = false; });
const keyboard = () => { document.documentElement.dataset.input = "keyboard"; document.dispatchEvent(new Event("ohio:motion-stop")); };
const pointer = () => { document.documentElement.dataset.input = "pointer"; };
onMounted(() => { document.addEventListener("keydown", keyboard); document.addEventListener("pointerdown", pointer); });
onUnmounted(() => { document.removeEventListener("keydown", keyboard); document.removeEventListener("pointerdown", pointer); });
</script>
<template>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header" @keydown.esc="closeMenu">
    <RouterLink class="brand" to="/" aria-label="Oh, Ohio home">Oh,<span>Ohio</span><span class="brand-dot">.</span></RouterLink>
    <nav class="desktop-nav" aria-label="Main navigation">
      <RouterLink v-for="chapter in chapters" :key="chapter.id" :to="`/${chapter.id}`">{{ chapter.title }}</RouterLink>
      <RouterLink to="/journal" :class="{ 'router-link-active': route.path.startsWith('/journal') }">Field notes</RouterLink>
    </nav>
    <button ref="menuButton" class="menu-toggle" :class="{active:menuOpen}" :aria-expanded="menuOpen" aria-controls="explore-menu" @click="menuOpen = !menuOpen">
      {{ menuOpen ? "Close" : "Let's explore!" }}<span class="menu-icon" aria-hidden="true">+</span>
    </button>
    <Transition name="menu">
      <nav v-if="menuOpen" id="explore-menu" class="explore-menu" aria-label="Explore Ohio">
        <RouterLink v-for="chapter in chapters" :key="chapter.id" :to="`/${chapter.id}`"><span>{{ chapter.symbol }}</span>{{ chapter.title }}<span>↗</span></RouterLink>
        <RouterLink to="/journal"><span>05</span>Field notes<span>↗</span></RouterLink>
      </nav>
    </Transition>
  </header>
  <RouterView v-slot="{Component, route: currentRoute}"><component :is="Component" :key="currentRoute.path" /></RouterView>
  <footer class="site-footer">
    <div class="footer-top"><div><p class="eyebrow light">UNTIL NEXT TIME ♡</p><h2>See you around,<br /><em>Ohio.</em> <span>♡</span></h2></div><RouterLink class="round-link" to="/">Back home <span>↗</span></RouterLink></div>
    <div class="footer-bottom"><RouterLink class="brand" to="/">Oh,<span>Ohio</span><span class="brand-dot">.</span></RouterLink><p>An unofficial love letter to Ohio.<br />Not affiliated with the State of Ohio.</p><span>YOUR GUIDE, OHIO-CHAN ♡</span></div>
  </footer>
</template>
