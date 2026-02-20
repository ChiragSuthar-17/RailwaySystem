import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaArrowRight, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Register.module.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    const validationErrors = [];
    
    if (!formData.username || !formData.email || !formData.fullName || !formData.password || !formData.confirmPassword) {
      validationErrors.push('Please fill in all required fields');
    }
    
    if (formData.username.length < 3) {
      validationErrors.push('Username must be at least 3 characters');
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.push('Please enter a valid email address');
    }
    
    if (formData.fullName.length < 2) {
      validationErrors.push('Full name must be at least 2 characters');
    }
    
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      validationErrors.push('Please enter a valid 10-digit phone number');
    }
    
    if (formData.password.length < 6) {
      validationErrors.push('Password must be at least 6 characters');
    }
    
    if (formData.password !== formData.confirmPassword) {
      validationErrors.push('Passwords do not match');
    }
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }
    
    setLoading(true);

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phone: formData.phone || undefined,
    };

    const result = await register(userData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Registration failed. Please try again.');
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

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 10) {
      return phoneNumber;
    }
    return phoneNumber.slice(0, 10);
  };

  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    handleChange({
      target: {
        name: 'phone',
        value: formattedPhone
      }
    });
  };

  return (
    <div className={styles.register}>
      <div className={styles.container}>
        <div className={styles.registerCard}>
          <div className={styles.registerHeader}>
            <h1 className={styles.registerTitle}>Create Account</h1>
            <p className={styles.registerSubtitle}>Join RailExpress to book tickets easily</p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <FaExclamationTriangle className={styles.errorIcon} />
              <div className={styles.errorText}>
                {error.split('\n').map((err, index) => (
                  <div key={index}>{err}</div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.registerForm}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.formLabel}>
                  <FaUser className={styles.labelIcon} />
                  Username <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="Enter username"
                  disabled={loading}
                  minLength="3"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                  <FaEnvelope className={styles.labelIcon} />
                  Email Address <span className={styles.required}>*</span>
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
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="fullName" className={styles.formLabel}>
                <FaUser className={styles.labelIcon} />
                Full Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter your full name"
                disabled={loading}
                minLength="2"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.formLabel}>
                <FaPhone className={styles.labelIcon} />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={styles.formInput}
                placeholder="Enter 10-digit phone number"
                disabled={loading}
                maxLength="10"
              />
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  <FaLock className={styles.labelIcon} />
                  Password <span className={styles.required}>*</span>
                </label>
                <div className={styles.passwordInputContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Enter password (min. 6 chars)"
                    disabled={loading}
                    minLength="6"
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

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>
                  <FaLock className={styles.labelIcon} />
                  Confirm Password <span className={styles.required}>*</span>
                </label>
                <div className={styles.passwordInputContainer}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Confirm your password"
                    disabled={loading}
                    minLength="6"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.passwordToggle}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.termsGroup}>
              <input
                type="checkbox"
                id="terms"
                name="terms"
                className={styles.termsCheckbox}
                disabled={loading}
                required
              />
              <label htmlFor="terms" className={styles.termsLabel}>
                I agree to the{' '}
                <Link to="/terms" className={styles.termsLink}>
                  Terms & Conditions
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className={styles.termsLink}>
                  Privacy Policy
                </Link>
                <span className={styles.required}>*</span>
              </label>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.buttonSpinner}></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <FaArrowRight className={styles.submitIcon} />
                </>
              )}
            </button>
          </form>

          <div className={styles.registerFooter}>
            <p className={styles.footerText}>
              Already have an account?{' '}
              <Link to="/login" className={styles.loginLink}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;