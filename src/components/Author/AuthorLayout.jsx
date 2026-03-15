import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import AuthorSidebar from './AuthorSidebar';
import '../Staff/StaffLayout.css'; // Reuse core layout styles
import './AuthorLayout.css'; // Author specific overrides

const AuthorLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchUserData = async () => {
        try {
            const response = await api.get('profile');
            setUser(response.data);
        } catch (error) {
            console.error("Lỗi khi tải thông tin author layout:", error);
        }
    };

    useEffect(() => {
        fetchUserData();
        window.addEventListener('profileUpdated', fetchUserData);
        return () => window.removeEventListener('profileUpdated', fetchUserData);
    }, [location.pathname]);

    const username = user?.fullName || user?.username || localStorage.getItem('username') || 'Author';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const getPageTitle = (path) => {
        if (path.includes('dashboard')) return 'Trung tâm Tác giả';
        if (path.includes('my-books')) return 'Tác phẩm cá nhân';
        if (path.includes('profile')) return 'Hồ sơ Tác giả';
        if (path.includes('settings')) return 'Cài đặt Bảo mật';
        return 'Author Console';
    };

    return (
        <div className="staff-dashboard-shell author-console-shell">
            <AuthorSidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {isSidebarOpen && <div className="mobile-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 950, backdropFilter: 'blur(4px)'
            }}></div>}
            
            <div className="staff-main-content">
                <header className="staff-top-nav author-top-nav">
                    <div className="top-nav-left">
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                            </button>
                            <div>
                                <div className="breadcrumbs">AUTHOR / {location.pathname.split('/').pop().toUpperCase()}</div>
                                <h2 className="page-title">{getPageTitle(location.pathname)}</h2>
                            </div>
                        </div>
                    </div>

                    <div className="top-nav-right">
                        <div className="user-profile-nav" ref={dropdownRef}>
                            <div className="user-profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                                <div className="user-info">
                                    <span className="user-name">{username}</span>
                                    <span className="user-role badge-author">Author</span>
                                </div>
                                <div className="user-avatar-premium author-avatar-accent">
                                    {user?.avatarPath ? (
                                        <img src={user.avatarPath} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                                    ) : (
                                        username.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </div>

                            <div className={`profile-dropdown-menu ${isProfileOpen ? 'open' : ''}`}>
                                <div className="dropdown-header">
                                    <p className="dropdown-name">{username}</p>
                                    <p className="dropdown-email">{user?.email}</p>
                                </div>
                                <div className="dropdown-body">
                                    <Link to="/author/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        Hồ sơ cá nhân
                                    </Link>
                                    <Link to="/" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                        Trang chủ Website
                                    </Link>
                                </div>
                                <div className="dropdown-footer">
                                    <button className="dropdown-item logout-variant" onClick={handleLogout}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="staff-page-container">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AuthorLayout;
