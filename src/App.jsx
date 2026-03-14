import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Guest/Home';
import Shop from './pages/Guest/Shop';
import BookDetail from './pages/Guest/BookDetail/BookDetail';
import './index.css';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import OAuth2RedirectHandler from './pages/Auth/OAuth2RedirectHandler';
import ManageBooks from './pages/Staff/ManageBooks';
import Cart from './pages/User/Cart/Cart';
import Wishlist from './pages/User/Wishlist/Wishlist';
import Checkout from './pages/User/Checkout/Checkout';
import Profile from './pages/User/Profile/Profile';
import OrderHistory from './pages/User/Orders/OrderHistory';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import CartNotification from './components/CartNotification/CartNotification';
import WishlistNotification from './components/WishlistNotification/WishlistNotification';

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="app-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/book/:id" element={<BookDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/oauth2-redirect" element={<OAuth2RedirectHandler />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/wishlist" element={<Wishlist />} />

                {/* Staff Routes */}
                <Route path="/staff/manage-books" element={<ManageBooks />} />
              </Routes>
            </main>
            <Footer />
            <CartNotification />
            <WishlistNotification />
          </div>
        </Router>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
