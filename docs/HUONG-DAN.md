# Trip Booking — Hướng dẫn chạy, dùng thử và deploy

## 1. Chạy

```powershell
npm install
npm start      # http://localhost:4200
npm test       # unit test
```

## 2. Dùng thử từng bước

1. **Tour**: chọn một tour, chọn ngày khởi hành (sớm nhất là 3 ngày sau hôm nay), chỉnh số người lớn/trẻ em bằng nút − / +. Tổng tối đa 10 người. Bảng giá bên phải cập nhật ngay.
2. **Travellers**: mỗi người có một khung nhập họ tên và ngày sinh. Người lớn phải đủ 18 tuổi, trẻ em 2–17 tuổi *tính đến ngày khởi hành*. Thêm email và số điện thoại Việt Nam (ví dụ `0912 345 678`).
3. **Extras**: chọn hạng phòng (Deluxe/Suite tính thêm theo số phòng × số đêm), tick dịch vụ thêm, ghi yêu cầu đặc biệt.
4. **Review**: kiểm tra lại, bấm **Edit** để quay lại sửa. Nhập mã giảm giá `WELCOME10` (giảm 10%) hoặc `SAVE200K`, rồi bấm ra ngoài ô để kiểm tra. Tick đồng ý điều khoản → **Confirm booking**.

Các tình huống nên thử:

- Bấm **Continue** khi chưa nhập gì → lỗi hiện dưới từng ô, con trỏ nhảy vào ô lỗi đầu tiên.
- Nhập đến bước 3 rồi tải lại trang (F5) → hiện thông báo "We restored your unfinished booking", dữ liệu còn nguyên.
- Đang nhập dở mà bấm **How it works** trên thanh trên → hộp thoại hỏi có muốn rời trang không (CanDeactivate guard). Bấm Cancel để ở lại, OK để đi — bản nháp vẫn được giữ.
- Đổi số người lớn từ 2 lên 3 ở bước 1 → bước 2 có thêm một khung, tên đã nhập vẫn giữ.
- Dùng email `test@fail.test` → đặt tour bị lỗi, hiện thông báo đỏ, có thể thử lại.

## 3. Đưa lên GitHub và deploy

Giống các dự án trước: tạo repo `trip-booking`, push; tạo project Firebase `trip-booking`, rồi:

```powershell
npx firebase-tools use --add
npm run build
npx firebase-tools deploy --only hosting
```

## 4. Kiến thức chính và nơi đọc

| Chủ đề | File |
| --- | --- |
| Một form lớn nhiều nhóm, có kiểu đầy đủ | `booking/booking-form.ts` |
| FormArray động + giữ dữ liệu cũ | `syncTravellers()` trong `booking/booking.component.ts` |
| Validator tự viết (factory, theo nhóm, bất đồng bộ) | `core/validators.ts` |
| ControlValueAccessor | `shared/quantity-input.component.ts` |
| Biến sự kiện form thành signal, tính giá bằng computed | `value` và `price` trong `booking.component.ts` |
| Hàm thuần dễ test | `core/pricing.ts`, `core/dates.ts` |
| Tự lưu nháp với debounceTime | constructor của `booking.component.ts`, `core/draft.service.ts` |
| CanDeactivate guard | `core/unsaved-changes.guard.ts` |
| Test validator bất đồng bộ bằng fakeAsync | `core/validators.spec.ts` |
| Test ControlValueAccessor với host component | `shared/quantity-input.component.spec.ts` |
