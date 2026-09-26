<script setup lang="ts">
import { computed } from "vue";
import { getMedia, type BodyBlock } from "../../content";
import MediaFigure from "./MediaFigure.vue";
const props = defineProps<{ block: Extract<BodyBlock, { type: 'illustration' }> }>();
const media = computed(() => getMedia(props.block.mediaId));
</script>
<template>
  <MediaFigure :caption="block.caption"><img :src="media.src" :alt="media.alt" loading="lazy" /></MediaFigure>
</template>
<style scoped>
img{width:100%;height:auto;border-radius:3px}
</style>
