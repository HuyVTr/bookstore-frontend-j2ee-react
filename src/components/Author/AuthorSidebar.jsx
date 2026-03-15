import React from 'react';
import { NavLink } from 'react-router-dom';
import './AuthorSidebar.css';

const Icons = {
    Dashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
    ),
    MyBooks: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
    ),
    Revenue: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
    ),
    Profile: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    ),
    Back: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
    )
};

const AuthorSidebar = ({ isMobileOpen, onClose, className = '' }) => {
    return (
        <aside className={`author-sidebar ${isMobileOpen ? 'mobile-open' : ''} ${className}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="author-logo-dot"></span>
                    AUTHOR CONSOLE
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">TỔNG QUAN</div>
                <NavLink to="/author/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <Icons.Dashboard />
                    <span>Dashboard</span>
                </NavLink>

                <div className="nav-section">TÁC PHẨM</div>
                <NavLink to="/author/my-books" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <Icons.MyBooks />
                    <span>Sách của tôi</span>
                    <span className="badge-author-new">LIVE</span>
                </NavLink>

                <div className="nav-section">CÁ NHÂN</div>
                <NavLink to="/author/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <Icons.Profile />
                    <span>Hồ sơ tác giả</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/" className="nav-item author-back-home" aria-label="Đăng xuất">
                    <Icons.Back />
                    <span>Thoát Console</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default AuthorSidebar;
