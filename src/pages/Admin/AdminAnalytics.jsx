import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState([]);
    const [topBooks, setTopBooks] = useState([]);

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [monthlyRes, topBooksRes] = await Promise.all([
                api.get('admin/reports/analytics/monthly'),
                api.get('admin/reports/analytics/top-books')
            ]);
            setMonthlyData(monthlyRes.data);
            setTopBooks(topBooksRes.data);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu phân tích:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1000000);
    const maxSold = Math.max(...monthlyData.map(d => d.booksSold), 10);

    const getMonthName = (m) => `Tháng ${m}`;

    if (loading) return <div className="admin-page-content"><p>Đang phân tích dữ liệu…</p></div>;

    return (
        <div className="admin-page-content fade-in">
            <header className="manage-header">
                <div>
                    <h1>Phân tích chuyên sâu 📈</h1>
                    <p>Theo dõi xu hướng doanh thu và hiệu suất sản phẩm theo thời gian thực.</p>
                </div>
                <button className="btn-export-premium" onClick={fetchData}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    Làm mới
                </button>
            </header>

            <div className="analytics-main-layout">
                {/* 1. Revenue Trend - Premium Line Chart */}
                <div className="analytics-card wide premium-shadow">
                    <div className="card-header">
                        <div className="header-with-icon">
                            <div className="icon-box blue-soft">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
                            </div>
                            <h3>Xu hướng doanh thu 2024</h3>
                        </div>
                        <span className="badge-premium-pill">Biểu đồ đường</span>
                    </div>
                    
                    <div className="premium-chart-container">
                        <div className="chart-y-axis">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="y-label">
                                    {formatVND(maxRevenue * (4-i)/4)}
                                </div>
                            ))}
                        </div>
                        <div className="chart-main-area">
                            {/* Grid Lines */}
                            <div className="chart-grid-lines">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="grid-line"></div>
                                ))}
                            </div>
                            
                            <div className="chart-bars-layer">
                                {monthlyData.map((d, i) => {
                                    const height = (d.revenue / maxRevenue) * 100;
                                    return (
                                        <div key={i} className="chart-col">
                                            <div className="bar-interactive revenue" 
                                                 style={{ height: `${height || 2}%` }}>
                                                <div className="bar-glow"></div>
                                                <div className="premium-tooltip">
                                                    <span className="tooltip-month">Tháng {d.month}</span>
                                                    <span className="tooltip-value">{formatVND(d.revenue)}</span>
                                                </div>
                                            </div>
                                            <span className="col-label">T{d.month}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="analytics-dual-grid">
                    {/* 2. Top Products Ranking */}
                    <div className="analytics-card premium-shadow">
                        <div className="card-header">
                            <div className="header-with-icon">
                                <div className="icon-box orange-soft">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                                </div>
                                <h3>Sản phẩm bán chạy nhất</h3>
                            </div>
                        </div>
                        <div className="ranking-list">
                            {topBooks.map((item, idx) => (
                                <div key={idx} className="ranking-item">
                                    <div className={`rank-badge rank-${idx + 1}`}>{idx + 1}</div>
                                    <div className="rank-content">
                                        <div className="rank-main-info">
                                            <span className="book-name-rank">{item.book.title}</span>
                                            <span className="book-cat-rank">{item.book.category?.name || 'Chưa phân loại'}</span>
                                        </div>
                                        <div className="rank-stat-info">
                                            <span className="sold-count-rank">{item.totalSold} bản</span>
                                            <span className="rev-count-rank">{formatVND(item.totalSold * item.book.price)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Sales Volume Trend */}
                    <div className="analytics-card premium-shadow">
                        <div className="card-header">
                            <div className="header-with-icon">
                                <div className="icon-box green-soft">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                </div>
                                <h3>Sản lượng sách bán được</h3>
                            </div>
                        </div>
                        <div className="mini-chart-container">
                            <div className="mini-chart-area">
                                {monthlyData.map((d, i) => {
                                    const height = (d.booksSold / maxSold) * 100;
                                    return (
                                        <div key={i} className="mini-bar-box">
                                            <div className="mini-bar-fill" 
                                                 style={{ height: `${height || 8}%` }}>
                                                <div className="premium-tooltip">
                                                    <span className="tooltip-value">{d.booksSold} cuốn</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mini-chart-labels">
                                <span>Tháng 1</span>
                                <span>Tháng {monthlyData.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .analytics-main-layout { margin-top: 2rem; display: flex; flex-direction: column; gap: 2rem; }
                .analytics-dual-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; }
                .premium-shadow { box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; }
                .analytics-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.1); }
                
                .header-with-icon { display: flex; align-items: center; gap: 12px; }
                .icon-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .blue-soft { background: #eff6ff; color: #3b82f6; }
                .orange-soft { background: #fff7ed; color: #f59e0b; }
                .green-soft { background: #f0fdf4; color: #10b981; }
                
                .badge-premium-pill { background: #f5f3ff; color: #7c3aed; padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

                /* Premium Chart */
                .premium-chart-container { display: flex; height: 320px; gap: 20px; margin-top: 1rem; position: relative; }
                .chart-y-axis { display: flex; flex-direction: column; justify-content: space-between; height: 250px; padding-bottom: 30px; font-size: 0.75rem; color: #94a3b8; text-align: right; width: 90px; }
                .chart-main-area { flex: 1; height: 250px; position: relative; border-left: 1px dashed #e2e8f0; border-bottom: 2px solid #e2e8f0; }
                .chart-grid-lines { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; z-index: 0; }
                .grid-line { height: 1px; width: 100%; border-top: 1px dashed #f1f5f9; }
                
                .chart-bars-layer { position: absolute; inset: 0; display: flex; align-items: flex-end; padding: 0 10px; z-index: 1; height: 100%; }
                .chart-col { flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 10px; position: relative; }
                .bar-interactive { width: 35%; background: linear-gradient(to top, #6366f1, #818cf8); border-radius: 6px 6px 0 0; position: relative; transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; }
                .bar-glow { position: absolute; inset: 0; background: linear-gradient(to top, rgba(255,255,255,0.2), transparent); opacity: 0; transition: 0.3s; }
                .bar-interactive:hover { filter: brightness(1.1); width: 40%; }
                .bar-interactive:hover .bar-glow { opacity: 1; }
                .col-label { font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: -30px; }

                /* Tooltip */
                .premium-tooltip { 
                    position: absolute; top: -50px; left: 50%; transform: translateX(-50%) translateY(10px);
                    background: #1e293b; color: white; padding: 8px 12px; border-radius: 8px;
                    font-size: 0.8rem; opacity: 0; visibility: hidden; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none; white-space: nowrap; z-index: 100; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);
                }
                .tooltip-month { display: block; font-size: 0.7rem; color: #94a3b8; font-weight: 500; }
                .tooltip-value { font-weight: 700; color: #fff; font-size: 0.95rem; }
                .bar-interactive:hover .premium-tooltip, .mini-bar-box:hover .premium-tooltip { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }

                /* Ranking List */
                .ranking-list { display: flex; flex-direction: column; gap: 1rem; }
                .ranking-item { display: flex; align-items: center; gap: 1rem; padding: 12px; border-radius: 12px; transition: 0.2s; border: 1px solid transparent; }
                .ranking-item:hover { background: #f8fafc; border-color: #f1f5f9; }
                .rank-badge { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; flex-shrink: 0; }
                .rank-1 { background: #fef3c7; color: #d97706; }
                .rank-2 { background: #f1f5f9; color: #475569; }
                .rank-3 { background: #ffedd5; color: #c2410c; }
                .rank-content { flex: 1; display: flex; justify-content: space-between; align-items: center; }
                .rank-main-info { display: flex; flex-direction: column; gap: 2px; }
                .book-name-rank { font-weight: 600; color: #1e293b; font-size: 0.95rem; }
                .book-cat-rank { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
                .rank-stat-info { text-align: right; display: flex; flex-direction: column; }
                .sold-count-rank { color: #10b981; font-weight: 700; font-size: 0.85rem; }
                .rev-count-rank { color: #64748b; font-size: 0.75rem; font-weight: 500; }

                /* Mini Chart */
                .mini-chart-container { background: #f8fafc; padding: 20px; border-radius: 16px; margin-top: 1rem; }
                .mini-chart-area { display: flex; gap: 10px; align-items: flex-end; height: 180px; }
                .mini-bar-box { flex: 1; height: 100%; display: flex; align-items: flex-end; position: relative; }
                .mini-bar-fill { width: 100%; background: #10b981; border-radius: 4px; transition: 1s cubic-bezier(0.16, 1, 0.3, 1); cursor: crosshair; }
                .mini-bar-fill:hover { background: #059669; }
                .mini-chart-labels { display: flex; justify-content: space-between; margin-top: 15px; font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
            `}</style>
        </div>
    );
};

export default AdminAnalytics;
