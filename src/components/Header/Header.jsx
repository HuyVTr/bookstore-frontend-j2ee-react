import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo/logo.jpg';
import './Header.css';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Kiểm tra login (tạm thời lấy từ localStorage)
        const token = localStorage.getItem('token');
        const rolesString = localStorage.getItem('roles');
        if (token) {
            setIsLoggedIn(true);
            try {
                const roles = JSON.parse(rolesString);
                setUserRole(roles); // Lưu cả mảng roles
            } catch (e) {
                setUserRole([]);
            }
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('roles');
        setIsLoggedIn(false);
        setUserRole(null);
        navigate('/');
    };

    return (
        <header className={`header ${isScrolled ? 'scrolled glass' : ''}`}>
            <div className="header-container">
                <Link to="/" className="logo">
                    <img src={logo} alt="Bookstore Logo" className="header-logo-img" />
                    <span className="logo-text">Bookstore</span>
                </Link>

                <nav className="nav-menu">
                    <Link to="/" className="nav-link">Trang chủ</Link>
                    <Link to="/shop" className="nav-link">Cửa hàng</Link>

                    {Array.isArray(userRole) && userRole.includes('STAFF') && (
                        <Link to="/staff/books" className="nav-link admin-link">Quản lý Sách</Link>
                    )}

                    {Array.isArray(userRole) && userRole.includes('ADMIN') && (
                        <>
                            <Link to="/admin/users" className="nav-link admin-link">Người dùng</Link>
                            <Link to="/admin/reports" className="nav-link admin-link">Báo cáo</Link>
                        </>
                    )}
                </nav>

                <div className="header-actions">
                    <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
                        <input 
                            type="text" 
                            name="search"
                            placeholder="Tìm kiếm sách…" 
                            autoComplete="off"
                            aria-label="Tìm kiếm sách"
                        />
                        <button type="submit" className="search-btn" aria-label="Gửi tìm kiếm">🔍</button>
                    </form>

                    <Link to="/cart" className="action-btn cart-btn" aria-label="Giỏ hàng">
                        🛒 {0 > 0 && <span className="cart-badge">0</span>}
                    </Link>

                    {isLoggedIn ? (
                        <div className="user-dropdown">
                            <div className="avatar" aria-label="Tài khoản người dùng">👤</div>
                            <div className="dropdown-content glass">
                                <Link to="/profile">Hồ sơ</Link>
                                <Link to="/orders">Đơn hàng</Link>
                                <button onClick={handleLogout}>Đăng xuất</button>
                            </div>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="login-btn">Đăng nhập</Link>
                            <Link to="/register" className="register-btn hover-lift">Đăng ký</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
