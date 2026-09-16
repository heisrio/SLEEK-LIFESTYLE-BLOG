import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useEditorialUiStore } from '../lib/uiStore';
import { BrandMark } from './BrandMark';
import { Icon } from './Icon';

const navItems = [
  { label: 'The Edit', to: '/' },
  { label: 'Beauty', to: '/?category=Beauty' },
  { label: 'Style', to: '/?category=Style' },
  { label: 'Culture', to: '/?category=Culture' },
];

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { setSearchOpen } = useEditorialUiStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);

  const signOutAndGoHome = () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="site-header__inner shell">
        <BrandMark />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive && item.to === '/' ? 'is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button header-search" type="button" onClick={() => setSearchOpen(true)} aria-label="Search stories">
            <Icon name="search" />
          </button>
          {user ? (
            <div className="account-actions">
              {(user.role === 'admin' || user.role === 'editor') && (
                <Link className="dashboard-link" to="/admin">
                  <Icon name="dashboard" />
                  <span>Studio</span>
                </Link>
              )}
              <button className="avatar-button" type="button" onClick={signOutAndGoHome} title="Sign out" aria-label="Sign out">
                {user.name.slice(0, 1).toUpperCase()}
              </button>
            </div>
          ) : (
            <Link className="button button--small button--dark" to="/signin">Sign in</Link>
          )}
          <button className="icon-button menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="mobile-nav shell">
          {navItems.map((item) => (
            <Link key={item.label} to={item.to} className="mobile-nav__link">{item.label}</Link>
          ))}
          <button className="mobile-nav__link" type="button" onClick={() => setSearchOpen(true)}>Search</button>
          {user ? (
            <>
              {(user.role === 'admin' || user.role === 'editor') && <Link to="/admin" className="mobile-nav__link">Open studio</Link>}
              <button className="mobile-nav__link" type="button" onClick={signOutAndGoHome}>Sign out</button>
            </>
          ) : <Link to="/signin" className="mobile-nav__link">Sign in</Link>}
        </div>
      )}
    </header>
  );
};

export default Navbar;
