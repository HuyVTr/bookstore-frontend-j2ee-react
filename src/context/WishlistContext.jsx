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

    useEffect(() => {
        const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlist(savedWishlist);
    }, []);

    const toggleWishlist = (book) => {
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
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));

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
