import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BookFormModal from '../../components/Staff/BookFormModal';
import StatusModal from '../../components/Staff/StatusModal';
import '../../pages/Staff/ManageBooks.css';
import SourceTag from '../../components/SourceTag/SourceTag';

const AuthorBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusData, setStatusData] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
        onConfirm: null
    });

    const fetchAuthorBooks = async () => {
        setLoading(true);
        try {
            const response = await api.get('author/books');
            setBooks(response.data);
        } catch (error) {
            console.error('Error fetching author books:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthorBooks();
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
            'Xác nhận gỡ bỏ',
            'Bạn có chắc muốn ngừng kinh doanh tác phẩm này? Hành động này sẽ ẩn sách khỏi cửa hàng.',
            async () => {
                closeStatus();
                try {
                    await api.delete(`author/books/${id}`);
                    fetchAuthorBooks();
                    showStatus('success', 'Thành công', 'Đã gỡ tác phẩm.');
                } catch (error) {
                    showStatus('error', 'Lỗi', 'Không thể gỡ tác phẩm. Vui lòng liên hệ quản trị viên.');
                }
            }
        );
    };

    const handleOpenModal = (book = null) => {
        setSelectedBook(book);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBook(null);
    };

    return (
        <div className="staff-page-content fade-in">
            <header className="manage-header-premium">
                <div className="header-text">
                    <h1>Tác phẩm của tôi 📚</h1>
                    <p>Đăng tải và quản lý các đầu sách do bạn sáng tác.</p>
                </div>
                <button className="add-book-btn-premium" style={{background: '#f59e0b'}} onClick={() => handleOpenModal()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Phát hành sách mới</span>
                </button>
            </header>

            <div className="filters-bar-premium">
                <div className="search-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tác phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="books-table-wrapper-premium">
                {loading ? (
                    <div className="loading-state">
                        <div className="shimmer-row"></div>
                        <div className="shimmer-row"></div>
                    </div>
                ) : (
                    <div className="books-grid-premium">
                        <div className="grid-header-premium">
                            <div className="col-info">Thông tin tác phẩm</div>
                            <div className="col-price">Giá bìa</div>
                            <div className="col-stock">Kho hiện có</div>
                            <div className="col-actions">Quản lý</div>
                        </div>
                        {books.length > 0 ? books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map((book, index) => (
                            <div key={book.id} className={`book-row-premium stagger-${(index % 5) + 1}`}>
                                <div className="col-info">
                                    <div className="book-meta-premium">
                                        <div className="book-img-wrap">
                                            <img
                                                src={!book.imagePath ? 'https://via.placeholder.com/60x80' : 
                                                     book.imagePath.startsWith('/images/') ? `http://localhost:8080${book.imagePath}` : 
                                                     `http://localhost:8080/images/${book.imagePath.split('/').pop()}`}
                                                alt={book.title}
                                            />
                                        </div>
                                        <div className="book-details">
                                            <span className="book-title">{book.title}</span>
                                            <SourceTag bookSource="AUTHOR" className="inline" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-price">
                                    <span className="price-text">{book.price?.toLocaleString()}đ</span>
                                </div>
                                <div className="col-stock">
                                    <span className={book.quantity < 5 ? 'text-low' : ''}>{book.quantity} bản</span>
                                </div>
                                <div className="col-actions">
                                    <div className="actions-wrap">
                                        <button className="action-btn edit" onClick={() => handleOpenModal(book)} title="Chỉnh sửa">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(book.id)} title="Gỡ bỏ">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state-premium">
                                <p>Bạn chưa phát hành tác phẩm nào.</p>
                                <button className="add-book-btn-premium" style={{background: '#f59e0b'}} onClick={() => handleOpenModal()}>Phát hành ngay</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <BookFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    book={{...selectedBook, bookSource: 'AUTHOR'}} // Auto-flag
                    onSuccess={fetchAuthorBooks}
                />
            )}
            
            {/* Note: I'm assuming StatusModal is in common or staff, for now using direct logic to avoid missing import errors */}
        </div>
    );
};

export default AuthorBooks;
