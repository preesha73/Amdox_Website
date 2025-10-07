import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../api';
import { useAuth } from '../context/AuthContext';

const TYPES = ['Full-time','Part-time','Contract','Freelance','Internship'];

export default function Employer() {
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ title:'', company:'', location:'', type:'Full-time', salaryMin:'', salaryMax:'', tags:'', description:'' });

  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    api.get('/api/my-jobs').then(res => setJobs(res.data.jobs));
  }, [token]);

  async function createJob(e) {
    e.preventDefault();
    setMsg(null);
    try {
      const payload = {
        title: form.title,
        company: form.company,
        location: form.location,
        type: form.type,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [],
        description: form.description,
      };
      const res = await api.post('/api/jobs', payload);
      setJobs([res.data.job, ...jobs]);
      setForm({ title:'', company:'', location:'', type:'Full-time', salaryMin:'', salaryMax:'', tags:'', description:'' });
      setMsg('Job created');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error creating job');
    }
  }

  if (user && user.role !== 'Employer') {
    return (
      <div className="page-container profile-page">
        <div className="card">This page is for Employers only.</div>
      </div>
    );
  }

  return (
    <div className="page-container profile-page">
      <h2 style={{marginTop:0}}>Employer Dashboard</h2>

      <div className="card" style={{marginBottom:'1rem'}}>
        <h3 style={{margin:'0 0 .75rem 0'}}>Post a Job</h3>
        {msg && <p className="message">{msg}</p>}
        <form onSubmit={createJob}>
          <div className="grid-2">
            <div className="form-group">
              <label>Job title</label>
              <input value={form.title} onChange={(e)=>setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input value={form.company} onChange={(e)=>setForm({ ...form, company: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input value={form.location} onChange={(e)=>setForm({ ...form, location: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={(e)=>setForm({ ...form, type: e.target.value })}>
                {TYPES.map(t=> <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Salary Min ($)</label>
              <input type="number" value={form.salaryMin} onChange={(e)=>setForm({ ...form, salaryMin: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Salary Max ($)</label>
              <input type="number" value={form.salaryMax} onChange={(e)=>setForm({ ...form, salaryMax: e.target.value })} />
            </div>
            <div className="form-group full">
              <label>Tags (comma separated)</label>
              <input value={form.tags} onChange={(e)=>setForm({ ...form, tags: e.target.value })} placeholder="React, TypeScript, CSS" />
            </div>
            <div className="form-group full">
              <label>Description</label>
              <textarea rows="4" value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <button className="btn" style={{width:'auto'}}>Create Job</button>
        </form>
      </div>

      <div className="card">
        <h3 style={{margin:'0 0 .75rem 0'}}>My Jobs</h3>
        {jobs.length === 0 ? (
          <div>No jobs posted yet.</div>
        ) : (
          <div style={{display:'grid', gap:'.75rem'}}>
            {jobs.map(job => (
              <JobRow key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobRow({ job }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setAuthToken(token);
    api.get(`/api/jobs/${job._id}/applications`).then(res => setApps(res.data.applications)).finally(()=> setLoading(false));
  }, [open, token, job._id]);

  return (
    <div style={{border:'1px solid var(--border-color)', borderRadius:8}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:12}}>
        <div>
          <div style={{fontWeight:600}}>{job.title}</div>
          <div style={{color:'#666'}}>{job.company} • {job.location}</div>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <div className="role-badge">{job.type}</div>
          <button className="btn btn-secondary" style={{width:'auto'}} onClick={()=> setOpen(!open)}>{open ? 'Hide Applicants' : 'View Applicants'}</button>
        </div>
      </div>
      {open && (
        <div style={{borderTop:'1px solid var(--border-color)', padding:12}}>
          {loading ? 'Loading...' : apps.length === 0 ? 'No applicants yet.' : (
            <div style={{display:'grid', gap:8}}>
              {apps.map(a => (
                <ApplicantRow key={a._id} app={a} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ApplicantRow({ app }) {
  const { token } = useAuth();
  const [status, setStatus] = useState(app.status);
  const [saving, setSaving] = useState(false);

  async function updateStatus(newStatus) {
    if (newStatus === status) return;
    setSaving(true);
    setAuthToken(token);
    try {
      await api.put(`/api/applications/${app._id}/status`, { status: newStatus });
      setStatus(newStatus);
    } catch (err) {
      // ignore display-only error
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid var(--border-color)', borderRadius:8, padding:8}}>
      <div>
        <div style={{fontWeight:600}}>{app.applicant?.name || 'Applicant'}</div>
        <div style={{color:'#666'}}>{app.applicant?.email}</div>
        {app.resumeUrl && <a href={app.resumeUrl} target="_blank" rel="noreferrer" style={{fontSize:12}}>Resume</a>}
      </div>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <select value={status} onChange={(e)=>updateStatus(e.target.value)} disabled={saving}>
          {['Submitted','Viewed','Interview','Rejected','Offer'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="role-badge" style={{background:'rgba(0,0,0,0.06)', color:'#333'}}>{status}</span>
      </div>
    </div>
  );
}


