import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { token, user: authUser } = useAuth();
  const [tab, setTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', profile: { phone: '', location: '', bio: '', avatarUrl: '' } });

  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    api.get('/api/profile')
      .then((res) => {
        setUser(res.data.user);
        const u = res.data.user;
        setForm({
          name: u?.name || '',
          profile: {
            phone: u?.profile?.phone || '',
            location: u?.profile?.location || '',
            bio: u?.profile?.bio || '',
            avatarUrl: u?.profile?.avatarUrl || ''
          }
        });
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.put('/api/profile', form);
      setUser(res.data.user);
      setMsg('Saved');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error saving');
    } finally {
      setSaving(false);
    }
  }

  

  if (loading) return <div className="page-container profile-page">Loading...</div>;

  return (
    <div className="page-container profile-page">
      <div className="profile-header">
        <div className="avatar-circle">{(user?.name || 'U').charAt(0).toUpperCase()}</div>
        <div className="profile-head-text">
          <h2>{user?.name}</h2>
          <div className="role-badge">{user?.role}</div>
          <div className="email-line">{user?.email}</div>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'details' ? 'tab active' : 'tab'} onClick={() => setTab('details')}>Profile Details</button>
        <button className={tab === 'activity' ? 'tab active' : 'tab'} onClick={() => setTab('activity')}>Activity</button>
        <button className={tab === 'settings' ? 'tab active' : 'tab'} onClick={() => setTab('settings')}>Settings</button>
      </div>

      {tab === 'details' && (
        <form className="card" onSubmit={save}>
          {msg && <p className="message">{msg}</p>}
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input value={form.profile.phone} onChange={(e)=>setForm({ ...form, profile: { ...form.profile, phone: e.target.value } })} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input value={form.profile.location} onChange={(e)=>setForm({ ...form, profile: { ...form.profile, location: e.target.value } })} />
            </div>
            <div className="form-group">
              <label>Avatar URL</label>
              <input value={form.profile.avatarUrl} onChange={(e)=>setForm({ ...form, profile: { ...form.profile, avatarUrl: e.target.value } })} />
            </div>
            <div className="form-group full">
              <label>Bio</label>
              <textarea rows="4" value={form.profile.bio} onChange={(e)=>setForm({ ...form, profile: { ...form.profile, bio: e.target.value } })} />
            </div>
          </div>
          <button className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      )}

      {tab === 'activity' && (
        <ActivitySection role={authUser?.role} />
      )}

      {tab === 'settings' && (
        <SettingsSection />)
      }
    </div>
  );
}

function ActivitySection({ role }) {
  const [items, setItems] = useState([]);
  const { token } = useAuth();
  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    if (role === 'Employer') {
      api.get('/api/my-jobs').then(res => setItems(res.data.jobs || []));
    } else {
      api.get('/api/my-applications').then(res => setItems(res.data.applications || []));
    }
  }, [token, role]);

  return (
    <div className="card">
      {role === 'Employer' ? (
        <div style={{display:'grid', gap:'.75rem'}}>
          {items.length === 0 ? 'No jobs posted yet.' : items.map(j => (
            <div key={j._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:600}}>{j.title}</div>
                <div style={{color:'#666'}}>{j.company} • {j.location}</div>
              </div>
              <div className="role-badge">{j.type}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{display:'grid', gap:'.75rem'}}>
          {items.length === 0 ? 'No applications yet.' : items.map(a => (
            <div key={a._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:600}}>{a.job?.title}</div>
                <div style={{color:'#666'}}>{a.job?.company} • {a.job?.location}</div>
              </div>
              <div className="role-badge" style={{background:'rgba(0,0,0,0.06)', color:'#333'}}>{a.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsSection() {
  const { token } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  async function changePassword(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setAuthToken(token);
    try {
      await api.put('/api/change-password', form);
      setMsg('Password updated');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error updating password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={changePassword}>
      {msg && <p className="message">{msg}</p>}
      <div className="grid-2">
        <div className="form-group">
          <label>Current Password</label>
          <input type="password" value={form.currentPassword} onChange={(e)=>setForm({ ...form, currentPassword: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input type="password" value={form.newPassword} onChange={(e)=>setForm({ ...form, newPassword: e.target.value })} required />
        </div>
      </div>
      <button className="btn" disabled={saving} style={{width:'auto'}}>{saving ? 'Saving...' : 'Change Password'}</button>
    </form>
  );
}


