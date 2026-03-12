import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo/logo.jpg';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer dark-footer">
            <div className="footer-container">
                <div className="footer-section about">
                    <Link to="/" className="footer-logo light">
                        <img src={logo} alt="Bookstore Logo" className="footer-logo-img" />
                        Bookstore
                    </Link>
                    <p>Hành trình khám phá tri thức của bạn bắt đầu từ đây. Chúng tôi cung cấp những đầu sách chất lượng nhất với trải nghiệm mua sắm tuyệt vời.</p>
                    <div className="footer-contact-info">
                        <p>📍 123 Đường Sách, TP. Hồ Chí Minh</p>
                        <p>
                            <a href="tel:+84123456789" className="footer-contact-link">📞 +84 123 456 789</a>
                        </p>
                        <p>
                            <a href="mailto:support@bookstore.vn" className="footer-contact-link">✉️ support@bookstore.vn</a>
                        </p>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Công ty</h3>
                    <ul className="footer-links light">
                        <li><Link to="/about">Về chúng tôi</Link></li>
                        <li><Link to="/contact">Liên hệ</Link></li>
                        <li><Link to="/careers">Tuyển dụng</Link></li>
                        <li><Link to="/blog">Blog</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Dịch vụ</h3>
                    <ul className="footer-links light">
                        <li><Link to="/shop">Cửa hàng</Link></li>
                        <li><Link to="/orders">Đơn hàng</Link></li>
                        <li><Link to="/cart">Giỏ hàng</Link></li>
                        <li><Link to="/wishlist">Yêu thích</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Chính sách</h3>
                    <ul className="footer-links light">
                        <li><Link to="/policy">Đổi trả & Hoàn tiền</Link></li>
                        <li><Link to="/privacy">Bảo mật thông tin</Link></li>
                        <li><Link to="/terms">Điều khoản dịch vụ</Link></li>
                        <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom-bar">
                <div className="footer-bottom-container">
                    <p>&copy; 2026 Bookstore Premium. All rights reserved.</p>
                    <div className="social-links-new">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">Twitter</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
