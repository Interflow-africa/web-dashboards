import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Trash2, Plus, Image, Pencil, GraduationCap, Briefcase, Download } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { artistAPI, relevantWorksAPI, authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  project_title: '',
  organization: '',
  project_link: '',
  description: '',
  order: '',
};

/* ── Add / Edit Work Modal ───────────────────────────────────────── */
const WorkModal = ({ onClose, onSaved }) => {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project_title.trim()) { toast.error('Project title is required'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('project_title', form.project_title);
      fd.append('organization',  form.organization);
      fd.append('project_link',  form.project_link);
      fd.append('description',   form.description);
      if (form.order !== '') fd.append('order', form.order);
      if (file) fd.append('file', file);

      await relevantWorksAPI.create(fd);
      toast.success('Work added!');
      onSaved();
      onClose();
    } catch {
      toast.error('Failed to save work');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 focus:border-[#8D5D1D]/50 placeholder:text-gray-300 bg-white';
  const labelCls = 'text-[11px] text-gray-500 font-medium mb-1 block';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-[560px] p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[18px] text-gray-900">Add Relevant Work</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Project Title *</label>
            <input className={inputCls} placeholder="e.g. Sankofa (2025)" value={form.project_title} onChange={e => set('project_title', e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Organization</label>
            <input className={inputCls} placeholder="e.g. Lagos Dance Theatre" value={form.organization} onChange={e => set('organization', e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Project Link</label>
            <input className={inputCls} type="url" placeholder="https://example.com/project" value={form.project_link} onChange={e => set('project_link', e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} rows={3} placeholder="Brief description of the project…" value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          <div>
            <label className={labelCls}>Display Order</label>
            <input className={inputCls} type="number" min="1" placeholder="1" value={form.order} onChange={e => set('order', e.target.value)} />
          </div>

          {/* File upload */}
          <div>
            <label className={labelCls}>Media File</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-[#8D5D1D]/40 hover:bg-[#8D5D1D]/5 transition-colors"
            >
              {preview ? (
                <img src={preview} alt="preview" className="max-h-[140px] rounded-lg object-contain" />
              ) : (
                <>
                  <Image size={28} className="text-gray-300 mb-2" />
                  <p className="text-[12px] text-gray-400">{file ? file.name : 'Click to upload photo, video, or document'}</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" className="hidden" onChange={handleFile} />
          </div>

          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose} className="flex-1 h-11 rounded-full border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 h-11 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold hover:bg-[#7A5019] transition-colors disabled:opacity-60">
              {submitting ? 'Saving…' : 'Add Work'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Detect media type from Cloudinary URL or file extension ─────── */
const getMediaType = (url) => {
  if (!url) return null;
  if (/\/video\/upload\//i.test(url) || /\.(mp4|webm|mov|avi|ogg|mkv)(\?|$)/i.test(url)) return 'video';
  if (/\/image\/upload\//i.test(url) || /\.(jpe?g|png|gif|webp|svg|bmp)(\?|$)/i.test(url)) return 'image';
  if (/\.(pdf)(\?|$)/i.test(url)) return 'pdf';
  return 'file';
};

const MEDIA_BADGE = {
  video: { label: 'Video', bg: '#1e3a5f', text: 'white' },
  image: { label: 'Image', bg: '#14532d', text: 'white' },
  pdf:   { label: 'PDF',   bg: '#7f1d1d', text: 'white' },
  file:  { label: 'File',  bg: '#374151', text: 'white' },
};

/* ── Work Card ───────────────────────────────────────────────────── */
const WorkCard = ({ work, onDelete }) => {
  const fileUrl  = work.file_url || null;
  const mediaType = getMediaType(fileUrl);
  const badge     = mediaType ? MEDIA_BADGE[mediaType] : null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Preview */}
      <div className="bg-gray-50 h-[160px] flex items-center justify-center overflow-hidden relative">
        {mediaType === 'image' && (
          <img src={fileUrl} alt={work.project_title} className="w-full h-full object-cover" />
        )}
        {mediaType === 'video' && (
          <video
            src={fileUrl}
            className="w-full h-full object-cover"
            preload="metadata"
            controls
          />
        )}
        {mediaType === 'pdf' && (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="text-4xl">📄</span>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-[#8D5D1D] font-medium hover:underline">
              Open PDF
            </a>
          </div>
        )}
        {mediaType === 'file' && (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="text-4xl">📎</span>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-[#8D5D1D] font-medium hover:underline">
              View file
            </a>
          </div>
        )}
        {!mediaType && (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <Image size={32} />
            <span className="text-[11px]">No media</span>
          </div>
        )}

        {/* Media type badge */}
        {badge && (
          <span
            className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: badge.bg, color: badge.text }}
          >
            {badge.label}
          </span>
        )}

        <button
          onClick={() => onDelete(work.id)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-red-500 hover:bg-red-50 flex items-center justify-center shadow-sm transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <p className="font-semibold text-[13px] text-gray-900 truncate">{work.project_title}</p>
        {work.organization && <p className="text-[11px] text-gray-500 truncate">{work.organization}</p>}
        {work.description && <p className="text-[12px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">{work.description}</p>}
        {work.project_link && (
          <a
            href={work.project_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pt-2 flex items-center gap-1.5 text-[11px] text-[#8D5D1D] font-medium hover:underline"
          >
            <ExternalLink size={11} /> View Project
          </a>
        )}
      </div>
    </div>
  );
};

/* ── Skill tag (editable) ────────────────────────────────────────── */
const SkillTag = ({ skill, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] bg-amber-50 text-amber-900 border border-amber-200 font-medium">
    {skill.replace(/_/g, ' ')}
    {onRemove && (
      <button
        type="button"
        onClick={() => onRemove(skill)}
        className="ml-0.5 text-amber-600 hover:text-red-500 transition-colors"
      >
        <X size={10} />
      </button>
    )}
  </span>
);

/* ── Experience Modal (add + edit) ──────────────────────────────── */
const EMPTY_EXP = {
  experience_type: 'career',
  role_title: '',
  organization: '',
  degree_or_program: '',
  field_of_study: '',
  start_year: '',
  end_year: '',
  is_current: false,
};

const ExperienceModal = ({ exp, onClose, onSaved }) => {
  const isEdit = !!exp;
  const [form, setForm]         = useState(isEdit ? {
    experience_type:   exp.experience_type   || 'career',
    role_title:        exp.role_title        || '',
    organization:      exp.organization      || '',
    degree_or_program: exp.degree_or_program || '',
    field_of_study:    exp.field_of_study    || '',
    start_year:        exp.start_year        || '',
    end_year:          exp.end_year          || '',
    is_current:        exp.is_current        || false,
  } : { ...EMPTY_EXP });
  const [submitting, setSubmitting] = useState(false);

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setE = k => e => set(k, e.target.value);

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 focus:border-[#8D5D1D]/50 placeholder:text-gray-300 bg-white';
  const labelCls = 'text-[11px] text-gray-500 font-medium mb-1 block';

  const handleSubmit = async () => {
    const isCareer = form.experience_type === 'career';
    if (isCareer  && !form.role_title.trim())        { toast.error('Role title is required'); return; }
    if (!isCareer && !form.degree_or_program.trim()) { toast.error('Degree / program is required'); return; }
    if (!form.start_year)                            { toast.error('Start year is required'); return; }

    const payload = {
      experience_type: form.experience_type,
      start_year:      Number(form.start_year),
      is_current:      form.is_current,
      ...(!form.is_current && form.end_year ? { end_year: Number(form.end_year) } : {}),
      ...(isCareer ? {
        role_title:   form.role_title,
        organization: form.organization,
      } : {
        degree_or_program: form.degree_or_program,
        field_of_study:    form.field_of_study,
      }),
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await artistAPI.updateExperience(exp.id, payload);
        toast.success('Experience updated!');
      } else {
        await artistAPI.addExperience(payload);
        toast.success('Experience added!');
      }
      onSaved();
      onClose();
    } catch {
      toast.error(isEdit ? 'Failed to update' : 'Failed to add experience');
    } finally {
      setSubmitting(false);
    }
  };

  const isCareer = form.experience_type === 'career';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-[520px] p-5 sm:p-6 max-h-[92vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[18px] text-gray-900">
            {isEdit ? 'Edit Experience' : 'Add Experience'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex rounded-xl border border-gray-200 p-1 mb-5 gap-1">
          {[
            { value: 'career',    label: 'Career',    Icon: Briefcase },
            { value: 'education', label: 'Education', Icon: GraduationCap },
          ].map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => set('experience_type', value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                form.experience_type === value
                  ? 'bg-[#8D5D1D] text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {isCareer ? (
            <>
              <div>
                <label className={labelCls}>Role / Job Title *</label>
                <input className={inputCls} placeholder="e.g. Lead Choreographer" value={form.role_title} onChange={setE('role_title')} />
              </div>
              <div>
                <label className={labelCls}>Organisation</label>
                <input className={inputCls} placeholder="e.g. Lagos Dance Theatre" value={form.organization} onChange={setE('organization')} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelCls}>Degree / Program *</label>
                <input className={inputCls} placeholder="e.g. Bachelor of Performing Arts" value={form.degree_or_program} onChange={setE('degree_or_program')} />
              </div>
              <div>
                <label className={labelCls}>Field of Study</label>
                <input className={inputCls} placeholder="e.g. Dance & Choreography" value={form.field_of_study} onChange={setE('field_of_study')} />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Start Year *</label>
              <input className={inputCls} type="number" min="1950" max="2099" placeholder="2020" value={form.start_year} onChange={setE('start_year')} />
            </div>
            <div>
              <label className={labelCls}>End Year</label>
              <input className={inputCls} type="number" min="1950" max="2099" placeholder="2024" value={form.end_year} onChange={setE('end_year')} disabled={form.is_current} />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_current}
              onChange={e => { set('is_current', e.target.checked); if (e.target.checked) set('end_year', ''); }}
              className="w-4 h-4 rounded"
              style={{ accentColor: '#8D5D1D' }}
            />
            <span className="text-[13px] text-gray-600">I currently work / study here</span>
          </label>

          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-11 rounded-full border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex-1 h-11 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold hover:bg-[#7A5019] transition-colors disabled:opacity-60">
              {submitting ? 'Saving…' : isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Portfolio Page ───────────────────────────────────────────────── */
export const PortfolioPage = () => {
  const [profile, setProfile]               = useState(null);
  const [experiences, setExperiences]       = useState([]);
  const [relevantWorks, setRelevantWorks]   = useState([]);
  const [activeTab, setActiveTab]           = useState('bio');
  const [loading, setLoading]               = useState(true);
  const [showModal, setShowModal]           = useState(false);

  /* bio editing state */
  const [isEditingBio, setIsEditingBio]     = useState(false);
  const [bioForm, setBioForm]               = useState({ bio: '', special_skills: [] });
  const [newSkill, setNewSkill]             = useState('');
  const [savingBio, setSavingBio]           = useState(false);

  /* experience modal state: null | { mode:'add' } | { mode:'edit', exp } */
  const [expModal, setExpModal]             = useState(null);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      authAPI.getMe(),
      artistAPI.getExperiences(),
      relevantWorksAPI.list(),
    ]).then(([p, e, w]) => {
      const profileData = p.data.data?.profile || {};
      setProfile(profileData);
      setBioForm({
        bio:            profileData.bio            || '',
        special_skills: profileData.special_skills || [],
      });
      setExperiences(e.data.data || []);
      const works = w.data.data || w.data.results || [];
      setRelevantWorks(Array.isArray(works) ? works : []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleDeleteWork = async (id) => {
    if (!window.confirm('Remove this work?')) return;
    try {
      await relevantWorksAPI.delete(id);
      setRelevantWorks(ws => ws.filter(w => w.id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleDeleteExperience = async (id) => {
    if (!window.confirm('Remove this experience?')) return;
    try {
      await artistAPI.deleteExperience(id);
      setExperiences(prev => prev.filter(e => e.id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const reloadExperiences = () => {
    artistAPI.getExperiences()
      .then(r => setExperiences(r.data.data || []))
      .catch(() => {});
  };

  const addSkill = () => {
    const trimmed = newSkill.trim().toLowerCase().replace(/\s+/g, '_');
    if (!trimmed) return;
    if (bioForm.special_skills.includes(trimmed)) { toast.error('Skill already added'); return; }
    setBioForm(f => ({ ...f, special_skills: [...f.special_skills, trimmed] }));
    setNewSkill('');
  };

  const removeSkill = (skill) => {
    setBioForm(f => ({ ...f, special_skills: f.special_skills.filter(s => s !== skill) }));
  };

  const saveBio = async () => {
    setSavingBio(true);
    try {
      await artistAPI.updateProfile({ bio: bioForm.bio, special_skills: bioForm.special_skills });
      setProfile(p => ({ ...p, bio: bioForm.bio, special_skills: bioForm.special_skills }));
      setIsEditingBio(false);
      toast.success('Bio updated!');
    } catch {
      toast.error('Failed to save bio');
    } finally {
      setSavingBio(false);
    }
  };

  const cancelBioEdit = () => {
    setBioForm({ bio: profile?.bio || '', special_skills: profile?.special_skills || [] });
    setIsEditingBio(false);
    setNewSkill('');
  };

  const name = profile ? `${profile.first_name} ${profile.last_name}` : '';

  const downloadPDF = () => {
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
    const skills   = (profile?.special_skills || []).map(s => s.replace(/_/g, ' ')).join(' · ');
    const perfs    = (profile?.performance_styles || []).map(s => s.replace(/_/g, ' ')).join(', ');
    const roles    = (profile?.roles || []).map(s => s.replace(/_/g, ' ')).join(', ');

    const expRows = experiences.map(e => `
      <div class="exp-item">
        <div class="exp-icon">${e.experience_type === 'career' ? '🎭' : '🎓'}</div>
        <div>
          <div class="exp-title">${e.role_title || e.degree_or_program || ''}</div>
          <div class="exp-sub">
            ${e.organization || e.field_of_study || ''}${(e.organization || e.field_of_study) ? ' · ' : ''}${e.start_year || ''}${e.is_current ? ' – Present' : e.end_year ? ` – ${e.end_year}` : ''}
          </div>
        </div>
      </div>`).join('');

    const workRows = relevantWorks.map(w => `
      <div class="work-item">
        <div class="work-title">${w.project_title || ''}</div>
        ${w.organization ? `<div class="work-sub">${w.organization}</div>` : ''}
        ${w.description  ? `<div class="work-desc">${w.description}</div>` : ''}
        ${w.project_link ? `<div class="work-link">${w.project_link}</div>` : ''}
      </div>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${name} — Portfolio</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; align-items: center; gap: 24px; padding-bottom: 24px; border-bottom: 2px solid #8D5D1D; margin-bottom: 28px; }
  .avatar { width: 80px; height: 80px; border-radius: 50%; background: #8D5D1D; color: #fff; font-size: 28px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }
  .header-info h1 { font-size: 26px; font-weight: 700; color: #1a1a1a; }
  .header-info .meta { font-size: 13px; color: #666; margin-top: 4px; }
  .header-info .pronoun { font-size: 12px; color: #999; margin-top: 2px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #8D5D1D; border-bottom: 1px solid #e5d8c8; padding-bottom: 6px; margin-bottom: 14px; }
  .bio-text { font-size: 14px; line-height: 1.8; color: #444; }
  .pills { display: flex; flex-wrap: wrap; gap: 6px; }
  .pill { font-size: 11px; padding: 3px 10px; border-radius: 99px; background: #f5eed7; color: #8D5D1D; font-weight: 600; text-transform: capitalize; }
  .exp-item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
  .exp-item:last-child { border-bottom: none; }
  .exp-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
  .exp-title { font-size: 14px; font-weight: 600; color: #1a1a1a; }
  .exp-sub { font-size: 12px; color: #888; margin-top: 2px; }
  .work-item { padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
  .work-item:last-child { border-bottom: none; }
  .work-title { font-size: 14px; font-weight: 600; color: #1a1a1a; }
  .work-sub { font-size: 12px; color: #888; margin-top: 2px; }
  .work-desc { font-size: 12px; color: #555; margin-top: 4px; line-height: 1.6; }
  .work-link { font-size: 11px; color: #8D5D1D; margin-top: 4px; word-break: break-all; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #bbb; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="avatar">
      ${profile?.avatar
        ? `<img src="${profile.avatar}" alt="${name}"/>`
        : initials}
    </div>
    <div class="header-info">
      <h1>${name || 'Artist'}</h1>
      <div class="meta">${profile?.job_title || ''}${profile?.job_title && (profile?.city || profile?.country) ? ' · ' : ''}${profile?.city || ''}${profile?.city && profile?.country ? ', ' : ''}${profile?.country || ''}</div>
      ${profile?.pronoun_display ? `<div class="pronoun">${profile.pronoun_display}</div>` : ''}
    </div>
  </div>

  ${profile?.bio ? `
  <div class="section">
    <div class="section-title">About</div>
    <div class="bio-text">${profile.bio}</div>
  </div>` : ''}

  ${skills ? `
  <div class="section">
    <div class="section-title">Special Skills</div>
    <div class="pills">${(profile?.special_skills || []).map(s => `<span class="pill">${s.replace(/_/g, ' ')}</span>`).join('')}</div>
  </div>` : ''}

  ${perfs ? `
  <div class="section">
    <div class="section-title">Performance Styles</div>
    <div class="pills">${(profile?.performance_styles || []).map(s => `<span class="pill">${s.replace(/_/g, ' ')}</span>`).join('')}</div>
  </div>` : ''}

  ${roles ? `
  <div class="section">
    <div class="section-title">Roles</div>
    <div class="pills">${(profile?.roles || []).map(s => `<span class="pill">${s.replace(/_/g, ' ')}</span>`).join('')}</div>
  </div>` : ''}

  ${experiences.length > 0 ? `
  <div class="section">
    <div class="section-title">Career &amp; Education</div>
    ${expRows}
  </div>` : ''}

  ${relevantWorks.length > 0 ? `
  <div class="section">
    <div class="section-title">Relevant Works</div>
    ${workRows}
  </div>` : ''}

  <div class="footer">Generated from Interflow · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '960px', width: '100%' }}>
        {/* Profile Header */}
        <div className="section-card" style={{ marginBottom: '20px', overflow: 'visible' }}>
          <div style={{ height: '160px', background: 'linear-gradient(135deg, var(--dark) 0%, var(--dark-3) 100%)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: '-40px', left: '28px', display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
              <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'var(--gold)', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: 'white', overflow: 'hidden' }}>
                {profile?.avatar
                  ? <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
              </div>
            </div>
            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
              <label className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                  const fd = new FormData();
                  fd.append('avatar', e.target.files[0]);
                  artistAPI.uploadAvatar(fd)
                    .then(r => setProfile(p => ({ ...p, avatar: r.data.data?.avatar })))
                    .catch(() => toast.error('Upload failed'));
                }} />
                📷 Edit Photo
              </label>
            </div>
          </div>
          <div style={{ padding: '52px 28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700', color: 'var(--dark)' }}>{name || 'Your Name'}</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {profile?.job_title || 'Artist'} · {profile?.city}{profile?.country ? `, ${profile.country}` : ''}
                </p>
                {profile?.pronoun_display && (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{profile.pronoun_display}</p>
                )}
                {profile?.instruments?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {profile.instruments.map(inst => <span key={inst} className="badge badge-gold">{inst}</span>)}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn btn-outline btn-sm" onClick={() =>
                  artistAPI.getShareLink().then(r => {
                    const apiUrl = r.data?.data?.share_url || '';
                    const match  = apiUrl.match(/\/public\/([^/?#]+)\/?/);
                    const token  = match?.[1];
                    const url    = token ? `${window.location.origin}/portfolio/public/${token}/` : apiUrl;
                    navigator.clipboard.writeText(url);
                    toast.success('Portfolio link copied!');
                  }).catch(() => toast.error('Failed'))
                }>
                  🔗 Share Portfolio
                </button>
                <button
                  className="btn btn-sm"
                  onClick={downloadPDF}
                  style={{ background: '#8D5D1D', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={13} /> Download PDF
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', padding: '0 12px', borderTop: '1px solid var(--border)', overflowX: 'auto' }}>
            {['bio', 'career', 'works'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '14px 20px', fontSize: '14px', fontWeight: activeTab === tab ? '600' : '400', color: activeTab === tab ? 'var(--gold)' : 'var(--text-muted)', borderBottom: `2px solid ${activeTab === tab ? 'var(--gold)' : 'transparent'}`, background: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', textTransform: 'capitalize', transition: 'all var(--transition)', whiteSpace: 'nowrap' }}>
                {tab === 'career' ? 'Career & Education' : tab === 'works' ? 'Relevant Works' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bio ── */}
        {activeTab === 'bio' && (
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-title">Bio</span>
              {!isEditingBio && (
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-[#8D5D1D] text-[#8D5D1D] hover:bg-[#F5EED7] transition-colors"
                  style={{ background: '#F5EED7' }}
                >
                  <Pencil size={11} /> Edit
                </button>
              )}
            </div>

            <div className="section-card-body">
              {isEditingBio ? (
                <div className="flex flex-col gap-4">
                  {/* Bio textarea */}
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium mb-1 block">Bio</label>
                    <textarea
                      rows={5}
                      value={bioForm.bio}
                      onChange={e => setBioForm(f => ({ ...f, bio: e.target.value }))}
                      placeholder="Tell people about yourself…"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] text-gray-700 outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 focus:border-[#8D5D1D]/50 resize-vertical leading-relaxed"
                    />
                  </div>

                  {/* Special skills */}
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium mb-2 block">Special Skills</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {bioForm.special_skills.map(s => (
                        <SkillTag key={s} skill={s} onRemove={removeSkill} />
                      ))}
                      {bioForm.special_skills.length === 0 && (
                        <p className="text-[12px] text-gray-400">No skills added yet.</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                        placeholder="Add a skill and press Enter…"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#8D5D1D] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-3 py-2 rounded-lg text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
                        style={{ background: '#8D5D1D' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={saveBio}
                      disabled={savingBio}
                      className="px-5 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                      style={{ background: '#8D5D1D' }}
                    >
                      {savingBio ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelBioEdit}
                      className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                    {profile?.bio || <span className="text-gray-400 italic">No bio added yet. Click Edit to add one.</span>}
                  </p>
                  {profile?.special_skills?.length > 0 && (
                    <>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '20px', marginBottom: '10px' }}>Special Skills</h4>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {profile.special_skills.map(s => <SkillTag key={s} skill={s} />)}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Relevant Works ── */}
        {activeTab === 'works' && (
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-title">Relevant Works</span>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#8D5D1D] text-white rounded-full text-[12px] font-semibold hover:bg-[#7A5019] transition-colors"
              >
                <Plus size={13} /> Add Work
              </button>
            </div>
            <div className="section-card-body">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-[260px]" />
                  ))}
                </div>
              ) : relevantWorks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎭</div>
                  <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>No works added yet</p>
                  <p style={{ fontSize: '13px' }}>Showcase your projects, performances, and collaborations.</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 px-5 py-2.5 bg-[#8D5D1D] text-white rounded-full text-[13px] font-semibold hover:bg-[#7A5019] transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={14} /> Add Your First Work
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relevantWorks
                    .slice()
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map(work => (
                      <WorkCard key={work.id} work={work} onDelete={handleDeleteWork} />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Career & Education ── */}
        {activeTab === 'career' && (
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-title">Career & Education</span>
              <button
                onClick={() => setExpModal({ mode: 'add' })}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#8D5D1D] text-white rounded-full text-[12px] font-semibold hover:bg-[#7A5019] transition-colors"
              >
                <Plus size={13} /> Add Experience
              </button>
            </div>
            <div className="section-card-body">
              {experiences.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎓</div>
                  <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>No experience added yet</p>
                  <p style={{ fontSize: '13px' }}>Add your career history and educational background.</p>
                  <button
                    onClick={() => setExpModal({ mode: 'add' })}
                    className="mt-4 px-5 py-2.5 bg-[#8D5D1D] text-white rounded-full text-[13px] font-semibold hover:bg-[#7A5019] transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={14} /> Add Your First Experience
                  </button>
                </div>
              ) : (
                experiences.map((exp, idx) => (
                  <div
                    key={exp.id}
                    style={{ padding: '16px 0', borderBottom: idx < experiences.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                        {exp.experience_type === 'career' ? '🎭' : '🎓'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--dark)' }}>
                          {exp.role_title || exp.degree_or_program}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {exp.organization || exp.field_of_study}
                          {(exp.organization || exp.field_of_study) ? ' · ' : ''}
                          {exp.start_year}{exp.is_current ? ' – Present' : exp.end_year ? ` – ${exp.end_year}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setExpModal({ mode: 'edit', exp })}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#8D5D1D] transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <WorkModal
          onClose={() => setShowModal(false)}
          onSaved={loadData}
        />
      )}

      {expModal && (
        <ExperienceModal
          exp={expModal.mode === 'edit' ? expModal.exp : null}
          onClose={() => setExpModal(null)}
          onSaved={reloadExperiences}
        />
      )}
    </DashboardLayout>
  );
};

export default PortfolioPage;
