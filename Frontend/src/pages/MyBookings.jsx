import React, { useState, useEffect } from 'react';
import { FaTrain, FaCalendarAlt, FaUser, FaTicketAlt, FaSpinner, FaTrash, FaPrint, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import styles from './MyBookings.module.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/bookings/my-bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await axios.post(`/api/bookings/${bookingId}/cancel`);
      alert('Booking cancelled successfully!');
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FaCheckCircle className={styles.statusIconConfirmed} />;
      case 'waiting':
        return <FaClock className={styles.statusIconWaiting} />;
      case 'cancelled':
        return <FaTimesCircle className={styles.statusIconCancelled} />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'waiting':
        return 'Waiting List';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'waiting':
        return styles.statusWaiting;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3 className={styles.errorTitle}>Error Loading Bookings</h3>
        <p className={styles.errorMessage}>{error}</p>
        <button onClick={fetchBookings} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.myBookings}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Bookings</h1>
          <p className={styles.subtitle}>View and manage all your railway bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className={styles.emptyState}>
            <FaTicketAlt className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No bookings found</h3>
            <p className={styles.emptyMessage}>You haven't made any bookings yet</p>
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {bookings.map((booking) => (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div className={styles.bookingInfo}>
                    <div className={styles.trainInfo}>
                      <FaTrain className={styles.trainIcon} />
                      <div>
                        <h3 className={styles.trainName}>{booking.train_name}</h3>
                        <p className={styles.trainNumber}>{booking.train_number}</p>
                      </div>
                    </div>
                    <div className={styles.bookingStatus}>
                      <div className={`${styles.statusBadge} ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span>{getStatusText(booking.status)}</span>
                      </div>
                      <div className={styles.pnrNumber}>PNR: {booking.pnr_number}</div>
                    </div>
                  </div>
                  <div className={styles.bookingAmount}>
                    <div className={styles.amount}>₹{booking.total_amount}</div>
                    <div className={styles.bookingDate}>
                      Booked on {formatDateTime(booking.booking_date)}
                    </div>
                  </div>
                </div>

                <div className={styles.bookingDetails}>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>
                        <FaUser className={styles.detailIcon} />
                        Passengers
                      </div>
                      <div className={styles.detailValue}>
                        {booking.total_passengers} ({booking.confirmed_seats} confirmed)
                      </div>
                      {booking.waiting_seats > 0 && (
                        <div className={styles.waitingSeats}>
                          {booking.waiting_seats} in waiting list
                        </div>
                      )}
                    </div>

                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>From</div>
                      <div className={styles.detailValue}>{booking.source_station}</div>
                    </div>

                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>To</div>
                      <div className={styles.detailValue}>{booking.destination_station}</div>
                    </div>

                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>
                        <FaCalendarAlt className={styles.detailIcon} />
                        Journey Date
                      </div>
                      <div className={styles.detailValue}>{formatDate(booking.journey_date)}</div>
                    </div>
                  </div>
                </div>

                <div className={styles.bookingFooter}>
                  <div className={styles.bookingId}>
                    Booking ID: #{booking.id}
                  </div>
                  <div className={styles.bookingActions}>
                    <button
                      onClick={() => window.print()}
                      className={styles.printButton}
                    >
                      <FaPrint className={styles.printIcon} />
                      Print Ticket
                    </button>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                        className={styles.cancelButton}
                      >
                        {cancellingId === booking.id ? (
                          <FaSpinner className={styles.cancelSpinner} />
                        ) : (
                          <FaTrash className={styles.cancelIcon} />
                        )}
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;