<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { worlds as chapters } from "./content";
import { provideReadingList } from "./composables/useReadingList";
import { startInputModeTracking } from "./input-mode";
provideReadingList();
const route = useRoute();
const menuOpen = ref(false);
const menuButton = ref<HTMLButtonElement | null>(null);
function closeMenu() { if (menuOpen.value) { menuOpen.value = false; menuButton.value?.focus(); } }
async function toggleMenu() {
  if (menuOpen.value) { closeMenu(); return; }
  menuOpen.value = true;
  await nextTick();
  document.querySelector<HTMLAnchorElement>('#explore-menu a')!.focus();
}
watch(() => route.fullPath, () => { menuOpen.value = false; });
let stopInputTracking: () => void = () => {};
onMounted(() => { stopInputTracking = startInputModeTracking(); });
onUnmounted(() => stopInputTracking());
</script>
<template>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header" @keydown.esc="closeMenu">
    <RouterLink class="brand" to="/" aria-label="Oh, Ohio home">Oh,<span>Ohio</span><span class="brand-dot">.</span></RouterLink>
    <nav class="desktop-nav" aria-label="Main navigation">
      <RouterLink v-for="chapter in chapters" :key="chapter.id" :to="`/${chapter.id}`">{{ chapter.title }}</RouterLink>
      <RouterLink to="/journal" :class="{ 'router-link-active': route.path.startsWith('/journal') }">Field notes</RouterLink>
      <RouterLink to="/topics">Collections</RouterLink>
    </nav>
    <RouterLink class="header-search" to="/search" aria-label="Search stories"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><span>Search</span></RouterLink>
    <button ref="menuButton" class="menu-toggle" :class="{active:menuOpen}" :aria-expanded="menuOpen" aria-controls="explore-menu" @click="toggleMenu">
      {{ menuOpen ? "Close" : "Menu" }}<span class="menu-icon" aria-hidden="true">+</span>
    </button>
    <Transition name="menu">
      <nav v-if="menuOpen" id="explore-menu" class="explore-menu" aria-label="Explore Ohio">
        <RouterLink v-for="chapter in chapters" :key="chapter.id" :to="`/${chapter.id}`"><span>{{ chapter.symbol }}</span>{{ chapter.title }}<span>↗</span></RouterLink>
        <RouterLink to="/journal"><span>↳</span>Field notes<span>↗</span></RouterLink>
        <RouterLink to="/topics"><span>↳</span>Collections<span>↗</span></RouterLink>
        <RouterLink to="/saved"><span>♡</span>Reading list<span>↗</span></RouterLink>
        <RouterLink to="/search"><span>⌕</span>Search<span>↗</span></RouterLink>
      </nav>
    </Transition>
  </header>
  <RouterView v-slot="{Component, route: currentRoute}"><Suspense :key="currentRoute.path"><component :is="Component" :key="currentRoute.path" /><template #fallback><main id="main-content" class="page-loading" aria-busy="true">Opening your story…</main></template></Suspense></RouterView>
  <footer class="site-footer" :class="{ 'footer-home': route.path === '/' }">
    <div v-if="route.path !== '/'" class="footer-top"><div><p class="eyebrow light">UNTIL NEXT TIME ♡</p><h2>See you around,<br /><em>Ohio.</em> <span>♡</span></h2></div><RouterLink class="round-link" to="/">Back home <span>↗</span></RouterLink></div>
    <div class="footer-bottom"><RouterLink class="brand" to="/">Oh,<span>Ohio</span><span class="brand-dot">.</span></RouterLink><p>An unofficial love letter to Ohio.<br />Not affiliated with the State of Ohio.</p><span>YOUR GUIDE, OHIO-CHAN ♡</span></div>
  </footer>
</template>
<style scoped>
.footer-home{padding-top:0}.footer-home .footer-bottom{padding-top:28px}
.site-header{gap:28px;height:var(--header-height)}.desktop-nav{gap:24px}.header-search{display:flex;align-items:center;gap:8px;font-size:14px;padding:12px 0}.menu-toggle{gap:20px;padding:12px 18px;min-height:44px}.page-loading{min-height:65vh;padding:80px var(--page-gutter);font:italic 30px var(--font-editorial)}
@media(max-width:1100px){.site-header{gap:20px}.desktop-nav{gap:18px}.header-search>span{display:none}}
@media(max-width:950px){.desktop-nav{display:none}.header-search{margin-left:auto}.site-header{gap:24px}}
@media(max-width:560px){.menu-toggle{padding:10px 13px;gap:15px}.site-header{gap:20px}.explore-menu{max-height:calc(100dvh - var(--header-height));overflow:auto}}
</style>
