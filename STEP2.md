# STEP 2 — 剩余工作清单

> 交接文档。第二步的核心（内容管线进 Vite 插件 + 虚拟模块）已完成并提交，
> 见 `fb2d93b`（虚拟模块 + 结构断言）和 `19262b5`（lib 抽取）。本文档记录
> 剩余任务、实现要点和验收标准，按顺序执行，每个任务独立 commit，commit 后
> CI 必须绿。

## 已定决策（勿翻案）

- **不引入 zod**：`scripts/lib/content.mjs` 的校验逻辑被 17 个 fault-injection
  测试保护，翻译成 zod 是纯风险无收益。
- **不上 vite-ssg**：与正文按需 chunk 方案冲突；其最大收益（关键 CSS 内联）
  由 critters 单独拿下（见任务 6，可跳过）。
- **虚拟模块架构已落地**：manifest/routes/coverage 由
  `scripts/vite-plugin-content.mjs` 在内存计算并提供，派生 JSON 一律不进 Git，
  不要重新引入 `--check` 式新鲜度校验。

## 关键文件（现状）

- `scripts/lib/content.mjs` — 单一内容管线：`computeManifest` /
  `computeCatalog`（含 vercel 配置）/ `computeCoverage` / `validateContent` /
  `verifyVercelConfig`
- `scripts/vite-plugin-content.mjs` — buildStart 校验 + 虚拟模块
  （`virtual:content-manifest` / `virtual:routes` / `virtual:coverage`）+
  dev watcher + writeBundle 结构断言
- `src/virtual-content.d.ts` — 虚拟模块类型声明
- `scripts/build.mjs` — 5 步：vue-tsc → vite client → vite ssr → prerender → verify
- `dist-baseline/` — 第一步结束时的构建产物基线（gitignored），最终验收 diff 用

---

## 任务 1：`serve-dist.mjs` → `vite preview`

**目标**：删除 49 行自写静态服务器，preview 语义（重定向/404）由 Vite 中间件实现。

- `vite.config.ts`（或独立小插件）加 `configurePreviewServer` 钩子：
  - 从 `computeCatalog(cwd).catalog.redirects` 实现 308 重定向，保留 query（与 vercel.json 同一来源）；
  - 尾斜杠 308：`/make/` → `/make`（`trailingSlash: false` 语义）；
  - 404 fallback：静态文件未命中时返回 `dist/404.html` 内容 + 404 状态
    （`appType: 'mpa'`，否则 SPA fallback 会把未知路径变 200）。
- `scripts/prerender-http.test.mjs`：用 Vite 的 preview API 起服务器
  （`import { preview } from 'vite'`，`port: 0`，取 `server.resolvedUrls`），
  断言逻辑不变。
- 删 `scripts/serve-dist.mjs`；`package.json` 的 `preview` 改为
  `vite preview --host 0.0.0.0`。
- **验收**：3 个 HTTP 测试全绿（重定向 308 + query 保留、尾斜杠、真实 404 noindex）。

## 任务 2：`@unhead/vue` 替换手写 head 系统

**目标**：删除 `src/head.ts` + `router.ts` 的 `setHeadMeta`/`updateHead`/
`MANAGED_META` 手工同步，标签增删去重交给 unhead。依赖已安装（^3.4.1）。

- `main.ts`：`app.use(createHead())`；`entry-server.ts`：每请求
  `createHead()`，渲染后用 `renderSSRHead(head)` 取标签。
- 路由 meta → head 的转换（现在 `entry-server.ts:14-21` 与 `router.ts:68-76`
  重复的 8 行）收敛为一处：unhead 的 `useHead()` 在页面 setup 里调用，或保留
  一个 `routeHeadInput(route)` 辅助函数喂给 `head.push()`。
- `scripts/prerender.mjs` 的 `pageHtml`：`result.head`（现在是 `headMarkup`
  字符串）改为 unhead SSR 渲染输出，注入点仍是 `<!--page-head-->`。
- `<title>` 和 description meta 的模板替换逻辑保持。
- **验收**：build 全绿；prerender-verify 的 canonical/og:url/noindex 检查绿；
  抽 diff 几个页面与 `dist-baseline`，差异应仅限 tag 顺序/格式。

## 任务 3：`@vueuse/core` 逐点替换（已安装 ^15，克制使用）

- `src/composables/useReadingList.ts`：手写 localStorage JSON 解析 +
  storage 事件监听 → `useLocalStorage`（它原生处理坏 JSON 与跨 tab 同步）。
  `ready` 语义需保留（SSR 下不同步读取）。
- `src/pages/ContentPage.vue`：`window.addEventListener('scroll'/'resize')`
  手动清理 → `useEventListener`（保留 headings 短路逻辑）。
- `src/composables/home/useHomeSections.ts` 里裸 `addEventListener` 的
  pointer 绑定可在拆分时一并换成 `useEventListener`（见任务 4）。
- `input-mode.ts` 是模块级单例，改造收益小——可选，不强制。

## 任务 4：模块化拆分（纯重构，行为零变化）

1. **`src/composables/home/useHomeSections.ts`（217 行，5 种职责）**：
   - `homeSections` 数据常量 → `src/components/home/sections.ts`；
   - `bindPointer` → `useHomePointer`；
   - GSAP pin/scrub/入场编排 + IO 兜底 → `useHomeChoreography`；
   - active 高亮的 scroll/resize/rAF → `useHomeNav`；
   - `HomePage.vue` 组合三者。拆完顺手把 magic number（`.12/.22`、`+=55%`、
     `blur(8px)` 等）提为命名常量。
2. **`src/worlds.css`（206 行 append-only）**：按职责拆 4 个文件
   （scene + hotspots / selection 侧栏 / per-world 主题变量 / reader
   dialog），`worlds.css` 保留为 `@import` 入口（或 main.ts 直接 import 四个）。
3. **`src/components/ContentBody.vue`（11 种 block 的 14 级 if 链）**：
   拆 `src/components/blocks/*.vue`，全部同步 import（仍在 ContentPage 的
   lazy chunk 内，不影响 bundle 结构断言）。illustration 与 video 可共享
   一个 `MediaFigure`。
- **验收**：build/test/lint 绿；writeBundle 结构断言仍通过（chunk 数不变）；
  抽查首页/世界页/文章页动画与布局无回归。

## 任务 5：linkinator 内链检查（已安装 ^8.1）

- `package.json` 加 `"check:links": "linkinator dist --recurse --skip '^https?://'"`（只查内链；远程 HEAD 检查已有 `check:remote-media`，保留）。
- CI（`.github/workflows/ci.yml`）在 build 之后加一步。
- **验收**：CI 绿；人为制造一个死链确认它能抓到。

## 任务 6（可选）：critters 关键 CSS 内联

critters 维护停滞，与 Vite 8 的兼容性存疑——先 spike（半小时），
能跑通就给 127 个预渲染页内联关键 CSS（LCP 收益），跑不通直接跳过并记录。

## 任务 7（门控）：Pagefind

先回答"搜索功能要不要长大"。要：接入 Pagefind、删 `src/content/search.ts`
与搜索数据载荷；不要：跳过（当前 38 行搜索不值得引入索引器）。

---

## 最终验收（全部任务完成后）

1. `npm run build && npm test && npm run lint` 全绿，CI 绿。
2. `diff -r dist dist-baseline` 逐页核对：预期差异仅限 head tag 顺序/格式、
   资源 hash；正文 HTML、canonical、og、noindex、404 行为必须一致。
3. 核对后删除 `dist-baseline/`。
4. README 补 `check:links` 与 preview 语义变更。
