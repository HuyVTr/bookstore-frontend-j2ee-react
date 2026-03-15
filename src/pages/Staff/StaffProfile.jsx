import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import StatusModal from '../../components/Staff/StatusModal';
import './StaffProfile.css';

const StaffProfile = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [statusData, setStatusData] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    // Fetch profile data
    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await api.get('profile');
            const userData = response.data;
            setUser(userData);
            setFormData({
                fullName: userData.fullName || '',
                phone: userData.phone || '',
                address: userData.address || ''
            });
        } catch (error) {
            console.error("Lỗi khi tải thông tin hồ sơ:", error);
            showStatus('error', 'Lỗi', 'Không thể tải thông tin hồ sơ của bạn.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Đồng bộ Tab với URL hiện tại
    useEffect(() => {
        if (location.pathname.includes('settings')) {
            setActiveTab('security');
        } else {
            setActiveTab('general');
        }
    }, [location.pathname]);

    const showStatus = (type, title, message) => {
        setStatusData({ isOpen: true, type, title, message });
    };

    const closeStatus = () => setStatusData(prev => ({ ...prev, isOpen: false }));

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveGeneral = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('profile', formData);
            setUser(response.data);
            localStorage.setItem('fullName', response.data.fullName);
            // Phát sự kiện để Sidebar/Header cập nhật theo
            window.dispatchEvent(new Event('profileUpdated'));
            showStatus('success', 'Thành công', 'Thông tin cá nhân đã được cập nhật.');
        } catch (error) {
            console.error("Lỗi cập nhật profile:", error);
            const msg = error.response?.data || 'Không thể cập nhật thông tin.';
            showStatus('error', 'Lỗi', msg);
        }
    };

    const handleSaveSecurity = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showStatus('error', 'Lỗi', 'Mật khẩu xác nhận không khớp!');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showStatus('error', 'Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        try {
            await api.post('profile/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            showStatus('success', 'Thành công', 'Đổi mật khẩu thành công!');
        } catch (error) {
            console.error("Lỗi đổi mật khẩu:", error);
            const msg = error.response?.data || 'Mật khẩu hiện tại không chính xác.';
            showStatus('error', 'Lỗi', msg);
        }
    };

    const username = user?.username || localStorage.getItem('username') || 'Staff';
    
    // Extract actual user role
    let userRole = 'Staff Member';
    if (user?.roles) {
        const roles = user.roles.map(r => r.name);
        if (roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')) userRole = 'Administrator';
        else if (roles.includes('ROLE_AUTHOR') || roles.includes('AUTHOR')) userRole = 'Author';
    }

    if (loading && !user) {
        return <div className="staff-page-content fade-in"><p>Đang tải thông tin...</p></div>;
    }

    return (
        <div className="staff-page-content fade-in staff-profile-page">
            <div className="profile-layout-grid">
                
                {/* Tóm tắt cá nhân (Bên trái) */}
                <div className="profile-sidebar">
                    <div className="profile-card">
                        <div className="avatar-large">
                            {user?.avatarPath ? (
                                <img src={user.avatarPath} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                            ) : (
                                username.charAt(0).toUpperCase()
                            )}
                        </div>
                        <h3 className="profile-name">{user?.fullName || username}</h3>
                        <p className="profile-email">{user?.email || `${username.toLowerCase().replace(' ', '')}@bookstore.com`}</p>
                        <div className="profile-role-badge">
                            <span className={`badge-${userRole.toLowerCase().replace(/\s+/g, '-')}`}>{userRole}</span>
                        </div>

                        <div className="profile-stats">
                            <div className="p-stat">
                                <span className="p-val">{user?.booksCount || 0}</span>
                                <span className="p-label">Sách đã đăng</span>
                            </div>
                            <div className="p-stat">
                                <span className="p-val">{user?.ordersCount || 0}</span>
                                <span className="p-label">Đơn đã xử lý</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Khu vực Settings (Bên phải) */}
                <div className="profile-main-content">
                    <div className="settings-card">
                        <div className="settings-tabs">
                            <button 
                                className={`s-tab ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                Thông tin cơ bản
                            </button>
                            <button 
                                className={`s-tab ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                Mật khẩu & Bảo mật
                            </button>
                        </div>

                        <div className="settings-body">
                            {activeTab === 'general' && (
                                <form className="settings-form fade-in" onSubmit={handleSaveGeneral}>
                                    <h4 className="s-section-title">Hồ sơ cá nhân</h4>
                                    <p className="s-section-desc">Cập nhật thông tin định danh và liên hệ của bạn.</p>
                                    
                                    <div className="s-form-grid">
                                        <div className="s-form-group">
                                            <label>Họ và Tên</label>
                                            <input 
                                                type="text" 
                                                name="fullName"
                                                value={formData.fullName} 
                                                onChange={handleInputChange}
                                                className="s-input" 
                                                required
                                            />
                                        </div>
                                        <div className="s-form-group">
                                            <label>Tên đăng nhập</label>
                                            <input type="text" value={user?.username} className="s-input" disabled style={{opacity: 0.6}} />
                                        </div>
                                        <div className="s-form-group">
                                            <label>Số điện thoại</label>
                                            <input 
                                                type="tel" 
                                                name="phone"
                                                value={formData.phone} 
                                                onChange={handleInputChange}
                                                placeholder="Ví dụ: 0123456789" 
                                                className="s-input" 
                                            />
                                        </div>
                                        <div className="s-form-group">
                                            <label>Địa chỉ</label>
                                            <input 
                                                type="text" 
                                                name="address"
                                                value={formData.address} 
                                                onChange={handleInputChange}
                                                placeholder="Địa chỉ liên hệ" 
                                                className="s-input" 
                                            />
                                        </div>
                                    </div>

                                    <div className="s-form-actions">
                                        <button type="submit" className="s-btn-primary">Lưu thay đổi</button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <form className="settings-form fade-in" onSubmit={handleSaveSecurity}>
                                    <h4 className="s-section-title">Đổi mật khẩu</h4>
                                    <p className="s-section-desc">Đảm bảo tài khoản của bạn đang sử dụng một mật khẩu dài và an toàn.</p>
                                    
                                    <div className="s-form-group full-width">
                                        <label>Mật khẩu hiện tại</label>
                                        <input 
                                            type="password" 
                                            name="oldPassword"
                                            value={passwordData.oldPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Nhập mật khẩu hiện tại" 
                                            className="s-input" 
                                            required
                                        />
                                    </div>
                                    <div className="s-form-group full-width">
                                        <label>Mật khẩu mới</label>
                                        <input 
                                            type="password" 
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Nhập mật khẩu mới" 
                                            className="s-input" 
                                            required
                                        />
                                        <span className="s-hint">Gợi ý: Mật khẩu nên có ít nhất 6 ký tự.</span>
                                    </div>
                                    <div className="s-form-group full-width">
                                        <label>Xác nhận mật khẩu mới</label>
                                        <input 
                                            type="password" 
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Nhập lại mật khẩu mới" 
                                            className="s-input" 
                                            required
                                        />
                                    </div>

                                    <div className="s-form-actions">
                                        <button type="submit" className="s-btn-primary">Cập nhật Mật khẩu</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {statusData.isOpen && (
                <StatusModal 
                    type={statusData.type}
                    title={statusData.title}
                    message={statusData.message}
                    onCancel={closeStatus}
                />
            )}
        </div>
    );
};

export default StaffProfile;
