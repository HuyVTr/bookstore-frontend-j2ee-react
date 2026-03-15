import React, { useState } from 'react';
import './ExportReportModal.css';

const ExportReportModal = ({ isOpen, onClose, onExport }) => {
    const [config, setConfig] = useState({
        reportType: 'BOOK_SALES',
        timeRange: 'ALL',
        format: 'XLSX',
        limit: 10,
        sortBy: 'sold',
        sortDirection: 'DESC',
        selectedColumns: ['id', 'title', 'category', 'price', 'sold', 'revenue']
    });

    if (!isOpen) return null;

    const columnLabels = {
        'id': 'Mã định danh',
        'title': 'Tên sách',
        'author': 'Tác giả',
        'category': 'Thể loại',
        'price': 'Giá bán',
        'sold': 'Số lượng bán',
        'revenue': 'Doanh thu',
        'username': 'Tên đăng nhập',
        'email': 'Email',
        'fullname': 'Họ và tên',
        'provider': 'Nền tảng',
        'total_spent': 'Tổng chi tiêu',
        'platform': 'Nền tảng người dùng',
        'count': 'Số lượng thành viên'
    };

    const columnOptions = {
        'BOOK_SALES': ['id', 'title', 'author', 'category', 'price', 'sold', 'revenue'],
        'USER_SPENDING': ['id', 'username', 'email', 'fullname', 'provider', 'total_spent'],
        'REVENUE_PLATFORM': ['platform', 'count']
    };

    const sortOptions = {
        'BOOK_SALES': [
            { id: 'sold', label: 'Số lượng bán' },
            { id: 'revenue', label: 'Doanh thu' },
            { id: 'title', label: 'Tên sách' },
            { id: 'price', label: 'Giá bán' }
        ],
        'USER_SPENDING': [
            { id: 'total_spent', label: 'Tổng chi tiêu' },
            { id: 'username', label: 'Tên đăng nhập' },
            { id: 'fullname', label: 'Họ tên' }
        ],
        'REVENUE_PLATFORM': [
            { id: 'count', label: 'Số lượng user' },
            { id: 'platform', label: 'Nền tảng' }
        ]
    };

    const handleTypeChange = (type) => {
        if (config.reportType === type) return; 
        setConfig({
            ...config,
            reportType: type,
            selectedColumns: [...columnOptions[type]],
            sortBy: sortOptions[type][0].id
        });
    };

    const toggleColumn = (col) => {
        if (col === 'id') return; // Cannot disable ID
        
        let newCols = config.selectedColumns.includes(col)
            ? config.selectedColumns.filter(c => c !== col)
            : [...config.selectedColumns, col];
            
        // Enforce natural order defined in columnOptions
        const masterOrder = columnOptions[config.reportType];
        newCols = masterOrder.filter(c => newCols.includes(c));
        
        setConfig({ ...config, selectedColumns: newCols });
    };

    return (
        <div className="modal-overlay report-export-overlay" onClick={onClose}>
            <div className="export-modal-premium glass-premium fade-in" onClick={e => e.stopPropagation()}>
                <div className="export-header">
                    <div className="header-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </div>
                    <div className="header-text">
                        <h3>Cấu hình xuất báo cáo</h3>
                        <p>Tùy chỉnh thông tin và tiêu chí lọc chuyên sâu cho báo cáo.</p>
                    </div>
                    <button className="close-btn-premium" onClick={onClose}>&times;</button>
                </div>

                <div className="export-body">
                    <div className="config-section">
                        <label className="section-label">1. Loại báo cáo</label>
                        <div className="option-grid">
                            {[
                                { id: 'BOOK_SALES', label: 'Doanh số sách', desc: 'Thống kê sách bán chạy' },
                                { id: 'USER_SPENDING', label: 'Khách hàng', desc: 'Chi tiêu khách hàng' },
                                { id: 'REVENUE_PLATFORM', label: 'Nền tảng', desc: 'Nguồn người dùng' }
                            ].map(type => (
                                <div 
                                    key={type.id} 
                                    className={`option-card ${config.reportType === type.id ? 'active' : ''}`}
                                    onClick={() => handleTypeChange(type.id)}
                                >
                                    <span className="option-title">{type.label}</span>
                                    <span className="option-desc">{type.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="config-row">
                        <div className="config-section half">
                            <label className="section-label">2. Định dạng tệp</label>
                            <div className="format-options">
                                <button 
                                     className={`format-btn ${config.format === 'XLSX' ? 'active' : ''}`}
                                     onClick={() => setConfig({...config, format: 'XLSX'})}
                                 >
                                     Excel (.xlsx)
                                 </button>
                                 <button 
                                     className="format-btn disabled" 
                                     disabled 
                                     title="Chức năng đang được bảo trì"
                                 >
                                     PDF (.pdf) - Bảo trì
                                 </button>
                            </div>
                        </div>
                        <div className="config-section half">
                            <label className="section-label">3. Giới hạn (Top N)</label>
                            <select 
                                className="premium-select"
                                value={config.limit}
                                onChange={e => setConfig({...config, limit: parseInt(e.target.value)})}
                            >
                                <option value="5">Lấy Top 5</option>
                                <option value="10">Lấy Top 10</option>
                                <option value="20">Lấy Top 20</option>
                                <option value="50">Lấy Top 50</option>
                                <option value="0">Tất cả dữ liệu</option>
                            </select>
                        </div>
                    </div>

                    <div className="config-row">
                        <div className="config-section half">
                            <label className="section-label">4. Sắp xếp theo</label>
                            <select 
                                className="premium-select"
                                value={config.sortBy}
                                onChange={e => setConfig({...config, sortBy: e.target.value})}
                            >
                                {sortOptions[config.reportType].map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="config-section half">
                            <label className="section-label">5. Thứ tự</label>
                            <div className="radio-group-premium">
                                <button 
                                    className={`radio-btn ${config.sortDirection === 'DESC' ? 'selected' : ''}`}
                                    onClick={() => setConfig({...config, sortDirection: 'DESC'})}
                                >
                                    Giảm dần
                                </button>
                                <button 
                                    className={`radio-btn ${config.sortDirection === 'ASC' ? 'selected' : ''}`}
                                    onClick={() => setConfig({...config, sortDirection: 'ASC'})}
                                >
                                    Tăng dần
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="config-section">
                        <label className="section-label">6. Các cột dữ liệu (Thứ tự mặc định)</label>
                        <div className="columns-selection">
                            {columnOptions[config.reportType].map(col => (
                                <label key={col} className={`column-checkbox ${col === 'id' ? 'disabled-mandatory' : ''}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={config.selectedColumns.includes(col)}
                                        onChange={() => toggleColumn(col)}
                                        disabled={col === 'id'}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span className="checkbox-label">
                                        {columnLabels[col] || col.toUpperCase()}
                                        {col === 'id' && <span className="mandatory-tag"> (Bắt buộc)</span>}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="export-footer">
                    <button className="btn-cancel-premium" onClick={onClose}>Hủy bỏ</button>
                    <button className="btn-export-premium" onClick={() => onExport(config)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Bắt đầu xuất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportReportModal;
