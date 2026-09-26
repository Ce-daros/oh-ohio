<script setup lang="ts">
import SceneCanvas from "./SceneCanvas.vue";
import type { SceneGroup } from "../../content";
defineProps<{ groups: SceneGroup[]; selected: string }>();
defineEmits<{ select: [id: string] }>();
</script>
<template><SceneCanvas world="culture" :groups="groups" :selected="selected" alt="An illustrated collection room with records, art, books, food, and sports keepsakes" @select="$emit('select',$event)"><span class="scene-imprint">GOOD COMPANY / GOOD STORIES</span><span class="collection-corner" aria-hidden="true">♡</span></SceneCanvas></template>
