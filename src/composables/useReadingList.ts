import { inject, onMounted, provide, readonly, ref, type InjectionKey, type Ref } from "vue";
import { useLocalStorage } from "@vueuse/core";

interface ReadingList {
  ids: Readonly<Ref<readonly string[]>>;
  ready: Readonly<Ref<boolean>>;
  toggle: (id: string) => void;
}
const key: InjectionKey<ReadingList> = Symbol("reading-list");
const storageKey = "oh-ohio:reading-list";

export function provideReadingList() {
  // initOnMounted keeps hydration honest: the stored list is read only
  // after mount, so prerendered markup and the first client render agree.
  // Cross-tab sync and malformed stored JSON are handled by useStorage.
  const ids = useLocalStorage<string[]>(storageKey, [], { initOnMounted: true, writeDefaults: false });
  const ready = ref(false);
  onMounted(() => { ready.value = true; });
  provide(key, {
    ids: readonly(ids), ready: readonly(ready),
    toggle(id) {
      ids.value = ids.value.includes(id) ? ids.value.filter(item => item !== id) : [...ids.value, id];
    },
  });
}

export function useReadingList() { return inject(key)!; }
