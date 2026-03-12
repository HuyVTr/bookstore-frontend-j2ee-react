import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Login.css'; // Reusing Layout CSS
import './Register.css'; // Unique styles for Register if needed

import logo from '../../assets/logo/logo.jpg';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const GOOGLE_AUTH_URL = "http://localhost:8080/oauth2/authorization/google";
    const GITHUB_AUTH_URL = "http://localhost:8080/oauth2/authorization/github";
    const FACEBOOK_AUTH_URL = "http://localhost:8080/oauth2/authorization/facebook";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
                // Back-end sẽ lo gán role mặc định và Active=true
            });

            setSuccess('Đăng ký thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data || 'Đăng ký lỗi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-auth-wrapper register-page-specific">
            <div className="form-container-all">
                {/* Form Side (Left) */}
                <div className="auth-side-form">
                    <div className="form-container-stitch">
                        <div className="form-header">
                            <h2>Đăng ký</h2>
                            <p>Chào mừng bạn! Hãy tham gia cùng cộng đồng mọt sách ngay.</p>
                        </div>

                        <div className="social-grid">
                            <a href={GOOGLE_AUTH_URL} className="social-stitch-btn" title="Đăng ký với Google" aria-label="Đăng ký với Google">
                                <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" />
                            </a>
                            <a href={GITHUB_AUTH_URL} className="social-stitch-btn" title="Đăng ký với GitHub" aria-label="Đăng ký với GitHub">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub" />
                            </a>
                            <a href={FACEBOOK_AUTH_URL} className="social-stitch-btn" title="Đăng ký với Facebook" aria-label="Đăng ký với Facebook">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" />
                            </a>
                        </div>

                        <div className="auth-divider">
                            <span>HOẶC</span>
                        </div>

                        {error && <div aria-live="polite" style={{ color: '#ff4d4d', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
                        {success && <div aria-live="polite" style={{ color: '#46ec13', marginBottom: '16px', fontSize: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{success}</div>}

                        <form className="stitch-login-form" onSubmit={handleRegister}>
                            <div className="stitch-form-group">
                                <label htmlFor="reg-username">Tên đăng nhập (Username)</label>
                                <input
                                    id="reg-username"
                                    type="text"
                                    name="username"
                                    className="stitch-input"
                                    placeholder="Nhập tên đăng nhập"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                            <div className="stitch-form-group">
                                <label htmlFor="reg-email">Địa chỉ Email</label>
                                <input
                                    id="reg-email"
                                    type="email"
                                    name="email"
                                    className="stitch-input"
                                    placeholder="yourname@gmail.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    inputMode="email"
                                    spellCheck={false}
                                />
                            </div>
                            <div className="stitch-form-group">
                                <label htmlFor="reg-password">Mật khẩu</label>
                                <input
                                    id="reg-password"
                                    type="password"
                                    name="password"
                                    className="stitch-input"
                                    placeholder="Nhập mật khẩu"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="stitch-form-group">
                                <label htmlFor="reg-confirm">Xác nhận mật khẩu</label>
                                <input
                                    id="reg-confirm"
                                    type="password"
                                    name="confirmPassword"
                                    className="stitch-input"
                                    placeholder="Nhập lại mật khẩu"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                            <button type="submit" className="stitch-submit-btn" disabled={loading}>
                                {loading ? 'Đang tạo tài khoản…' : 'Tạo tài khoản ngay'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
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
                        <h1>Bắt đầu hành trình <br />đọc sách.</h1>
                        <p>Tạo tài khoản để lưu lại những cuốn sách yêu thích và nhận thông báo về những đầu sách mới nhất.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
