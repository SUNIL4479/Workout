import React from "react";
import {
  ShieldAlert,
  Bot,
  Sparkles,
  ArrowRight,
  Activity,
  Award,
  Play,
  Volume2,
} from "lucide-react";

interface LandingPageProps {
  onStartOnboarding: () => void;
  onExploreWorkouts: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  onExploreWorkouts,
}) => {
  return (
    <div className="min-h-screen text-white overflow-x-hidden relative">
      {/* Background Lighting Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#c6ff00]/5 blur-[150px] pointer-events-none -z-10 rounded-full" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <div className="space-y-6 text-center">
          {/* Hero Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#c6ff00]/30 text-[#c6ff00] text-xs font-semibold tracking-wide uppercase shadow-lg">
              <Sparkles className="w-4 h-4 text-[#c6ff00] animate-pulse" />
              <span>Next-Gen AI Home Workout Coach</span>
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.12] uppercase">
              TRAIN ANYWHERE. <br />
              <span className="text-[#c6ff00]">
                TRANSFORM WITH AI.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              Your personalized AI fitness coach for effective home workouts without a gym.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStartOnboarding}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-bold text-base shadow-xl shadow-[#c6ff00]/20 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 group"
              >
                <span>Start My Transformation</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-black" />
              </button>

              <button
                onClick={onExploreWorkouts}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#111111] hover:bg-[#1a1a1a] text-slate-200 hover:text-white font-semibold text-base border border-[#222222] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-[#c6ff00] text-[#c6ff00]" />
                <span>Explore Workouts</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Counter Pills */}
          <div className="pt-8 border-t border-[#222222] grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-0.5">Zero-Equipment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#c6ff00]">24/7</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-0.5">AI Voice Coach</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-purple-400">500+</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-0.5">AI-Powered Routines</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#222222]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-semibold text-[#c6ff00] uppercase tracking-widest mb-2">
            Intelligent Fitness Architecture
          </h2>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            Everything You Need to Get Fit at Home
          </h3>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Engineered with generative AI, real-time voice guidance, and smart safety protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: AI Coach */}
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-[24px] hover:border-[#c6ff00]/40 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#c6ff00]/10 border border-[#c6ff00]/20 flex items-center justify-center text-[#c6ff00] mb-5">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2">24/7 Personal AI Coach</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ask for customized chest workouts, 15-minute quick routines, or modifications for knee/back pain. Your coach adapts instantly.
            </p>
          </div>

          {/* Card 2: Voice & ExerciseDB Guidance */}
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-[24px] hover:border-[#c6ff00]/40 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#c6ff00]/10 border border-[#c6ff00]/20 flex items-center justify-center text-[#c6ff00] mb-5">
              <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Real-Time Voice & ExerciseDB Demos</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Clear audio rep counts and rhythm cues combined with ExerciseDB animated workout visualizations to ensure perfect form.
            </p>
          </div>

          {/* Card 4: Smart Safety System */}
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-[24px] hover:border-[#c6ff00]/40 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5">
              <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Smart Injury & Safety Filter</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automatically filters out high-impact exercises if you have joint or back limitations, ensuring joint-friendly modifications.
            </p>
          </div>

          {/* Card 5: Nutrition Coach */}
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-[24px] hover:border-[#c6ff00]/40 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#c6ff00]/10 border border-[#c6ff00]/20 flex items-center justify-center text-[#c6ff00] mb-5">
              <Activity className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Macro & Meal Planner</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tailored breakfast, lunch, dinner, and snack suggestions matching your dietary preferences (Vegan, Keto, High Protein).
            </p>
          </div>

          {/* Card 6: Gamification */}
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-[24px] hover:border-[#c6ff00]/40 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
              <Award className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2">XP, Badges & Streaks</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Earn XP for every workout, unlock achievement trophies, level up from Novice to Iron Titan, and keep your streak flaming!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-[24px] bg-[#111111] border border-[#c6ff00]/30 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
              Ready to Transform Your Fitness Journey?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              No expensive gym memberships, no crowded equipment. Get your personalized AI workout plan in less than 2 minutes.
            </p>
            <div className="pt-4">
              <button
                onClick={onStartOnboarding}
                className="px-9 py-4 rounded-2xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-bold text-base shadow-xl transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
              >
                <span>Build My Free AI Plan</span>
                <ArrowRight className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
