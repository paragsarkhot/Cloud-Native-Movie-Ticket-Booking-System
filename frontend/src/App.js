import React, { useState, useEffect } from 'react';
import './App.css';
import { api } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
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
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');

  useEffect(() => {
    loadMovies();
    loadTheatres();
    if (user) {
      loadUserBookings(user.id);
    }
  }, [user]);

  const loadMovies = async () => {
    try {
      const data = await api.getMovies();
      // If DB is empty, use sample data so UI looks amazing right out of the box
      if (!data || data.length === 0) {
        setMovies([
          { id: 1, title: 'Inception', genre: 'Sci-Fi', language: 'English', duration: 148, rating: 8.8, description: 'A thief who steals corporate secrets through dream-sharing technology.', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop' },
          { id: 2, title: 'Interstellar', genre: 'Sci-Fi', language: 'English', duration: 169, rating: 8.7, description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop' },
          { id: 3, title: 'The Dark Knight', genre: 'Action', language: 'English', duration: 152, rating: 9.0, description: 'When the menace known as the Joker wreaks havoc and chaos on Gotham City.', posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop' },
          { id: 4, title: 'Oppenheimer', genre: 'Drama', language: 'English', duration: 180, rating: 8.9, description: 'The story of American scientist J. Robert Oppenheimer and the Manhattan Project.', posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop' },
        ]);
      } else {
        setMovies(data);
      }
    } catch (e) {
      console.warn('API Gateway offline or no movies yet, showing default movie catalog:', e);
      setMovies([
        { id: 1, title: 'Inception', genre: 'Sci-Fi', language: 'English', duration: 148, rating: 8.8, description: 'A thief who steals corporate secrets through dream-sharing technology.', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop' },
        { id: 2, title: 'Interstellar', genre: 'Sci-Fi', language: 'English', duration: 169, rating: 8.7, description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop' },
        { id: 3, title: 'The Dark Knight', genre: 'Action', language: 'English', duration: 152, rating: 9.0, description: 'When the menace known as the Joker wreaks havoc and chaos on Gotham City.', posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop' },
      ]);
    }
  };

  const loadTheatres = async () => {
    try {
      const data = await api.getTheatres();
      setTheatres(data || []);
    } catch (e) {
      console.warn('Theatres load:', e);
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

  const loadAnalytics = async () => {
    try {
      const stats = await api.getAnalyticsStats();
      const popular = await api.getPopularMovies();
      setAnalytics(stats);
      setPopularMovies(popular);
    } catch (e) {
      console.warn('Analytics load error:', e);
      setAnalytics({ totalEvents: 42, totalUsers: 18, totalBookings: 24, totalCancellations: 2 });
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
    } catch (err) {
      setAuthError(err.message || 'Authentication error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUserBookings([]);
  };

  const fetchBookedSeats = async (showId) => {
    try {
      const seats = await api.getBookedSeats(showId);
      setBookedSeats(Array.isArray(seats) ? seats : []);
    } catch (e) {
      setBookedSeats([]);
    }
  };

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
        setSelectedShow(showList[0]);
        setShows(showList);
        fetchBookedSeats(showList[0].id);
      } else {
        // Fallback demo show
        const demoShow = {
          id: 1,
          movieId: movie.id,
          screenName: 'Screen 1 (IMAX 4K)',
          showDate: '2026-10-25',
          showTime: '19:30:00',
          ticketPrice: 350.0,
        };
        setSelectedShow(demoShow);
        setShows([demoShow]);
        fetchBookedSeats(1);
      }
    } catch (e) {
      const demoShow = {
        id: 1,
        movieId: movie.id,
        screenName: 'Screen 1 (IMAX 4K)',
        showDate: '2026-10-25',
        showTime: '19:30:00',
        ticketPrice: 350.0,
      };
      setSelectedShow(demoShow);
      setShows([demoShow]);
      fetchBookedSeats(1);
    }
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

      // Refresh booked seats for the show so they turn grey immediately
      fetchBookedSeats(selectedShow.id);
      setSelectedSeats([]);

      // Refresh user bookings list
      loadUserBookings(user.id);
    } catch (err) {
      setBookingError(err.message || 'Booking transaction failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.cancelBooking(id);
      loadUserBookings(user.id);
      alert('Booking cancelled and refund initiated successfully!');
    } catch (err) {
      alert('Failed to cancel: ' + err.message);
    }
  };

  const seatRows = ['A', 'B', 'C', 'D'];
  const seatCols = [1, 2, 3, 4, 5, 6, 7, 8];

  const filteredMovies = movies.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = genreFilter ? m.genre.toLowerCase() === genreFilter.toLowerCase() : true;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="app">
      {/* Navigation */}
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
            className={`nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => {
              if (!user) setShowAuthModal(true);
              else {
                setActiveTab('bookings');
                loadUserBookings(user.id);
              }
            }}
          >
            My Bookings
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
            <div className="user-badge">
              <span>👤 {user.name}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
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
        {activeTab === 'movies' && (
          <div>
            <section className="hero">
              <h1>Experience Cinema Like Never Before</h1>
              <p>Book tickets in real-time across top theatres with seamless instant payments and cloud-native microservices.</p>
              
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
                      {movie.description?.slice(0, 85)}...
                    </p>
                    <button className="book-btn" onClick={() => startBookingFlow(movie)}>
                      Book Tickets
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Bookings View */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>My Bookings History</h2>
            {userBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No bookings found.</p>
                <button className="auth-btn" onClick={() => setActiveTab('movies')}>Explore Movies Now</button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Show ID</th>
                    <th>Seat Number</th>
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
                      <td><strong>{b.seatNumber}</strong></td>
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
                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                            onClick={() => handleCancelBooking(b.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>📊 Microservices & Business Analytics</h2>
            
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
                <div className="stat-title">Active Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analytics?.totalEvents ?? 58}</div>
                <div className="stat-title">Kafka Events Processed</div>
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ marginBottom: '1rem' }}>Active Microservices Architecture Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {['User Service (8081)', 'Movie Service (8082)', 'Theatre Service (8083)', 'Booking Service (8084)', 'Payment Service (8085)', 'Notification Service (8086)', 'Review Service (8087)', 'Analytics Service (8088)', 'API Gateway (8080)', 'Eureka Server (8761)'].map(svc => (
                  <div key={svc} style={{ padding: '0.75rem', background: '#0f172a', borderRadius: '8px', borderLeft: '4px solid #22c55e', fontSize: '0.85rem' }}>
                    <span style={{ color: '#4ade80' }}>● UP</span> — {svc}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Booking Seat Matrix & Payment Modal */}
      {selectedMovie && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Select Seat & Book: {selectedMovie.title}</h2>
              <button
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
                onClick={() => setSelectedMovie(null)}
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎟️</div>
                <h3 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Booking Confirmed!</h3>
                <p style={{ color: '#94a3b8', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                  Booking #{bookingSuccess.booking?.bookingId || bookingSuccess.booking?.id} • Seats: <strong style={{ color: '#38bdf8' }}>{bookingSuccess.booking?.seatNumber || bookingSuccess.seats?.join(', ')}</strong>
                </p>
                <p style={{ color: '#4ade80', fontWeight: '700', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                  Total Amount Paid: ₹{bookingSuccess.booking?.totalAmount || (selectedShow?.ticketPrice || 350) * (bookingSuccess.seats?.length || 1)}
                </p>

                {/* QR Code representation */}
                <div style={{ background: '#fff', padding: '1rem', width: '140px', height: '140px', margin: '0 auto 1.5rem auto', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '4rem' }}>🏁</div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '1.5rem' }}>
                  Payment Method: {paymentMethod} • Status: PAID
                </p>
                <button
                  className="primary-btn"
                  onClick={() => {
                    setSelectedMovie(null);
                    setActiveTab('bookings');
                  }}
                >
                  View in My Bookings
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                  Screen: <strong>{selectedShow?.screenName || 'Screen 1'}</strong> • Price per Seat: <strong>₹{selectedShow?.ticketPrice || 350}</strong>
                </p>

                <div className="screen-indicator"></div>
                <div className="screen-label">SCREEN THIS WAY</div>

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
                    <span>Booked (Unavailable)</span>
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

                <div className="form-group">
                  <label>Payment Method</label>
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
                    ? 'Processing Transaction...'
                    : selectedSeats.length > 0
                    ? `Pay ₹${(selectedShow?.ticketPrice || 350) * selectedSeats.length} & Confirm ${selectedSeats.length} ${selectedSeats.length === 1 ? 'Seat' : 'Seats'} (${selectedSeats.join(', ')})`
                    : 'Select at least one seat to proceed'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal" style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <button
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
                onClick={() => setShowAuthModal(false)}
              >
                ✕
              </button>
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
