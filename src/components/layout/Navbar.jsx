import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeSwitcher from '../ui/ThemeSwitcher';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const isHeroPage = location.pathname === '/' || location.pathname === '/about';
  const scrolledOrOpen = scrolled || menuOpen;
  const solid = isHeroPage ? scrolledOrOpen : scrolled;
  const barred = solid || hovered;
  // White treatments only while floating over the dark hero video.
  const onDark = isHeroPage && !scrolledOrOpen && !hovered;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const isStaff = user?.role === 'admin' || user?.role === 'faculty';
  const portalUrl = user?.role === 'faculty' ? '/portal' : '/admin';
  const portalLabel = user?.role === 'faculty' ? 'Faculty Portal' : 'Admin Console';
  const portalIcon = user?.role === 'faculty' ? 'co_present' : 'admin_panel_settings';
  const initials = user
    ? user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : '';

  const linkBase = 'px-4 py-2 rounded-full text-[14px] font-semibold transition-all duration-200 whitespace-nowrap';
  const linkTone = (isActive) => {
    if (onDark) {
      return isActive ? `bg-white/20 text-white` : `text-white/75 hover:bg-white/10 hover:text-white`;
    }
    return isActive
      ? `bg-neutral-900 text-white`
      : `text-neutral-500 hover:bg-neutral-900/5 hover:text-neutral-900`;
  };

  return (
    <nav
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full fixed top-0 z-50 transition-all duration-300 ${barred
        ? 'bg-background/90 backdrop-blur-md border-b border-neutral-900/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.10)]'
        : 'bg-transparent border-b border-transparent'
        }`}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 md:px-12 py-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className={`font-display text-[24px] md:text-[26px] font-bold tracking-tight transition-colors duration-200 ${onDark ? 'text-white' : 'text-neutral-900'}`}>
            CREST
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-colors duration-200 ${onDark ? 'bg-white/10 text-white border-white/25' : 'bg-neutral-900/5 text-neutral-700 border-neutral-200'}`}>
            CECT
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-center gap-1 overflow-x-auto">
          <NavLink to="/browse" className={({ isActive }) => `${linkBase} ${linkTone(isActive)}`}>
            Repository
          </NavLink>
          <NavLink to="/faculty" className={({ isActive }) => `${linkBase} ${linkTone(isActive)}`}>
            Faculty
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `${linkBase} ${linkTone(isActive)}`}>
            About
          </NavLink>
          {user?.role === 'student' && (
            <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${linkTone(isActive)}`}>
              Dashboard
            </NavLink>
          )}
          {isStaff && (
            <NavLink to={portalUrl} className={({ isActive }) => `${linkBase} ${linkTone(isActive)}`}>
              {portalLabel}
            </NavLink>
          )}
        </div>

        <div className="relative flex shrink-0 items-center gap-2">
          <ThemeSwitcher onDark={onDark} />
          {user ? (
            <>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Account menu"
                className="active:scale-95 transition-transform"
              >
                <span className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold hover:scale-105 transition-all duration-200 ${onDark ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'}`}>
                  {initials}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-14 z-50 w-64 rounded-2xl shadow-2xl border overflow-hidden animate-fade-in bg-background border-neutral-200">
                    <div className="px-5 py-4 border-b border-neutral-200">
                      <div className="font-bold text-[14px] truncate text-neutral-900">{user.name}</div>
                      <div className="text-[12px] text-neutral-500 truncate">{user.email}</div>
                      <div className="inline-block mt-2 px-2 py-0.5 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {user.role}
                      </div>
                    </div>
                    <div className="py-2">
                      {user.role === 'student' && (
                        <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-neutral-600 hover:bg-neutral-900/5 hover:text-neutral-900 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
                          My Dashboard
                        </Link>
                      )}
                      <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-neutral-600 hover:bg-neutral-900/5 hover:text-neutral-900 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">account_circle</span>
                        My Profile
                      </Link>
                      {isStaff && (
                        <Link to={portalUrl} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-neutral-600 hover:bg-neutral-900/5 hover:text-neutral-900 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">{portalIcon}</span>
                          {portalLabel}
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-500/10 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className={`hidden sm:inline-flex px-5 py-2.5 rounded-full text-[14px] font-bold transition-all whitespace-nowrap ${onDark ? 'text-white/85 hover:bg-white/10 hover:text-white' : 'text-neutral-600 hover:bg-neutral-900/5 hover:text-neutral-900'}`}
              >
                Log In
              </Link>
              <Link
                to="/auth"
                className={`inline-flex px-5 py-2.5 rounded-full text-[14px] font-bold shadow-lg active:scale-95 transition-all whitespace-nowrap ${onDark ? 'bg-white text-neutral-900 shadow-black/20 hover:bg-white/90' : 'bg-neutral-900 text-white shadow-neutral-900/20 hover:bg-neutral-700'}`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
