import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Lấy token từ URL (Backend gửi về sau khi OAuth hoàn tất)
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (token) {
            // Lưu token vào localStorage
            localStorage.setItem('token', token);
            // Redirect sang trang chủ
            navigate('/', { replace: true });
        } else {
            // Nếu có lỗi, quay về trang login với thông báo
            navigate('/login', {
                replace: true,
                state: { error: error || "Authentication failed" }
            });
        }
    }, [location, navigate]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1a1a',
            color: 'white',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div className="loader" style={{
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #fdbb2d',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                }}></div>
                <h2>Đang hoàn tất đăng nhập...</h2>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default OAuth2RedirectHandler;
