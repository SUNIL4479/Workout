import React, { useState } from "react";
import { UserProfile } from "../../types";
import { apiFetch } from "../../services/api";
import logo from "../../assets/images/logo.png";
import {
  Flame,
  Activity,
  Apple,
  Trophy,
  Dumbbell,
  Menu,
  X,
  User,
  ShieldCheck,
} from "lucide-react";

interface NavbarProps {
  user: UserProfile | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenOnboarding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onSelectTab,
  onOpenOnboarding,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "workout_studio", label: "AI Workout Studio", icon: Dumbbell },
    { id: "nutrition", label: "Nutrition", icon: Apple },
    { id: "analytics", label: "Analytics", icon: Activity },
    { id: "badges", label: "Badges", icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#222222]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab("landing")}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#0f0f0f] border border-[#222222] flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform shrink-0">
            <img src={logo} alt="FitiFy logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-black tracking-tight text-white flex items-center leading-none">
              Fiti<p className="text-[#c6ff00]">Fy</p>
            </div>
            <div className="text-[9px] sm:text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-1">
              Home Workout Coach
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#111111] p-1.5 rounded-2xl border border-[#222222]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3.5 lg:px-4 py-2.5 rounded-xl text-xs lg:text-sm font-semibold transition-all flex items-center gap-1.5 ${isActive
                  ? "bg-[#c6ff00] text-black font-bold shadow-md shadow-[#c6ff00]/20"
                  : "text-slate-300 hover:text-white hover:bg-[#1a1a1a]"
                  }`}
              >
                <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right User Bar / Profile Button */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#111111] px-3 py-2 rounded-xl border border-[#222222] text-xs lg:text-sm font-bold text-rose-400">
                <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>{user.streakDays}d Streak</span>
              </div>

              <button
                onClick={onOpenOnboarding}
                className="p-2.5 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] border border-[#222222] text-slate-300 text-xs lg:text-sm font-semibold flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[#c6ff00]" />
                <span>{user.name.split(" ")[0]}</span>
              </button>
              <button
                onClick={() => {
                  apiFetch("auth/signout", { method: "POST" })
                    .then(() => window.location.reload());
                }}
                className="p-2.5 rounded-xl bg-[#111111] hover:bg-rose-500/10 border border-[#222222] hover:border-rose-500/30 text-slate-300 hover:text-rose-400 text-xs lg:text-sm font-semibold"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenOnboarding}
              className="px-5 py-3 rounded-xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-bold text-xs lg:text-sm shadow-lg shadow-[#c6ff00]/20 transition-all hover:scale-105"
            >
              Sign In / Setup AI
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-xl bg-[#111111] border border-[#222222] text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          {/* Quite-transparent backdrop; tap to close */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Glass drawer below the header */}
          <div className="absolute inset-x-0 top-16 bg-[#0a0a0a]/60 backdrop-blur-xl border-b border-white/10 p-4 space-y-2">
            {user ? (
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10 mb-1">
                <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>{user.streakDays}d Streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onOpenOnboarding();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-sm font-semibold flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#c6ff00]" />
                    <span className="max-w-24 truncate">{user.name.split(" ")[0]}</span>
                  </button>
                  <button
                    onClick={() => {
                      apiFetch("auth/signout", { method: "POST" })
                        .then(() => window.location.reload());
                    }}
                    className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 text-slate-300 hover:text-rose-400 text-sm font-semibold"
                    title="Sign Out"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenOnboarding();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-4 rounded-xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-bold text-sm shadow-lg shadow-[#c6ff00]/20"
              >
                Sign In / Setup AI
              </button>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 ${isActive
                    ? "bg-[#c6ff00] text-black font-bold"
                    : "text-slate-200 hover:bg-white/10"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
