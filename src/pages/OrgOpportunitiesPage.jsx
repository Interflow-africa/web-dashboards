import React, { useState } from 'react';
import { X, Plus, ChevronDown, Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';

const MOCK_OPPS = [
  { id: 1, initials: 'TID', color: '#1565C0', name: 'The Innovative Dancers', location: 'F.C.E college, Lagos, NIGERIA', type: 'Dance Group', tags: ['Dance', 'Dance Performance'], posted: 'Posted 6 days ago', deadline: 'Deadline June 4', contract: 'Full time', desc: 'TID is a unique pre-professional dance group that combines performance with rig...' },
  { id: 2, initials: 'OPS', color: '#0D7377', name: 'Opera Studio', location: 'Navardy college, NY, U.S.A', type: 'Minnesota Orchestra', tags: ['Opera', 'Orchestra band'], posted: 'Posted 6 days ago', deadline: 'Deadline June 4', contract: 'Full time', desc: 'TÓN is a unique pre-professional orchestra that combines performance with rig...' },
  { id: 3, initials: 'DDS', color: '#5C35A3', name: 'Dyno Dancers', location: 'Boardeaux, Paris, France', type: 'Paris Orchestra', tags: ['Dance', 'Dance Theatre'], posted: 'Posted 6 days ago', deadline: 'Deadline June 4', contract: 'Full time', desc: 'TON is a unique pre-professional orchestra that combines performance with rig...' },
  { id: 4, initials: 'TID', color: '#1565C0', name: 'The Innovative Dancers', location: 'F.C.E college, Lagos, NIGERIA', type: 'Dance Group', tags: ['Dance', 'Dance Performance'], posted: 'Posted 6 days ago', deadline: 'Deadline June 4', contract: 'Full time', desc: 'TID is a unique pre-professional dance group that combines performance with rig...' },
  { id: 5, initials: 'OPS', color: '#0D7377', name: 'Opera Studio', location: 'Navardy college, NY, U.S.A', type: 'Minnesota Orchestra', tags: ['Opera', 'Orchestra band'], posted: 'Posted 6 days ago', deadline: 'Deadline June 4', contract: 'Full time', desc: 'TÓN is a unique pre-professional orchestra that combines performance with rig...' },
  { id: 6, initials: 'DDS', color: '#5C35A3', name: 'Dyno Dancers', location: 'Boardeaux, Paris, France', type: 'Paris Orchestra', tags: ['Dance', 'Dance Theatre'], posted: 'Posted 6 days ago', deadline: 'Deadline June 4', contract: 'Full time', desc: 'TON is a unique pre-professional orchestra that combines performance with rig...' },
];

const MOCK_APPLICANTS = [
  { id: 1, name: 'Divine Onyekara', role: 'Lead Dancer', date: 'May 20, 2025', status: 'Approved' },
  { id: 2, name: 'Amara Okafor', role: 'Choreographer', date: 'May 21, 2025', status: 'In view' },
  { id: 3, name: 'Chidi Nwosu', role: 'Backup Dancer', date: 'May 22, 2025', status: 'Closed' },
  { id: 4, name: 'Funke Adeyemi', role: 'Vocalist', date: 'May 23, 2025', status: 'Approved' },
  { id: 5, name: 'Tunde Bello', role: 'Drummer', date: 'May 24, 2025', status: 'In view' },
];

const COUNTRIES = ['Nigeria', 'UK', 'USA', 'France'];
const CITIES = ['Lagos', 'Abuja', 'London', 'New York', 'Paris'];
const EXPERIENCES = ['1-4 years', '5-9 years', '10+ years'];
const SALARIES = ['$50-$100', '$100-$500', '$500+'];
const APP_STATUSES = ['Active', 'Closed', 'Draft'];

const statusBadge = (status) => {
  if (status === 'Approved') return 'bg-green-100 text-green-700';
  if (status === 'In view') return 'bg-amber-100 text-amber-700';
  if (status === 'Closed') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-600';
};

/* ────────────────────────────────────────────────────────────────
   VIEW OPPORTUNITY MODAL
──────────────────────────────────────────────────────────────────*/
const ViewOpportunityModal = ({ opp, onClose }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [mediaSubTab, setMediaSubTab] = useState('Photo');
  const tabs = ['Overview', 'Applicants', 'Media'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[760px] p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[18px] text-gray-900">View Opportunity Info</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-4">
          {/* Left mini panel */}
          <div className="w-48 shrink-0">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-white font-bold text-[16px] mb-3" style={{ backgroundColor: opp?.color || '#1565C0' }}>
                {opp?.initials || 'TID'}
              </div>
              <p className="font-bold text-gray-900 text-[13px] mb-0.5">Music Residency</p>
              <p className="text-[12px] text-gray-400 mb-4">Category: Performance</p>
              <nav className="flex flex-col gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-left text-[12px] font-medium px-3 py-2 rounded-lg border-l-2 transition-all ${
                      activeTab === tab
                        ? 'bg-[#8D5D1D]/10 border-[#8D5D1D] text-[#8D5D1D]'
                        : 'border-transparent text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 min-w-0">
            {/* Overview Tab */}
            {activeTab === 'Overview' && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 font-medium mb-1 block">Opportunity Title*</label>
                    <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">Music Residency Program</div>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 font-medium mb-1 block">Category</label>
                    <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">Performance</div>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 font-medium mb-1 block">Description</label>
                  <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700 min-h-[70px]">
                    A unique pre-professional residency that combines performance with rigorous training and mentorship from industry professionals.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 font-medium mb-1 block">Country</label>
                    <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">Nigeria</div>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 font-medium mb-1 block">City</label>
                    <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">Lagos</div>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 font-medium mb-1 block">Location</label>
                  <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">F.C.E College, Lagos, NIGERIA</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 font-medium mb-1 block">Opportunity Creation Date</label>
                    <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">May 10, 2025</div>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 font-medium mb-1 block">Application Status</label>
                    <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">Active</div>
                  </div>
                </div>
              </div>
            )}

            {/* Applicants Tab */}
            {activeTab === 'Applicants' && (
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-3">Applicants List</p>
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-[12px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2.5 text-left"><input type="checkbox" className="rounded" /></th>
                        <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Name</th>
                        <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Role</th>
                        <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Date received</th>
                        <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Status</th>
                        <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_APPLICANTS.map(a => (
                        <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2.5"><input type="checkbox" className="rounded" /></td>
                          <td className="px-3 py-2.5 font-medium text-gray-800">{a.name}</td>
                          <td className="px-3 py-2.5 text-gray-500">{a.role}</td>
                          <td className="px-3 py-2.5 text-gray-500">{a.date}</td>
                          <td className="px-3 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusBadge(a.status)}`}>{a.status}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <button className="text-gray-400 hover:text-gray-700 text-[16px] font-bold tracking-widest">···</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between mt-3 text-[12px] text-gray-500">
                  <span>Showing 1–5 of 5</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(p => (
                      <button key={p} className={`w-7 h-7 rounded-lg ${p === 1 ? 'bg-[#8D5D1D] text-white' : 'hover:bg-gray-100 text-gray-500'}`}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'Media' && (
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-3">All Media</p>
                <div className="flex gap-2 mb-4">
                  {['Photo', 'Video', 'Documents'].map(t => (
                    <button
                      key={t}
                      onClick={() => setMediaSubTab(t)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                        mediaSubTab === t ? 'bg-[#8D5D1D] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                      <span className="text-gray-300 text-[10px]">{mediaSubTab}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   CREATE OPPORTUNITY MODAL
──────────────────────────────────────────────────────────────────*/
const CreateOpportunityModal = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState('Performance');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', description: '', country: '', city: '', location: '',
    closeDate: '', appStatus: 'Active',
    firstName: '', lastName: '', applicantCity: '', applicantCountry: '',
    experience: '', salary: '', address: '', gender: '', portfolioLink: '',
  });

  const categories = ['Performance', 'Non-Performance', 'Competition', 'Festival'];
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputCls = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 placeholder:text-gray-300';
  const labelCls = 'text-[11px] text-gray-500 font-medium mb-1 block';
  const readonlyCls = 'w-full bg-[#F7F4EE] rounded-xl px-3 py-2.5 text-[13px] text-gray-700';

  const stepLabels = ['Details', 'Application', 'Preview & Post'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[760px] p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-[18px] text-gray-900">Create Opportunity</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>
        <p className="text-[12px] text-gray-400 mb-4">Fill in the details to post a new opportunity on Interflow</p>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                activeCategory === cat ? 'bg-[#8D5D1D] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] text-[#8D5D1D] border border-[#8D5D1D]/30 hover:bg-[#8D5D1D]/5">
            <Plus size={12} /> Add Category
          </button>
        </div>

        {/* Section label */}
        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">{activeCategory}</p>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-6">
          {stepLabels.map((label, i) => {
            const num = i + 1;
            const isActive = step === num;
            const isDone = step > num;
            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${
                    isDone ? 'bg-[#8D5D1D] text-white' : isActive ? 'bg-[#8D5D1D] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isDone ? '✓' : num}
                  </div>
                  <span className={`text-[12px] font-medium ${isActive ? 'text-[#8D5D1D]' : 'text-gray-400'}`}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && <div className="flex-1 mx-3 h-px bg-gray-200" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelCls}>Opportunity Title*</label>
              <input className={inputCls} placeholder="e.g. Lead Dancer for Afrobeats Show" value={form.title} onChange={set('title')} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={3} placeholder="Describe the opportunity..." value={form.description} onChange={set('description')} style={{ resize: 'vertical' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Country</label>
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-8`} value={form.country} onChange={set('country')}>
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>City</label>
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-8`} value={form.city} onChange={set('city')}>
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input className={inputCls} placeholder="e.g. F.C.E College, Lagos" value={form.location} onChange={set('location')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Opportunity Close date</label>
                <input className={inputCls} placeholder="e.g. June 30, 2025" value={form.closeDate} onChange={set('closeDate')} />
              </div>
              <div>
                <label className={labelCls}>Application Status</label>
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-8`} value={form.appStatus} onChange={set('appStatus')}>
                    {APP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full h-11 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold mt-2 hover:bg-[#7A5019] transition-colors"
            >
              Continue to Application form
            </button>
          </div>
        )}

        {/* Step 2: Application */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <p className="text-[12px] text-gray-400 mb-1">Create the application form for the Opportunity</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>First name</label>
                <input className={inputCls} placeholder="First name" value={form.firstName} onChange={set('firstName')} />
              </div>
              <div>
                <label className={labelCls}>Last name</label>
                <input className={inputCls} placeholder="Last name" value={form.lastName} onChange={set('lastName')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>City*</label>
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-8`} value={form.applicantCity} onChange={set('applicantCity')}>
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Country*</label>
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-8`} value={form.applicantCountry} onChange={set('applicantCountry')}>
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Experience*</label>
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-8`} value={form.experience} onChange={set('experience')}>
                    <option value="">Select experience</option>
                    {EXPERIENCES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Salary range</label>
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-8`} value={form.salary} onChange={set('salary')}>
                    <option value="">Select range</option>
                    {SALARIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input className={inputCls} placeholder="Full address" value={form.address} onChange={set('address')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Gender</label>
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-8`} value={form.gender} onChange={set('gender')}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Interflow Portfolio link</label>
                <input className={inputCls} placeholder="https://interflow.app/..." value={form.portfolioLink} onChange={set('portfolioLink')} />
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(1)} className="flex-1 h-11 rounded-full border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 h-11 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold hover:bg-[#7A5019] transition-colors">
                Preview
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Post */}
        {step === 3 && (
          <div className="flex flex-col gap-3">
            <p className="text-[12px] text-gray-400 mb-1">Review the details before posting</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Opportunity Title*</label>
                <div className={readonlyCls}>{form.title || '—'}</div>
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <div className={readonlyCls}>{activeCategory}</div>
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <div className={`${readonlyCls} min-h-[60px]`}>{form.description || '—'}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Country</label>
                <div className={readonlyCls}>{form.country || '—'}</div>
              </div>
              <div>
                <label className={labelCls}>City</label>
                <div className={readonlyCls}>{form.city || '—'}</div>
              </div>
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <div className={readonlyCls}>{form.location || '—'}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Close Date</label>
                <div className={readonlyCls}>{form.closeDate || '—'}</div>
              </div>
              <div>
                <label className={labelCls}>Application Status</label>
                <div className={readonlyCls}>{form.appStatus}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>First name</label>
                <div className={readonlyCls}>{form.firstName || '—'}</div>
              </div>
              <div>
                <label className={labelCls}>Last name</label>
                <div className={readonlyCls}>{form.lastName || '—'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Experience</label>
                <div className={readonlyCls}>{form.experience || '—'}</div>
              </div>
              <div>
                <label className={labelCls}>Salary range</label>
                <div className={readonlyCls}>{form.salary || '—'}</div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(2)} className="flex-1 h-11 rounded-full border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold hover:bg-[#7A5019] transition-colors flex items-center justify-center gap-2"
              >
                Confirm &amp; Post <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────────────*/
const OrgOpportunitiesPage = () => {
  const [filterOpen, setFilterOpen] = useState(true);
  const [datePosted, setDatePosted] = useState('All Time');
  const [contractType, setContractType] = useState('Full Time');
  const [deadline, setDeadline] = useState('Open');
  const [category, setCategory] = useState('Performance');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewOpp, setViewOpp] = useState(null);

  const RadioGroup = ({ label, options, value, onChange }) => (
    <div className="mb-5">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex flex-col gap-1.5">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => onChange(opt)}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                value === opt ? 'border-[#8D5D1D]' : 'border-gray-300'
              }`}
            >
              {value === opt && <div className="w-2 h-2 rounded-full bg-[#8D5D1D]" />}
            </div>
            <span className="text-[13px] text-gray-600">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="font-[Montserrat,sans-serif] font-bold text-[22px] text-gray-900">Opportunities</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Create opportunity and send out applications here with interflow</p>
      </div>

      <div className="flex gap-5 items-start">
        {/* LEFT filter panel */}
        {filterOpen && (
          <div className="w-[260px] shrink-0 bg-white rounded-2xl p-5 shadow-sm">
            <p className="font-bold text-[14px] text-gray-900 mb-4">Filters</p>
            <RadioGroup
              label="Date Posted"
              options={['All Time', 'Last 24 hours', 'Last 7 days', 'Last 30 days']}
              value={datePosted}
              onChange={setDatePosted}
            />
            <RadioGroup
              label="Contract Type"
              options={['Full Time', 'Per Time', 'Hybrid']}
              value={contractType}
              onChange={setContractType}
            />
            <RadioGroup
              label="Deadline"
              options={['Open', 'Close']}
              value={deadline}
              onChange={setDeadline}
            />
            <RadioGroup
              label="Category"
              options={['Performance', 'Non-Performance', 'Competition/Festival']}
              value={category}
              onChange={setCategory}
            />
            <button
              onClick={() => setFilterOpen(false)}
              className="text-[12px] font-medium text-[#8D5D1D] hover:underline mt-1"
            >
              Collapse
            </button>
          </div>
        )}

        {/* RIGHT main content */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 max-w-[300px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search opportunities..."
                className="w-full bg-white border border-gray-200 rounded-full pl-9 pr-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 placeholder:text-gray-300"
              />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(s => !s)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-[13px] text-gray-600 hover:bg-gray-50"
              >
                <SlidersHorizontal size={13} />
                Sort
                <ChevronDown size={13} />
              </button>
              {sortOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-10 min-w-[140px]">
                  {['Newest', 'Oldest', 'Most Applications'].map(opt => (
                    <button key={opt} onClick={() => setSortOpen(false)} className="w-full text-left px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50">{opt}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Create button */}
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#8D5D1D] text-white rounded-full text-[13px] font-semibold hover:bg-[#7A5019] transition-colors ml-auto"
            >
              <Plus size={14} />
              Create Opportunity
            </button>

            {!filterOpen && (
              <button
                onClick={() => setFilterOpen(true)}
                className="text-[12px] font-medium text-[#8D5D1D] hover:underline"
              >
                Show Filters
              </button>
            )}
          </div>

          {/* Section heading */}
          <p className="text-[14px] text-gray-400 mb-4">All Opportunities Posted</p>

          {/* Card grid */}
          <div className="grid grid-cols-3 gap-4">
            {MOCK_OPPS.map(opp => (
              <div key={opp.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0"
                    style={{ backgroundColor: opp.color }}
                  >
                    {opp.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[13px] text-gray-900 truncate">{opp.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{opp.location}</p>
                    <p className="text-[11px] text-gray-500">{opp.type}</p>
                  </div>
                </div>

                {/* Metadata */}
                <p className="text-[11px] text-gray-400">
                  {opp.posted} | {opp.deadline} | {opp.contract}
                </p>

                {/* Description */}
                <p className="text-[12px] text-gray-500 line-clamp-2">{opp.desc}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {opp.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-500 text-[11px] rounded-full px-2.5 py-1">{tag}</span>
                  ))}
                </div>

                {/* More Info button */}
                <button
                  onClick={() => setViewOpp(opp)}
                  className="w-full h-10 rounded-full bg-[#8D5D1D] text-white text-[12px] font-semibold hover:bg-[#7A5019] transition-colors mt-auto"
                >
                  More Info
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewOpp && <ViewOpportunityModal opp={viewOpp} onClose={() => setViewOpp(null)} />}
      {createModalOpen && <CreateOpportunityModal onClose={() => setCreateModalOpen(false)} />}
    </DashboardLayout>
  );
};

export default OrgOpportunitiesPage;
