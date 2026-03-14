import React from 'react';
import './OrderDetailModal.css';

const OrderDetailModal = ({ isOpen, order, onClose, onExportInvoice }) => {
    if (!isOpen || !order) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const steps = [
        { status: 'PENDING', label: 'Chờ xác nhận', icon: '🕒' },
        { status: 'SHIPPING', label: 'Đang giao hàng', icon: '🚚' },
        { status: 'COMPLETED', label: 'Hoàn thành', icon: '✅' }
    ];

    const getCurrentStepIndex = () => {
        if (order.status === 'CANCELLED') return -1;
        return steps.findIndex(step => step.status === order.status);
    };

    const currentStepIdx = getCurrentStepIndex();

    return (
        <div className="order-detail-overlay">
            <div className="order-detail-content scaleUp">
                <button className="close-modal-btn" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="modal-header-premium">
                    <div className="order-badge">ĐƠN HÀNG #LH{order.id.toString().padStart(4, '0')}</div>
                    <h2 style={{ textWrap: 'balance' }}>Chi tiết hành trình</h2>
                    <p>Cập nhật trạng thái và thông tin đơn hàng của bạn</p>
                </div>

                <div className="status-timeline-container">
                    {order.status === 'CANCELLED' ? (
                        <div className="cancelled-status-bar">
                            <span className="icon">❌</span>
                            <div className="text">
                                <strong>Đã hủy đơn hàng</strong>
                                <p>Đơn hàng này không còn hiệu lực</p>
                            </div>
                        </div>
                    ) : (
                        <div className="timeline-stepper">
                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStepIdx;
                                const isActive = index === currentStepIdx;
                                return (
                                    <div key={step.status} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                        <div className="step-circle">
                                            {isCompleted && !isActive ? '✓' : step.icon}
                                        </div>
                                        <div className="step-label">{step.label}</div>
                                        {index < steps.length - 1 && <div className="step-line"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="modal-body-scroll">
                    <div className="info-grid-premium">
                        <div className="info-card-luxury">
                            <h3><span className="icon">👤</span> Thông tin khách hàng</h3>
                            <div className="data-row"><span>Người đặt:</span> <strong>{order.senderName || order.user?.username || 'N/A'}</strong></div>
                            <div className="data-row"><span>Người nhận:</span> <strong>{order.receiverName}</strong></div>
                            <div className="data-row"><span>Số điện thoại:</span> <strong>{order.phoneNumber}</strong></div>
                        </div>
                        <div className="info-card-luxury">
                            <h3><span className="icon">📍</span> Giao nhận & Thanh toán</h3>
                            <div className="data-row"><span>Địa chỉ:</span> <strong>{order.shippingAddress}</strong></div>
                            <div className="data-row"><span>Thanh toán:</span> <strong className="method">{order.paymentMethod}</strong></div>
                            {order.note && (
                                <div className="data-row note-row"><span>Ghi chú:</span> <strong>{order.note}</strong></div>
                            )}
                        </div>
                    </div>

                    <div className="order-items-table-luxury">
                        <h3>Sản phẩm đã chọn</h3>
                        <div className="items-list-premium">
                            {order.orderDetails?.map((detail, idx) => (
                                <div key={idx} className="item-row-detail">
                                    <div className="item-img">
                                        <img 
                                            src={`http://localhost:8080/images/${detail.book?.imagePath?.split('/').pop()}`} 
                                            alt={detail.book?.title || "Sách"} 
                                            width="50"
                                            height="75"
                                        />
                                    </div>
                                    <div className="item-txt">
                                        <h4>{detail.book?.title}</h4>
                                        <p>{formatCurrency(detail.price)} x {detail.quantity}</p>
                                    </div>
                                    <div className="item-total">
                                        {formatCurrency(detail.price * detail.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="order-summary-footer">
                        <div className="summary-row"><span>Tạm tính:</span> <span>{formatCurrency(order.totalPrice)}</span></div>
                        <div className="summary-row"><span>Phí vận chuyển:</span> <span className="free">Miễn phí</span></div>
                        <div className="summary-row total"><span>Tổng thanh toán:</span> <span className="total-val">{formatCurrency(order.totalPrice)}</span></div>
                    </div>
                </div>

                <div className="modal-actions-premium">
                    {order.status === 'COMPLETED' && (
                        <button className="btn-export-alt" onClick={onExportInvoice}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Xuất hóa đơn
                        </button>
                    )}
                    <button className="btn-close-alt" onClick={onClose}>Đóng lại</button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
