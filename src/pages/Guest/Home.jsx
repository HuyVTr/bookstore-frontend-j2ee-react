import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './Home.css';

const Home = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                // Backend của chúng ta dùng path /api/public/books
                const response = await api.get('/public/books');
                // Backend trả về object { books: [...], totalPages: ... }
                setBooks(response.data.books || []);
            } catch (error) {
                console.error("Lỗi khi tải danh sách sách:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

    return (
        <div className="home-container">
            <section className="hero-banner glass">
                <div className="hero-content">
                    <div className="hero-text">
                        <span className="hero-subtitle">Chào mừng đến với Bookstore</span>
                        <h1>Thế giới tri thức <br /><span>trong tầm tay bạn.</span></h1>
                        <p>Khám phá bộ sưu tập sách đa dạng, quản lý đơn hàng và trải nghiệm không gian đọc sách kỹ thuật số cao cấp ngay hôm nay.</p>
                        <div className="hero-btns">
                            <button className="cta-button primary hover-lift">Khám phá ngay</button>
                            <button className="cta-button secondary hover-lift">Tìm hiểu thêm</button>
                        </div>
                    </div>
                    <div className="hero-image-container">
                        <img
                            src="http://localhost:8080/images/hero.png"
                            alt="Bookstore Hero"
                            className="hero-main-img"
                        />
                        <div className="hero-floating-card glass">
                            <span className="icon">🏆</span>
                            <div>
                                <strong>Top 1 Bookstore</strong>
                                <p>Sách hay mỗi ngày</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="book-section">
                <h2 className="section-title">Sách Mới Nhất</h2>
                <div className="book-grid">
                    {books.map((book) => (
                        <div key={book.id} className="book-card hover-lift">
                            <div className="book-image">
                                <img
                                    src={book.imagePath
                                        ? `http://localhost:8080${book.imagePath.startsWith('/') ? '' : '/'}${book.imagePath}`
                                        : 'https://via.placeholder.com/200x300?text=Khong+co+anh'}
                                    alt={book.title}
                                />
                            </div>
                            <div className="book-info">
                                <h3>{book.title}</h3>
                                <p className="author">Bởi {book.author}</p>
                                <p className="price">{book.price?.toLocaleString()} VNĐ</p>
                                <button className="add-cart-btn">Thêm vào giỏ</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
