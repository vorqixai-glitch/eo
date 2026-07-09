import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeType = "cosmic" | "emerald" | "cyberpunk" | "classic" | "light";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("moss-theme") as ThemeType;
      return saved || "emerald"; // Emerald is the default beautiful signature theme for "Moss"
    }
    return "emerald";
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem("moss-theme", newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    // Remove existing theme classes
    root.classList.remove(
      "dark",
      "theme-cosmic",
      "theme-emerald",
      "theme-cyberpunk",
      "theme-classic",
      "theme-light",
    );

    // Add classes based on selected theme
    if (theme !== "light") {
      root.classList.add("dark");
    }
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="relative min-h-screen w-full overflow-hidden transition-all duration-500">
        {/* Dynamic 3D/Cinematic Live Theme Background Layers */}
        <div className="absolute inset-0 -z-10 select-none overflow-hidden pointer-events-none">
          {theme === "emerald" && (
            <div className="absolute inset-0 bg-neutral-950">
              {/* Organic glowing forest orbs */}
              <div
                className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-emerald-950/40 blur-[120px] animate-pulse"
                style={{ animationDuration: "8s" }}
              />
              <div
                className="absolute bottom-[-10%] right-[-10%] h-[70%] w-[60%] rounded-full bg-green-900/30 blur-[150px] animate-pulse"
                style={{ animationDuration: "12s" }}
              />
              <div className="absolute top-[30%] left-[50%] h-[40%] w-[40%] rounded-full bg-teal-950/20 blur-[100px]" />
              {/* Delicate vertical organic streams */}
              <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(16,185,129,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>
          )}

          {theme === "cosmic" && (
            <div className="absolute inset-0 bg-slate-950">
              {/* Fluid ambient cosmic space nebula */}
              <div
                className="absolute top-[10%] right-[10%] h-[65%] w-[65%] rounded-full bg-purple-900/30 blur-[140px] animate-bounce"
                style={{ animationDuration: "20s" }}
              />
              <div
                className="absolute bottom-[5%] left-[5%] h-[55%] w-[55%] rounded-full bg-indigo-950/40 blur-[120px] animate-pulse"
                style={{ animationDuration: "10s" }}
              />
              <div className="absolute top-[40%] left-[30%] h-[30%] w-[30%] rounded-full bg-pink-950/20 blur-[100px]" />
              {/* Star constellation map background (fine dots grid) */}
              <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
              <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,_rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>
          )}

          {theme === "cyberpunk" && (
            <div className="absolute inset-0 bg-[#090a0f]">
              {/* Hard electric cyberpunk laser light sweeps */}
              <div
                className="absolute -top-[20%] left-[20%] h-[60%] w-[50%] rounded-full bg-cyan-950/30 blur-[130px] animate-pulse"
                style={{ animationDuration: "6s" }}
              />
              <div
                className="absolute bottom-[-15%] right-[10%] h-[60%] w-[50%] rounded-full bg-fuchsia-950/30 blur-[130px] animate-pulse"
                style={{ animationDuration: "8s" }}
              />
              {/* Digital cybernetic grid lines */}
              <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />
              <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,rgba(236,72,153,0.1)_150px,transparent_1px),linear-gradient(to_bottom,rgba(236,72,153,0.1)_150px,transparent_1px)] bg-[size:150px_150px]" />
            </div>
          )}

          {theme === "classic" && (
            <div className="absolute inset-0 bg-[#0a0a0c]">
              {/* Sleek executive charcoal gradients */}
              <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-neutral-900/40 to-transparent blur-md" />
              <div className="absolute bottom-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-neutral-900/30 blur-[120px]" />
            </div>
          )}

          {theme === "light" && (
            <div className="absolute inset-0 bg-[#faf9f6]">
              {/* Soft warm sunbeams */}
              <div className="absolute top-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-amber-100/30 blur-[120px]" />
              <div className="absolute bottom-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-orange-50/40 blur-[140px]" />
              <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px]" />
            </div>
          )}
        </div>

        {/* Dynamic theme style overrides */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .theme-emerald {
            --primary: oklch(0.627 0.194 149.23); /* Vibrant Emerald */
            --primary-foreground: oklch(0.129 0.042 264.695);
            --sidebar: oklch(0.12 0.02 150); /* Dark Forest Side */
            --sidebar-accent: oklch(0.18 0.04 150);
            --background: oklch(0.1 0.015 150);
            --border: oklch(1 0 0 / 8%);
            --card: oklch(0.14 0.02 150 / 80%);
          }
          .theme-cosmic {
            --primary: oklch(0.585 0.233 277.11); /* Cosmic Purple */
            --primary-foreground: oklch(0.984 0.003 247.858);
            --sidebar: oklch(0.11 0.02 275);
            --sidebar-accent: oklch(0.16 0.04 275);
            --background: oklch(0.08 0.015 275);
            --border: oklch(1 0 0 / 8%);
            --card: oklch(0.12 0.02 275 / 75%);
          }
          .theme-cyberpunk {
            --primary: oklch(0.787 0.207 195.12); /* Cyan Laser */
            --primary-foreground: oklch(0.09 0.02 240);
            --sidebar: oklch(0.09 0.01 240);
            --sidebar-accent: oklch(0.14 0.02 240);
            --background: oklch(0.07 0.01 240);
            --border: oklch(0.787 0.207 195.12 / 15%);
            --card: oklch(0.1 0.015 240 / 80%);
          }
          /* Custom glassy card design */
          .glass-card {
            background-color: var(--card);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--border);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          }
        `,
          }}
        />

        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
