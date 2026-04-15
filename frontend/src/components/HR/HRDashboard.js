import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiBriefcase, FiUsers, FiTrendingUp, FiEdit2, FiTrash2, FiEye, FiChevronDown, FiChevronUp, FiBarChart2 } from 'react-icons/fi';
import { formatDate, getScoreColor, getInitials } from '../../utils/helpers';

const HRDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [lbLoading, setLbLoading] = useState(false);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs/hr/myjobs');
      setJobs(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job deleted');
      setJobs(jobs.filter(j => j._id !== id));
    } catch (err) { toast.error('Delete failed'); }
  };

  const viewLeaderboard = async (jobId) => {
    if (expandedJob === jobId) { setExpandedJob(null); setLeaderboard(null); return; }
    setExpandedJob(jobId);
    setLbLoading(true);
    try {
      const { data } = await api.get(`/jobs/${jobId}/applicants`);
      setLeaderboard(data);
    } catch (err) { toast.error('Failed to load applicants'); }
    finally { setLbLoading(false); }
  };

  const updateStatus = async (jobId, applicantId, status) => {
    try {
      await api.put(`/jobs/${jobId}/applicants/${applicantId}`, { status });
      toast.success(`Status updated to ${status}`);
      viewLeaderboard(jobId);
    } catch (err) { toast.error('Update failed'); }
  };

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants?.length || 0), 0);
  const activeJobs = jobs.filter(j => j.status === 'active').length;

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="animate-fadeInUp">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div><h1>HR Dashboard</h1><p>Manage jobs and review applicants</p></div>
        <Link to="/hr/post-job" className="btn btn-primary">+ Post New Job</Link>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon purple"><FiBriefcase /></div>
          <div className="stat-info"><h3>{jobs.length}</h3><p>Total Jobs</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiUsers /></div>
          <div className="stat-info"><h3>{totalApplicants}</h3><p>Total Applicants</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><FiTrendingUp /></div>
          <div className="stat-info"><h3>{activeJobs}</h3><p>Active Jobs</p></div>
        </div>
      </div>

      {/* Job Listings */}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Your Job Postings</h3>
      {jobs.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <FiBriefcase size={48} />
          <h3>No Jobs Posted Yet</h3>
          <p>Create your first job posting to start receiving applications</p>
          <Link to="/hr/post-job" className="btn btn-primary" style={{ marginTop: 16 }}>Post a Job</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {jobs.map(job => (
            <div key={job._id} className="card-flat">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 600 }}>{job.title}</h3>
                    <span className={`badge badge-${job.status}`}>{job.status}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--accent-primary-light)' }}>{job.company}</p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                    <span>{job.location || 'Remote'}</span>
                    <span>{job.jobType}</span>
                    <span>Posted {formatDate(job.createdAt)}</span>
                    <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{job.applicants?.length || 0} applicants</span>
                  </div>
                  {job.requiredSkills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                      {job.requiredSkills.slice(0, 6).map((s, i) => <span key={i} className="tag tag-primary">{s}</span>)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => viewLeaderboard(job._id)}>
                    <FiBarChart2 /> {expandedJob === job._id ? 'Hide' : 'Applicants'}
                    {expandedJob === job._id ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteJob(job._id)}><FiTrash2 /></button>
                </div>
              </div>

              {/* Leaderboard */}
              {expandedJob === job._id && (
                <div style={{ marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiUsers /> Candidate Leaderboard
                  </h4>
                  {lbLoading ? (
                    <div className="loader"><div className="spinner"></div></div>
                  ) : leaderboard?.leaderboard?.length > 0 ? (
                    <div>
                      {leaderboard.leaderboard.map((app) => (
                        <div key={app.rank} className="leaderboard-row">
                          <div className={`leaderboard-rank ${app.rank <= 3 ? `rank-${app.rank}` : 'rank-default'}`}>
                            {app.rank}
                          </div>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                            {getInitials(app.user?.name)}
                          </div>
                          <div className="leaderboard-info" style={{ flex: 1 }}>
                            <h4>{app.user?.name || 'Unknown'}</h4>
                            <p>{app.user?.email}</p>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                              {app.matchingSkills?.slice(0, 4).map((s, i) => <span key={i} className="tag tag-success" style={{ padding: '2px 8px', fontSize: 10 }}>{s}</span>)}
                              {app.missingSkills?.slice(0, 2).map((s, i) => <span key={i} className="tag tag-danger" style={{ padding: '2px 8px', fontSize: 10 }}>{s}</span>)}
                            </div>
                          </div>
                          <div className="leaderboard-score">
                            <div className="score" style={{ color: getScoreColor(app.atsScore) }}>{app.atsScore}%</div>
                            <div className="label">ATS Score</div>
                          </div>
                          <div style={{ textAlign: 'center', minWidth: 80 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: getScoreColor(app.matchPercentage) }}>{app.matchPercentage}%</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Match</div>
                          </div>
                          <div>
                            <select
                              className="form-select"
                              style={{ padding: '6px 30px 6px 10px', fontSize: 12, minWidth: 120 }}
                              value={app.status}
                              onChange={e => updateStatus(job._id, app.user?._id ? leaderboard.leaderboard.find(a => a.rank === app.rank)?._id : '', e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state"><p>No applicants yet for this job</p></div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
