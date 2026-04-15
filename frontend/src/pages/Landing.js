import React from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiSearch, FiBarChart2, FiZap, FiShield, FiUsers, FiTarget, FiTrendingUp } from 'react-icons/fi';

const Landing = () => {
  const features = [
    { icon: <FiFileText />, title: 'Smart Resume Builder', desc: 'Auto-generate polished resumes from your profile data with multiple templates. Download as PDF instantly.', color: 'purple' },
    { icon: <FiBarChart2 />, title: 'ATS Score Analysis', desc: 'Get your resume scored against industry ATS systems. See keyword matches, structure analysis, and detailed breakdown.', color: 'green' },
    { icon: <FiSearch />, title: 'JD Analyzer', desc: 'Paste any job description to extract required skills, experience levels, and see how your profile matches up.', color: 'amber' },
    { icon: <FiTarget />, title: 'Skill Gap Detection', desc: 'Compare your skills against job requirements. Get actionable suggestions on what to learn next.', color: 'blue' },
    { icon: <FiUsers />, title: 'HR Dashboard', desc: 'Recruiters can post jobs, view applicants, filter by ATS score, and manage the entire hiring pipeline.', color: 'purple' },
    { icon: <FiTrendingUp />, title: 'Candidate Leaderboard', desc: 'Applicants are ranked by ATS score and skill match percentage, giving recruiters instant visibility.', color: 'green' },
    { icon: <FiZap />, title: 'One-Click Apply', desc: 'Apply to jobs with your uploaded or generated resume. Track all applications from your dashboard.', color: 'amber' },
    { icon: <FiShield />, title: 'Secure & Private', desc: 'JWT authentication, bcrypt encryption, and role-based access control keep your data safe.', color: 'blue' },
  ];

  return (
    <div>
      <section className="landing-hero">
        <div className="hero-content animate-fadeInUp">
          <div className="hero-badge">✨ AI-Powered Career Tools</div>
          <h1 className="hero-title">
            Build Resumes That <span>Beat the ATS</span>
          </h1>
          <p className="hero-subtitle">
            Create professional resumes, analyze job descriptions, get ATS scores, and
            apply to jobs — all in one powerful platform built for modern job seekers and recruiters.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Building Free →
            </Link>
            <Link to="/register?role=hr" className="btn btn-secondary btn-lg">
              I'm a Recruiter
            </Link>
          </div>
          <div style={{ marginTop: 40, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['📄', 'Resume Builder'], ['📊', 'ATS Scoring'], ['🎯', 'Skill Gap'], ['👥', 'HR Tools']].map(([emoji, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{emoji}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--bg-secondary)', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
            Everything You Need to <span style={{ color: 'var(--accent-primary-light)' }}>Land Your Dream Job</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            From building your resume to tracking applications, we've got every step covered.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`feature-icon stat-icon ${feature.color}`}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Ready to Get Started?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
          Join thousands of job seekers who've improved their chances with ResumeIQ.
        </p>
        <Link to="/register" className="btn btn-success btn-lg">
          Create Your Free Account →
        </Link>
      </section>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        © 2026 ResumeIQ — Smart Resume Builder & Analyzer. Built with MERN Stack.
      </footer>
    </div>
  );
};

export default Landing;
