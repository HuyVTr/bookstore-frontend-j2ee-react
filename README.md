# 📖 Online Bookstore - Frontend (React JS)

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.7-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Premium%20Design-1572B6?style=for-the-badge&logo=css3&logoColor=white)

Giao diện người dùng hiện đại, hiệu năng cao cho hệ thống Website Bán Sách, được thiết kế theo phong cách **Premium Dark Theme** với trải nghiệm mượt mà và tối ưu hóa trải nghiệm người dùng trên mọi thiết bị.

## 🌟 Điểm Nổi Bật Về Giao Diện & UX

- **Premium Aesthetics:** Sử dụng tông màu Xanh Navy & Indigo chủ đạo, kết hợp hiệu ứng **Glassmorphism** và **Frosted Glass** mang lại cảm giác sang trọng.
- **Edge-to-Edge Slider:** Hệ thống hiển thị sách nổi bật với hiệu ứng Infinite Loop và kéo thả (Drag-to-scroll) mượt mà như ứng dụng di động bản địa.
- **Parallax Effects:** Banner khuyến mãi với hiệu ứng cuộn Parallax đạt chuẩn 60fps giúp trang web sinh động hơn.
- **Micro-interactions:** Hiệu ứng hover, transition được tối ưu hóa GPU (sử dụng transform, opacity) thay vì transition "all" để đảm bảo hiệu năng tối đa.

## 📱 Tối Ưu Hóa Responsive (Đa Nền Tảng)

Dự án được đầu tư kỹ lưỡng về mặt hiển thị trên mọi loại thiết bị, đảm bảo trải nghiệm đồng nhất:
- **💻 Web PC (Desktop):** Layout rộng rãi, tận dụng tối đa không gian màn hình lớn với các Grid hệ thống 4-5 cột, menu điều hướng đầy đủ.
- **📸 iPad & Máy tính bảng (Tablet):** 
  - Tối ưu hóa đặc biệt cho **iPad Landscape** (chế độ ngang) với layout Card 2 cột thông minh.
  - Các nút bấm và vùng tương tác được mở rộng để phù hợp với thao tác chạm (touch).
- **📱 Web Mobile:** 
  - Giao diện chuyển đổi sang dạng khối (Block system), tối ưu thanh menu trượt, giỏ hàng dạng danh sách dọc.
  - Sử dụng `touch-action: manipulation` để loại bỏ độ trễ 300ms khi chạm.

## 🛠️ Công Nghệ Sử Dụng

- **Core:** React 19 + Vite.
- **Routing:** React Router Dom v7.
- **API Client:** Axios (tích hợp Interceptor xử lý JWT tự động).
- **Styling:** Vanilla CSS (Custom Design System) - Đảm bảo tính linh hoạt tối đa và không làm nặng bundle size.
- **Performance:** Áp dụng Lazy Loading cho toàn bộ hình ảnh và code splitting cho các routes.

## ✨ Hệ Thống Phân Quyền & Tính Năng

### 1. Khách hàng (User Role)
- **Khám phá:** Tìm kiếm thông minh (Debouncing), xem nhanh sách (Quick View), Wishlist yêu thích.
- **Mua sắm:** Giỏ hàng thông minh, chọn thanh toán từng sản phẩm (Partial Checkout).
- **Hồ sơ:** Quản lý thông tin cá nhân, thay đổi Avatar (Upload trực tiếp), theo dõi hành trình đơn hàng (Order Progress Bar).

### 2. Tác giả tự do (Author Role)
- **Quản lý tác phẩm:** Đăng tải và quản lý danh sách sách do chính mình sáng tác (`bookSource = AUTHOR`).
- **Thống kê cá nhân:** Theo dõi số lượng sách đã đăng và hiệu quả tiếp cận của các tác phẩm cá nhân.

### 3. Nhân viên vận hành (Staff Role)
- **Dashboard:** Thống kê nhanh đơn hàng, doanh thu và tồn kho.
- **Kho hàng:** Quản lý kho sách chuyên nghiệp với hệ thống lọc đa tầng, cập nhật nhanh số lượng.
- **Đơn hàng:** Xử lý và cập nhật trạng thái đơn hàng từ xác nhận đến vận chuyển.

### 4. Quản trị viên (Admin Role)
- **Master Dashboard:** Tổng quan toàn bộ hoạt động của hệ thống.
- **Quản lý người dùng:** Khóa/Mở khóa tài khoản, phân quyền thành viên (Admin/Staff/Author).
- **Hệ thống cấu hình:** Tùy chỉnh tham số hệ thống và xuất báo cáo (Excel/PDF) chuyên sâu.

## 🚀 Hướng Dẫn Cài Đặt

1. Clone repo và chạy `npm install`.
2. Chạy dự án: `npm run dev`.
3. Kết nối Backend tại port: `5173` (Cấu hình tại `src/services/api.js`).
