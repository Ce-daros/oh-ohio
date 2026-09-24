<script setup lang="ts">
import SceneCanvas from "./SceneCanvas.vue";
import type { SceneGroup } from "../../catalog";
defineProps<{ groups: SceneGroup[]; selected: string }>();
defineEmits<{ select: [id: string] }>();
</script>
<template>
  <SceneCanvas world="make" :groups="groups" :selected="selected" alt="An illustrated Ohio industry exhibition with a factory, aircraft, laboratories, farms, and railways" @select="$emit('select',$event)">
    <svg class="industry-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line v-for="group in groups.filter(item => item.id !== 'work')" :key="group.id" x1="47" y1="46" :x2="group.x" :y2="group.y" :class="{active: selected === group.id || selected === 'work'}" vector-effect="non-scaling-stroke" /></svg>
    <div class="machine-crosshair crosshair-one" aria-hidden="true">+</div><div class="machine-crosshair crosshair-two" aria-hidden="true">+</div><span class="scene-imprint">THE WORKSHOP / OHIO</span>
  </SceneCanvas>
</template>
