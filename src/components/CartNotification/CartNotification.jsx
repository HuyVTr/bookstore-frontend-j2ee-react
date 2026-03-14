import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartNotification.css';

const CartNotification = () => {
    const { notification, closeNotification } = useCart();
    const navigate = useNavigate();

    if (!notification.show) return null;

    const { book, quantity } = notification;

    const getBookImg = (path) => {
        if (!path) return 'https://via.placeholder.com/80x120?text=Book';
        if (path.startsWith('http')) return path;
        return `http://localhost:8080/images/${path.split('/').pop()}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="cart-notification-container">
            <div className="cart-notification-card glass-premium">
                <div className="cn-header">
                    <div className="cn-success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <span className="cn-status-text">Thêm thành công!</span>
                    <button className="cn-close-btn" onClick={closeNotification} aria-label="Đóng">
                        ✕
                    </button>
                </div>

                <div className="cn-body">
                    <div className="cn-book-meta">
                        <div className="cn-book-img">
                            <img src={getBookImg(book.imagePath)} alt={book.title} />
                        </div>
                        <div className="cn-book-details">
                            <h4 className="cn-book-title">{book.title}</h4>
                            <p className="cn-book-info">
                                <span className="cn-qty">Số lượng: {quantity}</span>
                                <span className="cn-divider">|</span>
                                <span className="cn-price">{formatCurrency(book.isOnSale ? book.discountPrice : book.price)}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="cn-footer">
                    <button 
                        className="cn-view-cart-btn" 
                        onClick={() => {
                            navigate('/cart');
                            closeNotification();
                        }}
                    >
                        Xem giỏ hàng
                    </button>
                    <button className="cn-continue-btn" onClick={closeNotification}>
                        Tiếp tục
                    </button>
                </div>
                
                <div className="cn-progress-bar"></div>
            </div>
        </div>
    );
};

export default CartNotification;
