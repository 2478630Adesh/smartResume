import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import SkillsInput from '../Layout/SkillsInput';
import toast from 'react-hot-toast';
import { FiSave, FiPlus, FiTrash2, FiUser, FiBook, FiCode, FiBriefcase, FiAward, FiLink } from 'react-icons/fi';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '', phone: '', location: '', bio: '',
    skills: [], education: [], projects: [], experience: [], certifications: [],
    socialLinks: { github: '', linkedin: '', portfolio: '', twitter: '' }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setProfile({
          name: data.name || '', phone: data.phone || '', location: data.location || '', bio: data.bio || '',
          skills: data.skills || [], education: data.education || [], projects: data.projects || [],
          experience: data.experience || [], certifications: data.certifications || [],
          socialLinks: data.socialLinks || { github: '', linkedin: '', portfolio: '', twitter: '' }
        });
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      updateUser(data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const addItem = (field, template) => setProfile({ ...profile, [field]: [...profile[field], template] });
  const removeItem = (field, index) => setProfile({ ...profile, [field]: profile[field].filter((_, i) => i !== index) });
  const updateItem = (field, index, key, value) => {
    const items = [...profile[field]];
    items[index] = { ...items[index], [key]: value };
    setProfile({ ...profile, [field]: items });
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <FiUser /> },
    { id: 'education', label: 'Education', icon: <FiBook /> },
    { id: 'skills', label: 'Skills', icon: <FiCode /> },
    { id: 'experience', label: 'Experience', icon: <FiBriefcase /> },
    { id: 'projects', label: 'Projects', icon: <FiCode /> },
    { id: 'certifications', label: 'Certs', icon: <FiAward /> },
    { id: 'links', label: 'Links', icon: <FiLink /> },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div><h1>My Profile</h1><p>Manage your profile data — this powers your resume builder</p></div>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}><FiSave /> {loading ? 'Saving...' : 'Save Changes'}</button>
      </div>
      <div className="tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.icon}<span style={{ marginLeft: 6 }}>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="card-flat animate-fadeIn">
        {activeTab === 'personal' && (
          <div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+91 9876543210" /></div>
            </div>
            <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} placeholder="Hyderabad, India" /></div>
            <div className="form-group"><label className="form-label">Professional Summary</label><textarea className="form-textarea" rows={4} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Brief professional background..." /></div>
          </div>
        )}
        {activeTab === 'skills' && (
          <div>
            <label className="form-label">Your Skills</label>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>Add skills used for ATS matching & resume generation. Press Enter after each.</p>
            <SkillsInput skills={profile.skills} onChange={(skills) => setProfile({...profile, skills})} />
            {profile.skills.length > 0 && <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>{profile.skills.length} skills added</p>}
          </div>
        )}
        {activeTab === 'education' && (
          <div>
            {profile.education.map((edu, i) => (
              <div key={i} className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><h4>Education #{i + 1}</h4><button className="btn btn-danger btn-sm" onClick={() => removeItem('education', i)}><FiTrash2 /></button></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Institution</label><input className="form-input" value={edu.institution || ''} onChange={e => updateItem('education', i, 'institution', e.target.value)} /></div><div className="form-group"><label className="form-label">Degree</label><input className="form-input" value={edu.degree || ''} onChange={e => updateItem('education', i, 'degree', e.target.value)} placeholder="B.Tech" /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Field</label><input className="form-input" value={edu.field || ''} onChange={e => updateItem('education', i, 'field', e.target.value)} /></div><div className="form-group"><label className="form-label">Grade</label><input className="form-input" value={edu.grade || ''} onChange={e => updateItem('education', i, 'grade', e.target.value)} /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Start</label><input className="form-input" type="month" value={edu.startDate || ''} onChange={e => updateItem('education', i, 'startDate', e.target.value)} /></div><div className="form-group"><label className="form-label">End</label><input className="form-input" type="month" value={edu.endDate || ''} onChange={e => updateItem('education', i, 'endDate', e.target.value)} /></div></div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('education', { institution: '', degree: '', field: '', grade: '', startDate: '', endDate: '' })}><FiPlus /> Add Education</button>
          </div>
        )}
        {activeTab === 'experience' && (
          <div>
            {profile.experience.map((exp, i) => (
              <div key={i} className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><h4>Experience #{i + 1}</h4><button className="btn btn-danger btn-sm" onClick={() => removeItem('experience', i)}><FiTrash2 /></button></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Company</label><input className="form-input" value={exp.company || ''} onChange={e => updateItem('experience', i, 'company', e.target.value)} /></div><div className="form-group"><label className="form-label">Position</label><input className="form-input" value={exp.position || ''} onChange={e => updateItem('experience', i, 'position', e.target.value)} /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Start</label><input className="form-input" type="month" value={exp.startDate || ''} onChange={e => updateItem('experience', i, 'startDate', e.target.value)} /></div><div className="form-group"><label className="form-label">End</label><input className="form-input" type="month" value={exp.endDate || ''} onChange={e => updateItem('experience', i, 'endDate', e.target.value)} disabled={exp.current} /></div></div>
                <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}><input type="checkbox" checked={exp.current || false} onChange={e => updateItem('experience', i, 'current', e.target.checked)} /> Currently working here</label></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={exp.description || ''} onChange={e => updateItem('experience', i, 'description', e.target.value)} /></div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('experience', { company: '', position: '', startDate: '', endDate: '', current: false, description: '' })}><FiPlus /> Add Experience</button>
          </div>
        )}
        {activeTab === 'projects' && (
          <div>
            {profile.projects.map((proj, i) => (
              <div key={i} className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><h4>Project #{i + 1}</h4><button className="btn btn-danger btn-sm" onClick={() => removeItem('projects', i)}><FiTrash2 /></button></div>
                <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={proj.title || ''} onChange={e => updateItem('projects', i, 'title', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={proj.description || ''} onChange={e => updateItem('projects', i, 'description', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Technologies</label><SkillsInput skills={proj.technologies || []} onChange={(techs) => updateItem('projects', i, 'technologies', techs)} placeholder="React, Node.js..." /></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Live Link</label><input className="form-input" value={proj.link || ''} onChange={e => updateItem('projects', i, 'link', e.target.value)} /></div><div className="form-group"><label className="form-label">GitHub</label><input className="form-input" value={proj.github || ''} onChange={e => updateItem('projects', i, 'github', e.target.value)} /></div></div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('projects', { title: '', description: '', technologies: [], link: '', github: '' })}><FiPlus /> Add Project</button>
          </div>
        )}
        {activeTab === 'certifications' && (
          <div>
            {profile.certifications.map((cert, i) => (
              <div key={i} className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><h4>Certification #{i + 1}</h4><button className="btn btn-danger btn-sm" onClick={() => removeItem('certifications', i)}><FiTrash2 /></button></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Name</label><input className="form-input" value={cert.name || ''} onChange={e => updateItem('certifications', i, 'name', e.target.value)} /></div><div className="form-group"><label className="form-label">Issuer</label><input className="form-input" value={cert.issuer || ''} onChange={e => updateItem('certifications', i, 'issuer', e.target.value)} /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Date</label><input className="form-input" type="month" value={cert.date || ''} onChange={e => updateItem('certifications', i, 'date', e.target.value)} /></div><div className="form-group"><label className="form-label">URL</label><input className="form-input" value={cert.url || ''} onChange={e => updateItem('certifications', i, 'url', e.target.value)} /></div></div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('certifications', { name: '', issuer: '', date: '', url: '' })}><FiPlus /> Add Certification</button>
          </div>
        )}
        {activeTab === 'links' && (
          <div>
            {[['github', 'GitHub', 'https://github.com/username'], ['linkedin', 'LinkedIn', 'https://linkedin.com/in/username'], ['portfolio', 'Portfolio', 'https://yoursite.com'], ['twitter', 'Twitter / X', 'https://x.com/username']].map(([key, label, ph]) => (
              <div className="form-group" key={key}><label className="form-label">{label}</label><input className="form-input" value={profile.socialLinks[key] || ''} onChange={e => setProfile({...profile, socialLinks: {...profile.socialLinks, [key]: e.target.value}})} placeholder={ph} /></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
