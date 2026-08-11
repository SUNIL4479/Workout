import React from "react";
import { ShieldAlert, Heart } from "lucide-react";
import logo from "../../assets/images/logo.png";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505]/55 border-t border-[#222222] text-slate-400 py-12 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#0f0f0f] border border-[#222222] flex items-center justify-center overflow-hidden shrink-0">
              <img src={logo} alt="FitiFy logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
            </div>
            <span className="text-sm sm:text-base font-bold text-white">FitiFy Coach</span>
          </div>

          <div className="flex items-center gap-2 text-[#666666]">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Medical Disclaimer:</strong> Consult a physician before beginning any new exercise or nutrition program. Stop immediately if experiencing sharp pain or dizziness.
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-[#111111] flex flex-col sm:flex-row items-center justify-between gap-2 text-[#666666]">
          <div>© {new Date().getFullYear()} FitiFy. Powered by Gemini 2.5 & Three.js.</div>
          <div className="flex items-center gap-1">
            <span>Crafted for zero-equipment home fitness</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
