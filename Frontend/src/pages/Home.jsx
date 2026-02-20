import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch, FaTrain, FaClock, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaRoute } from 'react-icons/fa';
import axios from 'axios';
import styles from './Home.module.css';

const Home = () => {
    const navigate = useNavigate();
    const [searchData, setSearchData] = useState({
        source: '',
        destination: '',
        date: new Date()
    });
    const [stations, setStations] = useState([]);
    const [popularTrains, setPopularTrains] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStations();
        fetchPopularTrains();
    }, []);

    const fetchStations = async () => {
        try {
            const response = await axios.get('/api/stations');
            setStations(response.data.stations);
        } catch (error) {
            console.error('Failed to fetch stations:', error);
        }
    };

    const fetchPopularTrains = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/trains/search?limit=4');
            setPopularTrains(response.data.trains);
        } catch (error) {
            console.error('Failed to fetch popular trains:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams({
            source: searchData.source,
            destination: searchData.destination,
            date: searchData.date.toISOString().split('T')[0]
        });
        navigate(`/search?${params.toString()}`);
    };

    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(hours, minutes);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className={styles.home}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContainer}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>
                            Book Railway Tickets <span className={styles.heroTitleHighlight}>Effortlessly</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Experience seamless ticket booking with real-time availability, secure payments, and instant confirmations.
                        </p>

                        {/* Search Box */}
                        <div className={styles.searchBox}>
                            <form onSubmit={handleSearch} className={styles.searchForm}>
                                <div className={styles.searchGrid}>
                                    <div className={styles.searchField}>
                                        <label className={styles.searchLabel}>
                                            <FaMapMarkerAlt className={styles.searchLabelIcon} />
                                            From Station
                                        </label>
                                        <input
                                            type="text"
                                            list="sourceStations"
                                            value={searchData.source}
                                            onChange={(e) => setSearchData({ ...searchData, source: e.target.value })}
                                            placeholder="Enter source station"
                                            className={styles.searchInput}
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

                                    <div className={styles.searchField}>
                                        <label className={styles.searchLabel}>
                                            <FaMapMarkerAlt className={styles.searchLabelIcon} />
                                            To Station
                                        </label>
                                        <input
                                            type="text"
                                            list="destStations"
                                            value={searchData.destination}
                                            onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
                                            placeholder="Enter destination station"
                                            className={styles.searchInput}
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

                                    <div className={styles.searchField}>
                                        <label className={styles.searchLabel}>
                                            <FaCalendarAlt className={styles.searchLabelIcon} />
                                            Journey Date
                                        </label>
                                        <DatePicker
                                            selected={searchData.date}
                                            onChange={(date) => setSearchData({ ...searchData, date })}
                                            minDate={new Date()}
                                            className={styles.datePicker}
                                            dateFormat="dd/MM/yyyy"
                                        />
                                    </div>
                                </div>

                                <button type="submit" className={styles.searchButton}>
                                    <FaSearch className={styles.searchButtonIcon} />
                                    <span>Search Trains</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Why Choose RailExpress?</h2>

                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <FaClock />
                            </div>
                            <h3 className={styles.featureTitle}>Real-time Availability</h3>
                            <p className={styles.featureDescription}>
                                Get instant seat availability with our queue-based allocation system
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <FaRoute />
                            </div>
                            <h3 className={styles.featureTitle}>Smart Routing</h3>
                            <p className={styles.featureDescription}>
                                Find optimal routes using advanced graph algorithms
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <FaUsers />
                            </div>
                            <h3 className={styles.featureTitle}>Instant Confirmation</h3>
                            <p className={styles.featureDescription}>
                                Quick booking confirmation with secure payment processing
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Trains */}
            <section className={styles.popularTrains}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Popular Trains</h2>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Loading popular trains...</p>
                        </div>
                    ) : (
                        <div className={styles.trainsGrid}>
                            {popularTrains.map((train) => (
                                <div key={train.id} className={styles.trainCard}>
                                    <div className={styles.trainCardHeader}>
                                        <span className={styles.trainNumber}>{train.train_number}</span>
                                        <span className={styles.trainSeats}>
                                            {train.available_seats} seats left
                                        </span>
                                    </div>
                                    <h3 className={styles.trainName}>{train.train_name}</h3>
                                    <div className={styles.trainDetails}>
                                        <div className={styles.trainDetail}>
                                            <span className={styles.detailLabel}>From:</span>
                                            <span className={styles.detailValue}>{train.source_station}</span>
                                        </div>
                                        <div className={styles.trainDetail}>
                                            <span className={styles.detailLabel}>To:</span>
                                            <span className={styles.detailValue}>{train.destination_station}</span>
                                        </div>
                                        <div className={styles.trainDetail}>
                                            <span className={styles.detailLabel}>Departure:</span>
                                            <span className={styles.detailValue}>{formatTime(train.departure_time)}</span>
                                        </div>
                                    </div>
                                    <div className={styles.trainCardFooter}>
                                        <span className={styles.trainFare}>₹{train.fare}</span>
                                        <Link
                                            to={`/train/${train.id}`}
                                            className={styles.viewDetailsButton}
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;