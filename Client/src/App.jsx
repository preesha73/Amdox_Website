// In Client/src/App.jsx

import { Routes, Route, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PublicRoute from './pages/PublicRoute';
import { useAuth } from './context/AuthContext'; // Import the useAuth hook

// --- The ONE AND ONLY AppLayout function ---
function AppLayout() {
  const { token, logout } = useAuth(); // Get token and logout from context
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
              Dashboard
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
        <Route index element={<Dashboard />} />

        {/* --- Public routes that are protected when logged in --- */}
        <Route element={<PublicRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Route>
    </Routes>
  );
}