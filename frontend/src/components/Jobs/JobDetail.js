import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ScoreCircle from '../Layout/ScoreCircle';
import toast from 'react-hot-toast';
import { FiMapPin, FiBriefcase, FiClock, FiDollarSign, FiSend, FiArrowLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { formatDate, jobTypeLabels, experienceLevelLabels } from '../../utils/helpers';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [skillGap, setSkillGap] = useState(null);
  const [analyzingGap, setAnalyzingGap] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, resumeRes] = await Promise.all([
          api.get(`/jobs/${id}`),
          api.get('/resume').catch(() => ({ data: [] }))
        ]);
        setJob(jobRes.data);
        setResumes(resumeRes.data || []);
      } catch (err) { toast.error('Job not found'); navigate('/jobs'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, navigate]);

  const analyzeSkillGap = async () => {
    setAnalyzingGap(true);
    try {
      const { data } = await api.post('/resume/skill-gap', { jobSkills: job.requiredSkills, jobDescription: job.description });
      setSkillGap(data);
    } catch (err) { toast.error('Analysis failed'); }
    finally { setAnalyzingGap(false); }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const { data } = await api.post(`/jobs/${id}/apply`, { resumeId: selectedResume });
      toast.success('Application submitted!');
      setShowApplyModal(false);
      setSkillGap(data.analysis);
    } catch (err) { toast.error(err.response?.data?.message || 'Application failed'); }
    finally { setApplying(false); }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!job) return null;

  return (
    <div className="animate-fadeInUp">
      <button className="btn btn-ghost" onClick={() => navigate('/jobs')} style={{ marginBottom: 20 }}><FiArrowLeft /> Back to Jobs</button>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="card-flat">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{job.title}</h1>
              <p style={{ fontSize: 16, color: 'var(--accent-primary-light)', fontWeight: 500 }}>{job.company}</p>
            </div>
            <span className={`badge badge-${job.status}`}>{job.status}</span>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
            {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin /> {job.location}</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiBriefcase /> {jobTypeLabels[job.jobType]}</span>
            <span>{experienceLevelLabels[job.experienceLevel]}</span>
            {job.salary && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiDollarSign /> {job.salary}</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock /> {formatDate(job.createdAt)}</span>
          </div>
          <div className="divider" />
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Job Description</h3>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{job.description}</div>
          {job.requirements && (<><h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Requirements</h3><div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{job.requirements}</div></>)}
          {job.requiredSkills?.length > 0 && (<><h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Required Skills</h3><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{job.requiredSkills.map((s, i) => <span key={i} className="tag tag-primary">{s}</span>)}</div></>)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-flat" style={{ textAlign: 'center' }}>
            <button className="btn btn-success btn-block btn-lg" onClick={() => setShowApplyModal(true)}><FiSend /> Apply Now</button>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>{job.applicants?.length || 0} applicants</p>
          </div>
          <div className="card-flat">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Skill Gap Analysis</h3>
            {skillGap ? (
              <div>
                {/* VERDICT BANNER */}
                {skillGap.verdict && (
                  <div style={{
                    background: `${skillGap.verdict.color}15`,
                    border: `1px solid ${skillGap.verdict.color}40`,
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    marginBottom: 16
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: skillGap.verdict.color, marginBottom: 4 }}>
                      {skillGap.verdict.emoji} {skillGap.verdict.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
                      {skillGap.verdict.summary}
                    </div>
                    <div style={{
                      fontSize: 12, lineHeight: 1.6,
                      padding: '8px 12px',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)'
                    }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Recommendation: </strong>
                      {skillGap.verdict.recommendation}
                    </div>
                    {skillGap.verdict.canApply ? (
                      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--accent-secondary)', fontWeight: 600 }}>
                        ✅ You can apply for this job
                      </div>
                    ) : (
                      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--accent-danger)', fontWeight: 600 }}>
                        ⚠️ Consider upskilling before applying
                      </div>
                    )}
                  </div>
                )}

                <ScoreCircle score={skillGap.matchPercentage} size={100} label="Match" />
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><FiCheckCircle /> Matching ({skillGap.matchingSkills.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>{skillGap.matchingSkills.length > 0 ? skillGap.matchingSkills.map((s, i) => <span key={i} className="tag tag-success">{s}</span>) : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>None</span>}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-danger)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><FiXCircle /> Missing ({skillGap.missingSkills.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>{skillGap.missingSkills.length > 0 ? skillGap.missingSkills.map((s, i) => <span key={i} className="tag tag-danger">{s}</span>) : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Great match!</span>}</div>
                  <div className="divider" />
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Breakdown</div>
                  {Object.entries(skillGap.breakdown || {}).map(([key, val]) => (<div key={key} style={{ marginBottom: 8 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{val}%</span></div><div className="progress-bar"><div className="progress-fill purple" style={{ width: `${val}%` }} /></div></div>))}

                  {/* ACTION ITEMS */}
                  {skillGap.verdict?.actionItems?.length > 0 && (
                    <>
                      <div className="divider" />
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Action items to improve</div>
                      {skillGap.verdict.actionItems.map((item, i) => (
                        <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, paddingLeft: 12, borderLeft: '2px solid var(--accent-primary)' }}>{item}</p>
                      ))}
                    </>
                  )}

                  {skillGap.suggestions?.length > 0 && (<><div className="divider" /><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Suggestions</div>{skillGap.suggestions.map((s, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, paddingLeft: 12, borderLeft: '2px solid var(--accent-primary)' }}>{s}</p>)}</>)}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Compare your skills with this job</p>
                <button className="btn btn-secondary btn-block" onClick={analyzeSkillGap} disabled={analyzingGap}>{analyzingGap ? 'Analyzing...' : 'Run Analysis'}</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Apply for {job.title}</h2><button className="modal-close" onClick={() => setShowApplyModal(false)}>&times;</button></div>
            <div className="form-group">
              <label className="form-label">Select Resume (Optional)</label>
              <select className="form-select" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                <option value="">Use profile data</option>
                {resumes.map(r => <option key={r._id} value={r._id}>{r.originalName}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleApply} disabled={applying}><FiSend /> {applying ? 'Submitting...' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
