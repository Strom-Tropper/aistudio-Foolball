# Open Code Review

**Lệnh Terminal để review thật bằng OCR:**

```bash
ocr review
```

**Điều kiện:** Cần cấu hình provider/model và API key cho OCR (`ocr config provider`, `ocr config model`).

**Dùng model Cursor:** Không có lệnh Terminal để gọi model Cursor. Trong Cursor chat, yêu cầu: “Dùng Open Code Review Delegation Mode để review các thay đổi hiện tại.” Điều kiện: đã cài plugin Cursor và reload Cursor. Không cần API key riêng cho OCR.

`ocr delegate preview` chỉ xem danh sách file sẽ review; không chạy review.
