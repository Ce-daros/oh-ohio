<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from "vue";
import gsap from "gsap";
import type { Entry } from "../catalog";
const props = defineProps<{ entry: Entry | undefined }>();
const emit = defineEmits<{ close: [] }>();
const dialog = ref<HTMLDialogElement | null>(null);
const displayed = ref<Entry>();
let trigger: HTMLElement | null = null;
let animation: gsap.core.Tween | undefined;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
function finishClose() {
  dialog.value!.close();
  document.documentElement.classList.remove("reading-open");
  if (trigger?.isConnected && trigger !== document.body) trigger.focus({ preventScroll: true });
  else document.querySelector<HTMLButtonElement>('.scene-hotspot[aria-pressed="true"]')!.focus({ preventScroll: true });
  displayed.value = undefined;
}
watch(() => props.entry, async (entry, _previous, onCleanup) => {
  let superseded = false;
  onCleanup(() => { superseded = true; });
  animation?.kill();
  if (entry) {
    displayed.value = entry;
    await nextTick();
    if (superseded) return;
    const element = dialog.value!;
    if (!element.open) {
      trigger = document.activeElement as HTMLElement;
      document.documentElement.classList.add("reading-open");
      element.showModal();
    }
    element.scrollTop = 0;
    if (!reduced.matches && document.documentElement.dataset.input !== "keyboard") {
      animation = gsap.fromTo(element, { x: 32, opacity: 0 }, { x: 0, opacity: 1, duration: .36, ease: "power3.out" });
    } else gsap.set(element, { clearProps: "transform,opacity" });
  } else if (dialog.value?.open) {
    if (reduced.matches || document.documentElement.dataset.input === "keyboard") finishClose();
    else animation = gsap.to(dialog.value, { x: 14, opacity: 0, duration: .18, ease: "power2.in", onComplete: finishClose });
  }
}, { immediate: true, flush: "post" });
function backdrop(event: MouseEvent) { if (event.target === dialog.value) { const rect = dialog.value!.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) emit("close"); } }
function motionChanged() { animation?.kill(); if (props.entry) gsap.set(dialog.value!, { clearProps: "transform,opacity" }); else if (dialog.value?.open) finishClose(); }
reduced.addEventListener("change", motionChanged);
document.addEventListener("ohio:motion-stop", motionChanged);
onUnmounted(() => { animation?.kill(); reduced.removeEventListener("change", motionChanged); document.removeEventListener("ohio:motion-stop", motionChanged); document.documentElement.classList.remove("reading-open"); });
</script>
<template>
  <dialog ref="dialog" class="reader" aria-labelledby="reader-title" @cancel.prevent="emit('close')" @click="backdrop">
    <template v-if="displayed">
      <header class="reader-top"><span>OH, OHIO / MY FIELD NOTES</span><button class="reader-close" autofocus aria-label="Close article" @click="emit('close')">Close <span aria-hidden="true">×</span></button></header>
      <article class="reader-article">
        <p class="eyebrow">{{ displayed.kicker }}</p><h2 id="reader-title">{{ displayed.title }}</h2><p class="reader-summary">{{ displayed.summary }}</p>
        <div class="reader-body"><p v-for="paragraph in displayed.body" :key="paragraph">{{ paragraph }}</p></div>
        <footer class="reader-sources"><h3>Sources</h3><a :href="displayed.url" target="_blank" rel="noopener noreferrer">{{ displayed.source }} ↗</a><a v-if="displayed.supportingUrl" :href="displayed.supportingUrl" target="_blank" rel="noopener noreferrer">{{ displayed.supportingSource }} ↗</a></footer>
        <span class="reader-signoff">OHIO-CHAN ♡</span>
      </article>
    </template>
  </dialog>
</template>
