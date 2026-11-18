# 方向静帧 brief（只做构图，不铺完整交互）

在 `./` 新建独立的 Vite + TypeScript + Three.js 页面，做出默认机位的 After Dark 方向静帧。先读并遵守 `.//00-brief/COMPOSITION.md`，对照 `.//00-brief/ref-jacaranda-days-scene.jpg` 的构图与气质，不要抄水印、品牌、「Tato」、右侧点赞/加号/数字。

## 绝对不要做
- 不要改、不要覆盖 `/workspace/threejs-konbini-shinkai-v2`（日曜便利店）里的任何文件。
- 不要杀占用 5174 的 dev 预览（那是另一个工程）。本项目用 **5180** 端口：`vite --host 127.0.0.1 --port 5180 --strictPort`。
- 不要同步笔记本，不要推仓库，不要打开系统 Chrome 去载预览页（GPU 会被掐死）。截帧用 puppeteer-core + 已安装的 Chrome，参照便利店工程的 `capture-still` 思路另写一份到本项目 `02-scene/scripts/`，输出指定路径。
- 不要做时段切换、轨道旋转、落花动画、多机位按钮。锁死默认机位，出一张静帧就够。
- 不要圆球树冠、不要复制粘贴同一棵树、不要现代方盒子楼、不要荧光霓虹、不要假神光片。

## 要做的
1. 工程放在 `/workspace/threejs` 不行，必须是 `02-scene`。sRGB + ACESFilmic。
2. 按 COMPOSITION.md 搭：深色街角地台（近侧+右侧马路虚线）、奶油三层连续圆弧转角楼、精致铁艺阳台、圆弧双开门、紫色长椅、门口小架子、两棵形态不同的蓝花楹（前低后高，树干弯曲分叉，花簇沿细枝，繁茂透气）。
3. 门口、阳台、长椅必须在默认机位里可读，不被花挡住；左上刊名/标题不被树冠吞掉。
4. After Dark 灯光：深蓝紫天空，窗和门廊暖溢光，路灯从枝叶间局部照到花瓣/树干/铺地。风格是柔和细腻的三渲二，不是写实照片，也不是低模游戏。
5. 左侧英文杂志排版（HTML 叠加即可）：Sydney / Jacaranda Days 气质，文案按 COMPOSITION.md 自拟，不要做成产品落地页或游戏 UI，右边不要社交控件。
6. `npm run build` 必须通过。然后截默认机位静帧，覆盖另存为：
   `.//01-refs/direction-still-v1.png`
   画幅 1920×1080。再写短报告 `.//00-brief/DIRECTION-STILL-REPORT.md`（机位参数、自检门口/阳台/长椅是否可读、树是否还像圆球、有没有挡字）。

对照参照是为了对构图、比例、冷暖关系；不要把参照图当贴图贴上，不要复刻门牌数字，不要把别人的界面搬过来。
