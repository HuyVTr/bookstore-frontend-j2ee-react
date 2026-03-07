import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Guest/Home';
import './index.css';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import OAuth2RedirectHandler from './pages/Auth/OAuth2RedirectHandler';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth2-redirect" element={<OAuth2RedirectHandler />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
