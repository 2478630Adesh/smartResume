import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiSearch, FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiFilter } from 'react-icons/fi';
import { timeAgo, jobTypeLabels, experienceLevelLabels, truncateText } from '../../utils/helpers';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ jobType: '', experienceLevel: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async (searchQuery = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.jobType) params.append('jobType', filters.jobType);
      if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
      const { data } = await api.get(`/jobs?${params.toString()}`);
      setJobs(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(search);
  };

  const applyFilters = () => { fetchJobs(search); setShowFilters(false); };

  return (
    <div className="animate-fadeInUp">
      <div className="page-header">
        <h1>Browse Jobs</h1>
        <p>Discover opportunities that match your skills</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 40 }} placeholder="Search by title, company, or skill..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
        <button type="button" className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
          <FiFilter /> Filters
        </button>
      </form>

      {showFilters && (
        <div className="card-flat" style={{ marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 180 }}>
            <label className="form-label">Job Type</label>
            <select className="form-select" value={filters.jobType} onChange={e => setFilters({...filters, jobType: e.target.value})}>
              <option value="">All Types</option>
              {Object.entries(jobTypeLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 180 }}>
            <label className="form-label">Experience Level</label>
            <select className="form-select" value={filters.experienceLevel} onChange={e => setFilters({...filters, experienceLevel: e.target.value})}>
              <option value="">All Levels</option>
              {Object.entries(experienceLevelLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>
          <button className="btn btn-primary btn-sm" onClick={applyFilters}>Apply</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ jobType: '', experienceLevel: '' }); fetchJobs(search); }}>Clear</button>
        </div>
      )}

      {loading ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : jobs.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <FiBriefcase size={48} />
          <h3>No Jobs Found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{jobs.length} jobs found</p>
          {jobs.map(job => (
            <Link to={`/jobs/${job._id}`} key={job._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="job-card">
                <div className="job-card-header">
                  <div>
                    <div className="job-card-title">{job.title}</div>
                    <div className="job-card-company">{job.company}</div>
                  </div>
                  <span className={`badge badge-${job.status}`}>{job.status}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
                  {truncateText(job.description, 180)}
                </p>
                <div className="job-card-meta">
                  {job.location && <span><FiMapPin /> {job.location}</span>}
                  <span><FiBriefcase /> {jobTypeLabels[job.jobType] || job.jobType}</span>
                  <span><FiClock /> {timeAgo(job.createdAt)}</span>
                  {job.salary && <span><FiDollarSign /> {job.salary}</span>}
                  <span>{experienceLevelLabels[job.experienceLevel] || 'Any Level'}</span>
                </div>
                {job.requiredSkills?.length > 0 && (
                  <div className="job-card-skills">
                    {job.requiredSkills.slice(0, 6).map((skill, i) => (
                      <span key={i} className="tag tag-primary">{skill}</span>
                    ))}
                    {job.requiredSkills.length > 6 && <span className="tag tag-info">+{job.requiredSkills.length - 6} more</span>}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;
