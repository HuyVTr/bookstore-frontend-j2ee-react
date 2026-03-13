import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './QuickViewModal.css';

const QuickViewModal = ({ book, onClose }) => {
    const navigate = useNavigate();
    if (!book) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getBookImg = (path) => {
        if (!path) return 'https://via.placeholder.com/400x600?text=No+Cover';
        if (path.startsWith('http')) return path;
        return `http://localhost:8080/images/${path.split('/').pop()}`;
    };

    return (
        <div className="quickview-modal-overlay" onClick={onClose}>
            <div className="quickview-modal-content glass" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                <button className="close-modal" onClick={onClose} aria-label="Đóng cửa sổ">
                    <Icons.Close />
                </button>
                <div className="qv-body">
                    <div className="qv-image">
                        <img 
                            src={getBookImg(book.imagePath)} 
                            alt={book.title} 
                            width="400"
                            height="600"
                            loading="eager"
                        />
                    </div>
                    <div className="qv-details">
                        <div className="qv-header-badge">
                            <span className="qv-category">{book.category?.name || 'Văn học'}</span>
                            <div className={`source-tag ${book.bookSource?.toLowerCase() || 'official'}`}>
                                {book.bookSource === 'AUTHOR' ? 'Author' : 'Official'}
                            </div>
                        </div>
                        <h2>{book.title}</h2>
                        <p className="qv-author">
                            Tác giả: <b>{book.author}</b> | <span className="sold-count-qv">Đã bán {book.totalSold || 0}</span>
                        </p>
                        <div className="qv-price-row">
                            <span className="qv-price">
                                {formatCurrency(book.isOnSale ? book.discountPrice : book.price)}
                            </span>
                            {book.isOnSale && (
                                <span className="qv-old-price">{formatCurrency(book.price)}</span>
                            )}
                        </div>
                        <p className="qv-desc">
                            Mô tả tóm tắt về cuốn sách này giúp bạn nắm bắt tinh thần tác phẩm một cách nhanh nhất.
                            Hãy khám phá thêm những câu chuyện đầy cảm hứng và kiến thức giá trị bên trong cuốn sách này…
                        </p>
                        <div className="qv-actions">
                            <button className="qv-add-cart">THÊM VÀO GIỎ</button>
                            <Link 
                                to={`/book/${book.id}`} 
                                className="qv-details-btn" 
                                onClick={onClose}
                            >
                                XEM CHI TIẾT
                            </Link>
                            <button className="qv-wishlist" aria-label="Thêm vào danh sách yêu thích">
                                <Icons.Heart />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Icons = {
    Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    Heart: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
};

export default QuickViewModal;
