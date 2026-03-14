import React from 'react';
import './StatusModal.css';

const StatusModal = ({ isOpen, type = 'success', title, message, onButtonClick, buttonText }) => {
    if (!isOpen) return null;

    return (
        <div className="status-modal-overlay">
            <div className="status-modal-content scaleUp">
                <div className={`status-icon-container ${type}`}>
                    {type === 'success' ? (
                        <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="3" fill="none">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="3" fill="none">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    )}
                </div>
                
                <h2 className="status-title">{title}</h2>
                <p className="status-message">{message}</p>
                
                <button className={`status-action-btn ${type}`} onClick={onButtonClick}>
                    {buttonText || (type === 'success' ? 'Tuyệt vời!' : 'Thử lại')}
                </button>
            </div>
        </div>
    );
};

export default StatusModal;
