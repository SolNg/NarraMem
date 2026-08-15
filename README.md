# NarraMem — bản tiếng Việt

Bản Việt hóa của [NarraMem](https://github.com/sanmingyue/NarraMem-SillyTavern), hệ thống ký ức dài hạn cho SillyTavern của tác giả **三明月**. Việc dịch được tác giả cho phép.

Cài đặt và cách dùng: xem [INSTALL_VI.md](INSTALL_VI.md). Bản gốc tiếng Trung: [INSTALL_BETA.md](INSTALL_BETA.md).

```
Extensions → Install extension → https://github.com/SolNg/NarraMem
```

Yêu cầu SillyTavern `1.18.0` trở lên. Đang theo bản gốc `0.4.0-beta.67`.

## Đã dịch những gì

| Phần | Trạng thái |
|---|---|
| Toàn bộ giao diện: nút, nhãn, tooltip, thông báo lỗi, hộp thoại xác nhận | Tiếng Việt |
| Prompt Recall (`NM-P0010`) — đoạn tiêm vào lượt roleplay | Tiếng Việt |
| Prompt trích xuất `M1`–`M7`, prompt sửa lỗi, vỏ tư liệu, prompt nối tiếp | **Giữ tiếng Trung** — xem lý do bên dưới |
| Header danh tính + xác nhận tư liệu (mặc định trong Cài đặt) | Giữ nguyên tiếng Anh, **có nối thêm chỉ thị ngôn ngữ đầu ra** |
| Nhãn Key trong `secrets.json` | Giữ nguyên |

### Ép ký ức được viết bằng tiếng Việt

Không một prompt nào của bản gốc nói model phải dùng ngôn ngữ nào, trong khi schema có nhiều trường **model tự viết ra**: `summary`, `title`, `boundary_reason`, `action_or_occurrence`, `mechanism`, `trigger_summary`, `expected_payoff`, `description`, `uncertainty`, `canonical_label`. Ngôn ngữ của chúng bị bỏ ngỏ — và chúng được nạp ngược vào lượt roleplay qua RecallBundle, nên nếu ra tiếng Trung thì văn phong bot cũng bị kéo theo.

Bản này ghim lại bằng cách nối thêm chỉ thị vào hai giá trị mặc định:

- **Header phá rào (System)** — message 1 của mọi lượt gọi mô-đun: nêu quy tắc.
- **Xác nhận đã nhận tư liệu** — message 5, giọng assistant ngay trước hợp đồng đầu ra: cam kết lại.

Chỉ thị nói rõ phải giữ nguyên tên field, giá trị enum, ID, `candidate_key`, và **`quote` phải trích nguyên văn** — trích dẫn không phải là dịch, dịch là hỏng validation.

Cách này an toàn hơn hẳn việc dịch prompt trích xuất: cả hai trường đều **không** bị băm vào `prompt_contract_material` hay `parameters_material` (đã kiểm chứng trong code), nên không invalidate ký ức nào. Chúng cũng là textarea sửa được ngay trong Cài đặt nâng cao, nên bạn bỏ hoặc đổi sang ngôn ngữ khác lúc nào cũng được.

Lưu ý: đây là **giá trị mặc định**. Nếu bạn đã chạy bản trước và extension đã lưu hai trường này vào cài đặt, chúng giữ giá trị cũ — cần dán tay hoặc xóa trắng ô để nó nạp lại mặc định.

Tên field, giá trị enum và thuật ngữ kỹ thuật (`Recall`, `Checkpoint`, `Schema`, `Prompt`, `Memory API`, `knows`/`believes`/`unknown_to`…) được giữ nguyên có chủ đích — đó là lớp từ vựng chung nối giao diện, prompt và dữ liệu đã lưu với nhau.

### Vì sao prompt trích xuất vẫn là tiếng Trung

Hai lý do, đều mang tính kỹ thuật chứ không phải ngại việc:

1. **Dịch chúng sẽ làm mất ký ức đã trích xuất.** Digest SHA-256 của nhóm prompt này được gộp vào `prompt_contract_material` và niêm vào từng Checkpoint. Đổi nội dung prompt là đổi digest, khiến mọi Checkpoint tạo bởi bản cũ bị coi là không khớp (`SEMANTIC_COVERAGE_MISMATCH`) và phải trích xuất lại từ đầu.
2. **Lợi ích gần như bằng không, khi đã ghim ngôn ngữ ở nơi khác.** Bạn không nhìn thấy nhóm prompt này và nó không quyết định ngôn ngữ đầu ra của bot. Nó *có* ảnh hưởng gián tiếp tới ngôn ngữ các trường văn bản tự do trong ký ức — nhưng chỉ vì bản gốc bỏ ngỏ, và chỉ thị nói ở mục trên đã ghim thẳng việc đó rồi. Ngôn ngữ chỉ thị vốn không cần khớp ngôn ngữ chat: prompt tiếng Trung vẫn bóc tách chat tiếng Việt bình thường.

Ngược lại, prompt Recall thì **có** dịch, vì nó không trích xuất gì cả: nó dặn AI viết văn, nên ngôn ngữ của nó ảnh hưởng trực tiếp tới văn phong đầu ra. Digest của nó không nằm trong `prompt_contract_material`, nên dịch nó không đụng tới ký ức cũ.

Nếu bạn muốn *đọc hiểu* nhóm prompt trích xuất đang bảo model làm gì, xem [docs/prompts-vi.md](docs/prompts-vi.md) — bản dịch tham khảo, không phải bản chạy thật.

## Sửa lỗi: xoá chat không dọn Memory Book

`INSTALL_BETA.md` của bản gốc nói rằng xoá một cuộc chat sẽ xoá luôn world book Memory Set tương ứng. Thực tế ở beta.60 việc đó **không xảy ra**, và bản này vá lại.

Nguyên nhân: handler `CHAT_DELETED` gọi `TavernMemoryRegistry` — registry v1 của kiến trúc cũ. Lớp đó đọc `NarraMem__REGISTRY__v1` và chỉ xoá các sách tên `NarraMem__CONTROL__*`, `NarraMem__ARCHIVE__*` cùng 5 tiền tố v1 khác. Runtime hiện tại lại ghi `NarraMem__MEMORY__<id>` và đăng ký trong `NarraMem__REGISTRY__v2` — cả hai đều nằm ngoài tầm biết của đường code đó, nên nó trả về `NOT_FOUND` và không xoá gì.

Trớ trêu là hàm đúng có tồn tại: `TavernMemoryRegistryStore.deleteChat()` xoá thẳng `memory_book_name`. Nhưng nơi duy nhất gọi nó là `resumePendingDeletions()`, vốn chỉ xử lý bản ghi đã mang trạng thái `DELETE_PENDING` — trạng thái mà chỉ chính `deleteChat()` mới đặt được. Vòng khép kín, không có lối vào, nên nó là code chết.

Bản vá cho handler gọi `deleteChat()` của v2 trước, rồi vẫn chạy tiếp lượt quét v1 cho các máy còn sách kiến trúc cũ. Hai lời gọi được cô lập nên một cái lỗi không chặn cái kia, và mục chẩn đoán `deleted_chat_memory_cleanup` giờ báo cả hai kết quả:

```json
{"status":"DELETED","legacy_status":"NOT_FOUND","memory_book_removed":true,"deleted_worldbook_count":1}
```

Đối chứng bằng cách chạy thật extension trong jsdom, cho runtime tạo world book rồi phát sự kiện `chat_deleted`:

| | `deleteWorldInfo` được gọi | Memory Book | chẩn đoán |
|---|---|---|---|
| bundle gốc | **không lần nào** | còn nguyên | `NOT_FOUND`, xoá 0 file |
| bundle đã vá | có, đúng tên sách | đã xoá | `DELETED`, xoá 1 file |

Bản vá nằm ở `tools/patches.mjs`, neo bằng regex có nhóm bắt để lấy tên định danh sau minify, và tra tên lớp registry v2 qua AST. Nếu bản gốc đổi cấu trúc khiến neo không khớp đúng một lần, `apply` dừng lại báo lỗi thay vì vá bừa.

## Cải thiện: kéo chuột để cuộn thanh chip lọc

Thanh chip trong tab Ký ức (`Nhân vật & Thực thể`, `Cảnh & Chương`, …) cuộn ngang được, nhưng CSS gốc đặt `scrollbar-width: none` nên trên máy tính không còn cách nào chạm tới các chip nằm ngoài mép — chuột không kéo được, chỉ còn phím mũi tên.

Bản này thêm:

- **CSS**: hiện lại thanh cuộn mảnh và con trỏ `grab` khi dùng chuột (`@media (pointer: fine)`), không đụng gì tới cảm ứng.
- **JS**: kéo chuột để cuộn, và lăn chuột dọc cũng cuộn ngang.

Một cú kéo kết thúc bằng sự kiện `click` rơi trúng chip dưới con trỏ, sẽ vô tình đổi phân loại; nên cú kéo nào thực sự có di chuyển sẽ nuốt đúng một `click` kế tiếp ở pha capture. Click bình thường không bị ảnh hưởng.

## Sửa lỗi: thẻ bọc nội dung AI — nhiều thẻ và tuỳ chọn lấy toàn văn

Bản gốc chỉ đọc **một** thẻ từ tin nhắn AI và *fail-closed*: không tìm thấy khối `<thẻ>…</thẻ>` hoàn chỉnh thì trả về chuỗi rỗng. Thất bại này im lặng và lệch một bên:

- lượt đó **vẫn được tính** vào mốc 14/10 (`validAiWindows` chỉ loại khi `narrative_text === null`, chuỗi rỗng lọt qua);
- nhưng **không sinh Evidence nào** (`core-source-projection` bỏ qua khi `length === 0`);
- còn tin nhắn của **bạn** thì không hề bị lọc thẻ.

Kết quả: preset xuất `<story_scene>` trong khi ô cài đặt để `content` sẽ dựng ký ức **chỉ từ nửa hội thoại của bạn**, các lượt cũ vẫn bị ẩn, và không có một cảnh báo nào.

Bản này cho ô thẻ nhận **danh sách cách nhau bằng dấu phẩy**, cộng thêm mục đặc biệt `*`:

| Điền | Nghĩa |
|---|---|
| `content` | Y như bản gốc — một thẻ, fail-closed |
| `content, story_scene` | Thử lần lượt; lấy khối hoàn chỉnh xuất hiện **sau cùng** trong tin nhắn, bất kể của thẻ nào |
| `content, *` | Có thẻ thì ưu tiên thẻ; không khớp thẻ nào thì lấy **toàn bộ** tin nhắn |
| `*` | Không lọc thẻ, luôn lấy toàn văn — cho preset không bọc thẻ |

Gộp cả hai vào đúng ô sẵn có nên không phải đụng schema settings, và ô này vốn đã nằm trong `parameters_material` — nghĩa là provenance vẫn trung thực, đồng thời `content` vẫn chuẩn hoá thành `content` y như cũ nên **không đổi hash Checkpoint nào**.

Chuỗi nhập vào được chuẩn hoá tất định: cắt khoảng trắng, khử trùng lặp, loại mục không hợp lệ, nối lại bằng `, `. `  content , story_scene ,, content , <bad> , * ` → `content, story_scene, *`.

Phần payload của bản vá được tách riêng thành hàm dựng mã trong `tools/patches.mjs` để **kiểm thử độc lập**: 30 test bao phủ tương thích ngược, danh sách nhiều thẻ, thứ tự chọn khối, `*`, và các ràng buộc mà `source-snapshot` kiểm tra ở downstream (`raw_end − raw_start ≥ độ dài text`).

## Cấu trúc repo

```
dist/index.js        bundle đã Việt hóa (thứ SillyTavern thực sự nạp)
dist/index.js.map    sourcemap của bản gốc, kèm toàn bộ source TypeScript
l10n/                các prompt bản tiếng Việt
tools/localize.mjs   công cụ áp bản dịch + bản vá vào bundle
tools/patches.mjs    các bản vá hành vi (sửa lỗi xoá chat, kéo chuột cuộn chip)
tools/translations.mjs   bảng dịch
docs/prompts-vi.md   bản dịch tham khảo của prompt trích xuất
```

Lưu ý về `dist/index.js.map`: nó vẫn là sourcemap của **bản gốc**. Toàn bộ source TypeScript (~35.000 dòng) nằm trong `sourcesContent` của file này và vẫn đọc được, nhưng vì bản dịch làm đổi độ dài các chuỗi nên ánh xạ vị trí dòng/cột không còn chính xác tuyệt đối.

## Cập nhật khi bản gốc ra phiên bản mới

Bản dịch được lưu dưới dạng **bảng tra + script**, không phải bản vá diff, nên áp lại vào bundle mới rất gọn:

```bash
npm install                                   # cài acorn
git fetch upstream
git checkout upstream/main -- dist manifest.json style.css SHA256SUMS.txt
node tools/localize.mjs check                 # liệt kê chuỗi mới chưa có bản dịch
# bổ sung các chuỗi đó vào tools/translations.mjs
node tools/localize.mjs apply
sha256sum .gitattributes dist/index.js dist/index.js.map INSTALL_BETA.md manifest.json style.css > SHA256SUMS.txt
```

`check` thoát với mã lỗi khác 0 nếu bản gốc thêm chuỗi mới, và `apply` từ chối chạy khi bản dịch còn thiếu — nên không thể lỡ tay xuất ra bản nửa Việt nửa Trung.

Công cụ này định vị chuỗi bằng cách parse AST với acorn chứ không dò chuỗi bằng regex: bundle đầy regex literal chứa dấu nháy, dò bằng text sẽ nhận nhầm. Các biểu thức `${…}` được chuẩn hóa thành placeholder `{0}`, `{1}` nên bảng dịch không bao giờ phải nhắc tới tên biến đã minify, và câu tiếng Việt được phép đảo thứ tự placeholder.

## Bản quyền

Bản gốc thuộc về **三明月 / NarraMem contributors** và không kèm file LICENSE, tức mặc định là *all rights reserved*. Repo này là bản dịch được tác giả cho phép; mọi quyền với phần mềm gốc vẫn thuộc về tác giả.
