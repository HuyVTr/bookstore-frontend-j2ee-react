import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import './Checkout.css';
import momoLogo from '../../../assets/logo_checkout/momo_logo.png';
import vnpayLogo from '../../../assets/logo_checkout/VNPay_logo.png';
import StatusModal from '../../../components/StatusModal/StatusModal';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deliveryMode, setDeliveryMode] = useState('profile'); // 'profile' or 'new'
    const [profile, setProfile] = useState(null);
    const [orderInfo, setOrderInfo] = useState({
        senderName: '',
        receiverName: '',
        phoneNumber: '',
        address: '',
        note: '',
        paymentMethod: 'COD'
    });
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            await Promise.all([fetchCart(), fetchProfile()]);
            setLoading(false);
        };
        initData();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await api.get('cart');
            let cartData = res.data;

            // Nếu đi từ Cart page và có chọn sản phẩm cụ thể
            if (location.state?.selectedIds && cartData?.cartItems) {
                const filteredItems = cartData.cartItems.filter(item => 
                    location.state.selectedIds.includes(item.bookId || item.id)
                );
                const filteredTotal = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                cartData = {
                    ...cartData,
                    cartItems: filteredItems,
                    totalPrice: filteredTotal
                };
            }

            if (!cartData || cartData.cartItems.length === 0) {
                navigate('/cart');
            }
            setCart(cartData);
        } catch (error) {
            console.error("Lỗi khi tải giỏ hàng:", error);
            navigate('/cart');
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get('profile');
            setProfile(res.data);
            // Default to profile data if mode is 'profile'
            setOrderInfo(prev => ({
                ...prev,
                senderName: res.data.fullName || res.data.username,
                receiverName: res.data.fullName || res.data.username,
                phoneNumber: res.data.phone || '',
                address: res.data.address || ''
            }));
        } catch (error) {
            console.error("Lỗi khi tải hồ sơ:", error);
        }
    };

    useEffect(() => {
        if (deliveryMode === 'profile' && profile) {
            setOrderInfo(prev => ({
                ...prev,
                senderName: profile.fullName || profile.username,
                receiverName: profile.fullName || profile.username,
                phoneNumber: profile.phone || '',
                address: profile.address || ''
            }));
        } else if (deliveryMode === 'new') {
            setOrderInfo(prev => ({
                ...prev,
                senderName: '',
                receiverName: '',
                phoneNumber: '',
                address: ''
            }));
        }
    }, [deliveryMode, profile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirmOrder = (e) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const finalSubmitOrder = async () => {
        setSubmitting(true);
        try {
            const payload = {
                ...orderInfo,
                itemIds: location.state?.selectedIds || null // Gửi danh sách ID được chọn lên server
            };
            await api.post('cart/checkout', payload);
            setShowConfirmModal(false);
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Đặt hàng thành công!',
                message: 'Cảm ơn bạn đã tin tưởng Bookstore. Đơn hàng của bạn đang được chuẩn bị.'
            });
        } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Đặt hàng thất bại',
                message: error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusModalClose = () => {
        const isSuccess = statusModal.type === 'success';
        setStatusModal(prev => ({ ...prev, isOpen: false }));
        if (isSuccess) {
            navigate('/orders');
        }
    };

    const formatCurrency = (amount) => {
        const val = Number(amount) || 0;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(val);
    };

    if (loading || !cart) return <div className="checkout-loading"><div className="loader"></div></div>;

    const cartItems = cart.cartItems || [];
    const totalPrice = cart.totalPrice || cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <>
        <form className="checkout-page-container" onSubmit={handleConfirmOrder}>
            <div className="checkout-grid">
                {/* Form Section */}
                <div className="checkout-form-section">
                    <div className="checkout-card glass-premium fade-in">
                        <h2 className="text-balance" style={{ textWrap: 'balance' }}>Thông tin giao hàng</h2>

                        <div className="delivery-mode-selector">
                            <button
                                type="button"
                                className={`mode-btn ${deliveryMode === 'profile' ? 'active' : ''}`}
                                onClick={() => setDeliveryMode('profile')}
                            >
                                <span className="radio-circle"></span>
                                <div className="mode-text">
                                    <strong>Sử dụng từ hồ sơ</strong>
                                    <p>Giao đến địa chỉ đã lưu</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`mode-btn ${deliveryMode === 'new' ? 'active' : ''}`}
                                onClick={() => setDeliveryMode('new')}
                            >
                                <span className="radio-circle"></span>
                                <div className="mode-text">
                                    <strong>Nhập thông tin mới</strong>
                                    <p>Giao đến địa chỉ khác</p>
                                </div>
                            </button>
                        </div>

                        <div className="form-row slide-up">
                            <div className="form-group">
                                <label>Họ và tên người đặt</label>
                                    <input
                                        type="text"
                                        name="senderName"
                                        value={orderInfo.senderName}
                                        onChange={handleInputChange}
                                        placeholder="Ví dụ: Nguyễn Văn A…"
                                        required
                                        disabled={deliveryMode === 'profile'}
                                        spellCheck={false}
                                    />
                            </div>
                            <div className="form-group">
                                <label>Họ và tên người nhận</label>
                                    <input
                                        type="text"
                                        name="receiverName"
                                        value={orderInfo.receiverName}
                                        onChange={handleInputChange}
                                        placeholder="Ví dụ: Trần Thị B…"
                                        required
                                        disabled={deliveryMode === 'profile'}
                                        spellCheck={false}
                                        autoComplete="name"
                                    />
                            </div>
                        </div>
                        <div className="form-row slide-up">
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={orderInfo.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="Ví dụ: 0912345678…"
                                        required
                                        disabled={deliveryMode === 'profile'}
                                        autoComplete="tel"
                                        inputMode="tel"
                                    />
                            </div>
                            <div className="form-group">
                                <label>Địa chỉ nhận hàng</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={orderInfo.address}
                                        onChange={handleInputChange}
                                        placeholder="Ví dụ: 123 Đường ABC, Quận 1…"
                                        required
                                        disabled={deliveryMode === 'profile'}
                                        autoComplete="street-address"
                                    />
                            </div>
                        </div>

                        <div className="payment-method-section slide-up">
                            <h3>Phương thức thanh toán</h3>
                            <div className="payment-grid">
                                {[
                                    { id: 'COD', label: 'Tiền mặt (COD)', icon: <Icons.COD /> },
                                    { id: 'MOMO', label: 'Ví Momo', icon: <Icons.Momo />, color: '#ae2070' },
                                    { id: 'VNPAY', label: 'Ví VNPAY', icon: <Icons.VNPay />, color: '#005baa' },
                                    { id: 'BANKING', label: 'Thẻ ATM/Bank', icon: <Icons.Bank /> }
                                ].map((method, index) => (
                                    <label key={`${method.id}-${index}`} className={`payment-card ${orderInfo.paymentMethod === method.id ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={orderInfo.paymentMethod === method.id}
                                            onChange={handleInputChange}
                                        />
                                        <div className="payment-icon" style={{ borderColor: method.color }}>{method.icon}</div>
                                        <span className="payment-label">{method.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group slide-up" style={{ marginTop: '30px' }}>
                            <label>Ghi chú đơn hàng (Tùy chọn)</label>
                            <textarea
                                name="note"
                                value={orderInfo.note}
                                onChange={handleInputChange}
                                placeholder="Lưu ý cho người giao hàng…"
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="checkout-summary-section">
                    <div className="summary-card-alt">
                        <h3>Đơn hàng của bạn</h3>
                        <div className="order-items-preview">
                            {cartItems.map((item, index) => {
                                const itemId = item.bookId || item.id || `item-${index}`;
                                const cleanImgPath = item.imagePath ? item.imagePath.split('/').pop() : 'default-book.png';
                                return (
                                    <div key={`checkout-item-${itemId}`} className="preview-item slide-up">
                                        <div className="preview-img">
                                            <img src={`http://localhost:8080/images/${cleanImgPath}`} alt={item.bookName} width="60" height="85" />
                                            <span className="preview-qty">{item.quantity}</span>
                                        </div>
                                        <div className="preview-info">
                                            <h4>{item.bookName}</h4>
                                            <p className="tabular-nums">{formatCurrency(item.price)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="summary-total-footer fade-in">
                            <div className="total-row">
                                <span>Thành tiền:</span>
                                <span className="price-primary tabular-nums">{formatCurrency(totalPrice)}</span>
                            </div>

                            <button
                                type="submit"
                                className="submit-order-btn hover-lift"
                                disabled={submitting}
                            >
                                {submitting ? "Đang Xử Lý…" : "Xác Nhận Đặt Hàng"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>

        {/* --- PREMIUM CONFIRMATION MODAL --- */}
        {showConfirmModal && (
            <div className="checkout-modal-overlay fade-in">
                <div className="checkout-modal-container slide-up">
                    <div className="modal-header">
                        <div className="success-icon-wrapper">
                            <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="3" fill="none">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h2>Xác nhận đặt hàng</h2>
                        <p>Vui lòng kiểm tra kỹ thông tin trước khi hoàn tất</p>
                    </div>

                    <div className="modal-body">
                        <div className="info-grid">
                            <div className="info-block">
                                <span>Người đặt</span>
                                <strong>{orderInfo.senderName}</strong>
                            </div>
                            <div className="info-block">
                                <span>Người nhận</span>
                                <strong>{orderInfo.receiverName}</strong>
                            </div>
                            <div className="info-block">
                                <span>Số điện thoại</span>
                                <strong>{orderInfo.phoneNumber}</strong>
                            </div>
                            <div className="info-block full">
                                <span>Địa chỉ giao hàng</span>
                                <strong>{orderInfo.address}</strong>
                            </div>
                            <div className="info-block">
                                <span>Thanh toán</span>
                                <div className={`pay-method-pill ${orderInfo.paymentMethod.toLowerCase()}`}>
                                    {orderInfo.paymentMethod === 'COD' && "Tiền mặt (COD)"}
                                    {orderInfo.paymentMethod === 'MOMO' && "Ví Momo"}
                                    {orderInfo.paymentMethod === 'VNPAY' && (
                                        <>
                                            Ví <span className="vn">VN</span><span className="pay">PAY</span>
                                        </>
                                    )}
                                    {orderInfo.paymentMethod === 'BANKING' && "Thẻ ATM/Bank"}
                                </div>
                            </div>
                            {orderInfo.note && (
                                <div className="info-block full">
                                    <span>Ghi chú đơn hàng</span>
                                    <strong>{orderInfo.note}</strong>
                                </div>
                            )}
                            <div className="info-block">
                                <span>Tổng cộng</span>
                                <strong className="text-primary">{formatCurrency(totalPrice)}</strong>
                            </div>
                        </div>

                        <div className="modal-items-mini">
                            {cartItems.map((item, index) => {
                                const itemId = item.bookId || item.id || `item-${index}`;
                                const cleanImgPath = item.imagePath ? item.imagePath.split('/').pop() : 'default-book.png';
                                return (
                                    <div key={`modal-item-${itemId}`} className="mini-item" style={{ animationDelay: `${index * 0.1}s` }}>
                                        <img src={`http://localhost:8080/images/${cleanImgPath}`} alt={item.bookName} width="40" height="60" />
                                        <div className="mini-qty">x{item.quantity}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={() => setShowConfirmModal(false)} disabled={submitting}>
                            Quay lại sửa
                        </button>
                        <button type="button" className="btn-confirm" onClick={finalSubmitOrder} disabled={submitting}>
                            {submitting ? "Đang xử lý…" : "Xác nhận & Thanh toán"}
                        </button>
                    </div>
                </div>
            </div>
        )}

        <StatusModal 
            isOpen={statusModal.isOpen}
            type={statusModal.type}
            title={statusModal.title}
            message={statusModal.message}
            onButtonClick={handleStatusModalClose}
            buttonText={statusModal.type === 'success' ? 'Xem đơn hàng' : 'Quay lại'}
        />
        </>
    );
};

const Icons = {
    COD: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>,
    Momo: () => <img src={momoLogo} alt="Momo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
    VNPay: () => <img src={vnpayLogo} alt="VNPay" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
    Bank: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h18M7 10v8M11 10v8M15 10v8M17 21H3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h18c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1H17zM12 3L2 9h20L12 3z" /></svg>
};

export default Checkout;
