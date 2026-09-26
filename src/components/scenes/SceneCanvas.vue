<script setup lang="ts">
import type { SceneGroup, WorldId } from "../../content";
import { computed } from "vue";
const props = defineProps<{ world: WorldId; groups: SceneGroup[]; selected: string; alt: string }>();
const point = computed(() => props.groups.find(group => group.id === props.selected)!);
defineEmits<{ select: [id: string] }>();
</script>
<template>
  <div :class="['scene-canvas', `canvas-${world}`]">
    <div class="scene-picture" data-parallax-art><img :src="`/art/scenes/${world}.webp`" :srcset="`/art/scenes/${world}-768.webp 768w, /art/scenes/${world}.webp 1536w`" sizes="(max-width: 800px) 90vw, 70vw" width="1536" height="1024" :alt="alt" fetchpriority="high" /></div>
    <div class="scene-vignette" aria-hidden="true"></div>
    <div class="scene-focus-plane" aria-hidden="true"><div class="scene-focus" :style="{transform:`translate(${point.x}%, ${point.y}%)`}"><span></span></div></div>
    <div class="mobile-scene-points" aria-hidden="true"><span v-for="(group,index) in groups" :key="group.id" :class="{active:group.id===selected}" :style="{left:`${group.x}%`,top:`${group.y}%`}">{{ String(index+1).padStart(2,'0') }}</span></div>
    <slot />
    <button v-for="(group, index) in groups" :key="group.id" class="scene-hotspot" :class="{selected: selected === group.id}" :style="{'--x':`${group.x}%`,'--y':`${group.y}%`}" :aria-pressed="selected === group.id" :aria-label="group.title" aria-controls="scene-selection" @click="$emit('select', group.id)"><span class="hotspot-dot" aria-hidden="true">{{ String(index + 1).padStart(2,'0') }}</span><span class="hotspot-label">{{ group.title }}</span></button>
  </div>
</template>
