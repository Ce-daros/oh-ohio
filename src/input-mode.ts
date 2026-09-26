/**
 * Tracks whether the visitor is currently driving the page with the
 * keyboard or a pointer. The current mode is mirrored on
 * `html[data-input=...]` for CSS, and interested code subscribes via
 * onInputModeChange instead of listening for document-wide events.
 * Notifications fire only when the mode actually changes.
 */
type InputMode = 'keyboard' | 'pointer';

let mode: InputMode = 'pointer';
let started = false;
const listeners = new Set<() => void>();

export function inputMode(): InputMode {
  return mode;
}

export function onInputModeChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function setMode(next: InputMode) {
  if (mode === next) return;
  mode = next;
  document.documentElement.dataset.input = next;
  for (const listener of [...listeners]) listener();
}

export function startInputModeTracking(): () => void {
  if (started || typeof document === 'undefined') return () => {};
  started = true;
  const keyboard = () => setMode('keyboard');
  const pointer = () => setMode('pointer');
  document.addEventListener('keydown', keyboard);
  document.addEventListener('pointerdown', pointer);
  return () => {
    document.removeEventListener('keydown', keyboard);
    document.removeEventListener('pointerdown', pointer);
    started = false;
  };
}
