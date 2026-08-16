# Hướng dẫn cài NarraMem (bản tiếng Việt)

Phiên bản: `0.4.0-beta.70`

SillyTavern tối thiểu: `1.18.0`

Đây là extension frontend chuẩn, cài thẳng được từ trình quản lý extension của SillyTavern. Không cần copy Server Plugin, không cần sửa `config.yaml`, và không cần gửi API Key cho bất kỳ ai.

## Cài từ SillyTavern

1. Đảm bảo SillyTavern đã lên `1.18.0` trở lên, và nên sao lưu thư mục `data` của người dùng hiện tại trước.
2. Mở "Extensions" → "Install extension".
3. Ô Git URL điền `https://github.com/SolNg/NarraMem`.
4. Ô Branch or tag name để trống.
5. Bấm "Install just for me". Cài xong thì tải lại trang SillyTavern.
6. Bấm nút "NarraMem" phía trên ô nhập chat, hoặc mở "NarraMem" trong phần cài đặt extension. Trung tâm ký ức có 5 trang: Tổng quan, Ký ức, Tác vụ hiện tại, Cài đặt, Nhật ký & Dữ liệu; trên điện thoại nó hiện dưới dạng panel ở đáy màn hình. Chọn một cấu hình API riêng: Custom thì điền URL và Key theo đúng thói quen Custom Chat Completion của SillyTavern; DeepSeek dùng adapter DeepSeek gốc của SillyTavern 1.18, chỉ cần điền Key.
7. Lần đầu chỉ cần điền địa chỉ và Key rồi bấm "Kết nối và tải danh sách model": extension sẽ lần lượt lưu cấu hình hiện tại, lưu Key riêng, kiểm tra trạng thái Key rồi tải danh sách model. Nếu đã lưu Key trước đó thì để trống ô Key là dùng lại được. Chọn model xong sẽ tự lưu; nếu API chỉ trả về đúng một model thì nó tự chọn và tự lưu luôn. Toàn bộ quá trình kết nối không tốn lượt gọi sinh nội dung nào.
8. Mặc định extension tự khớp Prompt NarraMem đã kiểm chứng theo tên model. Nếu không nhận diện được, trang sẽ báo rõ và chỉ cho phép chọn tay Prompt tương thích trong mục "Tham số bổ sung và cài đặt nâng cao".

Cập nhật về sau dùng chức năng "Update" của trình quản lý extension; luôn theo nhánh `main` mặc định của repo, không cần điền branch.

## Cài từ TauriTavern (TT)

1. Mở mục cài extension bên thứ ba của TT, Git URL cũng điền `https://github.com/SolNg/NarraMem`, Branch/Tag để trống.
2. Cài xong thì tải lại hoặc khởi động lại TT, vào một cuộc chat nhân vật; khi thấy nút "NarraMem" ở khu vực nhập liệu thì cấu hình Memory API riêng theo đúng các bước ở trên.
3. beta.70 tự dò được host TT và đọc toàn bộ lịch sử chat qua API phân trang chính thức của TT; không còn bắt người dùng bật "tải toàn bộ", và cũng không lấy đoạn cửa sổ hiện tại để trích xuất hay ẩn lượt khi API của TT không dùng được.

NarraMem là extension thuần frontend, không cần và không chứa plugin backend Node-only của SillyTavern. TT và SillyTavern bản chuẩn dùng chung cùng một gói extension, cùng Memory Core, cùng định dạng world book, cùng Prompt và cùng nhánh cập nhật; sẽ không sinh ra bộ dữ liệu riêng cho TT.

Khi tác vụ thất bại, trang sẽ hiện giai đoạn, loại lỗi, mã lỗi và thời điểm lỗi, kèm nút "Xử lý lại". Mỗi lần bấm tay là mở một vòng chạy mới có giới hạn; số lần gọi tự động trong vòng đó do "Số lần tự thử lại" quyết định, không gọi vô hạn.

"Tải nhật ký chẩn đoán" không chứa API Key hay nội dung Prompt; "Tải dữ liệu lõi" có thể chứa lịch sử chat, trải nghiệm nhân vật, trạng thái thế giới và các thông tin riêng tư khác — hãy tự kiểm tra trước khi gửi cho người khác.

## API riêng và Key

- Hiện hỗ trợ các endpoint OpenAI-compatible dùng Bearer Key với `/v1/models` và `/v1/chat/completions`; API cần hỗ trợ Structured Outputs / JSON Schema.
- Ô địa chỉ API điền được địa chỉ gốc của dịch vụ, `/v1`, hoặc `/v1/chat/completions` đầy đủ; extension sẽ chuẩn hóa về cùng một địa chỉ gốc.
- Đây là endpoint, Key và model của riêng NarraMem; nó không đọc và không đi theo API chat, model hay preset hiện tại của SillyTavern. Thẻ nhân vật, Persona, world book và lịch sử chat chỉ được dùng làm tư liệu đầu vào cho ký ức.
- Key được lưu thành một mục "NarraMem Memory API" có ID riêng trong `secrets.json` của người dùng SillyTavern hiện tại. Sau khi lưu, extension sẽ khôi phục lại Custom API Key mà bạn vốn đang bật; về sau nó chỉ lấy Key theo ID riêng của chính nó.
- Giá trị gốc của Key không bao giờ được ghi vào cài đặt extension, world book, nhật ký hay bản xuất, và cũng không được đọc ngược về frontend từ API secrets. Trang cài đặt cho phép thay hoặc xóa mục Key riêng của NarraMem.
- "Kết nối và tải danh sách model" sẽ lưu an toàn Key mới điền trên trang trước, rồi mới gọi `/models`; nếu đã có Key thì để trống là dùng lại, và thao tác này không kích hoạt sinh nội dung.
- Nếu kết nối thất bại, trang phân biệt rõ "chưa lưu Key", "lưu Key cục bộ thất bại", "Key bị API từ chối (401/403)" và lỗi API chung. Phần thay/xóa Key riêng nằm trong khu vực gập lại, không phải bước bắt buộc khi cấu hình lần đầu.

## Ranh giới gọi API

- Tác vụ ký ức không gọi `generateRaw()` của frontend SillyTavern. Extension đưa thẳng bộ messages và Schema mà nó tự lắp cho tầng truyền custom chat-completions cục bộ của SillyTavern; nó không điền `custom_prompt_post_processing`, nên không ghép thêm preset hay thông tin nhân vật hiện tại.
- Số luồng song song và số lần thử lại đều mặc định là `1`. Số lần thử lại `1` nghĩa là sau lần lỗi đầu sẽ thử thêm một lần; bản thân tầng truyền không tự thử lại thêm.
- Cả số luồng lẫn số lần thử lại đều chỉnh được, mặc định đều là `1`. Trình duyệt hiện đại dùng Web Locks cùng origin để ràng buộc nhiều tab SillyTavern; nếu thiếu Web Locks thì ít nhất vẫn đảm bảo giới hạn hàng đợi trong chính trang hiện tại.
- Không đặt giới hạn tổng số lần gọi trong phiên, cũng không đặt thêm giới hạn số lần gọi mỗi phút hay khoảng cách tối thiểu giữa các yêu cầu.
- NarraMem không gửi tham số context tối đa hay độ dài phản hồi tối đa, mà dùng mặc định của model/máy chủ.
- Tác vụ ký ức chạy tận dụng khoảng nghỉ ở nền; việc hỏi-đáp bình thường không phải chờ Memory API xong.
- Chat mới chỉ bắt đầu ghi nhớ sau khi tích đủ 14 lượt AI hợp lệ: nó xử lý 10 lượt sớm nhất và luôn giữ lại 4 lượt mới nhất để nối mạch; sau đó cứ thêm 10 lượt AI hợp lệ là thành một đợt mới. Mỗi đợt lần lượt chạy 7 mô-đun con: nhân vật/thực thể, cảnh và chương, trải nghiệm và sự kiện, thay đổi trạng thái, nhận thức và bí mật, chuỗi nhân quả, cài cắm và ảnh hưởng dài hạn.
- Khi tác vụ đang chạy, trang chat sẽ hiện thông báo tiến độ bấm để tắt được; tắt chỉ ảnh hưởng phần hiển thị, không hủy tác vụ nền.

Thứ tự messages thực tế của mỗi mô-đun con luôn cố định như sau:

1. `system`: phần header danh tính chỉnh sửa được + nội dung tác vụ chuyên biệt của model NarraMem hiện tại.
2. `assistant`: câu xác nhận danh tính chỉnh sửa được.
3. `system`: nội dung tác vụ chuyên biệt của mô-đun con hiện tại.
4. `system`: tư liệu có cấu trúc gồm thẻ nhân vật, Persona, world book, đoạn chat mục tiêu và các mô-đun tiền đề đã hoàn thành.
5. `assistant`: câu xác nhận "đã nhận tư liệu" chỉnh sửa được; nếu tắt prefill thì cùng nội dung đó chuyển thành `system`.
6. `user`: quy tắc đầu ra có cấu trúc cố định của mô-đun con hiện tại.

Sáu đoạn message này cùng Schema phản hồi do chính NarraMem quản lý; extension không gửi những đoạn miễn trừ trách nhiệm đã bị gỡ bỏ.

## Không gian ký ức tự động và việc ẩn lượt chat

- Khi mở hoặc chuyển chat, extension tự chọn Memory Set duy nhất theo ID lịch sử chat của SillyTavern và tự đọc danh tính thẻ nhân vật hiện tại; trang cài đặt không có bước gán tay.
- Các thao tác edit/delete/reroll sẽ kích hoạt việc xử lý lại có kiểm chứng. Chỉ khi trích xuất và vòng đời tự sự đã lưu thành công thì các lượt cũ đã xử lý xong mới bị ẩn.
- Khi bạn xóa một lịch sử chat, extension sẽ theo Registry để xóa chính xác world book Memory Set của NarraMem tương ứng với chat đó; nếu có chat trùng tên khiến không xác định được duy nhất thì nó từ chối xóa, tránh làm hỏng ký ức của nhân vật khác.
- 4 lượt AI mới nhất có mức bảo vệ cao nhất và luôn hiển thị; đoạn ngữ cảnh liền mạch tính từ lượt AI mới thứ 4 trở đi cũng không bị các lượt cũ ẩn vượt qua, để giữ lại phần văn cảnh cần thiết cho sự thống nhất về định dạng và mạch nội dung.

## Dữ liệu và quyền riêng tư

NarraMem dùng world book của SillyTavern để lưu Memory Set, Evidence, sự kiện, trạng thái, nhận thức, nhân quả, NarrativeThread và FutureImpact. Trang cài đặt cho tải về hai loại file:

- Nhật ký chẩn đoán: không chứa nội dung ký ức lõi, dùng để báo cáo trạng thái vận hành và lỗi.
- Dữ liệu lõi + nhật ký: có thể chứa nguyên văn chat, danh tính nhân vật, trạng thái thế giới, bằng chứng nhân quả và định danh phiên; có hai bước xác nhận riêng tư trước khi tải.

Cả hai loại đều không chứa địa chỉ API, API Key, secret ID, nội dung Prompt hay các giá trị chứng thực khác. File xuất chỉ nằm ở nơi bạn bấm tải về, NarraMem không tự động tải nó lên đâu cả. Bản thân dịch vụ SillyTavern chạy trên máy bạn vẫn có thể ghi log các yêu cầu API tùy theo mức log của nó; trước khi chia sẻ log của SillyTavern cũng nên coi như nó có thể chứa nội dung chat riêng tư.

## Phản hồi bản thử nghiệm

Khi báo lỗi, hãy cung cấp số phiên bản, phiên bản SillyTavern, loại API, các bước tái hiện và file "nhật ký chẩn đoán". Chỉ gửi "dữ liệu lõi + nhật ký" khi bạn đã hiểu rủi ro riêng tư và sẵn sàng chia sẻ nội dung cốt truyện. Đừng dán API Key, `secrets.json`, Cookie hay toàn bộ đoạn chat vào Issue công khai.

Vòng đầu nên thử với chat ngắn: kiểm tra trạng thái trang cài đặt, việc trích xuất ở nền, Recall, khả năng khôi phục sau khi refresh, và việc xử lý lại sau edit/delete/reroll. Đừng tự chạy thẳng một mạch 1000+ lượt.

## Tắt và gỡ cài đặt

1. Tắt extension trong trang cài đặt NarraMem; nếu cần xóa Key thì bấm "Xóa Key".
2. Vô hiệu hóa hoặc xóa NarraMem trong trình quản lý extension của SillyTavern.

Gỡ extension sẽ không tự động xóa dữ liệu ký ức NarraMem trong world book, để tránh xóa nhầm nội dung của bạn. Khi cần dọn sạch hoàn toàn, hãy xuất và xác nhận Memory Set mục tiêu trước; bản thử nghiệm hiện tại không cung cấp nút xóa toàn bộ khi chưa được kiểm chứng trên host thật.
