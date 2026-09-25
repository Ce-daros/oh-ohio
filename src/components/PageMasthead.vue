<script setup lang="ts">
defineProps<{ label: string; description: string; titleStyle?: 'roman' | 'italic' }>();
</script>
<template>
  <header class="page-masthead">
    <div class="masthead-kicker"><RouterLink to="/">OH, OHIO</RouterLink><span aria-hidden="true">/</span><span>{{ label }}</span></div>
    <div class="masthead-line"><h1 :class="{ 'masthead-italic': titleStyle === 'italic' }"><slot name="title" /></h1><p>{{ description }}</p></div>
    <nav v-if="$slots.actions" class="masthead-actions" :aria-label="`${label} navigation`"><slot name="actions" /></nav>
  </header>
</template>
<style scoped>
.page-masthead{max-width:var(--page-width);margin:auto;padding:36px var(--page-gutter) 28px}
.masthead-kicker{display:flex;align-items:center;gap:17px;color:var(--ink);font-size:12px;font-weight:650;letter-spacing:.14em;line-height:1.5}.masthead-kicker>span:last-child{color:var(--accent)}.masthead-kicker a:hover{text-decoration:underline;text-underline-offset:5px}
.masthead-line{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:45px;align-items:end;margin-top:22px;min-height:120px}.masthead-line h1{font-size:clamp(66px,8.4vw,120px);font-weight:600;letter-spacing:-.065em;line-height:1.05;min-width:0}.masthead-line h1.masthead-italic{font-family:var(--font-editorial);font-weight:400;font-style:italic}.masthead-line :deep(em){color:var(--accent)}.masthead-line :deep(.title-period){color:var(--accent)}.masthead-line>p{font:400 18px/1.65 var(--font-body);color:var(--ink-soft);max-width:25ch;margin:0 0 9px;letter-spacing:normal}
.masthead-actions{display:flex;align-items:center;gap:30px;border-bottom:1px solid var(--rule);margin-top:28px;min-height:55px}.masthead-actions :deep(a){display:inline-flex;align-items:center;gap:10px;color:var(--ink-muted);font:400 14px/1.5 var(--font-body);padding:16px 0;border-bottom:2px solid transparent;margin-bottom:-1px;min-height:55px}.masthead-actions :deep(a[aria-current]){color:var(--accent);border-bottom-color:var(--accent)}.masthead-actions :deep(a:hover){color:var(--accent)}.masthead-actions :deep(a:last-child){margin-left:auto}.masthead-actions :deep(a span){font-size:12px}
@media(max-width:950px){.masthead-line{grid-template-columns:minmax(0,1fr) 210px;gap:30px;min-height:100px}.masthead-line h1{font-size:clamp(64px,8.5vw,85px)}.masthead-line>p{font-size:17px}}
@media(max-width:650px){.page-masthead{padding-top:27px;padding-bottom:24px}.masthead-kicker{font-size:11px;gap:14px}.masthead-line{grid-template-columns:1fr;gap:17px;min-height:0;margin-top:22px}.masthead-line h1{font-size:clamp(52px,11vw,70px);line-height:1.04}.masthead-line>p{max-width:34ch;font-size:16px;margin:0}.masthead-actions{gap:22px;flex-wrap:wrap;margin-top:23px;min-height:50px}.masthead-actions :deep(a){font-size:13px;padding:13px 0;min-height:48px}.masthead-actions :deep(a:last-child){margin-left:auto}}
@media(max-width:380px){.masthead-actions{gap:16px}.masthead-actions :deep(a){font-size:12px}}
</style>
