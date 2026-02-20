import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaTrain, FaUser, FaSignOutAlt, FaTicketAlt, FaHome, FaSearch } from 'react-icons/fa';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <Link to="/" className={styles.logo}>
              <FaTrain className={styles.logoIcon} />
              <span className={styles.logoText}>RailExpress</span>
            </Link>

            <nav className={styles.nav}>
              <Link to="/" className={styles.navLink}>
                <FaHome className={styles.navIcon} />
                <span>Home</span>
              </Link>
              <Link to="/search" className={styles.navLink}>
                <FaSearch className={styles.navIcon} />
                <span>Search Trains</span>
              </Link>
              {isAuthenticated && (
                <Link to="/my-bookings" className={styles.navLink}>
                  <FaTicketAlt className={styles.navIcon} />
                  <span>My Bookings</span>
                </Link>
              )}
            </nav>

            <div className={styles.authSection}>
              {isAuthenticated ? (
                <>
                  <div className={styles.userInfo}>
                    <FaUser className={styles.userIcon} />
                    <span className={styles.userEmail}>{user?.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={styles.loginButton}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={styles.registerButton}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerSection}>
              <div className={styles.footerLogo}>
                <FaTrain className={styles.footerLogoIcon} />
                <span className={styles.footerLogoText}>RailExpress</span>
              </div>
              <p className={styles.footerDescription}>
                Your trusted partner for railway ticket bookings. Fast, reliable, and secure.
              </p>
            </div>

            <div className={styles.footerSection}>
              <h3 className={styles.footerHeading}>Quick Links</h3>
              <ul className={styles.footerLinks}>
                <li><Link to="/search" className={styles.footerLink}>Book Tickets</Link></li>
                <li><Link to="/my-bookings" className={styles.footerLink}>My Bookings</Link></li>
                <li><Link to="/" className={styles.footerLink}>PNR Status</Link></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h3 className={styles.footerHeading}>Information</h3>
              <ul className={styles.footerLinks}>
                <li><a href="#" className={styles.footerLink}>About Us</a></li>
                <li><a href="#" className={styles.footerLink}>Contact Us</a></li>
                <li><a href="#" className={styles.footerLink}>FAQ</a></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h3 className={styles.footerHeading}>Legal</h3>
              <ul className={styles.footerLinks}>
                <li><a href="#" className={styles.footerLink}>Terms & Conditions</a></li>
                <li><a href="#" className={styles.footerLink}>Privacy Policy</a></li>
                <li><a href="#" className={styles.footerLink}>Refund Policy</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>&copy; {new Date().getFullYear()} RailExpress. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;