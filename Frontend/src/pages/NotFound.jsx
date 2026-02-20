import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaTrain } from 'react-icons/fa';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.notFound}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorCode}>
            <FaTrain className={styles.trainIcon} />
            <span>404</span>
          </div>
          <h1 className={styles.title}>Page Not Found</h1>
          <p className={styles.message}>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className={styles.actions}>
            <Link to="/" className={styles.primaryButton}>
              <FaHome className={styles.buttonIcon} />
              Go to Homepage
            </Link>
            <Link to="/search" className={styles.secondaryButton}>
              <FaSearch className={styles.buttonIcon} />
              Search Trains
            </Link>
          </div>
          <div className={styles.suggestions}>
            <h3 className={styles.suggestionsTitle}>You might be looking for:</h3>
            <div className={styles.suggestionLinks}>
              <Link to="/search" className={styles.suggestionLink}>Search Trains</Link>
              <Link to="/my-bookings" className={styles.suggestionLink}>My Bookings</Link>
              <Link to="/login" className={styles.suggestionLink}>Login</Link>
              <Link to="/register" className={styles.suggestionLink}>Register</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;