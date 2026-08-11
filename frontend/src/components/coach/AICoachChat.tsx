import React, { useState, useRef, useEffect } from "react";
import { UserProfile } from "../../types";
import { apiFetch } from "../../services/api";
import { Bot, Send, User, Sparkles, Loader2, Dumbbell, ShieldAlert, HeartPulse } from "lucide-react";

interface AICoachChatProps {
  user: UserProfile;
  embedded?: boolean;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

export const AICoachChat: React.FC<AICoachChatProps> = ({ user, embedded = false }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m_1",
      sender: "ai",
      text: `Hello ${user.name}! I am your 24/7 FitiFy AI Trainer. How can I help you today? Ask me for custom exercise plans, joint pain modifications, form tips, or quick motivation!`,
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    "I have only 15 minutes today.",
    "My right knee feels stiff, what should I avoid?",
    "Build a zero-equipment chest workout.",
    "How can I lose belly fat efficiently at home?",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: "u_" + Date.now(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const historyFormatted = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text,
      }));

      const res = await apiFetch("ai/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyFormatted,
          profile: user,
        }),
      });

      const data = await res.json();
      const aiReply: Message = {
        id: "ai_" + Date.now(),
        sender: "ai",
        text: data.reply || "Keep pushing forward! Consistency beats intensity.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error("Coach Chat Error:", err);
      const errorMsg: Message = {
        id: "err_" + Date.now(),
        sender: "ai",
        text: "I experienced a temporary connection glitch. Remember to keep your core engaged and stay hydrated!",
        time: "Now",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto text-white ${embedded ? "flex flex-col h-full px-4 py-4 space-y-4" : "px-4 py-8 space-y-6"}`}>
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#c6ff00]/10 text-[#c6ff00] border border-[#c6ff00]/30">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">24/7 AI Fitness Coach</h1>
          <p className="text-xs text-slate-400">Personalized exercise, form & recovery assistance</p>
        </div>
      </div>

      {/* Chat Window */}
      <div className={`bg-[#111111] border border-[#222222] rounded-[24px] flex flex-col overflow-hidden shadow-2xl ${embedded ? "flex-1 min-h-0" : "h-[480px] sm:h-[560px] lg:h-[620px]"}`}>
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === "user"
                    ? "bg-[#c6ff00] text-black font-bold"
                    : "bg-[#1a1a1a] text-[#c6ff00] border border-[#222222]"
                }`}
              >
                {msg.sender === "user" ? <User className="w-4 h-4 text-black" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[#c6ff00] text-black font-medium rounded-tr-none"
                    : "bg-[#050505] border border-[#222222] text-slate-200 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className={`text-[10px] mt-1.5 text-right ${msg.sender === "user" ? "text-slate-800" : "text-slate-400"}`}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-[#c6ff00] flex items-center justify-center border border-[#222222]">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#050505] border border-[#222222] text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#c6ff00]" />
                <span>Coach is reflecting on your fitness profile...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Sample Prompts */}
        <div className="px-4 py-2 border-t border-[#222222] bg-[#0a0a0a] overflow-x-auto flex gap-2">
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="px-3 py-1 rounded-xl bg-[#111111] border border-[#222222] text-slate-300 hover:text-[#c6ff00] hover:border-[#c6ff00]/40 text-xs shrink-0 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#222222] bg-[#0a0a0a] flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask your coach anything (e.g. 'Build a chest workout' or 'My knees hurt')..."
            className="flex-1 bg-[#050505] border border-[#222222] focus:border-[#c6ff00] rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="px-5 py-3 rounded-xl bg-[#c6ff00] hover:bg-[#b0e600] disabled:opacity-50 text-black font-bold text-sm flex items-center gap-1.5 shrink-0 transition-all"
          >
            <Send className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
};
