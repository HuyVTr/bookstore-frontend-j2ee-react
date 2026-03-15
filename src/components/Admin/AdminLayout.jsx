import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import api from '../../services/api';
import '../Staff/StaffLayout.css'; // Reuse layout styles
import './AdminLayout.css';

const AdminLayout = () => {
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
            // Backup update localStorage if needed
            if (response.data.fullName) {
                localStorage.setItem('fullName', response.data.fullName);
            }
        } catch (error) {
            console.error("Lỗi khi tải thông tin admin layout:", error);
        }
    };

    useEffect(() => {
        fetchUserData();

        // Lắng nghe sự kiện cập nhật profile để update lại UI ngay lập tức
        window.addEventListener('profileUpdated', fetchUserData);
        return () => window.removeEventListener('profileUpdated', fetchUserData);
    }, [location.pathname]);

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

    const getPageTitle = (path) => {
        if (path.includes('dashboard')) return 'Bảng điều khiển Admin';
        if (path.includes('users')) return 'Quản lý người dùng';
        if (path.includes('reports')) return 'Báo cáo hệ thống';
        if (path.includes('analytics')) return 'Phân tích kinh doanh';
        if (path.includes('settings')) return 'Cấu hình hệ thống';
        if (path.includes('profile')) return 'Hồ sơ cá nhân';
        return 'Admin Console';
    };

    const username = user?.fullName || user?.username || localStorage.getItem('username') || 'Admin';

    // Extract actual user role
    let userRole = 'Administrator';
    if (user?.roles) {
        const roles = user.roles.map(r => r.name);
        if (roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')) userRole = 'Administrator';
        else if (roles.includes('ROLE_STAFF') || roles.includes('STAFF')) userRole = 'Staff Member';
        else if (roles.includes('ROLE_AUTHOR') || roles.includes('AUTHOR')) userRole = 'Author';
    } else {
        try {
            const rolesObj = JSON.parse(localStorage.getItem('roles'));
            if (rolesObj && Array.isArray(rolesObj)) {
                if (rolesObj.includes('ROLE_ADMIN') || rolesObj.includes('ADMIN')) userRole = 'Administrator';
                else if (rolesObj.includes('ROLE_STAFF') || rolesObj.includes('STAFF')) userRole = 'Staff Member';
            }
        } catch (e) {}
    }

    return (
        <div className="staff-dashboard-shell admin-shell">
            <AdminSidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            {/* Overlay for mobile */}
            {isSidebarOpen && <div className="mobile-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 950, backdropFilter: 'blur(4px)'
            }}></div>}

            <div className="staff-main-content">
                <header className="staff-top-nav admin-top-nav">
                    <div className="top-nav-left">
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                            </button>
                            <div>
                                <div className="breadcrumbs">ADMIN / {location.pathname.replace('/admin/', '').replace('/', ' / ').toUpperCase()}</div>
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
                                <div className="user-avatar-premium admin-avatar" style={{background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', color: '#9333ea', borderColor: '#d8b4fe', boxShadow: '0 4px 10px rgba(147, 51, 234, 0.15)'}}>
                                    <img 
                                    src={user?.avatarPath || "https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff"} 
                                    alt="Admin" 
                                    width="40"
                                    height="40"
                                    style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}
                                /></div>
                            </div>

                            {/* Dropdown Menu */}
                            <div className={`profile-dropdown-menu ${isProfileOpen ? 'open' : ''}`}>
                                <div className="dropdown-header">
                                    <p className="dropdown-name">{username}</p>
                                    <p className="dropdown-email">{user?.email || `${username.toLowerCase().replace(' ', '')}@bookstore.com`}</p>
                                </div>
                                <div className="dropdown-body">
                                    <Link to="/admin/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        Hồ sơ cá nhân
                                    </Link>
                                    <Link to="/admin/settings" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
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

export default AdminLayout;
