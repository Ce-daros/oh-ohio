import { createApp, createSSRApp } from 'vue';
import App from './App.vue';
import { createSiteRouter } from './router';
import './style.css';
import './worlds.css';

export function createSiteApp(hydrationPath?: string, hydrate = true) {
  const app = hydrate ? createSSRApp(App) : createApp(App);
  const router = createSiteRouter(hydrationPath);
  app.use(router);
  return { app, router };
}
