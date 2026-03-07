import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Login.css'; // Reusing Layout CSS
import './Register.css'; // Unique styles for Register if needed

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
        <div className="login-auth-wrapper"> {/* Reusing Login structure */}
            {/* Branding Side */}
            <div className="auth-side-branding" style={{ backgroundImage: "linear-gradient(135deg, rgba(15, 17, 21, 0.92), rgba(15, 17, 21, 0.6)), url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=2000')" }}>
                <div className="stitch-logo-indicator">
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#46ec13', borderRadius: '8px' }}></div>
                    BOOKSTORE
                </div>
                <div className="branding-content">
                    <h1 style={{ textShadow: "0 4px 12px rgba(0, 0, 0, 0.5)" }}>Bắt đầu hành trình đọc sách của bạn.</h1>
                    <p style={{ color: "#e0e6ed", textShadow: "0 2px 8px rgba(0, 0, 0, 0.6)" }}>Tạo tài khoản để lưu lại những cuốn sách yêu thích, theo dõi đơn hàng và nhận những ưu đãi đặc biệt.</p>
                </div>
            </div>

            {/* Form Side */}
            <div className="auth-side-form">
                <div className="form-container-stitch">
                    <div className="form-header">
                        <h2>Tạo tài khoản</h2>
                        <p>Tham gia cộng đồng yêu sách của chúng tôi.</p>
                    </div>

                    <div className="social-grid">
                        <a href={GOOGLE_AUTH_URL} className="social-stitch-btn">
                            <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" />
                            Đăng ký với Google
                        </a>
                        <a href={GITHUB_AUTH_URL} className="social-stitch-btn">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub" style={{ filter: 'invert(1)' }} />
                            Đăng ký với GitHub
                        </a>
                        <a href={FACEBOOK_AUTH_URL} className="social-stitch-btn">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" />
                            Đăng ký với Facebook
                        </a>
                    </div>

                    <div className="auth-divider">
                        <span>HOẶC</span>
                    </div>

                    {error && <div style={{ color: '#ff4d4d', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
                    {success && <div style={{ color: '#46ec13', marginBottom: '16px', fontSize: '1rem', textAlign: 'center' }}>{success}</div>}

                    <form className="stitch-login-form" onSubmit={handleRegister}>
                        <div className="stitch-form-group">
                            <label>Tên đăng nhập (Username)</label>
                            <input
                                type="text"
                                name="username"
                                className="stitch-input"
                                placeholder="Nhập tên đăng nhập duy nhất"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="stitch-form-group">
                            <label>Địa chỉ Email</label>
                            <input
                                type="email"
                                name="email"
                                className="stitch-input"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="stitch-form-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                name="password"
                                className="stitch-input"
                                placeholder="Tạo mật khẩu mạnh"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="stitch-form-group">
                            <label>Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="stitch-input"
                                placeholder="Nhập lại mật khẩu"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="stitch-submit-btn" disabled={loading}>
                            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản mới'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Đã có tài khoản? <Link to="/login">Đăng nhập ngay!</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
