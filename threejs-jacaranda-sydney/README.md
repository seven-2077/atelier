# 蓝花楹 · 悉尼街角

Three.js 实时场景半成品：一处开花蓝花楹下的悉尼街角微缩，默认锁定机位，可在白日、金辉、入夜三种光线间切换。尚未作为工坊成品验收，先入库便于以后接着改。

## 怎么打开

```bash
cd 02-scene
npm install
npm run dev
```

浏览器打开 http://127.0.0.1:5180 。拖拽在限位内环视，滚轮缩放；左下可切换白日 / 金辉 / 入夜。

## 项目结构

- `00-brief/` 构图说明、布置稿、质检与方向静帧报告。风格对照原图未入库。
- `01-refs/` 本场景导出的过程静帧：`still-daylight-v2.png`、`still-golden-hour-v2.png`、`still-after-dark-v2.png`。
- `02-scene/` 可运行源码（Vite + TypeScript + Three.js）。
  - `index.html`、`package.json`、`vite.config.ts`、`tsconfig.json` 工程入口与配置。
  - `src/main.ts` 启动、相机限位与光线切换。
  - `src/site.ts` 场地布局。
  - `src/building.ts` 建筑。
  - `src/jacaranda.ts` 蓝花楹树。
  - `src/petals.ts` 落花。
  - `src/sky.ts` 天空。
  - `src/textures.ts` 纹理。
  - `src/palettes.ts` 时段色彩。
  - `src/rng.ts` 随机数。
  - `src/style.css` 页面样式。
  - `scripts/capture-still.mjs` 静帧导出。

`node_modules`、构建产物和对照原图不在本目录。在 `02-scene` 里执行 `npm install` 即可安装依赖。本场景占用 5180 端口，与便利店（5174）、园林（5181）错开。
