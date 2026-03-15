import React from 'react';
import './ActivityLogModal.css';

const ActivityLogModal = ({ isOpen, onClose, activities, title = "Nhật ký hoạt động" }) => {
    if (!isOpen) return null;

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="activity-modal-overlay" onClick={onClose}>
            <div className="activity-modal-container glass-morphism fade-in" onClick={e => e.stopPropagation()}>
                <div className="activity-modal-header">
                    <div className="header-left">
                        <div className="header-icon-premium">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="9"></circle></svg>
                        </div>
                        <div className="header-titles">
                            <h3>{title}</h3>
                            <p>Toàn bộ lịch sử thao tác trên hệ thống</p>
                        </div>
                    </div>
                    <button className="close-activity-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="activity-modal-body custom-scrollbar">
                    {activities.length > 0 ? (
                        <div className="modal-activity-list">
                            {activities.map((act, idx) => (
                                <div key={idx} className="modal-activity-item stagger-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                                    <div className={`activity-indicator-dot ${act.type || 'system'}`}></div>
                                    <div className="activity-main-content">
                                        <div className="activity-text-row">
                                            <p className="activity-message">{act.content || act.text}</p>
                                        </div>
                                        <div className="activity-meta-row">
                                            <span className="activity-actor">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                {act.userRole ? `${act.userRole.replace('ROLE_', '')} • ` : ''}
                                                {act.username || 'Hệ thống'}
                                            </span>
                                            <span className="activity-sep">•</span>
                                            <span className="activity-time">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                {formatTimeAgo(act.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-activities">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            <p>Chưa có dữ liệu hoạt động nào</p>
                        </div>
                    )}
                </div>

                <div className="activity-modal-footer">
                    <button className="done-btn-premium" onClick={onClose}>Hoàn tất</button>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogModal;
