<script setup lang="ts">
import type { ChapterId } from "../catalog";
defineProps<{ chapter: ChapterId; number: string }>();
const lettering = { explore: "GO.", make: "MAKE.", culture: "PLAY.", live: "STAY." };
</script>
<template>
  <div :class="['directory-art', 'world-cover', `world-cover-${chapter}`]" aria-hidden="true">
    <span class="cover-number">{{ number }} / OHIO</span>
    <span class="cover-type">{{ lettering[chapter] }}</span>
    <span class="cover-orbit"></span>
    <span class="cover-corner">↗</span>
  </div>
</template>
<style scoped>
.world-cover { position:relative; overflow:hidden; isolation:isolate; container-type:inline-size; background:#c9e5ed; color:#18243c; }
.world-cover-make { background:#263958; color:#d9e6ff; }
.world-cover-culture { background:#ed5261; color:#fff4eb; }
.world-cover-live { background:#d4e4d6; color:#244a44; }
.cover-number { position:absolute; left:8%; top:10%; font-size:13px; letter-spacing:.12em; }
.cover-type { position:absolute; left:6%; bottom:15%; font:700 35cqw/.85 'Space Grotesk Variable',sans-serif; letter-spacing:-.085em; transition:transform .4s var(--ease); z-index:2; }
.cover-orbit { position:absolute; border:1px solid currentColor; border-radius:50%; width:95%; aspect-ratio:1; right:-30%; top:-35%; opacity:.35; transition:transform .6s var(--ease); }
.world-cover-make .cover-type { font-size:27cqw; }
.world-cover-culture .cover-type,.world-cover-live .cover-type { font-size:30cqw; }
.cover-corner { position:absolute; right:8%; top:8%; font-size:32px; }
a:hover .cover-type { transform:translateY(-7px); }
a:hover .cover-orbit { transform:scale(1.2); }
@media(prefers-reduced-motion:reduce) { * { transition:none!important; } }
</style>
