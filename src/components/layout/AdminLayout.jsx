import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeSwitcher from '../ui/ThemeSwitcher';

// Visible to both admin and faculty
const NAV_SHARED = [
  { to: '/admin', end: true, label: 'Dashboard', icon: 'space_dashboard' },
  { to: '/admin/papers', label: 'Research Papers', icon: 'description' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'monitoring' },
];

// Visible to admin only
const NAV_ADMIN_ONLY = [
  { to: '/admin/students', label: 'Students', icon: 'group' },
  { to: '/admin/faculty', label: 'Faculty', icon: 'school' },
  { to: '/admin/categories', label: 'Categories', icon: 'category' },
];

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/papers': 'Research Papers',
  '/admin/faculty': 'Manage Faculty',
  '/admin/students': 'Manage Students',
  '/admin/categories': 'Manage Categories',
  '/admin/analytics': 'Analytics',
};

const tabCls = ({ isActive }) =>
  `flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${
    isActive
      ? 'bg-neutral-900 text-white'
      : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
  }`;

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] || 'Admin';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Console header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-neutral-200">
        <div className="px-6 md:px-10 py-3.5 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">database</span>
            </span>
            <div className="min-w-0">
              <div className="font-display font-bold text-neutral-900 text-[18px] leading-tight">CREST</div>
              <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                {user?.role === 'admin' ? 'Admin Console' : 'Faculty Portal'}
              </div>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2 min-w-0">
            <ThemeSwitcher />
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors min-w-0"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-[11px] shrink-0">
                {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 hidden sm:block">
                <div className="text-[13px] font-bold truncate leading-tight">{user?.name}</div>
                <div className="text-[11px] text-neutral-500 capitalize leading-tight">{user?.role}</div>
              </div>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium text-neutral-500 hover:bg-neutral-100 hover:text-red-600 transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab strip */}
        <nav className="px-6 md:px-10 pb-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {NAV_SHARED.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={tabCls}>
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <span className="w-px h-6 bg-neutral-200 shrink-0 mx-1" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap shrink-0">
                Administration
              </span>
              {NAV_ADMIN_ONLY.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={tabCls}>
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="p-6 md:p-10">
          <div className="border-t-2 border-neutral-900 pt-6 mb-8">
            <h1 className="font-display text-[22px] md:text-[26px] font-bold text-neutral-900">{title}</h1>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
