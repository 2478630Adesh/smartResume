import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiBriefcase, FiClock } from 'react-icons/fi';
import { formatDate, jobTypeLabels, getScoreColor } from '../../utils/helpers';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/jobs/my-applications');
        setApplications(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="animate-fadeInUp">
      <div className="page-header"><h1>My Applications</h1><p>Track your job applications and scores</p></div>
      {applications.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <FiBriefcase size={48} /><h3>No Applications Yet</h3><p>Start applying to jobs to track them here</p>
          <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Jobs</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Job Title</th><th>Company</th><th>Type</th><th>Status</th><th>ATS Score</th><th>Match %</th><th>Applied</th></tr></thead>
            <tbody>
              {applications.map((app, i) => (
                <tr key={i}>
                  <td><Link to={`/jobs/${app.job._id}`} style={{ fontWeight: 600 }}>{app.job.title}</Link></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{app.job.company}</td>
                  <td><span className="tag tag-info">{jobTypeLabels[app.job.jobType] || app.job.jobType}</span></td>
                  <td><span className={`badge badge-${app.application?.status || 'pending'}`}>{app.application?.status || 'Pending'}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: getScoreColor(app.application?.atsScore || 0) }}>{app.application?.atsScore || 0}%</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: getScoreColor(app.application?.matchPercentage || 0) }}>{app.application?.matchPercentage || 0}%</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}><FiClock style={{ marginRight: 4 }} />{formatDate(app.application?.appliedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
