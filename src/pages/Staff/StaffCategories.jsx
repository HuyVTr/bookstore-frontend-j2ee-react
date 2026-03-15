import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CategoryFormModal from '../../components/Staff/CategoryFormModal';
import StatusModal from '../../components/Staff/StatusModal';
import './ManageBooks.css';

const StaffCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    // Status Modal State
    const [statusData, setStatusData] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
        confirmText: '',
        cancelText: '',
        onConfirm: null
    });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('public/categories');
            setCategories(res.data);
        } catch (err) {
            console.error("Lỗi tải danh mục:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (category = null) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedCategory(null);
        setIsModalOpen(false);
    };

    const showStatus = (type, title, message, onConfirm = null, confirmText = 'Đã hiểu', cancelText = null) => {
        setStatusData({
            isOpen: true,
            type,
            title,
            message,
            confirmText,
            cancelText,
            onConfirm
        });
    };

    const closeStatus = () => {
        setStatusData(prev => ({ ...prev, isOpen: false }));
    };

    const handleDeleteClick = (category) => {
        showStatus(
            'confirm',
            'Xác nhận xóa?',
            `Bạn đang hành động xóa danh mục "${category.name}". Hành động này không thể hoàn tác.`,
            () => executeDelete(category.id),
            'XÁC NHẬN XÓA',
            'QUAY LẠI'
        );
    };

    const executeDelete = async (id) => {
        closeStatus();
        try {
            await api.delete(`staff/categories/${id}`);
            fetchCategories();
            showStatus(
                'success',
                'Thành công!',
                'Danh mục đã được gỡ bỏ khỏi hệ thống an toàn.'
            );
        } catch (err) {
            console.error("Lỗi xóa danh mục:", err);
            const errorData = err.response?.data;
            const errorMsg = typeof errorData === 'string' 
                ? errorData 
                : (errorData?.message || "Hệ thống không thể xóa danh mục này. Vui lòng kiểm tra lại kết nối hoặc liên hệ kỹ thuật.");
            
            showStatus(
                'error',
                'Không thể xóa!',
                errorMsg
            );
        }
    };

    return (
        <div className="staff-page-content fade-in">
            <header className="manage-header-premium">
                <div className="header-text">
                    <h1>Danh mục sản phẩm</h1>
                    <p>Cấu trúc phân loại sách giúp khách hàng tìm kiếm dễ dàng hơn.</p>
                </div>
                <button className="add-book-btn-premium" onClick={() => handleOpenModal()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Thêm phân loại</span>
                </button>
            </header>

            <div className="books-table-wrapper-premium">
                {loading ? (
                    <div className="loading-state">
                        <div className="shimmer-row"></div>
                        <div className="shimmer-row"></div>
                    </div>
                ) : (
                    <div className="books-grid-premium">
                        <div className="grid-header-premium" style={{gridTemplateColumns: '80px 100px 1fr 1.5fr 150px'}}>
                            <div className="col-id">ID</div>
                            <div className="col-icon">Icon</div>
                            <div className="col-name">Tên danh mục</div>
                            <div className="col-desc">Sách hiện có</div>
                            <div className="col-actions">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{marginRight: '8px', opacity: 0.8}}><path d="m10 10 4.5 4.5"></path><path d="M9.9 5.9 5 7.4c-.9.3-1.1 1.4-.4 2l9.1 9.1c.6.6 1.7.4 2-.5l1.5-4.9"></path><path d="M13.2 18 2 22l4-11.2"></path><path d="M12 2v3"></path><path d="m18.5 5.5-2.2 2.2"></path><path d="M22 12h-3"></path></svg>
                                Thao tác
                            </div>
                        </div>
                        {categories.length > 0 ? categories.map((cat, index) => (
                            <div key={cat.id} className={`book-row-premium stagger-${(index % 5) + 1}`} style={{gridTemplateColumns: '80px 100px 1fr 1.5fr 150px'}}>
                                <div className="col-id">
                                    <span style={{color: '#94a3b8', fontWeight: 800}}>#{cat.id}</span>
                                </div>
                                <div className="col-icon">
                                    <div style={{fontSize: '1.5rem', background: '#f8fafc', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9'}}>
                                        {cat.icon || '📚'}
                                    </div>
                                </div>
                                <div className="col-name">
                                    <span className="book-title" style={{fontSize: '1rem'}}>{cat.name}</span>
                                </div>
                                <div className="col-desc">
                                    <span className="badge-premium completed">Đang quản lý tác phẩm</span>
                                </div>
                                <div className="col-actions">
                                    <div className="actions-wrap">
                                        <button className="action-btn edit" onClick={() => handleOpenModal(cat)} title="Sửa tên hoặc icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDeleteClick(cat)} title="Xóa danh mục">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state-premium">
                                <p>Chưa có danh mục nào.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <CategoryFormModal 
                    category={selectedCategory}
                    onClose={handleCloseModal}
                    onSuccess={fetchCategories}
                />
            )}

            {statusData.isOpen && (
                <StatusModal 
                    type={statusData.type}
                    title={statusData.title}
                    message={statusData.message}
                    onConfirm={statusData.onConfirm}
                    onCancel={closeStatus}
                    confirmText={statusData.confirmText}
                    cancelText={statusData.cancelText}
                />
            )}
        </div>
    );
};

export default StaffCategories;
