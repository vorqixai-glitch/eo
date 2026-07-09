import { useState, useRef, useEffect } from "react";
import { Leaf, Cpu, Orbit } from "lucide-react";
import { motion } from "motion/react";

export function ThreeDHologram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Calculate cursor position relative to center of the 3D canvas (-0.5 to 0.5)
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      // Smoothly tilt the 3D space based on mouse coordinates
      setCoords({ x: x * 40, y: y * -40 });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  // Generate 12 elegant quantum swarm particles orbiting
  const particles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 360) / 12;
    const distance = 80 + Math.random() * 40;
    const delay = i * 0.15;
    return { angle, distance, delay };
  });

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 0, y: 0 });
      }}
      className="relative h-[280px] w-full flex items-center justify-center overflow-visible cursor-pointer select-none perspective-[1200px]"
    >
      {/* Interactive 3D Canvas Rig */}
      <div
        style={{
          transform: `rotateX(${coords.y}deg) rotateY(${coords.x}deg)`,
          transformStyle: "preserve-3d",
          transition: isHovered
            ? "transform 0.1s ease-out"
            : "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="relative w-64 h-64 flex items-center justify-center"
      >
        {/* Glow backdrop sphere */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-[50px] transform-gpu scale-75 animate-pulse" />

        {/* 1. Outer Horizontal Ring (Orbital Plate) */}
        <div
          style={{
            transform: "rotateX(75deg) rotateY(0deg)",
            transformStyle: "preserve-3d",
          }}
          className="absolute w-56 h-56 rounded-full border border-dashed border-primary/45 flex items-center justify-center animate-[spin_12s_linear_infinite]"
        >
          {/* Node on ring */}
          <div className="absolute top-0 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,1)]" />
          <div className="absolute bottom-0 h-2 w-2 rounded-full bg-emerald-400" />
        </div>

        {/* 2. Inner Vertical Ring */}
        <div
          style={{
            transform: "rotateX(15deg) rotateY(70deg)",
            transformStyle: "preserve-3d",
          }}
          className="absolute w-44 h-44 rounded-full border border-emerald-500/30 flex items-center justify-center animate-[spin_8s_linear_infinite_reverse]"
        >
          <div className="absolute left-0 h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,1)]" />
        </div>

        {/* 3. Deep Diagonal Pitch Ring */}
        <div
          style={{
            transform: "rotateX(-35deg) rotateY(45deg)",
            transformStyle: "preserve-3d",
          }}
          className="absolute w-36 h-36 rounded-full border border-primary/20 border-dotted flex items-center justify-center animate-[spin_16s_linear_infinite]"
        />

        {/* 4. Active Swarm Center Core (The Floating Leaf Hologram) */}
        <div
          style={{
            transform: "translateZ(30px)",
            transformStyle: "preserve-3d",
          }}
          className="absolute z-10 h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-primary/30 flex items-center justify-center border border-primary/35 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.7)] transition-all duration-300 group"
        >
          {/* Animated pulsing leaf element */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotateY: [0, 180, 360],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex items-center justify-center text-primary"
          >
            <Leaf className="h-8 w-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </motion.div>

          {/* Internal core particle */}
          <div className="absolute h-1 w-1 bg-white rounded-full animate-ping" />
        </div>

        {/* 5. Quantum Swarm Orbiting Particles (using 3D translateZ) */}
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              transform: `rotate(${p.angle}deg) translateX(${p.distance}px) translateZ(${15 + Math.sin(i) * 30}px)`,
              animationDelay: `${p.delay}s`,
            }}
            className="absolute h-1 w-1 rounded-full bg-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"
          />
        ))}

        {/* Technical Coordinate HUD Ring (Parallax HUD overlays) */}
        <div
          style={{
            transform: "translateZ(-40px)",
          }}
          className="absolute text-[8px] font-mono text-primary/40 flex flex-col gap-0.5"
        >
          <span>[X_PITCH: {coords.x.toFixed(1)}°]</span>
          <span>[Y_YAW: {coords.y.toFixed(1)}°]</span>
          <span className="text-center font-bold tracking-widest text-emerald-500/50 animate-pulse">
            L I V E
          </span>
        </div>
      </div>
    </div>
  );
}
