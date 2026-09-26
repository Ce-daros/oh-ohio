<script setup lang="ts">
import { computed } from "vue";
import { getMedia, type BodyBlock } from "../../content";
import MediaFigure from "./MediaFigure.vue";
const props = defineProps<{ block: Extract<BodyBlock, { type: 'video' }> }>();
const media = computed(() => getMedia(props.block.mediaId));
</script>
<template>
  <MediaFigure class="audio" :caption="media.caption">
    <video controls preload="none" :src="media.src" playsinline></video>
    <template #foot><details><summary>Transcript &amp; listening notes</summary><p>{{ block.transcript }}</p></details></template>
  </MediaFigure>
</template>
<style scoped>
.audio{padding:25px;background:var(--surface-note)}video{width:100%}details{font-size:15px;margin-top:15px}summary{cursor:pointer;padding:8px 0}
details p{line-height:1.85}
</style>
