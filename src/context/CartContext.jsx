import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, book: null, quantity: 0 });

    const fetchCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            const res = await api.get('cart');
            setCart(res.data);
        } catch (error) {
            console.error("Lỗi khi tải giỏ hàng:", error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const addToCart = async (book, quantity = 1) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return { success: false, error: 'unauthorized' };
        }

        setLoading(true);
        try {
            const res = await api.post(`cart/add/${book.id}?quantity=${quantity}`);
            setCart(res.data);
            
            // Show custom notification
            setNotification({ show: true, book, quantity });
            
            // Auto hide notification after 4 seconds
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 4000);

            return { success: true };
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            return { success: false, error: error.response?.data || "Có lỗi xảy ra" };
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (id, newQty) => {
        if (newQty < 1) return;
        try {
            const res = await api.put(`cart/update/${id}?quantity=${newQty}`);
            setCart(res.data);
            return { success: true };
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
            return { success: false, error: error.response?.data || "Có lỗi xảy ra" };
        }
    };

    const removeFromCart = async (id) => {
        try {
            const res = await api.delete(`cart/remove/${id}`);
            setCart(res.data);
            return { success: true };
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            return { success: false, error: error.response?.data || "Có lỗi xảy ra" };
        }
    };

    const clearCart = async () => {
        try {
            await api.delete('cart/clear');
            setCart({ cartItems: [], totalPrice: 0 });
            return { success: true };
        } catch (error) {
            console.error("Lỗi khi xóa giỏ hàng:", error);
            return { success: false, error: error.response?.data || "Có lỗi xảy ra" };
        }
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, show: false }));
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, loading, notification, closeNotification, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};
