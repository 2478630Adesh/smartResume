import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import SkillsInput from '../Layout/SkillsInput';
import toast from 'react-hot-toast';
import { FiSend, FiArrowLeft } from 'react-icons/fi';

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', company: '', description: '', requirements: '', requiredSkills: [],
    experienceLevel: 'entry', experienceYears: 0, location: '', salary: '',
    jobType: 'full-time', deadline: '', tags: []
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.description) return toast.error('Please fill required fields');
    setLoading(true);
    try {
      await api.post('/jobs', form);
      toast.success('Job posted successfully!');
      navigate('/hr/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post job'); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fadeInUp">
      <button className="btn btn-ghost" onClick={() => navigate('/hr/dashboard')} style={{ marginBottom: 16 }}><FiArrowLeft /> Back to Dashboard</button>
      <div className="page-header"><h1>Post New Job</h1><p>Create a new job opening for candidates to apply</p></div>

      <div className="card-flat" style={{ maxWidth: 800 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="e.g., Full Stack Developer" required />
            </div>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input className="form-input" name="company" value={form.company} onChange={handleChange} placeholder="e.g., TechCorp" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job Description *</label>
            <textarea className="form-textarea" name="description" rows={6} value={form.description} onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what the ideal candidate looks like..." required />
          </div>

          <div className="form-group">
            <label className="form-label">Requirements</label>
            <textarea className="form-textarea" name="requirements" rows={4} value={form.requirements} onChange={handleChange}
              placeholder="List qualifications, education, and experience requirements..." />
          </div>

          <div className="form-group">
            <label className="form-label">Required Skills</label>
            <SkillsInput skills={form.requiredSkills} onChange={(skills) => setForm({...form, requiredSkills: skills})} placeholder="Type a skill and press Enter..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select className="form-select" name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead / Manager</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Min. Experience (Years)</label>
              <input className="form-input" type="number" name="experienceYears" value={form.experienceYears} onChange={handleChange} min={0} max={20} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select className="form-select" name="jobType" value={form.jobType} onChange={handleChange}>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="e.g., Hyderabad, India" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Salary Range</label>
              <input className="form-input" name="salary" value={form.salary} onChange={handleChange} placeholder="e.g., ₹6-10 LPA" />
            </div>
            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input className="form-input" type="date" name="deadline" value={form.deadline} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <SkillsInput skills={form.tags} onChange={(tags) => setForm({...form, tags})} placeholder="Add tags like 'startup', 'fintech'..." />
          </div>

          <div className="divider" />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/hr/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-success btn-lg" disabled={loading}>
              <FiSend /> {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
