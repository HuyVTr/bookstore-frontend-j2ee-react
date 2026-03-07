import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Login.css';

const Login = () => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const GOOGLE_AUTH_URL = "http://localhost:8080/oauth2/authorization/google";
    const GITHUB_AUTH_URL = "http://localhost:8080/oauth2/authorization/github";
    const FACEBOOK_AUTH_URL = "http://localhost:8080/oauth2/authorization/facebook";

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                username: loginId,
                password: password
            });

            // Lưu thông tin vào localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('roles', JSON.stringify(response.data.roles));

            // Chuyển hướng về trang chủ
            navigate('/');
            window.location.reload(); // Refresh để cập nhật Header
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-auth-wrapper">
            {/* Branding Side */}
            <div className="auth-side-branding">
                <div className="stitch-logo-indicator">
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#46ec13', borderRadius: '8px' }}></div>
                    BOOKSTORE ADMIN
                </div>
                <div className="branding-content">
                    <h1>Thế giới sách trong tầm tay bạn.</h1>
                    <p>Truy cập bộ sưu tập, quản lý đơn hàng và khám phá hàng ngàn tựa sách với hệ thống quản lý cao cấp của chúng tôi.</p>
                </div>
            </div>

            {/* Form Side */}
            <div className="auth-side-form">
                <div className="form-container-stitch">
                    <div className="form-header">
                        <h2>Đăng nhập</h2>
                        <p>Rất vui được gặp lại bạn!</p>
                    </div>

                    <div className="social-grid">
                        <a href={GOOGLE_AUTH_URL} className="social-stitch-btn">
                            <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" />
                            Tiếp tục với Google
                        </a>
                        <a href={GITHUB_AUTH_URL} className="social-stitch-btn">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub" style={{ filter: 'invert(1)' }} />
                            Tiếp tục với GitHub
                        </a>
                        <a href={FACEBOOK_AUTH_URL} className="social-stitch-btn">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" />
                            Tiếp tục với Facebook
                        </a>
                    </div>

                    <div className="auth-divider">
                        <span>HOẶC</span>
                    </div>

                    {error && <div style={{ color: '#ff4d4d', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                    <form className="stitch-login-form" onSubmit={handleLogin}>
                        <div className="stitch-form-group">
                            <label>Email hoặc Tên đăng nhập</label>
                            <input
                                type="text"
                                className="stitch-input"
                                placeholder="Email hoặc username"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                required
                            />
                        </div>
                        <div className="stitch-form-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                className="stitch-input"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="stitch-submit-btn" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đăng nhập vào tài khoản'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Chưa có tài khoản? <a href="/register">Đăng ký ngay!</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
