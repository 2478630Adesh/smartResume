import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import ScoreCircle from '../Layout/ScoreCircle';
import { FiFileText, FiBriefcase, FiTarget, FiTrendingUp, FiArrowRight, FiClock } from 'react-icons/fi';
import { timeAgo, jobTypeLabels } from '../../utils/helpers';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ applications: [], recentJobs: [], resumes: [], profileStrength: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, jobsRes, resumesRes, profileRes] = await Promise.all([
          api.get('/jobs/my-applications').catch(() => ({ data: [] })),
          api.get('/jobs').catch(() => ({ data: [] })),
          api.get('/resume').catch(() => ({ data: [] })),
          api.get('/auth/profile').catch(() => ({ data: {} }))
        ]);

        const p = profileRes.data;
        let strength = 10;
        if (p.name) strength += 10;
        if (p.phone) strength += 5;
        if (p.bio) strength += 10;
        if (p.skills?.length > 0) strength += 15;
        if (p.education?.length > 0) strength += 15;
        if (p.experience?.length > 0) strength += 15;
        if (p.projects?.length > 0) strength += 10;
        if (p.certifications?.length > 0) strength += 5;
        if (p.socialLinks?.github || p.socialLinks?.linkedin) strength += 5;

        setStats({
          applications: appsRes.data || [],
          recentJobs: (jobsRes.data || []).slice(0, 5),
          resumes: resumesRes.data || [],
          profileStrength: Math.min(strength, 100)
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="animate-fadeInUp">
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p>Here's an overview of your job search progress</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon purple"><FiBriefcase /></div>
          <div className="stat-info"><h3>{stats.applications.length}</h3><p>Applications</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiFileText /></div>
          <div className="stat-info"><h3>{stats.resumes.length}</h3><p>Resumes</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><FiTarget /></div>
          <div className="stat-info"><h3>{stats.recentJobs.length}+</h3><p>Jobs Available</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><FiTrendingUp /></div>
          <div className="stat-info"><h3>{stats.profileStrength}%</h3><p>Profile Strength</p></div>
        </div>
      </div>

      <div className="grid-2">
        {/* Profile Strength */}
        <div className="card-flat">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Profile Strength</h3>
          <ScoreCircle score={stats.profileStrength} label="Complete" />
          <div style={{ marginTop: 16 }}>
            {stats.profileStrength < 100 && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
                <p style={{ marginBottom: 8 }}>Complete your profile to improve job matches:</p>
                <Link to="/profile" className="btn btn-secondary btn-sm">Complete Profile <FiArrowRight /></Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-flat">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/resume-builder" className="btn btn-primary btn-block" style={{ justifyContent: 'flex-start' }}>
              <FiFileText /> Build / Preview Resume
            </Link>
            <Link to="/jobs" className="btn btn-secondary btn-block" style={{ justifyContent: 'flex-start' }}>
              <FiBriefcase /> Browse Jobs
            </Link>
            <Link to="/analyzer" className="btn btn-secondary btn-block" style={{ justifyContent: 'flex-start' }}>
              <FiTarget /> Analyze Job Description
            </Link>
            <Link to="/resume-upload" className="btn btn-secondary btn-block" style={{ justifyContent: 'flex-start' }}>
              <FiTrendingUp /> Upload Resume
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="card-flat" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Latest Job Openings</h3>
          <Link to="/jobs" className="btn btn-ghost btn-sm">View All <FiArrowRight /></Link>
        </div>
        {stats.recentJobs.length === 0 ? (
          <div className="empty-state"><p>No jobs posted yet. Check back soon!</p></div>
        ) : (
          stats.recentJobs.map(job => (
            <Link to={`/jobs/${job._id}`} key={job._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{job.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 12, marginTop: 2 }}>
                    <span>{job.company}</span>
                    <span>{jobTypeLabels[job.jobType] || job.jobType}</span>
                    {job.location && <span>{job.location}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiClock /> {timeAgo(job.createdAt)}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Recent Applications */}
      {stats.applications.length > 0 && (
        <div className="card-flat" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>My Applications</h3>
          {stats.applications.slice(0, 5).map((app, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{app.job.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{app.job.company}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={`badge badge-${app.application?.status || 'pending'}`}>
                  {app.application?.status || 'Pending'}
                </span>
                {app.application?.atsScore > 0 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--accent-primary-light)' }}>
                    {app.application.atsScore}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
