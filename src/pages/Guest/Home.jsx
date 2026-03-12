import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import QuickViewModal from '../../components/QuickViewModal/QuickViewModal';
import { useNavigate, Link } from 'react-router-dom';
import './Home.css';
import parallaxBg from '../../assets/home_banner/parallax_sale_banner.png'; // Anthony đã cập nhật tên file chuẩn của bạn!

const Home = () => {
    const [books, setBooks] = useState([]);
    const [bestSeller, setBestSeller] = useState(null);
    const [topCategories, setTopCategories] = useState([]);
    const [topAuthors, setTopAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const navigate = useNavigate();
    const booksPerPage = 4;

    // Featured section states
    const [activeTab, setActiveTab] = useState('featured');
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [featuredLoading, setFeaturedLoading] = useState(false);
    const [visibleSections, setVisibleSections] = useState({});
    const [selectedMood, setSelectedMood] = useState('all');
    const [quickViewBook, setQuickViewBook] = useState(null);
    const parallaxBgRef = useRef(null); // Sử dụng Ref để thao tác trực tiếp với DOM

    // Refs for scroll reveal
    // Mood slider states
    const [moodIndex, setMoodIndex] = useState(0);
    const [isMoodDragging, setIsMoodDragging] = useState(false);
    const [moodStartX, setMoodStartX] = useState(0);
    const [isMoodTransitioning, setIsMoodTransitioning] = useState(true);

    const moodTrackRef = useRef(null);
    const moodDragOffsetRef = useRef(0);

    const handleMoodStart = (e) => {
        setIsMoodDragging(true);
        setMoodStartX(e.touches ? e.touches[0].pageX : e.pageX);
        setIsMoodTransitioning(false);
    };

    const handleMoodMove = (e) => {
        if (!isMoodDragging) return;
        const currentX = e.touches ? e.touches[0].pageX : e.pageX;
        const walk = currentX - moodStartX;
        moodDragOffsetRef.current = walk;

        if (moodTrackRef.current) {
            moodTrackRef.current.style.setProperty('--mood-drag-offset', `${walk}px`);
        }
    };

    const handleMoodEnd = () => {
        setIsMoodDragging(false);
        setIsMoodTransitioning(true);
        const threshold = 50;

        if (moodDragOffsetRef.current > threshold && moodIndex > 0) {
            setMoodIndex(prev => prev - 1);
        } else if (moodDragOffsetRef.current < -threshold && moodIndex < Math.max(0, books.slice(0, 8).length - 3)) {
            setMoodIndex(prev => prev + 1);
        }

        moodDragOffsetRef.current = 0;
        if (moodTrackRef.current) {
            moodTrackRef.current.style.setProperty('--mood-drag-offset', '0px');
        }
    };

    const moodTrackStyle = {
        transform: `translateX(calc(-${moodIndex} * (var(--mood-card-width) + 20px) + var(--mood-drag-offset, 0px)))`,
        transition: isMoodTransitioning ? 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
    };

    const sectionRefs = {
        categories: React.useRef(null),
        featured: React.useRef(null),
        authors: React.useRef(null),
        newest: React.useRef(null),
        testimonials: React.useRef(null),
        newsletter: React.useRef(null),
        parallax: React.useRef(null)
    };

    const testimonials = [
        { name: "Minh Tuấn", role: "Mọt sách chính hiệu", comment: "Sách giao cực nhanh, đóng gói cẩn thận. Tôi rất hài lòng với trải nghiệm mua sắm tại đây!" },
        { name: "Hoàng Yến", role: "Sinh viên", comment: "Hệ thống gợi ý sách rất thông minh, giúp mình tìm được đúng những tài liệu cần thiết cho đồ án." },
        { name: "Quốc Bảo", role: "Tác giả trẻ", comment: "Giao diện website cực kỳ hiện đại và tinh tế. Đây là nơi lý tưởng để lan tỏa tri thức." }
    ];

    useEffect(() => {
        if (loading) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const handleIntersect = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('data-section');
                    setVisibleSections(prev => ({ ...prev, [sectionId]: true }));
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        Object.values(sectionRefs).forEach(ref => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
    }, [loading]);

    // Anthony cấu hình lại Parallax tối ưu hiệu năng
    useEffect(() => {
        const handleParallax = () => {
            if (sectionRefs.parallax.current && parallaxBgRef.current) {
                const rect = sectionRefs.parallax.current.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                if (rect.top < windowHeight && rect.bottom > 0) {
                    const scrollFraction = (windowHeight - rect.top) / (windowHeight + rect.height);

                    // Tăng biên độ di chuyển lển 40% để hiệu ứng rõ rệt hơn
                    const travelRange = rect.height * 0.4;
                    const yPos = -(scrollFraction * travelRange);

                    // Thao tác trực tiếp với DOM để đạt 60fps, không làm React phải render lại toàn bộ trang
                    parallaxBgRef.current.style.transform = `translateY(${yPos}px)`;
                }
            }
        };

        window.addEventListener('scroll', handleParallax, { passive: true });
        return () => window.removeEventListener('scroll', handleParallax);
    }, []);

    // Thực thi Drag to Scroll + Vòng lặp
    const numClones = 2; // Nhân bản 2 thẻ ảo 2 đầu để bù đắp tràn viền an toàn
    const [currentIndex, setCurrentIndex] = useState(numClones);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    // Performance Optimization: Use Ref for drag offset to avoid re-rendering entire Home component
    const trackRef = useRef(null);
    const dragOffsetRef = useRef(0);

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
        dragOffsetRef.current = walk;

        // Update CSS variable directly via DOM for 60fps performance
        if (trackRef.current) {
            trackRef.current.style.setProperty('--drag-offset', `${walk}px`);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setIsTransitioning(true);

        if (dragOffsetRef.current > 50) {
            setCurrentIndex(prev => prev - 1);
        } else if (dragOffsetRef.current < -50) {
            setCurrentIndex(prev => prev + 1);
        }

        // Reset drag offset
        dragOffsetRef.current = 0;
        if (trackRef.current) {
            trackRef.current.style.setProperty('--drag-offset', `0px`);
        }
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
        transform: `translateX(calc(var(--actual-card-width) / -2 - ${currentIndex} * (var(--actual-card-width) + var(--card-gap)) + var(--drag-offset, 0px)))`,
        transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
    };

    // Hàm tạo mảng có 2 clones mỗi đầu 
    const extendedBooks = React.useMemo(() => {
        if (featuredBooks.length === 0) return [];
        const books = featuredBooks;
        const n = books.length;
        if (n === 1) return [{ ...books[0], _loopId: 'real-0' }];

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
    }, [featuredBooks]);

    // Hiển thị ảnh tác giả: Ưu tiên ảnh từ DB, nếu không có mới dùng 2D Illustrations
    const getAuthorImg = (authorData, index) => {
        // authorData có thể là object { authorName, authorImage } hoặc chỉ là string (tên)
        const name = typeof authorData === 'string' ? authorData : authorData?.authorName;
        const img = typeof authorData === 'object' ? authorData?.authorImage : null;

        // Nếu có ảnh thật (từ DB hoặc Link tuyệt đối)
        if (img && img.startsWith('http')) {
            return img;
        }

        // Nếu không có ảnh, dùng DiceBear API để tạo avatar 2D nghệ thuật và ổn định dựa trên tên
        // Sử dụng style 'avataaars' hoặc 'adventurer' để có giao diện 2D cao cấp
        const seed = name || `author-${index}`;
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    };

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [booksRes, bestSellerRes, categoriesRes, authorsRes] = await Promise.all([
                    api.get('public/books/newest').catch(err => ({ data: [] })),
                    api.get('public/books/best-seller').catch(err => ({ data: null })),
                    api.get('public/categories/top-selling').catch(err => ({ data: [] })),
                    api.get('public/authors/top-selling?limit=5').catch(err => ({ data: [] }))
                ]);

                setBooks(booksRes.data || []);
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
                dragOffsetRef.current = 0;
                if (trackRef.current) {
                    trackRef.current.style.setProperty('--drag-offset', '0px');
                }
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

    if (loading) return <div className="loading">Đang tải dữ liệu…</div>;

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
                        <h1 className="hero-title text-balance">Khơi nguồn <br /><span className="text-gradient">Cảm hứng đọc</span></h1>
                        <p className="hero-description">Hệ thống quản lý sách thông minh giúp bạn tìm thấy tri thức nhanh nhất, chính xác nhất.</p>
                        <div className="hero-btns">
                            <button className="cta-button primary magnetic-btn" onClick={() => navigate('/shop')}>Bắt đầu ngay →</button>
                            <button className="cta-button secondary magnetic-btn" onClick={() => navigate('/shop')}>Xem danh mục</button>
                        </div>
                        <div className="hero-mini-features">
                            <div className="mini-feature-item"><span>🚚</span><div className="m-text"><h5>Giao hàng 24h</h5><p>Đơn từ 500k</p></div></div>
                            <div className="mini-feature-item"><span>✅</span><div className="m-text"><h5>Chính hãng</h5><p>Cam kết 100%</p></div></div>
                            <div className="mini-feature-item"><span>🔄</span><div className="m-text"><h5>Đổi trả</h5><p>Trong 7 ngày</p></div></div>
                        </div>
                    </div>
                    <div className="hero-bento-grid">
                        <div className="bento-item main-image glass">
                            <img
                                src={getBookImg(bestSeller?.imagePath)}
                                alt={bestSeller?.title || "Sách nổi bật"}
                                className="hero-main-img"
                                width="400"
                                height="600"
                                fetchpriority="high"
                            />
                            <div className="status-badge">Best Seller</div>
                            <div className="bento-overlay"><h4>{bestSeller?.title || "Sách nổi bật"}</h4><p>{bestSeller?.author}</p></div>
                        </div>
                        <div className="bento-item stat-card glass"><h3>9.8k+</h3><p>Đầu sách đa dạng</p></div>
                        <div className="bento-item promo-card glass"><span className="promo-label">Ưu đãi</span><h4>Giảm 25%</h4><p>Cho đơn hàng đầu tiên</p></div>
                    </div>
                </div>
            </section>




            {/* 2. Featured Books Tab Section */}
            <section
                ref={sectionRefs.featured}
                data-section="featured"
                className={`featured-books-section reveal-on-scroll ${visibleSections.featured ? 'visible' : ''}`}
            >
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
                                        ref={trackRef}
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
                                                        <img
                                                            src={getBookImg(book.imagePath)}
                                                            alt={book.title}
                                                            width="300"
                                                            height="450"
                                                        />
                                                        {/* Badge Nguồn gốc */}
                                                        <div className={`source-tag ${book.bookSource?.toLowerCase() || 'official'}`}>
                                                            {book.bookSource === 'AUTHOR' ? 'Author' : 'Official'}
                                                        </div>
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
                                                            <img
                                                                src={getAuthorImg(topAuthors.find(a => a.authorName === book.author) || book.author, idx)}
                                                                alt={book.author}
                                                            />
                                                        </div>
                                                        <span className="author-name-new">
                                                            {book.author}
                                                            <small className="sold-new"> | Đã bán {book.totalSold || 0}</small>
                                                        </span>
                                                    </div>
                                                    <div className="price-row-new tabular-nums">
                                                        <span className="price-current-new">
                                                            {book.isOnSale ? book.discountPrice?.toLocaleString() : book.price?.toLocaleString()} VNĐ
                                                        </span>
                                                        {book.isOnSale && <span className="price-old-new">{book.price?.toLocaleString()} VNĐ</span>}
                                                    </div>
                                                    <div className="stock-container-new">
                                                        <span className="stock-text-new tabular-nums">{book.quantity || 0} Books In Stock</span>
                                                    </div>
                                                    <div className="spotlight-actions-new">
                                                        <button className="q-view-btn-spotlight" onClick={() => setQuickViewBook(book)}>Xem nhanh</button>
                                                        <button className="cart-btn-round-new" aria-label={`Thêm ${book.title} vào giỏ hàng`} title="Thêm vào giỏ hàng">
                                                            <span className="cart-icon-new">🛒</span>
                                                        </button>
                                                    </div>
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
                    <div className="view-all-wrapper">
                        <button className="view-all-btn" onClick={() => navigate('/shop')}>Xem Tất Cả <span className="arrow">→</span></button>
                    </div>
                </div>
            </section>

            {/* 2.5. Special Promotional Split Section (Bookly Style) */}
            <section className="special-offer-section edge-to-edge">
                <div className="offer-split-container">
                    <div className="offer-image-side">
                        <img src="https://lh3.googleusercontent.com/rd-gg-dl/AOI_d__bPI2JjhKt7P-Tirn5aZ_V6pd8GDtb044tlJxbZ2q_SIWu_iTKLIgQrX9AbT0KzmsCvJFKpF2ehOmri8a2BG3p7G8NFYGBQ8WIKG0F3lM8nUSWOM7U9DBu0TnzY9T5rEHSnsArCSHpn0tXfw4CA3GVJeDRD8ClT9O89v3ZFPiemN0pK1OQs4aElQfGbvgWuMWVJgOOrFLKZ22b13dTST-5Oj5ttvykV1uALQrkinDnVMdzmJDjz_35OnAKE8XGyUue2lJEVINXISQDtjeY-IACiOiB2v3cPsYuUulJQebRcB8dk3ci8iwAIG5sVXcQ5dJnVvFxpAkWK0bnsNUdhm2XXbMzLmtfK3mvQBiBB7sYnr_5fum-KOuzgJRdE3lUH9zeTXFGiqfde5vj2EFXQuIdS9DxCE44-6YAe_EkGdDUVU_uk16Ozz1gxT8hN-g9vm3udV7TvT9xk7L-Vmb2fFyLrMewulH5tB-6CNByfsV2ME2-88F-AuEudsJejdbQFHgvrafDj0qMwywgfobtjAfToG9X4NuJOEDI30LlDAGFJUFjSotTJCNKHMdlCHGddAeRR9c9Sm0V5IKGOo4Zk5L3_uXh3pfNFJEn5DS2PeYSLEG4jGlfFWwy1dmGwsMO45t5n5qkwf1FXCOu_jtOVMZxnmIIMuWIp0FeNezYRRZrhSbVkiBgl7PWxzHb_kCDzwdNcZqKBpMGQ8Nm9X0on7FAQOHAujzefewK5xcG8bGNRlkXsQXR31NfOzRL_FWQgdDyEwNBJ2qBCXjGzWDcRfObsi8_1CZKEKwSR0C8FtOsqFXt2yka3mT5GGQp2pGRfdI8Y9M1-Lp4l9yOXjeE3MgNmtyVLx5T461EcBPWxAjSpZp76yertlSdJzVnmurvQE7MheKZVuC5LMHl7Vh20YPrOgSZ2vH4SSRtxVOzh_n7py7ZSYBo_40Cf2TgwNsLDCTfLqVtucOyonbWAwfwOmLHOsFmHhtszsKVNg7ptCoNHinAyrPgWqSJs2WKdr1w4SibKOeA2fACSovm31uHaMc4KmmOQSr5AAN6ezFJVpTtXRtFWvRz0MdM32vgU_mLZtfm2zH2D6tTUzg-ZPug4oYgvTFNBQxKVL3Bzu_8q4p8lmFAjqL4caHtp3-pUm24l2i8RWlLdgX9WnzoojuBbFwb3-DackYD6TUL13ZVyjmghdN5DyCVRIh9h4FYOBXxN697nwYPZ6_Yt-sbIYVv3s2bpqQ8i4GJWIZm42RnrLpO9UoIrr9JiYI=s1600-rj" alt="Special Collection" />
                        <div className="offer-badge-floating">GIẢM 40%</div>
                    </div>
                    <div className="offer-content-side">
                        <span className="offer-tag">BỘ SƯU TẬP MÙA THU</span>
                        <h2 className="offer-heading">Từ Zero <br /><span>Đến Hero Lập <br />Trình</span></h2>
                        <p className="offer-desc">Tổng hợp những đầu sách lập trình tinh hoa từ căn bản đến nâng cao. Giúp bạn làm chủ các công nghệ mới nhất và xây dựng nền tảng tư duy logic vững chắc. Ưu đãi đặc biệt dành riêng cho sinh viên IT.</p>
                        <div className="offer-actions">
                            <button className="offer-btn-primary" onClick={() => navigate('/shop')}>KHÁM PHÁ NGAY</button>
                            <button className="offer-btn-secondary" onClick={() => navigate('/shop')}>TÌM HIỂU THÊM</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Categories Section */}
            <section
                ref={sectionRefs.categories}
                data-section="categories"
                className={`categories-section reveal-on-scroll ${visibleSections.categories ? 'visible' : ''}`}
            >
                <div className="section-container">
                    <div className="section-header-centered">
                        <span className="section-subtitle-small">KHÁM PHÁ NGAY</span>
                        <h2 className="section-title-large">Thể Loại Phổ Biến</h2>
                    </div>
                    <div className="categories-grid">
                        {topCategories.length > 0 ? topCategories.map((item, index) => (
                            <div key={index} className={`category-card ${getCategoryClass(item.category.name)}`}>
                                <div className="category-icon-bg">{getCategoryIcon(item.category)}</div>
                                <div className="category-overlay">
                                    <div className="category-icon-small">{getCategoryIcon(item.category)}</div>
                                    <h4>{item.category.name}</h4>
                                    <p>{item.totalSold}+ lượt mua</p>
                                </div>
                            </div>
                        )) : (
                            <div className="no-data-simple">Chưa có danh mục nổi bật</div>
                        )}
                    </div>
                </div>
            </section >

            {/* 3.5. Mood-Based Discovery */}
            <section className="mood-discovery-section section-container">
                <div className="section-header-centered">
                    <span className="section-subtitle-small">HÔM NAY BẠN ĐỌC GÌ?</span>
                    <h2 className="section-title-large">Khám phá theo tâm trạng</h2>
                    <div className="mood-selectors">
                        {['all', 'Cần động lực', 'Để thư giãn', 'Muốn suy ngẫm', 'Yêu lãng mạn'].map(mood => (
                            <button
                                key={mood}
                                className={`mood-btn ${selectedMood === mood ? 'active' : ''}`}
                                onClick={() => setSelectedMood(mood)}
                            >
                                {mood === 'all' ? 'Tất cả' : mood}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mood-books-grid">
                    <div className="mood-slider-window">
                        <div
                            ref={moodTrackRef}
                            className={`mood-track ${isMoodDragging ? 'dragging' : ''}`}
                            style={moodTrackStyle}
                            onMouseDown={handleMoodStart}
                            onMouseMove={handleMoodMove}
                            onMouseUp={handleMoodEnd}
                            onMouseLeave={() => isMoodDragging && handleMoodEnd()}
                            onTouchStart={handleMoodStart}
                            onTouchMove={handleMoodMove}
                            onTouchEnd={handleMoodEnd}
                        >
                            {books.slice(0, 8).map((book, idx) => (
                                <div key={book.id} className="mood-book-card">
                                    <div className="m-card-top">
                                        <div className="m-book-img">
                                            <img src={getBookImg(book.imagePath)} alt={book.title} />
                                            <div className="m-badges">
                                                {book.isOnSale && <span className="m-badge-sale">-{Math.round((1 - book.discountPrice / book.price) * 100)}%</span>}
                                                <div className={`source-tag ${book.bookSource?.toLowerCase() || 'official'}`}>
                                                    {book.bookSource === 'AUTHOR' ? 'Author' : 'Official'}
                                                </div>
                                            </div>
                                            <div className="m-overlay-actions">
                                                <button className="q-view-btn-small" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setQuickViewBook(book);
                                                }}>Xem nhanh</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="m-card-body">
                                        <span className="m-category-name">{book.category?.name || 'Chưa phân loại'}</span>
                                        <h5 className="m-title">{book.title}</h5>
                                        <div className="m-pricing-row">
                                            <span className="m-current-price">{book.isOnSale ? book.discountPrice?.toLocaleString() : book.price?.toLocaleString()}đ</span>
                                            {book.isOnSale && <span className="m-old-price">{book.price?.toLocaleString()}đ</span>}
                                        </div>
                                        <div className="m-author-rating-row">
                                            <div className="m-author-info">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${book.author}`} alt={book.author} />
                                                <span>{book.author} <small>({book.totalSold || 0})</small></span>
                                            </div>
                                            <div className="m-stars">
                                                {['★', '★', '★', '★', '☆'].map((s, i) => <span key={i} className={s === '★' ? 'star-fill' : 'star-empty'}>{s}</span>)}
                                            </div>
                                        </div>
                                        <button className="m-add-cart-btn">Thêm vào giỏ hàng</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mood Promo Banner - Kept separate as requested */}
                    <div className="mood-promo-banner">
                        <div className="promo-text-content">
                            <h3>Find Your <br />Nest Books!</h3>
                            <p>Get Your 25% Discount Now!</p>
                            <button className="promo-shop-btn" onClick={() => navigate('/shop')}>Shop Now <span className="arrow">→</span></button>
                        </div>
                        <div className="promo-image-wrapper">
                            <img src="/artifacts/mood_promo_girl_banner_1773223446542.png" alt="Promo" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Sách Mới Section */}
            <section
                ref={sectionRefs.newest}
                data-section="newest"
                className={`books-section reveal-on-scroll ${visibleSections.newest ? 'visible' : ''}`}
            >
                <div className="section-container">
                    <div className="section-header-centered">
                        <span className="section-subtitle-small">SẢN PHẨM CHẤT LƯỢNG</span>
                        <h2 className="section-title-large">Sách Mới Phát Hành</h2>
                    </div>
                    <div className="books-carousel-wrapper">
                        <button className={`nav-button prev ${currentPage === 0 ? 'disabled' : ''}`} onClick={prevPage}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <div className="book-carousel-window">
                            <div className="book-carousel-track" style={{ transform: `translateX(-${currentPage * 100}%)` }}>
                                {books.length > 0 ? books.map((book) => (
                                    <div key={book.id} className="book-card-item-wrapper">
                                        <div className="book-card-alt">
                                            <div className="book-image-container">
                                                <img
                                                    className="main-book-cover"
                                                    src={getBookImg(book.imagePath)}
                                                    alt={book.title}
                                                    loading="lazy"
                                                    width="200"
                                                    height="300"
                                                />
                                                <div className={`source-tag ${book.bookSource?.toLowerCase() || 'official'}`}>
                                                    {book.bookSource === 'AUTHOR' ? 'Author' : 'Official'}
                                                </div>
                                                <div className="add-to-cart-overlay">
                                                    <button className="q-view-btn" onClick={() => setQuickViewBook(book)}>Xem nhanh</button>
                                                    <button>THÊM VÀO GIỎ</button>
                                                </div>
                                            </div>
                                            <div className="book-info-centered">
                                                <h3>{book.title}</h3>
                                                <p className="author">
                                                    {book.author}
                                                    <span className="sold-alt"> | Đã bán {book.totalSold || 0}</span>
                                                </p>
                                                <p className="price">{book.price?.toLocaleString()} VNĐ</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="no-data-carousel">Hiện tại chưa có sách mới phát hành</div>
                                )}
                            </div>
                        </div>
                        <button className={`nav-button next ${currentPage === totalPages - 1 ? 'disabled' : ''}`} onClick={nextPage}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>
                    <div className="view-all-wrapper">
                        <button className="view-all-btn" onClick={() => navigate('/shop')}>Xem Phân Loại Đặc Sắc <span className="arrow">→</span></button>
                    </div>
                </div>
            </section >

            {/* Parallax Sale Banner Section */}
            <section
                ref={sectionRefs.parallax}
                data-section="parallax"
                className={`parallax-banner-section reveal-on-scroll ${visibleSections.parallax ? 'visible' : ''}`}
            >
                <div
                    ref={parallaxBgRef}
                    className="parallax-bg"
                    style={{ backgroundImage: `url(${parallaxBg})` }}
                ></div>
                <div className="banner-sale-content">
                    <span className="sale-tag">Get 25%</span>
                    <h2>Discount In All <br />Kind Of Super Selling</h2>
                    <button className="banner-shop-btn" onClick={() => navigate('/shop')}>
                        Shop Now <span className="arrow">→</span>
                    </button>
                </div>
            </section>

            {/* 4.5. Community Spotlight - Modern Testimonials */}
            <section
                ref={sectionRefs.testimonials}
                data-section="testimonials"
                className={`community-spotlight reveal-on-scroll ${visibleSections.testimonials ? 'visible' : ''}`}
            >
                <div className="section-container">
                    <div className="spotlight-header">
                        <h2>Độc giả nói gì về chúng tôi?</h2>
                        <p>Hơn 10,000+ người đã tìm thấy cảm hứng từ thư viện của Bookstore</p>
                    </div>
                    <div className="spotlight-grid">
                        {testimonials.map((item, i) => (
                            <div key={i} className="spotlight-item">
                                <div className="spotlight-card-content">
                                    <div className="stars-row">★★★★★</div>
                                    <p>"{item.comment}"</p>
                                    <div className="spotlight-user">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`} alt={item.name} />
                                        <div className="user-text">
                                            <strong>{item.name}</strong>
                                            <span>{item.role}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Author's Collection */}
            <section
                ref={sectionRefs.authors}
                data-section="authors"
                className={`authors-section reveal-on-scroll ${visibleSections.authors ? 'visible' : ''}`}
            >
                <div className="section-container">
                    <div className="section-header-centered"><span className="section-subtitle-small">BẬC THẦY TRI THỨC</span><h2 className="section-title-large">Tác Giả Nổi Bật</h2></div>
                    <div className="authors-grid">
                        {topAuthors.length > 0 ? topAuthors.map((author, index) => (
                            <div key={index} className="author-card">
                                <div className="author-img-wrapper">
                                    <img
                                        src={getAuthorImg(author, index)}
                                        alt={author.authorName}
                                        loading="lazy"
                                    />
                                </div>
                                <h4>{author.authorName}</h4>
                                <p>
                                    {author.bookCount || 0} tác phẩm {author.totalSold > 0 ? `| ${author.totalSold} lượt bán` : ''}
                                </p>
                            </div>
                        )) : (
                            <div className="no-data-simple">Đang cập nhật danh sách tác giả</div>
                        )}
                    </div>
                    <div className="view-all-wrapper">
                        <button className="view-all-btn" onClick={() => navigate('/shop')}>Khám Phá Toàn Bộ Tác Giả <span className="arrow">→</span></button>
                    </div>
                </div>
            </section >

            {/* 6. Newsletter Section (Overlapping Footer Style) */}
            <section
                ref={sectionRefs.newsletter}
                data-section="newsletter"
                className={`newsletter-section reveal-on-scroll ${visibleSections.newsletter ? 'visible' : ''}`}
            >
                <div className="newsletter-box-premium">
                    {/* Decorative Blurred Shapes for depth */}
                    <div className="blur-shape shape-1"></div>
                    <div className="blur-shape shape-2"></div>
                    <div className="blur-shape shape-3"></div>

                    <div className="newsletter-premium-content">
                        <h2 className="premium-title">Hội Sách Online 2024</h2>
                        <p className="premium-subtitle">
                            Các tác giả của chúng tôi luôn tận tâm với công việc viết lách của mình và mong muốn được chia sẻ nhiều thông tin hơn về những cuốn sách của họ với bạn.
                            Sau đó, bạn có thể khám phá ở bất cứ đâu.
                        </p>
                        <div className="newsletter-premium-actions">
                            <form className="newsletter-premium-form" onSubmit={e => e.preventDefault()}>
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    placeholder="Nhập địa chỉ email của bạn…"
                                    className="newsletter-premium-input"
                                    spellCheck={false}
                                    required
                                />
                                <button type="submit" className="registration-btn-premium">ĐĂNG KÝ NGAY</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick View Modal Dùng Chung */}
            <QuickViewModal 
                book={quickViewBook} 
                onClose={() => setQuickViewBook(null)} 
            />
        </div >
    );
};

export default Home;
