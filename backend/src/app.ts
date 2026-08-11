import express from "express";
import crypto from "crypto";
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import cors from "cors";


// Load .env from the project root by walking up from the current directory.
// Works whether the server runs from the backend workspace (npm run dev:backend)
// or the repo root (npm start). No-op on Vercel, where env vars are injected
// directly and no .env exists.
let envSearch = path.resolve(process.cwd());
while (!fs.existsSync(path.join(envSearch, ".env")) && path.dirname(envSearch) !== envSearch) {
  envSearch = path.dirname(envSearch);
}
dotenv.config({ path: path.join(envSearch, ".env"), quiet: true });

// Fail fast instead of buffering queries when MongoDB is unreachable.
mongoose.set("bufferCommands", false);

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://fiti-fy-frontend.vercel.app",
      "https://fiti-fy-frontend-git-main-productivityalex147-1718s-projects.vercel.app",
    ],
    credentials: true,
  })
);
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));

// --- Stateless signed-cookie sessions (serverless-safe, works on Vercel) ---
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
const SESSION_COOKIE = "fitify_sid";
const SESSION_MAX_AGE_SEC = 24 * 60 * 60; // 1 day

const signToken = (userId: string): string => {
  const payload = Buffer.from(userId).toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
};

const verifyToken = (token?: string): string | null => {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
};

const readCookie = (req: express.Request, name: string): string | undefined => {
  const header = req.headers.cookie || "";
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return undefined;
};

const setSessionCookie = (res: express.Response, userId: string) => {
  const token = signToken(userId);
  const secure = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
  const sameSite = secure ? "None" : "Lax";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE_SEC}; SameSite=${sameSite}${secure ? "; Secure" : ""}`
  );
};

const clearSessionCookie = (res: express.Response) => {
  const secure = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
  const sameSite = secure ? "None" : "Lax";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=${sameSite}${secure ? "; Secure" : ""}`
  );
};

interface AuthedRequest extends express.Request {
  userId?: string | null;
}

app.use((req: AuthedRequest, _res, next) => {
  req.userId = verifyToken(readCookie(req, SESSION_COOKIE));
  next();
});

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "FitiFI backend is running",
  });
});

app.get("/api/health", (_req, res) => {
  const state = mongoose.connection.readyState; // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
  res.json({
    status: "ok",
    message: "FitiFI backend is running",
    database: {
      configured: Boolean(MONGODB_URI),
      state: state === 1 ? "connected" : state === 2 ? "connecting" : state === 3 ? "disconnecting" : "disconnected",
    },
  });
});

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI;

let dbConnectPromise: Promise<void> | null = null;

// Connect (once) and remember the promise so concurrent requests share it.
// Resets on failure so a later request can retry after a transient outage.
function connectDb(): Promise<void> {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return Promise.resolve();
  }
  if (!MONGODB_URI) {
    return Promise.reject(new Error("MONGODB_URI is not set in environment variables."));
  }
  if (!dbConnectPromise) {
    dbConnectPromise = mongoose
      .connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 })
      .then(() => console.log("Connected to MongoDB"))
      .catch((err: Error) => {
        console.error("MongoDB connection error:", err.message);
        dbConnectPromise = null;
        throw err;
      });
  }
  return dbConnectPromise;
}

// Ensure the database is reachable before running a query. Returns false and
// sends a clean 503 when it isn't, instead of a generic 500 from a thrown query.
async function requireDb(res: express.Response): Promise<boolean> {
  try {
    await connectDb();
    return true;
  } catch (err: any) {
    console.error("Database unavailable:", err?.message);
    res.status(503).json({ success: false, error: "Database is unavailable. Please try again." });
    return false;
  }
}

// Kick off the connection at boot (and log the result). It is shared/lazy, so
// requests arriving during the connecting window just await the same promise
// instead of throwing.
connectDb().catch(() => {});

// User Schema & Model
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: { type: mongoose.Schema.Types.Mixed, default: {} },
    loginDates: { type: [String], default: [] }, // "YYYY-MM-DD" (UTC) per active day
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// --- Daily streak tracking (login-based) ---
const dayKey = (d: Date = new Date()): string => d.toISOString().slice(0, 10);

const previousDayKey = (key: string): string => {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

const computeStreak = (loginDates: string[]): number => {
  const dates = new Set(loginDates);
  // A streak is still alive if the last active day was today OR yesterday.
  const cursor = dates.has(dayKey()) ? dayKey() : previousDayKey(dayKey());
  let streak = 0;
  let d = cursor;
  while (dates.has(d)) {
    streak += 1;
    d = previousDayKey(d);
  }
  return streak;
};

// Record today's login for this user and persist the recomputed streak.
const recordDailyLogin = async (user: any): Promise<number> => {
  const today = dayKey();
  const dates = Array.from(new Set<string>(Array.isArray(user.loginDates) ? (user.loginDates as string[]) : []));
  const isNewDay = !dates.includes(today);
  if (isNewDay) dates.push(today);

  const streak = computeStreak(dates);
  const current = user.profile && user.profile.streakDays;

  let changed = false;
  if (isNewDay) {
    user.loginDates = dates;
    user.markModified("loginDates");
    changed = true;
  }
  if (current !== streak) {
    user.profile = { ...(user.profile || {}), streakDays: streak };
    user.markModified("profile");
    changed = true;
  }
  if (changed) await user.save();
  return streak;
};

// --- Auth Endpoints ---

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, profile } = req.body;

    if (!(await requireDb(res))) return;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    if (typeof password !== "string" || !password) {
      return res.status(400).json({ success: false, error: "Password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email: normalizedEmail,
      password: hashedPassword,
      profile: { ...profile, email: normalizedEmail },
    });

    await newUser.save();

    newUser.profile.id = newUser._id.toString();
    await newUser.save();

    setSessionCookie(res, newUser._id.toString());
    await recordDailyLogin(newUser);
    res.json({ success: true, profile: newUser.profile });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, error: "Server error during signup" });
  }
});

app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(await requireDb(res))) return;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    setSessionCookie(res, user._id.toString());
    const streak = await recordDailyLogin(user);
    res.json({ success: true, profile: { ...user.profile, streakDays: streak } });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ success: false, error: "Server error during signin" });
  }
});

app.post("/api/auth/signout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

app.get("/api/auth/me", async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }
  if (!(await requireDb(res))) return;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const streak = await recordDailyLogin(user);
    res.json({ success: true, profile: { ...user.profile, streakDays: streak } });
  } catch (error) {
    console.error("Auth me error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.put("/api/auth/profile", async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }
  if (!(await requireDb(res))) return;

  try {
    const { profile } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.profile = { ...user.profile, ...profile, streakDays: computeStreak(user.loginDates || []) };
    await user.save();

    res.json({ success: true, profile: user.profile });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// --- Leaderboard Endpoint ---

app.get("/api/leaderboard", async (_req, res) => {
  try {
    if (!MONGODB_URI) {
      return res.json({ success: true, leaderboard: [] });
    }
    await connectDb();

    const users = await User.find({}, "profile loginDates");
    const leaderboard = users
      .map((u) => ({
        id: u._id.toString(),
        name: u.profile.name,
        xp: u.profile.xp || 0,
        streakDays: computeStreak(u.loginDates || []),
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10); // Top 10

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ success: false, error: "Could not fetch leaderboard" });
  }
});

// --- Gemini Client (lazy-loaded so /api/health and auth endpoints don't pay the
// ~5MB @google/genai module graph on every cold start) ---
type GenaiModule = typeof import("@google/genai");

let genaiModule: GenaiModule | null = null;

async function loadGenai(): Promise<GenaiModule> {
  if (!genaiModule) {
    genaiModule = await import("@google/genai");
  }
  return genaiModule;
}

async function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  const { GoogleGenAI } = await loadGenai();
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Calculate AI Fitness Profile & Metrics
app.post("/api/ai/fitness-profile", async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      heightCm,
      weightKg,
      goal,
      experience,
      durationMin,
      diet,
      medicalLimitations,
    } = req.body;

    const ai = await getGeminiClient();
    const { Type } = await loadGenai();
    const prompt = `Calculate detailed fitness metrics and a personalized body profile for this individual:
Name: ${name || "User"}
Age: ${age}
Gender: ${gender}
Height: ${heightCm} cm
Weight: ${weightKg} kg
Fitness Goal: ${goal}
Workout Experience: ${experience}
Target Daily Duration: ${durationMin} minutes
Dietary Preference: ${diet}
Medical/Injury Limitations: ${medicalLimitations || "None"}

Please compute accurately and return JSON matching this exact structure:
{
  "bmi": number (e.g. 23.4),
  "bmiCategory": string ("Underweight" | "Normal" | "Overweight" | "Obese"),
  "bodyType": string ("Ectomorph" | "Mesomorph" | "Endomorph"),
  "dailyCalories": number (e.g. 2200),
  "waterGoalLiters": number (e.g. 3.2),
  "recommendedIntensity": string ("Gentle" | "Moderate" | "High" | "Peak Performance"),
  "initialFitnessScore": number (1 to 100 scale),
  "macroDistribution": {
    "proteinGrams": number,
    "carbsGrams": number,
    "fatsGrams": number
  },
  "coachSummary": string (2 short motivational and analytical sentences about their profile),
  "keyRecommendations": array of 3 strings (actionable advice for their specific goal and limitations)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bmi: { type: Type.NUMBER },
            bmiCategory: { type: Type.STRING },
            bodyType: { type: Type.STRING },
            dailyCalories: { type: Type.NUMBER },
            waterGoalLiters: { type: Type.NUMBER },
            recommendedIntensity: { type: Type.STRING },
            initialFitnessScore: { type: Type.NUMBER },
            macroDistribution: {
              type: Type.OBJECT,
              properties: {
                proteinGrams: { type: Type.NUMBER },
                carbsGrams: { type: Type.NUMBER },
                fatsGrams: { type: Type.NUMBER },
              },
            },
            coachSummary: { type: Type.STRING },
            keyRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, profile: parsed });
  } catch (error: any) {
    console.error("Error generating fitness profile:", error);
    const weight = req.body.weightKg || 70;
    const heightM = (req.body.heightCm || 170) / 100;
    const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
    res.json({
      success: true,
      profile: {
        bmi,
        bmiCategory: bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : "Overweight",
        bodyType: "Mesomorph",
        dailyCalories: Math.round(weight * 30),
        waterGoalLiters: 3.0,
        recommendedIntensity: "Moderate",
        initialFitnessScore: 78,
        macroDistribution: {
          proteinGrams: Math.round(weight * 1.8),
          carbsGrams: Math.round(weight * 3),
          fatsGrams: Math.round(weight * 0.9),
        },
        coachSummary: "Your baseline is set! We've customized an equipment-free home program built for safety and rapid progress.",
        keyRecommendations: [
          "Maintain consistent daily water intake.",
          "Perform warm-ups before every session to protect joints.",
          "Focus on clean form rather than speed."
        ]
      },
    });
  }
});

// Generate Custom AI Workout Routine
app.post("/api/ai/generate-workout", async (req, res) => {
  try {
    const { userPrompt, profile } = req.body;

    const ai = await getGeminiClient();
    const systemPrompt = `You are FitiFy, an elite personal trainer specializing in zero-equipment home bodyweight workouts.
Generate a structured, safe, zero-equipment workout session based on the user request and user profile.
Take strict note of medical limitations (e.g. knee pain = no heavy jumps/squats; back pain = low impact core).

User Query: "${userPrompt}"
User Profile: Goal: ${profile?.goal || "General Fitness"}, Experience: ${profile?.experience || "Beginner"}, Medical/Injuries: ${profile?.medicalLimitations || "None"}, Preferred Duration: ${profile?.durationMin || 20} minutes.

Return JSON matching this schema:
{
  "title": string (catchy, inspiring title e.g. "15-Min Knee-Safe Core & Lower Body Burn"),
  "description": string (short overview),
  "category": string ("Fat Burn" | "Muscle Sculpt" | "Core & ABS" | "Flexibility" | "Full Body" | "Strength"),
  "totalMinutes": number,
  "estimatedCalories": number,
  "difficulty": string ("Beginner" | "Intermediate" | "Advanced"),
  "safetyAdvice": string (specific safety warning or modification tip),
  "warmUp": array of 2-3 exercises,
  "mainRoutine": array of 4-6 exercises,
  "coolDown": array of 2 exercises
}

For each exercise in warmUp, mainRoutine, coolDown:
{
  "id": string (unique slug like "pushup_std"),
  "name": string (e.g. "Push-Ups" or "Modified Knee Push-Ups"),
  "targetMuscles": string (e.g. "Chest, Triceps, Core"),
  "durationSec": number (optional, set 0 if rep-based),
  "reps": number (optional, set 0 if duration-based),
  "sets": number (e.g. 3),
  "restSec": number (e.g. 30),
  "calories": number (estimated per set),
  "instructions": string (step by step execution),
  "safetyTips": string (common mistakes & safety guidance),
  "formCues": string (voice coach cue e.g. "Keep elbows at 45 degrees"),
  "animationType": string ("pushup" | "squat" | "plank" | "lunge" | "jumping_jacks" | "mountain_climbers" | "burpees" | "crunch" | "stretching")
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, workout: parsed });
  } catch (error: any) {
    console.error("Error generating AI workout:", error);
    res.status(500).json({ success: false, error: "Failed to generate AI workout routine." });
  }
});

// Generate Custom AI Nutrition Meal Plan
app.post("/api/ai/generate-nutrition", async (req, res) => {
  try {
    const { profile } = req.body;
    const ai = await getGeminiClient();

    const prompt = `Create a 1-day personalized home nutrition and meal plan for:
Goal: ${profile?.goal || "General Health"}
Daily Calorie Target: ${profile?.calorieTarget || 2000} kcal
Dietary Preference: ${profile?.diet || "Omnivore"}
Age/Gender: ${profile?.age || 28} / ${profile?.gender || "Female"}

Return JSON structure:
{
  "dailyCalories": number,
  "proteinGrams": number,
  "carbsGrams": number,
  "fatsGrams": number,
  "waterLiters": number,
  "meals": {
    "breakfast": {
      "name": string,
      "calories": number,
      "protein": string,
      "description": string,
      "ingredients": array of strings
    },
    "lunch": {
      "name": string,
      "calories": number,
      "protein": string,
      "description": string,
      "ingredients": array of strings
    },
    "dinner": {
      "name": string,
      "calories": number,
      "protein": string,
      "description": string,
      "ingredients": array of strings
    },
    "snack": {
      "name": string,
      "calories": number,
      "protein": string,
      "description": string,
      "ingredients": array of strings
    }
  },
  "coachTip": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, mealPlan: parsed });
  } catch (error: any) {
    console.error("Error generating nutrition plan:", error);
    res.status(500).json({ success: false, error: "Failed to generate nutrition plan." });
  }
});

// AI Fitness Coach Interactive Chat
app.post("/api/ai/coach-chat", async (req, res) => {
  try {
    const { message, history, profile } = req.body;
    const ai = await getGeminiClient();

    const formattedHistory = (history || []).map((item: any) => ({
      role: item.role === "user" ? "user" : "model",
      parts: [{ text: item.text }],
    }));

    const systemInstruction = `You are FitiFy, an empathetic, encouraging, expert 24/7 personal trainer and health advisor.
User Profile: Name: ${profile?.name || "Friend"}, Goal: ${profile?.goal || "Fitness"}, Experience: ${profile?.experience || "Beginner"}, Medical/Injuries: ${profile?.medicalLimitations || "None"}.

Provide concise, highly practical, motivating fitness advice (100-200 words max).
Use bullet points for exercises or tips. Always emphasize proper form, joint protection, and consistency.`;

    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      history: formattedHistory,
      config: {
        systemInstruction,
      },
    });

    const response = await chat.sendMessage({ message });
    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error("Error in coach chat:", error);
    res.json({
      success: true,
      reply: "I'm here to support your fitness journey! Keep your chest lifted, core tight, and remember that consistency beats intensity every single time.",
    });
  }
});

// ExerciseDB Proxy API endpoint
app.get("/api/exercisedb", async (req, res) => {
  try {
    const limit = req.query.limit || "50";
    const response = await fetch(`https://oss.exercisedb.dev/api/v1/exercises?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`ExerciseDB API responded with status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error proxying ExerciseDB:", error?.message);
    res.status(500).json({ success: false, error: error?.message });
  }
});

// AI Voice Speech Synthesis endpoint (Gemini TTS with fallback)
app.post("/api/ai/speak-text", async (req, res) => {
  try {
    const { text, voice = "Kore" } = req.body;
    const ai = await getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say clearly in a motivating fitness coach voice: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ success: true, audioBase64: base64Audio });
    } else {
      res.json({ success: false, message: "No audio data returned" });
    }
  } catch (error: any) {
    console.warn("TTS generation warning (will use browser Web Speech fallback):", error?.message);
    res.json({ success: false, fallbackToBrowser: true });
  }
});

// Last-resort error handler: any uncaught sync/async error becomes a JSON 500
// instead of an unhandled exception that crashes the serverless invocation.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

export default app;
