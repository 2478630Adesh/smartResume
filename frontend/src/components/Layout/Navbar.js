import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import { FiMenu, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">R</span>
        <span>Resume<span style={{ color: 'var(--accent-primary-light)' }}>IQ</span></span>
      </Link>

      {user ? (
        <div className="nav-user">
          <ul className="navbar-nav desktop">
            {user.role === 'user' ? (
              <>
                <li><Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link></li>
                <li><Link to="/jobs" className={isActive('/jobs')}>Jobs</Link></li>
                <li><Link to="/resume-builder" className={isActive('/resume-builder')}>Resume Builder</Link></li>
                <li><Link to="/analyzer" className={isActive('/analyzer')}>Analyzer</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/hr/dashboard" className={isActive('/hr/dashboard')}>Dashboard</Link></li>
                <li><Link to="/hr/post-job" className={isActive('/hr/post-job')}>Post Job</Link></li>
              </>
            )}
            <li><Link to="/profile" className={isActive('/profile')}>Profile</Link></li>
          </ul>
          <div className="nav-avatar">{getInitials(user.name)}</div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
            <FiLogOut />
          </button>
        </div>
      ) : (
        <ul className="navbar-nav desktop">
          <li><Link to="/login" className={isActive('/login')}>Login</Link></li>
          <li><Link to="/register" className="btn btn-primary btn-sm">Get Started</Link></li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
