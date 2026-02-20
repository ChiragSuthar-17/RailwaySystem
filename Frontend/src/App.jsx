import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import SearchTrains from './pages/SearchTrains';
import TrainDetails from './pages/TrainDetails';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<SearchTrains />} />
            <Route path="/train/:id" element={<TrainDetails />} />
            
            {/* Protected Routes */}
            <Route path="/book/:trainId" element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            } />
            
            <Route path="/my-bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;