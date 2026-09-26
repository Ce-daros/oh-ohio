<script setup lang="ts">
import type { BodyBlock, CharacterId } from "../../content";
import CharacterArt from "../CharacterArt.vue";
defineProps<{ block: Extract<BodyBlock, { type: 'characterAside' }>; character: CharacterId }>();
</script>
<template>
  <aside class="character-note"><div><span class="eyebrow">OHIO-CHAN</span><h3>{{ block.title }}</h3><p>{{ block.text }}</p></div><CharacterArt :character="character" alt="Ohio-chan" sizes="150px" /></aside>
</template>
<style scoped>
.character-note{display:grid;grid-template-columns:minmax(0,1fr) 135px;gap:20px;background:var(--surface-note);border-radius:3px 40px 3px 3px;padding:30px 25px 0 30px;margin:40px 0;overflow:hidden;align-items:end}
.character-note>div{padding-bottom:30px}.character-note h3{font:italic 28px/1.15 var(--font-editorial);color:var(--accent);margin:12px 0}.character-note p{font-size:16px;line-height:1.85}.character-note img{width:150px;height:230px;object-fit:cover;object-position:top;margin-bottom:-35px}
@media(max-width:560px){.character-note{grid-template-columns:minmax(0,1fr) 70px;padding:23px 15px 0 23px;gap:10px}.character-note img{width:100px;max-width:none;height:170px}}
</style>
