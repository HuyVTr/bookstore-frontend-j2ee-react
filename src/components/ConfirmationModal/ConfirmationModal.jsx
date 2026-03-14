import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Xác nhận", cancelText = "Hủy", loading = false }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content scaleUp">
                <button className="pro-close-btn" onClick={onCancel}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                
                <div className="pro-modal-header">
                    <h3>{title}</h3>
                </div>
                
                <div className="pro-modal-body">
                    <div className="message-container">
                        <p>{message}</p>
                    </div>
                </div>
                
                <div className="pro-modal-footer">
                    <button className="pro-btn-cancel" onClick={onCancel} disabled={loading}>
                        {cancelText}
                    </button>
                    <button className="pro-btn-confirm" onClick={onConfirm} disabled={loading}>
                        {loading ? "Đang xử lý..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
