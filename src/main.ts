import { createSiteApp } from './app';

const { app, router } = createSiteApp();
await router.isReady();
app.mount('#app');
