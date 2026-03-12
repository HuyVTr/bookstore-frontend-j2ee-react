import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Login.css';

import logo from '../../assets/logo/logo.jpg';

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
        <div className="login-auth-wrapper login-page-specific">
            <div className="form-container-all">
                {/* Form Side (Left) */}
                <div className="auth-side-form login-form-side">
                    <div className="form-container-stitch">
                        <div className="form-header">
                            <h2>Đăng nhập</h2>
                            <p>Chào mừng bạn trở lại! Hãy đăng nhập để tiếp tục.</p>
                        </div>

                        <div className="social-grid">
                            <a href={GOOGLE_AUTH_URL} className="social-stitch-btn" title="Tiếp tục với Google" aria-label="Tiếp tục với Google">
                                <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" />
                            </a>
                            <a href={GITHUB_AUTH_URL} className="social-stitch-btn" title="Tiếp tục với GitHub" aria-label="Tiếp tục với GitHub">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub" />
                            </a>
                            <a href={FACEBOOK_AUTH_URL} className="social-stitch-btn" title="Tiếp tục với Facebook" aria-label="Tiếp tục với Facebook">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" />
                            </a>
                        </div>

                        <div className="auth-divider">
                            <span>HOẶC</span>
                        </div>

                        {error && <div aria-live="polite" style={{ color: '#ff4d4d', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}

                        <form className="stitch-login-form" onSubmit={handleLogin}>
                            <div className="stitch-form-group">
                                <label htmlFor="loginId">Email hoặc Tên đăng nhập</label>
                                <input
                                    id="loginId"
                                    name="username"
                                    type="text"
                                    className="stitch-input"
                                    placeholder="Nhập email hoặc username"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                            <div className="stitch-form-group">
                                <label htmlFor="password">Mật khẩu</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    className="stitch-input"
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                            <button type="submit" className="stitch-submit-btn" disabled={loading}>
                                {loading ? 'Đang xử lý…' : 'Đăng nhập ngay'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            Chưa có tài khoản? <a href="/register">Đăng ký ngay!</a>
                        </div>
                    </div>
                </div>

                {/* Visual/Branding Side (Right) */}
                <div className="auth-side-branding">
                    {/* Floating background elements */}
                    <div className="floating-shape shape-1" aria-hidden="true"></div>
                    <div className="floating-shape shape-2" aria-hidden="true"></div>
                    <div className="floating-shape shape-3" aria-hidden="true"></div>

                    <div className="stitch-logo-indicator">
                        <img src={logo} alt="Bookstore Logo" className="auth-brand-logo" />
                        <span>BOOKSTORE</span>
                    </div>
                    <div className="branding-content">
                        <h1>Thế giới sách <br />trong tầm tay.</h1>
                        <p>Đăng nhập để quản lý bộ sưu tập cá nhân và hưởng những ưu đãi đặc biệt dành riêng cho thành viên.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
