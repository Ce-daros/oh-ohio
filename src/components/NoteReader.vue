<script setup lang="ts">
import { useRoute } from "vue-router";
import { getContent, loadContentBody, type WorldId } from "../content";
import { readingContext } from "../reading-context";
import ContentBody from "./ContentBody.vue";
import ContentSources from "./ContentSources.vue";
import SaveButton from "./SaveButton.vue";
const props = defineProps<{ slug: string; world: WorldId; sceneId?: string }>();
const route = useRoute();
const content = getContent(props.slug);
const fullPage = { path: content.canonicalPath, query: { ...readingContext(route.query), from: props.world, scene: props.sceneId } };
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
