import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import { artistAPI, connectionsAPI, opportunitiesAPI, applicationsAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

// ─── Portfolio Page ───────────────────────────────────────────────
export const PortfolioPage = () => {
  const [profile, setProfile] = useState(null);
  const [media, setMedia] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [activeTab, setActiveTab] = useState('bio');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      artistAPI.getProfile(),
      artistAPI.getMedia(),
      artistAPI.getExperiences(),
    ]).then(([p, m, e]) => {
      setProfile(p.data.data);
      setMedia(m.data.data || []);
      setExperiences(e.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAddMedia = async (e, type) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file); fd.append('media_type', type); fd.append('title', file.name);
    try { const r = await artistAPI.uploadMedia(fd); setMedia(m => [...m, r.data.data]); toast.success('Uploaded!'); }
    catch { toast.error('Upload failed'); }
  };

  const handleDeleteMedia = async (id) => {
    try { await artistAPI.deleteMedia(id); setMedia(m => m.filter(x => x.id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const name = profile ? `${profile.first_name} ${profile.last_name}` : '';

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '960px', width: '100%' }}>
        {/* Profile Header */}
        <div className="section-card" style={{ marginBottom: '20px', overflow: 'visible' }}>
          <div style={{ height: '160px', background: 'linear-gradient(135deg, var(--dark) 0%, var(--dark-3) 100%)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: '-40px', left: '28px', display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
              <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'var(--gold)', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: 'white', overflow: 'hidden' }}>
                {profile?.avatar ? <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || '?'}
              </div>
            </div>
            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
              <label className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const fd = new FormData(); fd.append('avatar', e.target.files[0]); artistAPI.uploadAvatar(fd).then(r => setProfile(p => ({ ...p, avatar: r.data.data?.avatar }))).catch(() => toast.error('Upload failed')); }} />
                📷 Edit Photo
              </label>
            </div>
          </div>
          <div style={{ padding: '52px 28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700', color: 'var(--dark)' }}>{name || 'Your Name'}</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>{profile?.job_title || 'Artist'} · {profile?.city}{profile?.country ? `, ${profile.country}` : ''}</p>
                {profile?.instruments?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {profile.instruments.map(inst => <span key={inst} className="badge badge-gold">{inst}</span>)}
                  </div>
                )}
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => artistAPI.getShareLink().then(r => {
                const apiUrl = r.data?.data?.share_url || '';
                const match = apiUrl.match(/\/public\/([^/?#]+)\/?/);
                const token = match?.[1];
                const url = token ? `${window.location.origin}/portfolio/public/${token}/` : apiUrl;
                navigator.clipboard.writeText(url);
                toast.success('Portfolio link copied!');
              }).catch(() => toast.error('Failed'))}>
                🔗 Share Portfolio
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', padding: '0 12px', borderTop: '1px solid var(--border)', overflowX: 'auto' }}>
            {['bio','career','media','connections'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '14px 20px', fontSize: '14px', fontWeight: activeTab===tab?'600':'400', color: activeTab===tab?'var(--gold)':'var(--text-muted)', borderBottom: `2px solid ${activeTab===tab?'var(--gold)':'transparent'}`, background: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', textTransform: 'capitalize', transition: 'all var(--transition)' }}>
                {tab === 'career' ? 'Career and Education' : tab.charAt(0).toUpperCase()+tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'bio' && (
          <div className="section-card">
            <div className="section-card-header"><span className="section-card-title">Bio</span></div>
            <div className="section-card-body">
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>{profile?.bio || 'No bio added yet. Click to add one.'}</p>
              {profile?.special_skills?.length > 0 && <>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '20px', marginBottom: '10px' }}>Special Skills</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {profile.special_skills.map(s => <span key={s} className="badge badge-gold">{s.replace(/_/g,' ')}</span>)}
                </div>
              </>}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-title">Media</span>
              <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                <input type="file" accept="*/*" style={{ display: 'none' }} onChange={e => handleAddMedia(e, 'photo')} />
                + Add Media
              </label>
            </div>
            <div className="section-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '14px' }}>
                {media.map(m => (
                  <div key={m.id} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', aspectRatio: '1', background: 'var(--grey-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {m.media_type === 'photo' ? <img src={m.file} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '32px' }}>{m.media_type === 'video' ? '🎬' : m.media_type === 'audio' ? '🎵' : '📁'}</span>}
                    <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '11px' }}>{m.title || m.media_type}</div>
                    <button onClick={() => handleDeleteMedia(m.id)} style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                  </div>
                ))}
                {media.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>No media uploaded yet. Add photos, videos, and audio to showcase your work.</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'career' && (
          <div className="section-card">
            <div className="section-card-header"><span className="section-card-title">Career and Education</span></div>
            <div className="section-card-body">
              {experiences.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No experience added yet.</p> : (
                experiences.map(exp => (
                  <div key={exp.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{exp.experience_type === 'career' ? '🎭' : '🎓'}</div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--dark)' }}>{exp.role_title || exp.degree_or_program}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{exp.organization || exp.field_of_study} · {exp.start_year}{exp.is_current ? ' – Present' : exp.end_year ? ` – ${exp.end_year}` : ''}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};



export default PortfolioPage;
