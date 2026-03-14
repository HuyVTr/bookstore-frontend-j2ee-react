import React, { useState } from 'react';
import api from '../../services/api';
import './ReviewModal.css';

const ReviewModal = ({ book, isOpen, onClose, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // If modal is not open or no book is selected, render nothing
    if (!isOpen || !book) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            setError("Vui lòng chọn số sao đánh giá.");
            return;
        }

        if (comment.trim().length < 10) {
            setError("Bình luận đánh giá cần ít nhất 10 ký tự.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await api.post('/user/reviews', {
                bookId: book.id,
                rating,
                comment: comment.trim()
            });
            onSuccess(); // Triggers a reload or notification in parent
            onClose(); // Close modal
        } catch (err) {
            setError(err.response?.data || "Đã xảy ra lỗi khi gửi đánh giá.");
        } finally {
            setLoading(false);
        }
    };

    const getBookImg = (path) => {
        if (!path) return 'https://via.placeholder.com/150?text=No+Cover';
        if (path.startsWith('http')) return path;
        const fileName = path.split('/').pop();
        return `http://localhost:8080/images/${fileName}`;
    };

    return (
        <div className="review-modal-overlay fadeIn">
            <div className="review-modal-content scaleUp">
                <button className="close-review-btn" onClick={onClose}>&times;</button>
                
                <div className="review-header">
                    <h2>Đánh Giá Sản Phẩm</h2>
                    <p>Chia sẻ trải nghiệm của bạn về cuốn sách này</p>
                </div>

                <div className="review-book-info">
                    <img 
                        src={getBookImg(book.imagePath)} 
                        alt={book.title} 
                        className="review-book-img"
                    />
                    <div>
                        <h4 className="review-book-title">{book.title}</h4>
                        <span className="review-book-author">{book.author}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="review-form">
                    <div className="rating-section">
                        <label>Chất lượng sản phẩm</label>
                        <div className="stars-container">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    className={`star-btn ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <span className="rating-text-feedback">
                            {rating === 1 && "Tệ"}
                            {rating === 2 && "Không hài lòng"}
                            {rating === 3 && "Bình thường"}
                            {rating === 4 && "Hài lòng"}
                            {rating === 5 && "Tuyệt vời"}
                        </span>
                    </div>

                    <div className="comment-section">
                        <label htmlFor="reviewComment">Cảm nhận chi tiết</label>
                        <textarea
                            id="reviewComment"
                            rows="4"
                            placeholder="Chia sẻ thêm về độ sắc nét của hình ảnh, nội dung, bìa sách..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <span className="char-count">{comment.length}/500 ký tự</span>
                    </div>

                    {error && <div className="review-error-msg">{error}</div>}

                    <div className="review-actions">
                        <button type="button" className="btn-review-cancel" onClick={onClose} disabled={loading}>
                            Trở Lại
                        </button>
                        <button type="submit" className="btn-review-submit" disabled={loading}>
                            {loading ? 'Đang Gửi...' : 'Hoàn Thành'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
