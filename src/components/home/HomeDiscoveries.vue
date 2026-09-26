<script setup lang="ts">
import { getCollection, getContent } from '../../content';
import ContentCard from '../ContentCard.vue';
import SaveButton from '../SaveButton.vue';
import { useReadingList } from '../../composables/useReadingList';
const items = getCollection('home:dispatches').itemIds.map(getContent);
const { ids, ready } = useReadingList();
</script>
<template><section id="discoveries" class="home-stage home-discoveries" aria-labelledby="discoveries-title"><div class="home-inner"><div class="home-heading" data-home-reveal><div><p class="eyebrow">04 / A FEW GOOD DETAILS</p><h2 id="discoveries-title">Start <em>anywhere.</em></h2></div><RouterLink class="text-link" to="/saved">Reading list <span v-if="ready && ids.length" class="saved-count">{{ ids.length }}</span><span aria-hidden="true">↗</span></RouterLink></div><div class="discovery-grid" data-home-reveal><article v-for="(item,index) in items" :key="item.id" class="discovery-card"><span class="discovery-number" aria-hidden="true">0{{ index+1 }}</span><ContentCard :content="item" variant="compact" /><SaveButton :id="item.id" :label="item.title" class="save-note" /></article></div><RouterLink class="text-link discovery-search" to="/search">Find a story <span aria-hidden="true">↗</span></RouterLink></div></section></template>
<style scoped>
.home-discoveries{background:#f0eee8}.discovery-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin-top:38px}.discovery-card{display:flex;flex-direction:column;min-width:0;padding:26px 23px 18px;background:#fffdf7;border-top:2px solid #c2b8a5}.discovery-number{font:italic 40px var(--font-editorial);color:#9c8e73;margin-bottom:22px}.discovery-card :deep(.content-card){border:0;flex:1}.discovery-card :deep(.content-card-copy){padding:0 0 20px}.discovery-card :deep(.content-card-copy h3){font-size:27px}.discovery-card :deep(.content-card-summary){font-size:15px}/* Variant of the shared SaveButton: full-width row with a top rule. */.discovery-card .save-note{display:flex;gap:10px;min-height:48px;width:100%;padding:14px 0 0;font-size:13px}.saved-count{display:grid;place-items:center;min-width:25px;height:25px;border:1px solid var(--rule);border-radius:50%;font-size:12px}.discovery-search{margin-top:26px}
@media(max-width:1050px){.discovery-grid{grid-template-columns:1fr 1fr}}@media(max-width:550px){.discovery-grid{grid-template-columns:1fr}.discovery-card{padding:24px}}
</style>
