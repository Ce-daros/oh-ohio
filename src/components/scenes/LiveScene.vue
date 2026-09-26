<script setup lang="ts">
import SceneCanvas from "./SceneCanvas.vue";
import type { SceneGroup } from "../../content";
defineProps<{ groups: SceneGroup[]; selected: string }>();
defineEmits<{ select: [id: string] }>();
</script>
<template><SceneCanvas world="live" :groups="groups" :selected="selected" alt="An illustrated Ohio neighborhood with a university, library, public institutions, houses, and a community square" @select="$emit('select',$event)"><span class="scene-imprint">AROUND THE NEIGHBORHOOD</span><span class="neighborhood-mark" aria-hidden="true">OH / 04</span></SceneCanvas></template>
