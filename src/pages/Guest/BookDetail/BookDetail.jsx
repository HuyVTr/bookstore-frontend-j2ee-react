import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import LoginPromptModal from '../../../components/LoginPromptModal/LoginPromptModal';
import './BookDetail.css';

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [activeTab, setActiveTab] = useState('description');
    const [reviews, setReviews] = useState([]);
    const [canReview, setCanReview] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [promptMessage, setPromptMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchBookDetail = async () => {
            setLoading(true);
            try {
                const res = await api.get(`public/books/${id}`);
                setBook(res.data);
                setSelectedImage(res.data?.imagePath);
                
                // Fetch related books based on category
                if (res.data?.category?.id) {
                    const relatedRes = await api.get(`public/books/category/${res.data.category.id}?limit=4`);
                    setRelatedBooks(relatedRes.data?.filter(b => b.id !== parseInt(id)) || []);
                }

                // Fetch real reviews
                const reviewsRes = await api.get(`public/reviews/book/${id}`);
                setReviews(reviewsRes.data || []);

                // Check if user can review (if logged in)
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const canReviewRes = await api.get(`user/reviews/can-review/${id}`);
                        setCanReview(canReviewRes.data);
                    } catch (err) {
                        setCanReview(false);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải chi tiết sách:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookDetail();
    }, [id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('user/reviews', {
                bookId: id,
                rating: newReview.rating,
                comment: newReview.comment
            });
            // Refresh reviews
            const reviewsRes = await api.get(`public/reviews/book/${id}`);
            setReviews(reviewsRes.data || []);
            setCanReview(false);
            setNewReview({ rating: 5, comment: '' });
            alert("Cảm ơn bạn đã đánh giá tác phẩm này!");
        } catch (error) {
            alert(error.response?.data || "Có lỗi xảy ra khi gửi đánh giá.");
        } finally {
            setSubmitting(false);
        }
    };

    const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
        : 0;

    const renderStars = (rating) => {
        return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getBookImg = (path) => {
        if (!path) return 'https://via.placeholder.com/600x800?text=No+Cover';
        if (path.startsWith('http')) return path;
        return `http://localhost:8080/images/${path.split('/').pop()}`;
    };

    const handleQuantityChange = (val) => {
        const newQty = Math.max(1, Math.min(book?.quantity || 1, quantity + val));
        setQuantity(newQty);
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setPromptMessage("Vui lòng đăng nhập để bắt đầu xây dựng giỏ hàng của riêng bạn!");
            setShowLoginPrompt(true);
            return;
        }
        
        try {
            alert("Đã thêm " + quantity + " sản phẩm vào giỏ hàng thành công!");
        } catch (error) {
            console.error(error);
        }
    };

    const handleBuyNow = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setPromptMessage("Hãy đăng nhập để thanh toán nhanh chóng và bảo mật!");
            setShowLoginPrompt(true);
            return;
        }
        alert("Tính năng thanh toán đang được phát triển.");
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loader"></div>
            <p>Đang tải thông tin sách...</p>
        </div>
    );
    
    if (!book) return (
        <div className="error-container">
            <h2>Hic! Không tìm thấy cuốn sách này.</h2>
            <button onClick={() => navigate('/shop')}>Quay lại cửa hàng</button>
        </div>
    );

    return (
        <div className="book-detail-container">
            {/* Breadcrumbs */}
            <nav className="breadcrumb">
                <Link to="/">Trang chủ</Link>
                <span>/</span>
                <Link to="/shop">Cửa hàng</Link>
                <span>/</span>
                <Link to={`/shop?category=${book.category?.id}`}>{book.category?.name || 'Văn học'}</Link>
                <span>/</span>
                <span className="current">{book.title}</span>
            </nav>

            <div className="book-main-content">
                {/* Left: Product Media */}
                <div className="book-media">
                    <div className="main-image-wrapper glass">
                        <img 
                            src={getBookImg(selectedImage || book.imagePath)} 
                            alt={book.title} 
                            className="magnify-img"
                        />
                        <div className={`source-tag ${book.bookSource?.toLowerCase() || 'official'}`}>
                            {book.bookSource === 'AUTHOR' ? 'Author' : 'Official'}
                        </div>
                    </div>

                    {book.subImages && book.subImages.length > 0 && (
                        <div className="sub-images-gallery">
                            <div 
                                className={`sub-image-item ${selectedImage === book.imagePath ? 'active' : ''}`}
                                onClick={() => setSelectedImage(book.imagePath)}
                            >
                                <img src={getBookImg(book.imagePath)} alt="thumbnail-main" />
                            </div>
                            {book.subImages.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    className={`sub-image-item ${selectedImage === img.imagePath ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(img.imagePath)}
                                >
                                    <img src={getBookImg(img.imagePath)} alt={`thumbnail-${idx}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Product Info */}
                <div className="book-info">
                    <div className="category-label">{book.category?.name || 'Văn học'}</div>
                    <h1 className="book-title">{book.title}</h1>
                    
                    <div className="author-row">
                        <span>Tác giả: <b>{book.author}</b></span>
                        <span className="divider">|</span>
                        <span>Đã bán: <b>{book.totalSold || 0}</b></span>
                        <span className="divider">|</span>
                        <div className="stars">
                            {renderStars(avgRating)} 
                            <small> ({reviews.length} đánh giá)</small>
                        </div>
                    </div>

                    <div className="price-box">
                        <div className="current-price">
                            {formatCurrency(book.isOnSale ? book.discountPrice : book.price)}
                        </div>
                        {book.isOnSale && (
                            <div className="old-price">
                                <span>{formatCurrency(book.price)}</span>
                                <span className="discount-badge">-{Math.round((1 - book.discountPrice / book.price) * 100)}%</span>
                            </div>
                        )}
                    </div>

                    <p className="short-description">
                        Cuốn sách này mang đến cho bạn những góc nhìn mới mẻ và đầy cảm hứng. 
                        Với nội dung sâu sắc được chắt lọc kỹ lưỡng, đây là người bạn đồng hành 
                        không thể thiếu trên hành trình khám phá tri thức của mỗi chúng ta.
                    </p>

                    <div className="stock-status">
                        <span className={`status-dot ${book.quantity > 0 ? 'online' : 'offline'}`}></span>
                        {book.quantity > 0 ? `Còn ${book.quantity} sản phẩm trong kho` : 'Hết hàng'}
                    </div>

                    <div className="purchase-controls">
                        <div className="quantity-selector">
                            <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</button>
                            <input type="number" value={quantity} readOnly />
                            <button onClick={() => handleQuantityChange(1)} disabled={quantity >= book.quantity}>+</button>
                        </div>
                        <button 
                            className="add-to-cart-btn" 
                            disabled={book.quantity <= 0}
                            onClick={handleAddToCart}
                        >
                            THÊM VÀO GIỎ
                        </button>
                        <button 
                            className="buy-now-btn" 
                            disabled={book.quantity <= 0}
                            onClick={handleBuyNow}
                        >
                            MUA NGAY
                        </button>
                    </div>

                    <div className="book-extras">
                        <button className="extra-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            Yêu thích
                        </button>
                        <button className="extra-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"></path></svg>
                            So sánh
                        </button>
                        <button className="extra-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            Chia sẻ
                        </button>
                    </div>

                    <div className="guarantees">
                        <div className="g-item">
                            <div className="g-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                            </div>
                            <span>Giao hàng toàn quốc</span>
                        </div>
                        <div className="g-item">
                            <div className="g-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            </div>
                            <span>Hoàn tiền nếu sách lỗi</span>
                        </div>
                        <div className="g-item">
                            <div className="g-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                            </div>
                            <span>Thanh toán bảo mật</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="book-tabs">
                <div className="tab-headers">
                    <button 
                        className={activeTab === 'description' ? 'active' : ''} 
                        onClick={() => setActiveTab('description')}
                    >
                        Mô tả chi tiết
                    </button>
                    <button 
                        className={activeTab === 'info' ? 'active' : ''} 
                        onClick={() => setActiveTab('info')}
                    >
                        Thông tin bổ sung
                    </button>
                    <button 
                        className={activeTab === 'reviews' ? 'active' : ''} 
                        onClick={() => setActiveTab('reviews')}
                    >
                        Đánh giá ({reviews.length})
                    </button>
                </div>
                <div className="tab-content glass">
                    {activeTab === 'description' && (
                        <div className="tab-pane fade-in">
                            <div className="description-header">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                <h3>Về tác phẩm "{book.title}"</h3>
                            </div>
                            <div className="description-content">
                                {book.description ? (
                                    <div dangerouslySetInnerHTML={{ __html: book.description.replace(/\n/g, '<br/>') }} />
                                ) : (
                                    <p>Từng trang sách mở ra một thế giới mới, nơi kiến thức và cảm xúc hòa quyện. Chúng tôi cam kết mang đến cho bạn những bản in chất lượng nhất với trải nghiệm mua sắm tuyệt vời.</p>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'info' && (
                        <div className="tab-pane fade-in">
                            <div className="info-grid">
                                <div className="info-item-alt">
                                    <div className="i-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>
                                    <div className="i-text">
                                        <span className="i-label">Nhà xuất bản</span>
                                        <span className="i-value">{book.publisher || "Đang cập nhật"}</span>
                                    </div>
                                </div>
                                <div className="info-item-alt">
                                    <div className="i-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>
                                    <div className="i-text">
                                        <span className="i-label">Năm xuất bản</span>
                                        <span className="i-value">{book.publicationYear || "2024"}</span>
                                    </div>
                                </div>
                                <div className="info-item-alt">
                                    <div className="i-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21H3V3h18v18zM3 12h18M12 3v18"></path></svg></div>
                                    <div className="i-text">
                                        <span className="i-label">Kích thước</span>
                                        <span className="i-value">{book.dimensions || "14.5 x 20.5 cm"}</span>
                                    </div>
                                </div>
                                <div className="info-item-alt">
                                    <div className="i-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></div>
                                    <div className="i-text">
                                        <span className="i-label">Loại bìa</span>
                                        <span className="i-value">{book.coverType || "Bìa mềm"}</span>
                                    </div>
                                </div>
                                <div className="info-item-alt">
                                    <div className="i-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></div>
                                    <div className="i-text">
                                        <span className="i-label">Số trang</span>
                                        <span className="i-value">{book.numberOfPages || "250"} trang</span>
                                    </div>
                                </div>
                                <div className="info-item-alt">
                                    <div className="i-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></div>
                                    <div className="i-text">
                                        <span className="i-label">Ngôn ngữ</span>
                                        <span className="i-value">{book.language || "Tiếng Việt"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className="tab-pane fade-in">
                            <div className="reviews-summary">
                                <div className="rating-avg">
                                    <h4>{avgRating}</h4>
                                    <div className="stars">{renderStars(avgRating)}</div>
                                    <p>Dựa trên {reviews.length} đánh giá</p>
                                </div>
                                <div className="rating-bars">
                                    {[5, 4, 3, 2, 1].map(star => {
                                        const count = reviews.filter(r => r.rating === star).length;
                                        const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                        return (
                                            <div key={star} className="rating-bar-row">
                                                <span>{star} ⭐</span>
                                                <div className="bar-bg">
                                                    <div className="bar-fill" style={{ width: `${percent}%` }}></div>
                                                </div>
                                                <span className="star-count">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Review Form (Conditional) */}
                            {canReview && (
                                <div className="add-review-section">
                                    <h3>Viết đánh giá của bạn</h3>
                                    <form onSubmit={handleSubmitReview}>
                                        <div className="rating-selector">
                                            <span>Chọn số sao: </span>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <button 
                                                    key={s} 
                                                    type="button"
                                                    className={newReview.rating >= s ? 'active' : ''}
                                                    onClick={() => setNewReview({...newReview, rating: s})}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                        <textarea 
                                            placeholder="Cảm nhận của bạn về cuốn sách này..."
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                            required
                                        ></textarea>
                                        <button type="submit" className="submit-review-btn" disabled={submitting}>
                                            {submitting ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Review List */}
                            <div className="review-list">
                                {reviews.length > 0 ? (
                                    reviews.map(review => (
                                        <div key={review.id} className="review-item">
                                            <div className="review-header">
                                                <div className="user-info">
                                                    <div className="user-avatar">
                                                        {review.user?.fullName?.charAt(0) || review.user?.username?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="user-name">{review.user?.fullName || review.user?.username}</p>
                                                        <p className="review-date">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                </div>
                                                <div className="review-stars">{renderStars(review.rating)}</div>
                                            </div>
                                            <p className="review-comment">{review.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-reviews">
                                        <p>Chưa có đánh giá nào cho cuốn sách này. 
                                            {!canReview && " Chỉ những khách hàng đã mua sản phẩm mới có thể đánh giá."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <LoginPromptModal 
                isOpen={showLoginPrompt} 
                onClose={() => setShowLoginPrompt(false)}
                onConfirm={() => navigate('/login')}
                message={promptMessage}
            />

            {/* Related Books */}
            {relatedBooks.length > 0 && (
                <section className="related-books">
                    <h2 className="section-title">Sách Cùng Thể Loại</h2>
                    <div className="related-grid">
                        {relatedBooks.map(b => (
                            <Link to={`/book/${b.id}`} key={b.id} className="related-card-alt glass">
                                <div className="related-img">
                                    <img src={getBookImg(b.imagePath)} alt={b.title} />
                                </div>
                                <div className="related-details">
                                    <h4>{b.title}</h4>
                                    <p className="r-author">{b.author}</p>
                                    <p className="r-price">{formatCurrency(b.isOnSale ? b.discountPrice : b.price)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default BookDetail;
