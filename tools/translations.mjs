/**
 * Vietnamese translation table for the NarraMem SillyTavern extension.
 *
 * Keys are the exact literal text found in `dist/index.js`, with `{0}`, `{1}`
 * marking template interpolations. A translation may reorder placeholders but
 * must use each exactly once.
 *
 * Glossary (kept consistent across the whole UI):
 *   楼层 -> lượt          批次 -> đợt           模块 -> mô-đun
 *   酒馆 -> SillyTavern   世界书 -> world book  记忆 -> ký ức
 *   证据 -> bằng chứng    因果 -> nhân quả      认知 -> nhận thức
 * Technical identifiers (Recall, Checkpoint, Schema, Prompt, Memory API, module
 * IDs, enum values) stay in their original form on purpose — they are the shared
 * vocabulary between the UI, the prompts and the persisted records.
 */

/**
 * Prompt bodies whose replacement lives in a file, matched by prefix.
 *
 * The two envelope entries pin the output language. Nothing in the extraction
 * prompts states which language the model-authored free-text fields (`summary`,
 * `title`, `mechanism`, `trigger_summary`, `description`, …) should use, so it
 * was left to the model — and those fields flow back into the roleplay turn
 * through the RecallBundle. Both are editable settings defaults and neither is
 * hashed into `prompt_contract_material` or `parameters_material`, so stating
 * the rule here costs no Checkpoint invalidation. Each file keeps the upstream
 * body byte-for-byte and only appends.
 */
export const FILE_OVERRIDES = [
  // NM-P0010: injected into the roleplay turn, so its language shapes prose style.
  { prefix: "你正在以当前角色的身份延续正在进行的叙事。", file: "l10n/NM-P0010_vi.md" },
  // NM-P0027: default identity header, message 1 (system) of every module call.
  { prefix: "Your identity: Qiuqingzi", file: "l10n/NM-P0027_head_system_vi.md" },
  // NM-P0029: default material acknowledgement, message 5, an assistant-voice
  // commitment sitting immediately before the final output contract.
  {
    prefix: "The materials for the current NarraMem task have been received",
    file: "l10n/NM-P0029_material_ack_vi.md",
  },
];

/**
 * Literals deliberately left in the original language, matched by prefix.
 *
 * The extraction prompts (M1-M7 tasks and output contracts, the repair pair, the
 * material envelope and the continuation notice) are the tuned model-facing
 * layer. Their SHA-256 digests feed `prompt_contract_material`, which is sealed
 * into every Checkpoint, so translating them would invalidate memory extracted
 * by an earlier build. See docs/prompts-vi.md for a reading translation.
 *
 * The secret label is an identifier, not UI text: SillyTavern key recovery
 * matches on it, so translating it would orphan an already saved API key.
 */
export const KEEP_PREFIXES = [
  "你只执行 NarraMem 模块", // M1-M7 task prompts
  "只返回一个 M", // M1-M7 output contracts
  "你正在执行 NarraMem 当前", // NM-P0034 repair system
  "现在只返回当前 module_id", // NM-P0035 repair contract
  "本条 System 是 NarraMem", // NM-P0032 material envelope
  "上一份 JSON 输出在传输中途截断", // NM-P0033 continuation
  "NarraMem 叙忆 - ", // SillyTavern secret label
];

/**
 * A few keys no longer appear in the shipped bundle — beta.70 replaced the old
 * collecting/loading wording with the progress display, and one settings string
 * is tree-shaken out. They are kept rather than deleted: an extra key costs
 * nothing, while a missing one stops `apply`. `check` only ever complains about
 * strings it cannot translate, never about strings it no longer needs.
 */
export const TRANSLATIONS = {
  // --- Navigation and section headings -------------------------------------
  "总览": "Tổng quan",
  "记忆": "Ký ức",
  "设置": "Cài đặt",
  "当前任务": "Tác vụ hiện tại",
  "日志与数据": "Nhật ký & Dữ liệu",
  "自动记忆": "Ký ức tự động",
  "核心数据": "Dữ liệu lõi",
  "诊断日志": "Nhật ký chẩn đoán",
  "模型": "Model",
  "Memory API 配置": "Cấu hình Memory API",
  "API 配置": "Cấu hình API",
  "接口来源": "Nguồn API",
  "可用模型": "Model khả dụng",

  // --- Pipeline stage notes -------------------------------------------------
  "独立 Memory API 返回模块正文": "Memory API riêng trả về nội dung mô-đun",
  "只解析当前小模块的结构": "Chỉ phân tích cấu trúc của mô-đun con hiện tại",
  "证据、依赖与字段逐条准入": "Duyệt từng bằng chứng, phụ thuộc và trường dữ liệu",
  "可信记录编译为叙事状态": "Biên dịch bản ghi tin cậy thành trạng thái truyện",
  "提交到当前聊天的单一记忆书": "Ghi vào world book ký ức duy nhất của chat hiện tại",
  "从当前剧情状态构造可解释召回": "Dựng Recall giải thích được từ trạng thái truyện hiện tại",
  "校验后才隐藏已覆盖旧楼层": "Chỉ ẩn lượt cũ sau khi đã kiểm chứng",

  // --- Module names (M1-M7) -------------------------------------------------
  "人物与实体": "Nhân vật & Thực thể",
  "场景与篇章": "Cảnh & Chương",
  "经历与事件": "Trải nghiệm & Sự kiện",
  "状态变化": "Thay đổi trạng thái",
  "认知与秘密": "Nhận thức & Bí mật",
  "因果链": "Chuỗi nhân quả",
  "伏笔与长期影响": "Cài cắm & Ảnh hưởng dài hạn",

  // --- Module work states ---------------------------------------------------
  "等待": "Chờ",
  "处理中": "Đang xử lý",
  "完成": "Hoàn tất",
  "需要处理": "Cần xử lý",
  "已中断": "Đã gián đoạn",
  "已回退": "Đã hoàn tác",
  "进行中": "Đang chạy",
  "通过": "Đạt",
  "失败": "Thất bại",

  // --- Runtime status labels ------------------------------------------------
  "自动记忆：关闭": "Ký ức tự động: Tắt",
  "无聊天": "Chưa có chat",
  "收集中": "Đang thu thập",
  "需处理": "Cần xử lý",
  "编译中": "Đang biên dịch",
  "召回就绪": "Recall sẵn sàng",
  "已完成": "Hoàn tất",
  "等待批次": "Chờ đợt mới",
  "本地收尾": "Hoàn tất cục bộ",
  "尚无": "Chưa có",
  "已建立": "Đã tạo",

  // --- Record field labels --------------------------------------------------
  "名称": "Tên",
  "别名": "Tên khác",
  "类型": "Loại",
  "标题": "Tiêu đề",
  "摘要": "Tóm tắt",
  "描述": "Mô tả",
  "地点": "Địa điểm",
  "参与者": "Người tham gia",
  "视角": "Góc nhìn",
  "变化前": "Trước",
  "变化后": "Sau",
  "命题": "Mệnh đề",
  "认知状态": "Trạng thái nhận thức",
  "客观状态": "Trạng thái khách quan",
  "关系": "Quan hệ",
  "说明": "Giải thích",
  "触发条件": "Điều kiện kích hoạt",
  "状态": "Trạng thái",
  "原文证据": "Bằng chứng nguyên văn",
  "引用": "Trích dẫn",
  "证据": "Bằng chứng",
  "依赖": "Phụ thuộc",
  "整理内容": "Nội dung đã tổng hợp",
  "不确定性": "Độ bất định",

  // --- Staged record cards --------------------------------------------------
  "未命名记录": "Bản ghi chưa đặt tên",
  "人物／实体": "Nhân vật / Thực thể",
  "章节锚点": "Mốc chương",
  "场景 · {0}": "Cảnh · {0}",
  "场景边界": "Ranh giới cảnh",
  "事件 · {0}": "Sự kiện · {0}",
  "未分类": "chưa phân loại",
  "状态变化 · {0}": "Thay đổi trạng thái · {0}",
  "更新": "cập nhật",
  "角色认知 · {0}": "Nhận thức nhân vật · {0}",
  "认知": "nhận thức",
  "因果 · {0}": "Nhân quả · {0}",
  "因果机制": "Cơ chế nhân quả",
  "线索状态 · {0}": "Trạng thái tuyến truyện · {0}",
  "更新为 {0}": "Cập nhật thành {0}",
  "待确认": "chờ xác nhận",
  "未来影响状态 · {0}": "Trạng thái ảnh hưởng tương lai · {0}",
  "叙事线索": "Tuyến truyện",
  "未来影响 · {0}": "Ảnh hưởng tương lai · {0}",
  "未来影响候选": "Ứng viên ảnh hưởng tương lai",

  // --- Overview panel -------------------------------------------------------
  "NarraMem 叙忆（内测 {0}）": "NarraMem (beta {0})",
  "当前聊天的叙事经历、因果与长期影响":
    "Trải nghiệm, nhân quả và ảnh hưởng dài hạn của chat hiện tại",
  "关闭记忆中心": "Đóng Trung tâm ký ức",
  "待处理 AI 楼层": "Lượt AI chờ xử lý",
  "正文保护窗口": "Cửa sổ bảo vệ",
  "最近检查点": "Checkpoint gần nhất",
  "查看全部记忆": "Xem toàn bộ ký ức",
  "查看当前任务": "Xem tác vụ hiện tại",
  "重新处理失败模块（消耗 1 次调用）": "Xử lý lại mô-đun lỗi (tốn 1 lượt gọi)",
  "打开日志与数据": "Mở Nhật ký & Dữ liệu",
  "NarraMem 每累计 14 个有效 AI 楼层，冻结前 10 个并依次完成 7 个小模块；全部通过可信编译、Recall 校验后才隐藏旧楼层。任何失败都不会隐藏聊天，最新 4 个 AI 楼层始终保留用于自然衔接。":
    "Cứ mỗi 14 lượt AI hợp lệ, NarraMem đóng băng 10 lượt đầu rồi chạy lần lượt 7 mô-đun con; chỉ khi qua hết biên dịch tin cậy và kiểm chứng Recall thì lượt cũ mới bị ẩn. Mọi thất bại đều không làm ẩn chat, và 4 lượt AI mới nhất luôn được giữ lại để mạch truyện liền lạc.",

  // --- Runtime headlines ----------------------------------------------------
  "自动记忆未启用": "Ký ức tự động chưa bật",
  "当前没有可处理的角色聊天": "Hiện không có chat nhân vật nào để xử lý",
  // beta.74 recovery path for a Memory Book that vanished under the runtime.
  "Memory Book 恢复未能确认楼层可见性重置":
    "Khôi phục Memory Book không xác nhận được việc bỏ ẩn các lượt",

  // beta.70 added a collection-progress display and a TauriTavern sync state.
  "记忆尚未达到处理条件": "Chưa đủ điều kiện để xử lý ký ức",
  "当前已收集 {0}/{1} 个有效 AI 楼层；达到 {2} 后会自动整理最早 {3} 个，并保留最新 {4} 个用于剧情衔接。":
    "Đã thu thập {0}/{1} lượt AI hợp lệ; đủ {2} sẽ tự tổng hợp {3} lượt sớm nhất và giữ lại {4} lượt mới nhất để mạch truyện liền lạc.",
  "已收集 {0}/{1}": "Đã thu {0}/{1}",
  "已收集 AI 楼层": "Lượt AI đã thu thập",
  "正在积累下一次记忆更新": "Đang gom cho lần cập nhật ký ức tới",
  "当前已积累 {0}/{1} 个新的可处理 AI 楼层；达到 {2} 后会自动更新已有记忆，并继续保留最新 {3} 个 AI 楼层。":
    "Đã gom {0}/{1} lượt AI mới xử lý được; đủ {2} sẽ tự cập nhật ký ức sẵn có và vẫn giữ lại {3} lượt AI mới nhất.",
  "已积累 {0}/{1}": "Đã gom {0}/{1}",
  "本次已积累 AI 楼层": "Lượt AI đã gom đợt này",
  "正在等待 TauriTavern 同步完整聊天":
    "Đang chờ TauriTavern đồng bộ toàn bộ chat",
  "当前不会调用 Memory API、抽取新记忆或隐藏楼层。可点击“刷新状态”重新读取完整聊天。":
    "Hiện không gọi Memory API, không trích xuất ký ức mới và không ẩn lượt nào. Bấm “Làm mới trạng thái” để đọc lại toàn bộ chat.",
  "正在等待 TauriTavern 完整聊天同步；不会调用模型或隐藏楼层":
    "Đang chờ TauriTavern đồng bộ toàn bộ chat; không gọi model và không ẩn lượt nào",
  "等待 TT 同步": "Chờ TT đồng bộ",
  "刷新状态": "Làm mới trạng thái",
  "刷新失败：{0}": "Làm mới thất bại: {0}",
  "正在连接": "Đang kết nối",
  "正在积累": "Đang gom",
  "已完成记忆模块": "Mô-đun ký ức đã xong",

  // beta.67 split "no chat at all" from "chat open, runtime still resolving".
  "请先打开一张角色卡及其聊天记录。": "Hãy mở một thẻ nhân vật và lịch sử chat của nó trước.",
  "正在连接当前聊天": "Đang kết nối chat hiện tại",
  "正在读取聊天、世界书与已有记忆；完成后会自动更新，不会重复调用模型。":
    "Đang đọc chat, world book và ký ức sẵn có; xong sẽ tự cập nhật, không gọi lại model.",
  "加载中": "Đang tải",
  "本批有模块需要手动处理": "Đợt này có mô-đun cần xử lý thủ công",
  "后台记忆任务失败，聊天不会受阻": "Tác vụ ký ức nền thất bại, chat vẫn dùng bình thường",
  "后台正在整理记忆": "Đang tổng hợp ký ức ở nền",
  "最新记忆批次已完成": "Đợt ký ức mới nhất đã xong",
  "正在等待下一批剧情": "Đang chờ diễn biến tiếp theo",
  "当前批 AI 楼层 {0}–{1}；最新 4 个 AI 楼层始终保留在聊天正文中。":
    "Đợt hiện tại gồm lượt AI {0}–{1}; 4 lượt AI mới nhất luôn được giữ hiện trong chat.",
  "首次收集 {0}/14 个 AI 楼层；到 14 时处理前 10 个，保留最新 4 个。":
    "Đang thu thập lần đầu {0}/14 lượt AI; đủ 14 sẽ xử lý 10 lượt đầu và giữ lại 4 lượt mới nhất.",
  "下一批已积累 {0}/10 个可处理 AI 楼层；另有最新 4 个 AI 楼层受保护。":
    "Đợt kế đã gom {0}/10 lượt AI xử lý được; ngoài ra 4 lượt AI mới nhất được bảo vệ.",
  "{0}/7 模块完成": "{0}/7 mô-đun hoàn tất",
  "{0} · 调用 {1}": "{0} · {1} lượt gọi",
  "失败模块：{0} · {1}{2}": "Mô-đun lỗi: {0} · {1}{2}",
  "需要手动处理": "cần xử lý thủ công",
  "未知": "không rõ",
  "当前没有正在处理的记忆批次": "Hiện không có đợt ký ức nào đang xử lý",

  // --- Memory list ----------------------------------------------------------
  "最新记忆在前；点击卡片展开整理内容与来源楼层。":
    "Ký ức mới nhất ở trên; bấm vào thẻ để xem nội dung và lượt nguồn.",
  "加载更早记忆": "Tải ký ức cũ hơn",
  "这一类还没有可显示的记忆。": "Loại này chưa có ký ức nào để hiển thị.",
  "没有额外可读字段。": "Không có trường nào khác để hiển thị.",
  "来源楼层未知": "Không rõ lượt nguồn",
  "楼层 {0}{1}": "Lượt {0}{1}",
  "跳到来源楼层": "Nhảy tới lượt nguồn",
  "当前聊天页面里找不到楼层 {0}；它可能尚未渲染。":
    "Không tìm thấy lượt {0} trên trang chat; có thể nó chưa được render.",
  "跳转来源楼层失败：{0}": "Nhảy tới lượt nguồn thất bại: {0}",
  "从此楼层重新处理": "Xử lý lại từ lượt này",
  "会回退并重建此楼层之后的依赖记忆，避免新旧结果冲突":
    "Sẽ hoàn tác và dựng lại các ký ức phụ thuộc sau lượt này để tránh xung đột cũ/mới",
  "从楼层 {0} 重新处理？此楼层之后依赖它的记忆会同步回退并重建。":
    "Xử lý lại từ lượt {0}? Các ký ức phụ thuộc sau lượt này sẽ được hoàn tác và dựng lại.",
  "重新处理失败：{0}": "Xử lý lại thất bại: {0}",
  "读取记忆失败：{0}": "Đọc ký ức thất bại: {0}",
  // beta.75 renamed 手动修复 -> 手动处理 and replaced the hard "no module is
  // waiting" throw with a graceful notice when the task state moved on.
  "手动处理失败：{0}": "Xử lý thủ công thất bại: {0}",
  "任务状态刚刚发生变化，本次没有重复调用；页面已显示当前任务。":
    "Trạng thái tác vụ vừa thay đổi nên lần này không gọi lại; trang đã hiển thị tác vụ hiện tại.",

  // --- Settings: automation -------------------------------------------------
  "启用 NarraMem 自动记忆": "Bật ký ức tự động NarraMem",
  "只控制后台记忆任务，不改变酒馆正常聊天请求":
    "Chỉ điều khiển tác vụ ký ức nền, không đụng tới yêu cầu chat thường của SillyTavern",
  "Memory API 完全独立：不会调用当前聊天 API、模型、预设或角色卡生成链。配置保存在当前酒馆用户空间，Key 只进入酒馆 secrets.json，扩展不会读取或回显原值。":
    "Memory API hoàn toàn độc lập: không gọi tới API, model, preset hay chuỗi sinh nội dung của chat hiện tại. Cấu hình lưu trong không gian người dùng SillyTavern, Key chỉ nằm trong secrets.json của SillyTavern, extension không đọc hay hiển thị lại giá trị gốc.",

  // --- Settings: API profiles ----------------------------------------------
  "新建": "Tạo mới",
  "重命名": "Đổi tên",
  "删除": "Xóa",
  "默认配置": "Cấu hình mặc định",
  "配置 {0}": "Cấu hình {0}",
  "新配置名称": "Tên cấu hình mới",
  "重命名 API 配置": "Đổi tên cấu hình API",
  "删除 API 配置“{0}”及其独立 Key？": "Xóa cấu hình API “{0}” cùng Key riêng của nó?",
  "至少保留一个 NarraMem API 配置": "Phải giữ lại ít nhất một cấu hình API của NarraMem",
  "自定义（兼容 OpenAI）": "Tùy chỉnh (tương thích OpenAI)",
  "服务器 URL": "URL máy chủ",
  "与酒馆 Custom Chat Completion 一致：可填根地址、/v1 或完整 /chat/completions。":
    "Giống Custom Chat Completion của SillyTavern: điền địa chỉ gốc, /v1 hoặc /chat/completions đầy đủ đều được.",
  "使用酒馆 DeepSeek 原生接口与密钥槽；固定端点 {0}。":
    "Dùng API và ô Key DeepSeek gốc của SillyTavern; endpoint cố định {0}.",
  "首次使用只需填写地址与 Key，再点击“连接并读取模型”；已有已保存 Key 时可留空复用":
    "Lần đầu chỉ cần điền địa chỉ và Key rồi bấm “Kết nối và tải danh sách model”; nếu đã lưu Key thì để trống để dùng lại",
  "当前配置已有独立 Key，不能直接切换接口来源；请新建配置，或先删除当前配置的 Key。":
    "Cấu hình hiện tại đã có Key riêng nên không đổi nguồn API trực tiếp được; hãy tạo cấu hình mới, hoặc xóa Key của cấu hình này trước.",

  // --- Settings: credentials ------------------------------------------------
  "填写新 API Key（已保存的 Key 不会回显）":
    "Điền API Key mới (Key đã lưu không hiển thị lại)",
  "填写新 Key 会在连接时保存；已有已保存 Key 时留空即可。Key 永不回显。":
    "Key mới điền vào sẽ được lưu khi kết nối; nếu đã có Key thì để trống. Key không bao giờ hiển thị lại.",
  "单独管理已保存 Key": "Quản lý riêng Key đã lưu",
  "通常无需使用：连接按钮已经会保存上方填写的新 Key。这里只用于不读取模型时单独替换，或删除当前 NarraMem 配置的 Key。":
    "Thường không cần dùng: nút kết nối đã tự lưu Key mới điền ở trên. Phần này chỉ dùng khi muốn thay Key mà không tải danh sách model, hoặc muốn xóa Key của cấu hình NarraMem hiện tại.",
  "单独保存／替换 Key": "Lưu / thay Key riêng",
  "删除 Key": "Xóa Key",
  "请输入 API Key；已有已保存 Key 时可以留空直接连接":
    "Hãy nhập API Key; nếu đã lưu Key trước đó thì để trống rồi kết nối",
  "请先填写新的 API Key": "Hãy điền API Key mới trước",
  "Key 已保存；原值不会回显": "Đã lưu Key; giá trị gốc không hiển thị lại",
  "Key 已配置（值不回显）": "Đã có Key (không hiển thị lại giá trị)",
  "尚未保存 Key；请在上方填写后直接连接": "Chưa lưu Key; hãy điền ở trên rồi bấm kết nối",
  "新 Key 待连接保存": "Key mới sẽ được lưu khi kết nối",
  "无法读取 Key 状态": "Không đọc được trạng thái Key",
  "删除当前配置的 NarraMem 独立 Memory API Key？":
    "Xóa Memory API Key riêng của cấu hình NarraMem hiện tại?",
  "Key 已删除": "Đã xóa Key",
  "本地密钥保存失败：{0}": "Lưu Key cục bộ thất bại: {0}",

  // --- Settings: model ------------------------------------------------------
  "读取模型列表不会触发生成；选中模型后自动保存":
    "Tải danh sách model không kích hoạt sinh nội dung; chọn xong sẽ tự lưu",
  "输入模型名": "Nhập tên model",
  "模型 ID": "Model ID",
  "接口不提供模型列表时可直接填写模型 ID。":
    "Nếu API không trả danh sách model, hãy điền thẳng Model ID.",
  "连接后选择可用模型": "Kết nối xong sẽ chọn được model",
  "仅保存当前设置": "Chỉ lưu cài đặt hiện tại",
  "连接并读取模型": "Kết nối và tải danh sách model",
  "正在保存所选模型……": "Đang lưu model đã chọn…",
  "模型 {0} 已自动保存。": "Đã tự động lưu model {0}.",
  "模型保存失败：{0}": "Lưu model thất bại: {0}",
  "正在保存配置……": "Đang lưu cấu hình…",
  "配置已保存，后台运行时已重载。": "Đã lưu cấu hình, tiến trình nền đã nạp lại.",
  "保存失败：{0}": "Lưu thất bại: {0}",
  "删除失败：{0}": "Xóa thất bại: {0}",
  "正在保存连接信息并读取模型；不会触发模型生成……":
    "Đang lưu thông tin kết nối và tải danh sách model; không kích hoạt sinh nội dung…",
  "连接成功；唯一模型 {0} 已自动选择并保存。未触发模型生成。":
    "Kết nối thành công; model duy nhất {0} đã được tự chọn và lưu. Không kích hoạt sinh nội dung.",
  "连接成功，读取到 {0} 个模型；选择后会自动保存。未触发模型生成。":
    "Kết nối thành công, tải được {0} model; chọn xong sẽ tự lưu. Không kích hoạt sinh nội dung.",
  "连接成功，但接口没有返回模型列表；请填写模型 ID，再点“仅保存当前设置”。未触发模型生成。":
    "Kết nối thành công nhưng API không trả danh sách model; hãy điền Model ID rồi bấm “Chỉ lưu cài đặt hiện tại”. Không kích hoạt sinh nội dung.",
  "读取模型时意外触发了生成请求":
    "Việc tải danh sách model đã vô tình kích hoạt yêu cầu sinh nội dung",
  "连接失败：{0}": "Kết nối thất bại: {0}",
  "独立 Memory API · {0} · 模型 {1} · 本页面累计生成 {2} 次":
    "Memory API riêng · {0} · model {1} · trang này đã gọi {2} lần",
  "未填写": "chưa điền",
  "连接状态读取失败：{0}": "Đọc trạng thái kết nối thất bại: {0}",

  // --- Settings: advanced ---------------------------------------------------
  "自动续接被截断的模块输出（额外消耗调用）":
    "Tự nối tiếp phần đầu ra bị cắt (tốn thêm lượt gọi)",
  "模块结构错误时自动专项修复 1 次（额外消耗调用）":
    "Tự sửa chuyên biệt 1 lần khi mô-đun sai cấu trúc (tốn thêm lượt gọi)",
  "资料确认使用 Assistant 预填充；关闭后改为 System":
    "Xác nhận tư liệu dùng Assistant prefill; tắt thì chuyển sang System",
  "任务恢复、正文清洗与 Prompt 设置":
    "Khôi phục tác vụ, làm sạch nội dung và cài đặt Prompt",
  "AI 正文标签": "Thẻ bọc nội dung AI",
  // Extended beyond the original: this fork accepts a tag list and the `*` entry.
  "默认 content。AI 只读取最后一个完整标签块，删除块内 HTML 注释并丢弃标签外内容；用户发言不受影响。":
    "Mặc định là content. Chỉ khối thẻ hoàn chỉnh cuối cùng của AI được đọc, chú thích HTML bên trong bị xóa và nội dung ngoài thẻ bị bỏ; lời của bạn không bị ảnh hưởng. " +
    "Preset dùng thẻ khác thì điền nhiều thẻ cách nhau bằng dấu phẩy, ví dụ: content, story_scene. " +
    "Thêm mục * để khi không khớp thẻ nào thì lấy toàn bộ tin nhắn — dành cho preset không bọc thẻ. " +
    "Điền sai thẻ mà không có * thì lời của AI bị bỏ trắng và ký ức chỉ dựng từ lời bạn.",
  "并发数": "Số luồng song song",
  "默认 1；只约束 NarraMem 后台任务。": "Mặc định 1; chỉ giới hạn tác vụ nền của NarraMem.",
  "传输失败自动重试次数": "Số lần tự thử lại khi lỗi truyền",
  "默认 1；每个模块首次失败后最多再请求此次数。":
    "Mặc định 1; mỗi mô-đun sau lần lỗi đầu sẽ thử lại tối đa số lần này.",
  "自动续接次数上限": "Giới hạn số lần nối tiếp tự động",
  "默认 1；只有输出中途截断时使用。": "Mặc định 1; chỉ dùng khi đầu ra bị cắt giữa chừng.",
  "请求超时（毫秒）": "Thời gian chờ yêu cầu (ms)",
  "破限头部（System）": "Header phá rào (System)",
  "身份确认（Assistant）": "Xác nhận danh tính (Assistant)",
  "资料收到确认": "Xác nhận đã nhận tư liệu",
  "通用模块化 Prompt": "Prompt mô-đun hóa dùng chung",
  // Present in upstream source but tree-shaken out of the shipped bundle;
  // kept so the string is already covered if a later build reaches that path.
  "当前模型无法自动匹配 NarraMem Prompt，请在高级设置选择兼容 Prompt":
    "Model hiện tại không tự khớp được Prompt của NarraMem, hãy chọn Prompt tương thích trong cài đặt nâng cao",
  "不会发送最大上下文、最大回复、温度、Top P 或会话上限；均使用所选模型／服务端默认值。手动修复每点击一次只调用一次，没有总次数上限。":
    "Không gửi context tối đa, độ dài phản hồi tối đa, temperature, Top P hay giới hạn phiên; tất cả dùng mặc định của model / máy chủ. Mỗi lần bấm sửa thủ công chỉ gọi đúng một lần, không có giới hạn tổng.",

  // --- Data export ----------------------------------------------------------
  "用于定位扩展、宿主、解析与持久化问题；不包含 API 配置和 Prompt 正文":
    "Dùng để tìm lỗi extension, host, phân tích và lưu trữ; không chứa cấu hình API hay nội dung Prompt",
  "用于复现长期记忆结果，可能包含当前聊天的敏感内容":
    "Dùng để tái hiện kết quả ký ức dài hạn, có thể chứa nội dung nhạy cảm của chat hiện tại",
  "隐私警告：核心数据可能包含聊天原文、角色资料、世界状态、因果证据和会话标识。导出不包含 API URL、API Key、secret ID 或 Prompt 正文。请只发送给你信任的人。":
    "Cảnh báo riêng tư: dữ liệu lõi có thể chứa nguyên văn chat, thông tin nhân vật, trạng thái thế giới, bằng chứng nhân quả và định danh phiên. Bản xuất không chứa API URL, API Key, secret ID hay nội dung Prompt. Chỉ gửi cho người bạn thực sự tin tưởng.",
  "我理解核心数据可能包含聊天记录等隐私内容":
    "Tôi hiểu dữ liệu lõi có thể chứa lịch sử chat và nội dung riêng tư",
  "下载诊断日志": "Tải nhật ký chẩn đoán",
  "下载核心数据＋日志": "Tải dữ liệu lõi + nhật ký",
  "核心数据可能包含聊天记录、角色资料、世界状态和因果证据。确认下载到本机？":
    "Dữ liệu lõi có thể chứa lịch sử chat, thông tin nhân vật, trạng thái thế giới và bằng chứng nhân quả. Xác nhận tải về máy?",
  "核心数据导出失败：{0}": "Xuất dữ liệu lõi thất bại: {0}",

  // --- Launcher -------------------------------------------------------------
  '<i class="fa-solid fa-brain" aria-hidden="true"></i><span>叙忆</span>':
    '<i class="fa-solid fa-brain" aria-hidden="true"></i><span>NarraMem</span>',
  "打开 NarraMem 叙忆": "Mở NarraMem",
  "打开 NarraMem 叙忆（内测 {0}）": "Mở NarraMem (beta {0})",
  "打开 NarraMem 记忆中心": "Mở Trung tâm ký ức NarraMem",

  // --- API error surfaces ---------------------------------------------------
  "未知错误": "Lỗi không xác định",
  "尚未保存 API Key": "Chưa lưu API Key",
  "API Key 无效或没有访问权限{0}": "API Key sai hoặc không có quyền truy cập{0}",
  "酒馆本地连接接口不可用": "API kết nối cục bộ của SillyTavern không khả dụng",
  "连接接口超时": "Kết nối API quá thời gian chờ",
  "接口返回了无法识别的数据": "API trả về dữ liệu không đọc được",
  "接口拒绝了请求{0}": "API từ chối yêu cầu{0}",
  "服务器地址或模型配置不完整": "Địa chỉ máy chủ hoặc model chưa điền đủ",
  "页面配置已经变化，请重新连接": "Cấu hình trên trang đã thay đổi, hãy kết nối lại",
  "保存连接配置失败：{0}": "Lưu cấu hình kết nối thất bại: {0}",
  "无法确认本地密钥状态：{0}": "Không xác nhận được trạng thái Key cục bộ: {0}",
  "读取模型失败：{0}": "Tải danh sách model thất bại: {0}",
  "请先填写并保存 Memory API Key": "Hãy điền và lưu Memory API Key trước",
  "无法读取当前酒馆角色资料／世界书（{0}）":
    "Không đọc được thẻ nhân vật / world book của SillyTavern ({0})",

  // --- Runtime errors -------------------------------------------------------
  "NarraMem 运行时尚未启用": "Tiến trình NarraMem chưa được bật",
  "重新处理楼层必须是非负整数": "Lượt cần xử lý lại phải là số nguyên không âm",
  "当前聊天中不存在楼层 {0}": "Chat hiện tại không có lượt {0}",
  "无法读取重新处理楼层": "Không đọc được lượt cần xử lý lại",
  "当前没有可召回的聊天": "Hiện chưa có chat nào để Recall",
  "模块分页游标与模块不匹配": "Con trỏ phân trang không khớp mô-đun",
  "模块记录 {0} 的正文缺失": "Thiếu nội dung của bản ghi {0}",
  "批次覆盖的 AI 楼层不存在": "Lượt AI thuộc đợt này không tồn tại",
  "批次覆盖边界无法定位": "Không xác định được ranh giới đợt",
  "七个模块已完成，但可信编译／Checkpoint 校验失败":
    "Đã xong 7 mô-đun nhưng biên dịch tin cậy / kiểm chứng Checkpoint thất bại",
  "无法定位聊天变更边界": "Không xác định được ranh giới thay đổi của chat",
  "批次 Source 分片格式无效": "Mảnh Source của đợt sai định dạng",
  "批次 Source 页面格式无效": "Trang Source của đợt sai định dạng",
  "批次 {0} 的 Source 页面缺失": "Thiếu trang Source của đợt {0}",

  // --- Batch input pages ----------------------------------------------------
  "{0} 格式无效": "{0} sai định dạng",
  "批次输入 manifest": "manifest đầu vào của đợt",
  "批次输入 manifest 字段无效": "Trường của manifest đầu vào không hợp lệ",
  "批次输入 manifest 含重复分片页": "manifest đầu vào có trang mảnh dữ liệu bị trùng",
  "批次输入分片": "Mảnh dữ liệu đầu vào của đợt",
  "批次输入分片字段无效": "Trường của mảnh dữ liệu đầu vào không hợp lệ",
  "批次输入分片 {0} 缺少页 ID": "Mảnh dữ liệu đầu vào {0} thiếu page ID",
  "批次输入分片页 {0} 身份不匹配": "Trang mảnh dữ liệu {0} không khớp định danh",
  "批次输入分片 {0} 缺失": "Thiếu mảnh dữ liệu đầu vào {0}",
  "批次输入分片 {0} 顺序或归属无效": "Mảnh dữ liệu đầu vào {0} sai thứ tự hoặc sai đợt",
  "批次输入分片总长度校验失败": "Tổng độ dài các mảnh dữ liệu đầu vào không khớp",
  "批次输入分片校验和不匹配": "Checksum của mảnh dữ liệu đầu vào không khớp",

  // --- Recall barrier -------------------------------------------------------
  "Recall Prompt 必须且只能包含一个 NarraMem Recall 变量":
    "Prompt Recall phải chứa đúng một biến Recall của NarraMem",
  "当前酒馆不支持 NarraMem Recall 注入":
    "SillyTavern hiện tại không hỗ trợ tiêm Recall của NarraMem",
  "当前聊天没有可用于 reroll Recall 的用户楼层":
    "Chat hiện tại không có lượt người dùng nào để Recall khi reroll",
  "Recall 注入能力在运行时消失": "Khả năng tiêm Recall biến mất lúc đang chạy",

  // --- TauriTavern host -----------------------------------------------------
  "TauriTavern 返回了无效的聊天历史页":
    "TauriTavern trả về trang lịch sử chat không hợp lệ",
  // beta.70 added these host-reader failures.
  "TauriTavern 当前聊天身份尚未同步完成":
    "Danh tính chat hiện tại của TauriTavern chưa đồng bộ xong",
  "TauriTavern 完整聊天读取失败": "Đọc toàn bộ chat của TauriTavern thất bại",
  "TauriTavern 主进程尚未就绪": "Tiến trình chính của TauriTavern chưa sẵn sàng",
  "TauriTavern 尾页读取失败": "Đọc trang cuối của TauriTavern thất bại",
  "TauriTavern 更早历史页读取失败":
    "Đọc trang lịch sử cũ hơn của TauriTavern thất bại",
  "TauriTavern 完整聊天尚未读取完成": "Chưa đọc xong toàn bộ chat của TauriTavern",
  "TauriTavern 当前可写聊天窗口不是完整权威聊天，拒绝隐藏楼层":
    "Cửa sổ chat ghi được của TauriTavern không phải bản chat đầy đủ, từ chối ẩn lượt",
  "TauriTavern 官方完整聊天 API 不可用":
    "API đọc toàn bộ chat chính thức của TauriTavern không khả dụng",
  "TauriTavern 聊天历史分页没有收敛":
    "Phân trang lịch sử chat của TauriTavern không hội tụ",
  "TauriTavern 声明仍有更早聊天，但没有返回历史页":
    "TauriTavern báo vẫn còn chat cũ hơn nhưng không trả về trang lịch sử",
  "TauriTavern 没有返回可验证的历史页":
    "TauriTavern không trả về trang lịch sử kiểm chứng được",
  "TauriTavern 聊天历史分页没有向前推进":
    "Phân trang lịch sử chat của TauriTavern không tiến thêm",
  "TauriTavern 聊天历史页不连续": "Trang lịch sử chat của TauriTavern không liền mạch",
  "TauriTavern 聊天在读取期间发生变化或返回数量不一致":
    "Chat của TauriTavern thay đổi trong lúc đọc hoặc trả về số lượng không khớp",
};
