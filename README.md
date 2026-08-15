# NarraMem — bản tiếng Việt

Bản Việt hóa của [NarraMem](https://github.com/sanmingyue/NarraMem-SillyTavern), hệ thống ký ức dài hạn cho SillyTavern của tác giả **三明月**. Việc dịch được tác giả cho phép.

Cài đặt và cách dùng: xem [INSTALL_VI.md](INSTALL_VI.md). Bản gốc tiếng Trung: [INSTALL_BETA.md](INSTALL_BETA.md).

```
Extensions → Install extension → https://github.com/SolNg/NarraMem
```

Yêu cầu SillyTavern `1.18.0` trở lên. Repo này bám sát nhánh `main` của bản gốc, chỉ khác ở phần ngôn ngữ.

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
2. **Lợi ích gần như bằng không.** Bạn không nhìn thấy nhóm prompt này, nó không quyết định ngôn ngữ đầu ra của bot, và cũng không quyết định ngôn ngữ ký ức được lưu. Nó chỉ là chỉ thị bảo model xuất ra JSON đúng schema — mà ngôn ngữ chỉ thị không cần khớp ngôn ngữ chat.

Ngược lại, prompt Recall thì **có** dịch, vì nó không trích xuất gì cả: nó dặn AI viết văn, nên ngôn ngữ của nó ảnh hưởng trực tiếp tới văn phong đầu ra. Digest của nó không nằm trong `prompt_contract_material`, nên dịch nó không đụng tới ký ức cũ.

Nếu bạn muốn *đọc hiểu* nhóm prompt trích xuất đang bảo model làm gì, xem [docs/prompts-vi.md](docs/prompts-vi.md) — bản dịch tham khảo, không phải bản chạy thật.

## Cấu trúc repo

```
dist/index.js        bundle đã Việt hóa (thứ SillyTavern thực sự nạp)
dist/index.js.map    sourcemap của bản gốc, kèm toàn bộ source TypeScript
l10n/                các prompt bản tiếng Việt
tools/localize.mjs   công cụ áp bản dịch vào bundle
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
