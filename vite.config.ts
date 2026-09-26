import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { contentPlugin } from "./scripts/vite-plugin-content.mjs";
import { previewPlugin } from "./scripts/vite-plugin-preview.mjs";

export default defineConfig({ plugins: [vue(), contentPlugin(), previewPlugin()] });
