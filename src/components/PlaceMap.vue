<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { places } from '../content';

const props = defineProps<{ title: string; placeIds: string[]; caption: string }>();
const locations = computed(() => props.placeIds.map(id => places.find(place => place.id === id)!));
const ready = ref(false);
const opened = ref(false);
const canvas = ref<HTMLElement | null>(null);
let map: LeafletMap | undefined;
let disposed = false;
const bounds = computed(() => {
  const latitude = locations.value.map(place => place.coordinates!.lat);
  const longitude = locations.value.map(place => place.coordinates!.lon);
  return { north: Math.max(...latitude) + .001, south: Math.min(...latitude) - .001, west: Math.min(...longitude) - .001, east: Math.max(...longitude) + .001 };
});
const points = computed(() => {
  const centerLat = (bounds.value.north + bounds.value.south) / 2;
  const centerLon = (bounds.value.east + bounds.value.west) / 2;
  const longitudeScale = Math.cos(centerLat * Math.PI / 180);
  const scale = Math.min(500 / ((bounds.value.east - bounds.value.west) * longitudeScale), 230 / (bounds.value.north - bounds.value.south));
  return locations.value.map(place => ({
    x: 300 + (place.coordinates!.lon - centerLon) * longitudeScale * scale,
    y: 150 - (place.coordinates!.lat - centerLat) * scale,
  }));
});
const locationLink = (place: typeof locations.value[number]) => `https://www.openstreetmap.org/?mlat=${place.coordinates!.lat}&mlon=${place.coordinates!.lon}#map=16/${place.coordinates!.lat}/${place.coordinates!.lon}`;
onMounted(() => { ready.value = true; });
onUnmounted(() => { disposed = true; map?.remove(); });
async function openMap() {
  opened.value = true;
  const L = await import('leaflet');
  await nextTick();
  if (disposed) return;
  map = L.map(canvas.value!, { scrollWheelZoom: false, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  locations.value.forEach((place, index) => {
    const label = document.createElement('span');
    label.textContent = `${index + 1}. ${place.title}`;
    L.marker([place.coordinates!.lat, place.coordinates!.lon], {
      title: place.title,
      alt: place.title,
      icon: L.divIcon({ className: 'ohio-map-marker', html: String(index + 1), iconSize: [32, 32], iconAnchor: [16, 16] }),
    }).addTo(map!).bindPopup(label);
  });
  map.fitBounds(locations.value.map(place => [place.coordinates!.lat, place.coordinates!.lon]), { padding: [35, 35], maxZoom: 16, animate: false });
  canvas.value!.focus({ preventScroll: true });
}
</script>
<template>
  <figure class="place-map">
    <header><h3>{{ title }}</h3><button v-if="!opened" :disabled="!ready" @click="openMap">Explore map <span aria-hidden="true">↗</span></button></header>
    <div class="map-frame" :class="{'map-open':opened}">
      <svg v-if="!opened" viewBox="0 0 600 300" role="img" :aria-label="`${title}: locations plotted by latitude and longitude`">
        <path d="M50 35H550V265H50ZM50 150H550M175 35V265M300 35V265M425 35V265" fill="none" stroke="#cbd7d2" stroke-width="1" />
        <text x="566" y="32" class="north">N ↑</text>
        <g v-for="(point,index) in points" :key="placeIds[index]" :transform="`translate(${point.x} ${point.y})`"><circle r="15" /><text text-anchor="middle" dominant-baseline="central">{{ index + 1 }}</text></g>
        <text x="50" y="287" class="coordinate">{{ bounds.south.toFixed(3) }}° N</text><text x="550" y="287" text-anchor="end" class="coordinate">{{ Math.abs(bounds.west).toFixed(3) }}° W</text>
      </svg>
      <div v-show="opened" ref="canvas" class="map-canvas" tabindex="0" :aria-label="title"></div>
    </div>
    <figcaption>{{ caption }}</figcaption>
    <ol><li v-for="place in locations" :key="place.id"><a :href="locationLink(place)">{{ place.title }} <span aria-hidden="true">↗</span></a><span v-if="place.address">{{ place.address }}</span></li></ol>
  </figure>
</template>
<style scoped>
.place-map{margin:38px 0;border-block:1px solid var(--rule);padding:24px 0}.place-map header{display:flex;gap:20px;align-items:center;justify-content:space-between;margin-bottom:22px}.place-map h3{font-size:25px;line-height:1.25;color:var(--ink)}.place-map button{flex:none;background:var(--ink);color:white;border:0;padding:12px 16px;font-size:13px;display:flex;gap:18px;align-items:center;min-height:44px}.place-map button:disabled{visibility:hidden}.map-frame{position:relative;background:#e6ece7;min-height:300px;isolation:isolate}.map-frame svg{width:100%;height:300px;display:block}.map-frame svg circle{fill:var(--accent);stroke:white;stroke-width:2}.map-frame svg text{font:600 15px var(--font-body);fill:white}.map-frame svg .coordinate,.map-frame svg .north{font:12px var(--font-body);fill:var(--ink-soft)}.map-canvas{height:360px;z-index:0}.place-map figcaption{font-size:13px;color:var(--ink-muted);line-height:1.6;margin-top:12px}.place-map ol{padding-left:24px;margin:22px 0 0}.place-map li{padding:7px 0 7px 6px;font-size:16px;line-height:1.6}.place-map li::marker{color:var(--accent);font-size:13px}.place-map li>a{color:var(--ink);text-decoration:underline;text-underline-offset:4px}.place-map li>span{display:block;color:var(--ink-muted);font-size:13px}.place-map :deep(.ohio-map-marker){display:grid;place-items:center;background:var(--accent);color:white;border:2px solid white;border-radius:50%;font:600 14px var(--font-body);box-shadow:0 2px 6px #18243c35}.place-map :deep(.leaflet-control-attribution){font-size:11px}.place-map :deep(.leaflet-popup-content){font:14px/1.5 var(--font-body)}
@media(max-width:500px){.place-map header{align-items:start;flex-direction:column;gap:15px}.place-map h3{font-size:23px}.map-frame,.map-frame svg{min-height:240px;height:240px}.map-frame.map-open{height:300px}.map-canvas{height:300px}}
</style>

