import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './BookFormModal.css';
import StatusModal from './StatusModal';

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
    const [imagePreview, setImagePreview] = useState(null);
    const [subImages, setSubImages] = useState([]);
    const [subImagePreviews, setSubImagePreviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [activeSection, setActiveSection] = useState('basic');
    const [statusData, setStatusData] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
    });
    const fileInputRef = useRef(null);
    const subFilesInputRef = useRef(null);

    // Role detection for customization
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isAuthor = roles.includes('ROLE_AUTHOR') || roles.includes('AUTHOR');
    const authorName = localStorage.getItem('fullName') || localStorage.getItem('username');

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
            if (book.imagePath) {
                const previewUrl = book.imagePath.startsWith('/images/') 
                    ? `http://localhost:8080${book.imagePath}`
                    : `http://localhost:8080/images/${book.imagePath.split('/').pop()}`;
                setImagePreview(previewUrl);
            }
        } else if (isAuthor) {
            // Pre-fill author name for new books by authors
            setFormData(prev => ({ ...prev, author: authorName }));
        }
    }, [book, isAuthor, authorName]);

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
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setSubImages(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setSubImagePreviews(previews);
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
        
        // Add book source for tracking
        if (isAuthor || book?.bookSource === 'AUTHOR') {
            data.append('bookSource', 'AUTHOR');
        }

        try {
            const apiPath = isAuthor ? 'author/books' : 'staff/books';
            if (book && book.id) {
                await api.put(`${apiPath}/${book.id}`, data);
                showStatus('success', 'Thành công', `Thông tin tác phẩm "${formData.title}" đã được cập nhật vào hệ thống.`);
            } else {
                await api.post(apiPath, data);
                showStatus('success', 'Phát hành thành công', `Tác phẩm mới "${formData.title}" đã được ghi nhận và sẵn sàng phục vụ độc giả.`);
            }
        } catch (err) {
            console.error("Lỗi khi lưu sách:", err);
            const errorMessage = err.response?.data?.message || err.response?.data || err.message;
            showStatus('error', 'Lỗi lưu dữ liệu', typeof errorMessage === 'object' ? 'Có lỗi xảy ra khi xác thực dữ liệu từ máy chủ.' : errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const showStatus = (type, title, message) => {
        setStatusData({
            isOpen: true,
            type,
            title,
            message,
        });
    };

    const handleConfirmStatus = () => {
        const isSuccess = statusData.type === 'success';
        setStatusData(prev => ({ ...prev, isOpen: false }));
        if (isSuccess) {
            onSuccess();
            onClose();
        }
    };

    const sections = [
        { id: 'basic', label: 'Thông tin cơ bản', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> },
        { id: 'content', label: 'Mô tả & Nội dung', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
        { id: 'specs', label: 'Thông số kĩ thuật', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> },
        { id: 'gallery', label: 'Ảnh chi tiết', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="book-modal" onClick={e => e.stopPropagation()}>
                <aside className="modal-sidebar">
                    <div className="sidebar-header">
                        <h2>{isAuthor ? 'AUTHOR' : 'SYSTEM'}</h2>
                        <p>{isAuthor ? 'CONSOLE / WORKS' : 'WORKSPACE / BOOKS'}</p>
                    </div>
                    <nav className="modal-tabs-vertical">
                        {sections.map(s => (
                            <button 
                                key={s.id}
                                type="button"
                                className={`tab-btn-v ${activeSection === s.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(s.id)}
                            >
                                {s.icon}
                                <span>{s.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="modal-main">
                    <button className="close-btn close-modal-fixed" onClick={onClose} title="Đóng">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    <form onSubmit={handleSubmit} className="modal-form-container">
                        <div className="modal-content-scroll">
                            <header className="section-head">
                                <h3>{sections.find(s => s.id === activeSection)?.label}</h3>
                                <p>{book ? 'Đang hiệu chỉnh thông tin tác phẩm hiện có' : 'Thiết lập các thông số ban đầu cho đầu sách mới'}</p>
                            </header>

                            {activeSection === 'basic' && (
                                <div className="fade-in">
                                    <div className="upload-grid" style={{marginBottom: '32px'}}>
                                        <div 
                                            className={`main-cover-upload ${imagePreview ? 'has-image' : ''}`}
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                onChange={handleImageChange} 
                                                accept="image/*" 
                                                style={{display:'none'}}
                                            />
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Bìa sách" />
                                            ) : (
                                                <div className="upload-placeholder">
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                                    <span>Tải lên bìa sách</span>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '20px'}}>
                                            <div className="input-block">
                                                <label>Tên sách</label>
                                                <div className="input-wrapper">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                                    <input name="title" value={formData.title} onChange={handleChange} required placeholder="Ví dụ: Đắc Nhân Tâm" />
                                                </div>
                                            </div>
                                            <div className="input-block">
                                                <label>Tác giả</label>
                                                <div className="input-wrapper">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                    <input name="author" value={formData.author} onChange={handleChange} required placeholder="Tên tác giả" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-grid-2">
                                        <div className="input-block">
                                            <label>Danh mục</label>
                                            <div className="input-wrapper">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                                                    <option value="">Chọn danh mục...</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="input-block">
                                            <label>Giá bán (VNĐ)</label>
                                            <div className="input-wrapper">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="input-block">
                                        <label>Số lượng trong kho</label>
                                        <div className="input-wrapper">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"></path><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6"></path><path d="M3 8h18"></path><path d="M3 12h18"></path></svg>
                                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'content' && (
                                <div className="fade-in">
                                    <div className="input-block">
                                        <label>Mô tả chi tiết tác phẩm</label>
                                        <div className="input-wrapper" style={{display:'block'}}>
                                            <textarea 
                                                name="description" 
                                                value={formData.description} 
                                                onChange={handleChange} 
                                                placeholder="Sử dụng tab này để nhập các thông tin tóm tắt, đánh giá chuyên môn, hoặc trích dẫn hay..."
                                                rows="12"
                                                style={{paddingLeft: '18px'}}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'specs' && (
                                <div className="fade-in">
                                    <div className="form-grid-2">
                                        <div className="input-block">
                                            <label>Nhà xuất bản</label>
                                            <div className="input-wrapper">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4"></path><line x1="5" y1="21" x2="5" y2="10"></line><line x1="9" y1="21" x2="9" y2="10"></line><line x1="15" y1="21" x2="15" y2="10"></line><line x1="19" y1="21" x2="19" y2="10"></line></svg>
                                                <input name="publisher" value={formData.publisher} onChange={handleChange} placeholder="NXB Trẻ, NXB Giáo Dục..." />
                                            </div>
                                        </div>
                                        <div className="input-block">
                                            <label>Năm xuất bản</label>
                                            <div className="input-wrapper">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                <input type="number" name="publicationYear" value={formData.publicationYear} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-grid-2">
                                        <div className="input-block">
                                            <label>Kích thước</label>
                                            <div className="input-wrapper">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
                                                <input name="dimensions" value={formData.dimensions} onChange={handleChange} placeholder="14x20 cm" />
                                            </div>
                                        </div>
                                        <div className="input-block">
                                            <label>Loại bìa</label>
                                            <div className="input-wrapper">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                                                <input name="coverType" value={formData.coverType} onChange={handleChange} placeholder="Bìa mềm / Bìa cứng" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-grid-2">
                                        <div className="input-block">
                                            <label>Số trang</label>
                                            <div className="input-wrapper">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                                                <input type="number" name="numberOfPages" value={formData.numberOfPages} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="input-block">
                                            <label>Ngôn ngữ</label>
                                            <div className="input-wrapper">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                                <input name="language" value={formData.language} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'gallery' && (
                                <div className="fade-in">
                                    <div 
                                        className="main-cover-upload" 
                                        style={{width: '100%', height: 'auto', padding: '40px', borderStyle: 'dashed'}}
                                        onClick={() => subFilesInputRef.current.click()}
                                    >
                                        <input 
                                            type="file" 
                                            ref={subFilesInputRef} 
                                            multiple 
                                            onChange={handleSubImagesChange} 
                                            accept="image/*" 
                                            style={{display:'none'}}
                                        />
                                        <div className="upload-placeholder">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line></svg>
                                            <span style={{color: '#0f172a', fontSize: '1rem'}}>Thêm ảnh phụ chi tiết</span>
                                            <p style={{margin: 0, fontSize: '0.8rem', color: '#64748b'}}>Hỗ trợ tải lên nhiều tệp cùng lúc (JPG, PNG)</p>
                                        </div>
                                    </div>
                                    
                                    <div className="gallery-grid-v">
                                        {subImagePreviews.map((url, idx) => (
                                            <div key={idx} className="gallery-item-v fade-in">
                                                <img src={url} alt="sub-preview" />
                                                <button type="button" className="remove-img-btn" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSubImagePreviews(prev => prev.filter((_, i) => i !== idx));
                                                    setSubImages(prev => prev.filter((_, i) => i !== idx));
                                                }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <footer className="modal-footer-v">
                            <div className="footer-info">
                                <span style={{fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase'}}>
                                    {submitting ? 'Hệ thống đang đồng bộ dữ liệu...' : 'Các thay đổi sẽ được lưu tức thì'}
                                </span>
                            </div>
                            <div className="footer-actions">
                                <button type="button" className="btn-premium-v ghost" onClick={onClose}>
                                    HUỶ BỎ
                                </button>
                                <button type="submit" className="btn-premium-v primary" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                                            ĐANG XỬ LÝ...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            {book ? 'LƯU THAY ĐỔI' : 'PHÁT HÀNH NGAY'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </footer>
                    </form>
                </main>
            </div>
            
            {statusData.isOpen && (
                <StatusModal 
                    type={statusData.type}
                    title={statusData.title}
                    message={statusData.message}
                    onConfirm={handleConfirmStatus}
                    onCancel={() => setStatusData(prev => ({ ...prev, isOpen: false }))}
                />
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default BookFormModal;
