<script setup lang="ts">
import SceneCanvas from "./SceneCanvas.vue";
import type { SceneGroup } from "../../catalog";
defineProps<{ groups: SceneGroup[]; selected: string }>();
defineEmits<{ select: [id: string] }>();
</script>
<template><SceneCanvas world="explore" :groups="groups" :selected="selected" alt="An illustrated journey through Ohio's lake coast, cities, and wooded hills" @select="$emit('select',$event)"><div class="map-compass" aria-hidden="true"><span>N</span><span>↑</span></div><span class="scene-imprint">40° N / 83° W</span></SceneCanvas></template>
