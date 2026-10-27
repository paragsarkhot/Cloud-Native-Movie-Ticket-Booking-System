// API service calling through relative path (proxied by Nginx to API Gateway) or fallback to 8080
const API_BASE = process.env.REACT_APP_API_URL !== undefined ? process.env.REACT_APP_API_URL : '';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  // Auth & Users
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Login failed');
    return res.json();
  },

  register: async (name, email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'CUSTOMER' }),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Registration failed');
    return res.json();
  },

  // Movies
  getMovies: async () => {
    const res = await fetch(`${API_BASE}/api/movies`);
    if (!res.ok) throw new Error('Failed to fetch movies');
    return res.json();
  },

  getMovieById: async (id) => {
    const res = await fetch(`${API_BASE}/api/movies/${id}`);
    if (!res.ok) throw new Error('Failed to fetch movie');
    return res.json();
  },

  // Theatres & Shows (theatre-service)
  getTheatres: async () => {
    const res = await fetch(`${API_BASE}/api/theatres`);
    if (!res.ok) throw new Error('Failed to fetch theatres');
    return res.json();
  },

  getShows: async () => {
    const res = await fetch(`${API_BASE}/api/shows`);
    if (!res.ok) return [];
    return res.json();
  },

  getShowsByMovie: async (movieId) => {
    const res = await fetch(`${API_BASE}/api/shows/movie/${movieId}`);
    if (!res.ok) return [];
    return res.json();
  },

  getShowsByTheatre: async (theatreId) => {
    const res = await fetch(`${API_BASE}/api/shows/theatre/${theatreId}`);
    if (!res.ok) return [];
    return res.json();
  },

  getShowById: async (id) => {
    const res = await fetch(`${API_BASE}/api/shows/${id}`);
    if (!res.ok) throw new Error('Failed to fetch show');
    return res.json();
  },

  // Bookings (booking-service)
  getBookedSeats: async (showId) => {
    const res = await fetch(`${API_BASE}/api/bookings/show/${showId}/seats`);
    if (!res.ok) return [];
    return res.json();
  },

  createBooking: async (userId, showId, seats) => {
    const seatList = Array.isArray(seats) ? seats : [seats];
    const payload = {
      userId,
      showId,
      seatNumbers: seatList,
      seatNumber: seatList.join(', '),
    };
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'One or more selected seats are already booked or invalid');
    }
    return res.json();
  },

  getUserBookings: async (userId) => {
    const res = await fetch(`${API_BASE}/api/bookings/user/${userId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  cancelBooking: async (bookingId) => {
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to cancel booking');
    return res.json();
  },

  // Payments (payment-service)
  processPayment: async (bookingId, userId, amount, paymentMethod) => {
    const res = await fetch(`${API_BASE}/api/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookingId, userId, amount, paymentMethod }),
    });
    if (!res.ok) throw new Error('Payment processing failed');
    return res.json();
  },

  getPaymentsByUser: async (userId) => {
    const res = await fetch(`${API_BASE}/api/payments/user/${userId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  refundPayment: async (paymentId) => {
    const res = await fetch(`${API_BASE}/api/payments/${paymentId}/refund`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Refund failed');
    return res.json();
  },

  // Reviews (review-service)
  getReviewsByMovie: async (movieId) => {
    const res = await fetch(`${API_BASE}/api/reviews/movie/${movieId}`);
    if (!res.ok) return [];
    return res.json();
  },

  getAverageRating: async (movieId) => {
    const res = await fetch(`${API_BASE}/api/reviews/movie/${movieId}/rating`);
    if (!res.ok) return null;
    return res.json();
  },

  addReview: async (userId, movieId, rating, reviewText) => {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, movieId, rating, reviewText, status: 'APPROVED' }),
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return res.json();
  },

  // Notifications (notification-service)
  getNotifications: async (userId) => {
    const res = await fetch(`${API_BASE}/api/notifications/user/${userId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  markNotificationAsRead: async (id) => {
    const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  },

  // Analytics (analytics-service)
  getAnalyticsStats: async () => {
    const res = await fetch(`${API_BASE}/api/analytics/stats`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load analytics');
    return res.json();
  },

  getPopularMovies: async () => {
    const res = await fetch(`${API_BASE}/api/analytics/movies/popular`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },
};
