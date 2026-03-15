import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../services/api';
import ActivityLogModal from '../../components/Common/ActivityLogModal';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialYear = searchParams.get('year') || new Date().getFullYear().toString();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [activities, setActivities] = useState([]);
    const [systemStatus, setSystemStatus] = useState({});
    const [revenueChart, setRevenueChart] = useState([]);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const navigate = useNavigate();

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // We combine specific year stats with general overview data
                const [statsRes, overviewRes] = await Promise.all([
                    api.get(`/admin/stats/dashboard?year=${selectedYear}`),
                    api.get('admin/dashboard/overview')
                ]);
                
                setStats(statsRes.data);
                
                const data = overviewRes.data;
                // Process chart data (12 months)
                const monthLabels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
                const maxRevenue = Math.max(...data.monthlyRevenue, 1);
                const processedChart = data.monthlyRevenue.map((val, idx) => ({
                    month: monthLabels[idx],
                    value: (val * 100) / maxRevenue,
                    revenue: val
                }));
                setRevenueChart(processedChart);

                setActivities(data.activities || []);
                setSystemStatus(data.systemStatus || {});

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        // Update URL when year changes
        setSearchParams({ year: selectedYear.toString() }, { replace: true });
    }, [selectedYear, setSearchParams]);

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    };

    if (loading) return (
        <div className="admin-loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '20px' }}>
            <div className="spinner-premium"></div>
            <p style={{ color: '#6366f1', fontWeight: '600' }}>Đang kết nối trung tâm điều hành…</p>
        </div>
    );

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <div className="admin-dashboard fade-in">
            <div className="admin-banner-premium">
                <div className="banner-content">
                    <h2>Trung tâm điều hành 🛰️</h2>
                    <p>Chào mừng Admin! Hôm nay hệ thống ghi nhận sự biến động tích cực về doanh thu.</p>
                </div>
            </div>

            <div className="admin-stats-grid">
                <div className="stat-card-premium glass-morphism stagger-1">
                    <div className="stat-card-info">
                        <div className="stat-card-label">Tổng doanh thu</div>
                        <div className="stat-card-value tabular-nums">{formatVND(stats?.totalRevenue || 0)}</div>
                        <div className="stat-card-trend positive">
                             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                             <span>+12.5%</span>
                        </div>
                    </div>
                    <div className="stat-card-icon-wrap blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                </div>

                <div className="stat-card-premium glass-morphism stagger-2">
                    <div className="stat-card-info">
                        <div className="stat-card-label">Đơn hàng mới</div>
                        <div className="stat-card-value tabular-nums">{stats?.totalOrders || 0}</div>
                        <div className="stat-card-trend positive">
                             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                             <span>+8.2%</span>
                        </div>
                    </div>
                    <div className="stat-card-icon-wrap green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    </div>
                </div>

                <div className="stat-card-premium glass-morphism stagger-3">
                    <div className="stat-card-info">
                        <div className="stat-card-label">Khách hàng</div>
                        <div className="stat-card-value tabular-nums">{stats?.totalUsers || 0}</div>
                        <div className="stat-card-trend positive">
                             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                             <span>+5.1%</span>
                        </div>
                    </div>
                    <div className="stat-card-icon-wrap purple">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                </div>

                <div className="stat-card-premium glass-morphism stagger-4">
                    <div className="stat-card-info">
                        <div className="stat-card-label">Giá trị TB</div>
                        <div className="stat-card-value tabular-nums">{formatVND(stats?.avgOrderValue || 0)}</div>
                        <div className="stat-card-trend negative">
                             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
                             <span>-2.4%</span>
                        </div>
                    </div>
                    <div className="stat-card-icon-wrap orange">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    </div>
                </div>
            </div>

            <div className="dashboard-main-grid">
                <div className="analytics-card">
                    <div className="card-header">
                        <h3>Hiệu suất doanh thu thực tế (12 tháng)</h3>
                        <div className="actions">
                            <select
                                className="filter-select-mini"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>Năm {year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="chart-container">
                        {revenueChart.map((data, idx) => (
                            <div key={idx} className="chart-bar-group">
                                <div className="bar-wrapper">
                                    <div
                                        className="bar-main"
                                        style={{ height: `${data.value}%` }}
                                        data-value={formatVND(data.revenue)}
                                    ></div>
                                </div>
                                <span className="bar-label">{data.month}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="chart-legend" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(to top, #6366f1, #818cf8)' }}></span>
                            Doanh thu thực tế (VND)
                        </div>
                    </div>
                </div>

                <div className="side-column">
                    <div className="analytics-card">
                        <div className="card-header">
                            <h3>Nhật ký hệ thống</h3>
                            <button className="view-all-btn" onClick={() => setIsActivityModalOpen(true)}>Xem tất cả</button>
                        </div>
                        <div className="activity-list">
                            {activities.length > 0 ? activities.slice(0, 3).map((act, idx) => (
                                <div key={idx} className="activity-item">
                                    <div className={`activity-dot ${act.type || 'system'}`}></div>
                                    <div className="activity-info">
                                        <p className="activity-text">{act.content}</p>
                                        <div className="activity-meta-bottom">
                                            <span className="actor">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                {act.userRole ? `${act.userRole.replace('ROLE_', '')} • ` : ''}
                                                {act.username || 'Hệ thống'}
                                            </span>
                                            <span className="divider">•</span>
                                            <span className="time">{formatTimeAgo(act.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Chưa có hoạt động nào</div>
                            )}
                        </div>
                        <button className="view-all-btn" 
                            onClick={() => setIsActivityModalOpen(true)}
                            style={{
                                width: '100%',
                                marginTop: '1.5rem',
                                padding: '0.75rem',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                color: '#4f46e5',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                            }}>
                            Xem tất cả nhật ký
                        </button>
                    </div>

                    <div className="system-status-card">
                        <div className="card-header">
                            <h3>Trạng thái hệ thống</h3>
                            <span className="status-badge" style={{ 
                                padding: '4px 10px', 
                                background: systemStatus.serverStatus === 'STABLE' ? '#dcfce7' : '#fee2e2', 
                                color: systemStatus.serverStatus === 'STABLE' ? '#166534' : '#991b1b', 
                                borderRadius: '20px', 
                                fontSize: '0.7rem', 
                                fontWeight: '700' 
                            }}>
                                {systemStatus.serverStatus || 'OFFLINE'}
                            </span>
                        </div>
                        <div className="status-grid">
                            <div className="status-item">
                                <span className="label">Cơ sở dữ liệu</span>
                                <span className="value" style={{ color: '#10b981' }}>{systemStatus.database || '…'}</span>
                            </div>
                            <div className="status-item">
                                <span className="label">Uptime API</span>
                                <span className="value">{systemStatus.apiUptime || '…'}</span>
                            </div>
                            <div className="status-item">
                                <span className="label">Bộ nhớ tạm</span>
                                <span className="value">Xóa OK</span>
                            </div>
                            <div className="status-item">
                                <span className="label">Sao lưu gần nhất</span>
                                <span className="value" style={{ fontSize: '0.65rem' }}>{systemStatus.lastBackup || '…'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ActivityLogModal 
                isOpen={isActivityModalOpen} 
                onClose={() => setIsActivityModalOpen(false)} 
                activities={activities}
            />
        </div>
    );
};

export default AdminDashboard;
