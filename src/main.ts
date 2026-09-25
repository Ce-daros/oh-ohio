import { createSiteApp } from './app';

const initialUrl = window.location.pathname + window.location.search + window.location.hash;
const hydrationPath = window.location.pathname;
const prerendered = Boolean(document.querySelector('#app main'));
const { app, router } = createSiteApp(prerendered ? hydrationPath : undefined, prerendered);
await router.isReady();
app.mount('#app');
if (prerendered && initialUrl !== hydrationPath) await router.replace(initialUrl);
