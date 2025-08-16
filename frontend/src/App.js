import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import Community from './pages/Community';
import Events from './pages/Events';
import ProfilePage from './pages/Profile';
import SignupPage from './pages/Signup';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import { ToastContainer } from 'react-toastify';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/community" element={<Community />} />
        <Route path="/events" element={<Events />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<SignupPage />} />
      </Routes>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
