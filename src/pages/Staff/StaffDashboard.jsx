import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ActivityLogModal from '../../components/Common/ActivityLogModal';
import './StaffDashboard.css';

const StaffDashboard = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalOrders: 0,
        lowStock: 0,
        totalRevenue: 0
    });
    const [chartPercentages, setChartPercentages] = useState([0,0,0,0,0,0,0,0,0,0,0,0]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('staff/dashboard/overview');
                const data = response.data;
                if (data.stats) {
                    setStats(data.stats);
                }
                if (data.chartData && data.chartData.percentages) {
                    setChartPercentages(data.chartData.percentages);
                }
                if (data.recentActivity) {
                    setRecentActivity(data.recentActivity);
                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Vừa xong';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " năm trước";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " tháng trước";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " ngày trước";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " giờ trước";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " phút trước";
        return Math.floor(seconds) + " giây trước";
    };

    const statCards = [
        { 
            label: 'Tổng đầu sách', 
            value: stats.totalBooks, 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>, 
            color: 'blue' 
        },
        { 
            label: 'Tổng đơn hàng', 
            value: stats.totalOrders, 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>, 
            color: 'green' 
        },
        { 
            label: 'Sắp hết hàng', 
            value: stats.lowStock, 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>, 
            color: 'orange' 
        },
        { 
            label: 'Doanh thu', 
            value: stats.totalRevenue.toLocaleString() + 'đ', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, 
            color: 'purple' 
        }
    ];

    if (loading) {
        return (
            <div className="staff-overview-content fade-in">
                 <div className="welcome-banner-premium stagger-1">
                 </div>
            </div>
        )
    }

    const uncompletedOrders = stats.totalOrders > 0 ? Math.floor(stats.totalOrders / 3) : 0; // Thay thế bằng dữ liệu thực sau

    return (
        <div className="staff-overview-content fade-in">
            <div className="welcome-banner-premium stagger-1">
                <div className="welcome-text">
                    <h2>Trung tâm điều hành 🚀</h2>
                    <p>Chào ngày mới! Hệ thống đang hoạt động ổn định và sẵn sàng cho công việc.</p>
                </div>
                <div className="banner-visual">
                    <div className="circle-bg"></div>
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
                        <h3>Hoạt động hệ thống</h3>
                        <button className="view-all-text" onClick={() => setIsActivityModalOpen(true)}>Xem Tất Cả Hoạt Động</button>
                    </div>
                    <div className="activity-timeline">
                        {recentActivity.length > 0 ? recentActivity.slice(0, 3).map((act) => (
                            <div key={act.id} className="activity-item">
                                <div className={`activity-dot ${act.type || 'generic'}`}></div>
                                <div className="activity-content">
                                    <p className="activity-message-staff">{act.text || act.content}</p>
                                    <div className="activity-meta-staff">
                                        <span className="actor-staff">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                            {act.userRole ? `${act.userRole.replace('ROLE_', '')} • ` : ''}
                                            {act.username || 'Hệ thống'}
                                        </span>
                                        <span className="divider-staff">•</span>
                                        <span className="time-staff">{formatTimeAgo(act.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="activity-item">
                                <div className="activity-content">
                                    <p style={{ color: '#64748b' }}>Chưa có hoạt động nào được ghi nhận gần đây.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card-premium chart-card">
                    <div className="card-header-premium">
                        <h3>Sách bán ra theo tháng (Năm nay)</h3>
                    </div>
                    <div className="dummy-chart-premium">
                        <div className="chart-bar-container">
                            {chartPercentages.map((h, i) => (
                                <div 
                                    key={i} 
                                    className="chart-bar-premium" 
                                    style={{ height: `${h > 0 ? h : 5}%`, opacity: h > 0 ? 1 : 0.3 }}
                                    title={`Tháng ${i+1}`}
                                ></div>
                            ))}
                        </div>
                        <div className="chart-labels">
                            {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map(l => <span key={l} style={{fontSize: '0.7rem'}}>{l}</span>)}
                        </div>
                    </div>
                </div>
            </div>

            <ActivityLogModal 
                isOpen={isActivityModalOpen} 
                onClose={() => setIsActivityModalOpen(false)} 
                activities={recentActivity}
                title="Nhật ký hoạt động Staff"
            />
        </div>
    );
};

export default StaffDashboard;
