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

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth2-redirect" element={<OAuth2RedirectHandler />} />
            <Route path="/staff/manage-books" element={<ManageBooks />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
