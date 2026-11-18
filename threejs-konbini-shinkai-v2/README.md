# 日曜コンビニ · Shinkai v2

新海诚气质街角便利店。本目录为推倒重做版；旧版 `threejs-konbini-nichiyou` 仅对照，勿删。

## M1 静帧（当前）

**一栋**便利店为主体，外围是草坡、樱花树、铁道与通勤列车，以及电线 / 路灯等日常诗意元素——不再围一圈邻店街区。天空 / 大气、湿沥青 Reflector 倒影、立面·招牌·橱窗·雨棚、灯光分层。默认**雨黄昏**（`timeOfDay = 0.735`, `weather = rain`）。

交互（门 / 商品 / HUD / Audio / glTF）在静帧过审后再接，尚未开始。

## 预览

```
cd 02-scene
npm i
npm run dev
```

浏览器打开终端地址（默认 `http://localhost:5174`）。左键拖拽观察，滚轮推拉。截一帧审审美即可。

## 项目结构

- `00-brief/` 任务与设计说明（BRIEF.md、DESIGN.md）
- `02-scene/` 可运行源码（Vite + TypeScript + Three.js）
  - `src/main.ts` 启动与相机
  - `src/env/` 环境与色板
  - `src/scene/` 场景集装：World、Facade、Interior、Goods、Props、Street、Lights、Nature、Distant
  - `src/shaders/` 天空、雨、雾、光柱、湿路面
  - `src/textures/makeTextures.ts` 纹理
  - `scripts/` 静帧导出
