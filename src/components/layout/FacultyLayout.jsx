import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeSwitcher from '../ui/ThemeSwitcher';

const NAV_ITEMS = [
  { to: '/portal',          end: true, label: 'Dashboard',        icon: 'space_dashboard' },
  { to: '/portal/papers',             label: 'Research Papers',   icon: 'description' },
  { to: '/portal/students',           label: 'Student Accounts',  icon: 'group' },
  { to: '/portal/analytics',          label: 'Analytics',         icon: 'monitoring' },
];

const PAGE_TITLES = {
  '/portal':           'Dashboard',
  '/portal/papers':    'Research Papers',
  '/portal/students':  'Student Accounts',
  '/portal/analytics': 'Analytics',
};

const tabCls = ({ isActive }) =>
  `flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${
    isActive
      ? 'bg-neutral-900 text-white'
      : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
  }`;

export default function FacultyLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] || 'Faculty Portal';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Portal header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-neutral-200">
        <div className="px-6 md:px-10 py-3.5 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">database</span>
            </span>
            <div className="min-w-0">
              <div className="font-display font-bold text-neutral-900 text-[18px] leading-tight">CREST</div>
              <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">Faculty Portal</div>
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
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={tabCls}>
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
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
