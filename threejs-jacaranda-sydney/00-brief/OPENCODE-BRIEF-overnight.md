# 今晚收口 brief — 蓝花楹微缩场景做到可验收

主人今晚休息，这轮不要停。构图与视觉方向已写在 `COMPOSITION.md`（用字一律「蓝花楹」，英文 Jacaranda）。按已定方向做完，不要等新指示。卡住就换思路继续。

独立工程：只改 `./`。不要动 `/workspace/threejs-konbini-shinkai-v2`。不要杀 5174。本项目端口 **5180**。不要同步笔记本，不要推仓库，不要打开系统 Chrome 载预览。

## 顺序
1. 先把默认机位 After Dark 方向静帧做够：奶油三层圆弧转角楼，前低后高、形态不同的两棵透气蓝花楹，门口 / 铁艺阳台 / 紫色长椅可读，左侧杂志文字不被吞。禁止圆球树冠、方盒子楼、荧光霓虹、假神光片、Tato/水印/点赞。柔和三渲二。静帧 1920×1080 存 `01-refs/direction-still-v1.png`。
2. 再补交互，不要停在一张静帧上交差：
   - 白天 / 黄昏 / 夜晚平滑切换（色板见 COMPOSITION.md）
   - 自由旋转与缩放，有限位，任何机位都不得把门口、阳台、长椅藏进花里
   - 少量飘落花瓣
   - 英文生活方式杂志排版，不是产品落地页或游戏 UI
3. 必须实际跑起来，截图自检树形、建筑比例、遮挡、灯光和三段切换，发现问题就针对性改。
4. 过关后再存三段静帧：
   - `01-refs/still-after-dark.png`（可与 direction-still-v1 为同一构图的最终夜景）
   - `01-refs/still-daylight.png`
   - `01-refs/still-golden-hour.png`
   并更新 `00-brief/DIRECTION-STILL-REPORT.md` 或写 `00-brief/QA-REPORT.md`，诚实写自检，不要写过满。

`npm run build` 必须通过。预览：`cd 02-scene && npx vite --host 127.0.0.1 --port 5180 --strictPort`。
