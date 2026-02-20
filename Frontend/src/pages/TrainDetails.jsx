import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { FaTrain, FaClock, FaMapMarkerAlt, FaUsers, FaArrowRight, FaCalendarAlt, FaRoute, FaTicketAlt } from 'react-icons/fa';
import axios from 'axios';
import styles from './TrainDetails.module.css';

const TrainDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState(null);

  // Get date from URL or use today's date
  const getJourneyDate = () => {
    const dateParam = searchParams.get('date');
    
    // Validate date parameter
    if (!dateParam || dateParam === 'null' || dateParam === 'undefined') {
      return new Date().toISOString().split('T')[0];
    }
    
    // Try to parse the date
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    return dateParam;
  };

  const journeyDate = getJourneyDate();

  useEffect(() => {
    fetchTrainDetails();
  }, [id]);

  useEffect(() => {
    if (train) {
      fetchAvailability();
    }
  }, [id, journeyDate, train]);

  const fetchTrainDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/api/trains/${id}`);
      
      if (response.data.success) {
        setTrain(response.data.train);
      } else {
        setTrain(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch train details:', error);
      setError(error.response?.data?.message || 'Failed to load train details');
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(`/api/trains/${id}/availability`, {
        params: { date: journeyDate }
      });
      
      // Check if response has success property
      if (response.data.success) {
        setAvailability(response.data);
      } else {
        // Fallback: assume the response itself is the availability data
        setAvailability(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      // Don't set error state here, just log it
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch (error) {
      return time; // Return original if formatting fails
    }
  };

  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return 0;

    try {
      // Extract just hours and minutes (ignore seconds)
      const depTime = departure.includes(':') ? departure : `${departure}:00`;
      const arrTime = arrival.includes(':') ? arrival : `${arrival}:00`;
      
      const [depH, depM] = depTime.split(':').map(Number);
      const [arrH, arrM] = arrTime.split(':').map(Number);
      
      let duration = (arrH * 60 + arrM) - (depH * 60 + depM);
      if (duration < 0) duration += 24 * 60;
      
      return duration;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 0;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return '--h --m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleBookNow = () => {
    navigate(`/book/${id}?date=${journeyDate}`);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    navigate(`/train/${id}?date=${newDate}`, { replace: true });
  };

  if (loading && !train) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading train details...</p>
      </div>
    );
  }

  if (error || !train) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3 className={styles.errorTitle}>Error Loading Train Details</h3>
        <p className={styles.errorMessage}>{error || 'Train not found'}</p>
        <Link to="/search" className={styles.backButton}>
          Back to Search
        </Link>
      </div>
    );
  }

  // Get data from train object (based on your API response)
  const journeyDuration = calculateDuration(train.departure_time, train.arrival_time);
  
  // Handle availability data structure
  let availableSeats, totalSeats;
  if (availability) {
    if (availability.success) {
      // If availability has success property
      availableSeats = availability.availableSeats || availability.train?.available_seats || 0;
      totalSeats = availability.totalSeats || availability.train?.total_seats || train.total_seats;
    } else {
      // If availability is the direct data
      availableSeats = availability.availableSeats || availability.available_seats || 0;
      totalSeats = availability.totalSeats || availability.total_seats || train.total_seats;
    }
  } else {
    // Use train's default data
    availableSeats = train.available_seats || 0;
    totalSeats = train.total_seats || 0;
  }

  // Format fare as number
  const fare = parseFloat(train.fare) || 0;
  const routeDetails = train.route_details || [];

  return (
    <div className={styles.trainDetails}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.trainHeader}>
            <div className={styles.trainInfo}>
              <FaTrain className={styles.trainIcon} />
              <div>
                <h1 className={styles.trainName}>{train.train_name}</h1>
                <p className={styles.trainNumber}>{train.train_number}</p>
              </div>
            </div>
            <div className={styles.trainFare}>
              <div className={styles.fareAmount}>₹{fare.toFixed(2)}</div>
              <div className={styles.fareLabel}>per passenger</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.contentGrid}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Journey Details */}
            <div className={styles.journeyCard}>
              <h2 className={styles.sectionTitle}>Journey Details</h2>
              
              {/* Date Selector */}
              <div className={styles.dateSelector}>
                <label className={styles.dateLabel}>
                  <FaCalendarAlt className={styles.dateLabelIcon} />
                  Select Journey Date
                </label>
                <input
                  type="date"
                  value={journeyDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={styles.dateInput}
                />
              </div>
              
              <div className={styles.journeyTimeline}>
                <div className={styles.timelineStation}>
                  <div className={styles.stationDot}></div>
                  <div className={styles.stationInfo}>
                    <div className={styles.stationName}>{train.source_station}</div>
                    <div className={styles.stationTime}>{formatTime(train.departure_time)}</div>
                    <div className={styles.stationDate}>
                      <FaCalendarAlt className={styles.calendarIcon} />
                      {new Date(journeyDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className={styles.timelineDuration}>
                  <FaArrowRight className={styles.durationIcon} />
                  <div className={styles.durationText}>
                    <FaClock className={styles.clockIcon} />
                    {formatDuration(journeyDuration)}
                  </div>
                </div>

                <div className={styles.timelineStation}>
                  <div className={styles.stationDot}></div>
                  <div className={styles.stationInfo}>
                    <div className={styles.stationName}>{train.destination_station}</div>
                    <div className={styles.stationTime}>{formatTime(train.arrival_time)}</div>
                    <div className={styles.stationDate}>
                      <FaCalendarAlt className={styles.calendarIcon} />
                      {new Date(journeyDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.journeyStats}>
                <div className={styles.statItem}>
                  <FaClock className={styles.statIcon} />
                  <div>
                    <div className={styles.statLabel}>Duration</div>
                    <div className={styles.statValue}>{formatDuration(journeyDuration)}</div>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <FaRoute className={styles.statIcon} />
                  <div>
                    <div className={styles.statLabel}>Distance</div>
                    <div className={styles.statValue}>Approx. {Math.round(journeyDuration * 1.5)} km</div>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <FaUsers className={styles.statIcon} />
                  <div>
                    <div className={styles.statLabel}>Capacity</div>
                    <div className={styles.statValue}>{totalSeats} seats</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Information */}
            {routeDetails.length > 0 && (
              <div className={styles.routeCard}>
                <h2 className={styles.sectionTitle}>Route Information</h2>
                <div className={styles.routeList}>
                  {routeDetails.map((station, index) => (
                    <div key={station.id || index} className={styles.routeItem}>
                      <div className={styles.routeSequence}>{station.sequence_number || index + 1}</div>
                      <div className={styles.routeStation}>
                        <div className={styles.stationCode}>{station.station_code}</div>
                        <div className={styles.stationName}>{station.station_name}</div>
                        <div className={styles.cityName}>{station.city}</div>
                      </div>
                      <div className={styles.routeTimes}>
                        {station.arrival_time && (
                          <div className={styles.routeTime}>
                            <span className={styles.timeLabel}>Arr:</span>
                            {formatTime(station.arrival_time)}
                          </div>
                        )}
                        {station.departure_time && (
                          <div className={styles.routeTime}>
                            <span className={styles.timeLabel}>Dep:</span>
                            {formatTime(station.departure_time)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Availability Card */}
            <div className={styles.availabilityCard}>
              <h2 className={styles.sectionTitle}>Seat Availability</h2>
              
              <div className={styles.availabilityInfo}>
                <div className={styles.availabilityItem}>
                  <div className={styles.availabilityLabel}>Journey Date</div>
                  <div className={styles.availabilityValue}>
                    {new Date(journeyDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                
                <div className={styles.availabilityItem}>
                  <div className={styles.availabilityLabel}>Available Seats</div>
                  <div className={`${styles.seatCount} ${
                    availableSeats > 0 ? styles.seatsAvailable : styles.seatsUnavailable
                  }`}>
                    {availableSeats}
                  </div>
                </div>

                <div className={styles.seatProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={`${styles.progressFill} ${
                        availableSeats > 0 ? styles.progressGreen : styles.progressRed
                      }`}
                      style={{ 
                        width: `${Math.min(100, (availableSeats / Math.max(1, totalSeats)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className={styles.progressLabels}>
                    <span>0</span>
                    <span>{totalSeats} seats</span>
                  </div>
                </div>
              </div>

              <div className={styles.bookingSection}>
                <div className={styles.fareBreakdown}>
                  <div className={styles.fareItem}>
                    <span className={styles.fareLabel}>Base Fare</span>
                    <span className={styles.fareValue}>₹{fare.toFixed(2)}</span>
                  </div>
                  <div className={styles.fareItem}>
                    <span className={styles.fareLabel}>Service Charges</span>
                    <span className={styles.fareValue}>₹20</span>
                  </div>
                  <div className={styles.fareItem}>
                    <span className={styles.fareLabel}>GST (5%)</span>
                    <span className={styles.fareValue}>₹{(fare * 0.05).toFixed(2)}</span>
                  </div>
                  <div className={styles.fareTotal}>
                    <span className={styles.totalLabel}>Total Fare</span>
                    <span className={styles.totalValue}>
                      ₹{(fare + 20 + (fare * 0.05)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBookNow}
                  disabled={availableSeats === 0}
                  className={`${styles.bookButton} ${
                    availableSeats === 0 ? styles.disabledButton : ''
                  }`}
                >
                  <FaTicketAlt className={styles.bookIcon} />
                  Book Now
                </button>

                <p className={styles.bookingNote}>
                  {availableSeats === 0 
                    ? 'No seats available for selected date'
                    : 'Click Book Now to proceed with booking'}
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.quickLinksCard}>
              <h3 className={styles.quickLinksTitle}>Quick Actions</h3>
              <div className={styles.quickLinks}>
                <Link to="/search" className={styles.quickLink}>
                  <FaMapMarkerAlt className={styles.quickLinkIcon} />
                  Search More Trains
                </Link>
                <Link to="/my-bookings" className={styles.quickLink}>
                  <FaTicketAlt className={styles.quickLinkIcon} />
                  View My Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainDetails;