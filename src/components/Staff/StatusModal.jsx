import React from 'react';
import './StatusModal.css';

const StatusModal = ({ type, title, message, onConfirm, onCancel, confirmText, cancelText }) => {
    return (
        <div className="status-modal-overlay" onClick={onCancel}>
            <div className={`status-modal ${type}`} onClick={e => e.stopPropagation()}>
                <div className="status-icon-wrap">
                    {type === 'success' && (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" className="check-icon"></polyline>
                        </svg>
                    )}
                    {type === 'error' && (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    )}
                    {type === 'confirm' && (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    )}
                </div>

                <h3>{title}</h3>
                <p>{message}</p>

                <div className="status-actions">
                    {cancelText && (
                        <button className="status-btn secondary" onClick={onCancel}>
                            {cancelText}
                        </button>
                    )}
                    <button 
                        className={`status-btn primary-${type}`} 
                        onClick={onConfirm || onCancel}
                    >
                        {confirmText || 'Đã hiểu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusModal;
