import React, { useState } from 'react';
import api from '../../services/api';
import './ReviewSection.css';

const ReviewSection = ({ bookId, reviews, canReview, onReviewSubmitted }) => {
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('user/reviews', {
                bookId,
                rating: newReview.rating,
                comment: newReview.comment
            });
            onReviewSubmitted();
            setNewReview({ rating: 5, comment: '' });
            alert("Cảm ơn bạn đã đóng góp ý kiến!");
        } catch (error) {
            alert(error.response?.data || "Lỗi khi gửi đánh giá.");
        } finally {
            setSubmitting(false);
        }
    };

    // --- Helper Functions ---
    const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1) 
        : "0.0";

    const formatDate = (dateInput) => {
        if (!dateInput) return "Gần đây";
        // Handle Java LocalDateTime Array [YYYY, MM, DD, HH, mm, ss, ns]
        if (Array.isArray(dateInput)) {
            const [year, month, day, hour = 0, min = 0] = dateInput;
            return `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year} lúc ${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
        }
        // Handle ISO string (e.g., "2026-03-14T12:30:00")
        if (typeof dateInput === 'string') {
            const date = new Date(dateInput);
            if (!isNaN(date.getTime())) {
                return date.toLocaleString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
            }
        }
        return "N/A";
    };

    const renderStars = (rating) => {
        const val = Math.round(Number(rating) || 0);
        return (
            <div className="star-display">
                {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={s <= val ? 'star fill' : 'star'}>★</span>
                ))}
            </div>
        );
    };

    return (
        <div className="review-section-container">
            <div className="reviews-analytics glass">
                <div className="analytics-left">
                    <div className="big-rating-score">{avgRating}</div>
                    <div className="big-stars">{renderStars(avgRating)}</div>
                    <div className="total-reviews-count">{reviews.length} nhận xét từ khách hàng</div>
                </div>
                
                <div className="analytics-right">
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => Math.round(r.rating || 0) === star).length;
                        const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                            <div key={star} className="rating-progress-row">
                                <span className="star-label">{star} sao</span>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                                </div>
                                <span className="count-label">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {canReview && (
                <div className="add-review-card glass fade-in">
                    <h3>✍️ Viết đánh giá của bạn</h3>
                    <p>Chia sẻ cảm nhận của bạn để giúp những người mua khác lựa chọn tốt hơn.</p>
                    
                    <form onSubmit={handleSubmit} className="review-form-pro">
                        <div className="rating-picker-wrapper">
                            <label>Bạn đánh giá cuốn sách này mấy sao?</label>
                            <div className="rating-stars-picker">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        className={`star-btn ${s <= (hoverRating || newReview.rating) ? 'active' : ''}`}
                                        onMouseEnter={() => setHoverRating(s)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setNewReview({ ...newReview, rating: s })}
                                    >
                                        ★
                                    </button>
                                ))}
                                <span className="rating-text-feedback">
                                    { (hoverRating || newReview.rating) === 5 && 'Tuyệt vời!' }
                                    { (hoverRating || newReview.rating) === 4 && 'Rất tốt' }
                                    { (hoverRating || newReview.rating) === 3 && 'Bình thường' }
                                    { (hoverRating || newReview.rating) === 2 && 'Hơi kém' }
                                    { (hoverRating || newReview.rating) === 1 && 'Tệ' }
                                </span>
                            </div>
                        </div>

                        <div className="comment-input-wrapper">
                            <textarea
                                placeholder="Hãy cho chúng tôi biết bạn thích (hoặc không thích) điều gì ở cuốn sách này..."
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                required
                                minLength="10"
                            ></textarea>
                            <small>Tối thiểu 10 ký tự</small>
                        </div>

                        <button type="submit" className="pro-submit-review-btn" disabled={submitting}>
                            {submitting ? 'ĐANG GỬI...' : 'ĐĂNG NHẬN XÉT'}
                        </button>
                    </form>
                </div>
            )}

            <div className="reviews-list-premium">
                <div className="list-header">
                    <h3>Nhận xét từ độc giả</h3>
                    <div className="list-sort">
                        <span>Sắp xếp: </span>
                        <select>
                            <option>Mới nhất</option>
                            <option>Đánh giá cao nhất</option>
                        </select>
                    </div>
                </div>

                {reviews.length > 0 ? (
                    <div className="reviews-grid-pro">
                        {reviews.map(review => (
                            <div key={review.id} className="review-card-pro glass-hover">
                                <div className="card-top">
                                    <div className="user-meta">
                                        <div className="u-avatar">
                                            {review.user?.fullName?.charAt(0) || review.user?.username?.charAt(0) || '?'}
                                        </div>
                                        <div className="u-info">
                                            <h4>{review.user?.fullName || review.user?.username}</h4>
                                            <div className="v-purchase">
                                                <span className="check-icon">✓</span> Đã mua hàng
                                            </div>
                                        </div>
                                    </div>
                                    <div className="r-stars">{renderStars(review.rating)}</div>
                                </div>
                                <div className="card-body">
                                    <p>{review.comment}</p>
                                </div>
                                <div className="card-footer">
                                    <span className="date">{formatDate(review.createdAt)}</span>
                                    <button className="like-review">Hữu ích (0)</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-reviews glass">
                        <div className="empty-icon">📖</div>
                        <h4>Chưa có nhận xét nào</h4>
                        <p>Hãy là người đầu tiên chia sẻ cảm nhận về cuốn sách này!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
