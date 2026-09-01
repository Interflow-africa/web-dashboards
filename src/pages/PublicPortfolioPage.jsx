import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { artistAPI } from '../services/api';

/* Detect media type from a Cloudinary URL or file extension */
const getMediaType = (url) => {
  if (!url) return null;
  if (/\/video\/upload\//i.test(url) || /\.(mp4|webm|mov|avi|ogg|mkv)(\?|$)/i.test(url)) return 'video';
  if (/\/image\/upload\//i.test(url) || /\.(jpe?g|png|gif|webp|svg|bmp)(\?|$)/i.test(url)) return 'image';
  if (/\.(pdf)(\?|$)/i.test(url)) return 'pdf';
  return 'file';
};

/* The public serializer has used a few different names for these over time —
   read every known variant so the shared page never renders blank. */
const pick = (obj, ...keys) => keys.map(k => obj?.[k]).find(Boolean) || '';

const PublicPortfolioPage = () => {
  const { token } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    artistAPI.getPublicPortfolio(token).then(r => setProfile(r.data.data)).catch(() => setNotFound(true)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(139,105,20,0.2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '48px' }}>🔍</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--white)' }}>Portfolio Not Found</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>This portfolio link may be invalid or expired.</p>
      <Link to="/" className="btn btn-primary">Go to Interflow →</Link>
    </div>
  );

  const name      = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  const initials  = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const avatarUrl = pick(profile, 'avatar', 'avatar_url', 'profile_picture', 'photo', 'image');
  const coverUrl  = pick(profile, 'cover_image', 'cover_photo', 'cover', 'banner');
  const works     = profile.relevant_works || profile.works || profile.projects || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{ background: 'var(--dark)', padding: '16px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--white)', fontWeight: '700' }}>Interflow</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Join Interflow →</Link>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px', maxWidth: '800px' }}>
        {/* Profile Card */}
        <div className="section-card" style={{ marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{
            height: '140px',
            background: coverUrl
              ? `url(${coverUrl}) center / cover no-repeat`
              : 'linear-gradient(135deg, var(--dark) 0%, var(--dark-3) 100%)',
          }} />
          <div style={{ padding: '0 28px 28px' }}>
            <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'var(--gold)', border: '4px solid white', marginTop: '-42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '700', color: 'white', overflow: 'hidden' }}>
              {avatarUrl
                ? <img
                    src={avatarUrl}
                    alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.textContent = initials; }}
                  />
                : initials}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', marginTop: '12px', marginBottom: '4px' }}>{name}</h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>{profile.job_title} · {profile.city}{profile.country ? `, ${profile.country}` : ''}</p>
            {profile.instruments?.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {profile.instruments.map(i => <span key={i} className="badge badge-gold">{i}</span>)}
              </div>
            )}
            {profile.bio && <p style={{ marginTop: '16px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>{profile.bio}</p>}
          </div>
        </div>

        {/* Media Grid */}
        {profile.media?.length > 0 && (
          <div className="section-card" style={{ marginBottom: '20px' }}>
            <div className="section-card-header"><span className="section-card-title">Portfolio Media</span></div>
            <div className="section-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: '12px' }}>
                {profile.media.map(m => (
                  <div key={m.id} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '1', background: 'var(--grey-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {m.media_type === 'photo'
                      ? <img src={pick(m, 'file', 'file_url', 'url', 'image')} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '32px' }}>{m.media_type==='video'?'🎬':m.media_type==='audio'?'🎵':'📁'}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Projects / Relevant Works */}
        {works.length > 0 && (
          <div className="section-card" style={{ marginBottom: '20px' }}>
            <div className="section-card-header"><span className="section-card-title">Projects</span></div>
            <div className="section-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
                {works
                  .slice()
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map(w => {
                    const fileUrl   = pick(w, 'file_url', 'file', 'url', 'image');
                    const mediaType = getMediaType(fileUrl);
                    return (
                      <div key={w.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
                        {/* Preview */}
                        <div style={{ height: '150px', background: 'var(--grey-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {mediaType === 'image' && (
                            <img src={fileUrl} alt={w.project_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                          {mediaType === 'video' && (
                            <video src={fileUrl} controls preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                          {(mediaType === 'pdf' || mediaType === 'file') && (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'var(--gold)', fontSize: '12px', fontWeight: 600 }}>
                              <span style={{ fontSize: '32px' }}>{mediaType === 'pdf' ? '📄' : '📎'}</span>
                              {mediaType === 'pdf' ? 'Open PDF' : 'View file'}
                            </a>
                          )}
                          {!mediaType && <span style={{ fontSize: '32px', opacity: 0.35 }}>🎭</span>}
                        </div>

                        {/* Info */}
                        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>{w.project_title || w.title}</div>
                          {w.organization && (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{w.organization}</div>
                          )}
                          {w.description && (
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '2px' }}>{w.description}</p>
                          )}
                          {w.project_link && (
                            <a href={w.project_link} target="_blank" rel="noopener noreferrer"
                              style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--gold)' }}>
                              View Project →
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Experience */}
        {profile.experiences?.length > 0 && (
          <div className="section-card" style={{ marginBottom: '20px' }}>
            <div className="section-card-header"><span className="section-card-title">Career & Education</span></div>
            <div className="section-card-body">
              {profile.experiences.map(exp => (
                <div key={exp.id} style={{ display: 'flex', gap: '14px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{exp.experience_type==='career'?'🎭':'🎓'}</div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--dark)' }}>{exp.role_title || exp.degree_or_program}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{exp.organization || exp.field_of_study} · {exp.start_year}{exp.is_current?' – Present':exp.end_year?` – ${exp.end_year}`:''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ background: 'var(--dark)', borderRadius: 'var(--radius-xl)', padding: '36px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--white)', marginBottom: '12px' }}>Connect with {profile.first_name} on Interflow</h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>Join the platform connecting Africa's creative community</p>
          <Link to="/register" className="btn btn-primary btn-lg">Join Interflow for Free →</Link>
        </div>
      </div>
    </div>
  );
};

export default PublicPortfolioPage;
