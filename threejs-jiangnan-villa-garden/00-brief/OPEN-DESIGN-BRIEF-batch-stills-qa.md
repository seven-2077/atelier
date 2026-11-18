# OpenDesign 本批（约 1 小时）：三时段静帧与诚实验收

这是同一条园林工程的收尾批次，不要新开项目，不要换模型。模型必须仍是 **v4.1-flash-eco**。工作目录必须仍是 `./`。只写这个目录。不要改 `./` 和 `/workspace/threejs-konbini-shinkai-v2`。不要同步笔记本，不要推仓库。不要打开系统 Chrome 预览窗。

默认机位和大落位不要改。若前几批留下的未达线还很明显，先做小幅打磨再截帧，不要重做构图。

## 本批要做的

1. `npm run build` 必须通过。
2. 必须实际跑起来。用无头 Chrome / puppeteer-core 截三张默认机位 1920×1080 静帧，不要打开系统 Chrome 窗口：
   - `01-refs/still-daylight.png`
   - `01-refs/still-golden-hour.png`
   - `01-refs/still-after-dark.png`
3. 预览端口仍是 **5181**，host 127.0.0.1，strictPort。不要占用或杀掉 5174、5175、5180。
4. 写诚实的 `.//00-brief/QA-REPORT.md`：已达线和未达线分开写，未完成的不要标成已交付。完成度对照 `/workspace/aether-standards/miniature-diorama-quality-bar.md`。

本批结束条件：三张官方静帧齐，构建通过，QA-REPORT 如实写完。
