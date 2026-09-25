<script setup lang="ts">
import { useRoute } from "vue-router";
import { getContent, loadContentBody, scenes, type WorldId } from "../content";
import ContentBody from "./ContentBody.vue";
import ContentSources from "./ContentSources.vue";
import SaveButton from "./SaveButton.vue";
const props = defineProps<{ slug: string }>();
const route = useRoute();
const content = getContent(props.slug);
const fromWorld = route.path.slice(1) as WorldId;
const scene = scenes[fromWorld].find(group => group.slugs.includes(content.slug))!.id;
const fullPage = { path: content.canonicalPath, query: { ...route.query, from: fromWorld, scene } };
const blocks = await loadContentBody(content.id);
</script>
<template>
  <article class="reader-article">
    <p class="eyebrow">{{ content.kind === 'phrase' ? 'LOCAL WORDS' : 'GUIDE NOTE' }}</p>
    <h2 id="reader-title">{{ content.title }}</h2><p class="reader-summary">{{ content.summary }}</p>
    <div class="reader-actions"><RouterLink :to="fullPage">Open full page <span aria-hidden="true">↗</span></RouterLink><SaveButton :id="content.id" /></div>
    <ContentBody :blocks="blocks" :world="content.primaryWorld" />
    <ContentSources :content="content" />
  </article>
</template>
<style scoped>
.reader-actions{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin:18px 0 28px;font-size:var(--text-meta)}.reader-actions>a{text-decoration:underline;text-underline-offset:5px}
</style>
