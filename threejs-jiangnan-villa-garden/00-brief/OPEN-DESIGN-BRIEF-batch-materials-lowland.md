# OpenDesign 本批（约 1 小时）：补材质和低地

这是同一条园林工程的当前批次，不要新开项目，不要换模型。模型必须仍是 **v4.1-flash-eco**。工作目录必须仍是 `./`。只写这个目录。不要改 `./` 和 `/workspace/threejs-konbini-shinkai-v2`。不要同步笔记本，不要推仓库。不要打开系统 Chrome 预览窗。

本批只做材质和低地，不要一次把三段光、限位交互、落花、三时段官方静帧整包做完。默认机位和大落位已经锁定，不要改。

先只读：

- `.//00-brief/COMPOSITION.md`
- `.//00-brief/BRIEF.md`
- `.//00-brief/DIRECTION-STILL-REPORT.md`
- `.//00-brief/QUEUE.md`
- `/workspace/aether-standards/miniature-diorama-quality-bar.md`
- 默认机位黄昏静帧 `.//01-refs/direction-still-golden-hour.png`

完成度对照蓝花楹那一档，不抄那栋楼和树。

## 本批要改的

对照已出的黄昏静帧和 `DIRECTION-STILL-REPORT.md`，只补这些未达线：

1. 把浅池的范围和岸线做清楚，水面要能读出，并能映一点暖灯与天色；石桥要像跨过水的石板桥，不要深色地面上的一块踏板。
2. 把低地补满：花窗、错落太湖石、石桌凳要能看见，池周不要大块空地。高地与低地都要有完整设计，禁止光秃斜坡。
3. 罗汉松改成深青针叶成簇，不要灰白枯枝感。
4. 天空去掉海报式硬切渐变，加强一点空气感；窗玻璃要能倒出天空；芭蕉减少大切面体块感。

改完后必须实际跑起来。预览端口仍是 **5181**，host 127.0.0.1，strictPort。不要占用或杀掉 5174、5175、5180。用无头 Chrome / puppeteer-core 重新截取一张默认机位 1920×1080 黄昏静帧，保存为 `01-refs/direction-still-golden-hour.png`（或另存 `direction-still-golden-hour-v2.png`，不要覆盖与本轮无关的已锁文件）。不要打开系统 Chrome 窗口。

本批结束条件：上述四处未达线有可见改进，并留下一张更新后的黄昏静帧。不要开始做白天／夜晚切换、限位旋转缩放、落花，也不要写官方三时段静帧或把本批标成整包交差。
