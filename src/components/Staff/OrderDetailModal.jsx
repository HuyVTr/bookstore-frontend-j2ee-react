import React, { useState } from 'react';
import api from '../../services/api';
import './OrderDetailModal.css';

const OrderDetailModal = ({ order, onClose, onUpdateSuccess, showStatus }) => {
    const [updating, setUpdating] = useState(false);

    if (!order) return null;

    const statusWeights = {
        'PENDING': 0,
        'SHIPPING': 1,
        'COMPLETED': 2,
        'CANCELLED': 3
    };

    const statusMap = {
        'PENDING': { label: 'Chờ duyệt', icon: '🕒' },
        'SHIPPING': { label: 'Đang giao', icon: '🚚' },
        'COMPLETED': { label: 'Hoàn tất', icon: '✅' },
        'CANCELLED': { label: 'Đã hủy', icon: '❌' }
    };

    const currentWeight = statusWeights[order.status?.toUpperCase()] || 0;

    const handleUpdateStatus = async (newStatus) => {
        if (updating) return;

        // Logic: Không thể chuyển ngược trạng thái
        const newWeight = statusWeights[newStatus.toUpperCase()];
        if (newWeight < currentWeight) {
            if (showStatus) {
                showStatus('error', 'Thao tác không hợp lệ', 'Không thể chuyển ngược về trạng thái trước đó.');
            } else {
                alert('Không thể chuyển ngược về trạng thái trước đó.');
            }
            return;
        }

        setUpdating(true);
        try {
            await api.post(`staff/orders/${order.id}/status?status=${newStatus}`);
            if (showStatus) {
                const statusLabel = statusMap[newStatus.toUpperCase()]?.label || newStatus;
                showStatus('success', 'Thành công', `Đơn hàng #${order.id} đã chuyển sang trạng thái: ${statusLabel}`);
            }
            onUpdateSuccess(order.id, newStatus);

        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            const errorMessage = error.response?.data || 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.';
            if (showStatus) {
                showStatus('error', 'Thất bại', errorMessage);
            } else {
                alert(errorMessage);
            }
        } finally {
            setUpdating(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getBookImg = (path) => {
        if (!path) return 'https://via.placeholder.com/60x80?text=No+Cover';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/images/')) return `http://localhost:8080${path}`;
        return `http://localhost:8080/images/${path.split('/').pop()}`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="order-detail-modal" onClick={e => e.stopPropagation()}>
                <button className="order-modal-close" onClick={onClose} aria-label="Đóng chi tiết đơn hàng">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <aside className="order-sidebar">
                    <div className="order-brand">
                        <span className="brand-badge">Premium System</span>
                        <h2>Chi tiết Đơn hàng</h2>
                        <span style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 800 }}>#{order.id}</span>
                    </div>

                    <div className="order-info-mobile-wrapper">
                        <div className="customer-info-card">
                            <div className="info-item">
                                <span className="label">Người nhận</span>
                                <span className="value">{order.receiverName}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Số điện thoại</span>
                                <span className="value">{order.phoneNumber}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Địa chỉ giao hàng</span>
                                <span className="value">{order.shippingAddress}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Phương thức</span>
                                <span className="value">{order.paymentMethod || 'Thanh toán khi nhận hàng'}</span>
                            </div>
                            {order.note && (
                                <div className="info-item">
                                    <span className="label">Ghi chú</span>
                                    <span className="value" style={{ fontStyle: 'italic', color: '#64748b' }}>{order.note}</span>
                                </div>
                            )}
                        </div>

                    </div>
                </aside>

                <main className="order-main-content">
                    <div className="order-content-scroll">
                        <div className="info-item order-time-meta" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                            <span className="label">Thời gian đặt</span>
                            <span className="value">{formatDate(order.orderDate)}</span>
                        </div>

                        <section className="status-management">
                            <h3 className="section-title">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                Lộ trình xử lý
                            </h3>

                            <div className="status-steps">
                                {['PENDING', 'SHIPPING', 'COMPLETED'].map((step, idx) => {
                                    const weight = statusWeights[step];
                                    const isCompleted = currentWeight > weight || order.status === 'COMPLETED';
                                    const isActive = order.status === step;

                                    return (
                                        <div key={step} className={`step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                            <div className="step-circle">
                                                {isCompleted ? '✓' : idx + 1}
                                            </div>
                                            <span className="step-label">{statusMap[step].label}</span>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="status-actions-panel">
                                {Object.keys(statusMap).map(statusKey => {
                                    const weight = statusWeights[statusKey];
                                    const isCurrent = order.status === statusKey;
                                    const isBackward = weight <= currentWeight && !isCurrent;
                                    const isTerminal = order.status === 'COMPLETED' || order.status === 'CANCELLED';

                                    return (
                                        <button
                                            key={statusKey}
                                            className={`status-btn-option ${isCurrent ? 'current' : ''}`}
                                            onClick={() => handleUpdateStatus(statusKey)}
                                            disabled={updating || isCurrent || (isBackward && statusKey !== 'CANCELLED') || isTerminal}
                                        >
                                            <span style={{ fontSize: '1rem' }}>{statusMap[statusKey].icon}</span>
                                            {statusMap[statusKey].label}
                                        </button>
                                    )
                                })}
                            </div>
                        </section>

                        <section className="order-items-list">
                            <h3 className="section-title">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                Danh sách tác phẩm
                            </h3>

                            <table className="order-items-table">
                                <thead>
                                    <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <th className="col-book" style={{ paddingBottom: '12px' }}>Tên sách</th>
                                        <th className="col-price" style={{ paddingBottom: '12px' }}>Đơn giá</th>
                                        <th className="col-qty" style={{ paddingBottom: '12px', textAlign: 'center' }}>SL</th>
                                        <th className="col-total" style={{ paddingBottom: '12px', textAlign: 'right' }}>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.orderDetails?.map((item, idx) => (
                                        <tr key={idx} className="item-row">
                                            <td className="item-td col-book">
                                                <div className="item-book">
                                                    <img
                                                        src={getBookImg(item.book?.imagePath)}
                                                        alt={item.book?.title}
                                                        className="item-img"
                                                        width="50"
                                                        height="70"
                                                        loading="lazy"
                                                    />
                                                    <div className="item-info-text">
                                                        <span className="item-name">{item.book?.title}</span>
                                                        <span className="item-meta">Tác giả: {item.book?.author || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="item-td col-price" style={{ fontWeight: 700, color: '#475569', fontVariantNumeric: 'tabular-nums' }}>
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="item-td col-qty" style={{ textAlign: 'center', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                                                x{item.quantity}
                                            </td>
                                            <td className="item-td col-total" style={{ textAlign: 'right', fontWeight: 900, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                                                {formatCurrency(item.price * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    </div>

                    <footer className="order-summary-footer">
                        <div className="total-label">TỔNG GIÁ TRỊ ĐƠN HÀNG</div>
                        <div className="total-value">{formatCurrency(order.totalPrice)}</div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default OrderDetailModal;
