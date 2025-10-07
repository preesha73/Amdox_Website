import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../api';
import { useAuth } from '../context/AuthContext';

const TYPES = ['All Types','Full-time','Part-time','Contract','Freelance','Internship'];

export default function Home() {
  const { token } = useAuth();
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('All Types');
  const [minSalary, setMinSalary] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyFor, setApplyFor] = useState(null); // job id
  const [applyForm, setApplyForm] = useState({ coverLetter: '', resumeUrl: '' });
  const [applyMsg, setApplyMsg] = useState(null);

  function fetchJobs() {
    setLoading(true);
    const params = {
      ...(q && { q }),
      ...(location && { location }),
      ...(type !== 'All Types' && { type }),
      ...(minSalary && { minSalary })
    };
    api.get('/api/jobs', { params }).then(res => setJobs(res.data.jobs)).finally(()=> setLoading(false));
  }

  useEffect(() => { fetchJobs(); }, []);

  // Refresh jobs when returning from Employer page or after a short interval
  useEffect(() => {
    const interval = setInterval(fetchJobs, 15000);
    return () => clearInterval(interval);
  }, []);

  async function submitApplication(e, jobId) {
    e.preventDefault();
    if (!token) {
      setApplyMsg('Please log in as Job Seeker to apply');
      return;
    }
    setApplyMsg(null);
    setAuthToken(token);
    try {
      await api.post(`/api/jobs/${jobId}/apply`, applyForm);
      setApplyMsg('Application submitted');
      setApplyForm({ coverLetter: '', resumeUrl: '' });
      setApplyFor(null);
    } catch (err) {
      setApplyMsg(err.response?.data?.error || 'Error applying');
    }
  }

  return (
    <div className="page-container profile-page">
      <h2 style={{marginTop:0}}>Find Your Dream Job</h2>
      <div className="card" style={{marginBottom:'1rem'}}>
        <div className="grid-2">
          <div className="form-group">
            <label>Job title or company</label>
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="e.g. Frontend Developer" />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="City, State/Country" />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={type} onChange={(e)=>setType(e.target.value)}>
              {TYPES.map(t=> <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Min Salary ($)</label>
            <input type="number" value={minSalary} onChange={(e)=>setMinSalary(e.target.value)} placeholder="Any" />
          </div>
        </div>
        <div style={{display:'flex',gap:'.5rem',marginTop:'.5rem'}}>
          <button className="btn" style={{width:'auto'}} onClick={fetchJobs}>Apply Filters</button>
          <button className="btn btn-secondary" style={{width:'auto'}} onClick={()=>{ setQ(''); setLocation(''); setType('All Types'); setMinSalary(''); setTimeout(fetchJobs,0); }}>Clear Filters</button>
        </div>
      </div>

      {loading ? (
        <div className="card">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="card">No jobs found.</div>
      ) : (
        <div style={{display:'grid', gap:'1rem'}}>
          {jobs.map(job => (
            <div key={job._id} className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <h3 style={{margin:'0 0 .25rem 0'}}>{job.title}</h3>
                  <div style={{color:'#666'}}>{job.company} • {job.location}</div>
                </div>
                <div className="role-badge">{job.type}</div>
              </div>
              {job.tags?.length ? (
                <div style={{marginTop:'.5rem',display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
                  {job.tags.map((t,i)=> <span key={i} className="role-badge" style={{background:'rgba(0,0,0,0.06)', color:'#333'}}>{t}</span>)}
                </div>
              ) : null}
              {job.salaryMin || job.salaryMax ? (
                <div style={{marginTop:'.5rem', color:'#444'}}>
                  ${job.salaryMin?.toLocaleString?.() || '—'} - ${job.salaryMax?.toLocaleString?.() || '—'}
                </div>
              ) : null}
              <div style={{marginTop:'.75rem'}}>
                <button className="btn" style={{width:'auto'}} onClick={()=>{ setApplyFor(applyFor === job._id ? null : job._id); setApplyMsg(null); }}>Apply Now</button>
              </div>
              {applyFor === job._id && (
                <form onSubmit={(e)=>submitApplication(e, job._id)} style={{marginTop:'.75rem', borderTop:'1px solid var(--border-color)', paddingTop:'.75rem'}}>
                  {applyMsg && <p className="message" style={{marginTop:0}}>{applyMsg}</p>}
                  <div className="grid-2">
                    <div className="form-group full">
                      <label>Resume URL</label>
                      <input value={applyForm.resumeUrl} onChange={(e)=>setApplyForm({ ...applyForm, resumeUrl: e.target.value })} placeholder="Link to your resume" required />
                    </div>
                    <div className="form-group full">
                      <label>Cover Letter</label>
                      <textarea rows="3" value={applyForm.coverLetter} onChange={(e)=>setApplyForm({ ...applyForm, coverLetter: e.target.value })} placeholder="Brief intro" />
                    </div>
                  </div>
                  <button className="btn" style={{width:'auto'}}>Submit Application</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


