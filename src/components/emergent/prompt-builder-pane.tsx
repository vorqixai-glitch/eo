import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { enhancePrompt } from "@/lib/chat.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { auth } from "@/integrations/firebase/client";
import {
  X,
  Sparkles,
  Copy,
  Send,
  Settings2,
  Cpu,
  ArrowUp,
  MessageSquare,
  Check,
  Undo,
  Brain,
  Layers,
  Code2,
  Bookmark,
  ChevronRight,
  ListRestart,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TechniqueType = "structured" | "cot" | "blueprint" | "few-shot";

interface PromptBuilderPaneProps {
  onClose: () => void;
  onInsertPrompt: (text: string) => void;
  onSendToSwarm: (text: string) => void;
}

export function PromptBuilderPane({
  onClose,
  onInsertPrompt,
  onSendToSwarm,
}: PromptBuilderPaneProps) {
  const [activeTab, setActiveTab] = useState<"builder" | "coach">("builder");
  const [roughInput, setRoughInput] = useState("");
  const [technique, setTechnique] = useState<TechniqueType>("structured");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [hasCopied, setHasCopied] = useState(false);

  const enhanceFn = useServerFn(enhancePrompt);

  const techniques = [
    {
      id: "structured",
      name: "Structured Roleplay",
      icon: Settings2,
      desc: "Injects professional roles, objectives, and strict bounds.",
    },
    {
      id: "cot",
      name: "Chain-of-Thought",
      icon: Brain,
      desc: "Requires detailed reasoning, step-by-step breakdown, and audits.",
    },
    {
      id: "blueprint",
      name: "System Blueprint",
      icon: Layers,
      desc: "Builds modular spec documents, schema files, and block layouts.",
    },
    {
      id: "few-shot",
      name: "Few-Shot Patterns",
      icon: Code2,
      desc: "Injects highly specific input/output mock examples.",
    },
  ] as const;

  // Enhance using the server function
  async function handleEnhance() {
    if (!roughInput.trim()) {
      toast.error("Please enter a rough prompt or idea first");
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await enhanceFn({ data: { prompt: roughInput, technique } });
      if (enhancedPrompt) {
        setHistory((prev) => [...prev, enhancedPrompt]);
      }
      setEnhancedPrompt(res.enhanced);
      toast.success("Advanced prompt generated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to engineer prompt");
    } finally {
      setIsEnhancing(false);
    }
  }

  function handleUndo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((prevHistory) => prevHistory.slice(0, -1));
    setEnhancedPrompt(prev);
    toast.info("Reverted to previous version");
  }

  const handleCopy = () => {
    if (!enhancedPrompt) return;
    navigator.clipboard.writeText(enhancedPrompt);
    setHasCopied(true);
    toast.success("Copied advanced prompt to clipboard!");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleInsert = () => {
    if (!enhancedPrompt) return;
    onInsertPrompt(enhancedPrompt);
    toast.success("Inserted advanced prompt into the Moss Chat input!");
  };

  const handleSendSwarm = () => {
    if (!enhancedPrompt) return;
    onSendToSwarm(enhancedPrompt);
    toast.success("Sent advanced prompt directly to the Swarm Orchestrator!");
  };

  // --- COACH MODE (Micro-chat context) ---
  const [coachInput, setCoachInput] = useState("");
  const [coachMessages, setCoachMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([
    {
      role: "assistant",
      content:
        "Hi! I am your Swarm Prompt Coach. Tell me what you're trying to build, and I will help you refine your ideas into clean, highly-optimized instructions before we launch them to the Moss Swarm!",
    },
  ]);
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const coachScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    coachScrollRef.current?.scrollTo({
      top: coachScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [coachMessages, isCoachThinking]);

  async function handleCoachSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = coachInput.trim();
    if (!text || isCoachThinking) return;

    setCoachInput("");
    const newMsgs = [...coachMessages, { role: "user" as const, content: text }];
    setCoachMessages(newMsgs);
    setIsCoachThinking(true);

    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          threadId: "00000000-0000-0000-0000-000000000000", // system mock thread for coaches
          messages: newMsgs.map((m, i) => ({
            id: `coach-${i}`,
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          })),
          model: "google/gemini-3-flash-preview",
          personaId: "default", // Uses Moss Swarm for high quality assistance
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to consult prompt coach");
      }

      // Read stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      if (reader) {
        setCoachMessages((prev) => [...prev, { role: "assistant" as const, content: "" }]);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });

          // Parse server-sent event or raw text from Streamed AI-SDK
          // Typically text blocks are formatted as 0:"text" in Vercel AI SDK
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const cleanStr = JSON.parse(line.slice(2));
                assistantResponse += cleanStr;
                setCoachMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = assistantResponse;
                  return updated;
                });
              } catch (e) {
                // fallback
              }
            } else if (!line.includes(":") && line.trim()) {
              // fallback for raw streams
              assistantResponse += line;
              setCoachMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = assistantResponse;
                return updated;
              });
            }
          }
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Coach failed to reply");
    } finally {
      setIsCoachThinking(false);
    }
  }

  return (
    <aside className="w-[45%] min-w-[380px] max-w-[680px] shrink-0 border-l border-border/40 bg-card/65 backdrop-blur-2xl flex flex-col h-full shadow-2xl relative overflow-hidden">
      {/* 3D background visual accents inside the side panel */}
      <div className="absolute inset-0 -z-10 select-none overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/20 blur-[60px]" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-950/20 blur-[60px]" />
      </div>

      <header className="flex flex-col border-b border-border/40 bg-background/40">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Cpu className="h-3.5 w-3.5 text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-foreground">PROMPT ARCHITECT</h2>
              <p className="text-[9px] uppercase font-mono tracking-wider text-muted-foreground">
                Draft & Engineer Advanced Prompts
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="hover:bg-muted/40 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-background/60 m-2 rounded-xl border border-border/20">
          <button
            onClick={() => setActiveTab("builder")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all",
              activeTab === "builder"
                ? "bg-card text-foreground shadow-sm border border-border/30"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Prompt Builder
          </button>
          <button
            onClick={() => setActiveTab("coach")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all",
              activeTab === "coach"
                ? "bg-card text-foreground shadow-sm border border-border/30"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
            Prompt Coach Chat
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === "builder" ? (
          <div className="p-4 space-y-5">
            {/* Rough Input Area */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                1. Rough Prompt or App Idea
              </label>
              <div className="relative rounded-xl border border-border/40 bg-background/50 focus-within:ring-1 focus-within:ring-primary/20 overflow-hidden">
                <Textarea
                  value={roughInput}
                  onChange={(e) => setRoughInput(e.target.value)}
                  placeholder="e.g., Build a beautifully formatted workout tracker with local streaks, daily metrics, and clean custom cards."
                  className="min-h-[90px] border-0 bg-transparent focus-visible:ring-0 shadow-none resize-none text-xs leading-relaxed"
                />
              </div>
            </div>

            {/* Strategy Selection */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                2. Select Engineering Technique
              </label>
              <div className="grid grid-cols-2 gap-2">
                {techniques.map((tech) => {
                  const Icon = tech.icon;
                  const isSelected = technique === tech.id;
                  return (
                    <button
                      key={tech.id}
                      onClick={() => setTechnique(tech.id)}
                      className={cn(
                        "flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200",
                        isSelected
                          ? "bg-primary/5 border-primary/40 shadow-sm shadow-primary/5 translate-y-[-1px]"
                          : "border-border/20 bg-background/30 hover:border-border/40 hover:bg-background/50",
                      )}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Icon
                          className={cn(
                            "h-3.5 w-3.5",
                            isSelected ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <span className={isSelected ? "text-foreground" : "text-muted-foreground"}>
                          {tech.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                        {tech.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Run Button */}
            <Button
              onClick={handleEnhance}
              disabled={isEnhancing || !roughInput.trim()}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/10 transition-all hover:scale-[1.01]"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Engineering Advanced Instructions…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Advanced Prompt
                </>
              )}
            </Button>

            {/* Advanced Prompt Canvas */}
            {enhancedPrompt && (
              <div className="space-y-2.5 pt-2 border-t border-border/20 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground flex items-center gap-1">
                    <Bookmark className="h-3.5 w-3.5 text-primary" /> Engineered Canvas
                  </label>
                  <div className="flex items-center gap-1">
                    {history.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleUndo}
                        title="Revert to previous version"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-background/40"
                      >
                        <Undo className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleCopy}
                      title="Copy"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-background/40"
                    >
                      {hasCopied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="relative rounded-xl border border-primary/20 bg-background/40 focus-within:ring-1 focus-within:ring-primary/20 overflow-hidden">
                  <Textarea
                    value={enhancedPrompt}
                    onChange={(e) => setEnhancedPrompt(e.target.value)}
                    className="min-h-[220px] font-mono text-[11px] leading-relaxed border-0 bg-transparent focus-visible:ring-0 shadow-none resize-y p-3"
                  />
                </div>

                {/* Integration center */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="secondary"
                    onClick={handleInsert}
                    className="h-9 border border-border/40 text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    Insert in Moss Chat
                  </Button>
                  <Button
                    onClick={handleSendSwarm}
                    className="h-9 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs rounded-xl flex items-center justify-center gap-1.5 font-semibold"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Launch to Moss
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* COACH CHAT TAB */
          <div className="flex flex-col h-full bg-background/20">
            <div ref={coachScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {coachMessages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed animate-fade-in",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto rounded-tr-none shadow-md"
                      : "bg-card/90 border border-border/30 mr-auto rounded-tl-none text-foreground shadow-sm",
                  )}
                >
                  <span className="text-[9px] uppercase font-mono tracking-wider text-muted-foreground/60 mb-1">
                    {m.role === "user" ? "USER IDEATION" : "PROMPT COACH"}
                  </span>
                  <div className="whitespace-pre-line leading-relaxed font-sans">{m.content}</div>
                </div>
              ))}
              {isCoachThinking && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  Coach is drafting feedback…
                </div>
              )}
            </div>

            {/* Coach Input Bar */}
            <form
              onSubmit={handleCoachSubmit}
              className="p-3 border-t border-border/20 bg-background/40 flex items-center gap-2"
            >
              <input
                type="text"
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder="Ask coach to improve your idea…"
                className="flex-1 bg-background/50 border border-border/30 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/60"
              />
              <Button
                type="submit"
                size="icon-sm"
                disabled={isCoachThinking || !coachInput.trim()}
                className="h-8 w-8 rounded-lg"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
