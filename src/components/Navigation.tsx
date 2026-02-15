import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mountain,
  SlidersHorizontal,
  GitCompareArrows,
  Layers,
  Users,
  MessageSquare,
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/', icon: Mountain, label: 'Terrain' },
  { path: '/playground', icon: SlidersHorizontal, label: 'Survey' },
  { path: '/compare', icon: GitCompareArrows, label: 'Compare' },
  { path: '/pestle', icon: Layers, label: 'PESTLE' },
  { path: '/populations', icon: Users, label: 'Field Notes' },
  { path: '/interview', icon: MessageSquare, label: 'Interview' },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-ink-150">
      <div className="max-w-7xl mx-auto px-10 lg:px-16 h-14 flex items-center justify-between">
        {/* Atlas title */}
        <NavLink to="/" className="flex items-center gap-3 group">
          {/* Small contour mark */}
          <svg width="22" height="22" viewBox="0 0 22 22" className="text-topo-sage opacity-70">
            <ellipse cx="11" cy="11" rx="10" ry="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <ellipse cx="11" cy="11" rx="7" ry="5.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <ellipse cx="11" cy="11" rx="4" ry="3" fill="none" stroke="currentColor" strokeWidth="0.6" />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg text-ink-800 tracking-tight leading-tight">
              The Scenario Atlas
            </span>
            <span className="hidden sm:block text-[10px] text-ink-400 font-medium tracking-[0.14em] uppercase mt-0.5">
              Youth &amp; AI Futures
            </span>
          </div>
        </NavLink>

        {/* Nav tabs — atlas index style */}
        <div className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide uppercase transition-colors duration-150 ${
                  isActive
                    ? 'text-ink-800 bg-parchment'
                    : 'text-ink-400 hover:text-ink-600 hover:bg-surface-warm'
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? 'text-topo-sage' : 'text-ink-300'}
                />
                <span>{item.label}</span>

                {/* Active tab indicator — ruled line accent */}
                {isActive && (
                  <motion.div
                    layoutId="atlas-tab"
                    className="absolute -bottom-[9px] left-2 right-2 h-[2px] bg-topo-sage rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
