import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './CategoryFormModal.css';

const CategoryFormModal = ({ category, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('📚');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setName(category.name || '');
            setIcon(category.icon || '📚');
        }
    }, [category]);

    const availableIcons = ['📚', '🎨', '🔬', '💻', '🍳', '🏃', '🧒', '💼', '🏡', '🗺️', '🧠', '🎭'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { name, icon };
            if (category) {
                await api.put(`staff/categories/${category.id}`, payload);
            } else {
                await api.post('staff/categories', payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Lỗi khi lưu danh mục:", err);
            alert("Có lỗi xảy ra: " + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="category-modal" onClick={e => e.stopPropagation()}>
                <header className="category-modal-header">
                    <h2>{category ? 'Hiệu chỉnh danh mục' : 'Thêm danh mục mới'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </header>
                
                <form onSubmit={handleSubmit}>
                    <div className="category-modal-body">
                        <div className="category-form">
                            <div className="input-block">
                                <label>Tên danh mục</label>
                                <div className="input-wrapper">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{position:'absolute', left: 16, color: '#94a3b8'}}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                        placeholder="Ví dụ: Kỹ năng sống, Lập trình..."
                                        style={{paddingLeft: '48px'}}
                                    />
                                </div>
                            </div>

                            <div className="input-block">
                                <label>Biểu tượng đại diện</label>
                                <div className="icon-selector-grid">
                                    {availableIcons.map(i => (
                                        <div 
                                            key={i} 
                                            className={`icon-option ${icon === i ? 'selected' : ''}`}
                                            onClick={() => setIcon(i)}
                                        >
                                            <span style={{fontSize: '1.2rem'}}>{i}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="category-modal-footer">
                        <button type="button" className="btn-category cancel" onClick={onClose}>HUỶ</button>
                        <button type="submit" className="btn-category save" disabled={loading}>
                            {loading ? 'ĐANG LƯU...' : (category ? 'CẬP NHẬT' : 'THÊM MỚI')}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default CategoryFormModal;
