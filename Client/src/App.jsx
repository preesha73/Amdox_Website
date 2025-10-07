// In Client/src/App.jsx

import { Routes, Route, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import PublicRoute from './pages/PublicRoute';
import { useAuth } from './context/AuthContext'; // Import the useAuth hook
import Profile from './pages/Profile';
import Employer from './pages/Employer';
import Applications from './pages/Applications';

// --- The ONE AND ONLY AppLayout function ---
function AppLayout() {
  const { token, user, logout } = useAuth(); // Get token and logout from context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div className="app-container">
      <nav className="main-nav">
        {token ? (
          <>
            {/* --- SHOW THESE WHEN LOGGED IN --- */}
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Home
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Profile
            </NavLink>
            {user?.role === 'Employer' && (
              <NavLink
                to="/employer"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Employer
              </NavLink>
            )}
            <NavLink
              to="/applications"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Applications
            </NavLink>
            <button onClick={handleLogout} className="nav-link-button">
              Logout
            </button>
          </>
        ) : (
          <>
            {/* --- SHOW THESE WHEN LOGGED OUT --- */}
            <NavLink
              to="/register"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Register
            </NavLink>
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Login
            </NavLink>
          </>
        )}
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

// --- The Main App component that sets up the routes ---
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="employer" element={<Employer />} />
        <Route path="applications" element={<Applications />} />

        {/* --- Public routes that are protected when logged in --- */}
        <Route element={<PublicRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Route>
    </Routes>
  );
}