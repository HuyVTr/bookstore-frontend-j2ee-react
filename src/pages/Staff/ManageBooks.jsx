import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BookFormModal from '../../components/Staff/BookFormModal';
import './ManageBooks.css';

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await api.get('public/books');
            setBooks(res.data);
        } catch (err) {
            console.error("Lỗi khi tải danh sách sách:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingBook(null);
        setShowModal(true);
    };

    const handleEditClick = (book) => {
        setEditingBook(book);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa cuốn sách này?")) {
            try {
                await api.delete(`staff/books/${id}`); // Assuming delete is at /api/staff/books/{id}
                fetchBooks();
                alert("Đã xóa thành công!");
            } catch (err) {
                alert("Lỗi khi xóa: " + (err.response?.data || err.message));
            }
        }
    };

    return (
        <div className="manage-books-container container">
            <header className="manage-header">
                <div>
                    <h1>Quản lý Kho sách</h1>
                    <p>Cập nhật thông tin, mô tả và thông số kỹ thuật cho tác phẩm.</p>
                </div>
                <button className="add-btn-premium" onClick={handleAddClick}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    THÊM SÁCH MỚI
                </button>
            </header>

            {loading ? (
                <div className="loading-spinner">Đang tải dữ liệu...</div>
            ) : (
                <div className="books-table-wrapper card-premium">
                    <table className="books-table">
                        <thead>
                            <tr>
                                <th>Thông tin</th>
                                <th>Danh mục</th>
                                <th>Giá</th>
                                <th>Kho</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map(book => (
                                <tr key={book.id}>
                                    <td>
                                        <div className="book-info-cell">
                                            <img src={`http://localhost:8080/images/${book.imagePath}`} alt={book.title} />
                                            <div>
                                                <div className="b-title">{book.title}</div>
                                                <div className="b-author">{book.author}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge-category">{book.category?.categoryName}</span></td>
                                    <td><span className="b-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}</span></td>
                                    <td><span className={`b-stock ${book.quantity < 10 ? 'low' : ''}`}>{book.quantity}</span></td>
                                    <td>
                                        <div className="actions">
                                            <button onClick={() => handleEditClick(book)} title="Chỉnh sửa content & thông số">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button className="del-btn" onClick={() => handleDelete(book.id)}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <BookFormModal 
                    book={editingBook} 
                    onClose={() => setShowModal(false)} 
                    onSuccess={() => {
                        setShowModal(false);
                        fetchBooks();
                    }}
                />
            )}
        </div>
    );
};

export default ManageBooks;
