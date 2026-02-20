import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaSpinner, FaLock, FaArrowLeft } from 'react-icons/fa';
import styles from './ProtectedRoute.module.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  return children;
};

// Higher-Order Component version for role-based access
export const withAuth = (Component, requiredRole = null) => {
  return function WithAuthComponent(props) {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
      return (
        <div className={styles.unauthorizedContainer}>
          <div className={styles.unauthorizedContent}>
            <div className={styles.unauthorizedIcon}>
              <FaLock />
            </div>
            <h2 className={styles.unauthorizedTitle}>Access Denied</h2>
            <p className={styles.unauthorizedMessage}>
              You don't have permission to access this page. 
              {requiredRole && ` Required role: ${requiredRole}`}
            </p>
            <div className={styles.unauthorizedActions}>
              <button
                onClick={() => window.history.back()}
                className={styles.backButton}
              >
                <FaArrowLeft className={styles.backIcon} />
                Go Back
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className={styles.homeButton}
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default ProtectedRoute;