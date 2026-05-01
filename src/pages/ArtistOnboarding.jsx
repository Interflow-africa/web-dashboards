import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { ArrowRight, Image, Play, UserPlus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import getApiError from '@/utils/apiError';
import OnboardingLayout from '@/components/layout/OnboardingLayout';
import FloatingInput from '@/components/common/FloatingInput';
import FloatingSelect from '@/components/common/FloatingSelect';
import { artistAPI, connectionsAPI } from '@/services/index';

/* ─── Shared gold button ────────────────────────────────────────── */
const GoldBtn = ({ children, onClick, disabled, type = 'button', outline = false, className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-2 px-7 py-3 rounded-full text-[14px] font-semibold transition-all disabled:opacity-55 ${
      outline
        ? 'border-2 border-[#8B6914] text-[#8B6914] hover:bg-[#8B6914]/10 bg-white'
        : 'bg-[#8B6914] text-white hover:bg-[#7A5C12]'
    } ${className}`}
  >
    {children}
  </button>
);

/* ─── Multi-select pill checkbox grid ───────────────────────────── */
const MultiCheckbox = ({ options, selected, onChange, columns = 2 }) => {
  const toggle = (val) =>
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);

  const colClass = columns === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
    : columns === 2 ? 'grid-cols-1 sm:grid-cols-2'
    : 'grid-cols-1';

  return (
    <div className={`grid gap-2 ${colClass}`}>
      {options.map(({ label, value }) => {
        const active = selected.includes(value);
        return (
          <label
            key={value}
            onClick={() => toggle(value)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 cursor-pointer text-[13px] font-medium transition-all select-none ${
              active
                ? 'border-[#8B6914] bg-[#FBF5E8] text-[#8B6914]'
                : 'border-[#E8E4DC] bg-[#FAFAF7] text-[#555] hover:border-[#C8A870]'
            }`}
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-all ${
              active ? 'bg-[#8B6914] border-[#8B6914]' : 'border-[#CCC]'
            }`}>
              {active && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            {label}
          </label>
        );
      })}
    </div>
  );
};

/* ─── Section label ─────────────────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <p className="text-[14px] font-semibold text-[#1A1A1A] pt-2 pb-1">{children}</p>
);

/* ═══════════════════════════════════════════════════════════════════
   DISCIPLINE CONFIG — drives Steps 2 & 3 dynamically
   ═══════════════════════════════════════════════════════════════════ */
const DISCIPLINES = [
  { label: "Dancer", value: "dancer" },
  { label: "Poet / Spoken Word Artist", value: "poet_spoken_word" },
  { label: "Musician", value: "musician" },
  { label: "Singer / Vocalist", value: "singer_vocalist" },
  { label: "Theatre Performer / Actor", value: "theatre_performer" },
  { label: "Performance Artist", value: "performance_artist" },
  { label: "Storyteller", value: "storyteller" },
  { label: "Multidisciplinary Performer", value: "multidisciplinary" },
];

const DISCIPLINE_CONFIG = {
  dancer: {
    stylesLabel: "Dance Style",
    styles: [
      { label: "Afro Dance", value: "afro_dance" },
      { label: "Contemporary", value: "contemporary" },
      { label: "Hip Hop", value: "hip_hop" },
      { label: "Street Dance", value: "street_dance" },
      { label: "Traditional Dance", value: "traditional_dance" },
      { label: "Ballet", value: "ballet" },
      { label: "Experimental / Fusion", value: "experimental_fusion" },
      {
        label: "Choreographic Performance",
        value: "choreographic_performance",
      },
    ],
    roles: [
      { label: "Choreographer", value: "choreographer" },
      { label: "Dance Instructor", value: "dance_instructor" },
      { label: "Freestyle Dancer", value: "freestyle_dancer" },
      { label: "Performer", value: "performer" },
    ],
    proficiencySkills: ["Dance", "Choreography", "Stage Presence", "Teaching"],
    hasInstruments: false,
    hasMusicStyles: false,
  },
  poet_spoken_word: {
    stylesLabel: "Performance Style",
    styles: [
      { label: "Spoken Word", value: "spoken_word" },
      { label: "Slam Poetry", value: "slam_poetry" },
      { label: "Performance Poetry", value: "performance_poetry" },
      { label: "Storytelling", value: "storytelling" },
      { label: "Experimental Poetry", value: "experimental_poetry" },
      { label: "Musical Poetry", value: "musical_poetry" },
    ],
    roles: [
      { label: "Performer", value: "performer" },
      { label: "Writer", value: "writer" },
    ],
    proficiencySkills: [
      "Performance",
      "Writing",
      "Stage Presence",
      "Audience Engagement",
    ],
    hasInstruments: false,
    hasMusicStyles: false,
  },
  musician: {
    stylesLabel: "Instrument",
    styles: [],
    roles: [
      { label: "Performer", value: "performer" },
      { label: "Composer", value: "composer" },
      { label: "Band Member", value: "band_member" },
      { label: "Producer", value: "producer" },
    ],
    proficiencySkills: [
      "Instrument",
      "Composition",
      "Production",
      "Performance",
    ],
    hasInstruments: true,
    hasMusicStyles: false,
    instruments: [
      { label: "Guitar", value: "guitar" },
      { label: "Piano / Keyboard", value: "piano_keyboard" },
      { label: "Drums / Percussion", value: "drums_percussion" },
      { label: "Bass", value: "bass" },
      { label: "Violin", value: "violin" },
      { label: "Saxophone", value: "saxophone" },
      { label: "Trumpet", value: "trumpet" },
      { label: "Traditional Instrument", value: "traditional_instrument" },
    ],
  },
  singer_vocalist: {
    stylesLabel: "Vocal Type",
    styles: [
      { label: "Lead Vocalist", value: "lead_vocalist" },
      { label: "Backup Vocalist", value: "backup_vocalist" },
      { label: "Choir Singer", value: "choir_singer" },
      { label: "Spoken Vocalist", value: "spoken_vocalist" },
      { label: "Other", value: "other" },
    ],
    roles: [
      { label: "Lead Vocalist", value: "lead_vocalist" },
      { label: "Backup Vocalist", value: "backup_vocalist" },
      { label: "Choir Singer", value: "choir_singer" },
      { label: "Spoken Vocalist", value: "spoken_vocalist" },
      { label: "Other", value: "other" },
    ],
    proficiencySkills: [
      "Vocals",
      "Stage Presence",
      "Performance",
      "Songwriting",
    ],
    hasInstruments: false,
    hasMusicStyles: true,
    musicStyles: [
      { label: "Afrobeat", value: "afrobeat" },
      { label: "Jazz", value: "jazz" },
      { label: "Soul", value: "soul" },
    ],
  },
  theatre_performer: {
    stylesLabel: "Theatre Style",
    styles: [
      { label: "Stage Acting", value: "stage_acting" },
      { label: "Screen Acting", value: "screen_acting" },
      { label: "Classical Theatre", value: "classical_theatre" },
      { label: "Improv Comedy", value: "improv_comedy" },
      { label: "Experimental Theatre", value: "experimental_theatre" },
    ],
    roles: [
      { label: "Actor", value: "actor" },
      { label: "Writer", value: "writer" },
      { label: "Performer", value: "performer" },
    ],
    proficiencySkills: [
      "Acting",
      "Stage Presence",
      "Directing",
      "Character Development",
    ],
    hasInstruments: false,
    hasMusicStyles: false,
  },
  performance_artist: {
    stylesLabel: "Performance Type",
    styles: [
      { label: "Conceptual Performance", value: "conceptual_performance" },
      { label: "Body Art", value: "body_art" },
      { label: "Live Art", value: "live_art" },
      { label: "Installation", value: "installation" },
      { label: "Experimental", value: "experimental" },
    ],
    roles: [
      { label: "Performer", value: "performer" },
      { label: "Director", value: "director" },
    ],
    proficiencySkills: [
      "Conceptual Art",
      "Performance",
      "Audience Engagement",
      "Creative Direction",
    ],
    hasInstruments: false,
    hasMusicStyles: false,
  },
  storyteller: {
    stylesLabel: "Storytelling Style",
    styles: [
      { label: "Oral Tradition", value: "oral_tradition" },
      { label: "Folk Storytelling", value: "folk_storytelling" },
      { label: "Digital Storytelling", value: "digital_storytelling" },
      {
        label: "Contemporary Storytelling",
        value: "contemporary_storytelling",
      },
    ],
    roles: [
      { label: "Performer", value: "performer" },
      { label: "Writer", value: "writer" },
    ],
    proficiencySkills: [
      "Narrative",
      "Performance",
      "Writing",
      "Audience Engagement",
    ],
    hasInstruments: false,
    hasMusicStyles: false,
  },
  multidisciplinary: {
    stylesLabel: "Performance Style",
    styles: [
      { label: "Mixed Media", value: "mixed_media" },
      { label: "Experimental", value: "experimental" },
      { label: "Cross-Genre", value: "cross_genre" },
      { label: "Hybrid Art", value: "hybrid_art" },
    ],
    roles: [
      { label: "Performer", value: "performer" },
      { label: "Director", value: "director" },
      { label: "Composer", value: "composer" },
      { label: "Writer", value: "writer" },
    ],
    proficiencySkills: ["Performance", "Choreography", "Music", "Visual Art"],
    hasInstruments: false,
    hasMusicStyles: false,
  },
};

/* ─── Shared option lists ───────────────────────────────────────── */
const CAREER_STAGES = [
  { label: 'Student',                   value: 'student' },
  { label: 'Emerging Artist',           value: 'emerging' },
  { label: 'Early Career',              value: 'early_career' },
  { label: 'Mid-Career',                value: 'mid_career' },
  { label: 'Established Performer',     value: 'established' },
  { label: 'Independent / Self-taught', value: 'independent' },
];

const CURRENT_FOCUS_OPTIONS = [
  { label: "Building my first portfolio", value: "first_portfolio" },
  { label: "Preparing for performances", value: "preparing" },
  { label: "Creating new work", value: "creating" },
  { label: "Collaborating with other artists", value: "collaborating" },
  { label: "Applying for opportunities", value: "applying" },
  { label: "Touring / performing regularly", value: "touring" },
];

const PRONOUN_OPTIONS = [
  { value: 'he_him',            label: 'He/Him' },
  { value: 'she_her',           label: 'She/Her' },
  { value: 'they_them',         label: 'They/Them' },
  { value: 'other', label: 'Prefer not to say' },
];

const INDUSTRY_FOCUS_OPTIONS = [
  { label: "Live Performance", value: "live_performance" },
  { label: "Music Industry", value: "music_industry" },
  { label: "Performing Arts", value: "performing_arts" },
  { label: "Festivals & Cultural Events", value: "festivals_cultural_events" },
  { label: "Theatre", value: "theatre" },
  { label: "Arts Education", value: "arts_education" },
  { label: "Digital Performance / Online Shows", value: "digital_performance" },
];

const SPECIAL_SKILLS_OPTIONS = [
  { label: "Improvisation", value: "improvisation" },
  { label: "Live Stage Performance", value: "live_stage_performance" },
  { label: "Freestyle / Battle", value: "freestyle_battle" },
  { label: "Songwriting", value: "songwriting" },
  { label: "Choreography", value: "choreography" },
  { label: "Stage Presence", value: "stage_presence" },
  { label: "Audience Engagement", value: "audience_engagement" },
  { label: "Collaborative Performance", value: "collaborative_performance" },
  { label: "Workshop Facilitation", value: "workshop_facilitation" },
  { label: "Creative Direction", value: "creative_direction" },
  { label: "Other", value: "other" }
];

const PORTFOLIO_FOCUS_OPTIONS = [
  { label: 'Live Performances',      value: 'live_performances' },
  { label: 'Competitions / Battles', value: 'competitions_battles' },
  { label: 'Festivals',              value: 'festivals' },
  { label: 'Collaborations',         value: 'collaborations' },
  { label: 'Recorded Performances',  value: 'recorded_performances' },
  { label: 'Workshops / Teaching',   value: 'workshops_teaching' },
  { label: 'Community Performances', value: 'community_performances' },
];

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']
  .map((m, i) => ({ value: String(i + 1).padStart(2, '0'), label: m }));

const YEARS = Array.from({ length: 40 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});

/* ════════════════════════════════════════════════════════════════
   STEP 1 — Personal Details
   ════════════════════════════════════════════════════════════════ */
const Step1 = ({ onNext }) => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', country: '', city: '',
    willingToTravel: false, pronoun: '',
    primaryDiscipline: '', professionalRole: '', jobTitle: '',
    careerStage: '', currentFocus: '', bio: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const config = form.primaryDiscipline ? DISCIPLINE_CONFIG[form.primaryDiscipline] : null;
  const roleOptions = config?.roles || [];

  const handleNext = async () => {
    if (!form.firstName || !form.lastName) { toast.error('First and last name are required'); return; }
    if (!form.primaryDiscipline) { toast.error('Please select your primary discipline'); return; }
    try {
      await artistAPI.step1({
        first_name:          form.firstName,
        last_name:           form.lastName,
        country:             form.country,
        city:                form.city,
        willing_to_travel:   form.willingToTravel,
        pronoun:             form.pronoun,
        primary_discipline:  form.primaryDiscipline,
        professional_role:   form.professionalRole,
        job_title:           form.jobTitle,
        career_stage:        form.careerStage,
        current_focus:       form.currentFocus,
        bio:                 form.bio,
      });
      onNext(form.primaryDiscipline);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to save details'));
    }
  };

  return (
    <>
      <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        Welcome! Get Started with Your Portfolio
      </h2>
      <p className="text-[13.5px] text-[#888] mb-8 leading-relaxed">
        Start by providing key details about yourself to build a strong and credible portfolio.
      </p>

      <div className="bg-white rounded-2xl border border-[#EBEBEB] p-8 space-y-5">
        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput label="First name*" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
          <FloatingInput label="Last name*"  value={form.lastName}  onChange={e => set('lastName',  e.target.value)} />
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput label="Country" value={form.country} onChange={e => set('country', e.target.value)} />
          <FloatingInput label="City"    value={form.city}    onChange={e => set('city',    e.target.value)} />
        </div>

        {/* Willing to travel toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set('willingToTravel', !form.willingToTravel)}
            className={`w-11 h-6 rounded-full transition-all relative cursor-pointer shrink-0 ${form.willingToTravel ? 'bg-[#8B6914]' : 'bg-[#DDD]'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.willingToTravel ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
          <span className="text-[13.5px] text-[#555]">Willing to travel</span>
        </label>

        {/* Pronoun */}
        <FloatingSelect label="Preferred pronoun" value={form.pronoun} options={PRONOUN_OPTIONS} onChange={e => set('pronoun', e.target.value)} />

        <p className="text-[14px] font-semibold text-[#1A1A1A] pt-1">What do you do in the Industry?</p>

        {/* Primary Discipline */}
        <FloatingSelect
          label="Primary Discipline*"
          value={form.primaryDiscipline}
          options={DISCIPLINES}
          onChange={e => { set('primaryDiscipline', e.target.value); set('professionalRole', ''); }}
        />

        {/* Dynamic Role — shown only after discipline is selected and has roles */}
        {roleOptions.length > 0 && (
          <FloatingSelect
            label="Professional Role"
            value={form.professionalRole}
            options={roleOptions}
            onChange={e => set('professionalRole', e.target.value)}
          />
        )}

        <FloatingInput label="Job Title" value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} />

        {/* Career Stage */}
        <FloatingSelect label="Career Stage" value={form.careerStage} options={CAREER_STAGES} onChange={e => set('careerStage', e.target.value)} />

        {/* Current Creative Focus */}
        <FloatingSelect label="Current Creative Focus" value={form.currentFocus} options={CURRENT_FOCUS_OPTIONS} onChange={e => set('currentFocus', e.target.value)} />

        {/* Bio */}
        <div className="relative">
          <textarea
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            rows={4}
            className="w-full border border-[#DCDCDC] rounded-xl px-4 pt-5 pb-3 text-[14px] text-[#1A1A1A] resize-none outline-none focus:border-[#8B6914] transition-colors"
            placeholder="Short bio (optional)"
          />
        </div>

        <div className="flex justify-center pt-2">
          <GoldBtn onClick={handleNext}>Next <ArrowRight size={15} /></GoldBtn>
        </div>
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   STEP 2 — Proficiency Scale (discipline-aware)
   ════════════════════════════════════════════════════════════════ */
const RatingRow = ({ skill, value, onChange }) => (
  <div className="flex items-center gap-6">
    <div className="w-[160px] bg-[#F0EDE6] rounded-full px-4 py-2 text-[13px] font-medium text-[#5C4A1E] text-center shrink-0">
      {skill}
    </div>
    <div className="flex gap-3">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-10 h-10 rounded-full text-[14px] font-semibold border-2 transition-all ${
            value === n
              ? 'bg-[#8B6914] border-[#8B6914] text-white'
              : 'border-[#C8A870] text-[#C8A870] hover:border-[#8B6914] hover:text-[#8B6914]'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  </div>
);

const Step2 = ({ onNext, discipline }) => {
  const config = DISCIPLINE_CONFIG[discipline] || DISCIPLINE_CONFIG.multidisciplinary;
  const skillNames = config.proficiencySkills;

  const [ratings, setRatings] = useState(() =>
    Object.fromEntries(skillNames.map(s => [s, 0]))
  );
  const setRating = (k, v) => setRatings(r => ({ ...r, [k]: v }));

  const handleNext = async () => {
    try {
      const ratingsPayload = Object.fromEntries(
        Object.entries(ratings).map(([k, v]) => [k.toLowerCase().replace(/[\s/]+/g, '_'), v])
      );
      await artistAPI.step2({ ratings: ratingsPayload });
      onNext();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to save proficiency'));
    }
  };

  return (
    <>
      <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-1 text-center" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        What is your professional proficiency in these areas?
      </h2>
      <p className="text-[13.5px] text-[#888] mb-8 text-center leading-relaxed max-w-[520px] mx-auto">
        1 indicates amateur level — 5 indicates the highest professional level.
      </p>
      <div className="bg-white rounded-2xl border border-[#EBEBEB] p-10">
        <div className="space-y-6">
          {skillNames.map(skill => (
            <RatingRow key={skill} skill={skill} value={ratings[skill]} onChange={v => setRating(skill, v)} />
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <GoldBtn onClick={handleNext}>Next <ArrowRight size={15} /></GoldBtn>
        </div>
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   STEP 3 — Styles, Skills & Portfolio Focus (discipline-aware)
   ════════════════════════════════════════════════════════════════ */
const Step3 = ({ onNext, onSkip, discipline }) => {
  const config = DISCIPLINE_CONFIG[discipline] || DISCIPLINE_CONFIG.multidisciplinary;

  const [performanceStyles,   setPerformanceStyles]   = useState([]);
  const [roles,               setRoles]               = useState([]);
  const [instruments,         setInstruments]         = useState([]);
  const [musicStyles,         setMusicStyles]         = useState([]);
  const [musicStyleOther,     setMusicStyleOther]     = useState('');
  const [industryFocus,       setIndustryFocus]       = useState([]);
  const [specialSkills,       setSpecialSkills]       = useState([]);
  const [specialSkillsOther,  setSpecialSkillsOther]  = useState('');
  const [portfolioFocus,      setPortfolioFocus]      = useState([]);

  const handleNext = async () => {
    try {
      await artistAPI.step3({
        performance_styles:   performanceStyles,
        roles,
        instruments,
        music_styles:         musicStyles,
        music_style_other:    musicStyleOther,
        industry_focus:       industryFocus,
        special_skills:       specialSkills,
        special_skills_other: specialSkillsOther,
        portfolio_focus:      portfolioFocus,
      });
      onNext();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to save skills'));
    }
  };

  return (
    <>
      <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        Styles, Skills & Portfolio Focus
      </h2>
      <p className="text-[13.5px] text-[#888] mb-8 leading-relaxed">
        Tell us more about your styles and what you want to be known for.
      </p>

      <div className="bg-white rounded-2xl border border-[#EBEBEB] p-8 space-y-5">

        {/* Performance Styles — disciplines that have them */}
        {config.styles?.length > 0 && (
          <>
            <SectionLabel>
              {config.stylesLabel}{' '}
              <span className="text-[#999] font-normal text-[12px]">(select all that apply)</span>
            </SectionLabel>
            <MultiCheckbox options={config.styles} selected={performanceStyles} onChange={setPerformanceStyles} />
          </>
        )}

        {/* Instruments — musician only */}
        {config.hasInstruments && (
          <>
            <SectionLabel>
              Instruments{' '}
              <span className="text-[#999] font-normal text-[12px]">(select all that apply)</span>
            </SectionLabel>
            <MultiCheckbox options={config.instruments} selected={instruments} onChange={setInstruments} />
          </>
        )}

        {/* Roles */}
        {config.roles?.length > 0 && (
          <>
            <SectionLabel>Role</SectionLabel>
            <MultiCheckbox options={config.roles} selected={roles} onChange={setRoles} />
          </>
        )}

        {/* Music Style — singer only */}
        {config.hasMusicStyles && (
          <>
            <SectionLabel>Music Style</SectionLabel>
            <MultiCheckbox options={config.musicStyles} selected={musicStyles} onChange={setMusicStyles} />
            <FloatingInput
              label="Other music style (please specify)"
              value={musicStyleOther}
              onChange={e => setMusicStyleOther(e.target.value)}
            />
          </>
        )}

        {/* Industry Focus */}
        <SectionLabel>
          Industry Focus{' '}
          <span className="text-[#999] font-normal text-[12px]">(select all that apply)</span>
        </SectionLabel>
        <MultiCheckbox options={INDUSTRY_FOCUS_OPTIONS} selected={industryFocus} onChange={setIndustryFocus} />

        {/* Special Skills */}
        <SectionLabel>
          Special Skills{' '}
          <span className="text-[#999] font-normal text-[12px]">(select all that apply)</span>
        </SectionLabel>
        <MultiCheckbox options={SPECIAL_SKILLS_OPTIONS} selected={specialSkills} onChange={setSpecialSkills} />
        <FloatingInput
          label="Other special skill (please specify)"
          value={specialSkillsOther}
          onChange={e => setSpecialSkillsOther(e.target.value)}
        />

        {/* Portfolio Focus */}
        <SectionLabel>
          Portfolio Focus{' '}
          <span className="text-[#999] font-normal text-[12px]">(select all that apply)</span>
        </SectionLabel>
        <MultiCheckbox options={PORTFOLIO_FOCUS_OPTIONS} selected={portfolioFocus} onChange={setPortfolioFocus} />

        <div className="flex items-center gap-4 pt-2">
          <GoldBtn onClick={handleNext} className="flex-1 justify-center">Next <ArrowRight size={15} /></GoldBtn>
          <GoldBtn onClick={onSkip} outline className="flex-1 justify-center">Skip</GoldBtn>
        </div>
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   STEP 4 — Customize Portfolio (photo + media upload)
   ════════════════════════════════════════════════════════════════ */
const UploadCard = ({ icon: Icon, title, desc, onDrop, preview }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });
  return (
    <div
      {...getRootProps()}
      className={`flex items-center gap-5 p-5 rounded-xl border-2 cursor-pointer transition-all ${
        isDragActive ? 'border-[#8B6914] bg-[#8B6914]/5' : 'border-[#E8E4DC] bg-[#FAFAF7] hover:border-[#8B6914]/40'
      }`}
    >
      <input {...getInputProps()} />
      <div className="w-[90px] h-[72px] rounded-xl bg-[#EBEBEB] flex items-center justify-center shrink-0 overflow-hidden">
        {preview
          ? <img src={preview} alt="" className="w-full h-full object-cover rounded-xl" />
          : <Icon size={28} strokeWidth={1.4} className="text-[#AAAAAA]" />
        }
      </div>
      <div>
        <p className="text-[14.5px] font-semibold text-[#1A1A1A]">{title}</p>
        <p className="text-[12.5px] text-[#888] leading-snug mt-0.5">{desc}</p>
      </div>
    </div>
  );
};

const Step4 = ({ onNext, onSkip }) => {
  const [avatar,    setAvatar]    = useState(null);
  const [avatarPrev, setAvatarPrev] = useState(null);
  const [media,     setMedia]     = useState(null);

  const onAvatarDrop = useCallback(files => {
    if (files[0]) { setAvatar(files[0]); setAvatarPrev(URL.createObjectURL(files[0])); }
  }, []);
  const onMediaDrop = useCallback(files => { if (files[0]) setMedia(files[0]); }, []);

  const handleNext = async () => {
    try {
      if (avatar) {
        const fd = new FormData(); fd.append('avatar', avatar);
        await artistAPI.uploadAvatar(fd);
      }
      if (media) {
        const fd = new FormData();
        fd.append('file', media);
        fd.append(
          "media_type",
          media.type.startsWith("video") ? "video" : "photo",
        );
        await artistAPI.uploadMedia(fd);
      }
      onNext();
    } catch (err) {
      toast.error(getApiError(err, 'Upload failed'));
    }
  };

  return (
    <>
      <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        Customize your Profile.
      </h2>
      <p className="text-[13.5px] text-[#888] mb-8 leading-relaxed">
        Add a profile photo and showcase media to make your portfolio stand out.
      </p>
      <div className="bg-white rounded-2xl border border-[#EBEBEB] p-8 space-y-4">
        <UploadCard icon={Image} title="Upload Photo" desc="Add your favourite photo. You'll be able to crop it on your profile later." onDrop={onAvatarDrop} preview={avatarPrev} />
        <UploadCard icon={Play}  title="Showcase Media" desc="Add video, audio, and creative projects to your profile here." onDrop={onMediaDrop} />
        <div className="flex items-center gap-4 pt-2">
          <GoldBtn onClick={handleNext} className="flex-1 justify-center">Next <ArrowRight size={15} /></GoldBtn>
          <GoldBtn onClick={onSkip} outline className="flex-1 justify-center">Skip</GoldBtn>
        </div>
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   STEP 5 — Previous Experience
   ════════════════════════════════════════════════════════════════ */
const Step5 = ({ onNext, onSkip }) => {
  const [type,    setType]    = useState('career');
  const [current, setCurrent] = useState(false);
  const [form,    setForm]    = useState({
    org: '', role: '', production: '', degree: '', fieldOfStudy: '',
    startMonth: '', startYear: '', endMonth: '', endYear: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleNext = async () => {
    try {
      const payload = {
        experience_type: type,
        organization:    form.org,
        is_current:      current,
        start_month:     Number(form.startMonth) || undefined,
        start_year:      Number(form.startYear)  || undefined,
        ...(!current && {
          end_month: Number(form.endMonth) || undefined,
          end_year:  Number(form.endYear)  || undefined,
        }),
        ...(type === 'career'
          ? { role_title: form.role, production: form.production }
          : { degree_or_program: form.degree, field_of_study: form.fieldOfStudy }
        ),
      };
      await artistAPI.addExperience(payload);
      onNext();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to save experience'));
    }
  };

  const RadioBtn = ({ value, label }) => (
    <label className="flex items-center gap-2 cursor-pointer" onClick={() => setType(value)}>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${type === value ? 'border-[#22C55E]' : 'border-[#CCCCCC]'}`}>
        {type === value && <div className="w-2 h-2 rounded-full bg-[#22C55E]" />}
      </div>
      <span className="text-[13.5px] font-medium text-[#333]">{label}</span>
    </label>
  );

  return (
    <>
      <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        Where have you previously worked and learned?
      </h2>
      <p className="text-[13.5px] text-[#888] mb-8 text-center leading-relaxed max-w-[520px] mx-auto">
        Workplaces, educational institutions, residencies and training programs.
      </p>
      <div className="bg-white rounded-2xl border border-[#EBEBEB] p-8 space-y-4">
        <FloatingInput label={type === 'career' ? 'Organization*' : 'Educational Institution*'} value={form.org} onChange={e => set('org', e.target.value)} />
        <div className="flex items-center gap-8">
          <RadioBtn value="career"    label="Career Highlights" />
          <RadioBtn value="education" label="Education" />
        </div>
        {type === 'career' ? (
          <>
            <FloatingInput label="Role / Title / Position*" value={form.role}       onChange={e => set('role',       e.target.value)} />
            <FloatingInput label="Production / Show / Work"  value={form.production} onChange={e => set('production', e.target.value)} />
          </>
        ) : (
          <>
            <FloatingInput label="Degree or Program" value={form.degree}       onChange={e => set('degree',       e.target.value)} />
            <FloatingInput label="Field of Study"    value={form.fieldOfStudy} onChange={e => set('fieldOfStudy', e.target.value)} />
          </>
        )}
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={current} onChange={e => setCurrent(e.target.checked)} className="w-4 h-4 rounded accent-[#8B6914]" />
          <span className="text-[13.5px] text-[#555]">I am currently affiliated with this organization</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <FloatingSelect label="Start month" value={form.startMonth} options={MONTHS} onChange={e => set('startMonth', e.target.value)} />
          <FloatingSelect label="Start year"  value={form.startYear}  options={YEARS}  onChange={e => set('startYear',  e.target.value)} />
        </div>
        {!current && (
          <div className="grid grid-cols-2 gap-4">
            <FloatingSelect label="End month" value={form.endMonth} options={MONTHS} onChange={e => set('endMonth', e.target.value)} />
            <FloatingSelect label="End year"  value={form.endYear}  options={YEARS}  onChange={e => set('endYear',  e.target.value)} />
          </div>
        )}
        <div className="flex items-center gap-4 pt-2">
          <GoldBtn onClick={handleNext} className="flex-1 justify-center">Next <ArrowRight size={15} /></GoldBtn>
          <GoldBtn onClick={onSkip} outline className="flex-1 justify-center">Skip</GoldBtn>
        </div>
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   STEP 6 — Make Connections
   ════════════════════════════════════════════════════════════════ */
const MOCK_CONNECTIONS = [
  { id: 1, name: 'Reuben Hamilton', roles: 'Voice, Dancer, Stage Performer, Actor', genres: ['Opera', 'Dance Theatre'], img: '/assets/images/onboarding/connect-1.jpg' },
  { id: 2, name: 'Karim Anderson',  roles: 'Voice, Dancer, Stage Performer, Actor', genres: ['Opera', 'Dance Theatre'], img: '/assets/images/onboarding/connect-2.jpg' },
  { id: 3, name: 'Aderoju Peter',   roles: 'Voice, Dancer, Stage Performer, Actor', genres: ['Opera', 'Dance Theatre'], img: '/assets/images/onboarding/connect-3.jpg' },
  { id: 4, name: 'Mercy Adekanye',  roles: 'Voice, Dancer, Stage Performer, Actor', genres: ['Opera', 'Dance Theatre'], img: '/assets/images/onboarding/connect-4.jpg' },
  { id: 5, name: 'Deborah Kim',     roles: 'Voice, Dancer, Stage Performer, Actor', genres: ['Opera', 'Dance Theatre'], img: '/assets/images/onboarding/connect-5.jpg' },
  { id: 6, name: 'Peter Kingston',  roles: 'Voice, Flutist, Stage Performer, Actor', genres: ['Opera', 'Dance Theatre'], img: '/assets/images/onboarding/connect-6.jpg' },
];

const Step6 = ({ onNext, onSkip }) => {
  const [sent, setSent] = useState(new Set());

  const toggle = async (id) => {
    if (sent.has(id)) return;
    try {
      await connectionsAPI.send({ receiver_id: id });
    } catch { /* ignore */ }
    setSent(s => new Set([...s, id]));
  };

  return (
    <>
      <h2 className="text-[28px] font-bold text-[#1A1A1A] mb-1 text-center" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        Great! Let's start building your network
      </h2>
      <p className="text-[13.5px] text-[#888] mb-8 text-center">Select connections from the list to get started.</p>
      <div className="bg-white rounded-2xl border border-[#EBEBEB] p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {MOCK_CONNECTIONS.map(c => (
            <div key={c.id} className="rounded-xl border border-[#EBEBEB] overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-[140px] bg-[#1a1a1a]">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                <button
                  onClick={() => toggle(c.id)}
                  className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    sent.has(c.id) ? 'bg-[#8B6914] text-white' : 'bg-white/90 text-[#8B6914] hover:bg-[#8B6914] hover:text-white'
                  }`}
                >
                  {sent.has(c.id) ? <Check size={14} /> : <UserPlus size={14} />}
                </button>
              </div>
              <div className="p-3">
                <p className="text-[13.5px] font-semibold text-[#1A1A1A] mb-0.5">{c.name}</p>
                <p className="text-[11.5px] text-[#888] mb-2 leading-snug">{c.roles}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.genres.map(g => (
                    <span key={g} className="text-[11px] px-2.5 py-0.5 bg-[#F5EDD6] text-[#8B6914] rounded-full">{g}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 pt-6">
          <GoldBtn onClick={onNext} className="flex-1 justify-center">Finish <ArrowRight size={15} /></GoldBtn>
          <GoldBtn onClick={onSkip} outline className="flex-1 justify-center">Skip</GoldBtn>
        </div>
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   Main — ArtistOnboarding
   ════════════════════════════════════════════════════════════════ */
const ArtistOnboarding = () => {
  const [step,       setStep]       = useState(1);
  const [discipline, setDiscipline] = useState('multidisciplinary');
  const navigate = useNavigate();

  const next = () => setStep(s => s + 1);
  const skip = () => setStep(s => s + 1);

  const handleStep1Next = (selectedDiscipline) => {
    setDiscipline(selectedDiscipline);
    setStep(2);
  };

  const finish = async () => {
    try { await artistAPI.completeOnboarding(); } catch { /* proceed anyway */ }
    navigate('/dashboard');
  };

  const STEPS = {
    1: <Step1 onNext={handleStep1Next} />,
    2: <Step2 onNext={next} discipline={discipline} />,
    3: <Step3 onNext={next} onSkip={skip} discipline={discipline} />,
    4: <Step4 onNext={next} onSkip={skip} />,
    5: <Step5 onNext={next} onSkip={skip} />,
    6: <Step6 onNext={finish} onSkip={finish} />,
  };

  return (
    <OnboardingLayout currentStep={step}>
      {STEPS[step]}
    </OnboardingLayout>
  );
};

export default ArtistOnboarding;
