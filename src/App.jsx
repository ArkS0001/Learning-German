import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Trophy, Volume2, Mic, Shuffle, Sparkles, Check, X, RotateCcw, Play, Pause, Star, Calendar, Flame, Settings, Home, ListChecks, Gamepad2, MessageSquare } from "lucide-react";

// --- Simple utility components (to avoid external UI deps) ---
const Chip = ({ children }) => (
  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-white/70 border-black/10 shadow-sm">
    {children}
  </span>
);
const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
    {children}
  </span>
);
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/90 shadow-lg border border-black/5 ${className}`}>{children}</div>
);
const Button = ({ children, onClick, variant = "default", className = "", disabled }) => {
  const base = "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    default: "bg-black text-white hover:bg-black/90",
    ghost: "bg-white text-black border border-black/10 hover:bg-black/5",
    green: "bg-emerald-600 text-white hover:bg-emerald-700",
    blue: "bg-sky-600 text-white hover:bg-sky-700",
    amber: "bg-amber-500 text-white hover:bg-amber-600",
    red: "bg-rose-500 text-white hover:bg-rose-600",
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

// --- Helpers ---
const speak = (text, lang = "de-DE") => {
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.95;
    utter.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  } catch {}
};

const useSpeechRecognition = (lang = "de-DE") => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef(null);
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const t = e.results?.[0]?.[0]?.transcript || "";
      setTranscript(t);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, [lang]);
  const start = () => {
    if (!recRef.current) return;
    setTranscript("");
    setListening(true);
    recRef.current.start();
  };
  return { listening, transcript, start };
};

// --- Content ---
const VOCAB = [
  { de: "Hallo", en: "Hello", tip: "Greeting" },
  { de: "Tschüss", en: "Bye", tip: "Casual farewell" },
  { de: "Bitte", en: "Please / You're welcome", tip: "Polite" },
  { de: "Danke", en: "Thanks", tip: "Polite" },
  { de: "Ja", en: "Yes", tip: "" },
  { de: "Nein", en: "No", tip: "" },
  { de: "Wie geht's?", en: "How are you?", tip: "Informal" },
  { de: "Guten Morgen", en: "Good morning", tip: "Greeting" },
  { de: "Guten Abend", en: "Good evening", tip: "Greeting" },
  { de: "Ich heiße…", en: "My name is…", tip: "Self-intro" },
  { de: "Ich bin", en: "I am", tip: "Verb: sein" },
  { de: "Haben", en: "to have", tip: "Verb: haben" },
  { de: "der", en: "the (masc)", tip: "Article" },
  { de: "die", en: "the (fem/pl)", tip: "Article" },
  { de: "das", en: "the (neut)", tip: "Article" },
  { de: "und", en: "and", tip: "Connector" },
  { de: "oder", en: "or", tip: "Connector" },
  { de: "eins", en: "one", tip: "Number" },
  { de: "zwei", en: "two", tip: "Number" },
  { de: "drei", en: "three", tip: "Number" },
];

const LESSONS = [
  {
    id: "intro",
    title: "Basics: Greetings & Self‑Intro",
    xp: 30,
    blocks: [
      { type: "note", text: "German has formal and informal registers. Use 'Hallo' or 'Guten Tag' informally; 'Guten Morgen/Abend' for time-based greetings." },
      { type: "audio", text: "Hallo! Ich heiße Alex. Wie geht's?" },
      { type: "mc", q: "What does 'Guten Morgen' mean?", options: ["Good evening", "Good morning", "Good night"], answer: 1 },
      { type: "type", prompt: "Type the German for 'Thank you'", answer: "danke" },
    ],
  },
  {
    id: "articles",
    title: "Articles & Genders (der/die/das)",
    xp: 40,
    blocks: [
      { type: "note", text: "German nouns have gender: masculine (der), feminine (die), neuter (das). Learn nouns with their article (e.g., der Tisch)." },
      { type: "mc", q: "Pick the correct article: ___ Tisch (table)", options: ["die", "der", "das"], answer: 1 },
      { type: "drag", prompt: "Match article to noun", pairs: [
        { left: "der", right: "Mann" },
        { left: "die", right: "Frau" },
        { left: "das", right: "Kind" },
      ] },
    ],
  },
  {
    id: "numbers",
    title: "Numbers 1–10",
    xp: 25,
    blocks: [
      { type: "note", text: "eins, zwei, drei, vier, fünf, sechs, sieben, acht, neun, zehn" },
      { type: "mc", q: "What is 'drei'?", options: ["two", "three", "four"], answer: 1 },
      { type: "type", prompt: "Type the German for 'one'", answer: "eins" },
    ],
  },
  {
    id: "verbs",
    title: "Core Verbs: sein & haben",
    xp: 35,
    blocks: [
      { type: "note", text: "sein (to be): ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie/Sie sind. haben (to have): ich habe, du hast, er/sie/es hat…" },
      { type: "mc", q: "'I am' in German is…", options: ["Ich habe", "Ich bin", "Ich ist"], answer: 1 },
      { type: "type", prompt: "Type the German for 'We have' (2 words)", answer: "wir haben" },
    ],
  },
];

// --- Spaced repetition (very simple SM‑2-ish) ---
const nextIntervals = [1, 2, 4, 7, 15]; // days
function scheduleCard(card, quality = 4) {
  const now = Date.now();
  const prev = card.next || now;
  const stage = Math.min((card.stage || 0) + (quality >= 3 ? 1 : -1), nextIntervals.length - 1);
  const correctedStage = Math.max(stage, 0);
  const next = now + nextIntervals[correctedStage] * 24 * 60 * 60 * 1000;
  return { ...card, stage: correctedStage, next };
}

// --- Storage ---
const load = (k, d) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; }
};
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// --- Mini-games ---
function ShuffleMatch({ items, onDone }) {
  const [left, setLeft] = useState(items.map(i => i.left));
  const [right, setRight] = useState(items.map(i => i.right).sort(() => Math.random() - 0.5));
  const [selectedL, setSelectedL] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [errors, setErrors] = useState(0);

  const done = pairs.length === items.length;

  useEffect(() => { if (done) onDone?.({ errors }); }, [done]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-xs mb-2 text-black/60">Articles</div>
        {left.map((l, i) => (
          <button key={i} onClick={() => setSelectedL(l)} className={`w-full mb-2 p-3 rounded-xl border ${selectedL===l?"border-sky-500 bg-sky-50":"border-black/10 bg-white"}`}>
            {l}
          </button>
        ))}
      </div>
      <div>
        <div className="text-xs mb-2 text-black/60">Nouns</div>
        {right.map((r, i) => (
          <button key={i} onClick={() => {
            if (!selectedL) return;
            const valid = items.some(it => it.left === selectedL && it.right === r);
            if (valid) {
              setPairs(p => [...p, [selectedL, r]]);
              setLeft(ls => ls.filter(x => x !== selectedL));
              setRight(rs => rs.filter(x => x !== r));
              setSelectedL(null);
            } else {
              setErrors(e => e + 1);
            }
          }} className="w-full mb-2 p-3 rounded-xl border border-black/10 bg-white">
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

function TypeCard({ prompt, answer, onResult }) {
  const [val, setVal] = useState("");
  const [status, setStatus] = useState(null);
  const norm = (s) => s.trim().toLowerCase();
  return (
    <div>
      <div className="mb-3 text-sm text-black/70">{prompt}</div>
      <input value={val} onChange={(e)=>setVal(e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3" placeholder="Type here…"/>
      <div className="flex gap-2 mt-3">
        <Button onClick={()=>{
          const ok = norm(val) === norm(answer);
          setStatus(ok?"ok":"no");
          onResult?.(ok);
        }} variant="green"><Check size={16}/>Check</Button>
        <Button onClick={()=>speak(answer)} variant="blue"><Volume2 size={16}/>Hear answer</Button>
        <Button onClick={()=>setVal("")} variant="ghost"><RotateCcw size={16}/>Reset</Button>
      </div>
      {status && (
        <div className={`mt-3 text-sm ${status==="ok"?"text-emerald-700":"text-rose-700"}`}>
          {status==="ok"?"Nice!":"Not quite. Try again or listen."}
        </div>
      )}
    </div>
  );
}

function MultipleChoice({ q, options, answer, onResult }) {
  const [picked, setPicked] = useState(null);
  return (
    <div>
      <div className="mb-4 font-medium">{q}</div>
      <div className="grid sm:grid-cols-3 gap-2">
        {options.map((op, idx) => (
          <button key={idx} onClick={()=>{ setPicked(idx); onResult?.(idx===answer); }}
            className={`rounded-xl border px-4 py-3 text-left transition ${picked===idx?"bg-emerald-50 border-emerald-400":"bg-white border-black/10 hover:bg-black/5"}`}>
            {op}
          </button>
        ))}
      </div>
      {picked!==null && (
        <div className="mt-3 text-sm text-black/60">Answer: <b>{options[answer]}</b></div>
      )}
    </div>
  );
}

// --- Lesson Runner ---
function LessonRunner({ lesson, onFinish, addXP }) {
  const [i, setI] = useState(0);
  const [corrects, setCorrects] = useState(0);
  const { listening, transcript, start } = useSpeechRecognition();

  useEffect(()=>{ if (transcript) speak(`You said: ${transcript}`, "en-US"); }, [transcript]);

  const block = lesson.blocks[i];
  const next = () => setI(n => Math.min(n + 1, lesson.blocks.length));

  useEffect(()=>{ if (i === lesson.blocks.length) { addXP(lesson.xp); onFinish?.({ corrects }); } }, [i]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3"><Chip>Lesson</Chip><span className="font-semibold">{lesson.title}</span></div>
      <AnimatePresence mode="popLayout">
        {i < lesson.blocks.length && (
          <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.2}}>
            {block.type === "note" && (
              <Card className="p-4">
                <div className="text-sm leading-relaxed">{block.text}</div>
                <div className="mt-3 flex gap-2">
                  <Button variant="blue" onClick={()=>next()}><Play size={16}/>Start</Button>
                  <Button variant="ghost" onClick={()=>speak(block.text, "de-DE")}><Volume2 size={16}/>Listen</Button>
                </div>
              </Card>
            )}
            {block.type === "audio" && (
              <Card className="p-4">
                <div className="text-sm">Listen and repeat:</div>
                <div className="text-lg font-semibold mt-2">{block.text}</div>
                <div className="flex gap-2 mt-3">
                  <Button variant="blue" onClick={()=>speak(block.text)}><Volume2 size={16}/>Play</Button>
                  <Button variant="amber" onClick={()=>start()} disabled={listening}><Mic size={16}/>{listening?"Listening…":"Record"}</Button>
                  <Button variant="green" onClick={next}><Check size={16}/>Continue</Button>
                </div>
                {transcript && <div className="mt-2 text-xs text-black/60">You said: <span className="font-medium">{transcript}</span></div>}
              </Card>
            )}
            {block.type === "mc" && (
              <Card className="p-4">
                <MultipleChoice q={block.q} options={block.options} answer={block.answer} onResult={(ok)=>{ if (ok) setCorrects(c=>c+1); }}/>
                <div className="mt-3"><Button variant="green" onClick={next}><Check size={16}/>Next</Button></div>
              </Card>
            )}
            {block.type === "type" && (
              <Card className="p-4">
                <TypeCard prompt={block.prompt} answer={block.answer} onResult={(ok)=>{ if (ok) setCorrects(c=>c+1); }}/>
                <div className="mt-3"><Button variant="green" onClick={next}><Check size={16}/>Next</Button></div>
              </Card>
            )}
            {block.type === "drag" && (
              <Card className="p-4">
                <ShuffleMatch items={block.pairs} onDone={()=>next()} />
                <div className="mt-3"><Button variant="green" onClick={next}><Check size={16}/>Next</Button></div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Flashcards with SRS ---
function Flashcards({ onLearned, addXP }) {
  const [deck, setDeck] = useState(() => load("gc_deck", VOCAB.map((v, idx) => ({ id: idx, ...v, stage: 0, next: Date.now() }))));
  const [i, setI] = useState(0);
  const [showEn, setShowEn] = useState(false);

  useEffect(()=> save("gc_deck", deck), [deck]);

  const due = deck.filter(c => (c.next ?? 0) <= Date.now());
  const card = due[i % Math.max(due.length, 1)] || deck[0];

  const grade = (quality) => {
    const updated = deck.map(c => c.id===card.id ? scheduleCard(c, quality) : c);
    setDeck(updated);
    setI(n => n + 1);
    setShowEn(false);
    addXP(quality >= 3 ? 5 : 1);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3"><Chip>Flashcards</Chip><span className="text-sm text-black/70">Spaced repetition</span></div>
      <Card className="p-6 flex flex-col items-center">
        <div className="text-xs mb-2 text-black/50">Due today: {due.length}</div>
        <div className="text-3xl font-bold tracking-tight" onClick={()=>setShowEn(s=>!s)}>{showEn ? card.en : card.de}</div>
        <div className="mt-3 flex gap-2">
          <Button variant="blue" onClick={()=>speak(card.de)}><Volume2 size={16}/>Speak</Button>
          <Button variant="ghost" onClick={()=>setShowEn(s=>!s)}>{showEn?"Show DE":"Show EN"}</Button>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
          <Button variant="red" onClick={()=>grade(1)}><X size={16}/>Hard</Button>
          <Button variant="amber" onClick={()=>grade(3)}><Shuffle size={16}/>So‑so</Button>
          <Button variant="green" onClick={()=>grade(4)}><Check size={16}/>Good</Button>
          <Button variant="green" onClick={()=>grade(5)}><Star size={16}/>Easy</Button>
        </div>
      </Card>
      <div className="mt-3 text-xs text-black/60">Tip: tap the big word to flip between German ↔ English.</div>
    </div>
  );
}

// --- Daily goal / streak ---
function useGamification() {
  const [xp, setXP] = useState(()=> load("gc_xp", 0));
  const [goal, setGoal] = useState(()=> load("gc_goal", 30));
  const [streak, setStreak] = useState(()=> load("gc_streak", { last: null, count: 0 }));

  useEffect(()=> save("gc_xp", xp), [xp]);
  useEffect(()=> save("gc_goal", goal), [goal]);
  useEffect(()=> save("gc_streak", streak), [streak]);

  useEffect(()=>{
    const today = new Date();
    const key = today.toISOString().slice(0,10);
    if (xp >= goal && streak.last !== key) {
      setStreak({ last: key, count: (streak.count || 0) + 1 });
    }
  }, [xp, goal]);

  const addXP = (n) => setXP(x => x + n);

  return { xp, goal, setGoal, streak, addXP };
}

// --- Mini chat for phrase practice ---
function PhraseCoach() {
  const prompts = [
    { de: "Guten Morgen! Wie geht es Ihnen? (formal)", en: "Good morning! How are you?" },
    { de: "Ich heiße Alex. Und du?", en: "My name is Alex. And you?" },
    { de: "Ich komme aus Indien.", en: "I am from India." },
  ];
  const [i, setI] = useState(0);
  const p = prompts[i % prompts.length];
  const { listening, transcript, start } = useSpeechRecognition();
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2"><MessageSquare size={16}/><b>Dialogue Drill</b></div>
      <div className="text-sm text-black/70">Say the phrase in German. Click the speaker to hear it first.</div>
      <div className="mt-3 text-lg font-semibold">{p.de}</div>
      <div className="flex gap-2 mt-3">
        <Button variant="blue" onClick={()=>speak(p.de)}><Volume2 size={16}/>Listen</Button>
        <Button variant="amber" onClick={()=>start()} disabled={listening}><Mic size={16}/>{listening?"Listening…":"Speak"}</Button>
        <Button variant="ghost" onClick={()=>setI(n=>n+1)}><Shuffle size={16}/>Next</Button>
      </div>
      {transcript && (
        <div className="mt-2 text-xs">You said: <span className="font-medium">{transcript}</span></div>
      )}
      <div className="mt-2 text-xs text-black/50">Hint: {p.en}</div>
    </Card>
  );
}

// --- Dictionary Peek ---
function MiniDictionary() {
  const [q, setQ] = useState("");
  const results = useMemo(()=>{
    if (!q) return [];
    const n = q.toLowerCase();
    return VOCAB.filter(v => v.de.toLowerCase().includes(n) || v.en.toLowerCase().includes(n));
  }, [q]);
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2"><Book size={16}/><b>Mini Dictionary</b></div>
      <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search German or English…" className="w-full rounded-xl border border-black/10 px-3 py-2"/>
      <div className="mt-3 space-y-2 max-h-56 overflow-auto pr-1">
        {results.map((r, idx)=> (
          <div key={idx} className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2">
            <div>
              <div className="font-medium">{r.de}</div>
              <div className="text-xs text-black/60">{r.en}</div>
            </div>
            <div className="flex items-center gap-2">
              {r.tip && <Badge>{r.tip}</Badge>}
              <Button variant="ghost" onClick={()=>speak(r.de)}><Volume2 size={16}/></Button>
            </div>
          </div>
        ))}
        {!results.length && <div className="text-xs text-black/50">Try: Hallo, Danke, der…</div>}
      </div>
    </Card>
  );
}

// --- App Shell ---
export default function GermanCoachApp() {
  const [tab, setTab] = useState("home");
  const [activeLesson, setActiveLesson] = useState(null);
  const { xp, goal, setGoal, streak, addXP } = useGamification();

  const resetAll = () => {
    localStorage.removeItem("gc_xp");
    localStorage.removeItem("gc_goal");
    localStorage.removeItem("gc_streak");
    localStorage.removeItem("gc_deck");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-sky-50 text-black">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 border-b border-black/5">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-500"/>
            <div className="font-extrabold tracking-tight text-lg">GermanCoach</div>
            <Chip>A1 Starter</Chip>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-1.5">
              <Trophy size={16} className="text-amber-500"/>
              <span className="text-sm font-semibold">{xp} XP</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-1.5">
              <Flame size={16} className="text-rose-500"/>
              <span className="text-sm font-semibold">Streak: {streak.count || 0}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-2 py-1.5">
              <Calendar size={16} className="text-sky-500"/>
              <span className="text-xs">Daily goal</span>
              <input type="number" min={10} max={200} value={goal} onChange={(e)=>setGoal(parseInt(e.target.value||"0"))}
                className="w-16 rounded-xl border border-black/10 px-2 py-1 text-sm"/>
              <span className="text-xs">XP</span>
            </div>
            <Button variant="ghost" onClick={resetAll}><Settings size={16}/>Reset</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-6">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-[70px] h-full self-start">
          <Card className="p-3">
            <nav className="grid gap-1">
              <button onClick={()=>setTab("home")} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${tab==="home"?"bg-black text-white":"hover:bg-black/5"}`}><Home size={16}/>Home</button>
              <button onClick={()=>setTab("learn")} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${tab==="learn"?"bg-black text-white":"hover:bg-black/5"}`}><ListChecks size={16}/>Learn</button>
              <button onClick={()=>setTab("flash")} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${tab==="flash"?"bg-black text-white":"hover:bg-black/5"}`}><Gamepad2 size={16}/>Flashcards</button>
              <button onClick={()=>setTab("speak")} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${tab==="speak"?"bg-black text-white":"hover:bg-black/5"}`}><Mic size={16}/>Speak</button>
              <button onClick={()=>setTab("dict")} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${tab==="dict"?"bg-black text-white":"hover:bg-black/5"}`}><Book size={16}/>Dictionary</button>
            </nav>
          </Card>
          <div className="mt-3 text-xs text-black/60 px-1">Progress is saved locally in your browser.</div>
        </aside>

        {/* Content */}
        <section>
          {tab === "home" && (
            <div className="space-y-6">
              <Card className="p-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="text-2xl font-extrabold tracking-tight">Willkommen! 👋</div>
                    <div className="text-black/70 mt-1">Learn German from scratch with bite‑sized lessons, smart flashcards, and speaking drills.</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge>Audio</Badge>
                      <Badge>Spaced repetition</Badge>
                      <Badge>Gamified</Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="green" onClick={()=>setTab("learn")}><Play size={16}/>Start Learning</Button>
                      <Button variant="ghost" onClick={()=>setTab("flash")}><Star size={16}/>Review Words</Button>
                    </div>
                  </div>
                  <motion.div initial={{rotate:-2, scale:.98}} animate={{rotate:0, scale:1}} transition={{type:"spring", stiffness:140}}
                    className="rounded-2xl border border-black/10 bg-gradient-to-br from-amber-100 to-sky-100 p-5">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-xl bg-white p-3 border border-black/10">
                        <div className="text-xs text-black/50">Today</div>
                        <div className="text-lg font-bold">{Math.min(xp, goal)} / {goal} XP</div>
                      </div>
                      <div className="rounded-xl bg-white p-3 border border-black/10">
                        <div className="text-xs text-black/50">Streak</div>
                        <div className="text-lg font-bold">{streak.count || 0} days</div>
                      </div>
                      <div className="rounded-xl bg-white p-3 border border-black/10 col-span-2">
                        <div className="text-xs text-black/50 mb-1">Tip</div>
                        <div className="text-sm">Tap words to hear native TTS. Keep it daily 🔥</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3"><ListChecks size={18}/><b>Recommended Path</b></div>
                <div className="grid md:grid-cols-2 gap-4">
                  {LESSONS.map((L, idx) => (
                    <div key={L.id} className="rounded-2xl border border-black/10 p-4 bg-white/80 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{idx+1}. {L.title}</div>
                        <div className="text-xs text-black/60">{L.xp} XP • {L.blocks.length} tasks</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="blue" onClick={()=>{ setActiveLesson(L); setTab("learn"); }}><Play size={16}/>Learn</Button>
                        <Button variant="ghost" onClick={()=>speak(L.title)}><Volume2 size={16}/></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {tab === "learn" && (
            <div className="space-y-6">
              {!activeLesson && (
                <Card className="p-6">
                  <div className="mb-3 font-semibold">Pick a lesson</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {LESSONS.map(L => (
                      <button key={L.id} onClick={()=>setActiveLesson(L)} className="rounded-2xl border border-black/10 p-4 text-left hover:bg-black/5">
                        <div className="font-semibold">{L.title}</div>
                        <div className="text-xs text-black/60">{L.xp} XP</div>
                      </button>
                    ))}
                  </div>
                </Card>
              )}
              {activeLesson && (
                <LessonRunner lesson={activeLesson} addXP={addXP} onFinish={()=>{
                  speak("Great job! Lesson complete.", "en-US");
                  setActiveLesson(null);
                }}/>
              )}
              <PhraseCoach />
            </div>
          )}

          {tab === "flash" && (
            <div className="space-y-6">
              <Flashcards addXP={addXP}/>
              <Card className="p-4">
                <div className="text-sm">Power tip: Learn nouns with articles (der/die/das). Add your own words soon™</div>
              </Card>
            </div>
          )}

          {tab === "speak" && (
            <div className="space-y-6">
              <PhraseCoach />
              <Card className="p-4">
                <div className="text-sm">If speech recognition isn’t available in your browser, you can still practice by listening and repeating with TTS.</div>
              </Card>
            </div>
          )}

          {tab === "dict" && (
            <div className="space-y-6">
              <MiniDictionary />
              <Card className="p-4">
                <div className="text-sm">Coming soon: verbs, conjugations, and example sentences.</div>
              </Card>
            </div>
          )}
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs text-black/50">
        Built for fun learning • Uses browser TTS (Text‑to‑Speech) • Progress saved locally
      </footer>
    </div>
  );
}
