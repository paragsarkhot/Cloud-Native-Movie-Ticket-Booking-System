import React, { useState, useEffect } from 'react';
import './App.css';
import { api } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' | 'theatres' | 'bookings' | 'analytics'
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [allShows, setAllShows] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [popularMovies, setPopularMovies] = useState([]);

  // Auth State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Booking Modal State
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieShows, setMovieShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Reviews Modal State (review-service)
  const [reviewMovie, setReviewMovie] = useState(null);
  const [movieReviews, setMovieReviews] = useState([]);
  const [movieAvgRating, setMovieAvgRating] = useState(null);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Notifications Modal State (notification-service)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    loadMovies();
    loadTheatresAndShows();
    if (user) {
      loadUserData(user.id);
    }
  }, [user]);

  const loadUserData = async (userId) => {
    loadUserBookings(userId);
    loadUserPayments(userId);
    loadNotifications(userId);
  };

  const loadMovies = async () => {
    try {
      const data = await api.getMovies();
      if (!data || data.length === 0) {
        setMovies([
          { id: 1, title: 'Inception', genre: 'Sci-Fi', language: 'English', duration: 148, rating: 8.8, description: 'A thief who steals corporate secrets through dream-sharing technology.', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop' },
          { id: 2, title: 'Interstellar', genre: 'Sci-Fi', language: 'English', duration: 169, rating: 8.7, description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop' },
        ]);
      } else {
        setMovies(data);
      }
    } catch (e) {
      console.warn('API Gateway offline or no movies yet:', e);
    }
  };

  const loadTheatresAndShows = async () => {
    try {
      const [tList, sList] = await Promise.all([api.getTheatres(), api.getShows()]);
      setTheatres(tList || []);
      setAllShows(sList || []);
    } catch (e) {
      console.warn('Error loading theatres and shows:', e);
    }
  };

  const loadUserBookings = async (userId) => {
    try {
      const data = await api.getUserBookings(userId);
      setUserBookings(data || []);
    } catch (e) {
      console.warn('User bookings load:', e);
    }
  };

  const loadUserPayments = async (userId) => {
    try {
      const data = await api.getPaymentsByUser(userId);
      setUserPayments(data || []);
    } catch (e) {
      console.warn('User payments load:', e);
    }
  };

  const loadNotifications = async (userId) => {
    try {
      const data = await api.getNotifications(userId);
      setNotifications(data || []);
    } catch (e) {
      console.warn('Notifications load:', e);
    }
  };

  const loadAnalytics = async () => {
    try {
      const stats = await api.getAnalyticsStats();
      const popular = await api.getPopularMovies();
      setAnalytics(stats);
      setPopularMovies(popular);
    } catch (e) {
      console.warn('Analytics load error:', e);
      setAnalytics({ totalEvents: 68, totalUsers: 18, totalBookings: 26, totalCancellations: 2 });
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      let data;
      if (authMode === 'login') {
        data = await api.login(authForm.email, authForm.password);
      } else {
        data = await api.register(authForm.name, authForm.email, authForm.password);
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setShowAuthModal(false);
      setAuthForm({ name: '', email: '', password: '' });
      loadUserData(data.id);
    } catch (err) {
      setAuthError(err.message || 'Authentication error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUserBookings([]);
    setUserPayments([]);
    setNotifications([]);
  };

  const fetchBookedSeats = async (showId) => {
    try {
      const seats = await api.getBookedSeats(showId);
      setBookedSeats(Array.isArray(seats) ? seats : []);
    } catch (e) {
      setBookedSeats([]);
    }
  };

  // Start booking flow from a Movie card
  const startBookingFlow = async (movie) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedMovie(movie);
    setSelectedSeats([]);
    setBookedSeats([]);
    setBookingSuccess(null);
    setBookingError('');

    try {
      const showList = await api.getShowsByMovie(movie.id);
      if (showList && showList.length > 0) {
        setMovieShows(showList);
        setSelectedShow(showList[0]);
        fetchBookedSeats(showList[0].id);
      } else {
        const fallbackShow = {
          id: 1,
          movieId: movie.id,
          theatreId: 1,
          screenName: 'Screen 1 - IMAX',
          showDate: '2026-10-28',
          showTime: '19:00:00',
          ticketPrice: 350.0,
        };
        setMovieShows([fallbackShow]);
        setSelectedShow(fallbackShow);
        fetchBookedSeats(1);
      }
    } catch (e) {
      console.warn('Shows load error:', e);
    }
  };

  // Start booking flow directly from a Theatre show pill
  const startBookingFromShow = (show) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const movie = movies.find(m => m.id === show.movieId) || {
      id: show.movieId,
      title: 'Movie #' + show.movieId,
    };
    setSelectedMovie(movie);
    setMovieShows([show]);
    setSelectedShow(show);
    setSelectedSeats([]);
    setBookedSeats([]);
    setBookingSuccess(null);
    setBookingError('');
    fetchBookedSeats(show.id);
  };

  const handleShowSelect = (show) => {
    setSelectedShow(show);
    setSelectedSeats([]);
    fetchBookedSeats(show.id);
  };

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    );
  };

  const confirmBookingAndPay = async () => {
    if (!selectedSeats || selectedSeats.length === 0) {
      setBookingError('Please select at least one seat to proceed.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      // Step 1: Create booking in booking-service (supports multiple seats)
      const bookingRes = await api.createBooking(user.id, selectedShow.id, selectedSeats);
      const totalAmount = (selectedShow?.ticketPrice || 350) * selectedSeats.length;

      // Step 2: Process payment in payment-service
      const paymentRes = await api.processPayment(
        bookingRes.bookingId || bookingRes.id,
        user.id,
        bookingRes.totalAmount || totalAmount,
        paymentMethod
      );

      setBookingSuccess({
        booking: bookingRes,
        payment: paymentRes,
        seats: selectedSeats,
      });

      // Refresh booked seats
      fetchBookedSeats(selectedShow.id);
      setSelectedSeats([]);

      // Refresh bookings, payments and notifications
      loadUserData(user.id);
    } catch (err) {
      setBookingError(err.message || 'Booking transaction failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will refund your payment.')) return;
    try {
      await api.cancelBooking(bookingId);
      // Attempt refund if associated payment exists
      const payment = userPayments.find(p => p.bookingId === bookingId && p.status === 'COMPLETED');
      if (payment) {
        try {
          await api.refundPayment(payment.id);
        } catch (e) {
          console.warn('Payment refund trigger:', e);
        }
      }
      loadUserData(user.id);
      alert('Booking cancelled and refund initiated successfully!');
    } catch (err) {
      alert('Failed to cancel: ' + err.message);
    }
  };

  // Open Reviews Modal for a Movie (review-service)
  const openReviewsModal = async (movie) => {
    setReviewMovie(movie);
    setReviewError('');
    setNewReviewText('');
    setNewRating(5);
    try {
      const [reviews, ratingData] = await Promise.all([
        api.getReviewsByMovie(movie.id),
        api.getAverageRating(movie.id),
      ]);
      setMovieReviews(reviews || []);
      setMovieAvgRating(ratingData?.averageRating || movie.rating || 8.5);
    } catch (e) {
      console.warn('Reviews load error:', e);
      setMovieReviews([]);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!newReviewText.trim()) {
      setReviewError('Please enter review comments.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    try {
      await api.addReview(user.id, reviewMovie.id, newRating, newReviewText);
      setNewReviewText('');
      // Reload reviews
      const [updatedReviews, ratingData] = await Promise.all([
        api.getReviewsByMovie(reviewMovie.id),
        api.getAverageRating(reviewMovie.id),
      ]);
      setMovieReviews(updatedReviews || []);
      setMovieAvgRating(ratingData?.averageRating || null);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      loadNotifications(user.id);
    } catch (e) {
      console.warn('Mark read error:', e);
    }
  };

  const seatRows = ['A', 'B', 'C', 'D'];
  const seatCols = [1, 2, 3, 4, 5, 6, 7, 8];

  const filteredMovies = movies.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = genreFilter ? m.genre.toLowerCase() === genreFilter.toLowerCase() : true;
    return matchesSearch && matchesGenre;
  });

  const cities = Array.from(new Set(theatres.map(t => t.city).filter(Boolean)));
  const filteredTheatres = theatres.filter(t => {
    return cityFilter ? t.city.toLowerCase() === cityFilter.toLowerCase() : true;
  });

  const unreadNotifications = notifications.filter(n => n.status !== 'READ');

  return (
    <div className="app">
      {/* Navbar */}
      <header className="navbar">
        <div className="brand" onClick={() => setActiveTab('movies')}>
          🎬 <span>CinePass</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            Movies
          </button>
          <button
            className={`nav-btn ${activeTab === 'theatres' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('theatres');
              loadTheatresAndShows();
            }}
          >
            Theatres & Shows
          </button>
          <button
            className={`nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => {
              if (!user) setShowAuthModal(true);
              else {
                setActiveTab('bookings');
                loadUserData(user.id);
              }
            }}
          >
            My Bookings & Payments
          </button>
          <button
            className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('analytics');
              loadAnalytics();
            }}
          >
            Analytics & Admin
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Notification Bell */}
              <button
                className="notification-bell-btn"
                title="Notifications"
                onClick={() => {
                  setShowNotificationsModal(true);
                  loadNotifications(user.id);
                }}
              >
                🔔
                {unreadNotifications.length > 0 && (
                  <span className="notification-badge">{unreadNotifications.length}</span>
                )}
              </button>

              <div className="user-badge">
                <span>👤 {user.name}</span>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          ) : (
            <button className="auth-btn" onClick={() => setShowAuthModal(true)}>
              Login / Sign Up
            </button>
          )}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="container">
        {/* MOVIES TAB */}
        {activeTab === 'movies' && (
          <div>
            <section className="hero">
              <h1>Experience Cinema Like Never Before</h1>
              <p>Book tickets in real-time across top theatres with instant payment processing, live seat reservation, and cloud microservices.</p>

              <div className="filter-bar">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Search movies by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="filter-select"
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                >
                  <option value="">All Genres</option>
                  <option value="Action">Action</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Drama">Drama</option>
                  <option value="Comedy">Comedy</option>
                </select>
              </div>
            </section>

            <div className="movies-grid">
              {filteredMovies.map(movie => (
                <div key={movie.id} className="movie-card">
                  <div className="poster-wrapper">
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt={movie.title} className="poster-img" />
                    ) : (
                      <div className="poster-placeholder">🎥</div>
                    )}
                    <span className="rating-badge">★ {movie.rating || '8.5'}</span>
                  </div>
                  <div className="movie-info">
                    <h3 className="movie-title">{movie.title}</h3>
                    <p className="movie-meta">{movie.genre} • {movie.duration || 135} mins • {movie.language || 'English'}</p>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem', flex: 1 }}>
                      {movie.description?.slice(0, 95)}...
                    </p>
                    <div className="card-actions">
                      <button className="book-btn" onClick={() => startBookingFlow(movie)}>
                        Book Tickets
                      </button>
                      <button className="review-btn" onClick={() => openReviewsModal(movie)}>
                        ⭐ Reviews
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* THEATRES TAB (theatre-service) */}
        {activeTab === 'theatres' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2>🏛️ Theatres & Show Schedules</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  Browse partner cinemas powered by <strong>Theatre Service (Port 8083)</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Filter City:</span>
                <select
                  className="filter-select"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredTheatres.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                No theatres found matching the selected filter.
              </div>
            ) : (
              <div className="theatres-grid">
                {filteredTheatres.map(theatre => {
                  const theatreShows = allShows.filter(s => s.theatreId === theatre.id);
                  return (
                    <div key={theatre.id} className="theatre-card">
                      <div className="theatre-header">
                        <div className="theatre-name">{theatre.name}</div>
                        <span className="theatre-city">{theatre.city}</span>
                      </div>
                      <p className="theatre-address">📍 {theatre.address}</p>

                      <div className="shows-section">
                        <div className="shows-title">Upcoming Shows ({theatreShows.length})</div>
                        {theatreShows.length === 0 ? (
                          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No upcoming shows scheduled today.</p>
                        ) : (
                          <div className="shows-list">
                            {theatreShows.map(show => {
                              const movie = movies.find(m => m.id === show.movieId);
                              return (
                                <div key={show.id} className="show-pill">
                                  <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#f8fafc' }}>
                                      {movie ? movie.title : `Movie #${show.movieId}`}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                      {show.screenName} • {show.showTime?.slice(0, 5)} • ₹{show.ticketPrice}
                                    </div>
                                  </div>
                                  <button
                                    className="show-pill-btn"
                                    onClick={() => startBookingFromShow(show)}
                                  >
                                    Book Show
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS & PAYMENTS TAB (booking-service & payment-service) */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>🎟️ My Bookings & Payment Transactions</h2>

            <h3 style={{ marginBottom: '1rem', color: '#38bdf8' }}>Ticket Bookings History</h3>
            {userBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', background: '#1e293b', borderRadius: '12px', marginBottom: '2rem', color: '#94a3b8' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No bookings found.</p>
                <button className="auth-btn" onClick={() => setActiveTab('movies')}>Explore Movies Now</button>
              </div>
            ) : (
              <table className="data-table" style={{ marginBottom: '2.5rem' }}>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Show ID</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userBookings.map(b => (
                    <tr key={b.id}>
                      <td>#{b.id}</td>
                      <td>Show {b.showId}</td>
                      <td><strong style={{ color: '#38bdf8' }}>{b.seatNumber}</strong></td>
                      <td>₹{b.totalAmount}</td>
                      <td>{b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : 'Today'}</td>
                      <td>
                        <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.status === 'CONFIRMED' && (
                          <button
                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                            onClick={() => handleCancelBooking(b.id)}
                          >
                            Cancel & Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Payments History Table */}
            <h3 style={{ marginBottom: '1rem', color: '#4ade80' }}>Payment Transactions (Payment Service)</h3>
            {userPayments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', background: '#1e293b', borderRadius: '12px', color: '#94a3b8' }}>
                No payment transactions recorded for this account.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Transaction ID</th>
                    <th>Booking Ref</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userPayments.map(p => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td><code style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{p.transactionId?.slice(0, 16)}...</code></td>
                      <td>Booking #{p.bookingId}</td>
                      <td><strong>{p.paymentMethod}</strong></td>
                      <td>₹{p.amount}</td>
                      <td>
                        <span className={`badge ${p.status === 'COMPLETED' ? 'badge-success' : p.status === 'REFUNDED' ? 'badge-warning' : 'badge-danger'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : 'Recent'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ANALYTICS TAB (analytics-service) */}
        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>📊 Microservices & Business Analytics Dashboard</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{analytics?.totalBookings ?? 24}</div>
                <div className="stat-title">Total Bookings</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">₹{((analytics?.totalBookings ?? 24) * 350).toLocaleString()}</div>
                <div className="stat-title">Gross Revenue</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analytics?.totalUsers ?? 18}</div>
                <div className="stat-title">Active Customers</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analytics?.totalEvents ?? 68}</div>
                <div className="stat-title">Kafka Events Processed</div>
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ marginBottom: '1rem' }}>Cloud-Native Microservices Status (Eureka Registry)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {[
                  { name: 'User Service', port: 8081, desc: 'Auth, JWT & Profile Management' },
                  { name: 'Movie Service', port: 8082, desc: 'Catalogs, Posters & Metadata' },
                  { name: 'Theatre Service', port: 8083, desc: 'Cinemas, Screens & Showtimes' },
                  { name: 'Booking Service', port: 8084, desc: 'Real-time Seats & Conflict Detection' },
                  { name: 'Payment Service', port: 8085, desc: 'UPI/Cards & Refund Processing' },
                  { name: 'Notification Service', port: 8086, desc: 'Kafka Consumer & In-App Alerts' },
                  { name: 'Review Service', port: 8087, desc: 'User Ratings & Movie Reviews' },
                  { name: 'Analytics Service', port: 8088, desc: 'Event Aggregation & Business Metrics' },
                  { name: 'API Gateway', port: 8080, desc: 'Routing, Security & CORS' },
                  { name: 'Eureka Server', port: 8761, desc: 'Service Discovery & Heartbeats' },
                ].map(svc => (
                  <div key={svc.name} style={{ padding: '0.85rem', background: '#0f172a', borderRadius: '8px', borderLeft: '4px solid #22c55e', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong style={{ color: '#f8fafc' }}>{svc.name}</strong>
                      <span style={{ color: '#4ade80', fontWeight: '700' }}>:{svc.port}</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{svc.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BOOKING SEAT MATRIX & PAYMENT MODAL */}
      {selectedMovie && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h2>Book Tickets: {selectedMovie.title}</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Select theatre, screen showtime, and your preferred seats.
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedMovie(null)}>✕</button>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎟️</div>
                <h3 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Booking & Payment Confirmed!</h3>
                <p style={{ color: '#94a3b8', marginBottom: '0.5rem', fontSize: '1rem' }}>
                  Booking #{bookingSuccess.booking?.bookingId || bookingSuccess.booking?.id} • Seats: <strong style={{ color: '#38bdf8' }}>{bookingSuccess.booking?.seatNumber || bookingSuccess.seats?.join(', ')}</strong>
                </p>
                <p style={{ color: '#4ade80', fontWeight: '700', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                  Total Paid: ₹{bookingSuccess.booking?.totalAmount || (selectedShow?.ticketPrice || 350) * (bookingSuccess.seats?.length || 1)}
                </p>

                <div style={{ background: '#fff', padding: '1rem', width: '130px', height: '130px', margin: '0 auto 1.5rem auto', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '3.5rem' }}>🏁</div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#38bdf8', marginBottom: '1.5rem' }}>
                  Payment Method: {paymentMethod} • Status: COMPLETED • Alert sent to notifications
                </p>
                <button
                  className="primary-btn"
                  onClick={() => {
                    setSelectedMovie(null);
                    setActiveTab('bookings');
                  }}
                >
                  View in My Bookings & Payments
                </button>
              </div>
            ) : (
              <div>
                {/* Theatre & Showtime Picker (theatre-service) */}
                <div className="form-group">
                  <label>Select Cinema & Showtime (Theatre Service)</label>
                  <select
                    className="form-input"
                    value={selectedShow?.id || ''}
                    onChange={(e) => {
                      const show = movieShows.find(s => s.id === parseInt(e.target.value));
                      if (show) handleShowSelect(show);
                    }}
                  >
                    {movieShows.map(s => {
                      const th = theatres.find(t => t.id === s.theatreId);
                      return (
                        <option key={s.id} value={s.id}>
                          {th ? th.name : `Theatre #${s.theatreId}`} — {s.screenName} — {s.showTime?.slice(0, 5)} (₹{s.ticketPrice})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="screen-indicator"></div>
                <div className="screen-label">SCREEN THIS WAY</div>

                {/* Seat Matrix */}
                <div className="seats-grid">
                  {seatRows.map(row => (
                    <div key={row} className="seat-row">
                      <span className="row-label">{row}</span>
                      {seatCols.map(col => {
                        const seatId = `${row}${col}`;
                        const isBooked = bookedSeats.includes(seatId);
                        const isSelected = selectedSeats.includes(seatId);
                        return (
                          <div
                            key={seatId}
                            title={isBooked ? `Seat ${seatId} (Booked / Unavailable)` : `Seat ${seatId} (Click to select/deselect)`}
                            className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSeatClick(seatId)}
                          >
                            {col}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="seat-legend">
                  <div className="legend-item">
                    <div className="legend-box" style={{ background: '#334155' }}></div>
                    <span>Available</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-box" style={{ background: '#38bdf8' }}></div>
                    <span>Selected</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-box" style={{ background: '#64748b' }}></div>
                    <span>Booked (Greyed Out)</span>
                  </div>
                </div>

                {selectedSeats.length > 0 && (
                  <div className="seat-summary-banner">
                    <div>
                      Selected: <strong style={{ color: '#38bdf8' }}>{selectedSeats.join(', ')}</strong> ({selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'})
                    </div>
                    <div>
                      Total: <strong style={{ color: '#4ade80' }}>₹{(selectedShow?.ticketPrice || 350) * selectedSeats.length}</strong>
                    </div>
                  </div>
                )}

                {/* Payment Method Selector (payment-service) */}
                <div className="form-group">
                  <label>Payment Method (Payment Service)</label>
                  <select
                    className="form-input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                    <option value="CREDIT_CARD">Credit / Debit Card</option>
                    <option value="NET_BANKING">Net Banking</option>
                  </select>
                </div>

                {bookingError && (
                  <p style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    ⚠️ {bookingError}
                  </p>
                )}

                <button
                  className="primary-btn"
                  disabled={bookingLoading || selectedSeats.length === 0}
                  onClick={confirmBookingAndPay}
                >
                  {bookingLoading
                    ? 'Processing Booking & Payment...'
                    : selectedSeats.length > 0
                    ? `Pay ₹${(selectedShow?.ticketPrice || 350) * selectedSeats.length} & Confirm ${selectedSeats.length} ${selectedSeats.length === 1 ? 'Seat' : 'Seats'} (${selectedSeats.join(', ')})`
                    : 'Select at least one seat to proceed'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REVIEWS & RATINGS MODAL (review-service) */}
      {reviewMovie && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h2>⭐ Reviews & Ratings: {reviewMovie.title}</h2>
                <p style={{ color: '#fbbf24', fontSize: '0.95rem', marginTop: '0.25rem', fontWeight: '600' }}>
                  Community Score: ★ {movieAvgRating ? Number(movieAvgRating).toFixed(1) : reviewMovie.rating} / 5.0 ({movieReviews.length} reviews)
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setReviewMovie(null)}>✕</button>
            </div>

            {/* Existing Reviews List */}
            <div style={{ marginBottom: '1.5rem', maxHeight: '250px', overflowY: 'auto' }}>
              {movieReviews.length === 0 ? (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0' }}>
                  No reviews yet. Be the first to review this movie!
                </p>
              ) : (
                movieReviews.map((rev, idx) => (
                  <div key={rev.id || idx} className="review-item">
                    <div className="review-header">
                      <span style={{ fontWeight: '600', color: '#f8fafc', fontSize: '0.9rem' }}>
                        User #{rev.userId}
                      </span>
                      <span className="review-stars">
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </span>
                    </div>
                    <p className="review-text">{rev.reviewText}</p>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent review'}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Review Form */}
            <form onSubmit={handleAddReview} style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <h4 style={{ marginBottom: '0.75rem', color: '#38bdf8' }}>Write Your Review</h4>

              {reviewError && (
                <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  ⚠️ {reviewError}
                </p>
              )}

              <div className="form-group">
                <label>Your Rating</label>
                <div className="star-rating-selector">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={star <= newRating ? 'active' : ''}
                      onClick={() => setNewRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Your Review Comments</label>
                <textarea
                  required
                  rows="3"
                  className="form-input"
                  placeholder="Share your thoughts on the movie plot, direction, performances..."
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={reviewSubmitting}
              >
                {reviewSubmitting ? 'Submitting Review...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS MODAL (notification-service) */}
      {showNotificationsModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h2>🔔 In-App Notifications</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Live Kafka events from Notification Service (Port 8086)
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowNotificationsModal(false)}>✕</button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  <p>No notifications yet.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`notification-item ${n.status === 'READ' ? 'read' : ''}`}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#f8fafc', marginBottom: '0.2rem' }}>
                        {n.type === 'BOOKING_CREATED' && '🎟️ Booking Confirmed'}
                        {n.type === 'PAYMENT_COMPLETED' && '💳 Payment Received'}
                        {n.type === 'BOOKING_CANCELLED' && '❌ Booking Cancelled'}
                        {n.type === 'PAYMENT_REFUNDED' && '💰 Refund Initiated'}
                        {n.type === 'WELCOME' && '👋 Welcome to CinePass'}
                        {!['BOOKING_CREATED', 'PAYMENT_COMPLETED', 'BOOKING_CANCELLED', 'PAYMENT_REFUNDED', 'WELCOME'].includes(n.type) && '📢 Alert'}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{n.message}</p>
                      <div className="notification-meta">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'} • {n.channel}
                      </div>
                    </div>

                    {n.status !== 'READ' && (
                      <button
                        className="mark-read-btn"
                        onClick={() => handleMarkNotificationRead(n.id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <button className="modal-close-btn" onClick={() => setShowAuthModal(false)}>✕</button>
            </div>

            {authError && (
              <p style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '1rem' }}>
                ⚠️ {authError}
              </p>
            )}

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="John Doe"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="user@example.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                />
              </div>

              <button type="submit" className="primary-btn" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
              {authMode === 'login' ? (
                <>Don't have an account? <span style={{ color: '#38bdf8', cursor: 'pointer' }} onClick={() => setAuthMode('register')}>Sign Up</span></>
              ) : (
                <>Already have an account? <span style={{ color: '#38bdf8', cursor: 'pointer' }} onClick={() => setAuthMode('login')}>Login</span></>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Movie Ticket Booking Cloud-Native Architecture • Spring Boot 4 • Spring Cloud • Kafka • MySQL • React</p>
      </footer>
    </div>
  );
}

export default App;
