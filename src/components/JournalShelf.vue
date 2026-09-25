<script setup lang="ts">
import { computed } from "vue";
import { getCollection, getContent, queryContent, type WorldId } from "../content";
import ContentCard from "./ContentCard.vue";
const props = defineProps<{ chapter?: WorldId }>();
const collection = computed(() => getCollection(props.chapter ? `world:${props.chapter}` : 'home:field-notes'));
const selected = computed(() => collection.value.itemIds.map(getContent));
const count = queryContent({ kind: 'feature' }).length;
</script>
<template>
  <section class="journal-shelf" :aria-labelledby="`shelf-${chapter || 'home'}`">
    <div class="shelf-heading"><div><p class="eyebrow">FIELD NOTES</p><h2 :id="`shelf-${chapter || 'home'}`">{{ chapter ? 'A closer look.' : 'Worth an afternoon.' }}</h2></div><div><p>{{ collection.dek }}</p><RouterLink :to="{path:'/journal', query: chapter ? {world:chapter} : {}}">{{ chapter ? 'All stories' : `All ${count} field notes` }} ↗</RouterLink></div></div>
    <div class="shelf-grid"><ContentCard v-for="content in selected" :key="content.id" :content="content" /></div>
  </section>
</template>
<style scoped>
.journal-shelf{padding:70px var(--page-gutter) 80px;background:var(--surface)}.shelf-heading{display:flex;align-items:end;justify-content:space-between;gap:35px;max-width:1280px;margin:0 auto 40px}.shelf-heading h2{font-size:clamp(37px,4.7vw,64px);margin-top:15px}.shelf-heading>div:last-child{max-width:330px}.shelf-heading>div:last-child>p{color:var(--ink-soft);font-size:17px;line-height:1.7;margin-bottom:20px}.shelf-heading a{font-size:var(--text-meta);padding-bottom:6px;border-bottom:1px solid var(--rule)}.shelf-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:40px 30px;max-width:1280px;margin:auto}
@media(max-width:950px){.shelf-grid{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.journal-shelf{padding-block:45px 55px}.shelf-heading{display:block}.shelf-heading>div:last-child{margin-top:22px}.shelf-grid{grid-template-columns:1fr}.shelf-heading h2{font-size:41px}}
</style>

