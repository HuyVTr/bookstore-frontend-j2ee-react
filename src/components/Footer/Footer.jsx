import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section about">
                    <Link to="/" className="footer-logo">📚 Bookstore</Link>
                    <p>Hành trình khám phá tri thức của bạn bắt đầu từ đây. Chúng tôi cung cấp những đầu sách chất lượng nhất với trải nghiệm mua sắm tuyệt vời.</p>
                    <div className="social-links">
                        <a href="#">FB</a>
                        <a href="#">IG</a>
                        <a href="#">TW</a>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Liên kết nhanh</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Trang chủ</Link></li>
                        <li><Link to="/shop">Cửa hàng</Link></li>
                        <li><Link to="/about">Về chúng tôi</Link></li>
                        <li><Link to="/contact">Liên hệ</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Hỗ trợ</h3>
                    <ul className="footer-links">
                        <li><Link to="/policy">Chính sách đổi trả</Link></li>
                        <li><Link to="/privacy">Bảo mật thông tin</Link></li>
                        <li><Link to="/terms">Điều khoản sử dụng</Link></li>
                    </ul>
                </div>

                <div className="footer-section newsletter">
                    <h3>Đăng ký bản tin</h3>
                    <p>Nhận thông báo về sách mới và các chương trình khuyến mãi.</p>
                    <div className="newsletter-form">
                        <input type="email" placeholder="Email của bạn" />
                        <button className="hover-lift">Gửi</button>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2026 Bookstore Project. Bảo lưu mọi quyền.</p>
            </div>
        </footer>
    );
};

export default Footer;
