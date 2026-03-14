import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import ReviewModal from '../../../components/ReviewModal/ReviewModal';
import ConfirmationModal from '../../../components/ConfirmationModal/ConfirmationModal';
import ExportInvoiceModal from '../../../components/ExportInvoiceModal/ExportInvoiceModal';
import StatusModal from '../../../components/StatusModal/StatusModal';
import OrderDetailModal from '../../../components/OrderDetailModal/OrderDetailModal';
import './OrderHistory.css';

const Icons = {
    Truck: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
    ),
    Phone: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
    ),
    CreditCard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
    ),
    Download: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
    ),
    FileText: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    ),
    XCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
    ),
    Eye: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    )
};

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewModalData, setReviewModalData] = useState({ isOpen: false, book: null });
    const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null, loading: false });
    const [exportModal, setExportModal] = useState({ isOpen: false, orderId: null });
    const [reviewedItems, setReviewedItems] = useState(new Set()); 
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
    const [detailModal, setDetailModal] = useState({ isOpen: false, order: null });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("UNAUTHORIZED");
                    setLoading(false);
                    return;
                }

                const res = await api.get('orders/history');
                const rawData = res.data;

                if (Array.isArray(rawData)) {
                    setOrders(rawData.sort((a, b) => b.id - a.id));
                } else if (rawData?.content && Array.isArray(rawData.content)) {
                    setOrders(rawData.content.sort((a, b) => b.id - a.id));
                } else {
                    setOrders([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải lịch sử đơn hàng:", error);
                setError(error.response?.status === 401 ? "UNAUTHORIZED" : "FETCH_ERROR");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleCancelOrder = async () => {
        const { orderId } = cancelModal;
        setCancelModal(prev => ({ ...prev, loading: true }));
        try {
            await api.post(`orders/${orderId}/cancel`);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
            setCancelModal({ isOpen: false, orderId: null, loading: false });
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Hủy đơn thành công',
                message: `Đơn hàng #LH${orderId.toString().padStart(4, '0')} đã được hủy theo yêu cầu của bạn.`
            });
        } catch (error) {
            setCancelModal(prev => ({ ...prev, loading: false }));
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Không thể hủy đơn',
                message: error.response?.data || "Có lỗi xảy ra khi thực hiện yêu cầu. Vui lòng thử lại sau."
            });
        }
    };

    const handleExportInvoiceAction = (format) => {
        const { orderId } = exportModal;
        const token = localStorage.getItem('token');
        let endpoint = `orders/${orderId}/invoice`;
        
        if (format === 'PDF') endpoint += '/pdf';
        else if (format === 'EXCEL') endpoint += '/excel';

        const url = `http://localhost:8080/api/${endpoint}?token=${token}`;
        window.open(url, '_blank');
        setExportModal({ isOpen: false, orderId: null });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusConfig = (status) => {
        const map = {
            'PENDING': { text: 'Đang xử lý', class: 'status-pending', icon: '🕒' },
            'SHIPPING': { text: 'Đang giao hàng', class: 'status-shipping', icon: '🚚' },
            'COMPLETED': { text: 'Đã hoàn thành', class: 'status-delivered', icon: '✅' },
            'CANCELLED': { text: 'Đã hủy bỏ', class: 'status-cancelled', icon: '❌' }
        };
        return map[status] || { text: status, class: '', icon: '📦' };
    };

    const getBookImg = (path) => {
        if (!path) return 'https://via.placeholder.com/150?text=Book';
        if (path.startsWith('http')) return path;
        const fileName = path.split('/').pop();
        return `http://localhost:8080/images/${fileName}`;
    };

    if (loading) return (
        <div className="orders-page-container">
            <div className="orders-header fade-up">
                <h1 className="text-pretty" style={{ textWrap: 'balance' }}>Lịch Sử Đơn Hàng</h1>
                <p>Đang chuẩn bị danh sách hành trình của bạn…</p>
            </div>
            <div className="orders-list">
                {[1, 2, 3].map(n => <div key={n} className="skeleton-card"></div>)}
            </div>
        </div>
    );

    if (error === "UNAUTHORIZED") {
        return (
            <div className="orders-page-container">
                <div className="empty-history-container fade-up">
                    <span className="empty-visual">🔒</span>
                    <h3>Bạn chưa đăng nhập</h3>
                    <p>Vui lòng đăng nhập để xem lịch sử mua hàng và quản lý các đơn đặt hàng của bạn.</p>
                    <button className="home-btn-luxury" onClick={() => navigate('/login')}>ĐĂNG NHẬP NGAY</button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page-container">
            <div className="orders-header fade-up">
                <h1 className="text-pretty" style={{ textWrap: 'balance' }}>Lịch Sử Đơn Hàng</h1>
                <p>Khám phá lại những tri thức bạn đã sở hữu và theo dõi các đơn hàng đang trên đường tới bạn.</p>
            </div>

            <div className="orders-content">
                {orders.length > 0 ? (
                    <div className="orders-list">
                        {orders.map((order, idx) => {
                            const status = getStatusConfig(order.status);
                            return (
                                <div key={order.id} className="order-card fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <div className="order-card-header">
                                        <div className="order-main-info">
                                            <span className="order-id-badge tabular-nums">ĐƠN #LH{order.id.toString().padStart(4, '0')}</span>
                                            <span className="order-date">
                                                📅 {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                                }) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className={`status-badge ${status.class}`}>
                                            <i>{status.icon}</i> {status.text}
                                        </div>
                                    </div>

                                    <div className="order-items-list">
                                        {order.orderDetails?.map((detail, dIdx) => (
                                            <div key={detail.id || dIdx} className="order-item-row">
                                                <div className="item-img-container">
                                                    <img 
                                                        src={getBookImg(detail.book?.imagePath)} 
                                                        alt={detail.book?.title}
                                                        width="60" height="85"
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                                    />
                                                </div>
                                                <div className="item-details">
                                                    <h4>{detail.book?.title || 'Sản phẩm đã gỡ bỏ'}</h4>
                                                    <div className="item-meta">
                                                        <span>Số lượng: <strong>{detail.quantity}</strong></span>
                                                        <span>•</span>
                                                        <span>Giá đơn vị: {formatCurrency(detail.price)}</span>
                                                    </div>
                                                </div>
                                                <div className="item-price-col">
                                                    <span className="unit-price tabular-nums">{formatCurrency(detail.price * detail.quantity)}</span>
                                                    <div className="item-actions-stack">
                                                        <button 
                                                            className="btn-item-detail"
                                                            onClick={() => navigate(`/book/${detail.book?.id}`)}
                                                        >
                                                            <Icons.Eye /> Chi tiết
                                                        </button>
                                                        
                                                        {order.status === 'COMPLETED' && detail.book && (
                                                            <div className="rate-action-container">
                                                                 {reviewedItems.has(detail.book.id) ? (
                                                                    <span className="rate-success-badge">Đã đánh giá ✓</span>
                                                                ) : (
                                                                    <button 
                                                                        className="btn-rate-item"
                                                                        onClick={() => setReviewModalData({ isOpen: true, book: detail.book })}
                                                                    >
                                                                        ★ Đánh giá
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-card-footer">
                                        <div className="footer-grid-container">
                                            <div className="footer-info-section">
                                                <div className="info-group">
                                                    <span className="info-label-premium"><Icons.Truck /> THÔNG TIN GIAO HÀNG</span>
                                                    <div className="info-content-luxury">
                                                        <p className="receiver-name">{order.receiverName}</p>
                                                        <p className="address-text">{order.shippingAddress || 'Quầy giao dịch cửa hàng'}</p>
                                                        <p className="phone-text"><Icons.Phone /> {order.phoneNumber}</p>
                                                        {order.note && (
                                                            <p className="note-text-premium"><Icons.FileText /> <strong>Ghi chú:</strong> {order.note}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="info-group">
                                                    <span className="info-label-premium"><Icons.CreditCard /> PHƯƠNG THỨC THANH TOÁN</span>
                                                    <div className="payment-method-luxury">
                                                        <span className={`method-pill ${order.paymentMethod?.toLowerCase()}`}>
                                                            {order.paymentMethod === 'COD' ? 'Thanh toán trực tiếp' : order.paymentMethod}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="footer-price-section">
                                                <div className="price-breakdown-luxury">
                                                    <div className="price-row">
                                                        <span>Tạm tính:</span>
                                                        <span className="tabular-nums">{formatCurrency(order.totalPrice || 0)}</span>
                                                    </div>
                                                    <div className="price-row">
                                                        <span>Phí vận chuyển:</span>
                                                        <span className="free-shipping-tag">MIỄN PHÍ</span>
                                                    </div>
                                                    <div className="price-divider-luxury"></div>
                                                    <div className="price-row total">
                                                        <span>Tổng thanh toán:</span>
                                                        <span className="total-value tabular-nums">{formatCurrency(order.totalPrice || 0)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="order-actions-bar">
                                        <button className="action-btn btn-glass" onClick={() => setDetailModal({ isOpen: true, order: order })}>
                                            <Icons.Eye /> Chi tiết đơn hàng
                                        </button>
                                        
                                        {order.status === 'PENDING' && (
                                            <button className="action-btn btn-cancel-neon" onClick={() => setCancelModal({ isOpen: true, orderId: order.id, loading: false })}>
                                                <Icons.XCircle /> Hủy đơn hàng
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-history-container fade-up">
                        <span className="empty-visual">📜</span>
                        <h3>Hành trình đang chờ đợi</h3>
                        <p>Dường như kệ sách của bạn vẫn còn khoảng trống. Hãy lấp đầy nó bằng những cuốn sách tuyệt vời từ cửa hàng của chúng tôi.</p>
                        <button className="home-btn-luxury" onClick={() => navigate('/shop')}>KHÁM PHÁ NGAY</button>
                    </div>
                )}
            </div>
            <ReviewModal 
                isOpen={reviewModalData.isOpen} 
                book={reviewModalData.book} 
                onClose={() => setReviewModalData({ isOpen: false, book: null })}
                onSuccess={() => {
                    if (reviewModalData.book) {
                        setReviewedItems(prev => new Set(prev).add(reviewModalData.book.id));
                    }
                }}
            />

            <ConfirmationModal 
                isOpen={cancelModal.isOpen}
                title="Xác nhận hủy đơn hàng"
                message={`Bạn có chắc chắn muốn hủy đơn hàng #LH${cancelModal.orderId?.toString().padStart(4, '0')} không? Thao tác này không thể hoàn tác.`}
                confirmText="Hủy đơn hàng"
                cancelText="Quay lại"
                loading={cancelModal.loading}
                onConfirm={handleCancelOrder}
                onCancel={() => setCancelModal({ isOpen: false, orderId: null, loading: false })}
            />

            <ExportInvoiceModal 
                isOpen={exportModal.isOpen}
                orderId={exportModal.orderId}
                onClose={() => setExportModal({ isOpen: false, orderId: null })}
                onExportPdf={() => handleExportInvoiceAction('PDF')}
                onExportExcel={() => handleExportInvoiceAction('EXCEL')}
                onPrintHtml={() => handleExportInvoiceAction('HTML')}
            />

            <StatusModal 
                isOpen={statusModal.isOpen}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                onButtonClick={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                buttonText="Đóng"
            />

            <OrderDetailModal 
                isOpen={detailModal.isOpen}
                order={detailModal.order}
                onClose={() => setDetailModal({ isOpen: false, order: null })}
                onExportInvoice={() => {
                    setDetailModal({ isOpen: false, order: null });
                    setExportModal({ isOpen: true, orderId: detailModal.order?.id });
                }}
            />
        </div>
    );
};

export default OrderHistory;
