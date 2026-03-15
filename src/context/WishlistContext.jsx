import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [notification, setNotification] = useState({ show: false, book: null, type: 'add' });
    const username = localStorage.getItem('username');

    // Tải wishlist khi username thay đổi (login/logout)
    useEffect(() => {
        if (username) {
            const savedWishlist = JSON.parse(localStorage.getItem(`wishlist_${username}`) || '[]');
            setWishlist(savedWishlist);
        } else {
            setWishlist([]); // Clear if logged out
        }
    }, [username]);

    const toggleWishlist = (book) => {
        if (!username) {
            alert("Vui lòng đăng nhập để lưu vào danh sách yêu thích.");
            return;
        }

        const isExist = wishlist.find(item => item.id === book.id);
        let updatedWishlist;

        if (isExist) {
            updatedWishlist = wishlist.filter(item => item.id !== book.id);
            setNotification({ show: true, book, type: 'remove' });
        } else {
            updatedWishlist = [...wishlist, {
                id: book.id,
                title: book.title,
                author: book.author,
                price: book.price,
                imagePath: book.imagePath,
                isOnSale: book.isOnSale,
                discountPrice: book.discountPrice
            }];
            setNotification({ show: true, book, type: 'add' });
        }

        setWishlist(updatedWishlist);
        localStorage.setItem(`wishlist_${username}`, JSON.stringify(updatedWishlist));

        // Auto hide notification
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    const isInWishlist = (id) => {
        return wishlist.some(item => item.id === id);
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, show: false }));
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, notification, closeNotification }}>
            {children}
        </WishlistContext.Provider>
    );
};
