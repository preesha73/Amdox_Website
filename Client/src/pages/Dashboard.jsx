import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { setAuthToken } from '../api';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get the token

// --- Helper component for logged-out users ---
function WelcomePage() {
  return (
    <div className="page-container">
      <div className="welcome-container">
        <h1 className="welcome-title">Welcome to Our Website!</h1>
        <p className="welcome-subtitle">
          Please log in to manage your dashboard or register for a new account.
        </p>
        <div className="welcome-buttons">
          <Link to="/login" className="btn">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- The Main and ONLY Dashboard Component ---
export default function Dashboard() {
  const { token } = useAuth(); // Get the token from our shared context
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs when the component loads or when the token changes
    if (!token) {
      setIsLoading(false);
      setUser(null); // Make sure user is cleared if token is removed
      return;
    }

    setAuthToken(token); // Set the token for API requests
    api
      .get('/api/me')
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((error) => {
        console.error('Auth fetch error:', error);
        setUser(null); // Clear user on error
      })
      .finally(() => {
        setIsLoading(false); // Stop loading screen
      });
  }, [token]); // The effect now depends on the token from the context

  // Show a loading message while we check for the token
  if (isLoading) {
    return <div className="loading-fullscreen">Loading...</div>;
  }

  // Conditionally render the Dashboard or the Welcome Page
  return user ? (
    <div className="page-container">
      <div className="dashboard-container">
        <h2 className="dashboard-welcome-title">
          Welcome back, <span className="user-name">{user.name}</span>!
        </h2>
        <p className="dashboard-subtitle">We're glad to see you again.</p>
        <div className="dashboard-info">
          <p>Your registered email is: {user.email}</p>
        </div>
        {/* The logout button is in the main nav bar, so it's not needed here */}
      </div>
    </div>
  ) : (
    <WelcomePage />
  );
}