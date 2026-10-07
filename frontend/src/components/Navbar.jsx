import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  LayoutDashboard,
  ClipboardList,
  Briefcase,
  MapPin,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import Button from './Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Assessment', path: '/assessment', icon: ClipboardList },
    { name: 'Careers', path: '/careers', icon: Briefcase },
    { name: 'Roadmaps', path: '/roadmaps', icon: MapPin },
    { name: 'Resume', path: '/resume', icon: FileText },
    { name: 'AI Counselor', path: '/chat', icon: MessageSquare },
  ];

  const linkClasses = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  const mobileLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 text-base font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to={user ? '/dashboard' : '/login'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                  CareerGuidance<span className="text-indigo-600">.AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Skill Mapping & Counseling
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.path} to={item.path} className={linkClasses}>
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold border border-indigo-200">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1">{user.name}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{user.email}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-rose-600 hover:border-rose-200"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 px-4 pt-3 pb-5 bg-white space-y-2">
          {user ? (
            <>
              <div className="pb-3 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="space-y-1 pt-2">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={mobileLinkClasses}
                    >
                      <Icon className="w-5 h-5 text-indigo-600" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
              <div className="pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button variant="outline" className="w-full">Log In</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button variant="primary" className="w-full">Create Account</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
