HƯỚNG DẪN CÀI ĐẶT VÀ CẤU HÌNH BÀI XÂY DỰNG ỨNG DỤNG Bitrix24 CRM Automation Suite

Yêu cầu hệ thống :
- Nodejs, git, npm, redis,composer và php 8.2 trở lên (ở bài này dùng xampp)
- Tài khoản Bitrix24 với quyền quản trị viên
- Ngrok hoặc máy chủ có thể truy cập công khai

Các Chức năng chính:
- thêm, sửa, xóa Lead.
- tự động tạo task khi thêm lead mới
- tự đọng tạo deal khi trạng thái chuyển về CONVERTED
- tìm kiếm thoa tên, email,.., lọc theo trạng thái và nguồn,ngày tạo
- xem các biểu đồ doanh thu, lượng deal và lead , tiwr lệ chuyển từ lead sang deal.
- giao diện sang /tối của biểu đò.


Bước 1 : Tải và cài đặt Ngrok
- Truy cập https://ngrok.com/download và tải phiên bản phù hợp với hệ điều hành của bạn (Windows, macOS, Linux).
- Giải nén file tải về và khởi động file ngrok trong đó chuyển hướng đến cmd (với windows);
- Chạy lệnh 'ngrok config add-authtoken $YOUR_AUTHTOKEN' với $YOUR_AUTHTOKEN lấy từ trang https://dashboard.ngrok.com khi người dùng đăng nhập
- Chạy lệnh 'ngrok http 3000' để ngrok lắng nghe trên cổng 3000 và lưu ý là cổng backend cũng phải chạy trên cổng 3000
- Mỗi lần chạy ngrok thì ngrok sẽ cung cấp 1 URL khác nhau 'https://vidu.ngrok.io' -> thay thế bằng dẫn thực của ngrok cung cấp -> Lưu lại

Bước 2 :  Đăng nhập Bitrix24
- Đăng nhập vào bitrix24 với quyền quản trị viên
- Tạo một ứng dụng cục bộ -> Nhập đường dẫn xử lí 'https://vidu.ngrok.io/callback' -> Nhập đường dẫn ban đầu 'https://vidu.ngrok.io' ->
  Nhập quyền truy cập: CRM, appform, Contact center, Lists, Users, Tasks, Users (basic)
  , Notifications, Tasks, E-mail services, Tasks (extended permissions), Message import
  , Chat and Notifications, Mobile tasks -> Khởi tạo ứng dụng
- Sau khi khởi tạo bitrix sẽ cung cấp cilent_id và cilent_secret -> Lưu lại
- khởi tạo thêm 1 webhook đi nhận biết sự kiện :Lead created (ONCRMLEADADD) Lead updated (ONCRMLEADUPDATE), lưu lại

Bước 3 : thiết lập backend và frontend
- Chạy các lệnh "git clone https://github.com/PhanDucTrung/Bitrix24_CRM_AutomationSuite.git" 
- sửa file .env của backend trong  "Bitrix24_CRM_AutomationSuite\backend" với :
+ NGROK_AUTH_TOKEN= $YOUR_AUTHTOKEN mà ngrok cung cấp
+ CLIENT_ID : client_id mà bitrix cung cấp khi khởi tạo ứng dụng
+ CILENT_SECRET : cilent_secret mà bitrix cung cấp khi khởi tạo ứng dụng
+ REDIRECT_URI : không cần nhập vì sau khi chạy back end sẽ tự ghi đè,
+ BITRIX_DOMAIN : Đường dẫn bitrix của bạn 'yourname.bitrix24.vn'
+ REDIS_PORT=6379 sửa nếu đặt port khác khi cài resdis
- và php.int trong C:\xampp\php\php.ini xóa ; của dòng ";extension=zip" ->"extension=zip"

Bước 4 : quay lại cmd ở bước 3 nhập: "cd Bitrix24_CRM_AutomationSuite\backend " -> npm install -g @nestjs/cli -> npm install -> npm run start:dev.

tạo thêm 1 cmd nữa nhập : "cd Bitrix24_CRM_AutomationSuite\frontend"  -> composer install-> npm install -> npm run build -> php artisan serve.
- cdm sẽ hiện thị localhost mới vd: "https://localmoi.ngrok.io"
- quay lại ứng dụng cục bộ ở bước 2 -> Sửa đường dẫn xử lí 'https://localmoi.ngrok.io/callback' -> sửa đường dẫn ban đầu 'https://localmoi.ngrok.io' -> lưu.
- quay lại webhook ở bước 2 -> sửa đường dẫn sử lý thành đường dẫn webhook backend cung cấp  -> lưu.
  

Bước 5 : Truy cập http://localhost:3000/install để cài đặt ứng dụng 

Bước 6 : Truy cập http://127.0.0.1:8000/leads (đổi port nếu cài đặt laravel theo port khác) để xem danh sách ác leads.

Bước 9 : thực hiện thêm, sửa, xóa, xem biểu đồ, đổi theme của biểu đồ trên ứng dụng.

một số hình ảnh đemo
:<img width="1132" height="639" alt="image" src="https://github.com/user-attachments/assets/0bcdc710-e796-4ae9-a924-ead2aae3fcaa" />
<img width="1102" height="620" alt="image" src="https://github.com/user-attachments/assets/1945c3da-dffc-4126-9f48-d3f4e42cc63a" />
<img width="401" height="203" alt="image" src="https://github.com/user-attachments/assets/458be567-a259-4a3e-b6ab-0fb053dfbaf3" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a1293e1f-829f-4fdd-9d7b-2f257bf23efd" />
<img width="1917" height="968" alt="image" src="https://github.com/user-attachments/assets/33965a88-b2a5-4881-9c54-d700e8c79386" />
<img width="576" height="234" alt="image" src="https://github.com/user-attachments/assets/3c317272-87b3-4fcc-9d96-91994c5cd7f7" />
<img width="1901" height="956" alt="image" src="https://github.com/user-attachments/assets/b140edcc-be73-4672-8efc-3aedf36b2ba6" />
<img width="1906" height="988" alt="image" src="https://github.com/user-attachments/assets/54df35eb-33f0-4335-aad6-3091baaa571c" />
<img width="578" height="234" alt="image" src="https://github.com/user-attachments/assets/8e15cdb4-a9a1-401c-9305-cdc42dc5c70b" />
<img width="1891" height="936" alt="image" src="https://github.com/user-attachments/assets/82457e3f-cbda-4840-aa34-959a400fbc59" />
<img width="1865" height="940" alt="image" src="https://github.com/user-attachments/assets/4dca00f4-8241-422d-a4f1-7a2570d1af53" />
<img width="1916" height="944" alt="image" src="https://github.com/user-attachments/assets/5e1e102d-7f47-41e0-afb0-ef8af3ac29f6" />
<img width="276" height="114" alt="image" src="https://github.com/user-attachments/assets/9d6dde13-25ba-4121-813e-ed7846a57a9a" />

















                                      
