# NarraMem — bản tiếng Việt

Bản Việt hóa của [NarraMem](https://github.com/sanmingyue/NarraMem-SillyTavern), hệ thống ký ức dài hạn cho SillyTavern của tác giả **三明月**. Việc dịch được tác giả cho phép.

Cài đặt và cách dùng: xem [INSTALL_VI.md](INSTALL_VI.md). Bản gốc tiếng Trung: [INSTALL_BETA.md](INSTALL_BETA.md).

```
Extensions → Install extension → https://github.com/SolNg/NarraMem
```

Yêu cầu SillyTavern `1.18.0` trở lên. Đang theo bản gốc `2.0.2`.

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

## Phạm vi: chỉ hai thay đổi hành vi

Bản này cố ý giữ **rất ít** thay đổi so với bản gốc. Chỉ hai việc:

1. **Kéo chuột để cuộn thanh chip lọc** — thuần giao diện.
2. **Thẻ bọc nội dung AI**: nhận nhiều thẻ, mặc định `content, story_scene`, kèm nút **"Dò thẻ trong chat này"** để điền thẻ từ chat thay vì đoán.

Tổng cộng 6 mục trong `tools/patches.mjs` — việc thứ hai cần năm mục: chuẩn hoá danh sách, chiếu theo danh sách, giá trị mặc định, và hai mục cho nút dò (một để bắt bí danh `getContext`, một để dựng nút).

Các bản vá từng có trong fork này — sửa lỗi xoá chat, nút thử lại khi kẹt biên dịch, ghi chi tiết lỗi finalizer, chốt `Canonical JSON rejects undefined` — **đã được gỡ bỏ theo yêu cầu**. Một số trong đó bản gốc đã tự sửa (lỗi xoá chat ở 1.0.0, lỗi `undefined` ở 2.0.2), số còn lại thì lỗi vẫn còn nhưng fork không đụng tới nữa.

**Hệ quả cần biết:** hai lỗi sau của bản gốc quay trở lại, vì bản vá tương ứng đã bị gỡ.

- **Màn hình chính treo ở "Đang tải".** Panel vẫn chỉ xét `chat_id !== null`, trong khi runtime xét cả `character_id`. SillyTavern vẫn trả `chat_id` của chat mở gần nhất khi bạn đang ở màn hình chính, nên hai bên không bao giờ gặp nhau. Đã kiểm lại trên 2.0.2: `const hasCurrentChat = currentIdentity.chat_id !== null;` vẫn nguyên. Harness `e2e-nochar2` vì vậy báo SAI — đó là kết quả **đúng như dự kiến**, không phải hồi quy.
- **Nút xử lý thủ công bị ẩn khi đợt kẹt ở `FINALIZING`**, khiến không có nút nào để bấm. Lối thoát là nút "Làm mới trạng thái" ở tab Tổng quan.


## Cấu trúc repo

```
dist/index.js        bundle đã Việt hóa (thứ SillyTavern thực sự nạp)
dist/index.js.map    sourcemap của bản gốc, kèm toàn bộ source TypeScript
l10n/                các prompt bản tiếng Việt
tools/localize.mjs   công cụ áp bản dịch + bản vá vào bundle
tools/patches.mjs    bản vá hành vi (cuộn chip bằng chuột, thẻ bọc nội dung + nút dò)
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
