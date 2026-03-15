import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminSettings.css';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ show: false, message: '', type: 'success' });
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const [settings, setSettings] = useState({
        websiteName: '',
        maintenanceMode: false,
        allowRegistration: true,
        orderPrefix: 'BK-',
        currency: 'VND',
        defaultLanguage: 'vi'
    });

    useEffect(() => {
        fetchSettings();
        checkPermissions();
    }, []);

    const checkPermissions = () => {
        const roles = JSON.parse(localStorage.getItem('roles') || '[]');
        const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');
        setIsSuperAdmin(isAdmin); 
    };

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get('admin/configs');
            setSettings(response.data);
        } catch (error) {
            console.error("Lỗi khi tải cấu hình:", error);
            showStatus("Không thể tải cấu hình hệ thống", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('admin/configs/update', settings);
            showStatus("Cập nhật cấu hình thành công!");
        } catch (error) {
            console.error("Lỗi khi lưu cấu hình:", error);
            showStatus("Lỗi khi lưu cấu hình. Vui lòng thử lại.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleClearCache = async () => {
        setShowConfirmModal(false);
        try {
            await api.post('admin/configs/clear-cache');
            showStatus("Đã xóa toàn bộ bộ nhớ cache hệ thống thành công!");
        } catch (error) {
            showStatus("Không thể xóa cache hệ thống", "error");
        }
    };

    const showStatus = (message, type = 'success') => {
        setStatus({ show: true, message, type });
        setTimeout(() => setStatus({ show: false, message: '', type: 'success' }), 4000);
    };

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) return <div className="admin-page-content"><p>Đang tải cấu hình hệ thống…</p></div>;

    return (
        <div className="admin-page-content fade-in settings-container">
            <header className="manage-header">
                <div>
                    <h1>Cấu hình hệ thống ⚙️</h1>
                    <p>Quản lý các thông số vận hành và thiết lập bảo mật toàn cục.</p>
                </div>
                <div className="header-actions">
                    <button 
                        className="btn-save-settings" 
                        onClick={handleSave}
                        disabled={saving}
                        aria-label="Lưu cấu hình hệ thống"
                    >
                        {saving ? (
                            <><div className="shimmer" style={{ width: '18px', height: '18px', borderRadius: '50%' }}></div> Đang lưu…</>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                Lưu thay đổi
                            </>
                        )}
                    </button>
                </div>
            </header>

            <div className="settings-grid">
                <div className="settings-card">
                    <div className="card-title">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                        Thông tin cơ bản
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label" htmlFor="websiteName">Tên website</label>
                        <input 
                            id="websiteName"
                            name="websiteName"
                            autoComplete="organization"
                            type="text" 
                            className="form-input-premium" 
                            placeholder="Ví dụ: Antigravity Bookstore…"
                            value={settings.websiteName}
                            onChange={(e) => setSettings({...settings, websiteName: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="orderPrefix">Tiền tố đơn hàng</label>
                        <input 
                            id="orderPrefix"
                            name="orderPrefix"
                            autoComplete="off"
                            type="text" 
                            className="form-input-premium" 
                            placeholder="Ví dụ: BK-…"
                            value={settings.orderPrefix}
                            onChange={(e) => setSettings({...settings, orderPrefix: e.target.value})}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="currency">Đơn vị tiền tệ</label>
                            <select 
                                id="currency"
                                name="currency"
                                className="form-input-premium" 
                                value={settings.currency}
                                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                            >
                                <option value="VND">Việt Nam Đồng (đ)</option>
                                <option value="USD">Dollar Mỹ ($)</option>
                                <option value="EUR">Euro (€)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="defaultLanguage">Ngôn ngữ mặc định</label>
                            <select 
                                id="defaultLanguage"
                                name="defaultLanguage"
                                className="form-input-premium"
                                value={settings.defaultLanguage}
                                onChange={(e) => setSettings({...settings, defaultLanguage: e.target.value})}
                            >
                                <option value="vi">Tiếng Việt</option>
                                <option value="en">English (US)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="settings-cards-stack" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="settings-card">
                        <div className="card-title">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            Chế độ vận hành
                        </div>

                        <div className="toggle-group">
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <h4>Chế độ bảo trì</h4>
                                    <p>Tạm dừng truy cập từ khách hàng</p>
                                </div>
                                <div 
                                    className={`premium-switch warning ${settings.maintenanceMode ? 'active' : ''}`}
                                    onClick={() => handleToggle('maintenanceMode')}
                                >
                                    <div className="switch-dot"></div>
                                </div>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <h4>Cho phép đăng ký</h4>
                                    <p>Khách có thể tạo tài khoản mới</p>
                                </div>
                                <div 
                                    className={`premium-switch ${settings.allowRegistration ? 'active' : ''}`}
                                    onClick={() => handleToggle('allowRegistration')}
                                >
                                    <div className="switch-dot"></div>
                                </div>
                            </div>
                        </div>

                        {isSuperAdmin && (
                            <div className="danger-zone slide-up">
                                <div className="danger-header">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                    <h4>Vùng nguy hiểm</h4>
                                </div>
                                <button className="btn-clear-cache" onClick={() => setShowConfirmModal(true)}>
                                    Xóa toàn bộ bộ nhớ cache
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showConfirmModal && (
                <div className="locked-feature-overlay fade-in">
                    <div className="locked-feature-modal scale-in danger-modal">
                        <div className="locked-icon-container danger">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        </div>
                        <h3>Xác nhận xóa Cache?</h3>
                        <p>
                            Hành động này sẽ xóa toàn bộ nội dung đã lưu tạm trong hệ thống. 
                            Việc này có thể làm chậm tốc độ tải trang trong thời gian ngắn do hệ thống phải nạp lại dữ liệu từ cơ sở dữ liệu.
                        </p>
                        <div className="modal-actions-premium">
                            <button className="btn-modal-cancel" onClick={() => setShowConfirmModal(false)}>Hủy bỏ</button>
                            <button className="btn-modal-confirm" onClick={handleClearCache}>Xác nhận xóa</button>
                        </div>
                    </div>
                </div>
            )}

            {status.show && (
                <div className="status-toast" style={{ borderLeftColor: status.type === 'error' ? '#ef4444' : '#10b981' }}>
                    <div className="status-icon">
                        {status.type === 'success' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        )}
                    </div>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{status.message}</span>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
