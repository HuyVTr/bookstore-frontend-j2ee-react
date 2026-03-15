import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import StaffSidebar from './StaffSidebar';
import './StaffLayout.css';

const StaffLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch profile data to sync name and avatar
    const fetchUserData = async () => {
        try {
            const response = await api.get('profile');
            setUser(response.data);
        } catch (error) {
            console.error("Lỗi khi tải thông tin user layout:", error);
        }
    };

    useEffect(() => {
        fetchUserData();

        // Lắng nghe sự kiện cập nhật profile để update lại UI ngay lập tức
        window.addEventListener('profileUpdated', fetchUserData);
        return () => window.removeEventListener('profileUpdated', fetchUserData);
    }, [location.pathname]); // Vẫn re-fetch khi chuyển trang để đảm bảo dữ liệu mới nhất

    const username = user?.fullName || user?.username || localStorage.getItem('username') || 'Staff';
    
    // Extract actual user role
    let userRole = 'Staff Member';
    if (user?.roles) {
        const roles = user.roles.map(r => r.name);
        if (roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')) userRole = 'Administrator';
        else if (roles.includes('ROLE_AUTHOR') || roles.includes('AUTHOR')) userRole = 'Author';
    }

    // Close dropdown on click outside
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

    // Get page title from path
    const getPageTitle = (path) => {
        if (path.includes('dashboard')) return 'Tổng quan hệ thống';
        if (path.includes('manage-books')) return 'Quản lý kho sách';
        if (path.includes('categories')) return 'Danh mục sản phẩm';
        if (path.includes('orders')) return 'Xử lý đơn hàng';
        if (path.includes('profile')) return 'Hồ sơ cá nhân';
        return 'Bảng điều khiển';
    };

    return (
        <div className="staff-dashboard-shell">
            <StaffSidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Overlay for mobile */}
            {isSidebarOpen && <div className="mobile-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 950, backdropFilter: 'blur(4px)'
            }}></div>}
            
            <div className="staff-main-content">
                <header className="staff-top-nav">
                    <div className="top-nav-left">
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                            </button>
                            <div>
                                <div className="breadcrumbs">WORKSPACE / {location.pathname.split('/').pop().toUpperCase()}</div>
                                <h2 className="page-title">{getPageTitle(location.pathname)}</h2>
                            </div>
                        </div>
                    </div>

                    <div className="top-nav-right">
                        <div className="nav-actions">
                            <button className="nav-icon-btn" title="Tìm kiếm">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </button>
                            <button className="nav-icon-btn" title="Thông báo">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            </button>
                        </div>
                        
                        <div className="user-profile-nav" ref={dropdownRef}>
                            <div className="user-profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                                <div className="user-info">
                                    <span className="user-name">{username}</span>
                                    <span className={`user-role badge-${userRole.toLowerCase().replace(/\s+/g, '-')}`}>{userRole}</span>
                                </div>
                                <div className="user-avatar-premium">
                                    {user?.avatarPath ? (
                                        <img src={user.avatarPath} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                                    ) : (
                                        username.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            <div className={`profile-dropdown-menu ${isProfileOpen ? 'open' : ''}`}>
                                <div className="dropdown-header">
                                    <p className="dropdown-name">{username}</p>
                                    <p className="dropdown-email">{user?.email || `${username.toLowerCase().replace(' ', '')}@bookstore.com`}</p>
                                </div>
                                <div className="dropdown-body">
                                    <Link to="/staff/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        Hồ sơ cá nhân
                                    </Link>
                                    <Link to="/staff/settings" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                        Cài đặt bảo mật
                                    </Link>
                                </div>
                                <div className="dropdown-footer">
                                    <button className="dropdown-item logout-variant" onClick={handleLogout}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                        Đăng xuất hệ thống
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

export default StaffLayout;
