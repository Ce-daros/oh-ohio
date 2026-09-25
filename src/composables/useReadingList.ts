import { inject, onMounted, onUnmounted, provide, readonly, ref, type InjectionKey, type Ref } from "vue";

interface ReadingList {
  ids: Readonly<Ref<readonly string[]>>;
  ready: Readonly<Ref<boolean>>;
  toggle: (id: string) => void;
}
const key: InjectionKey<ReadingList> = Symbol("reading-list");
const storageKey = "oh-ohio:reading-list";

export function provideReadingList() {
  const ids = ref<string[]>([]);
  const ready = ref(false);
  function read() {
    const stored = localStorage.getItem(storageKey);
    ids.value = stored === null ? [] : JSON.parse(stored);
    ready.value = true;
  }
  function sync(event: StorageEvent) {
    if (event.key === storageKey) read();
  }
  onMounted(() => { read(); window.addEventListener("storage", sync); });
  onUnmounted(() => window.removeEventListener("storage", sync));
  provide(key, {
    ids: readonly(ids), ready: readonly(ready),
    toggle(id) {
      ids.value = ids.value.includes(id) ? ids.value.filter(item => item !== id) : [...ids.value, id];
      localStorage.setItem(storageKey, JSON.stringify(ids.value));
    },
  });
}

export function useReadingList() { return inject(key)!; }
