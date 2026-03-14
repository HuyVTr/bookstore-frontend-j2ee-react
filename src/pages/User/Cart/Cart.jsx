import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import './Cart.css';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, clearCart, loading, fetchCart } = useCart();
    const [confirmAction, setConfirmAction] = useState({ show: false, type: '', data: null });
    const [selectedIds, setSelectedIds] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadCart = async () => {
            await fetchCart();
        };
        loadCart();
    }, []);

    // Effect to select all by default when cart is loaded correctly
    useEffect(() => {
        if (cart?.cartItems?.length > 0 && selectedIds.length === 0) {
            setSelectedIds(cart.cartItems.map(item => item.bookId || item.id));
        }
    }, [cart]);

    const handleSelectAll = () => {
        if (selectedIds.length === cartItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(cartItems.map(item => item.bookId || item.id));
        }
    };

    const handleSelectItem = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleUpdateQuantity = async (id, newQty) => {
        await updateQuantity(id, newQty);
    };

    const handleRemoveItem = (id) => {
        setConfirmAction({
            show: true,
            type: 'REMOVE_ITEM',
            title: 'Xóa sản phẩm?',
            message: 'Bạn có chắc muốn xóa cuốn sách này khỏi giỏ hàng không?',
            confirmText: 'Xóa ngay',
            data: { id }
        });
    };

    const confirmRemoveItem = async (id) => {
        const result = await removeFromCart(id);
        if (result.success) {
            setConfirmAction({ show: false, type: '', data: null });
        }
    };

    const handleClearCart = () => {
        setConfirmAction({
            show: true,
            type: 'CLEAR_CART',
            title: 'Làm trống giỏ hàng?',
            message: 'Toàn bộ sản phẩm trong giỏ hàng sẽ bị xóa. Bạn có chắc không?',
            confirmText: 'Xóa toàn bộ',
            data: null
        });
    };

    const confirmClearCart = async () => {
        const result = await clearCart();
        if (result.success) {
            setConfirmAction({ show: false, type: '', data: null });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getBookImg = (path) => {
        if (!path) return 'https://via.placeholder.com/150x200?text=No+Cover';
        if (path.startsWith('http')) return path;
        return `http://localhost:8080/images/${path.split('/').pop()}`;
    };

    if (loading) return (
        <div className="cart-loading">
            <div className="loader"></div>
            <p>Đang tải giỏ hàng…</p>
        </div>
    );

    const cartItems = cart?.cartItems || [];
    const selectedCartItems = cartItems.filter(item => selectedIds.includes(item.bookId || item.id));
    const selectedTotalPrice = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isAllSelected = cartItems.length > 0 && selectedIds.length === cartItems.length;

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty-container fade-in">
                <div className="empty-cart-card glass-premium">
                    <div className="empty-icon-wrapper" aria-hidden="true">
                        <Icons.EmptyCart />
                    </div>
                    <h2 className="text-balance">Giỏ hàng của bạn đang trống</h2>
                    <p>Có vẻ như bạn chưa chọn được cuốn sách ưng ý nào cho hành trình tri thức tiếp theo.</p>
                    <Link to="/shop" className="start-shopping-btn hover-lift">Khám phá cửa hàng ngay</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <div className="cart-header">
                <h1 className="text-pretty">Giỏ hàng của bạn</h1>
                <p>Bạn có {cartItems.length} sản phẩm trong giỏ hàng</p>
            </div>

            <div className="cart-content-grid">
                <div className="cart-items-section">
                    <div className="items-list glass-premium fade-in">
                        <div className="cart-list-header-luxury">
                            <label className="select-all-label">
                                <div 
                                    className={`luxury-checkbox ${isAllSelected ? 'checked' : ''}`} 
                                    onClick={handleSelectAll}
                                    role="checkbox"
                                    aria-checked={isAllSelected}
                                    aria-label="Chọn tất cả"
                                    tabIndex="0"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSelectAll()}
                                >
                                    {isAllSelected && <Icons.Check />}
                                </div>
                                <span>Chọn tất cả ({cartItems.length} sản phẩm)</span>
                            </label>
                        </div>
                        {cartItems.map((item, idx) => {
                            const itemId = item.bookId || item.id;
                            const isSelected = selectedIds.includes(itemId);
                            return (
                                <div key={itemId || `item-${idx}`} className={`cart-item slide-up ${isSelected ? 'selected' : ''}`} style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <div 
                                        className={`luxury-checkbox ${isSelected ? 'checked' : ''}`} 
                                        onClick={() => handleSelectItem(itemId)}
                                        role="checkbox"
                                        aria-checked={isSelected}
                                        aria-label={`Chọn sản phẩm ${item.bookName}`}
                                        tabIndex="0"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSelectItem(itemId)}
                                    >
                                        {isSelected && <Icons.Check />}
                                    </div>
                                    <div className="item-image-premium" onClick={() => handleSelectItem(itemId)}>
                                        <img src={getBookImg(item.imagePath)} alt={item.bookName} width="110" height="155" />
                                        <div className="item-qty-badge">{item.quantity}</div>
                                    </div>
                                    <div className="item-info">
                                        <h3 className="text-balance">{item.bookName}</h3>
                                        <p className="item-price-unit tabular-nums">{formatCurrency(item.price)}</p>
                                    </div>
                                    <div className="item-quantity">
                                        <div className="qty-controls-luxury">
                                            <button 
                                                onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)} 
                                                disabled={item.quantity <= 1}
                                                className="qty-btn"
                                                aria-label="Giảm số lượng"
                                            >
                                                <Icons.Minus />
                                            </button>
                                            <span className="qty-value tabular-nums">{item.quantity}</span>
                                            <button 
                                                onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)} 
                                                className="qty-btn"
                                                aria-label="Tăng số lượng"
                                            >
                                                <Icons.Plus />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="item-total-col">
                                        <span className="item-total-val tabular-nums">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                    <button 
                                        className="remove-item-btn-premium" 
                                        onClick={() => handleRemoveItem(itemId)}
                                        aria-label="Xóa sản phẩm"
                                    >
                                        <Icons.Trash />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="cart-footer-actions">
                        <Link to="/shop" className="back-to-shop">← Tiếp tục mua sắm</Link>
                        <button className="clear-cart-btn" onClick={handleClearCart}>Xóa giỏ hàng</button>
                    </div>
                </div>

                <div className="cart-summary-section">
                    <div className="summary-card glass-premium fade-in">
                        <h3 className="text-balance">Tóm tắt đơn hàng</h3>
                        <div className="summary-row">
                            <span>Đã chọn ({selectedIds.length} món):</span>
                            <span className="tabular-nums font-bold">{formatCurrency(selectedTotalPrice)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Phí vận chuyển:</span>
                            <span className="tabular-nums">Miễn phí</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row total">
                            <span>Tổng cộng:</span>
                            <span className="tabular-nums">{formatCurrency(selectedTotalPrice)}</span>
                        </div>
                        <button 
                            className="checkout-btn hover-lift"
                            onClick={() => navigate('/checkout', { state: { selectedIds } })}
                            disabled={selectedIds.length === 0}
                        >
                            TIẾN HÀNH THANH TOÁN
                        </button>
                        
                        <div className="trust-badges">
                            <div className="badge-item">
                                <Icons.Secure /> <span>Bảo mật 100%</span>
                            </div>
                            <div className="badge-item">
                                <Icons.Return /> <span>7 ngày đổi trả</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PREMIUM CONFIRMATION MODAL --- */}
            {confirmAction.show && (
                <div className="cart-modal-overlay fade-in">
                    <div className="cart-modal-container slide-up">
                        <div className="modal-icon-wrapper warning">
                            <Icons.Warning />
                        </div>
                        <h2 className="modal-title">{confirmAction.title}</h2>
                        <p className="modal-message">{confirmAction.message}</p>
                        <div className="modal-actions">
                            <button 
                                className="btn-modal-cancel" 
                                onClick={() => setConfirmAction({ show: false, type: '', data: null })}
                            >
                                Quay lại
                            </button>
                            <button 
                                className="btn-modal-confirm" 
                                onClick={() => {
                                    if (confirmAction.type === 'REMOVE_ITEM') confirmRemoveItem(confirmAction.data.id);
                                    if (confirmAction.type === 'CLEAR_CART') confirmClearCart();
                                }}
                            >
                                {confirmAction.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Icons = {
    Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    Secure: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
    Return: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>,
    Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Minus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
    EmptyCart: () => (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            <path d="M17 10l2-2m0 0l2 2m-2-2v6" stroke="#ef4444"></path>
        </svg>
    ),
    Warning: () => (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    )
};

export default Cart;
