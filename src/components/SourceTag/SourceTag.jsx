import React from 'react';
import './SourceTag.css';

/**
 * SourceTag - Badge hiển thị nguồn gốc sách
 * 
 * Dùng cho:
 * - bookSource === 'AUTHOR' → tag cam/vàng với icon ✍️
 * - bookSource === 'OFFICIAL' hoặc null → tag xanh navy với icon ✓
 */
const SourceTag = ({ bookSource, className = '' }) => {
    const isAuthor = bookSource === 'AUTHOR';

    if (isAuthor) {
        return (
            <div className={`source-tag author ${className}`} title="Tác phẩm của tác giả tự do">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
                <span>Author</span>
            </div>
        );
    }

    return (
        <div className={`source-tag official ${className}`} title="Sách chính thức của cửa hàng">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Official</span>
        </div>
    );
};

export default SourceTag;
