<script setup lang="ts">
import type { WorldId } from "../content";
defineProps<{ world: WorldId }>();
const objects = { explore: { file: "camera", alt: "Ohio-chan's navy and cream camera" }, make: { file: "whistle", alt: "A brass whistle with a navy cord" }, culture: { file: "record", alt: "A vinyl record in its illustrated sleeve" }, live: { file: "backpack", alt: "Ohio-chan's canvas day bag" } };
</script>
<template>
  <div class="guide-keepsake">
    <div class="keepsake-object"><span aria-hidden="true"></span><img :src="`/art/small/prop-${objects[world].file}.webp`" :alt="objects[world].alt" width="150" height="150" loading="lazy" /></div>
    <div class="keepsake-signature"><span>YOUR GUIDE</span><strong>Ohio-chan</strong><span aria-hidden="true">♡</span></div>
  </div>
</template>
<style scoped>
.guide-keepsake{display:flex;align-items:center;justify-content:center;gap:18px;border-bottom:1px solid #ccd5d7;margin-top:26px;padding:10px 0 18px}.keepsake-object{position:relative;isolation:isolate;width:115px;height:112px;flex:none}.keepsake-object>span{position:absolute;inset:18px 7px 4px;border-radius:50%;background:#ffffff7d;z-index:-1}.keepsake-object img{width:100%;height:100%;object-fit:contain;transform:rotate(-8deg)}.keepsake-signature{display:flex;flex-direction:column;align-items:flex-start;gap:6px;flex:none}.keepsake-signature>span:first-child{font-size:8px;letter-spacing:.18em;color:#677583}.keepsake-signature strong{font:italic 23px Georgia,serif;letter-spacing:-.04em}.keepsake-signature>span:last-child{color:var(--accent);font:26px/1 Georgia,serif}
@media(max-width:1100px){.guide-keepsake{gap:12px}.keepsake-object{width:96px;height:96px}.keepsake-signature strong{font-size:21px}}
@media(max-width:560px){.guide-keepsake{max-width:300px;margin:24px auto 0;gap:25px}.keepsake-object{width:120px;height:115px}.keepsake-signature strong{font-size:24px}}
</style>
