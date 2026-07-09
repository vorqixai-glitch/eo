import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createThread } from "@/lib/chat.functions";
import { toast } from "sonner";
import {
  Sparkles,
  MessageSquarePlus,
  Leaf,
  Cpu,
  ShieldCheck,
  Workflow,
  LineChart,
  Layout,
  Code,
  Database,
  Users,
  Globe,
  FileDown,
  FileUp,
  Download,
  Loader2,
  Trash2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ThreeDHologram } from "@/components/emergent/three-d-hologram";
import { TRANSLATIONS, LANGUAGES, type LanguageType } from "@/lib/translations";
import { exportBotsToPdf, parseUploadedBot } from "@/lib/pdf-service";
import { getMergedPersonas, type Persona } from "@/lib/personas";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: ChatEmpty,
});

function ChatEmpty() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const createFn = useServerFn(createThread);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [lang, setLang] = useState<LanguageType>("en");
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize language and personas on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem("moss_lang") as LanguageType;
      if (storedLang && ["en", "es", "fr", "de", "zh", "ja"].includes(storedLang)) {
        setLang(storedLang);
      }
      setPersonas(getMergedPersonas());
    }
  }, []);

  // Update language setting
  const changeLanguage = (newLang: LanguageType) => {
    setLang(newLang);
    localStorage.setItem("moss_lang", newLang);
    // Dispatch custom event to sync with other views/components instantly
    window.dispatchEvent(new CustomEvent("moss_lang_changed", { detail: newLang }));
    toast.success(`Language changed to ${LANGUAGES.find((l) => l.code === newLang)?.name}`);
  };

  async function startNew() {
    try {
      const row = await createFn({ data: {} });
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: row.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create chat");
    }
  }

  // PDF Export
  const handleDownloadSpecs = () => {
    try {
      exportBotsToPdf(personas);
      toast.success(t("customBotSuccess").slice(0, 15) + "... PDF Specs Exported!");
    } catch (e) {
      toast.error("Failed to generate PDF specs");
    }
  };

  // Bot configuration file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const parsedBot = await parseUploadedBot(file);

      // Save to localStorage
      const customStored = localStorage.getItem("moss_custom_personas");
      let customList: Persona[] = [];
      if (customStored) {
        customList = JSON.parse(customStored);
      }

      const newPersona: Persona = {
        id: parsedBot.id || `custom-${Date.now()}`,
        name: parsedBot.name || "Custom Agent",
        emoji: parsedBot.emoji || "🧠",
        tagline: parsedBot.tagline || "Dynamic custom agent",
        system: parsedBot.system || "You are a custom AI assistant.",
      };

      customList.push(newPersona);
      localStorage.setItem("moss_custom_personas", JSON.stringify(customList));

      // Refresh current component state
      const updatedPersonas = getMergedPersonas();
      setPersonas(updatedPersonas);

      // Notify chat view
      window.dispatchEvent(new CustomEvent("moss_personas_changed", { detail: updatedPersonas }));

      toast.success(`${t("customBotSuccess")}: ${newPersona.emoji} ${newPersona.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("uploadError"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Clear custom chatbots
  const handleClearCustomBots = () => {
    localStorage.removeItem("moss_custom_personas");
    const resetPersonas = getMergedPersonas();
    setPersonas(resetPersonas);
    window.dispatchEvent(new CustomEvent("moss_personas_changed", { detail: resetPersonas }));
    toast.info("Custom chatbots cleared successfully.");
  };

  // Localization helper
  const t = (key: string) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS["en"]?.[key] || key;
  };

  const agents = [
    {
      id: "orchestrator",
      name: "Orchestrator Agent",
      icon: Workflow,
      status: "READY",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      desc: "Coordinates complex sub-agent hierarchies",
    },
    {
      id: "planner",
      name: "Product Planner",
      icon: LineChart,
      status: "LISTENING",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      desc: "Specs features and defines user workflows",
    },
    {
      id: "designer",
      name: "UX/UI Agent",
      icon: Layout,
      status: "READY",
      color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
      desc: "Drafts beautiful high-contrast design specs",
    },
    {
      id: "coder",
      name: "Frontend Agent",
      icon: Code,
      status: "READY",
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      desc: "Builds responsive React panels and states",
    },
    {
      id: "db",
      name: "Database Agent",
      icon: Database,
      status: "IDLE",
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      desc: "Generates secure relational database schemas",
    },
    {
      id: "qa",
      name: "QA Automation Agent",
      icon: ShieldCheck,
      status: "READY",
      color: "text-red-400 bg-red-500/10 border-red-500/20",
      desc: "Tests form interactions and route logic",
    },
  ];

  const customBotsCount = personas.filter(
    (p) => p.id.startsWith("custom-") || p.id.startsWith("pdf-"),
  ).length;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 md:p-12 relative">
      {/* Cinematic grid overlay */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Swarm State Header Board */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Leaf className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-sans">
                  {t("swarmTitle")}
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  V1.0 ACTIVE
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Production-ready multi-agent workspace with custom 3D themes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Language Selection Bar */}
            <div className="flex items-center gap-1 bg-background/50 border border-border/30 rounded-xl p-1 shadow-inner">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => changeLanguage(l.code as LanguageType)}
                  title={l.name}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all flex items-center gap-1 ${
                    lang === l.code
                      ? "bg-primary/10 text-primary border border-primary/25 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                  }`}
                >
                  <span>{l.flag}</span>
                  <span className="uppercase text-[9px]">{l.code}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-5 font-mono text-[10px] text-muted-foreground bg-background/40 px-3 py-1.5 rounded-xl border border-border/20">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>
                  {t("swarmStatus")}:{" "}
                  <span className="text-foreground font-semibold">{t("online")}</span>
                </span>
              </div>
              <div className="h-4 w-px bg-border/40" />
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {t("agents")}:{" "}
                  <span className="text-foreground font-semibold">20/20 {t("ready")}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive 3D Hologram Area */}
        <div className="relative py-4">
          <ThreeDHologram />
        </div>

        {/* Hero Title and CTA Area */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary/80">
            {t("landingTitle")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t("landingDesc")}</p>

          <div className="pt-4">
            <Button
              size="lg"
              onClick={startNew}
              className="px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-tight rounded-xl shadow-[0_4px_25px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageSquarePlus className="mr-2.5 h-5 w-5" />
              {t("newChat")}
            </Button>
          </div>
        </div>

        {/* Document Parser / PDF Selector Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {/* Export PDF Box */}
          <div className="p-5 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-primary/20 transition-all duration-300">
            <div className="space-y-1.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <FileDown className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">{t("downloadSpec")}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("downloadSpecDesc")}
              </p>
            </div>
            <Button
              onClick={handleDownloadSpecs}
              variant="outline"
              size="sm"
              className="w-full justify-center h-9 text-xs rounded-xl border-border/40 hover:bg-muted/40 font-semibold gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              Download Spec Sheet PDF
            </Button>
          </div>

          {/* Import / Upload Specification Config Box */}
          <div className="p-5 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-primary/20 transition-all duration-300">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-primary">
                  <FileUp className="h-4.5 w-4.5" />
                </div>
                {customBotsCount > 0 && (
                  <button
                    onClick={handleClearCustomBots}
                    title="Clear uploaded custom bots"
                    className="p-1.5 text-muted-foreground hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-foreground">{t("uploadConfig")}</h3>
                {customBotsCount > 0 && (
                  <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
                    {customBotsCount} Custom
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("uploadConfigDesc")}
              </p>
            </div>

            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.json,.txt,.md"
                className="hidden"
                id="bot-config-uploader"
              />
              <Button
                asChild
                disabled={isUploading}
                variant="outline"
                size="sm"
                className="w-full justify-center h-9 text-xs rounded-xl border-border/40 hover:bg-muted/40 font-semibold gap-1.5 cursor-pointer"
              >
                <label htmlFor="bot-config-uploader">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Parsing configuration file…
                    </>
                  ) : (
                    <>
                      <FileUp className="h-3.5 w-3.5 text-primary" />
                      Upload Bot Document
                    </>
                  )}
                </label>
              </Button>
            </div>
          </div>
        </div>

        {/* Specialized Agents Grid */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs uppercase font-mono tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-primary" /> {t("copilots")}
            </span>
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition">
              {t("viewAll")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((ag) => {
              const Icon = ag.icon;
              const isHovered = hoveredAgent === ag.id;
              return (
                <div
                  key={ag.id}
                  onMouseEnter={() => setHoveredAgent(ag.id)}
                  onMouseLeave={() => setHoveredAgent(null)}
                  className={`group relative rounded-2xl border p-5 bg-card/40 backdrop-blur-md transition-all duration-300 flex flex-col justify-between ${
                    isHovered
                      ? "border-primary/50 shadow-[0_8px_30px_rgba(16,185,129,0.1)] -translate-y-1"
                      : "border-border/30 hover:border-border/60"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-background border border-border/30 flex items-center justify-center transition-colors group-hover:bg-primary/10">
                        <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${ag.color}`}
                      >
                        {ag.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-foreground">{ag.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {ag.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-border/10 mt-4">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      SWARM-ID: 0{agents.indexOf(ag) + 1}
                    </span>
                    <button
                      onClick={startNew}
                      className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                    >
                      {t("consult")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Technical Note */}
        <p className="text-center text-[10px] text-muted-foreground/55 font-mono">
          [{t("swarmDetails")}]
        </p>
      </div>
    </div>
  );
}
