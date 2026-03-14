import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import StatusModal from '../../../components/StatusModal/StatusModal';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: '',
        email: '',
        fullName: '',
        phone: '',
        address: '',
        avatarPath: '',
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password'
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [statusModal, setStatusModal] = useState({ 
        isOpen: false, 
        type: 'success', 
        title: '', 
        message: '' 
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('profile');
            setUser(res.data);
        } catch (error) {
            console.error("Lỗi khi tải hồ sơ:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await api.put('profile', {
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                address: user.address
            });
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Cập nhật thành công',
                message: 'Thông tin hồ sơ của bạn đã được lưu lại an toàn.'
            });
            fetchProfile();
        } catch (error) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Lỗi cập nhật',
                message: error.response?.data || "Không thể cập nhật thông tin lúc này. Vui lòng thử lại sau."
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Lỗi xác nhận',
                message: 'Mật khẩu xác nhận không khớp!'
            });
            return;
        }
        setUpdating(true);
        try {
            await api.post('profile/change-password', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Đổi mật khẩu thành công',
                message: 'Mật khẩu của bạn đã được cập nhật thành công. Hãy ghi nhớ mật khẩu mới nhé!'
            });
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Lỗi bảo mật',
                message: error.response?.data || "Mật khẩu hiện tại không chính xác hoặc có lỗi xảy ra."
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleAvatarClick = () => {
        const input = document.getElementById('avatarInput');
        if (input) input.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Dung lượng quá lớn',
                message: 'Vui lòng chọn ảnh nhỏ hơn 2MB.'
            });
            return;
        }

        setUpdating(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUser(res.data);
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Cập nhật ảnh đại diện',
                message: 'Ảnh đại diện của bạn đã được thay đổi thành công!'
            });
        } catch (error) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Lỗi tải ảnh',
                message: error.response?.data || "Không thể tải ảnh lên lúc này."
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="loading">Đang tải hồ sơ…</div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 style={{ textWrap: 'balance' }}>Tài Khoản Của Tôi</h1>
                <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
            </div>

            <div className="profile-main-grid">
                {/* Sidebar */}
                <aside className="profile-sidebar glass">
                    <div className="user-brief">
                        <div className="profile-avatar-wrapper">
                            <img 
                                src={user.avatarPath ? `http://localhost:8080${user.avatarPath}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                                alt="Avatar" 
                            />
                            <button className="edit-avatar-btn" onClick={handleAvatarClick} disabled={updating} title="Thay đổi ảnh đại diện">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                            </button>
                            <input 
                                type="file" 
                                id="avatarInput" 
                                hidden 
                                accept="image/*" 
                                onChange={handleAvatarChange} 
                            />
                        </div>
                        <div className="user-names">
                            <h3>{user.fullName || user.username}</h3>
                            <span>@{user.username}</span>
                        </div>
                    </div>
                    
                    <nav className="profile-nav">
                        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                            <span className="icon">👤</span> Hồ Sơ Cá Nhân
                        </button>
                        <button className={activeTab === 'password' ? 'active' : ''} onClick={() => setActiveTab('password')}>
                            <span className="icon">🔒</span> Đổi Mật Khẩu
                        </button>
                        <button onClick={() => navigate('/orders')}>
                            <span className="icon">📜</span> Lịch Sử Đơn Hàng
                        </button>
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="profile-content glass fade-in">
                    {activeTab === 'profile' ? (
                        <div className="tab-panel">
                            <h2>Thông Tin Cá Nhân</h2>
                            <form className="profile-form" onSubmit={handleUpdateProfile}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Tên đăng nhập</label>
                                        <input type="text" value={user.username || ''} disabled spellCheck={false} />
                                        <small>Tên đăng nhập không thể thay đổi</small>
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" name="email" value={user.email || ''} onChange={handleInputChange} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Họ và Tên</label>
                                    <input type="text" name="fullName" value={user.fullName || ''} onChange={handleInputChange} required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input type="tel" name="phone" value={user.phone || ''} onChange={handleInputChange} placeholder="Chưa cập nhật" />
                                    </div>
                                    <div className="form-group">
                                        <label>Địa chỉ</label>
                                        <input type="text" name="address" value={user.address || ''} onChange={handleInputChange} placeholder="Chưa cập nhật" />
                                    </div>
                                </div>
                                <button type="submit" className="save-btn" disabled={updating}>
                                    {updating ? 'Đang Lưu…' : 'Lưu Thay Đổi'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="tab-panel">
                            <h2>🔒 Đổi Mật Khẩu</h2>
                            <p className="tab-desc">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.</p>
                            <form className="password-form" onSubmit={handleChangePassword}>
                                <div className="form-group">
                                    <label>Mật khẩu hiện tại</label>
                                    <input 
                                        type="password" 
                                        name="oldPassword" 
                                        value={passwords.oldPassword} 
                                        onChange={handlePasswordChange} 
                                        required 
                                        placeholder="Nhập mật khẩu cũ"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        name="newPassword" 
                                        value={passwords.newPassword} 
                                        onChange={handlePasswordChange} 
                                        required 
                                        placeholder="Tối thiểu 6 ký tự"
                                        minLength="6"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Xác nhận mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        name="confirmPassword" 
                                        value={passwords.confirmPassword} 
                                        onChange={handlePasswordChange} 
                                        required 
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                </div>
                                <button type="submit" className="save-btn" disabled={updating}>
                                    {updating ? 'ĐANG CẬP NHẬT...' : 'XÁC NHẬN ĐỔI MẬT KHẨU'}
                                </button>
                            </form>
                        </div>
                    )}
                </main>
            </div>
            <StatusModal 
                isOpen={statusModal.isOpen}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                onButtonClick={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                buttonText="Đóng"
            />
        </div>
    );
};

export default Profile;
