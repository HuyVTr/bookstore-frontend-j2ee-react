import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../pages/Staff/StaffDashboard.css'; // Reuse core styles

const AuthorDashboard = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalSales: 0,
        totalRevenue: 0,
        averageRating: 0,
        chartData: [],
        activities: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthorData = async () => {
            try {
                const response = await api.get('author/dashboard/stats');
                setStats(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi tải Dashboard Tác giả:", error);
                setLoading(false);
            }
        };

        fetchAuthorData();
    }, []);

    const statCards = [
        { 
            label: 'Tác phẩm đã đăng', 
            value: stats.totalBooks, 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>, 
            color: 'orange' 
        },
        { 
            label: 'Tổng lượt bán', 
            value: stats.totalSales, 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>, 
            color: 'blue' 
        },
        { 
            label: 'Doanh thu cá nhân', 
            value: stats.totalRevenue.toLocaleString() + 'đ', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, 
            color: 'green' 
        },
        { 
            label: 'Đánh giá trung bình', 
            value: stats.averageRating + ' / 5.0', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>, 
            color: 'purple' 
        }
    ];

    if (loading) {
        return <div className="staff-overview-content fade-in">Đang tải trung tâm điều hành...</div>;
    }

    return (
        <div className="staff-overview-content fade-in">
            <div className="welcome-banner-premium stagger-1" style={{background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'}}>
                <div className="welcome-text">
                    <h2 style={{color: '#fbbf24'}}>Xin chào, {localStorage.getItem('fullName') || localStorage.getItem('username')}! 🖋️</h2>
                    <p>Chào mừng bạn trở lại với không gian sáng tạo. Hãy cùng theo dõi sự đón nhận của độc giả đối với những tác phẩm của bạn.</p>
                </div>
                <div className="banner-visual">
                    <div className="circle-bg" style={{background: 'rgba(245, 158, 11, 0.1)'}}></div>
                </div>
            </div>

            <div className="stat-cards-grid">
                {statCards.map((card, i) => (
                    <div key={i} className={`stat-card-premium stagger-${i+1}`}>
                        <div className={`stat-icon-wrap ${card.color}`}>
                            {card.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{card.label}</span>
                            <span className="stat-value">{card.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-main-grid stagger-3">
                <div className="card-premium activity-card">
                    <div className="card-header-premium">
                        <h3>Thông báo mới nhất</h3>
                    </div>
                    <div className="activity-timeline">
                        {stats.activities.length > 0 ? stats.activities.map((act, i) => (
                            <div key={i} className="activity-item">
                                <div className={`activity-dot ${act[2] === 'COMPLETED' ? 'green' : 'orange'}`}></div>
                                <div className="activity-content">
                                    <p className="activity-message-staff">
                                        <strong>{act[0]}</strong> đã đặt mua tác phẩm <strong>"{act[1]}"</strong> 
                                        {act[2] === 'COMPLETED' ? ' (Giao thành công)' : ` (Trạng thái: ${act[2]})`}
                                    </p>
                                    <div className="activity-meta-staff">
                                        <span className="time-staff">{new Date(act[3]).toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state-dashboard">Chưa có hoạt động mua hàng nào.</div>
                        )}
                    </div>
                </div>

                <div className="card-premium chart-card">
                    <div className="card-header-premium">
                        <h3>Lượt tiếp cận độc giả</h3>
                    </div>
                    <div className="dummy-chart-premium">
                        <div className="chart-bar-container">
                            {Array.from({ length: 12 }, (_, i) => {
                                const monthData = stats.chartData.find(d => d[0] === i + 1);
                                const count = monthData ? monthData[1] : 0;
                                // Calculate height relative to max in year
                                const maxSales = Math.max(...stats.chartData.map(d => d[1]), 10);
                                const h = (count / maxSales) * 100;
                                return (
                                    <div 
                                        key={i} 
                                        className="chart-bar-premium" 
                                        title={`Tháng ${i+1}: ${count} bản`}
                                        style={{ height: `${Math.max(h, 5)}%`, background: count > 0 ? 'linear-gradient(to top, #f59e0b, #fbbf24)' : '#e2e8f0' }}
                                    ></div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthorDashboard;
