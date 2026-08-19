# NarraMem Hướng dẫn cài đặt bản thử nghiệm

Phiên bản: `0.4.0-beta.74-VN`

SillyTavern tối thiểu: `1.18.0`

Đây là extension frontend tiêu chuẩn có thể cài đặt trực tiếp qua trình quản lý extension của SillyTavern. Không cần sao chép Server Plugin, không cần sửa `config.yaml`, cũng không cần gửi API Key cho người phát triển NarraMem.

## Cài đặt từ quán rượu (SillyTavern)

1. Trước tiên hãy xác nhận SillyTavern đã được nâng cấp lên `1.18.0` hoặc cao hơn, và khuyến nghị sao lưu thư mục `data` của người dùng hiện tại.
2. Mở "Extensions" → "Install Extension".
3. Chỉ cần điền Git URL: `https://github.com/SolNg/NarraMem` (cho bản tiếng Việt).
4. Để trống Branch or tag name.
5. Nhấp "Install just for me". Sau khi cài đặt thành công, hãy refresh trang quán rượu.
6. Nhấp nút "Hồi Ức" phía trên hộp nhập chat, hoặc mở "NarraMem Hồi Ức (Nội thí nghiệm 0.4.0-beta.74-VN)" trong cài đặt extension. Trung tâm ký ức chia thành 5 trang: Tổng quan, Ký Ức, Nhiệm vụ hiện tại, Cài đặt, Nhật ký và Dữ liệu; trên điện thoại hiển thị dưới dạng panel dưới cùng. Chọn một cấu hình API độc lập: Custom điền URL và Key theo thói quen Chat Completion tùy chỉnh của quán rượu; DeepSeek sử dụng adapter DeepSeek gốc của quán rượu 1.18, chỉ cần điền Key.
7. Lần đầu sử dụng chỉ cần điền địa chỉ và Key, rồi nhấn "Kết nối và đọc mô hình": Extension sẽ lần lượt lưu cấu hình hiện tại, lưu Key độc lập, kiểm tra trạng thái Key và đọc danh sách mô hình; khi đã có Key đã lưu, có thể bỏ trống ô nhập để sử dụng lại. Sau khi chọn mô hình sẽ tự động lưu; khi giao diện chỉ trả về một mô hình sẽ tự động chọn và lưu. Toàn bộ quá trình kết nối không tiêu tốn lệnh gọi tạo sinh.
8. Theo mặc định sẽ tự động khớp với NarraMem Prompt đã xác minh theo tên mô hình. Khi không nhận diện được, trang sẽ hiển thị rõ ràng và chỉ cho phép chọn thủ công Prompt tương thích trong "Tham số bổ sung và Cài đặt nâng cao".

Để cập nhật sau này, sử dụng chức năng "Update" của trình quản lý extension quán rượu; luôn theo dõi nhánh `main` mặc định của repository riêng, không cần điền nhánh.

## Cài đặt từ TauriTavern (TT)

1. Mở cổng cài đặt extension bên thứ ba của TT, Git URL cũng chỉ cần điền `https://github.com/SolNg/NarraMem` (cho bản tiếng Việt), để trống Branch/Tag.
2. Sau khi cài đặt, refresh hoặc khởi động lại TT, vào chat nhân vật; khi thấy nút "Hồi Ức" trong vùng nhập, thực hiện theo các bước cấu hình API Bộ nhớ độc lập ở trên.
3. Beta.72 sẽ tự động phát hiện host TT, và đọc toàn bộ chat qua API phân trang lịch sử chính thức của TT; khi phân trang hoặc danh tính chat không nhất quán tạm thời sẽ đọc lại cục bộ giới hạn, nếu vẫn chưa đồng bộ sẽ hiển thị "Chờ đồng bộ TT", người dùng có thể nhấn "Làm mới trạng thái" trong Trung tâm ký ức để đọc lại. Khi nội dung hiện tại trong lịch sử TT không khớp với swipe đã chọn, chỉ lấy nội dung trước đó làm chuẩn trong bản sao cache read-only của NarraMem, không sửa chat của người dùng hoặc swipe khác. Trước khi thiết lập Checkpoint đầu tiên sẽ không làm nóng hoặc chèn Recall. Nó không còn yêu cầu người dùng chuyển "Tải toàn bộ", cũng không sử dụng cache cũ hay đoạn cửa sổ hiện tại để trích xuất, phán đoán nguồn Recall hay ẩn.

NarraMem là extension frontend thuần túy, không cần và không chứa plugin backend chỉ dành cho Node của SillyTavern. TT và quán rượu tiêu chuẩn tiếp tục dùng chung gói extension, Memory Core, định dạng worldbook, Prompt và nhánh cập nhật; sẽ không tạo ra bộ dữ liệu phiên bản TT riêng.

Khi nhiệm vụ thất bại, trang sẽ hiển thị giai đoạn, loại lỗi, mã lỗi và thời gian thất bại, đồng thời xuất hiện "Trích xuất lại". Mỗi lần nhấp thủ công sẽ bắt đầu một vòng có giới hạn mới; số lần gọi tự động trong vòng do "Số lần tự động thử lại" quyết định, không gọi vô hạn.

"Xuất nhật ký chẩn đoán" không chứa API Key hay nội dung Prompt; "Xuất dữ liệu cốt lõi" có thể chứa lịch sử chat, trải nghiệm nhân vật, trạng thái thế giới và các nội dung riêng tư khác, hãy tự kiểm tra trước khi gửi cho người phát triển.

## API độc lập và Key

- Hiện tại hỗ trợ OpenAI-compatible `/v1/models` và `/v1/chat/completions` sử dụng Bearer Key, giao diện cần hỗ trợ Structured Outputs/JSON Schema.
- Địa chỉ API có thể điền địa chỉ gốc của dịch vụ, `/v1`, hoặc `/v1/chat/completions` đầy đủ; Extension sẽ chuẩn hóa thành cùng một địa chỉ gốc của dịch vụ.
- Đây là endpoint, Key và model riêng của NarraMem, không đọc hoặc theo API chat, mô hình và preset hiện tại của quán rượu; thẻ nhân vật, Persona, worldbook và lịch sử chat chỉ được dùng làm dữ liệu đầu vào cho ký ức.
- Key được lưu dưới dạng mục "NarraMem Memory API" có ID độc lập trong `secrets.json` của thư mục người dùng SillyTavern hiện tại. Sau khi lưu, Extension sẽ khôi phục Custom API Key mà người dùng đã bật trước đó; sau này chỉ sử dụng theo ID riêng của NarraMem.
- Giá trị gốc của Key không được ghi vào cài đặt extension, worldbook, nhật ký hay xuất, cũng không được đọc lại về frontend từ giao diện secrets. Trang cài đặt có thể thay thế hoặc xóa mục Key riêng của NarraMem.
- "Kết nối và đọc mô hình" sẽ lưu Key mới một cách an toàn trước, rồi mới truy cập `/models`; khi đã có Key có thể bỏ trống để sử dụng lại, không kích hoạt tạo sinh mô hình.
- Nếu kết nối thất bại, trang sẽ phân biệt "Chưa lưu Key", "Lưu Key cục bộ thất bại", "Key bị từ chối bởi giao diện (401/403)" và lỗi giao diện thông thường; thay thế/xóa Key riêng biệt nằm trong vùng quản lý thu gọn, không phải bước bắt buộc trong cấu hình lần đầu.

## Giới hạn gọi

- Nhiệm vụ ký ức không gọi `generateRaw()` của frontend quán rượu. Extension gửi messages và Schema đã tự lắp ráp trực tiếp qua custom chat-completions cục bộ của quán rượu; không điền `custom_prompt_post_processing`, nên không nối thêm preset hay dữ liệu nhân vật hiện tại.
- Số yêu cầu đồng thời và số lần thử lại mặc định đều là `1`. Số lần thử lại `1` nghĩa là thử lại một lần sau lần thất bại đầu tiên; bản thân truyền tải phía client không thử lại thêm.
- Số yêu cầu đồng thời và thử lại khi thất bại đều có thể cài đặt, giá trị mặc định đều là `1`. Trình duyệt hiện đại sử dụng Web Locks cùng nguồn gốc để giới hạn nhiều tab quán rượu; khi thiếu Web Locks sẽ đảm bảo ít nhất hàng đợi trong trang hiện tại có giới hạn.
- Không đặt giới hạn tổng số lần gọi phiên, cũng không đặt thêm giới hạn số lần gọi mỗi phút hay khoảng thời gian tối thiểu giữa các yêu cầu.
- NarraMem không gửi tham số max context hay max reply, sử dụng giá trị mặc định của mô hình/server.
- Nhiệm vụ ký ức tận dụng cửa sổ nhàn rỗi nền để chạy; trò chuyện hỏi đáp thông thường không chờ Memory API hoàn thành.
- Chat mới lần đầu tích lũy đến 14 tầng AI hợp lệ mới khởi động ký ức: xử lý 10 tầng sớm nhất và luôn giữ 4 tầng mới nhất để kết nối; sau đó cứ mỗi thêm 10 tầng AI hợp lệ tạo thành lô tiếp theo. Mỗi lô xử lý lần lượt 7 mô-đun nhỏ: nhân vật/thực thể, cảnh/phần, trải nghiệm/sự kiện, thay đổi trạng thái, nhận thức/bí mật, chuỗi nhân quả, manh mối và ảnh hưởng dài hạn.
- Khi nhiệm vụ đang chạy, trang chat sẽ hiển thị gợi ý tiến độ có thể đóng bằng nhấp chuột; đóng chỉ ảnh hưởng đến hiển thị, không hủy nhiệm vụ nền.

Thứ tự thực tế của 6 đoạn tin nhắn trong mỗi mô-đun nhỏ cố định:

1. `system`: Đầu mục danh tính có thể sửa + nội dung nhiệm vụ riêng cho mô hình NarraMem hiện có.
2. `assistant`: Xác nhận danh tính có thể sửa.
3. `system`: Nội dung nhiệm vụ riêng cho mô-đun nhỏ hiện tại.
4. `system`: Dữ liệu có cấu trúc gồm thẻ nhân vật, Persona, worldbook, đoạn chat mục tiêu và các mô-đun đã hoàn thành trước đó.
5. `assistant`: Xác nhận "Đã nhận tài liệu" có thể sửa; sau khi tắt điền sẵn, cùng nội dung đó chuyển thành `system`.
6. `user`: Quy tắc xuất có cấu trúc cố định của mô-đun nhỏ hiện tại.

6 đoạn tin nhắn và Schema phản hồi do NarraMem tự bảo trì; không gửi tuyên bố từ chối trách nhiệm đã xóa.

## Không gian ký ức tự động và Ẩn tầng

- Khi mở hoặc chuyển chat, sẽ tự động chọn Memory Set duy nhất theo ID lịch sử chat của quán rượu, và tự động đọc danh tính thẻ nhân vật hiện tại; trang cài đặt không có quy trình liên kết thủ công.
- edit/delete/reroll sẽ kích hoạt xử lý lại đáng tin cậy. Chỉ sau khi trích xuất và vòng đời tường thuật được lưu trữ thành công mới ẩn các tầng cũ đã hoàn thành xử lý ký ức.
- Khi xóa một bản ghi chat, Extension sẽ xóa chính xác worldbook NarraMem Memory Set tương ứng với chat đó theo Registry; khi không thể xác định duy nhất do chat cùng tên sẽ từ chối xóa, tránh ảnh hưởng đến ký ức nhân vật khác.
- 4 tầng AI mới nhất có mức ưu tiên bảo vệ cao nhất, luôn hiển thị; ngữ cảnh liên tục từ tầng AI mới thứ 4 trở đi cũng không bị các tầng cũ ẩn qua, để giữ lại phần trước cần thiết cho định dạng thống nhất và kết nối nội dung.

## Dữ liệu và Quyền riêng tư

NarraMem sử dụng worldbook của quán rượu để lưu Memory Set, Evidence, sự kiện, trạng thái, nhận thức, nhân quả, NarrativeThread và FutureImpact. Trang cài đặt có thể tải xuống hai loại tệp:

- Nhật ký chẩn đoán: Không chứa nội dung ký ức cốt lõi, dùng để báo cáo trạng thái chạy và lỗi.
- Dữ liệu cốt lõi + Nhật ký: Có thể chứa văn bản chat gốc, danh tính nhân vật, trạng thái thế giới, bằng chứng nhân quả và định danh phiên, có hai lần xác nhận quyền riêng tư trước khi tải xuống.

Cả hai loại xuất đều không chứa địa chỉ API, API Key, secret ID, nội dung Prompt hoặc giá trị xác thực khác. Tệp xuất chỉ được lưu tại vị trí người dùng nhấp tải xuống, không được NarraMem tự động tải lên. Dịch vụ cục bộ SillyTavern có thể ghi lại yêu cầu API theo cấp độ nhật ký của nó; trước khi chia sẻ nhật ký quán rượu cũng nên xử lý nội dung riêng tư chat có thể chứa.

## Phản hồi nội thí nghiệm

Khi phản hồi, hãy cung cấp số phiên bản, phiên bản SillyTavern, loại API, các bước tái tạo và tệp "Nhật ký chẩn đoán". Chỉ gửi "Dữ liệu cốt lõi + Nhật ký" khi hiểu rõ rủi ro quyền riêng tư và sẵn sàng cung cấp nội dung cốt truyện. Không dán API Key, `secrets.json`, Cookie hoặc chat đầy đủ trong Issue công khai.

Khuyến nghị vòng đầu chỉ làm chat ngắn: xác nhận trạng thái trang cài đặt, trích xuất nền, Recall, khôi phục sau khi refresh, cũng như xử lý lại sau edit/delete/reroll. Không tự ý bắt đầu chạy dài 1000+.

## Tắt và Gỡ cài đặt

1. Tắt Extension trong trang cài đặt NarraMem; nếu cần xóa Key, nhấp "Xóa Khóa".
2. Tắt hoặc xóa NarraMem trong trình quản lý extension quán rượu.

Gỡ cài đặt Extension sẽ không tự động xóa dữ liệu ký ức NarraMem trong worldbook, để tránh vô tình xóa nội dung người dùng. Khi cần dọn dẹp triệt để, trước tiên hãy xuất và xác nhận Memory Set mục tiêu; bản nội thí nghiệm hiện tại không cung cấp nút xóa toàn bộ chưa được xác minh bởi host thực.

---

**Bản dịch tiếng Việt bởi SolNg - Dựa trên NarraMem 0.4.0-beta.74 của sanmingyue**
