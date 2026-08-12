import React from "react";
import { UserProfile } from "../../types";
import { AICoachChat } from "./AICoachChat";
import { Bot, X } from "lucide-react";

interface FloatingChatWidgetProps {
  user: UserProfile | null;
  open: boolean;
  onToggle: () => void;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ user, open, onToggle }) => {
  const chatUser: UserProfile = user || {
    id: "guest",
    name: "Friend",
    email: "",
    age: 28,
    gender: "Female",
    heightCm: 168,
    weightKg: 64,
    goal: "general_fitness",
    experience: "beginner",
    durationMin: 30,
    diet: "omnivore",
    xp: 0,
    level: 1,
    streakDays: 0,
    waterIntakeMl: 0,
    joinedDate: new Date().toISOString().split("T")[0],
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-3 sm:bottom-24 sm:right-8 z-40 w-[calc(100vw-1.5rem)] sm:w-[calc(100vw-4rem)] max-w-md h-[min(70dvh,600px)] sm:h-[70vh] bg-[#0f0f0f] border border-[#222222] rounded-[24px] overflow-hidden shadow-2xl flex flex-col animate-fade-in">
          <AICoachChat user={chatUser} embedded />
        </div>
      )}

      <button
        onClick={onToggle}
        aria-label={open ? "Close AI Coach Chat" : "Open AI Coach Chat"}
        title="AI Coach Chat"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-8 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#c6ff00] hover:bg-[#b0e600] text-black flex items-center justify-center shadow-xl shadow-[#c6ff00]/25 transition-all hover:scale-105"
      >
        {open ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <Bot className="w-7 h-7 sm:w-8 sm:h-8" />}
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5">
            <span className="absolute inset-0 rounded-full bg-[#c6ff00] animate-ping" />
            <span className="relative block w-full h-full rounded-full bg-[#a3e600] border-2 border-[#050505]" />
          </span>
        )}
      </button>
    </>
  );
};
