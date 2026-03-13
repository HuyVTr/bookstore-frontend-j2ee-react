import React from 'react';
import './LoginPromptModal.css';

const LoginPromptModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="login-prompt-modal glass fade-in">
                <div className="modal-icon">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                </div>
                <h3>Yêu cầu đăng nhập</h3>
                <p>{message || "Vui lòng đăng nhập để tiếp tục thực hiện hành động này."}</p>
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>HỦY BỎ</button>
                    <button className="btn-ok" onClick={onConfirm}>ĐĂNG NHẬP NGAY</button>
                </div>
            </div>
        </div>
    );
};

export default LoginPromptModal;
