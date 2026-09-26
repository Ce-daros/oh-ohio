<script setup lang="ts">
import { queryContent } from "../../content";
const phrases = queryContent({ kind: 'phrase' });
defineEmits<{ read: [event: MouseEvent, slug: string] }>();
</script>
<template>
  <section class="word-collection" aria-labelledby="words-title">
    <div data-reveal><p class="eyebrow">A FEW LOCAL WORDS</p><h2 id="words-title">Say <em>what?</em></h2></div>
    <div class="word-slips"><a v-for="(phrase,index) in phrases" :key="phrase.id" :href="phrase.canonicalPath" :style="{'--slip-angle':`${index % 2 ? 3 : -3}deg`}" @click="$emit('read', $event, phrase.slug)"><span>0{{ index+1 }}</span><strong>“{{ phrase.title }}”</strong><span>What does it mean? ↗</span></a></div>
  </section>
</template>
<style scoped>
.word-slips a{min-width:0;height:195px;background:#ffe4a9;color:#28354a;padding:20px 15px;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;text-align:left;transform:rotate(var(--slip-angle))}
.word-slips a:nth-child(2){background:#c9dfeb}.word-slips a:nth-child(3){background:#f4c2ca}.word-slips a:nth-child(4){background:#d3dfcc}
.word-slips a>span{font-size:13px}.word-slips a:hover{outline:1px solid var(--accent)}
@media(max-width:560px){.word-slips a{height:170px}}
</style>
