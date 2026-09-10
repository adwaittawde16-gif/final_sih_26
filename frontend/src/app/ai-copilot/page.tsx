"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  Bot,
  User,
  Send,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Loader2,
  RefreshCw,
  Phone,
  FileText,
  Activity,
  Network,
  Mic,
  MicOff
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "copilot";
  text: string;
  data?: any;
  timestamp: string;
}

const PRESET_PROMPTS = [
  "Why was Md. Ranbir Bhalla flagged with high threat score?",
  "Show nocturnal call anomalies with Z-Score > 2.0",
  "Check connection path between Md. Advik Golla and Md. Ranbir Bhalla",
  "Detect financial Hawala smurfing patterns and mule accounts",
  "Show top 5 priority targets in the review queue",
  "Find physical CCTV co-location clusters in Dadar"
];

export default function AICopilotPage() {
  const defaultWelcome: Message = {
    id: "welcome",
    sender: "copilot",
    text: "**Brihanmumbai Police AI Intelligence Copilot Online.**\n\nI can assist you with:\n- Investigating **why suspects were flagged** (SHAP feature attribution & counterfactuals)\n- Identifying **clandestine call links** and **shortest network routes**\n- Flagging **statistical nocturnal anomalies** (Gaussian Z-score $Z > 2.0$)\n- Auditing **financial Hawala structuring** & mule account money trails\n\nAsk any question or click a demo query below to begin.",
    timestamp: "10:00:00"
  };

  const [messages, setMessages] = useState<Message[]>([defaultWelcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Auto-submit after a short delay so state is updated
      setTimeout(() => {
        handleSend(transcript);
      }, 100);
    };
    recognition.start();
  };

  useEffect(() => {
    // Load persisted history from localStorage on mount (hydration safe)
    try {
      const saved = localStorage.getItem("police_ai_copilot_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // Fallback if localStorage is unavailable
    }

    // Default welcome message with local time
    setMessages([
      {
        ...defaultWelcome,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour12: false })
      }
    ]);
  }, []);

  // Persist messages whenever they change (keep last 20 messages / 10 pairs)
  useEffect(() => {
    if (messages.length > 1 || (messages.length === 1 && messages[0].id !== "welcome")) {
      try {
        localStorage.setItem("police_ai_copilot_history", JSON.stringify(messages.slice(-20)));
      } catch {
        // Storage full or unavailable
      }
    }
  }, [messages]);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem("police_ai_copilot_history");
    } catch {}
    setMessages([
      {
        ...defaultWelcome,
        id: "welcome-" + Date.now(),
        timestamp: new Date().toLocaleTimeString("en-IN", { hour12: false })
      }
    ]);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour12: false })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.queryCopilot(q);
      const copilotMsg: Message = {
        id: "copilot-" + Date.now(),
        sender: "copilot",
        text: res.answer_markdown || "No intelligence records matched your query.",
        data: res,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour12: false })
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: "err-" + Date.now(),
        sender: "copilot",
        text: `⚠️ **Intelligence Query Error**: Unable to reach backend server.\n\n*Make sure FastAPI is running on port 8080.*`,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour12: false })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header
        title="AI Intelligence Copilot & Tactical Query Assistant"
        description="Natural language intelligence investigation powered by live graph analytics, XAI, and statistical anomaly detection."
      />

      {/* Preset Demo Prompts */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Suggested Judge Demo Queries:
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 transition hover:border-blue-500 hover:text-white disabled:opacity-50"
            >
              <Sparkles className="size-3 text-blue-400" />
              <span>{p}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <Card className="border-slate-800 bg-slate-900/90 text-white shadow-2xl">
        <CardHeader className="border-b border-slate-800 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="size-5 text-blue-400" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Live Intelligence Console
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearHistory}
                className="rounded border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:border-red-500/50 hover:bg-red-950/40 hover:text-red-300 transition"
                title="Reset conversation history"
              >
                Clear History
              </button>
              <Badge className="border-blue-800 bg-blue-950 font-mono text-[10px] text-blue-400">
                GPT / BERT + FASTAPI ENGINE 2.0
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="h-[480px] overflow-y-auto space-y-4 pr-2 font-sans">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.sender === "copilot" && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-800 bg-blue-950">
                    <Bot className="size-4 text-blue-400" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed space-y-2.5 ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "border border-slate-800 bg-slate-950 text-slate-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.text}</div>

                  {/* Dynamic Action Button & Evidence Items */}
                  {m.data?.action_link && (
                    <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={m.data.action_link}
                        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white shadow transition hover:bg-blue-500"
                      >
                        {m.data.action_label || "View Details"} <ArrowRight className="size-3" />
                      </Link>
                      <span className="font-mono text-[10px] text-slate-500">
                        Intent: {m.data.intent}
                      </span>
                    </div>
                  )}

                  {/* Suggested Next Queries */}
                  {m.data?.suggested_queries && m.data.suggested_queries.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Follow-Up Questions:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.data.suggested_queries.map((sq: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(sq)}
                            className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-blue-300 hover:border-blue-500 hover:text-white transition"
                          >
                            ↳ {sq}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[9px] font-mono text-slate-500 text-right" suppressHydrationWarning>
                    {m.timestamp} IST
                  </p>
                </div>

                {m.sender === "user" && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
                    <User className="size-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
                <Loader2 className="size-4 animate-spin text-blue-400" />
                <span>Copilot is querying multi-modal intelligence engines…</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Query Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 border-t border-slate-800 pt-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask intelligence questions e.g. 'Why was Md. Ranbir Bhalla flagged?' or 'Find connection between suspect A and B'..."
              className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
            />
<<<<<<< HEAD
            {/* Mic Button */}
=======
>>>>>>> 875d13fc365cac088e675cb0c0df239497346f92
            <button
              type="button"
              onClick={startListening}
              title={isListening ? "Stop listening" : "Speak your query (en-IN)"}
              className={`relative flex items-center justify-center rounded-lg border px-3 py-2.5 transition ${
                isListening
                  ? "border-rose-500 bg-rose-900/40 text-rose-400"
                  : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {isListening && (
                <span className="absolute inset-0 rounded-lg animate-ping bg-rose-500 opacity-20" />
              )}
              {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </button>
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5"
            >
              <Send className="mr-1.5 size-3.5" /> Query Copilot
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
