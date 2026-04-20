import React from 'react';
import Logo from '@/components/common/Logo';

const STEPS = [
  { n: '01', title: 'Personal Details',    desc: 'Fill in your personal details to get started' },
  { n: '02', title: 'Proficiency Scale',   desc: 'Indicate your proficiency level on the scale.' },
  { n: '03', title: 'Styles & Skills',     desc: 'Select your styles, skills and portfolio focus.' },
  { n: '04', title: 'Customize Portfolio', desc: 'Upload images and photos of your choice.' },
  { n: '05', title: 'Previous Experience', desc: 'Fill in details of your career and education.' },
  { n: '06', title: 'Make Connections',    desc: 'Select connections from the list to get started.' },
];

const OnboardingLayout = ({ children, currentStep = 1 }) => (
  <div className="min-h-screen flex flex-col">
    {/* ── Top nav ── */}
    <header className="bg-white border-b border-[#EBEBEB] h-[72px] flex items-center px-8 shrink-0">
      <Logo variant="default" size="md" />
    </header>

    <div className="flex flex-1 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-[270px] shrink-0 bg-[#0D0D0D] flex flex-col py-10 px-7 overflow-y-auto">
        {STEPS.map((s, i) => {
          const stepNum  = i + 1;
          const isActive = stepNum === currentStep;
          const isDone   = stepNum < currentStep;

          return (
            <div key={s.n} className="relative flex gap-4">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className="absolute left-[17px] top-[34px] w-[2px] bottom-0"
                  style={{
                    height: 'calc(100% + 8px)',
                    background: isDone ? '#8B6914' : 'rgba(255,255,255,0.12)',
                  }}
                />
              )}

              {/* Circle */}
              <div
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold z-10 mt-0.5"
                style={{
                  background:   isActive || isDone ? '#8B6914' : 'transparent',
                  border:       isActive || isDone ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
                  color:        isActive || isDone ? '#fff' : 'rgba(255,255,255,0.45)',
                }}
              >
                {s.n}
              </div>

              {/* Text */}
              <div className="pb-9">
                <p
                  className="text-[13.5px] font-semibold leading-tight"
                  style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}
                >
                  {s.title}
                </p>
                <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </aside>

      {/* ── Main content ── */}
      <main className="relative flex-1 bg-[#F9F7F4] overflow-y-auto">
        {/* Decorative arcs */}
        <div className="pointer-events-none absolute top-0 right-0 overflow-hidden" style={{ width: 280, height: 280 }}>
          <div className="absolute" style={{ top: -100, right: -100, width: 340, height: 340, border: '1px solid #DDD8CF', borderRadius: '50%' }} />
          <div className="absolute" style={{ top: -65,  right: -65,  width: 260, height: 260, border: '1px solid #E5E0D8', borderRadius: '50%' }} />
          <div className="absolute" style={{ top: -30,  right: -30,  width: 180, height: 180, border: '1px solid #EDE9E2', borderRadius: '50%' }} />
        </div>

        <div className="relative z-10 max-w-[680px] mx-auto px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  </div>
);

export default OnboardingLayout;
