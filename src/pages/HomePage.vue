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
<style>
.home-page{--home-width:1240px;--home-gutter:clamp(22px,6vw,96px)}
.home-stage{position:relative;padding:64px var(--home-gutter);scroll-margin-top:var(--header-height)}
.home-page .home-stage{scroll-margin-top:var(--header-height)}
.home-inner{width:100%;max-width:var(--home-width);margin-inline:auto;min-width:0}
.home-heading{display:flex;justify-content:space-between;align-items:end;gap:32px;margin-bottom:32px}.home-heading h2{font-size:clamp(40px,4.7vw,68px);line-height:1.04;margin-top:16px}.home-heading em{color:var(--accent)}.home-heading>p{font-size:16px;line-height:1.7;max-width:250px;color:var(--ink-soft)}
.home-page .button{min-height:52px;padding:16px 22px;box-shadow:3px 3px 0 var(--ink)}.home-page .text-link{gap:24px;min-height:44px}
.home-chapters{display:none}
@media(min-width:1024px) and (min-height:720px){.home-page{--home-gutter:clamp(80px,8vw,128px)}.home-stage{min-height:calc(100svh - var(--header-height));display:flex;align-items:center;padding-block:48px}.home-chapters{display:flex;flex-direction:column;position:fixed;z-index:20;right:8px;top:50%;transform:translateY(-50%)}.home-chapters a{display:flex;align-items:center;justify-content:end;gap:8px;min-height:44px;min-width:44px;color:var(--ink)}.home-chapters i{width:6px;height:6px;border-radius:50%;background:currentColor;margin:0 15px;opacity:.45;transition:height .4s var(--ease),opacity .3s var(--ease),background .3s var(--ease)}.home-chapters span{font-size:10px;padding:5px 7px;background:#faf8f0ee;border-radius:3px;visibility:hidden}.home-chapters a[aria-current] span,.home-chapters a:hover span,.home-chapters a:focus-visible span{visibility:visible}.home-chapters a[aria-current] i{background:var(--accent);height:20px;border-radius:3px;opacity:1}}
@media(min-width:1024px) and (min-height:720px) and (prefers-reduced-motion:no-preference){html[data-home]:not([data-input=keyboard]) .home-welcome .button{transition:box-shadow .2s var(--ease)}}
@media(max-width:700px){.home-stage{padding-block:42px}.home-heading{flex-direction:column;align-items:start;gap:20px;margin-bottom:28px}.home-heading h2{font-size:42px}}
</style>
