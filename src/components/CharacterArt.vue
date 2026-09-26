<script setup lang="ts">
import type { CharacterId } from "../content";
defineProps<{
  character: CharacterId;
  alt: string;
  sizes: string;
}>();
</script>
<template>
  <img
    :src="`/art/characters/${character}.webp`"
    :srcset="`/art/characters/${character}-480.webp 480w, /art/characters/${character}-960.webp 960w`"
    :sizes="sizes"
    :alt="alt"
    width="800"
    height="1000"
    loading="lazy"
  />
</template>
