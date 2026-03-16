import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchUserProfile = async (token) => {
            try {
                // Thiết lập header tạm thời để gọi profile
                const res = await api.get('profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Lưu thông tin từ profile vào localStorage
                localStorage.setItem('username', res.data.username);
                localStorage.setItem('roles', JSON.stringify(res.data.roles));

                // Sau khi lưu xong mọi thứ, mới chuyển hướng và reload
                navigate('/', { replace: true });
                window.location.reload();
            } catch (err) {
                console.error("Lỗi khi tải thông tin user sau OAuth:", err);
                navigate('/login', {
                    replace: true,
                    state: { error: "Không thể tải thông tin người dùng" }
                });
            }
        };

        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (token) {
            localStorage.setItem('token', token);
            fetchUserProfile(token);
        } else if (error) {
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
