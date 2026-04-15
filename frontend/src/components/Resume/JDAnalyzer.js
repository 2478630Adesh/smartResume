import React, { useState } from 'react';
import api from '../../utils/api';
import ScoreCircle from '../Layout/ScoreCircle';
import toast from 'react-hot-toast';
import { FiSearch, FiCheckCircle, FiXCircle, FiZap, FiClipboard } from 'react-icons/fi';

const JDAnalyzer = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return toast.error('Please paste a job description');
    setLoading(true);
    try {
      const { data } = await api.post('/jobs/analyze', { jobDescription });
      setAnalysis(data);
    } catch (err) { toast.error('Analysis failed'); }
    finally { setLoading(false); }
  };

  const sampleJD = `We are looking for a Full Stack Developer with 3+ years of experience. 
The ideal candidate should have strong proficiency in:
- React.js and Next.js for frontend development
- Node.js and Express for backend APIs
- MongoDB and PostgreSQL databases
- Docker and AWS for deployment
- Git, CI/CD pipelines
- Experience with REST APIs and GraphQL
- Strong understanding of agile methodologies

Nice to have: TypeScript, Redis, Kubernetes, Python

Requirements:
- Bachelor's degree in Computer Science or related field
- 3+ years of professional software development experience
- Strong problem-solving skills
- Excellent communication skills`;

  return (
    <div className="animate-fadeInUp">
      <div className="page-header"><h1>Job Description Analyzer</h1><p>Paste any job description to extract skills, requirements, and match against your profile</p></div>

      <div style={{ display: 'grid', gridTemplateColumns: analysis ? '1fr 1fr' : '1fr', gap: 24 }}>
        {/* Input */}
        <div className="card-flat">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Job Description</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setJobDescription(sampleJD)}>
              <FiClipboard /> Load Sample
            </button>
          </div>
          <textarea
            className="form-textarea"
            rows={16}
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            style={{ minHeight: 350, fontSize: 13 }}
          />
          <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={handleAnalyze} disabled={loading}>
            <FiSearch /> {loading ? 'Analyzing...' : 'Analyze Job Description'}
          </button>
        </div>

        {/* Results */}
        {analysis && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fadeIn">
            {/* Extracted Skills */}
            <div className="card-flat">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Extracted Skills ({analysis.extractedSkills?.length || 0})</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {analysis.extractedSkills?.map((skill, i) => <span key={i} className="tag tag-primary">{skill}</span>)}
              </div>
            </div>

            {/* Job Meta */}
            <div className="card-flat">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Job Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Experience</span><p style={{ fontWeight: 600, fontSize: 14 }}>{analysis.experienceRequired}</p></div>
                <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Job Type</span><p style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{analysis.jobType}</p></div>
              </div>
            </div>

            {/* Skill Gap (if available) */}
            {analysis.skillGap && (
              <div className="card-flat">
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Your Profile Match</h3>
                <ScoreCircle score={analysis.skillGap.atsScore} size={110} label="ATS Score" />

                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><FiCheckCircle /> Matching Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
                    {analysis.skillGap.matchingSkills.length > 0 ? analysis.skillGap.matchingSkills.map((s, i) => <span key={i} className="tag tag-success">{s}</span>) : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>None found</span>}
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-danger)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><FiXCircle /> Missing Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
                    {analysis.skillGap.missingSkills.length > 0 ? analysis.skillGap.missingSkills.map((s, i) => <span key={i} className="tag tag-danger">{s}</span>) : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Perfect match!</span>}
                  </div>

                  {/* Breakdown */}
                  <div className="divider" />
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Score Breakdown</div>
                  {Object.entries(analysis.skillGap.breakdown || {}).map(([key, val]) => (
                    <div key={key} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{val}%</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill purple" style={{ width: `${val}%` }} /></div>
                    </div>
                  ))}

                  {analysis.skillGap.suggestions?.length > 0 && (
                    <>
                      <div className="divider" />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 10 }}><FiZap /> Improvement Suggestions</div>
                      {analysis.skillGap.suggestions.map((s, i) => (
                        <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid var(--accent-primary)' }}>{s}</p>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {!analysis.skillGap && (
              <div className="card-flat" style={{ textAlign: 'center', padding: '24px' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Add skills to your profile to see how you match against this job
                </p>
                <a href="/profile" className="btn btn-secondary btn-sm" style={{ marginTop: 10 }}>Go to Profile</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JDAnalyzer;
