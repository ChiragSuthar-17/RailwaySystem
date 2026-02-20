import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock, FaArrowRight, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className={styles.login}>
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1 className={styles.loginTitle}>Welcome Back</h1>
            <p className={styles.loginSubtitle}>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <FaExclamationTriangle className={styles.errorIcon} />
              <span className={styles.errorText}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                <FaUser className={styles.labelIcon} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter your email"
                disabled={loading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.passwordLabelContainer}>
                <label htmlFor="password" className={styles.formLabel}>
                  <FaLock className={styles.labelIcon} />
                  Password
                </label>
                <Link to="/forgot-password" className={styles.forgotPassword}>
                  Forgot Password?
                </Link>
              </div>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.buttonSpinner}></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <FaArrowRight className={styles.submitIcon} />
                </>
              )}
            </button>
          </form>

          <div className={styles.loginFooter}>
            <p className={styles.footerText}>
              Don't have an account?{' '}
              <Link to="/register" className={styles.registerLink}>
                Create Account
              </Link>
            </p>
          </div>

          <div className={styles.loginDivider}>
            <span className={styles.dividerText}>or continue with</span>
          </div>

          <div className={styles.socialLogin}>
            <button type="button" className={styles.socialButton} disabled={loading}>
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className={styles.socialIcon}
              />
              Google
            </button>
            <button type="button" className={styles.socialButton} disabled={loading}>
              <FaUser className={styles.socialIcon} />
              Guest Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;