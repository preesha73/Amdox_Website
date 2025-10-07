import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Applications() {
  const { token } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    setAuthToken(token);
    api.get('/api/my-applications').then(res => setApps(res.data.applications)).finally(()=> setLoading(false));
  }, [token]);

  if (loading) return <div className="page-container profile-page">Loading...</div>;

  return (
    <div className="page-container profile-page">
      <h2 style={{marginTop:0}}>My Applications</h2>
      {apps.length === 0 ? (
        <div className="card">No applications yet. Apply to a job from Home.</div>
      ) : (
        <div style={{display:'grid', gap:'.75rem'}}>
          {apps.map(app => (
            <div key={app._id} className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontWeight:600}}>{app.job?.title}</div>
                <div style={{color:'#666'}}>{app.job?.company} • {app.job?.location}</div>
                <div style={{marginTop:'.25rem', color:'#333'}}>Status: <span className="role-badge" style={{background:'rgba(0,0,0,0.06)', color:'#333'}}>{app.status}</span></div>
              </div>
              <div style={{color:'#666'}}>{new Date(app.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


