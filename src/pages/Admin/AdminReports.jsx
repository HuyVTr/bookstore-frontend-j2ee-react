import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ExportReportModal from '../../components/Admin/ExportReportModal';
import './AdminDashboard.css';

const AdminReports = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRevenue: 0, averagePerOrder: 0, growthRate: 0 });
    const [categoryRevenue, setCategoryRevenue] = useState([]);
    const [paymentDistribution, setPaymentDistribution] = useState([]);
    const [topSpenders, setTopSpenders] = useState([]);
    const [platformStats, setPlatformStats] = useState([]);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [exportStatus, setExportStatus] = useState({ show: false, success: true, message: '' });

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const categoryColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#94a3b8', '#8b5cf6', '#06b6d4'];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, categoryRes, paymentRes, userRes, spendersRes, platformRes] = await Promise.all([
                api.get('admin/reports/revenue/stats'),
                api.get('admin/reports/revenue/by-category'),
                api.get('admin/reports/revenue/by-payment'),
                api.get('profile').catch(() => null),
                api.get('admin/reports/top-spenders').catch(() => ({ data: [] })),
                api.get('admin/reports/platform-stats').catch(() => ({ data: [] }))
            ]);

            setStats(statsRes.data);
            setCategoryRevenue(categoryRes.data || []);
            setPaymentDistribution(paymentRes.data || []);
            setTopSpenders(spendersRes.data || []);
            setPlatformStats(platformRes.data || []);
            if (userRes) setUser(userRes.data);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu báo cáo:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExport = async (config) => {
        try {
            // Explicitly map config to ensure the backend receives exactly what's needed
            const requestData = {
                reportType: config.reportType,
                format: config.format,
                limit: config.limit,
                sortBy: config.sortBy,
                sortDirection: config.sortDirection,
                selectedColumns: config.selectedColumns,
                // Add requester metadata
                requesterId: user?.id || localStorage.getItem('userId'),
                requesterName: user?.fullName || localStorage.getItem('fullName'),
                requesterUsername: user?.username || localStorage.getItem('username')
            };

            const response = await api.post('admin/reports/export', requestData, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = config.format === 'PDF' ? 'pdf' : 'xlsx';
            link.setAttribute('download', `bao_cao_${config.reportType.toLowerCase()}_${Date.now()}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setIsExportModalOpen(false);
            setExportStatus({ show: true, success: true, message: 'Xuất báo cáo thành công!' });
            setTimeout(() => setExportStatus({ show: false, success: true, message: '' }), 5000);
        } catch (error) {
            console.error("Lỗi khi kết nối hoặc xuất báo cáo:", error);
            
            // Special handling for IDM interception or Network Errors during file downloads
            const isPdf = config.format === 'PDF';
            // IDM often causes error.message to be "Network Error" or results in an undefined response
            const isNetworkError = error.message === 'Network Error' || !error.response;
            const isIdmInterception = isNetworkError && (isPdf || config.format === 'XLSX');
            
            if (isIdmInterception) {
                setExportStatus({ 
                    show: true, 
                    success: true, 
                    message: 'Yêu cầu đã được gửi. Nếu bạn dùng IDM, hãy kiểm tra cửa sổ tải về của IDM.' 
                });
            } else {
                setExportStatus({ 
                    show: true, 
                    success: false, 
                    message: 'Lỗi: ' + (error.response?.data?.message || 'Không thể xuất báo cáo. Vui lòng kiểm tra lại server.') 
                });
            }
            setTimeout(() => setExportStatus({ show: false, success: false, message: '' }), 8000);
        }
    };

    if (loading) return <div className="admin-page-content"><p>Đang tải dữ liệu báo cáo…</p></div>;

    const totalRevenue = stats.totalRevenue || 0;

    return (
        <div className="admin-page-content fade-in">
            <header className="manage-header">
                <div>
                    <h1>Báo cáo doanh thu 📊</h1>
                    <p>Phân tích chi tiết nguồn thu nhập và hiệu quả kinh doanh theo danh mục.</p>
                </div>
                <div className="header-actions">
                    <button 
                        className="btn-export-premium" 
                        onClick={() => setIsExportModalOpen(true)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Xuất báo cáo dữ liệu
                    </button>
                </div>
            </header>

            {exportStatus.show && (
                <div className={`status-notification ${exportStatus.success ? 'success' : 'error'} fade-in`}>
                    <div className="status-icon">
                        {exportStatus.success ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        )}
                    </div>
                    <span>{exportStatus.message}</span>
                    <button className="status-close" onClick={() => setExportStatus({ ...exportStatus, show: false })}>&times;</button>
                </div>
            )}

            <div className="admin-stats-grid">
                <div className="stat-card-glass">
                    <div className="stat-content">
                        <h4>Doanh thu thuần</h4>
                        <span className="value">{formatVND(totalRevenue)}</span>
                    </div>
                </div>
                <div className="stat-card-glass">
                    <div className="stat-content">
                        <h4>Trung bình/Đơn</h4>
                        <span className="value">{formatVND(stats.averagePerOrder || 0)}</span>
                    </div>
                </div>
                <div className="stat-card-glass">
                    <div className="stat-content">
                        <h4>Tăng trưởng</h4>
                        <span className="value" style={{ color: stats.growthRate >= 0 ? '#10b981' : '#ef4444' }}>
                            {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate?.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="analytics-dual-grid">
                <div className="analytics-card premium-shadow">
                    <div className="card-header">
                        <div className="header-with-icon">
                            <div className="icon-box blue-soft">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                            </div>
                            <h3>Cơ cấu doanh thu theo danh mục</h3>
                        </div>
                    </div>
                    <div className="category-report-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {categoryRevenue.length > 0 ? categoryRevenue.map((item, idx) => {
                            const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
                            const color = categoryColors[idx % categoryColors.length];
                            return (
                                <div key={idx} className="category-row-premium">
                                    <div className="category-info-meta">
                                        <span className="cat-name">{item.categoryName}</span>
                                        <span className="cat-val">{formatVND(item.revenue)} <small>({percentage.toFixed(1)}%)</small></span>
                                    </div>
                                    <div className="cat-progress-bg">
                                        <div className="cat-progress-fill" 
                                             style={{ width: `${percentage}%`, background: color, boxShadow: `0 2px 8px ${color}44` }}>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : <p className="empty-msg">Chưa có dữ liệu danh mục.</p>}
                    </div>
                </div>

                <div className="analytics-card premium-shadow">
                    <div className="card-header">
                        <div className="header-with-icon">
                            <div className="icon-box green-soft">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                            </div>
                            <h3>Phương thức thanh toán</h3>
                        </div>
                    </div>
                    <div className="payment-distribution-premium">
                        {paymentDistribution.length > 0 ? paymentDistribution.map((item, idx) => (
                            <div key={idx} className="payment-method-card">
                                <div className="pm-indicator" style={{ background: categoryColors[idx % categoryColors.length] }}></div>
                                <div className="pm-details">
                                    <span className="pm-name">{item.method || 'Khác'}</span>
                                    <span className="pm-percent">{item.percentage.toFixed(0)}%</span>
                                </div>
                                <div className="pm-count-badge">
                                    {item.orderCount} đơn
                                </div>
                            </div>
                        )) : <p className="empty-msg">Chưa có dữ liệu thanh toán.</p>}
                    </div>
                </div>
            </div>

            <div className="analytics-dual-grid" style={{ marginTop: '2rem' }}>
                <div className="analytics-card premium-shadow">
                    <div className="card-header">
                        <div className="header-with-icon">
                            <div className="icon-box orange-soft">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <h3>Top khách hàng chi tiêu</h3>
                        </div>
                    </div>
                    <div className="top-spenders-list">
                        {topSpenders.length > 0 ? topSpenders.map((item, idx) => (
                            <div key={idx} className="spender-row">
                                <div className="spender-avatar">{item.user.fullName?.charAt(0) || 'U'}</div>
                                <div className="spender-info">
                                    <span className="spender-name">{item.user.fullName || item.user.username}</span>
                                    <span className="spender-email">{item.user.email}</span>
                                </div>
                                <div className="spender-total">
                                    {formatVND(item.totalSpent)}
                                </div>
                            </div>
                        )) : <p className="empty-msg">Đang cập nhật dữ liệu khách hàng…</p>}
                    </div>
                </div>

                <div className="analytics-card premium-shadow">
                    <div className="card-header">
                        <div className="header-with-icon">
                            <div className="icon-box purple-soft">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            </div>
                            <h3>Phân bổ nguồn người dùng</h3>
                        </div>
                    </div>
                    <div className="platform-stats-grid">
                        {platformStats.length > 0 ? platformStats.map((item, idx) => (
                            <div key={idx} className="platform-stat-card">
                                <span className="platform-label">{item.provider}</span>
                                <span className="platform-count">{item.count} <small>thành viên</small></span>
                            </div>
                        )) : <p className="empty-msg">Chưa có dữ liệu nguồn.</p>}
                    </div>
                </div>
            </div>

            <style>{`
                .analytics-dual-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; margin-top: 2rem; }
                .premium-shadow { box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; }
                .header-with-icon { display: flex; align-items: center; gap: 12px; }
                .icon-box { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .blue-soft { background: #eff6ff; color: #3b82f6; }
                .green-soft { background: #f0fdf4; color: #10b981; }
                .orange-soft { background: #fff7ed; color: #f59e0b; }
                .purple-soft { background: #f5f3ff; color: #8b5cf6; }
                
                .category-row-premium { display: flex; flex-direction: column; gap: 8px; }
                .category-info-meta { display: flex; justify-content: space-between; align-items: flex-end; }
                .cat-name { font-weight: 600; color: #1e293b; font-size: 0.95rem; }
                .cat-val { color: #64748b; font-size: 0.85rem; font-weight: 500; }
                .cat-val small { color: #94a3b8; margin-left: 4px; }
                .cat-progress-bg { height: 8px; width: 100%; background: #f1f5f9; border-radius: 100px; overflow: hidden; }
                .cat-progress-fill { height: 100%; border-radius: 100px; transition: width 1s cubic-bezier(0.16, 1, 0.3, 1); }

                .payment-distribution-premium { display: flex; flex-direction: column; gap: 12px; }
                .payment-method-card { display: flex; align-items: center; gap: 15px; padding: 14px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; transition: 0.2s; }
                .payment-method-card:hover { border-color: #e2e8f0; transform: translateX(4px); background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
                .pm-indicator { width: 6px; height: 30px; border-radius: 10px; flex-shrink: 0; }
                .pm-details { flex: 1; display: flex; flex-direction: column; }
                .pm-name { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
                .pm-percent { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-top: -2px; }
                .pm-count-badge { padding: 4px 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 80px; font-size: 0.75rem; color: #64748b; font-weight: 600; }

                .top-spenders-list { display: flex; flex-direction: column; gap: 1rem; }
                .spender-row { display: flex; align-items: center; gap: 1rem; padding: 12px; border-radius: 12px; background: #f8fafc; border: 1px solid #f1f5f9; }
                .spender-avatar { width: 40px; height: 40px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
                .spender-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
                .spender-name { font-weight: 600; color: #1e293b; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .spender-email { font-size: 0.75rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .spender-total { font-weight: 700; color: #10b981; font-size: 0.95rem; flex-shrink: 0; }

                .platform-stats-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
                .platform-stat-card { padding: 15px; background: white; border: 1px solid #f1f5f9; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .platform-label { font-weight: 700; color: #475569; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px; }
                .platform-count { font-weight: 800; color: #1e293b; font-size: 1.2rem; }
                .platform-count small { font-size: 0.7rem; color: #94a3b8; font-weight: 500; }
                .empty-msg { color: #94a3b8; font-style: italic; }

                @media (max-width: 900px) {
                    .analytics-dual-grid { grid-template-columns: 1fr; gap: 1.5rem; }
                }

                @media (max-width: 480px) {
                    .manage-header { text-align: center; align-items: center; }
                    .header-actions { width: 100%; display: flex; justify-content: center; }
                    .btn-export-premium { width: 100%; justify-content: center; }
                    .analytics-card { padding: 1.25rem; }
                    .spender-row { padding: 10px; gap: 0.75rem; }
                    .spender-total { font-size: 0.85rem; }
                    .cat-name { font-size: 0.85rem; }
                    .cat-val { font-size: 0.8rem; }
                    .pm-name { font-size: 0.85rem; }
                    .pm-percent { font-size: 1rem; }
                }
            `}</style>

            <ExportReportModal 
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExport}
            />
        </div>
    );
};

export default AdminReports;
