# 本轮 OpenDesign Eco 速度与缓存记录

记录时间：2026-11-11 14:32（Asia/Shanghai）。来源是同一条对话里当前生产回合（run `2da31815-6730-484e-8027-e441094dfa60`，13:19 起）的步骤日志，不是官方公布值，也不是短生成基准。不要用 DeepSeek 自家 Flash 集群的 96% 缓存命中率来套。

## 布置原则（已按此执行）

- 必须一直用同一条 Eco 对话（Seven's workspace，`v4.1-flash-eco`），不要新开对话，以便前缀命中缓存。
- 每条指令不要整段粘贴已经在工程里的大文件，让模型读现有路径。
- 每批只做一件主题。当前批：补材质和低地。下一批：三段光。
- 按 Eco 比 Flash 更慢来估每小时约 1 小时的工作量，不要按 Flash 的速度塞满。
- 若本轮能看到 tok/s 或缓存命中，记下来并据此微调下一批。

## 这一轮看到的数字

- 稳定系统前缀：`promptCache.hit = true`。
- 170 个有用量的模型步：`cacheReadTokens` 中位数 111872，从约 57728 增到约 132736；新 `inputTokens` 中位数约 888。以 `cacheRead / (input + cacheRead)` 计，中位数约 99.3%。说明留在同一条对话里，前缀缓存是有效的。日志里 `cacheWriteTokens` 均为 0，不要过度解释。
- 短生成、关闭思考的外部实测（解码中位数约 139.5 tok/s）不能直接当本轮速度。本轮带着思考、且大量是短工具步：
  - 仅按 `outputTokens / 步耗时`：中位数约 20.5 tok/s，九成不超过约 60，最高一次约 123。
  - 生成量较大的步（输出 + 思考 ≥ 200 token）：仅输出中位数约 26 tok/s；输出 + 思考中位数约 69 tok/s，九成不超过约 95。
- 这更接近「实际很少稳定超过 80 tok/s」，明显慢于按 Flash 去排的一小时工作量。下一批仍只排一件主题（三段光），指令改短、只指向路径。

当前回合到 14:15 仍有模型步，进程仍在跑。不要把上述数字写成官方指标。

## 14:59 续记（同一条对话，run 2da31815… / session ses_e36f5eb74ffeWczJVMKHr9LLYu）

来源仍是步骤日志，不是官方指标。不要用 DeepSeek 自家 Flash 集群的缓存命中率来套。

- 14:15 之后缓存仍有效：`cacheReadTokens` 从约 132992 增到 134016；会话累计 `cache.read` 约 19875200。日志里 `cacheWriteTokens` 仍为 0。
- 14:15–14:23 那一步墙钟约 487 秒，其中无头截帧本身约 465 秒（`direction-still-golden-hour.png` 于 14:23 重出），不能拿来算 tok/s。
- 14:23:24 起步的下一步，模型流从 14:23:24 等到 14:43:01 才报错：`AI_APICallError: Cannot connect to API: The socket connection was closed unexpectedly`。随后自动重试，14:43:07–14:43:21 完成一次短工具步（输出 345、思考 69）。这 20 分钟几乎都是等流，不是生成速度，不能折算 tok/s。
- 14:43:21 起的当前步到 14:59 仍在途、尚无 part / token；会话状态仍是 busy，模型仍是 `v4.1-flash-eco`。与上一轮长等待类似，先不断开、不换模型。
- 另有一次更早的流错误（13:43）：`AI_APICallError: [code=internal_error] failed to evaluate membership entitlement`，当时已自动恢复，本轮不必当成登录墙。
- 下一批体量维持「只做一件主题（三段光）」、指令只指向 brief 路径。截帧本身就要数分钟，再加上 Eco 流可能卡 15–20 分钟才出字，一小时内不要加塞限位交互或落花。

当前批（补材质和低地）尚未收束，不能把 14:23 那张黄昏静帧写成材料/低地已交差。

## 16:10 续记（同一条对话，ses_e36f5eb74ffeWczJVMKHr9LLYu / v4.1-flash-eco）

来源仍是运行日志与 OpenDesign / OpenCode 会话记录，不是官方指标。不要用 DeepSeek 自家 Flash 集群的缓存命中率来套。

- 14:43:21 之后的模型步一直没有 part / token。生产跑 `2da31815-6730-484e-8027-e441094dfa60`（13:19 起）在 16:02:59（Asia/Shanghai）失败：OpenCode SSE 在 3 次重连后仍静默 45 秒，`AGENT_EXECUTION_FAILED` / `fatal_rpc_error`，harness 标记不可自动续跑。会话累计 `cache.read` 仍约 19875200，与 14:59 记录相同；这一段空等不能折算 tok/s。
- 当前批（补材质和低地）仍未收束。14:23 的 `01-refs/direction-still-golden-hour.png` 是中途重截，不是本批交差。场景源码最后写入约 14:15。14:59 排进同一会话的三段光指令（`msg_1c967d7cd001bWTJXPZt1Pjaz2`，delivery=queue）还在，尚未执行；不要再追加同一份。
- 16:08:45 已在同一条对话发出短指令，要求从中断处继续补材质和低地（run `bbd01701-6eb8-480b-960d-89f67dc19f85`，模型 `deepseek-v4.1-flash-eco`）。本轮 `promptCache.hit = true`。约 16:08 起进入 thinking，16:10:27 上游返回 `workspace_task_lease_unavailable`（`https://amr-link.open-design.ai/v1/chat/completions`，重试 2 次后共 3 次耗尽），16:10:28 整轮失败，类别 `upstream_unavailable`。现在 `activeRunCount=0`，模型空闲。下一批体量仍只排一件主题；先要恢复 workspace / AMR 任务租约后再在同一条对话续跑，不要立刻把失败指令再塞一遍。

## 16:36 续记（同一条 OpenDesign 对话，v4.1-flash-eco）

来源仍是运行日志，不是官方指标。

- 16:35:50（Asia/Shanghai）在同一条对话（conversationId `8563a74d-e510-40b5-847a-3a180ec81cd2`）发出补材质和低地短指令，run `34e72119-0221-43b0-89cb-1313c2652296`，模型 `deepseek-v4.1-flash-eco`。没有新开对话，没有换模型。
- 起初尝试恢复原来的 OpenCode session `ses_e36f5eb74ffeWczJVMKHr9LLYu`（`resume_attempted`，当时还能看到 priorSessionInputTokens 912309）。随后 `agent_resume_failed_suppressed` / `agent_resume_auto_reseed`，`stale_session_cleared: true`，运行时在同一条对话里重新种了 `ses_e36400716ffe1kI5Jb2ByQJD9i`（`sessionMode: new`）。最终 `promptCache.hit = false`，`missReason: new-session`；园林对话在 `agent_sessions` 表里已无绑定记录。
- 16:36:18 上游 `https://amr-link.open-design.ai/v1/chat/completions` 返回 503 `database_unavailable`（resolve Billing Scope），重试 3 次耗尽，整轮失败，类别 `upstream_unavailable`。没有思考输出，也没有新静帧。源码最新仍是 14:15，黄昏静帧仍是 14:23。
- 14:59 排进旧 session 的三段光指令可能已随旧 session 清理而丢失；不要现在重发，也不要立刻再把失败的续跑指令再塞一遍。先等上游数据库/计费作用域恢复。

## 16:49 续记（同一条 OpenDesign 对话，改用 v4.1-flash）

来源仍是运行日志，不是官方指标。

- 按主人要求，已把首页默认模型和本轮请求都改成 `deepseek-v4.1-flash`（不是 flash-eco）。没有新开对话或项目。
- 16:48:58（Asia/Shanghai）发出补材质和低地短指令，run `08c33aa9-cc39-4d19-9355-ea7e6c08e652`。16:49:43 之后仍是 `running`，事件里的模型是 `deepseek-v4.1-flash`，已开始读 brief 并调用工具。
- 途中出现过短暂上游重试：`database_unavailable`、`workspace_task_lease_unavailable`，随后已恢复，没有整轮失败。
- 因为旧 session 已被清理，本轮 `promptCache.hit = false`，`missReason: new-session`。没有新静帧；源码最新仍是 14:15，黄昏静帧仍是 14:23。本批仍不能算交差。三段光没有重发。


## 17:00 续记（同一条 OpenDesign 对话，v4.1-flash）

来源仍是本轮生产跑 `08c33aa9-cc39-4d19-9355-ea7e6c08e652` 的 `events.jsonl` 与 OpenCode session `ses_e3634214dffeX2YZmrU5JOIj5O`，不是官方指标。不要用 DeepSeek 自家 Flash 集群的缓存命中率来套。

- 模型确认是 `deepseek-v4.1-flash`（不是 flash-eco）。没有新开对话或项目。`promptCache.hit = false`，`missReason: new-session`。会话内后续步的前缀缓存是有效的：34 个带 usage 的完成步里，`cacheReadTokens` 从 1664 增到 102784；去掉开头 5 步后，以 `cacheRead / (input + cacheRead)` 计，中位数约 99.5%。session 累计 `cache.read` 2101632，`cache.write` 仍为 0。
- 按完成步的 `outputTokens / durationMs`：中位数约 15.6 tok/s，九成不超过约 44.6，最高一次约 118。生成量较大的步（输出 + 思考 ≥ 200 token，共 16 步）：仅输出中位数约 31.2 tok/s；输出 + 思考中位数约 45.1 tok/s，九成不超过约 123，最高约 139。大步解码可以超过 100 tok/s，快于先前 Eco「很少稳定超过 80」的观感，但大量短工具步仍慢。下一批体量仍只排一件主题（三段光），不要加塞限位交互或落花；截帧本身仍要数分钟，且本轮有过上游重试。
- 途中短暂重试后已恢复，没有整轮失败，也不是登录墙：约 16:49 的 `database_unavailable` / `workspace_task_lease_unavailable`，约 16:51 的 `failed to evaluate membership entitlement`。
- 当前批尚未收束。已改 `02-scene/src/config.ts`、`materials.ts`、`textures.ts`（约 16:53–16:54）。没有新静帧；黄昏方向帧仍是 14:23 的 `01-refs/direction-still-golden-hour.png`。16:54:59 最后一条事件是 `tool_in_flight` 的 Edit（结合思考内容，多半在改 `sky.ts`），到 17:00 事件文件未再增长，但 run 仍是 `running`、子进程还在、界面仍在计时。先不断开，也不把这 6 分钟静默写成已经卡住。三段光未补排。

## 18:03 续记（同一条 OpenDesign 对话，v4.1-flash）

来源仍是本轮生产跑 `08c33aa9-cc39-4d19-9355-ea7e6c08e652` 的 `events.jsonl` 与 OpenCode session `ses_e3634214dffeX2YZmrU5JOIj5O`，不是官方指标。不要用 DeepSeek 自家 Flash 集群的缓存命中率来套。

- 模型确认是 `deepseek-v4.1-flash`（不是 flash-eco）。没有新开对话或项目，工作区仍是 Seven's workspace。`promptCache.hit = false`，`missReason: new-session`（旧 session 清理后这一轮起头如此）。会话内后续步的前缀缓存仍有效：62 个带 usage 的完成步里，`cacheReadTokens` 从 1664 增到 131200；去掉开头 5 步后，以 `cacheRead / (input + cacheRead)` 计，中位数约 99.8%。各步 `cacheReadTokens` 合计 5419392，`cacheWriteTokens` 仍为 0。
- 不宜把含长时间上游等待的墙钟直接拿来算 tok/s。四个长步分别约 391 秒、207 秒、456 秒、950 秒（含 17:01 / 17:09 SSE 超时与 17:32 socket 关闭后的重试），输出并不多。去掉墙钟 ≥ 60 秒的步之后：按 `outputTokens / durationMs`，中位数约 20.8 tok/s，九成不超过约 83，最高约 125。生成量较大的步（输出 + 思考 ≥ 200 token，共 35 步）：仅输出中位数约 32.1 tok/s；输出 + 思考中位数约 67.3 tok/s，九成不超过约 123，最高约 199。大步解码可以超过 100 tok/s，但仍有短工具步偏慢，且截帧和上游等待会吃掉整块时间。下一批体量仍只排一件主题（三段光），不要加塞限位交互或落花。
- 途中短暂重试后已恢复，没有整轮失败，也不是登录墙：17:01 / 17:09 的 `SSE read timed out`，17:05 的 `workspace_task_lease_unavailable`，17:32 的 `Cannot connect to API: The socket connection was closed unexpectedly`。
- 当前批尚未收束。17:00 之后继续改了 `sky.ts`、`flora.ts`、`textures.ts`、`main.ts`、`config.ts`、`world.ts` 和 `scripts/capture-still.mjs`（约 17:01–17:05），`dist/` 于 17:32 重建。17:32–17:37 尝试截 `direction-still-golden-hour-v2.png` 失败：页面 `Error creating WebGL context`，随后 `waitForFunction` 240 秒超时。没有新静帧；黄昏方向帧仍是 14:23 的 `01-refs/direction-still-golden-hour.png`。17:37:40 截帧工具结果返回后，到 18:03 事件文件未再增长（约 25 分钟无 thinking / token），但 run 仍是 `running`、子进程还在、`activeRunCount=1`。先不断开，也不把这 25 分钟静默写成已经卡死。三段光未补排。

## 19:02 续记（同一条 OpenDesign 对话，v4.1-flash）

来源仍是运行日志，不是官方指标。不要用 DeepSeek 自家 Flash 集群的缓存命中率来套。

- 18:03 之后，生产跑 `08c33aa9-cc39-4d19-9355-ea7e6c08e652`（session `ses_e3634214dffeX2YZmrU5JOIj5O`，模型 `deepseek-v4.1-flash`）仍无新的 thinking / token。17:37:40 截帧失败返回后，下一步在 17:37:40 已标记开始，但一直空等。18:08:55 事件流重连（silent_for=45s，attempt=3）只补写了生命周期诊断，没有生成。这一段空等不能折算 tok/s。
- 19:00:33（Asia/Shanghai）整轮失败：`AGENT_EXECUTION_FAILED` / `fatal_rpc_error`，上游 `https://amr-link.open-design.ai/v1/chat/completions` 返回 409 `open_design_run_terminal`（resolve Billing Scope），子进程 exit 130，`endedWithUnfinishedWork=true`。不是登录墙。从截帧结果返回到失败约 83 分钟无生成。
- 当前批（补材质和低地）仍未收束。没有新静帧；黄昏方向帧仍是 14:23 的 `01-refs/direction-still-golden-hour.png`。源码最新仍是 17:05，`dist/` 仍是 17:32。
- 19:01:42 已在同一条对话（`8563a74d-e510-40b5-847a-3a180ec81cd2`，Seven's workspace）发出短指令续跑本批，run `84d731ff-7a28-4860-a2ee-92c9153514ac`，模型确认是 `deepseek-v4.1-flash`（不是 flash-eco）。没有新开对话或项目。因上一 session 已结束，本轮 `promptCache.hit = false`，`missReason: new-session`。19:02 核验 `activeRunCount=1`，子进程还在，已开始读工程并调用工具。三段光没有补排。
- 下一批体量仍只排一件主题（三段光），不要加塞限位交互或落花；截帧本身仍要数分钟，且无头 WebGL 上下文失败会再吃掉数分钟。等本批真正收束后再决定是否重新排入三段光。

## 20:06 续记（同一条 OpenDesign 对话，v4.1-flash）

来源仍是运行日志，不是官方指标。不要用 DeepSeek 自家 Flash 集群的缓存命中率来套。

- 19:01:42 发出的续跑 `84d731ff-7a28-4860-a2ee-92c9153514ac`（同一条对话 `8563a74d-e510-40b5-847a-3a180ec81cd2`，Seven's workspace，模型 `deepseek-v4.1-flash`，不是 flash-eco）于 19:48:15 成功结束，`endedWithUnfinishedWork=false`。本轮起头 `promptCache.hit = false`，`missReason: new-session`。会话内后续步的前缀缓存有效：255 个完成步里，有用量的约 250 步，`cacheReadTokens` 从 25600 增到 198400（中位数 96128）；去掉开头 5 步后，以 `cacheRead / (input + cacheRead)` 计，中位数约 99.7%。各步 `cacheReadTokens` 合计 25367296，`cacheWriteTokens` 仍为 0。
- 不宜把含长时间上游等待或收尾的墙钟直接拿来算 tok/s。四个长步分别约 245 秒、246 秒、181 秒、689 秒（含 19:09 `SSE read timed out` 后的重试，以及 19:36–19:48 的 `session_terminal` 收尾，其中后两步几乎无生成）。去掉墙钟 ≥ 60 秒的步之后：按 `outputTokens / durationMs`，中位数约 22.1 tok/s，九成不超过约 83.8，最高约 242。生成量较大的步（输出 + 思考 ≥ 200 token，排除长墙钟后共 128 步）：仅输出中位数约 36.4 tok/s；输出 + 思考中位数约 109.9 tok/s，九成不超过约 175，最高约 248。大步解码可以超过 100 tok/s，但仍有短工具步偏慢，且截帧和上游等待会吃掉整块时间。下一批体量仍只排一件主题；不要加塞限位交互或落花。
- 途中一次短暂重试后已恢复，没有整轮失败，也不是登录墙：19:09:51 的 `model_retry` / `SSE read timed out`。
- 「补材质和低地」已按范围收束，不是整包交差。已用无头 Chrome 截出 `01-refs/direction-still-golden-hour-v2.png`（1920×1080，19:45），14:23 原帧保留。自检见 `DIRECTION-STILL-REPORT.md`。截帧须用 `DISPLAY=:1`（`DISPLAY=:2` 已失效）。
- 20:06:49（Asia/Shanghai）已在同一条对话发出下一批「白天／黄昏／夜晚三段光」短指令，只指向 `OPEN-DESIGN-BRIEF-batch-times-of-day.md` 和 `QUEUE.md`，没有整段粘贴 COMPOSITION / BRIEF / 标准，也没有把限位交互或落花塞进去。run `04fe2638-2492-4d9e-a1fc-83706c77b8e3`，模型确认是 `deepseek-v4.1-flash`（不是 flash-eco）。没有新开对话或项目。本轮 `promptCache.hit = true`。20:07 核验：同一条对话、Seven's workspace，`activeRunCount=1`，子进程还在，已在读工程并调用工具。今晚 20:00 是白天最后一次布置，夜里不再加塞。
