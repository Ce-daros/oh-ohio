<script setup lang="ts">
import { computed } from "vue";
import { getContents } from "../content";
import { useReadingList } from "../composables/useReadingList";
import ContentCard from "../components/ContentCard.vue";
import SaveButton from "../components/SaveButton.vue";
const { ids, ready } = useReadingList();
const items = computed(() => getContents(ids.value));
</script>
<template>
  <main id="main-content" class="saved-page" tabindex="-1"><header><p class="eyebrow">FOR ANOTHER AFTERNOON</p><h1>Your reading <em>list.</em></h1><p>Saved in this browser.</p></header>
    <div v-if="ready && items.length" class="saved-grid"><article v-for="item in items" :key="item.id"><ContentCard :content="item" /><SaveButton :id="item.id" /></article></div>
    <section v-else-if="ready" class="saved-empty"><img src="/art/small/prop-postcard.webp" width="160" height="160" alt="" /><h2>A story for later.</h2><p>Use “Save for later” on a story to keep it here.</p><RouterLink class="button" to="/journal">Browse field notes ↗</RouterLink></section>
  </main>
</template>
<style scoped>
.saved-page{padding:60px var(--page-gutter) 90px;max-width:var(--page-width);margin:auto;min-height:70vh}header h1{font-size:clamp(42px,6vw,80px);line-height:1.1;margin:20px 0}header h1 em{color:var(--accent)}header>p:last-child{color:var(--ink-muted);font-size:var(--text-meta)}.saved-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:45px 35px;margin-top:50px}.saved-grid article{display:flex;flex-direction:column}.saved-grid article>.save-button{margin-top:12px;border-top:1px solid var(--rule)}.saved-empty{text-align:center;padding:45px 0}.saved-empty img{margin:auto;width:130px;height:130px;object-fit:contain}.saved-empty h2{font-size:35px;margin:20px 0 15px}.saved-empty p{color:var(--ink-soft);margin-bottom:28px}.saved-empty .button{display:inline-flex}
@media(max-width:850px){.saved-grid{grid-template-columns:1fr 1fr}}@media(max-width:540px){.saved-grid{grid-template-columns:1fr}.saved-page{padding-top:40px}}
</style>
