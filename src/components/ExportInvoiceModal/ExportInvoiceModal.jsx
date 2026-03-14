import React from 'react';
import './ExportInvoiceModal.css';

const ExportInvoiceModal = ({ isOpen, onClose, onExportPdf, onExportExcel, onPrintHtml, orderId }) => {
    if (!isOpen) return null;

    const Icons = {
        FilePdf: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15h3a2 2 0 0 1 0 4h-3V15z"></path></svg>
        ),
        FileSpreadsheet: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h2"></path><path d="M8 17h2"></path><path d="M14 13h2"></path><path d="M14 17h2"></path></svg>
        ),
        Printer: () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        )
    };

    return (
        <div className="invoice-modal-overlay">
            <div className="invoice-modal-content scaleUp">
                <div className="invoice-modal-header">
                    <h3>Xuất Hóa Đơn</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="invoice-modal-body">
                    <p>Chọn định dạng bạn muốn tải xuống cho đơn hàng #LH{orderId?.toString().padStart(4, '0')}</p>
                    
                    <div className="export-options">
                        <button className="export-opt-btn pdf" onClick={onExportPdf}>
                            <div className="opt-icon"><Icons.FilePdf /></div>
                            <div className="opt-info">
                                <strong>Tải file PDF</strong>
                                <span>Phù hợp để in ấn và lưu trữ</span>
                            </div>
                        </button>

                        <button className="export-opt-btn excel" onClick={onExportExcel}>
                            <div className="opt-icon"><Icons.FileSpreadsheet /></div>
                            <div className="opt-info">
                                <strong>Tải file Excel</strong>
                                <span>Phù hợp để quản lý dữ liệu số</span>
                            </div>
                        </button>

                        <button className="export-opt-btn html" onClick={onPrintHtml}>
                            <div className="opt-icon"><Icons.Printer /></div>
                            <div className="opt-info">
                                <strong>Xem trực tiếp & In</strong>
                                <span>Xem bản thảo và in nhanh qua trình duyệt</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportInvoiceModal;
