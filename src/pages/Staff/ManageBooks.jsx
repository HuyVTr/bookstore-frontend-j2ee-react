import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BookFormModal from '../../components/Staff/BookFormModal';
import StatusModal from '../../components/Staff/StatusModal';
import './ManageBooks.css';

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [statusData, setStatusData] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
        onConfirm: null
    });

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const queryParams = [];
            if (searchTerm) queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
            if (filterCategory) queryParams.push(`category=${encodeURIComponent(filterCategory)}`);
            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
            const response = await api.get(`public/books${queryString}`);
            const data = response.data;
            setBooks(data.books ? data.books : data);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('public/categories');
            setCategories(res.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchBooks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showStatus = (type, title, message, onConfirm = null) => {
        setStatusData({
            isOpen: true,
            type,
            title,
            message,
            onConfirm
        });
    };

    const closeStatus = () => setStatusData(prev => ({ ...prev, isOpen: false }));

    const handleDelete = (id) => {
        showStatus(
            'confirm',
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa cuốn sách này không? Thao tác này không thể hoàn tác.',
            async () => {
                closeStatus();
                try {
                    await api.delete(`staff/books/${id}`);
                    fetchBooks();
                    showStatus('success', 'Thành công', 'Đã xóa sách khỏi hệ thống.');
                } catch (error) {
                    console.error('Error deleting book:', error);
                    showStatus('error', 'Lỗi', 'Không thể xóa sách. Có thể sách này đã được đặt mua.');
                }
            }
        );
    };

    const handleToggleFeatured = async (book) => {
        try {
            const res = await api.patch(`staff/books/${book.id}/featured`);
            setBooks(prev => prev.map(b =>
                b.id === book.id ? { ...b, isFeatured: res.data.isFeatured } : b
            ));
        } catch (error) {
            console.error('Error toggling featured:', error);
            showStatus('error', 'Lỗi', 'Có lỗi xảy ra khi cập nhật trạng thái nổi bật.');
        }
    };

    const handleOpenModal = (book = null) => {
        setSelectedBook(book);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBook(null);
    };

    const StarRating = ({ rating, count }) => {
        const stars = Math.round(rating || 0);
        return (
            <div className="book-inline-rating">
                {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ color: s <= stars ? '#f59e0b' : '#cbd5e1', fontSize: '12px' }}>★</span>
                ))}
                <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 4 }}>({count || 0})</span>
            </div>
        );
    };

    return (
        <div className="staff-page-content fade-in">
            <header className="manage-header-premium">
                <div className="header-text">
                    <h1>Kho lưu trữ sách</h1>
                    <p>Quản lý toàn bộ danh mục và số lượng tồn kho của hiệu sách.</p>
                </div>
                <button className="add-book-btn-premium" onClick={() => handleOpenModal()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Thêm sách mới</span>
                </button>
            </header>

            <div className="filters-bar-premium">
                <div className="search-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên sách hoặc tác giả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchBooks()}
                    />
                </div>
                <div className="filter-actions">
                    <select
                        className="premium-select"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                    <button className="filter-btn" onClick={fetchBooks}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9v9l4-3v-6l8-9z"></path></svg>
                        Lọc
                    </button>
                </div>
            </div>

            <div className="books-table-wrapper-premium">
                {loading ? (
                    <div className="loading-state">
                        <div className="shimmer-row"></div>
                        <div className="shimmer-row"></div>
                        <div className="shimmer-row"></div>
                    </div>
                ) : (
                    <div className="books-grid-premium">
                        <div className="grid-header-premium">
                            <div className="col-info">Thông tin sách</div>
                            <div className="col-cat">Danh mục</div>
                            <div className="col-staff">Người đăng</div>
                            <div className="col-price">Giá bán</div>
                            <div className="col-stock">Tồn kho</div>
                            <div className="col-actions">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '8px', opacity: 0.8 }}><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M20 12h2"></path><path d="M2 12h2"></path></svg>
                                Thao tác
                            </div>
                        </div>
                        {books.length > 0 ? books.map((book, index) => (
                            <div key={book.id} className={`book-row-premium stagger-${(index % 5) + 1}`}>
                                <div className="col-info">
                                    <div className="book-meta-premium">
                                        <div className="book-img-wrap">
                                            <img
                                                src={!book.imagePath ? 'https://via.placeholder.com/60x80' : 
                                                     book.imagePath.startsWith('/images/') ? `http://localhost:8080${book.imagePath}` : 
                                                     `http://localhost:8080/images/${book.imagePath.split('/').pop()}`}
                                                alt={book.title}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/60x80'; }}
                                            />
                                        </div>
                                        <div className="book-details">
                                            <span className="book-title">{book.title}</span>
                                            <span className="book-author">{book.author}</span>
                                            <StarRating rating={book.averageRating} count={book.reviewCount} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-cat">
                                    <span className="badge-premium category">{book.category?.name || 'N/A'}</span>
                                </div>
                                <div className="col-staff">
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{book.createdBy || 'Hệ thống'}</span>
                                </div>
                                <div className="col-price">
                                    <span className="price-text" style={{ fontVariantNumeric: 'tabular-nums' }}>{book.price?.toLocaleString()}đ</span>
                                </div>
                                <div className="col-stock">
                                    <div className="stock-level">
                                        <div className="stock-bar">
                                            <div
                                                className={`stock-fill ${book.quantity < 10 ? 'low' : ''}`}
                                                style={{ width: `${Math.min((book.quantity / 50) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className={book.quantity < 10 ? 'text-low' : ''}>{book.quantity} cuốn</span>
                                    </div>
                                </div>
                                <div className="col-actions">
                                    <div className="actions-wrap">
                                        <button
                                            className={`action-btn featured${book.isFeatured ? ' active' : ''}`}
                                            onClick={() => handleToggleFeatured(book)}
                                            title={book.isFeatured ? 'Bỏ nổi bật' : 'Đưa lên nổi bật'}
                                            aria-label={book.isFeatured ? 'Bỏ nổi bật' : 'Đưa lên nổi bật'}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill={book.isFeatured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ display: 'block' }}>
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                            </svg>
                                        </button>
                                        <button className="action-btn edit" onClick={() => handleOpenModal(book)} title="Sửa" aria-label="Sửa thông tin sách">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'block' }}>
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(book.id)} title="Xóa" aria-label="Xóa sách">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'block' }}>
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state-premium">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                <p>Chưa có quyển sách nào trong kho của bạn.</p>
                                <button className="add-book-btn-premium" onClick={() => handleOpenModal()}>Bắt đầu thêm ngay</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <BookFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    book={selectedBook}
                    onSuccess={fetchBooks}
                />
            )}

            {statusData.isOpen && (
                <StatusModal
                    type={statusData.type}
                    title={statusData.title}
                    message={statusData.message}
                    onConfirm={statusData.onConfirm}
                    onCancel={closeStatus}
                    confirmText={statusData.type === 'confirm' ? 'Xác nhận xóa' : 'Đã hiểu'}
                    cancelText={statusData.type === 'confirm' ? 'Hủy bỏ' : null}
                />
            )}
        </div>
    );
};

export default ManageBooks;
