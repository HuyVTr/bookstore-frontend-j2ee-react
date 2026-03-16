import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [roles, setRoles] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: ''
    });

    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info', // 'info', 'danger', 'success'
        onConfirm: null
    });

    const showAlert = (title, message, type = 'info') => {
        setModal({ isOpen: true, title, message, type, onConfirm: null });
    };

    const showConfirm = (title, message, onConfirm) => {
        setModal({ isOpen: true, title, message, type: 'danger', onConfirm });
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('admin/users');
            const rawUsers = res.data || [];
            
            // Tìm ID Admin nhỏ nhất để xác định Super Admin (sử dụng == để so sánh ID linh hoạt)
            const adminUsers = rawUsers.filter(u => 
                u.roles?.some(r => r.name === 'ROLE_ADMIN' || r.name === 'ADMIN')
            );
            const adminIds = adminUsers.map(u => Number(u.id));
            const minAdminId = adminIds.length > 0 ? Math.min(...adminIds) : null;

            const mappedUsers = rawUsers.map(u => {
                const isSuper = minAdminId !== null && Number(u.id) === minAdminId;
                return {
                    ...u,
                    role: u.roles && u.roles.length > 0 
                        ? u.roles[0].name.replace('ROLE_', '') 
                        : 'USER',
                    status: u.active ? 'ACTIVE' : 'LOCKED',
                    platform: u.provider || 'local',
                    isSuperAdmin: isSuper
                };
            });
            setUsers(mappedUsers);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await api.get('admin/users/roles');
            setRoles(res.data || []);
        } catch (err) {
            console.error("Error fetching roles:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    // Lấy thông tin người dùng hiện tại từ localStorage
    const currentUserUsername = localStorage.getItem('username')?.toLowerCase();
    const currentUser = users.find(u => u.username?.toLowerCase() === currentUserUsername);
    const isCurrentUserSuperAdmin = currentUser?.isSuperAdmin;

    const canModify = (targetUser) => {
        // Nếu mình là Super Admin thì sửa được tất cả TRỪ chính mình (để tránh tự hạ quyền) 
        // Hoặc cho phép sửa chính mình nhưng trong UI khóa nút xóa chính mình là được
        if (isCurrentUserSuperAdmin) return true; 
        
        // Nếu mình không phải Super Admin, k được đụng vào bất kỳ Admin nào
        if (targetUser.role === 'ADMIN' || targetUser.isSuperAdmin) return false;
        
        return true;
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('admin/users', newUser);
            showAlert('Thành công', 'Tạo người dùng thành công!', 'success');
            setIsAddModalOpen(false);
            setNewUser({ username: '', email: '', password: '', fullName: '', phone: '' });
            fetchUsers();
        } catch (err) {
            showAlert('Lỗi', err.response?.data || 'Không thể tạo người dùng', 'danger');
        }
    };

    const handleUpdateRole = async (roleId) => {
        try {
            await api.post(`admin/users/${selectedUser.id}/update-role?roleId=${roleId}`);
            showAlert('Thành công', 'Cập nhật vai trò thành công!', 'success');
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (err) {
            showAlert('Lỗi bảo mật', err.response?.data || 'Cơ chế bảo mật: Bạn không có quyền quản lý Admin này!', 'danger');
        }
    };

    const toggleUserStatus = async (user) => {
        if (!canModify(user)) {
            showAlert('Hạn chế quyền', 'Admin không thể khóa tài khoản của Admin khác hoặc Super Admin!', 'danger');
            return;
        }
        try {
            await api.post(`admin/users/${user.id}/toggle-status`);
            fetchUsers();
        } catch (err) {
            showAlert('Lỗi', err.response?.data || 'Lỗi khi thay đổi trạng thái', 'danger');
        }
    };

    const deleteUser = async (user) => {
        if (!canModify(user)) {
            showAlert('Hạn chế quyền', 'Admin không thể xóa tài khoản của Admin khác hoặc Super Admin!', 'danger');
            return;
        }
        
        showConfirm(
            'Xác nhận xóa vĩnh viễn',
            `Bạn có chắc chắn muốn xóa tài khoản "${user.username}"? Hành động này không thể hoàn tác.`,
            async () => {
                try {
                    await api.delete(`admin/users/${user.id}`);
                    fetchUsers();
                } catch (err) {
                    showAlert('Lỗi', err.response?.data || 'Lỗi khi xóa người dùng', 'danger');
                }
            }
        );
    };

    const PlatformBadge = ({ platform }) => {
        const p = platform?.toLowerCase() || 'local';
        const icons = {
            local: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
            google: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.28.81-.56z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
            github: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
            facebook: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        };

        return (
            <span className={`platform-badge ${p}`}>
                {icons[p] || icons.local}
                {p.charAt(0).toUpperCase() + p.slice(1)}
            </span>
        );
    };

    useEffect(() => {
        let result = users;

        if (searchTerm) {
            result = result.filter(u => 
                (u.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
            );
        }

        if (roleFilter !== 'ALL') {
            result = result.filter(u => u.role === roleFilter);
        }

        if (statusFilter !== 'ALL') {
            result = result.filter(u => u.status === statusFilter);
        }

        setFilteredUsers(result);
    }, [users, searchTerm, roleFilter, statusFilter]);


    return (
        <div className="admin-page-content fade-in">
            <header className="manage-header">
                <div>
                    <h1>Quản lý Người dùng 👥</h1>
                    <p>Phân quyền, kiểm tra hoạt động và quản lý trạng thái tài khoản toàn hệ thống.</p>
                </div>
                <div className="header-actions">
                    <button className="add-btn-premium" onClick={() => setIsAddModalOpen(true)} style={{
                        padding: '10px 20px', 
                        background: 'var(--admin-primary)', 
                        color: 'white', 
                        borderRadius: '10px',
                        border: 'none',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Tạo tài khoản mới
                    </button>
                </div>
            </header>

            {/* Modals */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content animate-slide-up">
                        <h2>Tạo tài khoản mới 👤</h2>
                        <form onSubmit={handleCreateUser}>
                            <div className="form-group">
                                <label htmlFor="username">Tên đăng nhập</label>
                                <input 
                                    id="username"
                                    name="username"
                                    type="text" 
                                    autoComplete="username"
                                    required 
                                    value={newUser.username} 
                                    onChange={e => setNewUser({...newUser, username: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fullName">Họ và tên</label>
                                <input 
                                    id="fullName"
                                    name="fullName"
                                    type="text" 
                                    autoComplete="name"
                                    required 
                                    value={newUser.fullName} 
                                    onChange={e => setNewUser({...newUser, fullName: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input 
                                    id="email"
                                    name="email"
                                    type="email" 
                                    autoComplete="email"
                                    spellCheck={false}
                                    required 
                                    value={newUser.email} 
                                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Số điện thoại</label>
                                <input 
                                    id="phone"
                                    name="phone"
                                    type="text" 
                                    autoComplete="tel"
                                    value={newUser.phone} 
                                    onChange={e => setNewUser({...newUser, phone: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Mật khẩu</label>
                                <input 
                                    id="password"
                                    name="password"
                                    type="password" 
                                    autoComplete="new-password"
                                    required 
                                    value={newUser.password} 
                                    onChange={e => setNewUser({...newUser, password: e.target.value})} 
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsAddModalOpen(false)}>Hủy</button>
                                <button type="submit" className="primary">Xác nhận tạo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content animate-slide-up" style={{maxWidth: '400px'}}>
                        <h2>Chỉnh sửa quyền hạn 🛠️</h2>
                        <p style={{marginBottom: '1rem', color: 'var(--admin-text-muted)'}}>Thay đổi vai trò cho <b>{selectedUser?.username}</b></p>
                        <div className="role-options">
                            {roles.map(role => (
                                <button 
                                    key={role.id} 
                                    className={`role-option ${selectedUser?.roles?.some(r => r.id === role.id) ? 'active' : ''}`}
                                    onClick={() => handleUpdateRole(role.id)}
                                >
                                    {role.name.replace('ROLE_', '')}
                                </button>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setIsEditModalOpen(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {modal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content animate-slide-up" style={{maxWidth: '450px'}}>
                        <div className="modal-header-premium" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                            <div className={`modal-icon-circle ${modal.type}`} style={{
                                width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: modal.type === 'danger' ? '#fee2e2' : modal.type === 'success' ? '#dcfce7' : '#e0e7ff',
                                color: modal.type === 'danger' ? '#ef4444' : modal.type === 'success' ? '#10b981' : '#6366f1'
                            }}>
                                {modal.type === 'danger' ? '⚠️' : modal.type === 'success' ? '✅' : 'ℹ️'}
                            </div>
                            <h2 style={{ margin: 0 }}>{modal.title}</h2>
                        </div>
                        <p style={{ color: 'var(--admin-text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>{modal.message}</p>
                        <div className="modal-actions-premium" style={{ display: 'flex', gap: '12px' }}>
                            {modal.onConfirm ? (
                                <>
                                    <button 
                                        className="btn-modal-cancel" 
                                        style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600' }}
                                        onClick={closeModal}
                                    >Hủy bỏ</button>
                                    <button 
                                        className="btn-modal-confirm danger" 
                                        style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                                        onClick={() => {
                                            modal.onConfirm();
                                            closeModal();
                                        }}
                                    >Xác nhận</button>
                                </>
                            ) : (
                                <button 
                                    className="btn-modal-confirm" 
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--admin-primary)', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                                    onClick={closeModal}
                                >Đã hiểu</button>
                            )}
                        </div>
                    </div>
                </div>
            )}


            <div className="card-premium table-container">
                <div className="table-controls">
                    <div className="search-wrapper">
                        <span className="search-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên, email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select 
                            className="filter-select"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="ALL">Tất cả vai trò</option>
                            <option value="ADMIN">Admin</option>
                            <option value="STAFF">Nhân viên</option>
                            <option value="AUTHOR">Tác giả</option>
                            <option value="USER">Khách hàng</option>
                        </select>
                        <select 
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="LOCKED">Đã khóa</option>
                        </select>
                    </div>
                </div>

                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Người dùng</th>
                            <th>Email liên hệ</th>
                            <th>Nền tảng</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <tr key={user.id} className={user.isSuperAdmin ? 'super-admin-row' : ''}>
                                <td>
                                    <div className="user-cell">
                                        <div className={`user-avatar-mini ${user.isSuperAdmin ? 'super' : ''}`}>
                                            {user.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-meta">
                                            <span className="u-name">
                                                {user.username}
                                                {user.isSuperAdmin && <span className="super-badge" title="Super Admin">🛡️</span>}
                                            </span>
                                            <span className="u-id tabular-nums">ID: #{user.id.toString().padStart(4, '0')}</span>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Email">{user.email}</td>
                                <td data-label="Nền tảng">
                                    <PlatformBadge platform={user.platform} />
                                </td>
                                <td data-label="Vai trò">
                                    <span className={`badge-role ${user.role?.toLowerCase() || 'user'}`}>
                                        {user.isSuperAdmin ? 'SUPER ADMIN' : (user.role || 'USER')}
                                    </span>
                                </td>
                                <td data-label="Trạng thái">
                                    <div className="status-pill">
                                        <span className={`status-dot ${user.status?.toLowerCase() || 'active'}`}></span>
                                        <span style={{ fontSize: '0.8rem', color: user.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>
                                            {user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã vô hiệu'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="actions">
                                        <button 
                                            className={`action-btn ${!canModify(user) ? 'disabled' : ''}`} 
                                            aria-label="Chỉnh sửa quyền hạn"
                                            title={canModify(user) ? "Chỉnh sửa quyền" : "Bạn không có quyền quản lý Admin này"} 
                                            onClick={() => {
                                                if(canModify(user)) {
                                                    setSelectedUser(user);
                                                    setIsEditModalOpen(true);
                                                }
                                            }}
                                            disabled={!canModify(user)}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                        </button>
                                        <button 
                                            className={`action-btn ${!canModify(user) ? 'disabled' : ''}`} 
                                            aria-label={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                            onClick={() => toggleUserStatus(user)}
                                            disabled={!canModify(user)}
                                            title={!canModify(user) ? "Bạn không có quyền quản lý Admin này" : (user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa')}
                                        >
                                            {user.status === 'ACTIVE' ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                                            )}
                                        </button>
                                        <button 
                                            className={`action-btn danger ${!canModify(user) ? 'disabled' : ''}`} 
                                            aria-label="Xóa người dùng"
                                            onClick={() => deleteUser(user)} 
                                            disabled={!canModify(user)}
                                            title={!canModify(user) ? "Bạn không có quyền quản lý Admin này" : "Xóa tài khoản"}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                                    Không tìm thấy người dùng nào phù hợp…
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                <div className="table-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: 'var(--admin-text-muted)' }}>
                    <span>Hiển thị {filteredUsers.length} trên {users.length} người dùng</span>
                    <div className="pagination" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="action-btn" disabled>Trước</button>
                        <button className="action-btn active" style={{ background: 'var(--admin-primary)', color: 'white', borderColor: 'var(--admin-primary)' }}>1</button>
                        <button className="action-btn">Sau</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
