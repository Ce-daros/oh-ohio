import { createSSRApp } from 'vue';
import App from './App.vue';
import { createSiteRouter } from './router';
import './style.css';
import './worlds.css';

export function createSiteApp() {
  const app = createSSRApp(App);
  const router = createSiteRouter();
  app.use(router);
  return { app, router };
}
