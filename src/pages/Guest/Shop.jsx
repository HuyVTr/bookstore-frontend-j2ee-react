import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import QuickViewModal from '../../components/QuickViewModal/QuickViewModal';
import './Shop.css';

const Shop = () => {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [visibleSections, setVisibleSections] = useState({ header: true, shop: false });
    const [userRoles, setUserRoles] = useState([]);
    const [quickViewBook, setQuickViewBook] = useState(null);
    const [localPrice, setLocalPrice] = useState({ min: '', max: '' });
    const itemsPerPage = 12;

    const [filters, setFilters] = useState({
        category: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'newest',
        search: '',
        saleStatus: 'all'
    });

    const location = useLocation();
    const navigate = useNavigate();

    // Intersection Observer cho hiệu ứng cuộn
    useEffect(() => {
        const observerOptions = { threshold: 0.1 };
        const handleIntersect = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('data-section');
                    setVisibleSections(prev => ({ ...prev, [sectionId]: true }));
                }
            });
        };
        const observer = new IntersectionObserver(handleIntersect, observerOptions);
        const sections = document.querySelectorAll('.reveal-on-scroll');
        sections.forEach(s => observer.observe(s));

        // Lấy role từ local (tương tự Header)
        const rolesString = localStorage.getItem('roles');
        if (rolesString) {
            try {
                const roles = JSON.parse(rolesString);
                setUserRoles(Array.isArray(roles) ? roles : []);
            } catch (e) {
                setUserRoles([]);
            }
        }

        return () => observer.disconnect();
    }, [loading]);

    // Lấy query từ URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search') || '';
        const cat = params.get('category') || '';
        setFilters(prev => ({ ...prev, search, category: cat }));
    }, [location]);

    // Đồng bộ localPrice khi filters thay đổi (ví dụ khi reset hoặc từ URL)
    useEffect(() => {
        setLocalPrice({ min: filters.minPrice, max: filters.maxPrice });
    }, [filters.minPrice, filters.maxPrice]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch categories
                const catRes = await api.get('public/categories');
                setCategories(catRes.data || []);

                // Fetch books with filters
                const params = {
                    pageNo: currentPage - 1,
                    pageSize: itemsPerPage,
                    sortBy: filters.sortBy,
                    category: filters.category,
                    minPrice: filters.minPrice,
                    maxPrice: filters.maxPrice,
                    search: filters.search,
                    saleOnly: filters.saleStatus === 'sale'
                };

                const bookRes = await api.get('public/books', { params });
                setBooks(bookRes.data.books || []);
                setTotalItems(bookRes.data.totalItems || 0);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu cửa hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [filters, currentPage]);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const getBookImg = (path) => {
        if (!path) return 'https://via.placeholder.com/400x600?text=No+Cover';
        if (path.startsWith('http')) return path;
        return `http://localhost:8080/images/${path.split('/').pop()}`;
    };

    // SVG Icons
    const Icons = {
        Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
        Filter: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>,
        Grid: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
        List: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
        Cart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>,
        Heart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>,
        Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
    };

    return (
        <div className="shop-page-wrapper">
            {/* 1. Header Hero Area */}
            <div className="shop-hero-section" data-section="header">
                <div className="hero-shape-bg"></div>
                <div className="section-container">
                    <div className="shop-hero-content">
                        <h1 className="shop-main-title text-balance">
                            Thư viện <span className="text-gradient">Tri Thức</span> Nhân Loại
                        </h1>
                        <p className="shop-hero-desc">Khám phá hàng ngàn đầu sách từ kinh điển đến hiện đại, được tuyển chọn kỹ lưỡng dành riêng cho bạn.</p>

                        <div className="shop-search-standalone glass">
                            <input
                                type="text"
                                placeholder="Tìm tên sách, tác giả…"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                aria-label="Tìm kiếm sách hoặc tác giả"
                            />
                            <button className="search-trigger-btn" aria-label="Bắt đầu tìm kiếm">
                                <span className="search-icon"><Icons.Search /></span> Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`shop-main-content section-container reveal-on-scroll ${visibleSections.shop ? 'visible' : ''}`}
                data-section="shop"
            >
                <div className="shop-grid-layout">
                    {/* 2. Sidebar Filters */}
                    <aside className="shop-filter-sidebar">
                        <div className="sidebar-sticky">
                            <div className="filter-group-card glass-premium">
                                <h3 className="group-title">Thể loại sách</h3>
                                <div className="category-scroll-list">
                                    <button
                                        className={`cat-item-btn ${filters.category === '' ? 'active' : ''}`}
                                        onClick={() => handleFilterChange('category', '')}
                                    >
                                        <span className="cat-dot"></span> Tất cả sản phẩm
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            className={`cat-item-btn ${filters.category === cat.name ? 'active' : ''}`}
                                            onClick={() => handleFilterChange('category', cat.name)}
                                        >
                                            <span className="cat-dot"></span> {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group-card glass-premium">
                                <h3 className="group-title">Khoảng giá (VNĐ)</h3>
                                <div className="price-range-inputs">
                                    <div className="input-field-wrapper">
                                        <label htmlFor="min-price">Từ</label>
                                        <input
                                            id="min-price"
                                            type="number"
                                            value={localPrice.min}
                                            onChange={(e) => setLocalPrice(prev => ({ ...prev, min: e.target.value }))}
                                            placeholder="0"
                                            aria-label="Giá tối thiểu"
                                        />
                                    </div>
                                    <div className="price-divider"></div>
                                    <div className="input-field-wrapper">
                                        <label htmlFor="max-price">Đến</label>
                                        <input
                                            id="max-price"
                                            type="number"
                                            value={localPrice.max}
                                            onChange={(e) => setLocalPrice(prev => ({ ...prev, max: e.target.value }))}
                                            placeholder="Trở lên"
                                            aria-label="Giá tối đa"
                                        />
                                    </div>
                                </div>
                                <button
                                    className="price-filter-btn"
                                    onClick={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            minPrice: localPrice.min,
                                            maxPrice: localPrice.max
                                        }));
                                        setCurrentPage(1);
                                    }}
                                >
                                    Áp dụng bộ lọc
                                </button>
                            </div>

                            <div className="sidebar-promo-widget">
                                <div className="promo-inner">
                                    <span className="promo-tag">DEAL NGON</span>
                                    <h4>Săn Deal ngay <br />Đơn hàng đầu tiên</h4>
                                    <p>Được ưu đãi giảm 20%</p>                           
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* 3. Products Area */}
                    <div className="shop-products-main">
                        <div className="shop-top-bar glass">
                            <div className="results-info">
                                <span className="results-count-text">
                                    Tìm thấy <strong className="highlight">{totalItems}</strong> cuốn sách
                                </span>
                            </div>
                            <div className="top-bar-controls">
                                <div className="filter-dropdown-wrapper">
                                    <label htmlFor="sale-filter">Ưu đãi:</label>
                                    <div className="custom-select-wrapper">
                                        <select
                                            id="sale-filter"
                                            value={filters.saleStatus}
                                            onChange={(e) => handleFilterChange('saleStatus', e.target.value)}
                                            aria-label="Lọc theo trạng thái khuyến mãi"
                                        >
                                            <option value="all">— Mọi sản phẩm —</option>
                                            <option value="sale">Đang Khuyến Mãi</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="sorting-control">
                                    <label htmlFor="sort-by">Sắp xếp theo:</label>
                                    <div className="custom-select-wrapper">
                                        <select
                                            id="sort-by"
                                            value={filters.sortBy}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            aria-label="Sắp xếp danh sách sách"
                                        >
                                            <option value="newest">Sách mới nhất</option>
                                            <option value="price_asc">Giá (Thấp &rarr; Cao)</option>
                                            <option value="price_desc">Giá (Cao &rarr; Thấp)</option>
                                            <option value="popular">Đang thịnh hành</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="shop-loading-state">
                                <div className="loading-animation">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                                <p>Đang chuẩn bị kho sách…</p>
                            </div>
                        ) : books.length > 0 ? (
                            <div className="shop-books-grid">
                                {books.map(book => (
                                    <div className="premium-book-card" key={book.id}>
                                        <div className="card-top">
                                            <div className="image-frame">
                                                <img 
                                                    src={getBookImg(book.imagePath)} 
                                                    alt={book.title} 
                                                    width="240" 
                                                    height="336" 
                                                    loading="lazy"
                                                />
                                                <div className="card-hover-overlay">
                                                    <button className="overlay-btn main cart" title="Thêm vào giỏ hàng" aria-label="Thêm vào giỏ hàng">
                                                        <Icons.Cart /> Thêm giỏ hàng
                                                    </button>
                                                    <button className="overlay-btn main preview" onClick={() => setQuickViewBook(book)} aria-label="Xem nhanh thông tin sách">
                                                        <Icons.Eye /> Xem Trước
                                                    </button>
                                                    <div className="sub-actions">
                                                        {(userRoles.includes('USER') || userRoles.includes('AUTHOR')) && (
                                                            <button className="overlay-btn small" title="Yêu thích" aria-label="Thêm vào danh sách yêu thích"><Icons.Heart /></button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {book.isOnSale && <div className="sale-badge">SALE</div>}
                                            <div className={`source-tag ${book.bookSource?.toLowerCase() || 'official'}`}>
                                                {book.bookSource === 'AUTHOR' ? 'Author' : 'Official'}
                                            </div>
                                        </div>
                                        <div className="card-bottom">
                                            <span className="book-cat-label">{book.category?.name || 'Chưa phân loại'}</span>
                                            <Link to={`/book/${book.id}`} className="book-link-wrapper">
                                                <h3 className="book-name-title" title={book.title}>{book.title}</h3>
                                            </Link>
                                            <p className="book-author-row">
                                                <span className="book-author-name">{book.author}</span>
                                                <span className="sold-count">Đã bán {book.totalSold || 0}</span>
                                            </p>
                                            <div className="price-tag-row">
                                                <span className="current-price">{book.isOnSale ? book.discountPrice?.toLocaleString() : book.price?.toLocaleString()}đ</span>
                                                {book.isOnSale && <span className="old-price">{book.price?.toLocaleString()}đ</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-shop-state glass">
                                <div className="empty-visual">📭</div>
                                <h3>Hơi tiếc một chút…</h3>
                                <p>Chúng tôi không tìm thấy cuốn sách nào khớp với lựa chọn hiện tại của bạn.</p>
                                <button className="reset-filter-btn" onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', sortBy: 'newest', search: '', saleStatus: 'all' })}>
                                    Làm mới toàn bộ bộ lọc
                                </button>
                            </div>
                        )}

                        {/* 4. Pagination */}
                        {totalItems > itemsPerPage && !loading && (
                            <div className="shop-pagination">
                                {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={currentPage === i + 1 ? 'active' : ''}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Quick View Modal Dùng Chung */}
            <QuickViewModal 
                book={quickViewBook} 
                onClose={() => setQuickViewBook(null)} 
            />
        </div>
    );
};

export default Shop;
