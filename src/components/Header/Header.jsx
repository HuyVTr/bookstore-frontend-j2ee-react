import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo/logo.jpg';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import './Header.css';

const Icons = {
    Search: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    ),
    Heart: ({ filled }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
    ),
    Cart: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
    ),
    User: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    ),
    Logout: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
    )
};

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cart } = useCart();
    const { wishlist } = useWishlist();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);


    const dropdownRef = useRef(null);
    const searchRef = useRef(null); // Ref for search container to handle clicks outside
    const cartCount = cart?.cartItems?.length || 0;
    const wishlistCount = wishlist?.length || 0;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('mousedown', handleClickOutside);

        const token = localStorage.getItem('token');
        const rolesString = localStorage.getItem('roles');
        if (token) {
            setIsLoggedIn(true);
            try {
                const roles = JSON.parse(rolesString);
                setUserRole(roles);
            } catch (e) {
                setUserRole([]);
            }
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Search Suggestions Logic
    useEffect(() => {
        let active = true;
        const timer = setTimeout(async () => {
            const query = searchQuery.trim();
            if (query.length >= 2) {
                setIsSearching(true);
                try {
                    // Dùng endpoint public/books với tham số search (giống Shop page) để đảm bảo kết quả chính xác
                    const res = await api.get('public/books', {
                        params: {
                            search: query,
                            pageSize: 6,
                            sortBy: 'popular'
                        }
                    });

                    if (active) {
                        const bookData = res.data.books || [];
                        setSuggestions(bookData);
                        setShowSuggestions(true);
                    }
                } catch (err) {
                    console.error("Suggestion error:", err);
                    if (active) setSuggestions([]);
                } finally {
                    if (active) setIsSearching(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 400); // Tăng debounce một chút để mượt hơn

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [searchQuery]);



    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('roles');
        setIsLoggedIn(false);
        setUserRole(null);
        setIsDropdownOpen(false);
        navigate('/');
        window.location.reload();
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setShowSuggestions(false);
        }
    };

    const getBookImg = (path) => {
        if (!path) return 'https://via.placeholder.com/40x60?text=No+Cover';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/images/')) return `http://localhost:8080${path}`;
        return `http://localhost:8080/images/${path.split('/').pop()}`;
    };


    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <Link to="/" className="logo">
                    <div className="logo-icon-wrapper">
                        <img src={logo} alt="Bookstore Logo" className="header-logo-img" width="40" height="40" />
                    </div>
                    <span className="logo-text">BOOKSTORE</span>
                </Link>

                <nav className={`nav-menu ${isMenuOpen ? 'mobile-active' : ''}`}>
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Trang chủ</Link>
                    <Link to="/shop" className={`nav-link ${location.pathname === '/shop' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Cửa hàng</Link>

                    {Array.isArray(userRole) && userRole.includes('STAFF') && (
                        <Link to="/staff/books" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>Quản lý Sách</Link>
                    )}

                    {Array.isArray(userRole) && userRole.includes('ADMIN') && (
                        <>
                            <Link to="/admin/users" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>Người dùng</Link>
                            <Link to="/admin/reports" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>Báo cáo</Link>
                        </>
                    )}
                </nav>


                <div className="header-actions">
                    <div className="action-buttons-group">
                        <button
                            className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>

                        {location.pathname !== '/shop' && (
                            <div className="search-wrapper-luxury hide-mobile" ref={searchRef}>
                                <form className="search-bar-premium" onSubmit={handleSearch}>
                                    <input
                                        type="text"
                                        name="q"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                                        placeholder="Tìm kiếm sách…"
                                        aria-label="Tìm kiếm sách"
                                        autoComplete="off"
                                    />
                                    <button type="submit" className="search-btn-luxury" aria-label="Tìm kiếm">
                                        <Icons.Search />
                                    </button>
                                </form>

                                {showSuggestions && (
                                    <div className="search-suggestions-panel glass-premium fade-in">
                                        {isSearching ? (
                                            <div className="suggestion-loading">
                                                <div className="spinner-tiny"></div>
                                                <span>Đang tìm kiếm...</span>
                                            </div>
                                        ) : suggestions.length > 0 ? (
                                            <>
                                                <div className="suggestions-header">Kết quả gợi ý</div>
                                                <div className="suggestions-list">
                                                    {suggestions.map((book) => (
                                                        <div
                                                            key={book.id}
                                                            className="suggestion-item"
                                                            onClick={() => {
                                                                navigate(`/book/${book.id}`);
                                                                setShowSuggestions(false);
                                                                setSearchQuery('');
                                                            }}
                                                        >
                                                            <div className="suggestion-img">
                                                                <img src={getBookImg(book.imagePath)} alt={book.title} />
                                                            </div>
                                                            <div className="suggestion-info">
                                                                <div className="suggestion-title">{book.title}</div>
                                                                <div className="suggestion-author">{book.author}</div>
                                                                <div className="suggestion-price">
                                                                    {book.isOnSale ? book.discountPrice?.toLocaleString() : book.price?.toLocaleString()} VNĐ
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="suggestions-footer" onClick={handleSearch}>
                                                    Xem tất cả kết quả cho "{searchQuery}"
                                                </div>
                                            </>
                                        ) : searchQuery.length >= 2 ? (
                                            <div className="no-suggestions">
                                                <p>Không tìm thấy kết quả cho "<b>{searchQuery}</b>"</p>
                                            </div>
                                        ) : null}
                                    </div>
                                )}


                            </div>
                        )}


                        {isLoggedIn && (
                            <>
                                <Link to="/wishlist" className="premium-action-btn" aria-label="Yêu thích">
                                    <Icons.Heart filled={wishlistCount > 0} />
                                    {wishlistCount > 0 && <span className="badge-luxury tabular-nums">{wishlistCount}</span>}
                                </Link>
                                <Link to="/cart" className="premium-action-btn" aria-label="Giỏ hàng">
                                    <Icons.Cart />
                                    {cartCount > 0 && <span className="badge-luxury accent tabular-nums">{cartCount}</span>}
                                </Link>
                            </>
                        )}

                        {isLoggedIn ? (
                            <div className={`user-dropdown-luxury ${isDropdownOpen ? 'active' : ''}`} ref={dropdownRef}>
                                <button className="avatar-luxury" aria-label="Tài khoản" onClick={toggleDropdown}>
                                    <Icons.User />
                                </button>
                                <div className="dropdown-panel glass-premium">
                                    <div className="dropdown-header">
                                        <span>Xin chào, {localStorage.getItem('username')}</span>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <Link to="/profile" className="dropdown-link" onClick={() => setIsDropdownOpen(false)}>Hồ sơ cá nhân</Link>
                                    <Link to="/orders" className="dropdown-link" onClick={() => setIsDropdownOpen(false)}>Lịch sử đơn hàng</Link>
                                    {Array.isArray(userRole) && (userRole.includes('AUTHOR') || userRole.includes('ROLE_AUTHOR')) && (
                                        <Link to="/author/dashboard" className="dropdown-link" style={{ color: '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsDropdownOpen(false)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                            Trung Tâm Tác Giả
                                        </Link>
                                    )}
                                    <div className="dropdown-divider"></div>
                                    <button onClick={handleLogout} className="logout-btn-premium">
                                        <Icons.Logout /> Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="auth-actions">
                                <Link to="/login" className="login-link-btn hide-mobile">Đăng nhập</Link>
                                <Link to="/register" className="register-link-btn-premium hide-mobile">Đăng ký</Link>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </header>
    );
};

export default Header;
