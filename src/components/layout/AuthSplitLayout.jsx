import React from 'react';
import '../auth/Auth.css';
import InterflowLogo from '../common/InterflowLogo';

/**
 * AuthSplitLayout
 * – Left panel: always full-width on mobile, leftWidth% on md+
 * – Right panel: hidden on mobile, shown on md+
 * – Optional topBar renders above the split
 */
const AuthSplitLayout = ({
  children,
  imageSrc,
  imageAlt = '',
  leftWidth = '50',
  topBar,
}) => (
  <div className="min-h-screen flex flex-col">
    {topBar}

    <div className="flex flex-1">

      {/* ── Left: form panel ── */}
      <div
        className="auth-left-panel relative flex flex-col overflow-y-auto bg-white px-6 sm:px-10 py-8 sm:py-10"
        style={{ '--auth-left-width': `${leftWidth}%` }}
      >
        {/* Decorative arcs – top-right corner */}
        <div
          className="pointer-events-none absolute top-0 right-0 overflow-hidden"
          style={{ width: 220, height: 220 }}
        >
          <div className="absolute" style={{ top: -80, right: -80, width: 260, height: 260, border: '1px solid #E8E0D0', borderRadius: '50%' }} />
          <div className="absolute" style={{ top: -50, right: -50, width: 200, height: 200, border: '1px solid #EDE8DF', borderRadius: '50%' }} />
          <div className="absolute" style={{ top: -20, right: -20, width: 140, height: 140, border: '1px solid #F2EDE5', borderRadius: '50%' }} />
        </div>

        {/* Logo */}
        <div className="relative z-10 mb-8">
          <InterflowLogo variant="dark" style={{ height: 48, width: 'auto' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          {children}
        </div>
      </div>

      {/* ── Right: image panel ── */}
      <div className="relative hidden md:block flex-1">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]" />
        )}
      </div>

    </div>
  </div>
);

export default AuthSplitLayout;
