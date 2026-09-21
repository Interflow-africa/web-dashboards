import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, Receipt, LifeBuoy,
  SlidersHorizontal, ScrollText, ScanLine, LogOut, Menu, X, ExternalLink,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import InterflowLogo from '@/components/common/InterflowLogo';

const NAV = [
  { label: 'Overview',  icon: LayoutDashboard,    to: '/admin' },
  { label: 'People',    icon: Users,              to: '/admin/people' },
  { label: 'Events',    icon: CalendarDays,       to: '/admin/events' },
  { label: 'Orders',    icon: Receipt,            to: '/admin/orders' },
  { label: 'Support',   icon: LifeBuoy,           to: '/admin/support' },
  { label: 'Settings',  icon: SlidersHorizontal,  to: '/admin/settings' },
  { label: 'Audit log', icon: ScrollText,         to: '/admin/audit' },
];

/* The door scanner is a staff tool, so it lives here rather than
   competing with the console to be where staff land after login. */
const TOOLS = [
  { label: 'Check-in', icon: ScanLine, to: '/check-in' },
];

const Link = ({ to, icon: Icon, label, onClick, end }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-[10px] rounded-lg mb-0.5 text-[13.5px] font-medium transition-colors ${
        isActive
          ? 'bg-[#8D5D1D] text-white'
          : 'text-white/55 hover:text-white hover:bg-white/8'
      }`
    }
  >
    <Icon size={16} strokeWidth={1.8} />
    <span>{label}</span>
  </NavLink>
);

const AdminLayout = ({ children, title, subtitle, actions }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);

  const close = () => setDrawer(false);
  const signOut = async () => { await logout(); navigate('/login'); };

  const Sidebar = () => (
    <>
      <div className="px-4 pt-6 pb-5 border-b border-white/10">
        <InterflowLogo variant="light" style={{ height: 26, width: 'auto' }} />
        <p className="text-[10px] font-bold text-[#D4A84B] uppercase tracking-[0.16em] mt-2.5">
          Admin Console
        </p>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {NAV.map(item => (
          <Link key={item.to} {...item} end={item.to === '/admin'} onClick={close} />
        ))}

        <p className="text-[9.5px] font-bold text-white/25 uppercase tracking-widest px-3 mt-5 mb-2">Tools</p>
        {TOOLS.map(item => <Link key={item.to} {...item} onClick={close} />)}

        {/* Honest link out rather than a placeholder screen: connections,
            notification settings, call-for-artists forms and artist media
            still live in Django admin. */}
        <a
          href={`${(import.meta.env.VITE_API_URL || '').replace(/\/api\/v1\/?$/, '')}/admin/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-[10px] rounded-lg text-[13.5px] font-medium text-white/40 hover:text-white/75 hover:bg-white/8 transition-colors"
        >
          <ExternalLink size={16} strokeWidth={1.8} />
          Django admin
        </a>
      </nav>

      <div className="px-3 pb-5 pt-3 border-t border-white/10">
        <p className="px-3 pb-2 text-[11px] text-white/40 truncate">{user?.email || 'Signed in'}</p>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-[10px] w-full rounded-lg text-[13.5px] font-medium text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} strokeWidth={1.8} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#EEF1F4]">
      <aside className="hidden lg:flex w-[216px] shrink-0 bg-[#11161C] flex-col fixed left-0 top-0 h-screen z-30">
        <Sidebar />
      </aside>

      {drawer && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={close} />}
      <aside className={`fixed left-0 top-0 h-screen w-[240px] bg-[#11161C] flex flex-col z-50 transition-transform duration-300 lg:hidden ${
        drawer ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={close}
          className="absolute top-4 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white">
          <X size={15} />
        </button>
        <Sidebar />
      </aside>

      <div className="flex-1 min-w-0 lg:ml-[216px] flex flex-col min-h-screen">
        <header className="bg-white border-b border-[#D7DDE4] px-4 lg:px-7 py-3.5 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setDrawer(true)}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#EEF1F4] text-[#11161C] shrink-0">
            <Menu size={19} />
          </button>
          <div className="min-w-0">
            <h1 className="font-bold text-[17px] text-[#11161C] truncate"
              style={{ fontFamily: 'Montserrat, sans-serif' }}>{title}</h1>
            {subtitle && <p className="text-[12.5px] text-[#667382] truncate">{subtitle}</p>}
          </div>
          {actions && <div className="ml-auto flex items-center gap-2 shrink-0">{actions}</div>}
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-7" style={{ overflowX: 'clip' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
