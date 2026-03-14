import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import './WishlistNotification.css';

const WishlistNotification = () => {
    const { notification, closeNotification } = useWishlist();
    const navigate = useNavigate();

    if (!notification.show) return null;

    const { book, type } = notification;

    const getBookImg = (path) => {
        if (!path) return 'https://via.placeholder.com/80x120?text=Book';
        if (path.startsWith('http')) return path;
        return `http://localhost:8080/images/${path.split('/').pop()}`;
    };

    return (
        <div className="wishlist-notification-container">
            <div className={`wishlist-notification-card glass-premium ${type}`}>
                <div className="wn-header">
                    <div className="wn-icon">
                        {type === 'add' ? (
                            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        )}
                    </div>
                    <span className="wn-status-text">
                        {type === 'add' ? 'Đã thêm vào yêu thích!' : 'Đã xóa khỏi yêu thích!'}
                    </span>
                    <button className="wn-close-btn" onClick={closeNotification} aria-label="Đóng">
                        &times;
                    </button>
                </div>

                <div className="wn-body">
                    <div className="wn-book-meta">
                        <div className="wn-book-img">
                            <img src={getBookImg(book.imagePath)} alt={book.title} width="60" height="85" />
                        </div>
                        <div className="wn-book-details">
                            <h4 className="wn-book-title">{book.title}</h4>
                            <p className="wn-book-author">{book.author}</p>
                        </div>
                    </div>
                </div>

                {type === 'add' && (
                    <div className="wn-footer">
                        <button 
                            className="wn-view-wishlist-btn" 
                            onClick={() => {
                                navigate('/wishlist');
                                closeNotification();
                            }}
                        >
                            Xem danh sách
                        </button>
                    </div>
                )}
                
                <div className="wn-progress-bar"></div>
            </div>
        </div>
    );
};

export default WishlistNotification;
