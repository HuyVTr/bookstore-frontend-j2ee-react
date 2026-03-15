import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import StaffDashboard from './pages/Staff/StaffDashboard';
import StaffOrders from './pages/Staff/StaffOrders';
import StaffCategories from './pages/Staff/StaffCategories';
import StaffLayout from './components/Staff/StaffLayout';
import StaffProfile from './pages/Staff/StaffProfile';

import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import AdminReports from './pages/Admin/AdminReports';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminSettings from './pages/Admin/AdminSettings';
import AdminLayout from './components/Admin/AdminLayout';

import AuthorLayout from './components/Author/AuthorLayout';
import AuthorDashboard from './pages/Author/AuthorDashboard';
import AuthorBooks from './pages/Author/AuthorBooks';
import AuthorProfile from './pages/Author/AuthorProfile';

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
          <AppRoutes />
        </Router>
      </WishlistProvider>
    </CartProvider>
  );
}

const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.startsWith('/staff') || 
                      location.pathname.startsWith('/admin') || 
                      location.pathname.startsWith('/author');

  useEffect(() => {
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isStaff = roles.includes('ROLE_STAFF') || roles.includes('STAFF');
    const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');
    const isAuthor = roles.includes('ROLE_AUTHOR') || roles.includes('AUTHOR');

    // Nếu user là Staff hoặc Admin, tự động chuyển hướng vào Dashboard khi truy cập trang chủ
    if (location.pathname === '/') {
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else if (isStaff) {
        navigate('/staff/dashboard', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return (
    <div className="app">
      {!isDashboard && <Header />}
      <main className={!isDashboard ? "app-content" : ""}>
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

          {/* Staff Dashboard Routes */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffDashboard />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="manage-books" element={<ManageBooks />} />
            <Route path="categories" element={<StaffCategories />} />
            <Route path="orders" element={<StaffOrders />} />
            <Route path="profile" element={<StaffProfile />} />
            <Route path="settings" element={<StaffProfile />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="profile" element={<StaffProfile />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Author Console Routes */}
          <Route path="/author" element={<AuthorLayout />}>
            <Route index element={<AuthorDashboard />} />
            <Route path="dashboard" element={<AuthorDashboard />} />
            <Route path="my-books" element={<AuthorBooks />} />
            <Route path="profile" element={<AuthorProfile />} />
            <Route path="settings" element={<AuthorProfile />} />
          </Route>
        </Routes>
      </main>
      {!isDashboard && <Footer />}
      {!isDashboard && <CartNotification />}
      {!isDashboard && <WishlistNotification />}
    </div>
  );
};

export default App;

