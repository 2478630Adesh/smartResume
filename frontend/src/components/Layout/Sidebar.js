import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiBriefcase, FiFileText, FiSearch, FiUser, FiPlusCircle, FiUsers, FiBarChart2, FiUpload, FiStar } from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  if (!user) return null;

  const userLinks = [
    { label: 'Overview', icon: <FiHome />, path: '/dashboard' },
    { label: 'Browse Jobs', icon: <FiBriefcase />, path: '/jobs' },
    { label: 'My Applications', icon: <FiStar />, path: '/my-applications' },
    { label: 'Resume Builder', icon: <FiFileText />, path: '/resume-builder' },
    { label: 'Upload Resume', icon: <FiUpload />, path: '/resume-upload' },
    { label: 'JD Analyzer', icon: <FiSearch />, path: '/analyzer' },
    { label: 'Profile', icon: <FiUser />, path: '/profile' },
  ];

  const hrLinks = [
    { label: 'Overview', icon: <FiHome />, path: '/hr/dashboard' },
    { label: 'Post New Job', icon: <FiPlusCircle />, path: '/hr/post-job' },
    { label: 'Manage Jobs', icon: <FiBriefcase />, path: '/hr/dashboard' },
    { label: 'Applicants', icon: <FiUsers />, path: '/hr/dashboard' },
    { label: 'Analytics', icon: <FiBarChart2 />, path: '/hr/dashboard' },
    { label: 'Profile', icon: <FiUser />, path: '/profile' },
  ];

  const links = user.role === 'hr' ? hrLinks : userLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-section-title">
        {user.role === 'hr' ? 'HR Panel' : 'Job Seeker'}
      </div>
      <ul className="sidebar-nav">
        {links.map((link) => (
          <li key={link.path + link.label}>
            <Link to={link.path} className={isActive(link.path)}>
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
