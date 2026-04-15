import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiDownload, FiEye, FiLayout } from 'react-icons/fi';

const ResumeBuilder = () => {
  const [template, setTemplate] = useState('modern');
  const [resumeHTML, setResumeHTML] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => { generatePreview(); }, [template]);

  const generatePreview = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/resume/generate', { template });
      setResumeHTML(data.html);
      setProfileData(data.user);
    } catch (err) { toast.error('Failed to generate resume. Please complete your profile first.'); }
    finally { setLoading(false); }
  };

  const downloadPDF = () => {
    if (!resumeHTML) return toast.error('Generate a preview first');
    // Open resume HTML in new window for print/PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(resumeHTML);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const templates = [
    { id: 'modern', name: 'Modern', desc: 'Clean, professional layout with blue accent', color: '#2b6cb0' },
    { id: 'elegant', name: 'Elegant', desc: 'Stylish design with bold red accent', color: '#e94560' },
  ];

  return (
    <div className="animate-fadeInUp">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div><h1>Resume Builder</h1><p>Auto-generate your resume from profile data</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={generatePreview} disabled={loading}><FiEye /> {loading ? 'Generating...' : 'Refresh Preview'}</button>
          <button className="btn btn-primary" onClick={downloadPDF} disabled={!resumeHTML}><FiDownload /> Download PDF</button>
        </div>
      </div>

      {/* Template Selection */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Choose Template</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {templates.map(t => (
            <button key={t.id}
              onClick={() => setTemplate(t.id)}
              style={{
                padding: '16px 24px', borderRadius: 'var(--radius-md)',
                border: template === t.id ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
                background: template === t.id ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease', minWidth: 200
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: t.color }} />
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{t.name}</span>
                {template === t.id && <FiLayout style={{ color: 'var(--accent-primary)', marginLeft: 'auto' }} />}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Completeness Warning */}
      {profileData && (!profileData.skills?.length || !profileData.education?.length) && (
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20,
          fontSize: 13, color: 'var(--accent-tertiary)'
        }}>
          ⚠️ Your profile is incomplete. Add skills, education, and experience for a better resume.
          <a href="/profile" style={{ marginLeft: 8, fontWeight: 600 }}>Complete Profile →</a>
        </div>
      )}

      {/* Resume Preview */}
      {loading ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : resumeHTML ? (
        <div className="resume-preview-container">
          <iframe
            ref={iframeRef}
            srcDoc={resumeHTML}
            title="Resume Preview"
            style={{ width: '100%', height: '800px', border: 'none', borderRadius: 'var(--radius-md)' }}
          />
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <FiLayout size={48} />
          <h3>No Preview Available</h3>
          <p>Complete your profile and click "Refresh Preview" to generate your resume</p>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
