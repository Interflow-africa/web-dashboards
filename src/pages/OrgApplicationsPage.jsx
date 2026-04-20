import React, { useState } from 'react';
import { X, Plus, ChevronDown, Search, SlidersHorizontal, ArrowRight, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import { applicationsAPI } from '@/services/index';
import toast from 'react-hot-toast';

/* ─── Mock Data ───────────────────────────────────────────────── */

const MOCK_ALL_OPPS = [
  { id: 1, title: 'Music Residency 1', category: 'Performance', applications: 30, dateCreated: 'May 1, 2025', status: 'Active' },
  { id: 2, title: 'Music Residency 2', category: 'Performance', applications: 22, dateCreated: 'May 5, 2025', status: 'Active' },
  { id: 3, title: 'Ignite Ur Light', category: 'Non Performance', applications: 15, dateCreated: 'Apr 20, 2025', status: 'Closed' },
  { id: 4, title: 'Maltina Dance-Hall', category: 'Competitions', applications: 17, dateCreated: 'Apr 10, 2025', status: 'Closed' },
  { id: 5, title: 'Lagos Carnival', category: 'Festivals', applications: 18, dateCreated: 'Mar 28, 2025', status: 'Closed' },
];

const MOCK_APPLICATIONS = [
  { id: 1, oppTitle: 'Music Residency 1', applicantName: 'Divine Onyekara', role: 'Lead Dancer', dateReceived: 'May 20, 2025', status: 'Approved' },
  { id: 2, oppTitle: 'Music Residency 2', applicantName: 'Amara Okafor', role: 'Choreographer', dateReceived: 'May 21, 2025', status: 'In view' },
  { id: 3, oppTitle: 'Ignite Ur Light', applicantName: 'Chidi Nwosu', role: 'Backup Dancer', dateReceived: 'May 22, 2025', status: 'Closed' },
  { id: 4, oppTitle: 'Maltina Dance-Hall', applicantName: 'Funke Adeyemi', role: 'Vocalist', dateReceived: 'May 23, 2025', status: 'Approved' },
  { id: 5, oppTitle: 'Lagos Carnival', applicantName: 'Tunde Bello', role: 'Drummer', dateReceived: 'May 24, 2025', status: 'In view' },
];

const MOCK_ACTIVE_OPPS = MOCK_ALL_OPPS.filter(o => o.status === 'Active');

const MOCK_MEDIA_TILES = Array.from({ length: 8 });

/* ─── Helpers ─────────────────────────────────────────────────── */

const statusPill = (status) => {
  if (status === 'Active' || status === 'Approved') return 'bg-green-100 text-green-700';
  if (status === 'In view') return 'bg-amber-100 text-amber-700';
  if (status === 'Closed') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-500';
};

const MOCK_APPLICANT_DETAILS = {
  name: 'Divine Onyekara',
  discipline: 'Dancer',
  location: 'Lagos, Nigeria',
  instruments: ['Piano', 'Guitar'],
  bio: 'A versatile performer with 7 years of experience in contemporary and traditional dance forms.',
  works: ['Swan Lake Performance 2023', 'Afrobeats Showcase 2024'],
  education: 'University of Lagos — B.A. Performing Arts, 2020',
};

/* ─── NEW MESSAGE MODAL ───────────────────────────────────────── */
const NewMessageModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-[640px] overflow-hidden">
      {/* Red header */}
      <div className="bg-[#C62828] px-5 py-3 flex items-center justify-between">
        <p className="text-white font-bold text-[14px]">New Message</p>
        <div className="flex items-center gap-2">
          <button className="text-white/70 hover:text-white text-[16px]">─</button>
          <button className="text-white/70 hover:text-white text-[16px]">⬜</button>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={16} />
          </button>
        </div>
      </div>
      {/* Body */}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <span className="text-[12px] text-gray-400 w-14 shrink-0">From:</span>
          <div className="bg-gray-50 rounded-lg px-3 py-1.5 text-[13px] text-gray-500 flex-1">admin@interflow.app</div>
        </div>
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <span className="text-[12px] text-gray-400 w-14 shrink-0">To:</span>
          <input className="flex-1 text-[13px] outline-none placeholder:text-gray-300" placeholder="Recipient email..." />
        </div>
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <span className="text-[12px] text-gray-400 w-14 shrink-0">Subject:</span>
          <input className="flex-1 text-[13px] outline-none placeholder:text-gray-300" placeholder="Subject..." />
        </div>
        <textarea
          rows={7}
          className="w-full text-[13px] text-gray-700 outline-none resize-none placeholder:text-gray-300"
          placeholder="Write your message here..."
        />
        {/* Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button className="px-5 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Send
          </button>
          <div className="flex items-center gap-2 text-gray-400 text-[14px]">
            <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded font-bold">B</button>
            <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded italic">I</button>
            <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded underline">U</button>
            <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded">≡</button>
            <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded">🔗</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ─── VIEW OPPORTUNITY MODAL ──────────────────────────────────── */
const ViewOpportunityModal = ({ opp, onClose }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [mediaSubTab, setMediaSubTab] = useState('Photo');
  const [msgOpen, setMsgOpen] = useState(false);
  const tabs = ['Overview', 'Applicants', 'Media'];

  const MOCK_APPLICANTS_TABLE = [
    { id: 1, name: 'Divine Onyekara', role: 'Lead Dancer', date: 'May 20, 2025', status: 'Approved' },
    { id: 2, name: 'Amara Okafor', role: 'Choreographer', date: 'May 21, 2025', status: 'In view' },
    { id: 3, name: 'Chidi Nwosu', role: 'Backup Dancer', date: 'May 22, 2025', status: 'Closed' },
    { id: 4, name: 'Funke Adeyemi', role: 'Vocalist', date: 'May 23, 2025', status: 'Approved' },
    { id: 5, name: 'Tunde Bello', role: 'Drummer', date: 'May 24, 2025', status: 'In view' },
  ];

  return (
    <>
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
                <div className="w-[50px] h-[50px] rounded-full bg-[#1565C0] flex items-center justify-center text-white font-bold text-[16px] mb-3">
                  {opp?.initials || 'MR'}
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
              {/* Overview */}
              {activeTab === 'Overview' && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium mb-1 block">Opportunity Title*</label>
                      <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">{opp?.title || 'Music Residency Program'}</div>
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium mb-1 block">Category</label>
                      <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">{opp?.category || 'Performance'}</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 font-medium mb-1 block">Description</label>
                    <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700 min-h-[60px]">
                      A unique pre-professional residency combining performance with rigorous training.
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
                      <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">{opp?.dateCreated || 'May 1, 2025'}</div>
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium mb-1 block">Application Status</label>
                      <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">{opp?.status || 'Active'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Applicants */}
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
                        {MOCK_APPLICANTS_TABLE.map(a => (
                          <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2.5"><input type="checkbox" className="rounded" /></td>
                            <td className="px-3 py-2.5 font-medium text-gray-800">{a.name}</td>
                            <td className="px-3 py-2.5 text-gray-500">{a.role}</td>
                            <td className="px-3 py-2.5 text-gray-500">{a.date}</td>
                            <td className="px-3 py-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusPill(a.status)}`}>{a.status}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <button className="text-gray-400 hover:text-gray-700 font-bold text-[16px] tracking-widest">···</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

              {/* Media */}
              {activeTab === 'Media' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[13px] font-semibold text-gray-700">All Media</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMsgOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#8D5D1D] text-[#8D5D1D] rounded-full text-[12px] font-medium hover:bg-[#8D5D1D]/5 transition-colors"
                      >
                        ▶ Send media
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8D5D1D] text-white rounded-full text-[12px] font-medium hover:bg-[#7A5019] transition-colors">
                        <Plus size={12} /> Add media
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    {['Photo', 'Video', 'Documents'].map(t => (
                      <button
                        key={t}
                        onClick={() => {}}
                        className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-gray-100 text-gray-500 hover:bg-gray-200"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {MOCK_MEDIA_TILES.map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                        <span className="text-gray-300 text-[10px]">Media</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {msgOpen && <NewMessageModal onClose={() => setMsgOpen(false)} />}
    </>
  );
};

/* ─── APPLICATION RESPONSE MODAL ─────────────────────────────── */
const ApplicationResponseModal = ({ app, onClose }) => {
  const [responseStatus, setResponseStatus] = useState('');
  const [orgFeedback, setOrgFeedback] = useState('');

  const handleSubmit = async () => {
    if (!responseStatus) { toast.error('Please select a response status'); return; }
    try {
      await applicationsAPI.updateStatus(app?.id, {
        status: responseStatus,
        org_notes: '',
        org_feedback: orgFeedback,
      });
      toast.success('Response submitted!');
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit response');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[500px] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-[#8D5D1D] hover:opacity-70">
              <ArrowLeft size={16} />
            </button>
            <h2 className="font-bold text-[16px] text-gray-900">Application Response</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Org badge */}
        <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-[#1565C0] flex items-center justify-center text-white font-bold text-[13px]">TID</div>
          <div>
            <p className="font-bold text-[13px] text-gray-900">Music Residency</p>
            <p className="text-[12px] text-gray-400">Category: Performance</p>
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] text-gray-400 font-medium mb-1 block">Applicant name</label>
            <div className="bg-[#F7F4EE] rounded-xl px-3 py-2.5 text-[13px] text-gray-700">
              {app?.applicantName || 'Divine Onyekara'}
            </div>
          </div>
          <div>
            <label className="text-[11px] text-gray-400 font-medium mb-1 block">Application Response Status*</label>
            <div className="relative">
              <select
                value={responseStatus}
                onChange={e => setResponseStatus(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 appearance-none pr-8"
              >
                <option value="">Select status</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="on_hold">On Hold</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-gray-400 font-medium mb-1 block">Feedback (optional)</label>
            <textarea
              rows={3}
              value={orgFeedback}
              onChange={e => setOrgFeedback(e.target.value)}
              placeholder="Leave feedback for the applicant…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 resize-vertical"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full h-11 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold hover:bg-[#7A5019] transition-colors flex items-center justify-center gap-2 mt-1"
          >
            Submit <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── ARTIST PROFILE DRAWER ───────────────────────────────────── */
const ArtistProfileDrawer = ({ artist, onBack }) => {
  const [activeTab, setActiveTab] = useState('Bio');
  const tabs = ['Bio', 'Career and Education', 'Media'];

  return (
    <div className="absolute inset-0 bg-[#F4F4F2] z-10 overflow-y-auto p-6">
      {/* Back link */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#8D5D1D] text-[13px] font-medium hover:underline mb-5"
      >
        <ArrowLeft size={14} /> View Profile
      </button>

      {/* Hero section */}
      <div className="flex gap-5 mb-6">
        {/* Left card */}
        <div className="w-[200px] shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 rounded-full ring-2 ring-[#8D5D1D] bg-amber-100 flex items-center justify-center font-bold text-[20px] text-[#8D5D1D]">
            {(artist?.name || 'DO').split(' ').map(n => n[0]).join('')}
          </div>
          <p className="text-[12px] text-gray-500">{artist?.location || 'Lagos, Nigeria'}</p>
          <div className="flex flex-col gap-1 w-full">
            {(artist?.instruments || ['Piano', 'Guitar']).map(inst => (
              <div key={inst} className="bg-gray-100 text-gray-500 text-[11px] rounded-lg px-2 py-1">{inst}</div>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-[11px] font-bold text-[#8D5D1D] uppercase italic tracking-widest mb-1">
                Contemporary Dancer
              </p>
              <h2 className="font-[Montserrat,sans-serif] font-bold text-[22px] text-gray-900">
                {artist?.name || 'Divine Onyekara'}
              </h2>
            </div>
            {/* Featured video thumbnail */}
            <div className="w-[140px] h-[80px] bg-gray-200 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-gray-400 text-[24px]">▶</span>
            </div>
          </div>
          <p className="text-[13px] text-gray-500 line-clamp-3">
            {artist?.bio || MOCK_APPLICANT_DETAILS.bio}
          </p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-5">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-[12px] font-medium transition-colors ${
              activeTab === tab ? 'bg-[#8D5D1D] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bio tab */}
      {activeTab === 'Bio' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="font-bold text-[14px] text-gray-900 mb-3">Quick facts</p>
          <table className="w-full text-[13px] mb-5">
            <tbody>
              {[
                ['Discipline', 'Contemporary Dance'],
                ['Experience', '7 years'],
                ['Location', 'Lagos, Nigeria'],
                ['Languages', 'English, Yoruba'],
                ['Availability', 'Full time'],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-gray-100">
                  <td className="py-2 text-gray-400 w-1/3">{k}</td>
                  <td className="py-2 text-gray-700 font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="font-bold text-[14px] text-gray-900 mb-2">Currently Working On</p>
          <p className="text-[13px] text-gray-500 mb-4">Preparing for the 2025 Lagos Arts Festival showcase and collaborating with a Berlin-based contemporary dance company.</p>
          <p className="font-bold text-[14px] text-gray-900 mb-2">Relevant works</p>
          <ul className="flex flex-col gap-1.5">
            {MOCK_APPLICANT_DETAILS.works.map(w => (
              <li key={w} className="text-[13px] text-gray-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8D5D1D] shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Career and Education tab */}
      {activeTab === 'Career and Education' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="font-bold text-[14px] text-gray-900 mb-4">Career and Education Highlights</p>
          <div className="bg-gray-50 rounded-xl p-4 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-[13px] text-amber-700 shrink-0">UL</div>
            <div>
              <p className="font-semibold text-[13px] text-gray-900">University of Lagos</p>
              <p className="text-[12px] text-gray-400">B.A. Performing Arts · 2016 – 2020</p>
              <p className="text-[12px] text-gray-500 mt-1">Graduated with honours. Active member of the university dance troupe and recipient of the Arts Excellence Award.</p>
            </div>
          </div>
        </div>
      )}

      {/* Media tab */}
      {activeTab === 'Media' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="font-bold text-[14px] text-gray-900 mb-4">My Media Gallery</p>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`rounded-xl bg-gray-100 flex items-center justify-center ${i === 0 ? 'col-span-2 row-span-2 aspect-video' : 'aspect-square'}`}>
                <span className="text-gray-300 text-[12px]">Media {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── TABLE WRAPPER ───────────────────────────────────────────── */
const TableWrapper = ({ title, view, onViewOpp, onViewApp, onViewArtist }) => {
  const [search, setSearch] = useState('');
  const [sortOpen, setSortOpen] = useState(false);

  const isOpps = view === 'opps' || view === 'active';
  const data = view === 'opps' ? MOCK_ALL_OPPS : view === 'active' ? MOCK_ACTIVE_OPPS : MOCK_APPLICATIONS;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table top bar */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-100 flex-wrap">
        <p className="font-bold text-[14px] text-gray-900 mr-2">{title}</p>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-gray-50 border border-gray-200 rounded-full pl-8 pr-4 py-2 text-[12px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 placeholder:text-gray-300 w-[180px]"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setSortOpen(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-[12px] text-gray-600 hover:bg-gray-100"
          >
            <SlidersHorizontal size={12} /> Sort <ChevronDown size={12} />
          </button>
          {sortOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-10 min-w-[130px]">
              {['Newest', 'Oldest'].map(opt => (
                <button key={opt} onClick={() => setSortOpen(false)} className="w-full text-left px-4 py-2 text-[12px] text-gray-600 hover:bg-gray-50">{opt}</button>
              ))}
            </div>
          )}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-[12px] text-gray-600 hover:bg-gray-100">
          <SlidersHorizontal size={12} /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isOpps ? (
          <table className="w-full text-[13px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Opportunity Title</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Applications</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Date Created</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                  <td className="px-4 py-3 font-medium text-gray-800">{row.title}</td>
                  <td className="px-4 py-3 text-gray-500">{row.category}</td>
                  <td className="px-4 py-3 text-gray-700 font-semibold">{row.applications}</td>
                  <td className="px-4 py-3 text-gray-500">{row.dateCreated}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${statusPill(row.status)}`}>{row.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onViewOpp(row)} className="text-gray-400 hover:text-gray-700 font-bold text-[18px] tracking-widest">···</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-[13px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Opportunity Title</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Applicants name</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Applicant role</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Date received</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                  <td className="px-4 py-3 font-medium text-gray-800">{row.oppTitle}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onViewArtist(row)}
                      className="text-[#8D5D1D] hover:underline font-medium"
                    >
                      {row.applicantName}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{row.role}</td>
                  <td className="px-4 py-3 text-gray-500">{row.dateReceived}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${statusPill(row.status)}`}>{row.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onViewApp(row)} className="text-gray-400 hover:text-gray-700 font-bold text-[18px] tracking-widest">···</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-500">
        <span>Showing 1–{data.length} of {data.length}</span>
        <div className="flex gap-1">
          {[1, 2, 3].map(p => (
            <button key={p} className={`w-7 h-7 rounded-lg ${p === 1 ? 'bg-[#8D5D1D] text-white' : 'hover:bg-gray-100 text-gray-500'}`}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN PAGE ───────────────────────────────────────────────── */
const OrgApplicationsPage = () => {
  const [activeCard, setActiveCard] = useState('opps'); // 'opps' | 'apps' | 'active'
  const [viewOpp, setViewOpp] = useState(null);
  const [viewApp, setViewApp] = useState(null);
  const [viewArtist, setViewArtist] = useState(null);

  const statCards = [
    {
      key: 'opps',
      label: 'All Opportunities',
      value: 5,
      sub: 'In the last 30 days',
      bg: '#EBF4FF',
      activeBg: '#D6EAFF',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
      iconBg: '#BFDBFE',
    },
    {
      key: 'apps',
      label: 'Applications',
      value: 102,
      sub: 'In the last 30 days',
      bg: '#EDFAF3',
      activeBg: '#D4F5E5',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      iconBg: '#BBF7D0',
    },
    {
      key: 'active',
      label: 'Active Opportunities',
      value: 2,
      sub: 'In the last 30 days',
      bg: '#FFF8EC',
      activeBg: '#FDEFC4',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      iconBg: '#FDE68A',
    },
  ];

  const tableTitle = activeCard === 'opps' ? 'All Opportunities' : activeCard === 'apps' ? 'Application list' : 'Active Opportunity list';

  return (
    <DashboardLayout>
      {/* Content area with relative positioning for drawer overlay */}
      <div className="relative">
        {/* Artist Profile Drawer overlay */}
        {viewArtist && (
          <ArtistProfileDrawer
            artist={{ name: viewArtist.applicantName, ...MOCK_APPLICANT_DETAILS }}
            onBack={() => setViewArtist(null)}
          />
        )}

        {/* Page header */}
        <div className="mb-5">
          <h1 className="font-[Montserrat,sans-serif] font-bold text-[22px] text-gray-900">Applications</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">View all activities regarding your applications on interflow.</p>
        </div>

        {/* Stat cards */}
        <div className="flex gap-4 mb-6">
          {statCards.map(card => {
            const isActive = activeCard === card.key;
            return (
              <button
                key={card.key}
                onClick={() => setActiveCard(card.key)}
                className={`flex-1 rounded-2xl p-4 text-left transition-all ${isActive ? 'ring-2 ring-[#8D5D1D]' : ''}`}
                style={{ backgroundColor: isActive ? card.activeBg : card.bg }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-semibold text-gray-700">{card.label}</p>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: card.iconBg }}>
                    {card.icon}
                  </div>
                </div>
                <p className="text-[28px] font-bold text-gray-900 leading-none mb-1">{card.value}</p>
                <p className="text-[11px] text-gray-400">{card.sub}</p>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <TableWrapper
          title={tableTitle}
          view={activeCard}
          onViewOpp={setViewOpp}
          onViewApp={setViewApp}
          onViewArtist={setViewArtist}
        />
      </div>

      {/* Modals */}
      {viewOpp && <ViewOpportunityModal opp={viewOpp} onClose={() => setViewOpp(null)} />}
      {viewApp && <ApplicationResponseModal app={viewApp} onClose={() => setViewApp(null)} />}
    </DashboardLayout>
  );
};

export default OrgApplicationsPage;
