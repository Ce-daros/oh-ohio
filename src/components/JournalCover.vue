<script setup lang="ts">
import type { JournalArticle } from "../data/journal-types";
defineProps<{ article: JournalArticle; priority?: boolean }>();
</script>
<template>
  <div class="journal-cover">
    <img :src="article.cover" :srcset="`${article.cover.replace('.webp', '-768.webp')} 768w, ${article.cover} 1536w`" :sizes="priority ? '(max-width: 760px) 100vw, 52vw' : '(max-width: 650px) 100vw, (max-width: 1050px) 50vw, 33vw'" :alt="article.coverAlt" :loading="priority ? 'eager' : 'lazy'" :fetchpriority="priority ? 'high' : 'auto'" width="1536" height="1024" />
  </div>
</template>
<style scoped>
.journal-cover{overflow:hidden;aspect-ratio:3/2;background:#e8f0f7}
.journal-cover img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease)}
@media(hover:hover){a:hover .journal-cover img{transform:scale(1.025)}}
@media(prefers-reduced-motion:reduce){.journal-cover img{transition:none;transform:none!important}}
:global(html[data-input=keyboard]) .journal-cover img{transition:none;transform:none}
</style>
