import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaTrain, FaClock, FaUsers, FaArrowRight, FaFilter, 
  FaSortAmountDown, FaSortAmountUp, FaSearch, FaMapMarkerAlt, FaCalendarAlt 
} from 'react-icons/fa';
import axios from 'axios';
import styles from './SearchTrains.module.css';

const SearchTrains = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stations, setStations] = useState([]);
  const [showSearchForm, setShowSearchForm] = useState(false);
  
  // Search form state
  const [searchForm, setSearchForm] = useState({
    source: '',
    destination: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [filters, setFilters] = useState({
    sortBy: 'departure',
    sortOrder: 'asc',
    minFare: '',
    maxFare: ''
  });

  const source = searchParams.get('source');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');

  useEffect(() => {
    // Check if search parameters are provided
    if (!source || !destination || !date) {
      setShowSearchForm(true);
      setLoading(false);
    } else {
      fetchTrains();
    }
    
    // Fetch stations for autocomplete
    fetchStations();
  }, [source, destination, date]);

  const fetchStations = async () => {
    try {
      const response = await axios.get('/api/stations');
      if (response.data.success) {
        setStations(response.data.stations || []);
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
    }
  };

  const fetchTrains = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/trains/search', {
        params: { source, destination, date }
      });
      
      // Handle different response structures
      let trainsData = [];
      if (response.data.success) {
        trainsData = response.data.trains || [];
      } else if (Array.isArray(response.data)) {
        trainsData = response.data;
      }
      
      setTrains(trainsData);
    } catch (error) {
      console.error('Failed to fetch trains:', error);
      setError('Failed to fetch trains. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!searchForm.source.trim() || !searchForm.destination.trim()) {
      alert('Please enter source and destination stations');
      return;
    }
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    params.set('source', searchForm.source);
    params.set('destination', searchForm.destination);
    params.set('date', searchForm.date);
    
    navigate(`/search?${params.toString()}`);
    setShowSearchForm(false);
  };

  const handleSearchFormChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return 0;
    
    const [depH, depM] = departure.split(':').map(Number);
    const [arrH, arrM] = arrival.split(':').map(Number);
    let duration = (arrH * 60 + arrM) - (depH * 60 + depM);
    if (duration < 0) duration += 24 * 60; // Handle overnight trains
    return duration;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '--h --m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
      return time;
    }
  };

  // Filter and sort trains
  const filteredTrains = trains.filter(train => {
    if (filters.minFare && parseFloat(train.fare) < parseFloat(filters.minFare)) return false;
    if (filters.maxFare && parseFloat(train.fare) > parseFloat(filters.maxFare)) return false;
    return true;
  });

  const sortedTrains = [...filteredTrains].sort((a, b) => {
    let compareA, compareB;

    switch (filters.sortBy) {
      case 'departure':
        compareA = a.departure_time;
        compareB = b.departure_time;
        break;
      case 'fare':
        compareA = parseFloat(a.fare);
        compareB = parseFloat(b.fare);
        break;
      case 'duration':
        compareA = calculateDuration(a.departure_time, a.arrival_time);
        compareB = calculateDuration(b.departure_time, b.arrival_time);
        break;
      case 'arrival':
        compareA = a.arrival_time;
        compareB = b.arrival_time;
        break;
      default:
        return 0;
    }

    if (filters.sortOrder === 'asc') {
      return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
    } else {
      return compareA > compareB ? -1 : compareA < compareB ? 1 : 0;
    }
  });

  const handleSortToggle = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      sortBy: 'departure',
      sortOrder: 'asc',
      minFare: '',
      maxFare: ''
    });
  };

  const handleNewSearch = () => {
    setShowSearchForm(true);
    setSearchForm({
      source: '',
      destination: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Show search form if no parameters or explicitly requested
  if (showSearchForm) {
    return (
      <div className={styles.searchTrains}>
        <div className={styles.container}>
          <div className={styles.searchFormCard}>
            <div className={styles.searchFormHeader}>
              <h1 className={styles.searchFormTitle}>
                <FaSearch className={styles.searchFormIcon} />
                Search Trains
              </h1>
              <p className={styles.searchFormSubtitle}>
                Find available trains between stations
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <div className={styles.searchFormGrid}>
                <div className={styles.searchFormGroup}>
                  <label className={styles.searchFormLabel}>
                    <FaMapMarkerAlt className={styles.searchFormLabelIcon} />
                    From Station
                  </label>
                  <input
                    type="text"
                    name="source"
                    value={searchForm.source}
                    onChange={handleSearchFormChange}
                    list="sourceStations"
                    className={styles.searchFormInput}
                    placeholder="Enter source station"
                    required
                  />
                  <datalist id="sourceStations">
                    {stations.map((station) => (
                      <option key={station.id} value={station.station_code}>
                        {station.station_name} ({station.station_code})
                      </option>
                    ))}
                  </datalist>
                </div>

                <div className={styles.searchFormGroup}>
                  <label className={styles.searchFormLabel}>
                    <FaMapMarkerAlt className={styles.searchFormLabelIcon} />
                    To Station
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={searchForm.destination}
                    onChange={handleSearchFormChange}
                    list="destStations"
                    className={styles.searchFormInput}
                    placeholder="Enter destination station"
                    required
                  />
                  <datalist id="destStations">
                    {stations.map((station) => (
                      <option key={station.id} value={station.station_code}>
                        {station.station_name} ({station.station_code})
                      </option>
                    ))}
                  </datalist>
                </div>

                <div className={styles.searchFormGroup}>
                  <label className={styles.searchFormLabel}>
                    <FaCalendarAlt className={styles.searchFormLabelIcon} />
                    Journey Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={searchForm.date}
                    onChange={handleSearchFormChange}
                    className={styles.searchFormInput}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className={styles.searchFormActions}>
                <button type="submit" className={styles.searchSubmitButton}>
                  <FaSearch className={styles.searchSubmitIcon} />
                  Search Trains
                </button>
                
                {source && destination && date && (
                  <button 
                    type="button" 
                    onClick={() => setShowSearchForm(false)}
                    className={styles.cancelSearchButton}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Popular Search Suggestions */}
            <div className={styles.popularSearches}>
              <h3 className={styles.popularSearchesTitle}>Popular Routes</h3>
              <div className={styles.popularSearchItems}>
                <button 
                  className={styles.popularSearchItem}
                  onClick={() => {
                    setSearchForm({
                      source: 'NDLS',
                      destination: 'MMCT',
                      date: new Date().toISOString().split('T')[0]
                    });
                  }}
                >
                  Delhi → Mumbai
                </button>
                <button 
                  className={styles.popularSearchItem}
                  onClick={() => {
                    setSearchForm({
                      source: 'MMCT',
                      destination: 'NDLS',
                      date: new Date().toISOString().split('T')[0]
                    });
                  }}
                >
                  Mumbai → Delhi
                </button>
                <button 
                  className={styles.popularSearchItem}
                  onClick={() => {
                    setSearchForm({
                      source: 'SBC',
                      destination: 'MAS',
                      date: new Date().toISOString().split('T')[0]
                    });
                  }}
                >
                  Bangalore → Chennai
                </button>
                <button 
                  className={styles.popularSearchItem}
                  onClick={() => {
                    setSearchForm({
                      source: 'HWH',
                      destination: 'NDLS',
                      date: new Date().toISOString().split('T')[0]
                    });
                  }}
                >
                  Kolkata → Delhi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Searching for trains...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3 className={styles.errorTitle}>Error Loading Trains</h3>
        <p className={styles.errorMessage}>{error}</p>
        <div className={styles.errorActions}>
          <button onClick={fetchTrains} className={styles.retryButton}>
            Try Again
          </button>
          <button onClick={handleNewSearch} className={styles.newSearchButton}>
            New Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.searchTrains}>
      <div className={styles.container}>
        {/* Search Header with New Search Button */}
        <div className={styles.searchHeader}>
          <div className={styles.searchHeaderTop}>
            <button onClick={handleNewSearch} className={styles.newSearchHeaderButton}>
              <FaSearch className={styles.newSearchIcon} />
              New Search
            </button>
            <div className={styles.searchResultCount}>
              {sortedTrains.length} trains found
            </div>
          </div>
          
          <div className={styles.searchHeaderContent}>
            <h1 className={styles.searchTitle}>
              Trains from <span className={styles.highlight}>{source}</span> to{' '}
              <span className={styles.highlight}>{destination}</span>
            </h1>
            <p className={styles.searchSubtitle}>
              Journey Date: {new Date(date).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersCard}>
          <div className={styles.filtersHeader}>
            <div className={styles.filtersTitle}>
              <FaFilter className={styles.filtersTitleIcon} />
              <span>Filters & Sorting</span>
            </div>
            <div className={styles.filtersHeaderActions}>
              <button onClick={handleNewSearch} className={styles.changeSearchButton}>
                Change Search
              </button>
              <button onClick={handleClearFilters} className={styles.clearFiltersButton}>
                Clear All Filters
              </button>
            </div>
          </div>

          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className={styles.filterSelect}
              >
                <option value="departure">Departure Time</option>
                <option value="arrival">Arrival Time</option>
                <option value="fare">Fare</option>
                <option value="duration">Journey Duration</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sort Order</label>
              <button onClick={handleSortToggle} className={styles.sortToggleButton}>
                {filters.sortOrder === 'asc' ? (
                  <>
                    <FaSortAmountUp className={styles.sortIcon} />
                    <span>Ascending</span>
                  </>
                ) : (
                  <>
                    <FaSortAmountDown className={styles.sortIcon} />
                    <span>Descending</span>
                  </>
                )}
              </button>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Min Fare (₹)</label>
              <input
                type="number"
                value={filters.minFare}
                onChange={(e) => setFilters({...filters, minFare: e.target.value})}
                placeholder="Min"
                className={styles.filterInput}
                min="0"
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Max Fare (₹)</label>
              <input
                type="number"
                value={filters.maxFare}
                onChange={(e) => setFilters({...filters, maxFare: e.target.value})}
                placeholder="Max"
                className={styles.filterInput}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Trains List */}
        <div className={styles.trainsList}>
          {sortedTrains.length === 0 ? (
            <div className={styles.noTrains}>
              <FaTrain className={styles.noTrainsIcon} />
              <h3 className={styles.noTrainsTitle}>No trains found</h3>
              <p className={styles.noTrainsMessage}>
                Try adjusting your search criteria or{' '}
                <button onClick={handleNewSearch} className={styles.noTrainsSearchLink}>
                  search for different stations/date
                </button>
              </p>
            </div>
          ) : (
            sortedTrains.map((train) => (
              <div key={train.id} className={styles.trainCard}>
                <div className={styles.trainCardHeader}>
                  <div className={styles.trainInfo}>
                    <div className={styles.trainTitle}>
                      <FaTrain className={styles.trainIcon} />
                      <h3 className={styles.trainName}>{train.train_name}</h3>
                      <span className={styles.trainNumber}>{train.train_number}</span>
                    </div>
                    <p className={styles.trainRoute}>
                      {train.source_station} → {train.destination_station}
                    </p>
                  </div>
                  <div className={styles.trainFare}>
                    <span className={styles.fareAmount}>₹{parseFloat(train.fare).toFixed(2)}</span>
                    <span className={styles.fareLabel}>per passenger</span>
                  </div>
                </div>

                <div className={styles.trainDetails}>
                  <div className={styles.detailCard}>
                    <div className={styles.detailLabel}>Departure</div>
                    <div className={styles.detailValue}>{formatTime(train.departure_time)}</div>
                    <div className={styles.detailStation}>{train.source_station}</div>
                  </div>

                  <div className={styles.durationCard}>
                    <FaArrowRight className={styles.arrowIcon} />
                    <div className={styles.durationText}>
                      {formatDuration(calculateDuration(train.departure_time, train.arrival_time))}
                    </div>
                  </div>

                  <div className={styles.detailCard}>
                    <div className={styles.detailLabel}>Arrival</div>
                    <div className={styles.detailValue}>{formatTime(train.arrival_time)}</div>
                    <div className={styles.detailStation}>{train.destination_station}</div>
                  </div>

                  <div className={styles.seatsCard}>
                    <div className={styles.seatsInfo}>
                      <FaUsers className={styles.seatsIcon} />
                      <span>{train.available_seats || 0} seats available</span>
                    </div>
                    <div className={styles.totalSeats}>
                      Total seats: {train.total_seats || 0}
                    </div>
                  </div>
                </div>

                <div className={styles.trainCardFooter}>
                  <div className={styles.trainStats}>
                    <div className={styles.stat}>
                      <FaClock className={styles.statIcon} />
                      <span>{formatDuration(calculateDuration(train.departure_time, train.arrival_time))}</span>
                    </div>
                  </div>
                  <div className={styles.trainActions}>
                    <Link
                      to={`/train/${train.id}?date=${date}`}
                      className={styles.viewDetailsButton}
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/book/${train.id}?date=${date}`}
                      className={styles.bookButton}
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchTrains;