import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import QuickViewModal from '../../../components/QuickViewModal/QuickViewModal';
import { useNavigate, Link } from 'react-router-dom';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlist, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [quickViewBook, setQuickViewBook] = useState(null);
    const navigate = useNavigate();

    const handleRemoveFromWishlist = (book) => {
        toggleWishlist(book);
    };

    const handleAddToCart = async (book) => {
        const result = await addToCart(book, 1);
        if (!result.success) {
            alert(result.error === 'unauthorized' ? "Vui lòng đăng nhập để thêm vào giỏ hàng." : result.error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getBookImg = (path) => {
        if (!path) return 'https://via.placeholder.com/300x450?text=No+Cover';
        if (path.startsWith('http')) return path;
        return `http://localhost:8080/images/${path.split('/').pop()}`;
    };


    if (wishlist.length === 0) {
        return (
            <div className="wishlist-empty-container">
                <div className="empty-wishlist-card glass">
                    <div className="empty-icon">💖</div>
                    <h2 className="text-pretty">Danh sách yêu thích trống</h2>
                    <p>Hãy lưu lại những cuốn sách bạn yêu thích để mua sau nhé.</p>
                    <Link to="/shop" className="go-shop-btn">Khám phá cửa hàng</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page-container">
            <div className="wishlist-header">
                <h1 className="text-balance">Bộ Sưu Tập Yêu Thích</h1>
                <p>Bạn đã lưu giữ {wishlist.length} tác phẩm tinh hoa trong bộ sưu tập của mình</p>
            </div>

            <div className="wishlist-grid">
                {wishlist.map((book) => (
                    <div key={book.id} className="wishlist-card glass hover-lift">
                        <button 
                            className="remove-wishlist-btn" 
                            onClick={() => handleRemoveFromWishlist(book)}
                            aria-label="Remove from wishlist"
                            title="Xóa khỏi yêu thích"
                        >
                            ❤️
                        </button>
                        <div className="wishlist-img-wrapper">
                            <Link to={`/book/${book.id}`} className="wishlist-card-link">
                                <div className="wishlist-img">
                                    <img src={getBookImg(book.imagePath)} alt={book.title} />
                                </div>
                            </Link>
                            <div className="wishlist-img-overlay">
                                <button 
                                    className="quick-view-btn-wishlist"
                                    onClick={() => setQuickViewBook(book)}
                                >
                                    Xem nhanh
                                </button>
                            </div>
                        </div>
                        <Link to={`/book/${book.id}`} className="wishlist-card-link">
                            <div className="wishlist-info">
                                <h3>{book.title}</h3>
                                <p className="wishlist-author">{book.author}</p>
                                <p className="wishlist-price tabular-nums">{formatCurrency(book.price)}</p>
                            </div>
                        </Link>
                        <div className="wishlist-card-actions">
                            <button 
                                className="wishlist-add-cart-btn"
                                onClick={() => handleAddToCart(book)}
                            >
                                THÊM VÀO GIỎ
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {quickViewBook && (
                <QuickViewModal 
                    book={quickViewBook} 
                    onClose={() => setQuickViewBook(null)} 
                />
            )}
        </div>
    );
};

export default Wishlist;
