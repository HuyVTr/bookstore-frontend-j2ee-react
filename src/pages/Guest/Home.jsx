import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import './Home.css';

const Home = () => {
    const [books, setBooks] = useState([]);
    const [bestSeller, setBestSeller] = useState(null);
    const [topCategories, setTopCategories] = useState([]);
    const [topAuthors, setTopAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const booksPerPage = 4;

    // Featured section states
    const [activeTab, setActiveTab] = useState('featured');
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [featuredLoading, setFeaturedLoading] = useState(false);

    // Thực thi Drag to Scroll + Vòng lặp
    const numClones = 2; // Nhân bản 2 thẻ ảo 2 đầu để bù đắp tràn viền an toàn
    const [currentIndex, setCurrentIndex] = useState(numClones);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartX(e.touches ? e.touches[0].pageX : e.pageX);
        setIsTransitioning(false); // Ngắt hiệu ứng khi đang kéo
    };

    const handleMouseLeave = () => {
        if (isDragging) handleDragEnd();
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const currentX = e.touches ? e.touches[0].pageX : e.pageX;
        const walk = currentX - startX;
        setDragOffset(walk);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setIsTransitioning(true); // Bật lại hiệu ứng khi thả

        if (dragOffset > 50) { // Kéo sang phải => Prev
            setCurrentIndex(prev => prev - 1);
        } else if (dragOffset < -50) { // Kéo sang trái => Next
            setCurrentIndex(prev => prev + 1);
        }
        setDragOffset(0);
    };

    // Vòng lặp tĩnh ngầm (Reset Infinite Loop không có Transition sau 0.5s)
    useEffect(() => {
        if (featuredBooks.length === 0) return;
        const total = featuredBooks.length;

        let timer;
        if (currentIndex < numClones) {
            // Đã vuốt lấn sang vùng chứa clone nằm bên trái -> trả về thẻ thật tương ứng bên phải
            timer = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(currentIndex + total);
            }, 500); // 500ms là thời gian CSS Transition
        } else if (currentIndex >= total + numClones) {
            // Đã vuốt lấn sang vùng clone đuôi bên phải -> trả về thẻ thật bên trái
            timer = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(currentIndex - total);
            }, 500);
        }
        return () => clearTimeout(timer);
    }, [currentIndex, featuredBooks.length]);

    const trackStyle = {
        transform: `translateX(calc(var(--actual-card-width) / -2 - ${currentIndex} * (var(--actual-card-width) + var(--card-gap)) + ${dragOffset}px))`,
        transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
    };

    // Hàm tạo mảng có 2 clones mỗi đầu 
    const getExtendedBooks = () => {
        if (featuredBooks.length === 0) return [];
        const books = featuredBooks;
        const n = books.length;
        if (n === 1) return [{ ...books[0], _loopId: 'real-0' }]; // Nếu chỉ có 1 sách khỏi loop ảo

        // Lấy 2 cuốn cuối ném lên đầu, 2 cuốn đầu ném về cuối vòng
        const cloneBefore2 = books[(n - 2 % n + n) % n];
        const cloneBefore1 = books[(n - 1 % n + n) % n];
        const cloneAfter1 = books[0];
        const cloneAfter2 = books[1 % n];

        return [
            { ...cloneBefore2, _loopId: 'clone-b2' },
            { ...cloneBefore1, _loopId: 'clone-b1' },
            ...books.map(b => ({ ...b, _loopId: `real-${b.id}` })),
            { ...cloneAfter1, _loopId: 'clone-a1' },
            { ...cloneAfter2, _loopId: 'clone-a2' }
        ];
    };
    const extendedBooks = getExtendedBooks();

    // Hiển thị ảnh tác giả: Ưu tiên ảnh từ DB, nếu không có mới dùng Unsplash
    const getAuthorImg = (author, index) => {
        if (author?.authorImage && author.authorImage.startsWith('http')) {
            return author.authorImage;
        }

        const placeholders = [
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
        ];
        return placeholders[index % placeholders.length];
    };

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [booksRes, bestSellerRes, categoriesRes, authorsRes] = await Promise.all([
                    api.get('public/books').catch(err => ({ data: { books: [] } })),
                    api.get('public/books/best-seller').catch(err => ({ data: null })),
                    api.get('public/categories/top-selling').catch(err => ({ data: [] })),
                    api.get('public/authors/top-selling?limit=5').catch(err => ({ data: [] }))
                ]);

                setBooks(booksRes.data?.books || []);
                setBestSeller(bestSellerRes.data);
                setTopCategories(categoriesRes.data || []);
                setTopAuthors(authorsRes.data || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang chủ:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    // Fetch featured books based on tab
    useEffect(() => {
        const fetchFeatured = async () => {
            setFeaturedLoading(true);
            try {
                let endpoint = 'public/books/featured';
                if (activeTab === 'onsale') endpoint = 'public/books/on-sale';
                if (activeTab === 'mostviewed') endpoint = 'public/books/most-viewed';

                const res = await api.get(endpoint);
                setFeaturedBooks(res.data || []);
                if (res.data?.length > 1) {
                    setCurrentIndex(numClones); // Set về thẻ thực đầu tiên khi mới fetch nếu mảng hợp lệ > 1
                } else {
                    setCurrentIndex(0);
                }
                setIsTransitioning(false);
                setDragOffset(0);
            } catch (error) {
                console.error("Error fetching featured:", error);
                setFeaturedBooks([]);
            } finally {
                setFeaturedLoading(false);
            }
        };
        fetchFeatured();
    }, [activeTab]);

    const getCategoryClass = (name) => {
        if (!name) return 'tech';
        const n = name.toLowerCase();
        if (n.includes('văn học')) return 'literature';
        if (n.includes('kinh doanh')) return 'business';
        if (n.includes('kỹ năng')) return 'skills';
        if (n.includes('thiếu nhi')) return 'children';
        return 'tech';
    };

    const getCategoryIcon = (category) => {
        if (category?.icon) return category.icon;

        if (!category?.name) return '📖';
        const n = category.name.toLowerCase();
        if (n.includes('lập trình') || n.includes('code')) return '💻';
        if (n.includes('kinh doanh')) return '💼';
        if (n.includes('kỹ năng')) return '💡';
        if (n.includes('văn học')) return '📚';
        if (n.includes('thiếu nhi')) return '🎈';
        return '📖';
    };

    const totalPages = Math.ceil(books.length / booksPerPage);

    const nextPage = () => { if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 0) setCurrentPage(currentPage - 1); };

    if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

    const getBookImg = (path) => path ? `http://localhost:8080/images/${path.split('/').pop()}` : 'https://via.placeholder.com/200x300?text=No+Cover';

    return (
        <div className="home-container">
            {/* 1. Hero Banner */}
            <section className="hero-banner">
                <div className="hero-bg-elements">
                    {['📚', '📖', '🔖', '✍️', '💡', '🖋️', '📜', '🎓'].map((emoji, i) => (
                        <span key={i} className={`floating-icon icon-${i + 1}`}>{emoji}</span>
                    ))}
                </div>
                <div className="hero-content">
                    <div className="hero-text">
                        <span className="hero-subtitle">Kiến tạo tương lai cùng tri thức</span>
                        <h1 className="hero-title">Khơi nguồn <br /><span className="text-gradient">Cảm hứng đọc</span></h1>
                        <p className="hero-description">Hệ thống quản lý sách thông minh giúp bạn tìm thấy tri thức nhanh nhất, chính xác nhất.</p>
                        <div className="hero-btns">
                            <button className="cta-button primary magnetic-btn">Bắt đầu ngay →</button>
                            <button className="cta-button secondary magnetic-btn">Xem danh mục</button>
                        </div>
                        <div className="hero-mini-features">
                            <div className="mini-feature-item"><span>🚚</span><div className="m-text"><h5>Giao hàng 24h</h5><p>Đơn từ 500k</p></div></div>
                            <div className="mini-feature-item"><span>✅</span><div className="m-text"><h5>Chính hãng</h5><p>Cam kết 100%</p></div></div>
                            <div className="mini-feature-item"><span>🔄</span><div className="m-text"><h5>Đổi trả</h5><p>Trong 7 ngày</p></div></div>
                        </div>
                    </div>
                    <div className="hero-bento-grid">
                        <div className="bento-item main-image glass">
                            <img src={getBookImg(bestSeller?.imagePath)} alt="" className="hero-main-img" />
                            <div className="status-badge">Best Seller</div>
                            <div className="bento-overlay"><h4>{bestSeller?.title || "Sách nổi bật"}</h4><p>{bestSeller?.author}</p></div>
                        </div>
                        <div className="bento-item stat-card glass"><h3>9.8k+</h3><p>Đầu sách đa dạng</p></div>
                        <div className="bento-item promo-card glass"><span className="promo-label">Ưu đãi</span><h4>Giảm 25%</h4><p>Cho đơn hàng đầu tiên</p></div>
                    </div>
                </div>
            </section>

            {/* 2. Featured Books Tab Section */}
            <section className="featured-books-section">
                <div className="featured-main-container">
                    <div className="section-header-centered">
                        <span className="section-subtitle-small">BỘ SƯU TẬP ĐẶC BIỆT</span>
                        <h2 className="section-title-large">Sách Nổi Bật</h2>
                        <div className="featured-tabs-centered">
                            <button className={activeTab === 'featured' ? 'active' : ''} onClick={() => setActiveTab('featured')}>Nổi bật</button>
                            <button className={activeTab === 'onsale' ? 'active' : ''} onClick={() => setActiveTab('onsale')}>Giảm giá</button>
                            <button className={activeTab === 'mostviewed' ? 'active' : ''} onClick={() => setActiveTab('mostviewed')}>Xem nhiều</button>
                        </div>
                    </div>
                </div>

                <div className={`featured-content-area edge-to-edge ${featuredLoading ? 'loading-opacity' : ''}`}>
                    {featuredBooks.length > 0 ? (
                        <>
                            <div className="featured-slider-container">
                                <div className="slider-offset">
                                    <div
                                        className={`featured-spotlight-track-new ${isDragging ? 'dragging' : ''}`}
                                        style={trackStyle}
                                        onMouseDown={handleTouchStart}
                                        onMouseLeave={handleMouseLeave}
                                        onMouseUp={handleDragEnd}
                                        onMouseMove={handleTouchMove}
                                        onTouchStart={handleTouchStart}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleDragEnd}
                                    >
                                        {extendedBooks.map((book, idx) => (
                                            <div className={`spotlight-card-new ${idx === currentIndex ? 'active-slide' : ''}`} key={book._loopId}>
                                                <div className="spotlight-img-column">
                                                    <div className="img-container-new">
                                                        <img src={getBookImg(book.imagePath)} alt={book.title} />
                                                    </div>
                                                </div>
                                                <div className="spotlight-content-column">
                                                    <div className="content-top-row">
                                                        <span className="badge-category-new">{book.category?.name || 'Văn học'}</span>
                                                        <div className="book-rating-new">
                                                            <span className="stars-new">★★★★★</span>
                                                            <span className="rating-count-new">(459)</span>
                                                        </div>
                                                    </div>
                                                    <h4 className="book-title-new">{book.title}</h4>
                                                    <div className="author-row-new">
                                                        <div className="author-avatar-new">
                                                            <img src={`https://ui-avatars.com/api/?name=${book.author}&background=random&color=fff`} alt={book.author} />
                                                        </div>
                                                        <span className="author-name-new">{book.author}</span>
                                                    </div>
                                                    <div className="price-row-new">
                                                        <span className="price-current-new">
                                                            {book.isOnSale ? book.discountPrice?.toLocaleString() : book.price?.toLocaleString()} VNĐ
                                                        </span>
                                                        {book.isOnSale && <span className="price-old-new">{book.price?.toLocaleString()} VNĐ</span>}
                                                    </div>
                                                    <div className="stock-container-new">
                                                        <div className="stock-progress-bar-new">
                                                            <div className="progress-fill-new" style={{ width: `${Math.min((book.quantity || 0) * 2, 100)}%` }}></div>
                                                        </div>
                                                        <span className="stock-text-new">{book.quantity || 0} Books In Stock</span>
                                                    </div>
                                                    <button className="cart-btn-round-new" title="Thêm vào giỏ hàng">
                                                        <span className="cart-icon-new">🛒</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="featured-dots-new">
                                {featuredBooks.map((_, i) => {
                                    // Map index ảo (-2, -1, 0, 1..) về index thật (0, 1, 2, 3...)
                                    let activeIndex = currentIndex - numClones;
                                    if (activeIndex < 0) activeIndex += featuredBooks.length;
                                    if (activeIndex >= featuredBooks.length) activeIndex -= featuredBooks.length;

                                    return (
                                        <span
                                            key={i}
                                            className={`dot-new ${i === activeIndex ? 'active' : ''}`}
                                            onClick={() => {
                                                setIsTransitioning(true);
                                                setCurrentIndex(i + numClones);
                                            }}
                                        ></span>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="no-data">Không có dữ liệu cho mục này</div>
                    )}
                </div>
            </section>

            {/* 3. Categories Section */}
            <section className="categories-section">
                <div className="section-container">
                    <div className="section-header-centered">
                        <span className="section-subtitle-small">KHÁM PHÁ NGAY</span>
                        <h2 className="section-title-large">Thể Loại Phổ Biến</h2>
                    </div>
                    <div className="categories-grid">
                        {topCategories.map((item, index) => (
                            <div key={index} className={`category-card ${getCategoryClass(item.category.name)}`}>
                                <div className="category-icon-bg">{getCategoryIcon(item.category)}</div>
                                <div className="category-overlay">
                                    <div className="category-icon-small">{getCategoryIcon(item.category)}</div>
                                    <h4>{item.category.name}</h4>
                                    <p>{item.totalSold}+ lượt mua</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* 4. Sách Mới Section */}
            < section className="books-section" >
                <div className="section-container">
                    <div className="section-header-centered">
                        <span className="section-subtitle-small">SẢN PHẨM CHẤT LƯỢNG</span>
                        <h2 className="section-title-large">Sách Mới Phát Hành</h2>
                    </div>
                    <div className="books-carousel-wrapper">
                        <button className={`nav-button prev ${currentPage === 0 ? 'disabled' : ''}`} onClick={prevPage}>←</button>
                        <div className="book-carousel-window">
                            <div className="book-carousel-track" style={{ transform: `translateX(-${currentPage * 100}%)` }}>
                                {books.map((book) => (
                                    <div key={book.id} className="book-card-item-wrapper">
                                        <div className="book-card-alt">
                                            <div className="book-image-container">
                                                <img className="main-book-cover" src={getBookImg(book.imagePath)} alt={book.title} />
                                                <div className="add-to-cart-overlay"><button>THÊM VÀO GIỎ</button></div>
                                            </div>
                                            <div className="book-info-centered"><h3>{book.title}</h3><p className="author">{book.author}</p><p className="price">{book.price?.toLocaleString()} VNĐ</p></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className={`nav-button next ${currentPage === totalPages - 1 ? 'disabled' : ''}`} onClick={nextPage}>→</button>
                    </div>
                </div>
            </section >

            {/* 5. Author's Collection */}
            < section className="authors-section" >
                <div className="section-container">
                    <div className="section-header-centered"><span className="section-subtitle-small">BẬC THẦY TRI THỨC</span><h2 className="section-title-large">Tác Giả Nổi Bật</h2></div>
                    <div className="authors-grid">
                        {topAuthors.map((author, index) => (
                            <div key={index} className="author-card">
                                <div className="author-img-wrapper"><img src={getAuthorImg(author, index)} alt={author.authorName} /></div>
                                <h4>{author.authorName}</h4><p>{author.totalSold > 0 ? `${author.totalSold} lượt bán` : 'Tác giả triển vọng'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section >
        </div >
    );
};

export default Home;
