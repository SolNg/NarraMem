# NarraMem — bản tiếng Việt

Bản Việt hóa của [NarraMem](https://github.com/sanmingyue/NarraMem-SillyTavern), hệ thống ký ức dài hạn cho SillyTavern của tác giả **三明月**. Việc dịch được tác giả cho phép.

Cài đặt và cách dùng: xem [INSTALL_VI.md](INSTALL_VI.md). Bản gốc tiếng Trung: [INSTALL_BETA.md](INSTALL_BETA.md).

```
Extensions → Install extension → https://github.com/SolNg/NarraMem
```

Yêu cầu SillyTavern `1.18.0` trở lên. Đang theo bản gốc `1.0.0`.

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

## 1.0.0 có gì mới đáng kể

**Đầu ra chuyển từ JSON sang thẻ văn bản.** Mô-đun không còn bị bắt trả về JSON đúng schema; giờ nó xuất các khối `<NM_ENTITY>key | type | label | …</NM_ENTITY>` phân cách bằng `|`. `response_format` mặc định của bước trích xuất đã đổi thành `tagged_text`. Đây là thay đổi quan trọng nhất với ai từng gặp `JSON_INVALID` liên miên: model dựng dòng có dấu gạch đứng dễ hơn nhiều so với dựng một khối JSON lớn không được sai dấu nào. Mã lỗi tương ứng cũng đổi thành `TAGGED_OUTPUT_INVALID` / `TAGGED_OUTPUT_TRUNCATED`.

**Xử lý chat cũ theo yêu cầu (backfill).** Trước đây phải chờ đủ 14 lượt AI thì mới có một đợt, và đó là cách duy nhất. 1.0.0 thêm hẳn một luồng riêng: quét chat sẵn có, xếp hàng, chạy, **tạm dừng và tiếp tục được**, và **cỡ đợt chỉnh được từ 1 đến 50** (`manual_backfill_batch_size`, mặc định 10). Với chat có lượt AI dài thì hạ cỡ đợt xuống là cách trực tiếp nhất để giảm kích thước prompt.

**Danh tính chat ổn định.** Memory Set giờ khoá theo một `narramem_stable_chat_id` ghi vào metadata của chat, không còn theo tên file. Đổi tên chat hay tạo nhánh không làm mất ký ức nữa; nhánh được cấp ID riêng thay vì mượn nhầm sách của chat gốc.

**Cổng chờ sinh nội dung chính.** `main-generation-gate.ts` mới giữ cho NarraMem không gọi Memory API trong lúc chat đang sinh câu trả lời — trước đây hai bên có thể tranh nhau quota cùng lúc.

Ba prompt trích xuất M1–M7, prompt sửa và prompt nối tiếp đều đã được viết lại cho định dạng thẻ, nên toàn bộ hợp đồng prompt trong bảng dịch cũng được thay mới.


## Bản vá đã gỡ: xoá chat không dọn Memory Book

Từ beta.60 tới beta.75, xoá một cuộc chat **không** xoá world book Memory Set của nó, dù `INSTALL_BETA.md` nói là có. Handler `CHAT_DELETED` gọi `TavernMemoryRegistry` — registry v1 của kiến trúc cũ, chỉ biết các sách `NarraMem__CONTROL__*` / `NarraMem__ARCHIVE__*`, trong khi runtime ghi `NarraMem__MEMORY__<id>`. Nó trả `NOT_FOUND` và không xoá gì. Hàm đúng có tồn tại nhưng là code chết: `deleteChat()` chỉ được gọi từ `resumePendingDeletions()`, vốn chỉ xử lý bản ghi đã mang `DELETE_PENDING` — trạng thái mà chỉ chính `deleteChat()` mới đặt được.

**1.0.0 đã sửa đúng chỗ này.** Bản gốc thêm `chat-memory-cleanup.ts` gọi thẳng `TavernMemoryRegistryStore.deleteChat()`, và xoá hẳn `memory-registry.ts` cùng registry v1. Bản vá của fork này **đã được gỡ bỏ** vì không còn cần.

Kiểm chứng bằng cách chạy thật extension trong jsdom, cho runtime tạo world book rồi phát `chat_deleted`:

| | `deleteWorldInfo` được gọi | Memory Book | chẩn đoán |
|---|---|---|---|
| beta.75 chưa vá | **không lần nào** | còn nguyên | `NOT_FOUND`, xoá 0 file |
| 1.0.0 nguyên bản | có, đúng tên sách | đã xoá | `DELETED`, xoá 1 file |

## Sửa lỗi: màn hình chính treo ở "Đang kết nối"

beta.67 tách trạng thái nhàn rỗi làm hai, nhưng hai nơi dùng **hai điều kiện khác nhau** cho cùng câu hỏi "đã có chat chưa" — và tới 1.0.0 vẫn chưa sửa:

```js
// Panel  — chỉ xét chat_id
describeNoChatRuntimeState(port.getCurrentIdentity().chat_id !== null)
// Runtime — xét cả hai
if (identity.character_id === null || identity.chat_id === null) → no_chat
```

SillyTavern vẫn trả về `chat_id` của chat mở gần nhất khi bạn đang ở màn hình chính. Nên khi chưa chọn nhân vật: panel thấy `chat_id` có giá trị và báo "Đang kết nối chat hiện tại" kèm thanh tiến trình, còn runtime thấy `character_id` null nên đứng yên ở `no_chat`. Hai bên không bao giờ gặp nhau — spinner quay vô hạn, đúng chỗ đáng lẽ phải bảo người dùng mở thẻ nhân vật.

Bản vá cho panel dùng cùng điều kiện với runtime. Nó chỉ đổi một biến boolean nuôi một dòng chữ: không đụng dữ liệu, không đụng ký ức, không đụng hash Checkpoint.

Đối chứng trong jsdom với `characterId` không xác định và `chat_id` khác null:

| | Hiển thị |
|---|---|
| chưa vá | beta.67: "Đang kết nối" treo mãi · beta.70 → 1.0.0: đếm "Đã thu 0/14" cho một chat không tồn tại |
| đã vá | "Hiện không có chat nhân vật nào để xử lý" / "Hãy mở một thẻ nhân vật và lịch sử chat của nó trước." |

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

## Sửa lỗi: `Canonical JSON rejects undefined` khi xử lý thủ công

Lỗi mới của 1.0.0, nằm trong bộ phân tích định dạng thẻ vừa được viết lại. `jsonValue()` trả về `undefined` cho dấu `-` và cho chuỗi rỗng. Ba chỗ đưa kết quả đó vào bản ghi; chỗ `qualifiers` có chốt bằng spread có điều kiện, hai chỗ còn lại gán thẳng:

```js
knownValue:    status === "known" ? { status, value: jsonValue(raw) }  : …   // M4 before/after_state
argumentValue: kind === "literal" ? { kind,   value: jsonValue(value) } : …   // M5 NM_ARGUMENT
```

`canonicalize()` duyệt `Object.keys()`, nên một khoá mang giá trị `undefined` rơi xuống nhánh `typeof value !== "object"` và ném `Canonical JSON rejects undefined`. Đó là TypeError không nằm trong bảng ánh xạ mã lỗi, nên nó hiện ra thành alert thô và mô-đun kẹt lại.

Trớ trêu là chính hợp đồng gây ra: mọi hợp đồng mô-đun đều dặn model **viết `-` cho giá trị tuỳ chọn bỏ trống**. Nên `known#-` ở M4, hay một `NM_ARGUMENT` literal bằng `-` ở M5, đúng là thứ một model tuân thủ sẽ sinh ra.

Chạy đúng hai hàm đã ship, trước và sau khi vá:

| Đầu vào | Chưa vá | Đã vá |
|---|---|---|
| `known#42` | `{"status":"known","value":42}` | không đổi |
| `known#-` | ✗ **Canonical JSON rejects undefined** | `{"status":"known"}` |
| `known#` | ✗ **Canonical JSON rejects undefined** | `{"status":"known"}` |
| literal `42` | `{"kind":"literal","value":42}` | không đổi |
| literal `-` | ✗ **Canonical JSON rejects undefined** | `{"kind":"literal"}` |

Bản vá **bỏ hẳn khoá thay vì bịa ra giá trị**. Bản ghi sau đó trượt Core wire schema như mọi bản ghi hỏng khác — một mã lỗi có ánh xạ mà đường sửa chuyên biệt xử lý được — thay vì sập không lối thoát.


## Cải thiện: nút dò thẻ, và mặc định hai thẻ

Bản gốc mặc định `narrative_content_tag` là `content`. Với các preset bọc chính văn trong `story_scene` — rất phổ biến — điều đó **im lặng cho ra rỗng**: phép chiếu fail-closed, mọi lượt AI đóng góp văn bản trắng, và ký ức rốt cuộc chỉ dựng từ lời của chính bạn. Không có cảnh báo nào.

Vì bộ chuẩn hoá của bản này nhận danh sách nhiều thẻ, mặc định được đổi thành `content, story_scene`. Giá trị mặc định chỉ áp dụng cho máy cài mới; thiết lập đã lưu luôn thắng, nên không `content_fingerprint` nào dịch chuyển vì thay đổi này.

Kèm theo là nút **"Dò thẻ trong chat này"** ngay dưới ô nhập. Nó quét các lượt AI của chat hiện tại, **xếp hạng thẻ theo lượng chữ mà khối hoàn chỉnh cuối cùng của nó thật sự bao phủ** — đúng quy tắc "khối hoàn chỉnh cuối cùng" mà runtime dùng — rồi báo cáo và điền thẻ thắng vào ô.

Xếp theo độ bao phủ chứ không theo số lần xuất hiện là điểm mấu chốt. Trong một chat song ngữ thật, `<ja>` xuất hiện ở **đủ 12/12 lượt**, y hệt `story_scene`; nếu đếm tần suất thì hai bên hoà. Nhưng `story_scene` bao 230k ký tự còn `<ja>` chỉ 1k:

```
Tìm thấy: story_scene (12/12 lượt, ~230k ký tự) · thinking (12/12 lượt, ~96k ký tự)
        · status (12/12 lượt, ~4k ký tự) · ja (12/12 lượt, ~1k ký tự)
```

### Vì sao không dò tự động

Đây không phải ngại làm mà là tránh một lỗi tệ hơn:

```
narrative_content_tag → narrative_projection → content_fingerprint
                                                      ↓
                                    đổi = active_batch_mutation_rollback
```

Một bộ dò tự động mà đổi ý — thêm một lượt AI dùng thẻ khác, hay một lượt không bọc thẻ — sẽ trông y hệt như người dùng vừa sửa chat, và **xoá sạch đợt đang chạy**, âm thầm, không ai bấm gì. Đổi một lỗi nhìn thấy được lấy một lỗi không nhìn thấy được.

Nên dò vẫn là hành động bạn chủ động bấm. Ô thiết lập vẫn là nguồn sự thật duy nhất, và fingerprint chỉ đổi khi bạn cố ý lưu.

Bản vá được kiểm bằng cách **cắt đúng đoạn mã đã chèn ra khỏi `dist/index.js` rồi chạy nó trong jsdom**: 16 test phủ chat rỗng, preset `content`, preset song ngữ nhiều thẻ lồng nhau, preset không bọc thẻ (không ghi đè ô nhập, gợi ý dùng `*`), thẻ mở mà không đóng, tên thẻ có ký tự đặc biệt, và trường hợp `getContext` ném lỗi.


## Sửa lỗi: kẹt cứng khi biên dịch Checkpoint thất bại

Khi cả 7 mô-đun đã xong, đợt chuyển sang `FINALIZING` và extension biên dịch Checkpoint tin cậy **ngay tại máy, không gọi model**. Nếu bước đó ném lỗi, `commitFailure()` ghi `finalization_error_code` nhưng **cố ý giữ nguyên trạng thái `FINALIZING`** — chính chú thích trong contract của bản gốc nói bước này "vẫn thử lại được, Checkpoint cũ vẫn còn hiệu lực".

Vấn đề là chẳng có gì thử lại nó, và giao diện thì giấu mất cái nút duy nhất:

```js
// runtime bắt lỗi -> đăng snapshot "failed"
shouldContinue = ["running", "finalizing", "recall_ready"].includes(status)
// "failed" không nằm trong đó -> chuỗi chạy nền 1,5s dừng hẳn

// panel: hộp lỗi hiện ra, nhưng nút thì
manualRepair.hidden = findManualRepairModule(module_states, batch_status) === null
// hàm đó chỉ trả về mô-đun khi batch_status là NEEDS_USER hoặc READY.
// Ở đây batch_status = FINALIZING và cả 7 mô-đun đều COMMITTED -> null -> ẩn nút.
```

Kết quả đúng như ảnh người dùng gửi: hộp đỏ ghi `FINALIZER_CONTRACT_FAILED · Đã xong 7 mô-đun nhưng biên dịch tin cậy / kiểm chứng Checkpoint thất bại`, dòng "Mô-đun lỗi: **không rõ**" (vì `active_module_id` là null), và **không có nút nào để bấm**.

Máy trạng thái vốn không hỏng — vào lại nó là biên dịch lại. Bản vá thôi giấu điều đó: nút luôn hiện khi hộp lỗi hiện, và khi không có mô-đun riêng lẻ nào sửa được thì nút tự đổi nhãn thành **"Thử lại bước đang kẹt (không tốn lần gọi)"** và chạy đúng `on_refresh()` — cùng hàm nằm sau nút "Làm mới trạng thái". Nhãn gốc được nút tự ghi nhớ ở lần vẽ đầu tiên nên bản dịch không bị chép lại lần hai trong mã vá.

| | Khi 7 mô-đun xong nhưng biên dịch hỏng |
|---|---|
| chưa vá | hộp lỗi hiện, nút bị ẩn, chuỗi chạy nền dừng — chỉ thoát được bằng "Làm mới trạng thái" ở tab Tổng quan, nếu người dùng đoán ra |
| đã vá | nút hiện ngay trong hộp lỗi, đổi nhãn, bấm là biên dịch lại |

## Sửa lỗi: thông báo lỗi thật của bước biên dịch bị vứt đi

`finalizationError()` ánh xạ 8 thông báo nó nhận ra thành mã riêng, rồi dồn **mọi thứ còn lại** vào `FINALIZER_CONTRACT_FAILED`. Cái mã gộp đó phủ ít nhất 6 lỗi hoàn toàn khác nhau — `M3 has no complete cold-readable partition`, `Novel Evidence … is missing from the current ledger`, `THREAD_IMPACT head is not an object`, `Checkpoint semantic record … is duplicated or misidentified`, … Chẩn đoán lại chỉ ghi đúng cái mã, nên nhật ký không phân biệt được, còn panel chỉ hiện một câu chung chung. Không ai chẩn được gì.

Bản vá ghi kèm thông báo gốc vào mục `error_detail`. Toàn bộ nhóm thông báo này đều là cấu trúc — mã mô-đun, record ID, evidence ID, đều là hash — nên lời hứa `content_recorded: false` vẫn đúng. Ngoại lệ duy nhất là thông báo Core wire schema: nó nhúng báo cáo của bộ kiểm schema và có thể trích một giá trị trường ra, nên phần đuôi bị cắt (`event failed Core wire schema: <lược bỏ>`) thay vì ghi thẳng.

Ba bản vá này được kiểm bằng cách **cắt đúng đoạn mã đã chèn ra khỏi `dist/index.js` rồi chạy nó**, không viết lại logic: 23 test phủ cả hai nhánh của nút, việc nhớ/khôi phục nhãn, trạng thái bận, lỗi TT im lặng, và việc lược bỏ nội dung nhạy cảm.

## Cấu trúc repo

```
dist/index.js        bundle đã Việt hóa (thứ SillyTavern thực sự nạp)
dist/index.js.map    sourcemap của bản gốc, kèm toàn bộ source TypeScript
l10n/                các prompt bản tiếng Việt
tools/localize.mjs   công cụ áp bản dịch + bản vá vào bundle
tools/patches.mjs    các bản vá hành vi (thẻ nội dung, dò thẻ, cuộn chip, thử lại khi kẹt)
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
