# NarraMem 酒馆内测版安装说明

版本：`0.4.0-beta.16`

最低 SillyTavern：`1.18.0`

这是一个可由 SillyTavern 扩展管理器直接安装的标准前端扩展。无需复制 Server Plugin，无需修改 `config.yaml`，也无需把 API Key 发给 NarraMem 发布者。

## 从酒馆安装

1. 先确认 SillyTavern 已升级到 `1.18.0` 或更高版本，并建议备份当前用户的 `data` 目录。
2. 打开“扩展”→“安装扩展”。
3. Git URL 只填写 `https://github.com/sanmingyue/NarraMem-SillyTavern`。
4. Branch or tag name 保持空白。
5. 点击“Install just for me”。安装成功后刷新酒馆页面。
6. 在扩展设置中展开“NarraMem 叙忆（内测 0.4.0-beta.16）”。选择一个独立 API 配置：Custom 按酒馆自定义 Chat Completion 的习惯填写 URL、Key 和模型；DeepSeek 使用酒馆 1.18 原生 DeepSeek 适配，只填 Key 与模型。
7. 三个主操作互相独立：先“保存配置”，再“连接并读取模型”（不消耗生成调用）；只有“发送测试消息（消耗 1 次调用）”会明确发起一次模型生成。
8. 默认按模型名自动匹配已验证的 NarraMem Prompt。无法识别时，页面会明确提示，并仅允许在“附加参数与高级设置”中手动选择兼容 Prompt。

后续更新使用酒馆扩展管理器的“更新”功能；始终跟踪独立仓库默认 `main`，不需要填写分支。

任务失败时，页面会显示阶段、错误类型、错误码和失败时间，并出现“重新抽取”。每次手动点击会开启一个新的有界轮次；轮内自动调用次数由“自动重试次数”决定，不会无限调用。

“导出诊断日志”不包含 API Key 或 Prompt 正文；“导出核心数据”可能包含聊天记录、角色经历、世界状态与其他隐私，发送给维护者前请先自行检查。

## 独立 API 与 Key

- 当前支持使用 Bearer Key 的 OpenAI-compatible `/v1/models` 与 `/v1/chat/completions`，接口需支持 Structured Outputs／JSON Schema。
- API 地址可填写服务根地址、`/v1`，或完整 `/v1/chat/completions`；扩展会规范化为同一服务根地址。
- 这是 NarraMem 自己的 endpoint、Key 和 model，不读取或跟随酒馆当前聊天 API、当前模型和预设；角色卡、Persona、世界书与聊天记录只作为记忆资料输入。
- Key 作为带独立 ID 的“NarraMem Memory API”条目保存在当前 SillyTavern 用户目录的 `secrets.json`。保存后扩展会恢复用户原本启用的 Custom API Key；以后只按 NarraMem 自己的 ID 取用。
- Key 原值不会写入扩展设置、世界书、日志或导出，也不会从 secrets 接口读回前端。设置页可替换或删除 NarraMem 自己的 Key 条目。
- 模型列表按钮只访问 `/models`，不会触发模型生成。

## 调用边界

- 记忆任务不调用酒馆前端 `generateRaw()`。扩展把自己组装的 messages 与 Schema 直接交给酒馆本地 custom chat-completions 传输；没有填写 `custom_prompt_post_processing`，因此不拼接当前预设或角色资料。
- 并发数和重试次数默认都是 `1`。重试次数 `1` 表示首次失败后再试一次；客户端传输本身不额外重试。
- 并发和失败重试均可设置，默认值都是 `1`。现代浏览器使用同源 Web Locks 约束多个酒馆标签页；缺少 Web Locks 时至少保证当前页面内的队列上限。
- 不设会话总调用次数上限，也不额外设置每分钟调用上限或最小请求间隔。
- NarraMem 不发送最大上下文或最大回复参数，使用模型／服务端默认值。
- 记忆任务利用后台空闲窗口运行；正常一问一答不等待 Memory API 完成。

实际消息顺序固定为：

1. `system`：可编辑身份头部＋现有 NarraMem 模型专属任务正文。
2. `assistant`：可编辑身份确认。
3. `user`：NarraMem 结构化任务资料。
4. `assistant`：可编辑“资料已收到”确认；关闭最终预填充后，同一正文改为 `system`。
5. `user`：固定严格 JSON 输出规则。

五段消息与 strict response Schema 由 NarraMem 自己维护；不会发送已删除的免责声明。

## 自动记忆空间与楼层隐藏

- 打开或切换聊天时，以酒馆聊天记录 ID 自动选择唯一 Memory Set，并自动读取当前角色卡身份；设置页没有手动绑定流程。
- edit／delete／reroll 会触发可信重处理。只有抽取和叙事生命周期成功持久化后，才隐藏已经完成记忆处理的旧楼层。
- 最新 4 个 AI 楼层具有最高保护优先级，永远保持可见；从第 4 个最新 AI 楼层开始的连续上下文也不会被旧楼层隐藏越过，以保留格式统一与内容衔接所需前文。

## 数据与隐私

NarraMem 使用酒馆世界书保存 Memory Set、Evidence、事件、状态、认知、因果、NarrativeThread 和 FutureImpact。设置页可下载两类文件：

- 诊断日志：不包含核心记忆正文，用于报告运行状态和错误。
- 核心数据 + 日志：可能包含聊天原文、角色身份、世界状态、因果证据和会话标识，下载前有两道隐私确认。

两类导出都不包含 API 地址、API Key、secret ID、Prompt 正文或其他凭据值。导出文件只保存在用户点击下载的位置，不会由 NarraMem 自动上传。SillyTavern 本机服务自身可能按其日志级别记录 API 请求；共享酒馆日志前也应按可能含聊天隐私处理。

## 内测反馈

反馈时请提供版本号、SillyTavern 版本、API 类型、复现步骤和“诊断日志”文件。只有在理解隐私风险并愿意提供剧情内容时，才发送“核心数据 + 日志”。不要在公开 Issue 中粘贴 API Key、`secrets.json`、Cookie 或完整聊天。

建议第一轮只做短聊天：确认设置页状态、后台抽取、Recall、刷新后恢复，以及 edit／delete／reroll 后重新处理。不要自行启动 1000+ 长跑。

## 停用与卸载

1. 在 NarraMem 设置页关闭扩展；如需清除 Key，点击“删除 Key”。
2. 在酒馆扩展管理器中停用或删除 NarraMem。

卸载扩展不会自动删除世界书中的 NarraMem 记忆数据，以免误删用户内容。需要彻底清理时，先导出并确认目标 Memory Set；当前内测版不提供未经真实宿主验证的全量删除按钮。
