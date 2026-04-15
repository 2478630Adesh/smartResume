import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiFile, FiTrash2, FiClock, FiTag } from 'react-icons/fi';
import { formatDate } from '../../utils/helpers';

const ResumeUpload = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    try {
      const { data } = await api.get('/resume');
      setResumes(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) return toast.error('Only PDF and DOCX files allowed');
    if (file.size > 10 * 1024 * 1024) return toast.error('File size must be under 10MB');

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      await api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resume uploaded!');
      fetchResumes();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await api.delete(`/resume/${id}`);
      toast.success('Resume deleted');
      setResumes(resumes.filter(r => r._id !== id));
    } catch (err) { toast.error('Delete failed'); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0]);
  };

  return (
    <div className="animate-fadeInUp">
      <div className="page-header"><h1>Resume Manager</h1><p>Upload and manage your resumes for job applications</p></div>

      {/* Upload Area */}
      <div
        className="card-flat"
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          textAlign: 'center', padding: '48px 24px', cursor: 'pointer',
          border: dragActive ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-color)',
          background: dragActive ? 'rgba(99,102,241,0.05)' : 'var(--bg-card)',
          transition: 'all 0.2s ease', marginBottom: 28
        }}
      >
        <FiUploadCloud size={40} style={{ color: dragActive ? 'var(--accent-primary)' : 'var(--text-muted)', marginBottom: 12 }} />
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
          {uploading ? 'Uploading...' : 'Drag & drop your resume here'}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>or click to browse — PDF or DOCX, max 10MB</p>
        <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
          onChange={e => handleUpload(e.target.files[0])} />
      </div>

      {/* Resume List */}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Uploaded Resumes ({resumes.length})</h3>
      {loading ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : resumes.length === 0 ? (
        <div className="empty-state"><FiFile size={40} /><h3>No Resumes Uploaded</h3><p>Upload your first resume to get started</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {resumes.map(resume => (
            <div key={resume._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiFile style={{ color: 'var(--accent-primary-light)', fontSize: 20 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{resume.originalName}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock /> {formatDate(resume.uploadDate)}</span>
                    {resume.parsedSkills?.length > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiTag /> {resume.parsedSkills.length} skills detected</span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {resume.parsedSkills?.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 300 }}>
                    {resume.parsedSkills.slice(0, 4).map((s, i) => <span key={i} className="tag tag-primary">{s}</span>)}
                    {resume.parsedSkills.length > 4 && <span className="tag tag-info">+{resume.parsedSkills.length - 4}</span>}
                  </div>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(resume._id)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
