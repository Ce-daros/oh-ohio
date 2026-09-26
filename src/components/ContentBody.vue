<script setup lang="ts">
import { computed } from "vue";
import { getWorld, getSource, type BodyBlock, type WorldId } from "../content";
import PlaceMap from './PlaceMap.vue';
import ParagraphBlock from './blocks/ParagraphBlock.vue';
import HeadingBlock from './blocks/HeadingBlock.vue';
import IllustrationBlock from './blocks/IllustrationBlock.vue';
import ProcessBlock from './blocks/ProcessBlock.vue';
import QuoteBlock from './blocks/QuoteBlock.vue';
import TimelineBlock from './blocks/TimelineBlock.vue';
import PracticalBlock from './blocks/PracticalBlock.vue';
import CharacterAsideBlock from './blocks/CharacterAsideBlock.vue';
import VideoBlock from './blocks/VideoBlock.vue';
import RouteBlock from './blocks/RouteBlock.vue';
const props = defineProps<{ blocks: readonly Readonly<BodyBlock>[]; world: WorldId }>();
const asideCharacter = computed(() => getWorld(props.world).art);
</script>
<template>
  <div class="content-prose">
    <div v-for="(block, index) in blocks" :key="index" class="prose-block">
      <ParagraphBlock v-if="block.type === 'paragraph'" :block="block" />
      <PlaceMap v-else-if="block.type === 'placeMap'" :title="block.title" :place-ids="block.placeIds" :caption="block.caption" />
      <HeadingBlock v-else-if="block.type === 'heading'" :block="block" />
      <IllustrationBlock v-else-if="block.type === 'illustration'" :block="block" />
      <ProcessBlock v-else-if="block.type === 'process'" :block="block" />
      <QuoteBlock v-else-if="block.type === 'quote'" :block="block" />
      <TimelineBlock v-else-if="block.type === 'timeline'" :block="block" />
      <PracticalBlock v-else-if="block.type === 'practical'" :block="block" />
      <CharacterAsideBlock v-else-if="block.type === 'characterAside'" :block="block" :character="asideCharacter" />
      <VideoBlock v-else-if="block.type === 'video'" :block="block" />
      <RouteBlock v-else-if="block.type === 'route'" :block="block" />
      <p v-if="block.sourceIds?.length" class="block-sources"><a v-for="id in block.sourceIds" :key="id" :href="getSource(id).url">{{ getSource(id).title }} ↗</a></p>
    </div>
  </div>
</template>
<style scoped>
.content-prose{font-size:var(--text-body);line-height:1.85;color:var(--ink-soft)}
.prose-block{margin-bottom:25px}
.block-sources{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:12px;font-size:12px;line-height:1.85}
.block-sources a{text-decoration:underline;text-underline-offset:3px;color:var(--ink-muted)}
@media(max-width:560px){.content-prose{font-size:17px}}
</style>
