import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './BookFormModal.css';

const BookFormModal = ({ book, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        price: '',
        categoryId: '',
        quantity: 0,
        description: '',
        publisher: '',
        publicationYear: 2024,
        dimensions: '',
        coverType: '',
        numberOfPages: '',
        language: 'Tiếng Việt'
    });
    const [image, setImage] = useState(null);
    const [subImages, setSubImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [activeSection, setActiveSection] = useState('basic');

    useEffect(() => {
        fetchCategories();
        if (book) {
            setFormData({
                title: book.title || '',
                author: book.author || '',
                price: book.price || '',
                categoryId: book.category?.id || '',
                quantity: book.quantity || 0,
                description: book.description || '',
                publisher: book.publisher || '',
                publicationYear: book.publicationYear || 2024,
                dimensions: book.dimensions || '',
                coverType: book.coverType || '',
                numberOfPages: book.numberOfPages || '',
                language: book.language || 'Tiếng Việt'
            });
        }
    }, [book]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('public/categories');
            setCategories(res.data);
        } catch (err) {
            console.error("Lỗi khi tải danh mục:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubImagesChange = (e) => {
        setSubImages(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        if (image) {
            data.append('image', image);
        }
        if (subImages.length > 0) {
            subImages.forEach(file => {
                data.append('subImages', file);
            });
        }

        try {
            if (book) {
                await api.post(`staff/books/update/${book.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('staff/books/add', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onSuccess();
        } catch (err) {
            alert("Lỗi khi lưu sách: " + (err.response?.data || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="book-modal card-premium fade-in">
                <header className="modal-header">
                    <h2>{book ? 'Chỉnh sửa Tác phẩm' : 'Thêm Sách mới'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </header>

                <div className="modal-tabs-nav">
                    <button 
                        className={activeSection === 'basic' ? 'active' : ''} 
                        onClick={() => setActiveSection('basic')}
                    >
                        Thông tin cơ bản
                    </button>
                    <button 
                        className={activeSection === 'content' ? 'active' : ''} 
                        onClick={() => setActiveSection('content')}
                    >
                        Mô tả chi tiết
                    </button>
                    <button 
                        className={activeSection === 'specs' ? 'active' : ''} 
                        onClick={() => setActiveSection('specs')}
                    >
                        Thông số kỹ thuật
                    </button>
                    <button 
                        className={activeSection === 'gallery' ? 'active' : ''} 
                        onClick={() => setActiveSection('gallery')}
                    >
                        Ảnh phụ
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {activeSection === 'basic' && (
                        <div className="form-section fade-in">
                            <div className="form-group">
                                <label>Tên sách</label>
                                <input name="title" value={formData.title} onChange={handleChange} required placeholder="Ví dụ: Đắc Nhân Tâm" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tác giả</label>
                                    <input name="author" value={formData.author} onChange={handleChange} required placeholder="Tên tác giả" />
                                </div>
                                <div className="form-group">
                                    <label>Danh mục</label>
                                    <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                                        <option value="">Chọn một...</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.categoryName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Giá bán (VNĐ)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Số lượng kho</label>
                                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Hình ảnh bìa</label>
                                <input type="file" onChange={handleImageChange} accept="image/*" />
                                {book && !image && <small>Để trống nếu không muốn đổi ảnh cũ</small>}
                            </div>
                        </div>
                    )}

                    {activeSection === 'content' && (
                        <div className="form-section fade-in">
                            <div className="form-group">
                                <label>Mô tả chi tiết (Nội dung sẽ hiển thị ở Tab Mô tả)</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    placeholder="Nhập giới thiệu về cuốn sách, nội dung chính, các chương..."
                                    rows="15"
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {activeSection === 'specs' && (
                        <div className="form-section fade-in">
                             <div className="form-row">
                                <div className="form-group">
                                    <label>Nhà xuất bản</label>
                                    <input name="publisher" value={formData.publisher} onChange={handleChange} placeholder="NXB Trẻ, NXB Giáo Dục..." />
                                </div>
                                <div className="form-group">
                                    <label>Năm xuất bản</label>
                                    <input type="number" name="publicationYear" value={formData.publicationYear} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Kích thước</label>
                                    <input name="dimensions" value={formData.dimensions} onChange={handleChange} placeholder="14x20 cm" />
                                </div>
                                <div className="form-group">
                                    <label>Loại bìa</label>
                                    <input name="coverType" value={formData.coverType} onChange={handleChange} placeholder="Bìa mềm / Bìa cứng" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Số trang</label>
                                    <input type="number" name="numberOfPages" value={formData.numberOfPages} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Ngôn ngữ</label>
                                    <input name="language" value={formData.language} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'gallery' && (
                        <div className="form-section fade-in">
                            <div className="form-group">
                                <label>Tải lên nhiều ảnh phụ (Sẽ hiển thị dưới ảnh bìa)</label>
                                <input 
                                    type="file" 
                                    multiple 
                                    onChange={handleSubImagesChange} 
                                    accept="image/*" 
                                />
                                <div className="image-preview-grid">
                                    {subImages.map((file, idx) => (
                                        <div key={idx} className="preview-item">
                                            <img src={URL.createObjectURL(file)} alt="preview" />
                                        </div>
                                    ))}
                                </div>
                                {book && book.subImages?.length > 0 && <small>Lưu ý: Tải ảnh mới sẽ thay thế toàn bộ ảnh phụ cũ.</small>}
                            </div>
                        </div>
                    )}

                    <footer className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>HỦY BỎ</button>
                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? 'ĐANG LƯU...' : (book ? 'CẬP NHẬT' : 'THÊM MỚI')}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default BookFormModal;
