<script setup lang="ts">
import type { CharacterId } from "../catalog";
defineProps<{
  chapter: CharacterId;
  alt: string;
  sizes: string;
  priority?: boolean;
}>();
</script>
<template>
  <img
    :src="`/art/characters/${chapter}.webp`"
    :srcset="`/art/characters/${chapter}-480.webp 480w, /art/characters/${chapter}-960.webp 960w`"
    :sizes="sizes"
    :alt="alt"
    width="800"
    height="1000"
    :loading="priority ? 'eager' : 'lazy'"
    :fetchpriority="priority ? 'high' : 'auto'"
  />
</template>
