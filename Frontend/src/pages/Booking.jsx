import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { FaUser, FaTrain, FaCalendarAlt, FaRupeeSign, FaPlus, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import styles from './Booking.module.css';

const Booking = () => {
  const { trainId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(null);
  const [passengers, setPassengers] = useState([
    { name: '', age: '', gender: 'male' }
  ]);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [error, setError] = useState('');

  const journeyDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchTrainDetails();
    fetchAvailability();
  }, [trainId, journeyDate]);

  const fetchTrainDetails = async () => {
    try {
      const response = await axios.get(`/api/trains/${trainId}`);
      setTrain(response.data.train);
    } catch (error) {
      console.error('Failed to fetch train details:', error);
      setError('Failed to load train details');
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(`/api/trains/${trainId}/availability`, {
        params: { date: journeyDate }
      });
      setAvailability(response.data);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      setError('Failed to check seat availability');
    } finally {
      setLoading(false);
    }
  };

  const addPassenger = () => {
    if (passengers.length < 6) {
      setPassengers([...passengers, { name: '', age: '', gender: 'male' }]);
    }
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      const updatedPassengers = passengers.filter((_, i) => i !== index);
      setPassengers(updatedPassengers);
    }
  };

  const updatePassenger = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const validatePassenger = (passenger, index) => {
    const errors = [];
    
    if (!passenger.name.trim()) {
      errors.push(`Passenger ${index + 1}: Name is required`);
    } else if (passenger.name.length < 2) {
      errors.push(`Passenger ${index + 1}: Name must be at least 2 characters`);
    }
    
    if (!passenger.age) {
      errors.push(`Passenger ${index + 1}: Age is required`);
    } else if (passenger.age < 1 || passenger.age > 120) {
      errors.push(`Passenger ${index + 1}: Age must be between 1 and 120`);
    }
    
    return errors;
  };

  const handleBooking = async () => {
    setError('');
    
    // Validate all passengers
    const validationErrors = [];
    passengers.forEach((passenger, index) => {
      const errors = validatePassenger(passenger, index);
      validationErrors.push(...errors);
    });
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    if (passengers.length > availability.availableSeats) {
      const confirmBooking = window.confirm(
        `Only ${availability.availableSeats} seats are available. ${passengers.length - availability.availableSeats} passenger(s) will be added to waiting list. Continue?`
      );
      if (!confirmBooking) return;
    }

    setBookingInProgress(true);

    try {
      const response = await axios.post('/api/bookings', {
        trainId,
        journeyDate,
        passengers
      });

      alert(`Booking successful! PNR: ${response.data.booking.pnrNumber}`);
      navigate('/my-bookings');
    } catch (error) {
      console.error('Booking failed:', error);
      setError(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading booking details...</p>
      </div>
    );
  }

  if (error && !availability) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3 className={styles.errorTitle}>Error</h3>
        <p className={styles.errorMessage}>{error}</p>
        <button onClick={() => navigate('/search')} className={styles.backButton}>
          Back to Search
        </button>
      </div>
    );
  }

  if (!train || !availability) {
    return null;
  }

  const totalAmount = passengers.length * train.fare;
  const serviceCharge = passengers.length * 20;
  const gst = totalAmount * 0.05;
  const totalWithTaxes = totalAmount + serviceCharge + gst;

  return (
    <div className={styles.booking}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Complete Your Booking</h1>
          <p className={styles.subtitle}>Please review your booking details and fill passenger information</p>
        </div>

        <div className={styles.bookingGrid}>
          {/* Left Column - Train Details & Passengers */}
          <div className={styles.leftColumn}>
            {/* Train Information */}
            <div className={styles.trainCard}>
              <div className={styles.trainHeader}>
                <div className={styles.trainInfo}>
                  <FaTrain className={styles.trainIcon} />
                  <div>
                    <h2 className={styles.trainName}>{train.train_name}</h2>
                    <p className={styles.trainNumber}>{train.train_number}</p>
                  </div>
                </div>
                <div className={styles.trainFare}>
                  <div className={styles.fareAmount}>₹{train.fare}</div>
                  <div className={styles.fareLabel}>per passenger</div>
                </div>
              </div>

              <div className={styles.trainDetailsGrid}>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>From</div>
                  <div className={styles.detailValue}>{train.source_station}</div>
                  <div className={styles.detailTime}>{train.departure_time}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>To</div>
                  <div className={styles.detailValue}>{train.destination_station}</div>
                  <div className={styles.detailTime}>{train.arrival_time}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Journey Date</div>
                  <div className={styles.detailValue}>
                    <FaCalendarAlt className={styles.calendarIcon} />
                    {new Date(journeyDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.availabilityBar}>
                <div className={styles.availabilityInfo}>
                  <span className={styles.availabilityLabel}>Available Seats:</span>
                  <span className={`${styles.availabilityCount} ${
                    availability.availableSeats > 0 ? styles.available : styles.unavailable
                  }`}>
                    {availability.availableSeats}
                  </span>
                </div>
                <div className={styles.seatProgress}>
                  <div 
                    className={styles.seatProgressBar}
                    style={{ 
                      width: `${(availability.availableSeats / train.total_seats) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className={styles.totalSeats}>
                  Total Seats: {train.total_seats}
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            <div className={styles.passengersCard}>
              <div className={styles.passengersHeader}>
                <div className={styles.passengersTitle}>
                  <FaUser className={styles.passengersIcon} />
                  <span>Passenger Details ({passengers.length})</span>
                </div>
                {passengers.length < 6 && (
                  <button
                    onClick={addPassenger}
                    className={styles.addPassengerButton}
                  >
                    <FaPlus className={styles.addIcon} />
                    Add Passenger
                  </button>
                )}
              </div>

              {error && (
                <div className={styles.validationError}>
                  <FaExclamationTriangle className={styles.errorIcon} />
                  <div className={styles.errorText}>
                    {error.split('\n').map((err, index) => (
                      <div key={index}>{err}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.passengersList}>
                {passengers.map((passenger, index) => (
                  <div key={index} className={styles.passengerCard}>
                    <div className={styles.passengerHeader}>
                      <h3 className={styles.passengerTitle}>
                        Passenger {index + 1}
                        {index === 0 && <span className={styles.primaryPassenger}>(Primary)</span>}
                      </h3>
                      {passengers.length > 1 && (
                        <button
                          onClick={() => removePassenger(index)}
                          className={styles.removePassengerButton}
                        >
                          <FaTrash className={styles.removeIcon} />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className={styles.passengerForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Full Name <span className={styles.required}>*</span>
                        </label>
                        <input
                          type="text"
                          value={passenger.name}
                          onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                          className={styles.formInput}
                          placeholder="Enter full name"
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Age <span className={styles.required}>*</span>
                        </label>
                        <input
                          type="number"
                          value={passenger.age}
                          onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                          min="1"
                          max="120"
                          className={styles.formInput}
                          placeholder="Age"
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Gender <span className={styles.required}>*</span>
                        </label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                          className={styles.formSelect}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Fare Summary */}
          <div className={styles.rightColumn}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <h2 className={styles.summaryTitle}>Fare Summary</h2>
              </div>

              <div className={styles.summaryContent}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Base Fare ({passengers.length} × ₹{train.fare})</span>
                  <span className={styles.summaryValue}>₹{totalAmount}</span>
                </div>

                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Service Charges</span>
                  <span className={styles.summaryValue}>₹{serviceCharge}</span>
                </div>

                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>GST (5%)</span>
                  <span className={styles.summaryValue}>₹{gst.toFixed(2)}</span>
                </div>

                <div className={styles.summaryDivider}></div>

                <div className={styles.summaryTotal}>
                  <span className={styles.totalLabel}>Total Amount</span>
                  <span className={styles.totalValue}>
                    <FaRupeeSign className={styles.rupeeIcon} />
                    {totalWithTaxes.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className={styles.seatStatus}>
                <div className={styles.seatStatusHeader}>
                  <span className={styles.seatStatusLabel}>Seat Availability</span>
                  <span className={`${styles.seatStatusCount} ${
                    availability.availableSeats > 0 ? styles.availableSeats : styles.noSeats
                  }`}>
                    {availability.availableSeats} seats
                  </span>
                </div>
                <div className={styles.seatProgressBarContainer}>
                  <div 
                    className={`${styles.seatProgressIndicator} ${
                      availability.availableSeats > 0 ? styles.progressGreen : styles.progressRed
                    }`}
                    style={{ 
                      width: `${(availability.availableSeats / train.total_seats) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className={styles.bookingActions}>
                <button
                  onClick={handleBooking}
                  disabled={bookingInProgress || availability.availableSeats === 0}
                  className={`${styles.bookButton} ${
                    availability.availableSeats === 0 ? styles.disabledButton : ''
                  }`}
                >
                  {bookingInProgress ? (
                    <>
                      <div className={styles.buttonSpinner}></div>
                      Processing...
                    </>
                  ) : availability.availableSeats === 0 ? (
                    'No Seats Available'
                  ) : (
                    <>
                      <FaRupeeSign className={styles.buttonIcon} />
                      Confirm Booking
                    </>
                  )}
                </button>

                <p className={styles.bookingTerms}>
                  By proceeding, you agree to our Terms & Conditions and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;