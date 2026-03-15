import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './ManageBooks.css';
import StatusModal from '../../components/Staff/StatusModal';
import OrderDetailModal from '../../components/Staff/OrderDetailModal';

const StaffOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    
    const [statusData, setStatusData] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
    });

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('staff/orders');
            const rawData = res.data;
            let ordersArray = [];

            if (Array.isArray(rawData)) {
                ordersArray = rawData;
            } else if (rawData && Array.isArray(rawData.content)) {
                ordersArray = rawData.content;
            }
            
            // Sắp xếp đơn hàng mới nhất lên đầu (nếu có id)
            const sortedOrders = ordersArray.sort((a, b) => (b.id || 0) - (a.id || 0));
            setOrders(sortedOrders);
        } catch (err) {
            console.error("Lỗi khi tải đơn hàng:", err);
            showStatus('error', 'Lỗi hệ thống', 'Không thể kết nối với máy chủ để tải danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const showStatus = (type, title, message) => {
        setStatusData({
            isOpen: true,
            type,
            title,
            message,
        });
    };

    const closeStatus = () => {
        setStatusData(prev => ({ ...prev, isOpen: false }));
    };

    const handleOpenDetail = (order) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setSelectedOrder(null);
        setIsDetailOpen(false);
    };

    const onUpdateSuccess = (orderId, newStatus) => {
        // Cập nhật lại list đơn hàng cục bộ để tránh fetch lại toàn bộ nếu muốn tối ưu,
        // nhưng fetch lại sẽ đảm bảo data chính xác nhất.
        fetchOrders();
        // Cập nhật luôn thông tin trong modal đang mở
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const getStatusStyles = (status) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'PENDING':
                return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Chờ duyệt' };
            case 'SHIPPING':
                return { background: 'rgba(30, 64, 175, 0.1)', color: '#1e40af', label: 'Đang giao' };
            case 'COMPLETED':
                return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Hoàn tất' };
            case 'CANCELLED':
                return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Đã hủy' };
            default:
                return { background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', label: status };
        }
    };

    const pendingCount = orders.filter(o => o.status === 'PENDING').length;

    return (
        <div className="staff-page-content fade-in">
            <header className="manage-header-premium">
                <div className="header-text">
                    <h1>Xử lý đơn hàng</h1>
                    <p>Theo dõi và cập nhật trạng thái vận chuyển cho các giao dịch mới.</p>
                </div>
                <div className="orders-stats-mini">
                    <div className="mini-stat">
                        <span className="label">Chờ duyệt</span>
                        <span className="val" style={{color: '#f59e0b'}}>{pendingCount}</span>
                    </div>
                </div>
            </header>

            <div className="books-table-wrapper-premium">
                {loading ? (
                    <div className="loading-state">
                        <div className="shimmer-row"></div>
                        <div className="shimmer-row"></div>
                        <div className="shimmer-row"></div>
                    </div>
                ) : (
                    <div className="books-grid-premium">
                        <div className="grid-header-premium" style={{gridTemplateColumns: '120px 1.5fr 1.2fr 1fr 1fr 1fr 100px'}}>
                            <div>Mã đơn</div>
                            <div>Khách hàng</div>
                            <div>Ngày đặt</div>
                            <div>Tổng tiền</div>
                            <div>Trạng thái</div>
                            <div>Nhân viên</div>
                            <div className="col-actions">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{marginRight: '6px', opacity: 0.8}}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                Xem Chi Tiết
                            </div>
                        </div>
                        {orders.length > 0 ? orders.map((order, index) => {
                            const styles = getStatusStyles(order.status);
                            return (
                                <div key={order.id} className={`book-row-premium stagger-${(index % 5) + 1}`} style={{gridTemplateColumns: '120px 1.5fr 1.2fr 1fr 1fr 1fr 100px'}}>
                                    <div style={{color: '#3b82f6', fontWeight: 800}}>#{order.id}</div>
                                    <div className="book-title">{order.receiverName || 'Khách vãng lai'}</div>
                                    <div className="book-author">{formatDate(order.orderDate)}</div>
                                    <div className="price-text" style={{fontVariantNumeric: 'tabular-nums'}}>{formatCurrency(order.totalPrice)}</div>
                                    <div>
                                        <span className={`badge-premium`} style={{
                                            background: styles.background,
                                            color: styles.color
                                        }}>
                                            {styles.label}
                                        </span>
                                    </div>
                                    <div className="book-author">
                                        {order.processedBy ? (order.processedBy.fullName || order.processedBy.username) : 'Chưa xử lý'}
                                    </div>
                                    <div className="col-actions">
                                        <div className="actions-wrap">
                                            <button 
                                                className="action-btn edit" 
                                                title="Xem Chi Tiết & Xử Lý"
                                                aria-label="Xem chi tiết đơn hàng"
                                                onClick={() => handleOpenDetail(order)}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="empty-state-premium">
                                <p>Hiện chưa có đơn hàng nào cần xử lý.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="empty-state-premium" style={{marginTop: '40px', background: 'rgba(30, 41, 59, 0.03)', borderRadius: '24px'}}>
                <p>Mẹo: Nhấn vào biểu tượng "Con Mắt" để xem chi tiết danh sách sách khách hàng đã mua và cập nhật tiến độ giao hàng…</p>
            </div>

            {isDetailOpen && (
                <OrderDetailModal 
                    order={selectedOrder}
                    onClose={handleCloseDetail}
                    onUpdateSuccess={onUpdateSuccess}
                    showStatus={showStatus}
                />
            )}

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

export default StaffOrders;
