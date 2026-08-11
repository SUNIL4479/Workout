import React, { useState } from "react";
import { UserProfile, FitnessGoal, ExperienceLevel, DietaryPreference } from "../../types";
import { apiFetch } from "../../services/api";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldAlert,
  Loader2,
  Calendar,
  Flame,
  UserCheck,
  Target,
  Ruler,
  Weight,
  Activity,
  Lock,
  Mail,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, onClose }) => {
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [cardIndex, setCardIndex] = useState<number>(0); // 0: Auth credentials, 1: Gender, 2: Weight & Height, 3: Current Body Type, 4: Target Body Transformation, 5: Experience & Medical, 6: AI Profile Synthesis
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auth & Profile State
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<"Male" | "Female" | "Non-Binary">("Female");
  const [heightCm, setHeightCm] = useState<number>(168);
  const [weightKg, setWeightKg] = useState<number>(64);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(58);

  // Body Types
  const [bodyType, setBodyType] = useState<"Lean" | "Fatty / Overweight" | "Medium Sized / Athletic">("Medium Sized / Athletic");
  const [targetBodyType, setTargetBodyType] = useState<"Ripped Shredded Abs" | "Athletic Muscular Mass" | "Slim & Lean Toned" | "Flat Belly & Fat Burn">("Ripped Shredded Abs");

  const [goal, setGoal] = useState<FitnessGoal>("weight_loss");
  const [experience, setExperience] = useState<ExperienceLevel>("beginner");
  const [durationMin, setDurationMin] = useState<number>(30);
  const [diet, setDiet] = useState<DietaryPreference>("omnivore");
  const [medicalLimitations, setMedicalLimitations] = useState<string>("");

  // Calculate Real Statistics Transformation Time Suggestion
  const calculateSuggestedMonths = () => {
    if (bodyType === "Fatty / Overweight" && targetBodyType === "Ripped Shredded Abs") return 6; // 6 months
    if (bodyType === "Fatty / Overweight" && targetBodyType === "Slim & Lean Toned") return 5; // 5 months
    if (bodyType === "Lean" && targetBodyType === "Athletic Muscular Mass") return 6; // 6 months
    if (bodyType === "Lean" && targetBodyType === "Ripped Shredded Abs") return 5; // 5 months
    if (bodyType === "Medium Sized / Athletic" && targetBodyType === "Ripped Shredded Abs") return 4; // 4 months
    return 5; // default 5 months
  };

  const suggestedMonths = calculateSuggestedMonths();

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      const res = await apiFetch("auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        onComplete(data.profile);
      } else {
        setFormError(data.error || "Failed to sign in");
      }
    } catch (err) {
      console.error(err);
      setFormError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isCredentialsValid = (): string | null => {
    if (!name.trim()) return "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters long.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleNextCard = () => {
    if (cardIndex === 0) {
      const error = isCredentialsValid();
      if (error) {
        setFormError(error);
        return;
      }
      setFormError(null);
    }
    if (cardIndex < 5) {
      setCardIndex(cardIndex + 1);
    } else if (cardIndex === 5) {
      generateAIProfile();
    }
  };

  const handlePrevCard = () => {
    if (cardIndex > 0) setCardIndex(cardIndex - 1);
  };

  const generateAIProfile = async () => {
    setCardIndex(6);
    setLoading(true);

    try {
      const res = await apiFetch("ai/fitness-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Fitness Athlete",
          age,
          gender,
          heightCm,
          weightKg,
          goal,
          experience,
          durationMin,
          diet,
          medicalLimitations,
          bodyType,
          targetBodyType,
        }),
      });

      const data = await res.json();
      const aiData = data.profile || {};

      // Build daily workout todo list
      const initialTasks = [
        { id: "task_1", title: `Day 1: ${durationMin}-Min ${targetBodyType} Foundation`, timeMin: durationMin, category: "Full Body", targetMuscle: "Core & Major Muscles", completed: false },
        { id: "task_2", title: "Hydration: Drink 3.0L Water", timeMin: 5, category: "Habit", targetMuscle: "Hydration", completed: false },
        { id: "task_3", title: "Post-Workout Light Stretching", timeMin: 10, category: "Flexibility", targetMuscle: "Full Body Joints", completed: false },
      ];

      const joinedDate = new Date().toISOString().split("T")[0];

      const newProfile: UserProfile = {
        id: "temp_id", // Backend handles real ID
        name: name || "Fitness Athlete",
        email: email || "athlete@fitify.ai",
        age,
        gender,
        heightCm,
        weightKg,
        targetWeightKg: targetWeightKg || weightKg - 5,
        goal,
        experience,
        durationMin,
        diet,
        medicalLimitations,
        bmi: aiData.bmi || parseFloat((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1)),
        bmiCategory: aiData.bmiCategory || "Normal",
        bodyType,
        targetBodyType,
        transformationMonths: suggestedMonths,
        calorieTarget: aiData.dailyCalories || 2000,
        waterGoalLiters: aiData.waterGoalLiters || 3.0,
        recommendedIntensity: aiData.recommendedIntensity || "Moderate",
        initialFitnessScore: aiData.initialFitnessScore || 80,
        xp: 0,
        level: 1,
        streakDays: 0,
        waterIntakeMl: 0,
        joinedDate,
        weightLogs: [{ date: joinedDate, weightKg }],
        dailyTodoTasks: initialTasks,
      };

      // Signup API call
      const authRes = await apiFetch("auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, profile: newProfile }),
      });
      const authData = await authRes.json();
      
      if (authData.success) {
        onComplete(authData.profile);
      } else {
        alert(authData.error || "Signup failed");
        setCardIndex(0);
      }

    } catch (error) {
      console.error("AI Generation or Signup Error:", error);
      alert("Failed to create profile. Please try again.");
      setCardIndex(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050505]/90 backdrop-blur-lg">
      <div className="min-h-full flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-[#222222] rounded-[28px] p-5 sm:p-8 shadow-2xl text-white my-8">
        
        {/* Top Header & Auth Mode Tabs */}
        <div className="flex items-center justify-between pb-6 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#c6ff00]/10 border border-[#c6ff00]/30 flex items-center justify-center text-[#c6ff00]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">FitiFy Authentication</h2>
              <p className="text-xs text-slate-400">Zero-Equipment Home Workout Portal</p>
            </div>
          </div>

          <div className="flex rounded-xl bg-[#1a1a1a] p-1 border border-[#222222]">
            <button
              onClick={() => {
                setAuthMode("signup");
                setCardIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                authMode === "signup" ? "bg-[#c6ff00] text-black shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setAuthMode("signin");
                setCardIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                authMode === "signin" ? "bg-[#c6ff00] text-black shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* SIGN IN FORM MODE */}
        {authMode === "signin" ? (
          <form onSubmit={handleSignInSubmit} className="py-6 space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Welcome Back!</h3>
              <p className="text-xs text-slate-400">Sign in to sync your active streak and body transformation plan.</p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#050505] border border-[#222222] focus:border-[#c6ff00] rounded-xl pl-10 pr-4 py-3.5 text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#050505] border border-[#222222] focus:border-[#c6ff00] rounded-xl pl-10 pr-4 py-3.5 text-white text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold animate-fade-in">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-black" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* SIGN UP CAROUSEL FLOW */
          <div className="py-6 space-y-6">
            {/* Carousel Step Bar */}
            {cardIndex < 6 && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c6ff00] flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>Card {cardIndex + 1} of 6:</span>
                  <span className="text-slate-300 font-normal">
                    {cardIndex === 0 && "Account Credentials"}
                    {cardIndex === 1 && "Gender & Athlete Profile"}
                    {cardIndex === 2 && "Weight & Height Metrics"}
                    {cardIndex === 3 && "Current Body Type"}
                    {cardIndex === 4 && "Target Transformation & Time"}
                    {cardIndex === 5 && "Fitness Experience & Diet"}
                  </span>
                </span>

                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === cardIndex
                          ? "w-6 bg-[#c6ff00]"
                          : idx < cardIndex
                          ? "w-3 bg-[#c6ff00]/40"
                          : "w-3 bg-[#222222]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* CARD 0: Account Credentials */}
            {cardIndex === 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">Create Your Account</h3>
                  <p className="text-xs text-slate-400">Step 1 of your personalized home workout transformation journey.</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#050505] border border-[#222222] focus:border-[#c6ff00] rounded-xl px-4 py-3.5 text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#050505] border border-[#222222] focus:border-[#c6ff00] rounded-xl px-4 py-3.5 text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#050505] border border-[#222222] focus:border-[#c6ff00] rounded-xl pl-10 pr-11 py-3.5 text-white text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-4 text-slate-500 hover:text-slate-300 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#050505] border border-[#222222] focus:border-[#c6ff00] rounded-xl pl-10 pr-4 py-3.5 text-white text-sm outline-none"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold animate-fade-in">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Age (Years)</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-[#050505] border border-[#222222] focus:border-[#c6ff00] rounded-xl px-4 py-3.5 text-white text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CARD 1: Gender Selection with Athlete Profile Indicator */}
            {cardIndex === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">Select Your Gender & Athlete Profile</h3>
                  <p className="text-xs text-slate-400">
                    Gender configures exercise demonstration GIFs (Male vs Female) and tailored physiological coaching.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Female Character Card */}
                  <div
                    onClick={() => setGender("Female")}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                      gender === "Female"
                        ? "bg-[#c6ff00]/10 border-[#c6ff00] ring-2 ring-[#c6ff00]"
                        : "bg-[#050505] border-[#222222] hover:border-[#333333]"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center text-2xl font-bold">
                      👩
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-white">Female Athlete Profile</div>
                      <div className="text-xs text-slate-400 mt-0.5">Includes female workout demonstration GIFs & core toning cues</div>
                    </div>
                    {gender === "Female" && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#c6ff00] text-black flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Male Character Card */}
                  <div
                    onClick={() => setGender("Male")}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                      gender === "Male"
                        ? "bg-[#c6ff00]/10 border-[#c6ff00] ring-2 ring-[#c6ff00]"
                        : "bg-[#050505] border-[#222222] hover:border-[#333333]"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-2xl font-bold">
                      👨
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-white">Male Athlete Profile</div>
                      <div className="text-xs text-slate-400 mt-0.5">Includes male workout demonstration GIFs & V-taper chest cues</div>
                    </div>
                    {gender === "Male" && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#c6ff00] text-black flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CARD 2: Weight & Height Card */}
            {cardIndex === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">Weight & Height Metrics</h3>
                  <p className="text-xs text-slate-400">Baseline body statistics used for exact caloric & BMI formulas.</p>
                </div>

                <div className="space-y-6 pt-2">
                  <div className="p-4 rounded-2xl bg-[#050505] border border-[#222222] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                        <Ruler className="w-4 h-4 text-[#c6ff00]" /> Height
                      </span>
                      <span className="text-lg font-black text-[#c6ff00]">
                        {heightCm} cm ({Math.floor(heightCm / 30.48)}' {Math.round((heightCm % 30.48) / 2.54)}")
                      </span>
                    </div>
                    <input
                      type="range"
                      min="130"
                      max="220"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full accent-[#c6ff00] cursor-pointer h-2 bg-[#1a1a1a] rounded-lg"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-[#050505] border border-[#222222] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                        <Weight className="w-4 h-4 text-[#c6ff00]" /> Current Weight
                      </span>
                      <span className="text-lg font-black text-[#c6ff00]">
                        {weightKg} kg ({(weightKg * 2.20462).toFixed(1)} lbs)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="160"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full accent-[#c6ff00] cursor-pointer h-2 bg-[#1a1a1a] rounded-lg"
                    />
                  </div>

                  {/* Calculated BMI Badge */}
                  <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-[#222222] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Calculated BMI Status</div>
                      <div className="text-sm font-extrabold text-white">
                        {(weightKg / Math.pow(heightCm / 100, 2)).toFixed(1)} kg/m²
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#c6ff00]/10 text-[#c6ff00] border border-[#c6ff00]/30 text-xs font-bold">
                      {(weightKg / Math.pow(heightCm / 100, 2)) < 18.5 ? "Lean Baseline" : (weightKg / Math.pow(heightCm / 100, 2)) < 25 ? "Normal Range" : "High Fat Index"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CARD 3: Current Body Composition Carousel Card */}
            {cardIndex === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">Select Your Current Body Type</h3>
                  <p className="text-xs text-slate-400">Choose the description that best matches your present physical composition.</p>
                </div>

                <div className="space-y-3 pt-1">
                  {[
                    {
                      id: "Lean",
                      title: "Lean / Skinny (Ectomorph)",
                      icon: "🦴",
                      desc: "Fast metabolism, difficulty gaining muscle mass or weight. Requires bodyweight hypertrophy.",
                    },
                    {
                      id: "Fatty / Overweight",
                      title: "Fatty / Higher Fat (Endomorph)",
                      icon: "🔥",
                      desc: "Slower metabolism, higher body fat retention around waist/thighs. Requires low-impact high calorie burn.",
                    },
                    {
                      id: "Medium Sized / Athletic",
                      title: "Medium Sized / Athletic (Mesomorph)",
                      icon: "💪",
                      desc: "Balanced body structure, average muscle definition. Focuses on speed, strength, and core stability.",
                    },
                  ].map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setBodyType(b.id as any)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        bodyType === b.id
                          ? "bg-[#c6ff00]/10 border-[#c6ff00] ring-1 ring-[#c6ff00]"
                          : "bg-[#050505] border-[#222222] hover:border-[#333333]"
                      }`}
                    >
                      <span className="text-2xl">{b.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white">{b.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{b.desc}</div>
                      </div>
                      {bodyType === b.id && <Check className="w-5 h-5 text-[#c6ff00] shrink-0 mt-1" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CARD 4: Target Body Transformation & Real Statistics Time Suggestion */}
            {cardIndex === 4 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">Choose Target Transformed Physique</h3>
                  <p className="text-xs text-slate-400">Select your dream body outcome. AI calculates real-world statistical duration.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    { id: "Ripped Shredded Abs", title: "Ripped Shredded Abs", icon: "⚡" },
                    { id: "Athletic Muscular Mass", title: "Athletic Muscular Mass", icon: "🏋️" },
                    { id: "Slim & Lean Toned", title: "Slim & Lean Toned", icon: "✨" },
                    { id: "Flat Belly & Fat Burn", title: "Flat Belly & Fat Burn", icon: "🔥" },
                  ].map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setTargetBodyType(t.id as any)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                        targetBodyType === t.id
                          ? "bg-[#c6ff00]/10 border-[#c6ff00] ring-1 ring-[#c6ff00]"
                          : "bg-[#050505] border-[#222222] hover:border-[#333333]"
                      }`}
                    >
                      <span className="text-xl">{t.icon}</span>
                      <div className="text-xs font-bold text-white">{t.title}</div>
                    </div>
                  ))}
                </div>

                {/* Real Statistics Time Suggestion Card */}
                <div className="p-4 rounded-2xl bg-[#050505] border border-[#c6ff00]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#c6ff00]" /> Realistic AI Timeline Recommendation
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#c6ff00] text-black text-xs font-black">
                      {suggestedMonths} Months Needed
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Transforming from <strong>{bodyType}</strong> to <strong>{targetBodyType}</strong> requires approximately <strong>{suggestedMonths} Months ({suggestedMonths * 4} Weeks)</strong> of progressive zero-equipment home training to safely burn fat and build core muscle memory.
                  </p>
                </div>
              </div>
            )}

            {/* CARD 5: Fitness Experience & Medical Safety */}
            {cardIndex === 5 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">Experience & Safety Parameters</h3>
                  <p className="text-xs text-slate-400">Configure safety filters and daily time availability.</p>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Fitness Level</label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value as any)}
                        className="w-full bg-[#050505] border border-[#222222] rounded-xl px-3 py-3 text-sm text-slate-200 outline-none"
                      >
                        <option value="beginner">Beginner (New to workout)</option>
                        <option value="intermediate">Intermediate (Occasional workout)</option>
                        <option value="advanced">Advanced (Consistent athlete)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Daily Time Limit</label>
                      <select
                        value={durationMin}
                        onChange={(e) => setDurationMin(Number(e.target.value))}
                        className="w-full bg-[#050505] border border-[#222222] rounded-xl px-3 py-3 text-sm text-slate-200 outline-none"
                      >
                        <option value={15}>15 Minutes Daily</option>
                        <option value={30}>30 Minutes Daily</option>
                        <option value={45}>45 Minutes Daily</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <label className="text-xs font-semibold text-slate-300 uppercase">
                        Injuries / Joint Sensitivities (Optional)
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="e.g. Knee discomfort, lower back strain, wrist pain..."
                      value={medicalLimitations}
                      onChange={(e) => setMedicalLimitations(e.target.value)}
                      className="w-full bg-[#050505] border border-[#222222] focus:border-amber-500/60 rounded-xl p-3.5 text-white text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CARD 6: AI Synthesis Screen */}
            {cardIndex === 6 && (
              <div className="py-10 text-center space-y-6 animate-fade-in">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-[#222222] border-t-[#c6ff00] animate-spin" />
                  <Sparkles className="w-10 h-10 text-[#c6ff00] absolute animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">Building Your Transformation Roadmap...</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">
                    Creating daily workout to-do streak list for your <strong>{suggestedMonths}-Month Transformation</strong> from {bodyType} to {targetBodyType}.
                  </p>
                </div>
              </div>
            )}

            {/* Carousel Footer Controls */}
            {cardIndex < 6 && (
              <div className="flex items-center justify-between pt-4 border-t border-[#222222] mt-4 gap-3">
                {cardIndex > 0 ? (
                  <button
                    onClick={handlePrevCard}
                    className="px-5 sm:px-6 py-3 rounded-xl bg-[#1a1a1a] hover:bg-[#222222] text-slate-300 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors border border-[#222222]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={handleNextCard}
                  className="px-6 sm:px-8 py-3 rounded-xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105 ml-auto"
                >
                  <span>{cardIndex === 5 ? "Generate Transformation Plan" : "Next Card"}</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

