<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import gsap from "gsap";
import type { ContentMeta } from "../content";
import { useMotionPolicy } from "../composables/useMotionPolicy";
import NoteReader from "./NoteReader.vue";
const props = defineProps<{ entry: Readonly<ContentMeta> | undefined }>();
const emit = defineEmits<{ close: [] }>();
const dialog = ref<HTMLDialogElement | null>(null);
const displayed = ref<Readonly<ContentMeta> | undefined>(props.entry);
let trigger: HTMLElement | null = null;
let animation: gsap.core.Tween | undefined;
const canAnimate = useMotionPolicy(motionChanged);
function finishClose() {
  dialog.value!.close();
  document.documentElement.classList.remove("reading-open");
  if (trigger?.isConnected && trigger !== document.body) trigger.focus({ preventScroll: true });
  else document.getElementById('main-content')!.focus({ preventScroll: true });
  displayed.value = undefined;
}
onMounted(() => watch(() => props.entry, async (entry, _previous, onCleanup) => {
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
    if (canAnimate()) {
      animation = gsap.fromTo(element, { x: 32, opacity: 0 }, { x: 0, opacity: 1, duration: .36, ease: "power3.out" });
    } else gsap.set(element, { clearProps: "transform,opacity" });
  } else if (dialog.value?.open) {
    if (!canAnimate()) finishClose();
    else animation = gsap.to(dialog.value, { x: 14, opacity: 0, duration: .18, ease: "power2.in", onComplete: finishClose });
  }
}, { immediate: true, flush: "post" }));
function backdrop(event: MouseEvent) { if (event.target === dialog.value) { const rect = dialog.value!.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) emit("close"); } }
function motionChanged() { animation?.kill(); if (props.entry) gsap.set(dialog.value!, { clearProps: "transform,opacity" }); else if (dialog.value?.open) finishClose(); }
onUnmounted(() => { animation?.kill(); document.documentElement.classList.remove("reading-open"); });
</script>
<template>
  <dialog ref="dialog" class="reader" aria-labelledby="reader-title" @cancel.prevent="emit('close')" @click="backdrop">
    <template v-if="displayed">
      <header class="reader-top"><span>OH, OHIO / GUIDE NOTES</span><button class="reader-close" autofocus aria-label="Close article" @click="emit('close')">Close <span aria-hidden="true">×</span></button></header>
      <Suspense :key="displayed.slug"><NoteReader :slug="displayed.slug" /><template #fallback><p class="reader-article">Opening story…</p></template></Suspense>
    </template>
  </dialog>
</template>
