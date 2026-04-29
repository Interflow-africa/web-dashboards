import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Layout.css';
import {
  LayoutDashboard, User, Users, Briefcase, FileText,
  Share2, HelpCircle, Settings, Bell, Mail, Search,
  LogOut, Menu, X, ClipboardList,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { notificationsAPI } from '@/services/index';

const ARTIST_NAV = [
  { label: 'Dashboard',       icon: LayoutDashboard, to: '/dashboard' },
  { label: 'My Portfolio',    icon: User,            to: '/portfolio' },
  { label: 'My Network',      icon: Users,           to: '/network' },
  { label: 'Opportunities',   icon: Briefcase,       to: '/opportunities' },
  { label: 'Applications',    icon: FileText,        to: '/applications' },
  { label: 'Share Portfolio', icon: Share2,          to: '/portfolio/share' },
];

const ORG_NAV = [
  { label: 'Dashboard',     icon: LayoutDashboard, to: '/org/dashboard' },
  { label: 'Profile',       icon: User,            to: '/org/profile' },
  { label: 'Opportunities', icon: Briefcase,       to: '/org/opportunities' },
  { label: 'Applications',  icon: FileText,        to: '/org/applications' },
  { label: 'Forms',         icon: ClipboardList,   to: '/org/forms' },
  { label: 'Messages',      icon: Mail,            to: '/messages' },
];

const BOTTOM_NAV = [
  { label: 'Support',  icon: HelpCircle, to: '/support' },
  { label: 'Settings', icon: Settings,   to: '/settings' },
];

const SidebarLink = ({ to, icon: Icon, label, badge, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-[10px] rounded-xl mb-0.5 text-[13.5px] font-medium transition-all ${
        isActive
          ? 'bg-[#8B6914] text-white shadow-sm'
          : 'text-white/50 hover:text-white/80 hover:bg-white/6'
      }`
    }
  >
    <Icon size={16} strokeWidth={1.8} />
    <span>{label}</span>
    {badge > 0 && (
      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-px">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </NavLink>
);

const DashboardLayout = ({ children }) => {
  const { user, logout }            = useAuthStore();
  const navigate                    = useNavigate();
  const [unread, setUnread]         = useState(0);
  const [search, setSearch]         = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isOrg  = user?.role === 'organization';
  const links  = isOrg ? ORG_NAV : ARTIST_NAV;

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'U'
    : 'U';

  const displayName = user
    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email?.split('@')[0]
    : '';

  useEffect(() => {
    notificationsAPI.unreadCount()
      .then(r => setUnread(r.data.data?.unread_count || 0))
      .catch(() => {});
    const id = setInterval(() => {
      notificationsAPI.unreadCount()
        .then(r => setUnread(r.data.data?.unread_count || 0))
        .catch(() => {});
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const closeSidebar = () => setDrawerOpen(false);
  const handleLogout = async () => { await logout(); navigate('/login'); };

  /* Sidebar content reused for both desktop fixed and mobile drawer */
  const SidebarContent = () => (
    <>
      <div className="flex flex-col items-center pt-7 pb-5 px-4 border-b border-white/8">
        <div className="w-[56px] h-[56px] rounded-full overflow-hidden bg-[#8B6914]/30 ring-2 ring-[#8B6914]/40 mb-2 flex items-center justify-center">
          {user?.avatar
            ? <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
            : <span className="text-white font-bold text-[17px]">{initials}</span>
          }
        </div>
        <p className="text-white text-[13px] font-semibold leading-tight text-center">{displayName}</p>
        <p className="text-white/40 text-[11px] mt-0.5">{isOrg ? 'Admin' : 'Artist'}</p>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <p className="text-[9.5px] font-bold text-white/25 uppercase tracking-widest px-2 mb-2">Menu</p>
        {links.map(item => (
          <SidebarLink key={item.to} {...item} onClick={closeSidebar} />
        ))}
      </nav>

      <div className="px-3 pb-5 border-t border-white/8 pt-3">
        {BOTTOM_NAV.map(item => (
          <SidebarLink key={item.to} {...item} onClick={closeSidebar} />
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-[10px] w-full rounded-xl text-[13.5px] font-medium text-white/35 hover:text-red-400 hover:bg-white/5 transition-all mt-1"
        >
          <LogOut size={16} strokeWidth={1.8} />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#F4F4F2]">

      {/* ── Desktop sidebar (lg+) ── */}
      <aside className="hidden lg:flex w-[220px] shrink-0 bg-[#0D0D0D] flex-col fixed left-0 top-0 h-screen z-30">
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer backdrop ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Mobile slide-out drawer ── */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[240px] bg-[#0D0D0D] flex flex-col z-50 transition-transform duration-300 lg:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
        >
          <X size={15} />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 lg:ml-[220px] flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="bg-white h-[60px] lg:h-[68px] flex items-center px-4 lg:px-7 gap-3 lg:gap-5 sticky top-0 z-20 border-b border-[#EBEBEB]">

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F5F5F5] text-[#333] transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <img
            src="/assets/icons/interflow-logo.svg"
            alt="Interflow"
            className="hidden sm:block"
            style={{ height: 32, width: 'auto' }}
          />

          {/* Search bar (hidden on xs, visible sm+) */}
          <div className="hidden sm:flex flex-1 max-w-[380px] mx-auto relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AAAAAA]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Interflow..."
              className="w-full bg-[#F5F5F5] rounded-full pl-9 pr-4 py-[9px] text-[13px] outline-none placeholder:text-[#BBBBBB] focus:ring-2 focus:ring-[#8B6914]/20"
            />
          </div>

          {/* Right icons */}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F5F5F5] text-[#666] transition-colors"
            >
              <Bell size={17} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            <button className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center hover:bg-[#F5F5F5] text-[#666] transition-colors">
              <Mail size={17} />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-[12px] font-bold ml-1"
            >
              {initials}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-7 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
