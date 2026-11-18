# 江南晚春花园别墅微缩

Three.js 实时场景半成品。2026-11-11（Asia/Shanghai）已宣布结束制作，先入库便于以后接着改，这不是交差验收。

## 怎么打开

```bash
cd 02-scene
npm install
npm run dev
```

浏览器打开 http://127.0.0.1:5181 。左键拖拽观察，滚轮推拉。

导出一张方向静帧（可选）：

```bash
cd 02-scene
npm run capture
```

## 项目结构

- `00-brief/` 任务说明、构图、各批次布置和方向静帧报告。
- `01-refs/` 过程静帧。目前只放了金辉时段方向帧 `direction-still-golden-hour-v2.png`。对照原图未入库。
- `02-scene/` 可运行源码（Vite + TypeScript + Three.js）。
  - `index.html`、`package.json`、`vite.config.ts`、`tsconfig.json` 工程入口与配置。
  - `src/main.ts` 启动与相机交互。
  - `src/world.ts` 场景组装。
  - `src/flora.ts` 植物与园林要素。
  - `src/materials.ts` 材质。
  - `src/textures.ts` 纹理。
  - `src/lighting.ts` 光照。
  - `src/sky.ts` 天空。
  - `src/config.ts` 场景配置。
  - `src/style.css` 页面样式。
  - `scripts/capture-still.mjs` 静帧导出；`scripts/gl-probe.mjs`、`scripts/gl-probe2.mjs` 为检查脚本。
  - `public/fonts/` 页面字体。

`node_modules`、构建产物和对照原图不在本目录。在 `02-scene` 里执行 `npm install` 即可安装依赖。
