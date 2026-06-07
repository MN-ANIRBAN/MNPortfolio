"use client";
import { Variants } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from "framer-motion";
import {
  Cpu,
  Database,
  ExternalLink,
  Globe,
  Layers,
  Lock,
  MapPin,
  Server,
  Shield,
  Sun,
  Moon,
  Terminal,
  ChevronRight,
  Zap,
  Code2,
  CheckCircle,
  Mail,
  X,
  ArrowUpRight
} from "lucide-react";


/* ─────────────────────────────────────────────
   TYPES & INTERFACES
───────────────────────────────────────────── */
interface TerminalLine {
  type: "input" | "system" | "success" | "error" | "banner";
  text: string;
}

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  hue: number;
  life: number;
  maxLife: number;
}

interface SkillPoint {
  name: string;
  value: number; 
  category: string;
  color: string;
  details: {
    summary: string;
    bullets: string[];
  };
}

/* ─────────────────────────────────────────────
   SCRAMBLE TEXT (BLACKBOX AI STYLE)
───────────────────────────────────────────── */
const ScrambleText = ({ text, trigger = true }: { text: string; trigger?: boolean }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*!<>/\\|";

  useEffect(() => {
    if (!trigger) return;
    let iteration = 0;
    const interval = window.setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((_, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) window.clearInterval(interval);
      iteration += 0.4;
    }, 25);

    return () => window.clearInterval(interval);
  }, [text, trigger]);

  return <span>{displayText}</span>;
};

/* ─────────────────────────────────────────────
   TYPEWRITER
───────────────────────────────────────────── */
const TypewriterText = ({ lines, speed = 45 }: { lines: string[]; speed?: number }) => {
  const [displayed, setDisplayed] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (lineIdx >= lines.length) return;
    const line = lines[lineIdx];

    if (charIdx < line.length) {
      const t = window.setTimeout(() => {
        setDisplayed((prev) => prev + line[charIdx]);
        setCharIdx((c) => c + 1);
      }, speed);
      return () => window.clearTimeout(t);
    }

    const t = window.setTimeout(() => {
      setDisplayed((prev) => prev + "\n");
      setLineIdx((l) => l + 1);
      setCharIdx(0);
    }, 300);

    return () => window.clearTimeout(t);
  }, [charIdx, lineIdx, lines, speed]);

  useEffect(() => {
    const t = window.setInterval(() => setShowCursor((c) => !c), 530);
    return () => window.clearInterval(t);
  }, []);

  return (
    <pre className="text-[11px] text-inherit opacity-80 font-mono leading-relaxed whitespace-pre-wrap">
      {displayed}
      <span className={showCursor ? "opacity-100" : "opacity-0"} style={{ color: "currentColor" }}>
        █
      </span>
    </pre>
  );
};

const heroTags = ["SYSTEMS ENGINEER", "M.TECH · BITS PILANI", "CYBERSECURITY"];

const MatrixScramble = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*§⚡";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((_, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <span className="tracking-widest">{displayText}</span>;
};

/* ─────────────────────────────────────────────
   GLITCH TEXT
───────────────────────────────────────────── */
const GlitchText = ({ text, className = "", isDark }: { text: string; className?: string, isDark: boolean }) => {
  return (
    <span className={`relative inline-block ${className}`} data-text={text}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .glitch-text { position: relative; }
        .glitch-text::before, .glitch-text::after {
          content: attr(data-text);
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          opacity: 0;
        }
        .glitch-text:hover::before {
          animation: glitch1 0.3s steps(1) 1;
          color: ${isDark ? '#3b82f6' : '#10b981'};
          clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%);
          transform: translateX(-3px);
        }
        .glitch-text:hover::after {
          animation: glitch2 0.3s steps(1) 1;
          color: ${isDark ? '#60a5fa' : '#34d399'};
          clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
          transform: translateX(3px);
        }
        @keyframes glitch1 { 0%,100%{opacity:0} 10%,30%,50%,70%,90%{opacity:1} 20%,40%,60%,80%{opacity:0} }
        @keyframes glitch2 { 0%,100%{opacity:0} 15%,35%,55%,75%,95%{opacity:1} 25%,45%,65%,85%{opacity:0} }
      `,
        }}
      />
      <span className="glitch-text" data-text={text}>
        {text}
      </span>
    </span>
  );
};

/* ─────────────────────────────────────────────
   MAGNETIC DOCK ITEM
───────────────────────────────────────────── */
const MagneticDockItem = ({
  children,
  href,
  tooltip,
  isDark,
}: {
  children: React.ReactNode;
  href: string;
  tooltip: string;
  isDark: boolean;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Bounce spring for Super.money feel, smooth spring for Blackbox feel
  const springX = useSpring(x, { stiffness: isDark ? 120 : 300, damping: isDark ? 14 : 12 });
  const springY = useSpring(y, { stiffness: isDark ? 120 : 300, damping: isDark ? 14 : 12 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * (isDark ? 0.45 : 0.6));
    y.set((clientY - centerY) * (isDark ? 0.45 : 0.6));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={{ borderRadius: isDark ? "8px" : "16px", x: springX, y: springY }}
      className={`relative w-12 h-12 flex items-center justify-center border transition-all duration-300
        ${isDark 
          ? "border-white/10 bg-black/50 backdrop-blur-md text-white/50 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
          : "border-slate-900 bg-white text-slate-900 hover:bg-[#CCFF00] hover:-translate-y-1 shadow-[2px_2px_0px_rgba(15,23,42,1)] hover:shadow-[4px_4px_0px_rgba(15,23,42,1)]"
        }`}
    >
      <div className="relative z-10 transition-transform duration-150">
        {children}
      </div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -12, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            className={`absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 font-bold text-[10px] tracking-widest whitespace-nowrap pointer-events-none z-50
              ${isDark 
                ? "bg-black border border-white/10 text-white/80 rounded-md shadow-[0_0_15px_rgba(0,0,0,0.5)]" 
                : "bg-slate-900 border-none text-white rounded-xl shadow-[4px_4px_0px_rgba(204,255,0,1)]"
              }`}
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.a>
  );
};

/* ─────────────────────────────────────────────
   ANIMATED SKILL RADAR CHART
───────────────────────────────────────────── */
const SkillRadarChart = ({ points, isDark }: { points: SkillPoint[] ; isDark: boolean }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 150);
    return () => window.clearTimeout(t);
  }, []);

  const n = Math.max(points.length, 3);
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 45; 
  const angle0 = -Math.PI / 2;

  const ringLevels = [0.2, 0.4, 0.6, 0.8, 1];

  const getCoordinates = (i: number, valuePct: number) => {
    const a = angle0 + (i * 2 * Math.PI) / n;
    const r = valuePct * R;
    return {
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
      angle: a
    };
  };

  const polyPoints = useMemo(() => {
    return points
      .map((p, i) => {
        const pct = mounted ? Math.max(0, Math.min(100, p.value)) / 100 : 0;
        const { x, y } = getCoordinates(i, pct);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }, [points, mounted, n]);

  const activePopupStyle = useMemo(() => {
    if (activeIdx === null) return null;
    const p = points[activeIdx];
    const pct = Math.max(0, Math.min(100, p.value)) / 100;
    const { x, y } = getCoordinates(activeIdx, pct);
    
    return {
      left: `${((x / size) * 100).toFixed(2)}%`,
      top: `${((y / size) * 100).toFixed(2)}%`,
    };
  }, [activeIdx, points]);

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4">
      <div className={`border overflow-hidden ${isDark ? 'rounded-2xl border-white/[0.06] bg-[#050505]/80 backdrop-blur-3xl' : 'rounded-3xl border-slate-900 bg-white shadow-[8px_8px_0px_rgba(15,23,42,1)]'} relative z-30`}>
        <div className={`px-6 py-5 flex items-center justify-between border-b ${isDark ? 'border-white/[0.06] bg-white/[0.01]' : 'border-slate-900 bg-[#F4F5F7]'}`}>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] tracking-[0.2em] uppercase font-black ${isDark ? 'text-white/40' : 'text-slate-900'}`}>RADAR MATRIX</span>
            <span className={`text-[10px] hidden sm:inline ${isDark ? 'text-white/20' : 'text-slate-500 font-bold'}`}>· capability vectors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full blink ${isDark ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-[#10b981]'}`} />
            <span className={`text-[9px] font-bold tracking-widest ${isDark ? 'text-white/40' : 'text-slate-900'}`}>LIVE</span>
          </div>
        </div>

        <div className="p-4 md:p-8 relative flex items-center justify-center">
          <div className="relative w-full aspect-square max-w-[550px] md:max-w-[600px] h-[520px]">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${size} ${size}`}
              role="img"
              aria-label="Interactive skills metrics radar graph"
            >
              <defs>
                <radialGradient id="radarMesh" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={isDark ? "#3b82f6" : "#10b981"} stopOpacity={isDark ? "0.15" : "0.10"} />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="polyGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={isDark ? "#3b82f6" : "#10b981"} stopOpacity={isDark ? "0.4" : "0.4"} />
                  <stop offset="100%" stopColor={isDark ? "#06b6d4" : "#34d399"} stopOpacity={isDark ? "0.1" : "0.1"} />
                </linearGradient>
              </defs>

              <circle cx={cx} cy={cy} r={R} fill="url(#radarMesh)" />

              {ringLevels.map((lvl, i) => {
                const r = R * lvl;
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.1)"}
                    strokeWidth={isDark ? 0.75 : 1}
                    strokeDasharray={i === 4 ? "0" : "4,4"}
                  />
                );
              })}

              <motion.line
                x1={cx}
                y1={cy}
                x2={cx + Math.cos(0) * R}
                y2={cy + Math.sin(0) * R}
                stroke={isDark ? "#3b82f6" : "#10b981"}
                strokeWidth={isDark ? "1.5" : "2"}
                opacity={isDark ? "0.5" : "0.8"}
                style={{ transformOrigin: `${cx}px ${cy}px`, willChange: "transform" }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              />

              {points.map((p, i) => {
                const { x, y, angle } = getCoordinates(i, 1);
                const labelDistance = R + 25;
                const lx = cx + Math.cos(angle) * labelDistance;
                const ly = cy + Math.sin(angle) * labelDistance;
                
                const textAnchor = lx < cx - 10 ? "end" : lx > cx + 10 ? "start" : "middle";
                const dy = ly < cy ? "-0.2em" : "0.6em";

                return (
                  <g key={p.name} className="select-none">
                    <line
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      stroke={p.color}
                      strokeOpacity={isDark ? 0.15 : 0.3}
                      strokeWidth={1}
                      strokeDasharray="2,2"
                    />
                    <text
                      x={lx}
                      y={ly}
                      dy={dy}
                      textAnchor={textAnchor}
                      fontSize="10"
                      fontFamily={isDark ? "'JetBrains Mono', monospace" : "'Inter', sans-serif"}
                      fill={isDark ? "rgba(255,255,255,0.6)" : "rgba(15,23,42,1)"}
                      fontWeight={isDark ? "500" : "700"}
                    >
                      {p.name}
                    </text>
                  </g>
                );
              })}

              <motion.polygon
                points={polyPoints}
                fill="url(#polyGradient)"
                stroke={isDark ? "#3b82f6" : "#10b981"}
                strokeWidth={isDark ? "1.5" : "3"}
                strokeOpacity="0.9"
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2, type: "spring", bounce: 0.4 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />

              {points.map((p, i) => {
                const pct = mounted ? Math.max(0, Math.min(100, p.value)) / 100 : 0;
                const { x, y } = getCoordinates(i, pct);

                return (
                  <circle
                    key={`dot-${p.name}`}
                    cx={x}
                    cy={y}
                    r={activeIdx === i ? (isDark ? 6 : 8) : (isDark ? 4 : 5)}
                    fill={isDark ? "#000" : "#fff"}
                    stroke={p.color}
                    strokeWidth={isDark ? "2" : "3"}
                    style={{ cursor: "pointer", transition: "r 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseLeave={() => setActiveIdx(null)}
                    onFocus={() => setActiveIdx(i)}
                    onBlur={() => setActiveIdx(null)}
                  />
                );
              })}
            </svg>

            {activeIdx !== null && activePopupStyle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`absolute z-[90] min-w-[260px] max-w-[300px] border ${
                  isDark ? 'rounded-xl border-white/10 bg-black/90 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]' : 'rounded-2xl border-slate-900 bg-white shadow-[4px_4px_0px_rgba(15,23,42,1)]'
                } p-5 pointer-events-none`}
                style={{
                  left: activePopupStyle.left,
                  top: activePopupStyle.top,
                  transform: "translate(-50%, -115%)",
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-md ${isDark ? 'text-blue-400 bg-blue-500/10' : 'text-slate-900 bg-[#CCFF00]'}`}>
                      {points[activeIdx].category}
                    </span>
                    <h4 className={`font-black text-base mt-2 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {points[activeIdx].name}
                    </h4>
                  </div>
                  <div className={`text-xs font-black px-2 py-1 rounded-lg ${isDark ? 'bg-white/10 text-white' : 'bg-slate-900 text-white shadow-[2px_2px_0px_rgba(16,185,129,1)]'}`}>
                    {points[activeIdx].value}%
                  </div>
                </div>
                
                <p className={`text-[11px] leading-relaxed mb-3 font-medium ${isDark ? 'text-white/60 font-sans' : 'text-slate-600 font-sans'}`}>
                  {points[activeIdx].details.summary}
                </p>
                
                <ul className={`space-y-1.5 text-[10px] font-bold border-t pt-3 ${isDark ? 'border-white/10 text-white/50 font-mono' : 'border-slate-200 text-slate-700 font-sans'}`}>
                  {points[activeIdx].details.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      <span className={`mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full ${isDark ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]' : 'bg-[#10b981]'}`} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
const AnimCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        let start = 0;
        const duration = 1400;
        const step = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          // Easing easeOutExpo
          const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setCount(Math.floor(ease * value));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

/* ─────────────────────────────────────────────
   CURSOR GLOW & PARTICLES
───────────────────────────────────────────── */
const CursorGlow = ({ isDark }: { isDark: boolean }) => {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  
  const sx = useSpring(x, { stiffness: 400, damping: 28 });
  const sy = useSpring(y, { stiffness: 400, damping: 28 });

  const dotX = useTransform(x, (v) => v - 4);
  const dotY = useTransform(y, (v) => v - 4);

  const auraX = useTransform(sx, (v) => v - 150);
  const auraY = useTransform(sy, (v) => v - 150);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999999]">
      <motion.div
        className="fixed pointer-events-none rounded-full mix-blend-difference hidden md:block"
        style={{
          width: 8,
          height: 8,
          x: dotX,
          y: dotY,
          background: isDark ? "#ffffff" : "#0f172a",
        }}
      />

      {isDark && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none rounded-full hidden md:block"
          style={{
            width: 300,
            height: 300,
            x: auraX,
            y: auraY,
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 60%)",
            mixBlendMode: "screen",
          }}
        />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   LEFT RAIL: VERTICAL PROGRESS
───────────────────────────────────────────── */
const VerticalProgress = ({
  navLinks,
  activeSectionIndex,
  isDark,
}: {
  navLinks: { href: string; label: string; key: string }[];
  activeSectionIndex: number;
  isDark: boolean;
}) => {
  const progressMax = Math.max(1, navLinks.length - 1);
  const progressPct = (activeSectionIndex / progressMax) * 100;

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col items-center">
      <div className="relative flex flex-col items-center gap-8 py-6 bg-transparent">
        <div className={`absolute top-0 bottom-0 w-[2px] ${isDark ? 'bg-white/[0.05]' : 'bg-slate-200 rounded-full'}`} />

        <motion.div
          className={`absolute top-0 w-[2px] rounded-full transition-all duration-300 ${isDark ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" : "bg-slate-900"}`}
          style={{ height: `${progressPct}%` }}
        />

        {navLinks.map((link, idx) => {
          const isActive = idx === activeSectionIndex;
          return (
            <a
              key={link.key}
              href={link.href}
              className="relative flex items-center justify-center group z-10"
            >
              <motion.div
                className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${
                  isActive
                    ? isDark 
                      ? "bg-black border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.8)]" 
                      : "bg-[#CCFF00] border-slate-900 scale-125"
                    : isDark 
                      ? "bg-[#050505] border-white/20 group-hover:border-blue-400" 
                      : "bg-white border-slate-300 group-hover:border-slate-900"
                }`}
              />
              <span className={`absolute left-8 font-bold text-[10px] tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-all duration-200 px-3 py-1.5 whitespace-nowrap pointer-events-none
                ${isDark ? 'bg-black border border-white/10 text-white rounded-md shadow-[0_0_15px_rgba(0,0,0,0.5)]' : 'bg-slate-900 text-white rounded-xl shadow-[4px_4px_0px_rgba(204,255,0,1)]'}`}>
                {link.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   BACKGROUND GRIDS & OVERLAYS
───────────────────────────────────────────── */
const HexGrid = ({ isDark }: { isDark: boolean }) => (
  <div className={`fixed inset-0 pointer-events-none z-[2] ${isDark ? 'opacity-[0.03]' : 'opacity-[0.05]'}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {isDark ? (
          <pattern id="gridPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        ) : (
          <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(${isDark ? '#gridPattern' : '#dotPattern'})`} />
    </svg>
  </div>
);

const ScanLines = () => (
  <div className="fixed inset-0 pointer-events-none z-[5] opacity-[0.02]"
    style={{
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
    }}
  />
);

/* ─────────────────────────────────────────────
   PRELOADER
───────────────────────────────────────────── */
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
    >
      <div className="w-72 space-y-8 text-center">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="font-mono text-[11px] font-bold tracking-[0.5em] text-white uppercase"
        >
          System Initializing
        </motion.div>
        <div className="relative h-[2px] bg-white/10 w-full overflow-hidden rounded-full">
          <motion.div
            className="absolute left-0 top-0 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="font-mono text-xs font-bold text-white/50 tracking-widest">
          {Math.min(Math.floor(progress), 100)}%
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   FULL-SCREEN PROJECT MODAL
───────────────────────────────────────────── */
const ProjectModal = ({
  project,
  onClose,
  isDark,
}: {
  project: any;
  onClose: () => void;
  isDark: boolean;
}) => {
  const metrics = [
    { label: "OPTIMIZATION INDEX", value: "+38% Runtime Execution" },
    { label: "LATENCY REDUCTION", value: "-14ms Validation Lag" },
    { label: "INTEGRITY SHIELD", value: "99.99% Node Secured" },
  ];

  const architectureFlow = [
    "DATA INGESTION",
    "PROCESSING MATRIX",
    "BUFFER VALIDATION",
    "SECURE DISPATCH",
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] ${isDark ? 'bg-black/80' : 'bg-slate-900/40'} backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
        className={`relative max-w-2xl w-full p-8 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar 
          ${isDark 
            ? 'bg-[#050505] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,1)]' 
            : 'bg-white border-2 border-slate-900 rounded-3xl shadow-[8px_8px_0px_rgba(15,23,42,1)]'}`}
      >
        <div className={`flex items-start justify-between border-b pb-6 mb-8 ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <div
              style={{ 
                color: isDark ? project.colorDark : project.colorLight, 
                background: isDark ? `${project.colorDark}15` : `${project.colorLight}20`,
                border: `2px solid ${isDark ? `${project.colorDark}30` : project.colorLight}` 
              }}
              className={`p-3.5 ${isDark ? 'rounded-xl' : 'rounded-2xl shadow-[2px_2px_0px_rgba(15,23,42,1)]'}`}
            >
              {project.icon}
            </div>
            <div>
              <span className={`text-[10px] tracking-[0.2em] font-black uppercase`} style={{ color: isDark ? project.colorDark : project.colorLight }}>
                {project.scope}
              </span>
              <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{project.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2.5 transition-all ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl' 
                : 'bg-slate-100 hover:bg-[#CCFF00] border-2 border-transparent hover:border-slate-900 text-slate-600 hover:text-slate-900 rounded-xl hover:shadow-[2px_2px_0px_rgba(15,23,42,1)]'
            }`}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="mb-8">
          <h4 className={`text-[11px] tracking-[0.2em] mb-3 uppercase font-black ${isDark ? 'text-blue-400' : 'text-slate-900'}`}>Specification</h4>
          <p className={`text-sm leading-relaxed p-5 font-medium ${isDark ? 'text-white/70 bg-white/[0.03] border border-white/[0.05] rounded-xl' : 'text-slate-700 bg-slate-50 border-2 border-slate-100 rounded-2xl'}`}>
            {project.desc}
          </p>
        </div>

        <div className="mb-8">
          <h4 className={`text-[11px] tracking-[0.2em] mb-4 uppercase font-black ${isDark ? 'text-white/40' : 'text-slate-900'}`}>Architecture Flow</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            {architectureFlow.map((step, i) => (
              <React.Fragment key={step}>
                <div className={`p-4 relative group transition-colors flex items-center justify-center ${
                  isDark 
                    ? 'border border-white/[0.08] bg-white/[0.02] hover:border-blue-500/50 rounded-xl' 
                    : 'border-2 border-slate-200 bg-white hover:border-slate-900 hover:shadow-[4px_4px_0px_rgba(15,23,42,1)] hover:-translate-y-1 rounded-2xl'
                }`}>
                  <span className={`absolute top-2 left-2 text-[8px] font-black ${isDark ? 'text-white/20' : 'text-slate-400'}`}>0{i + 1}</span>
                  <div className={`text-[10px] font-black truncate mt-1 ${isDark ? 'text-white/70' : 'text-slate-800'}`}>{step}</div>
                </div>
                {i < architectureFlow.length - 1 && (
                  <div className={`hidden sm:flex items-center justify-center text-sm ${isDark ? 'text-white/20' : 'text-slate-300 font-bold'}`}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h4 className={`text-[11px] tracking-[0.2em] mb-4 uppercase font-black ${isDark ? 'text-white/40' : 'text-slate-900'}`}>Impact Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className={`p-5 transition-all ${
                  isDark 
                    ? 'border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] rounded-xl' 
                    : 'border-2 border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-900 hover:shadow-[4px_4px_0px_rgba(15,23,42,1)] hover:-translate-y-1 rounded-2xl'
                }`}
              >
                <div className={`text-[9px] font-black tracking-wider uppercase mb-2 truncate ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                  {metric.label}
                </div>
                <div className={`text-sm font-black tracking-tight ${isDark ? 'text-blue-400' : 'text-[#10b981]'}`}>{metric.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={`flex flex-wrap gap-2 border-t pt-6 ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
          {project.tags.map((tag: string) => (
            <span
              key={tag}
              className={`px-3 py-1.5 text-[10px] font-black tracking-wide ${
                isDark 
                  ? 'bg-white/5 text-white/60 border border-white/[0.08] rounded-lg' 
                  : 'bg-slate-100 text-slate-700 border-2 border-slate-200 rounded-xl'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   MATRIX RAIN OVERLAY
───────────────────────────────────────────── */
const MatrixRainOverlay = ({ onClose }: { onClose: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890XYZ⚡";
    const alphabet = katakana.split("");
    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);
    const rainDrops: number[] = Array.from({ length: columns }).map(() => 1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#3b82f6";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) rainDrops[i] = 0;
        rainDrops[i]++;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 font-mono select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-black/95 border border-blue-500/50 px-10 py-8 rounded-2xl text-center shadow-[0_0_80px_rgba(59,130,246,0.3)] pointer-events-auto max-w-sm w-full">
        <Shield size={48} className="text-blue-400 mx-auto mb-4 blink" />
        <h2 className="text-2xl font-black text-white tracking-widest mb-2">ACCESS GRANTED</h2>
        <p className="text-xs text-blue-400/80 tracking-wider font-bold mb-6">// MN-AGENT CORRIDOR DEPLOYED</p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 border border-white/20 text-white/80 text-xs font-bold tracking-[0.2em] hover:bg-white/10 transition-all rounded-xl flex items-center gap-2 mx-auto"
        >
          <X size={14} strokeWidth={3} /> DISMISS
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PORTFOLIO EXPORT
───────────────────────────────────────────── */
export default function UltimatePortfolio() {
  const [siteLoading, setSiteLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [konamiActive, setKonamiActive] = useState(false);
  const [konamiIndex, setKonamiIndex] = useState(0);

  const terminalContainerRef = useRef<HTMLDivElement | null>(null);

  const [terminalInput, setTerminalInput] = useState("");
  const [navScrolled, setNavScrolled] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const projectThemeColors = {
    dark: ["#3b82f6", "#06b6d4", "#8b5cf6"],
    light: ["#10b981", "#0ea5e9", "#f59e0b"]
  };

  const [terminalLogs, setTerminalLogs] = useState<TerminalLine[]>([
    { type: "banner", text: "╔══════════════════════════════════════════════════════════╗" },
    { type: "banner", text: "║    MN-AGENT CORE · QUANTUM BUFFER LAYER v4.0             ║" },
    { type: "banner", text: "╚══════════════════════════════════════════════════════════╝" },
    { type: "system", text: "▸ SYSTEM LINK: STABLE · ALL NODES SYNCHRONIZED" },
    { type: "success", text: "▸ READY · Run /help for available commands" },
  ]);

  const navLinks = useMemo(
    () => [
      { href: "#control-center", label: "OVERVIEW", key: "overview" },
      { href: "#experience-matrix", label: "EXPERIENCE", key: "experience" },
      { href: "#project-grid", label: "PROJECTS", key: "projects" },
      { href: "#tech-arsenal", label: "ARSENAL", key: "arsenal" },
    ],
    []
  );

  const projects = useMemo(
    () => [
      {
        title: "Cryptography Key Algorithm",
        tech: "Python",
        scope: "ACADEMIC",
        icon: <Lock size={20} strokeWidth={2.5} />,
        colorDark: projectThemeColors.dark[0],
        colorLight: projectThemeColors.light[0],
        desc: "Custom ROT13 processing utility safeguarding active network data packages. Configured runtime access validation protocols mirroring defense structures.",
        tags: ["Encryption", "Network Security", "Python"],
      },
      {
        title: "Image Steganography Assembly Tool",
        tech: "Python / LSB",
        scope: "ACADEMIC",
        icon: <Shield size={20} strokeWidth={2.5} />,
        colorDark: projectThemeColors.dark[1],
        colorLight: projectThemeColors.light[1],
        desc: "Binary text encryption payloads hidden inside visual digital assets using Least Significant Bit (LSB) array injection strategies.",
        tags: ["Steganography", "Cryptography", "Digital Forensics"],
      },
      {
        title: "Keylogger Surveillance Simulation",
        tech: "System-Level",
        scope: "EDUCATIONAL",
        icon: <Server size={20} strokeWidth={2.5} />,
        colorDark: projectThemeColors.dark[2],
        colorLight: projectThemeColors.light[2],
        desc: "Low-level system input logging loops with automated screenshot storage handlers mapping telemetry risks for penetration training paradigms.",
        tags: ["Penetration Testing", "Telemetry", "Security Research"],
      },
    ],
    []
  );

  const skillsData = useMemo(
    () => [
      {
        cat: "LANGUAGES",
        color: isDark ? "#3b82f6" : "#10b981",
        icon: <Code2 size={16} />,
        bars: [
          { label: "Python", value: 88 },
          { label: "Java", value: 78 },
          { label: "C++", value: 72 },
          { label: "C", value: 72 },
        ],
      },
      {
        cat: "DATA ENGINE",
        color: isDark ? "#06b6d4" : "#0ea5e9",
        icon: <Database size={16} />,
        bars: [
          { label: "PostgreSQL", value: 82 },
          { label: "MySQL", value: 85 },
          { label: "DBMS Concepts", value: 90 },
        ],
      },
      {
        cat: "CONTROL OPS",
        color: isDark ? "#8b5cf6" : "#f59e0b",
        icon: <Server size={16} />,
        bars: [
          { label: "Linux", value: 85 },
          { label: "ServiceNow", value: 80 },
          { label: "Security Protocols", value: 78 },
        ],
      },
      {
        cat: "FRAMEWORKS",
        color: isDark ? "#a78bfa" : "#f43f5e",
        icon: <Layers size={16} />,
        bars: [
          { label: "Data Structures", value: 84 },
          { label: "OOP Design", value: 88 },
          { label: "Cybersecurity", value: 82 },
        ],
      },
    ],
    [isDark]
  );

  const sectionIds = useMemo(() => navLinks.map((l) => l.href.replace("#", "")), [navLinks]);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  const konamiCode = useMemo(
    () => ["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"],
    []
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === konamiCode[konamiIndex]) {
        const nextIndex = konamiIndex + 1;
        setKonamiIndex(nextIndex);
        if (nextIndex === konamiCode.length) {
          setKonamiActive(true);
          setKonamiIndex(0);
        }
      } else {
        setKonamiIndex(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiIndex, konamiCode]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return () => window.removeEventListener("scroll", onScroll);

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (!visible.length) return;
        const topId = (visible[0].target as HTMLElement).id;
        const idx = sectionIds.indexOf(topId);
        if (idx >= 0) setActiveSectionIndex(idx);
      },
      { root: null, threshold: [0.2, 0.35, 0.5, 0.65], rootMargin: "-15% 0px -60% 0px" }
    );

    sections.forEach((s) => obs.observe(s));

    return () => {
      window.removeEventListener("scroll", onScroll);
      obs.disconnect();
    };
  }, [sectionIds]);

  useEffect(() => {
    if (!terminalContainerRef.current) return;
    terminalContainerRef.current.scrollTo({
      top: terminalContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [terminalLogs]);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  {/*const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: isDark ? 200 : 400, damping: isDark ? 25 : 20, mass: 1 },
    },
  };*/}
  const itemVariants: Variants = {  // <-- Ekhane explicit type set korun
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      mass: 1
    }
  }
};
  const experience = [
    {
      role: "System Engineer",
      client: "ICICI Bank",
      company: "Wipro Limited",
      duration: "JUL 2023 — PRESENT",
      status: "ACTIVE",
      colorDark: "#3b82f6",
      colorLight: "#10b981",
      bullets: [
        "Configured and audited transactional security environments adhering strictly to RBI governance codes.",
        "Managed active incident queues, resolving 100+ structural blockages inside SLA targets via ServiceNow pipelines.",
      ],
      badge: "SECURE",
    },
    {
      role: "IT Infrastructure Patching Support Engineer",
      client: "IDFC First Bank",
      company: "Wipro Limited",
      duration: "AUG 2022 — JUN 2023",
      status: "COMPLETED",
      colorDark: "#06b6d4",
      colorLight: "#0ea5e9",
      bullets: [
        "Engineered system patch compliance matrices for 500+ hybrid Linux and Windows server architectures.",
        "Programmed data reporting workflows reducing structural checking manual overhead by 30%.",
      ],
      badge: "COMPLIANT",
    },
  ];

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    const response: TerminalLine[] = [
      { type: "input", text: `mn-root@quantum:~$ ${terminalInput}` },
    ];

    if (cmd === "/help") {
      response.push(
        { type: "banner", text: "┌─ AVAILABLE COMMANDS ────────────────────────────────────┐" },
        { type: "system", text: "  /experience  → Infrastructure timeline telemetry" },
        { type: "system", text: "  /skills      → Capability matrices (Languages/DB/Control Ops)" },
        { type: "system", text: "  /identity    → Author mainframe signature" },
        { type: "system", text: "  /status      → Live system health report" },
        { type: "system", text: "  /projects    → Project map (3 core projects)" },
        { type: "system", text: "  /contact     → Contact channels (email + mailto hint)" },
        { type: "system", text: "  /matrix      → Matrix-style ASCII rain in terminal" },
        { type: "system", text: "  /clear       → Wipe terminal buffer" },
        { type: "banner", text: "└─────────────────────────────────────────────────────────┘" }
      );
    } else if (cmd === "/experience") {
      response.push(
        { type: "success", text: "▸ STREAMING WIPRO PRODUCTION RECORDS..." },
        { type: "system", text: "  [ACTIVE]  System Engineer · ICICI Bank Cloud Infrastructure" },
        { type: "system", text: "            ↳ Cluster audits · RBI governance compliance" },
        { type: "system", text: "  [PRIOR]   IT Patching Support · IDFC First Bank" },
        { type: "system", text: "            ↳ 500+ servers · 30% overhead reduction" }
      );
    } else if (cmd === "/skills") {
      response.push(
        { type: "success", text: "▸ CAPABILITY MATRICES LOADED:" },
        { type: "system", text: "  LANGUAGES  :: Python · Java · C++ · C" },
        { type: "system", text: "  DATA OPS   :: PostgreSQL · MySQL · DBMS" },
        { type: "system", text: "  CORE       :: Linux · ServiceNow · Security Protocols" }
      );
    } else if (cmd === "/identity") {
      response.push(
        { type: "success", text: "▸ IDENTITY NODE VERIFIED:" },
        { type: "system", text: "  NAME     : ANIRBAN ADHIKARY [SENIOR_SYSTEM_ENGINEER]" },
        { type: "system", text: "  ACADEMIC : M.Tech · BITS Pilani (Active)" },
        { type: "system", text: "  FIELD    : Cybersecurity · Systems Engineering" }
      );
    } else if (cmd === "/status") {
      response.push(
        { type: "success", text: "▸ SYSTEM STATUS REPORT:" },
        { type: "system", text: "  CPU    [██████████] 100% — FULLY OPERATIONAL" },
        { type: "system", text: "  MEM    [████████░░]  84% — NOMINAL" },
        { type: "system", text: "  NET    [██████████] 100% — UPLINK STABLE" },
        { type: "system", text: "  THREAT [░░░░░░░░░░░]   0% — SECURE" }
      );
    } else if (cmd === "/clear") {
      setTerminalLogs([]);
      setTerminalInput("");
      return;
    } else if (cmd === "/contact") {
      response.push(
        { type: "success", text: "▸ CONTACT CHANNELS ONLINE:" },
        { type: "system", text: "  EMAIL    :: anirbanadhikary2015@gmail.com" },
        { type: "banner", text: "└─ Use: 'mailto:anirbanadhikary2015@gmail.com' to send." }
      );
    } else if (cmd === "/projects") {
      response.push(
        { type: "success", text: "▸ PROJECT MAP:" },
        { type: "system", text: "  1) Cryptography Key Algorithm (Python)" },
        { type: "system", text: "  2) Image Steganography Tool (Python / LSB)" },
        { type: "system", text: "  3) Keylogger Surveillance Simulation (Edu)" }
      );
    } else if (cmd === "/matrix") {
      setKonamiActive(true);
      response.push({ type: "success", text: "▸ MATRIX RAIN DEPLOYED..." });
    } else {
      response.push(
        { type: "error", text: `  Command not found: ${cmd}` },
        { type: "system", text: "  Type /help for available commands." }
      );
    }

    setTerminalLogs((prev) => [...prev, ...response]);
    setTerminalInput("");
  };

  return (
    <div
      className={`theme-engine ${isDark ? "selection:bg-blue-500/30 selection:text-white" : "selection:bg-[#CCFF00] selection:text-slate-900"}`}
      data-theme={isDark ? 'dark' : 'light'}
    >
      <HexGrid isDark={isDark} />
      {isDark && <ScanLines />}
      <CursorGlow isDark={isDark} />

      {/* Animated Sweep Line (AI Scanner effect) */}
      {isDark && (
        <motion.div
          className="fixed top-0 left-0 w-[2px] h-screen pointer-events-none z-[4]"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(59,130,246,0.8), transparent)",
            boxShadow: "0 0 20px rgba(59,130,246,0.4)"
          }}
          animate={{ x: ["-10vw", "110vw"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
        />
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700;800&family=Inter:wght@400;500;700;900&display=swap');
        * { cursor: none !important; }
        body { font-family: 'JetBrains Mono', monospace; }
        .sans { font-family: 'Inter', sans-serif; }

        :root {
          /* ── DARK: Blackbox.ai inspired ── */
          --bg-dark: #000000;
          --text-dark: #ffffff;

          /* ── LIGHT: super.money inspired ── */
          --bg-light: #F6F8FA;
          --text-light: #0f172a;
        }

        .theme-engine {
          transition: background-color 0.5s ease, color 0.5s ease;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }
        .theme-engine[data-theme='dark'] {
          background-color: var(--bg-dark);
          color: var(--text-dark);
          /* Deep space gradient */
          background-image: radial-gradient(circle at 15% 10%, rgba(59,130,246,0.08) 0%, transparent 40%),
                            radial-gradient(circle at 85% 90%, rgba(139,92,246,0.06) 0%, transparent 40%);
        }
        .theme-engine[data-theme='light'] {
          background-color: var(--bg-light);
          color: var(--text-light);
          font-family: 'Inter', sans-serif; /* Super.money uses clean sans mostly */
        }

        .nav-link { 
          position: relative; 
          opacity: 0.7; 
          transition: opacity 0.2s ease, transform 0.2s ease; 
          font-size: 11px; 
          font-weight: 700;
          letter-spacing: 0.12em; 
          text-transform: uppercase;
        }
        [data-theme='light'] .nav-link { font-family: 'Inter', sans-serif; opacity: 1; color: #475569; }
        [data-theme='light'] .nav-link:hover { color: #0f172a; transform: translateY(-1px); }
        .nav-link:hover { opacity: 1; }
        .nav-link::after {
          content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px;
          transition: width 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .nav-link:hover::after { width: 100%; }
        [data-theme='dark'] .nav-link::after { background: #3b82f6; box-shadow: 0 0 8px rgba(59,130,246,0.8); }
        [data-theme='light'] .nav-link::after { background: #10b981; }

        .card-glow-dark {
          box-shadow: 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 20px rgba(255,255,255,0.02);
          background: rgba(10,10,10,0.6);
        }
        .card-glow-light {
          background: #ffffff;
          border: 2px solid #0f172a;
          box-shadow: 6px 6px 0px rgba(15,23,42,1);
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.5); border-radius: 4px; }
        [data-theme='dark'] .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); }

        @keyframes statusBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .blink { animation: statusBlink 1.8s ease-in-out infinite; }

        .stat-card-dark {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
        }
        .stat-card-light {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
        }
      `,
        }}
      />

      {/* ── NAVIGATION ── */}
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          navScrolled
            ? isDark
              ? "bg-black/80 backdrop-blur-xl border-b border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
              : "bg-white/90 backdrop-blur-xl border-b-2 border-slate-900 shadow-[0_4px_0px_rgba(15,23,42,1)]"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`text-sm font-black tracking-widest flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900 font-sans'}`}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
              <Cpu size={18} className={`${isDark ? 'text-blue-500' : 'text-[#10b981]'}`} strokeWidth={2.5} />
            </motion.div>
            <span>ANIRBAN</span>
            <span className={`text-[9px] font-bold tracking-normal px-2 py-1 rounded-md ${isDark ? 'text-blue-400 bg-blue-500/10' : 'text-slate-900 bg-[#CCFF00]'}`}>v4.0</span>
          </motion.div>

          <div className={`hidden md:flex items-center gap-8`}>
            {navLinks.map((link) => (
              <a key={link.key} href={link.href} className="nav-link font-sans">
                {link.label}
              </a>
            ))}
            <div className={`w-[2px] h-4 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            
            <button
              onClick={() => setIsDark(!isDark)}
              className={`flex items-center gap-2 px-3 py-1.5 font-bold rounded-lg text-[10px] tracking-widest transition-all ${
                isDark
                  ? "border border-white/10 text-white/50 hover:text-white hover:border-white/30 hover:bg-white/5"
                  : "border-2 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-900 hover:shadow-[2px_2px_0px_rgba(15,23,42,1)]"
              }`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={12} strokeWidth={2.5} /> : <Moon size={12} strokeWidth={2.5} />}
              {isDark ? "LIGHT" : "DARK"}
            </button>
            <motion.a
              href="mailto:anirbanadhikary2015@gmail.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-2 font-black rounded-xl text-[10px] tracking-widest transition-all ${
                isDark
                  ? "bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  : "bg-slate-900 text-white border-2 border-slate-900 hover:bg-[#10b981] hover:text-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)] hover:shadow-[4px_4px_0px_rgba(15,23,42,1)]"
              }`}
            >
              <Mail size={12} strokeWidth={2.5} /> CONTACT
            </motion.a>
            <button
              onClick={() => setTerminalOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 font-bold rounded-xl text-[10px] tracking-widest transition-all ${
                isDark
                  ? "border border-white/10 text-white/60 hover:text-white hover:border-white/30 hover:bg-white/5"
                  : "bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 hover:shadow-[2px_2px_0px_rgba(15,23,42,1)]"
              }`}
            >
              <Terminal size={12} strokeWidth={2.5} /> TERMINAL
            </button>
          </div>
        </div>
      </nav>

      {/* Left progress rail */}
      <VerticalProgress
        navLinks={navLinks}
        activeSectionIndex={activeSectionIndex}
        isDark={isDark}
      />

      {/* Right dock */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-[60]">
        <MagneticDockItem href="https://github.com/MN-ANIRBAN" tooltip="GITHUB" isDark={isDark}>
          <ExternalLink size={18} strokeWidth={2} />
        </MagneticDockItem>
        <MagneticDockItem href="https://linkedin.com/in/mn-anirban" tooltip="LINKEDIN" isDark={isDark}>
          <Globe size={18} strokeWidth={2} />
        </MagneticDockItem>
        <MagneticDockItem href="mailto:anirbanadhikary2015@gmail.com" tooltip="EMAIL" isDark={isDark}>
          <Mail size={18} strokeWidth={2} />
        </MagneticDockItem>
      </div>

      <AnimatePresence mode="wait">
        {siteLoading && <Preloader onComplete={() => setSiteLoading(false)} />}
      </AnimatePresence>

      {konamiActive && <MatrixRainOverlay onClose={() => setKonamiActive(false)} />}

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} isDark={isDark} />
        )}
      </AnimatePresence>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-28 relative z-20"
      >
        {/* ── HERO ── */}
        <motion.section id="control-center" variants={itemVariants} className="mb-32">
          <div
            className={`grid grid-cols-1 lg:grid-cols-12 gap-0 border overflow-hidden relative ${
              isDark
                ? "border-white/[0.08] rounded-2xl backdrop-blur-2xl card-glow-dark"
                : "rounded-[2.5rem] card-glow-light"
            }`}
          >
            {/* Top accent line for Dark mode */}
            {isDark && <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0" />}

            {/* Left content */}
            <div className={`lg:col-span-7 p-8 md:p-14 border-b lg:border-b-0 lg:border-r relative overflow-hidden ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <span className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-blue-400' : 'bg-[#10b981]'}`} />
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isDark ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-[#10b981]'}`} />
                  </span>
                  <span className={`text-[10px] tracking-[0.25em] uppercase font-black ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                    Available for opportunities
                  </span>
                </div>

                <h1 className={`text-6xl md:text-[5rem] font-black uppercase tracking-tighter leading-[0.9] mb-4 ${isDark ? 'text-white' : 'text-slate-900 font-sans'}`}>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                    className="block"
                  >
                    <MatrixScramble text="ANIRBAN" />
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.7 }}
                    className={`block ${isDark ? 'text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-[#10b981]'}`}
                  >
                    <MatrixScramble text="ADHIKARY" />
                  </motion.span>
                </h1>

                <div className="flex flex-wrap gap-2.5 mt-6 mb-8">
                  {heroTags.map((tag, i) => (
                    <span key={i} className={`text-[9px] px-3.5 py-2 font-black tracking-widest ${
                      isDark
                        ? 'border border-white/10 text-white/70 bg-white/[0.03] rounded-lg'
                        : 'border-2 border-slate-200 text-slate-700 bg-slate-50 rounded-xl'
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <p className={`text-sm leading-relaxed max-w-lg mb-10 font-medium ${isDark ? 'text-white/60 font-mono' : 'text-slate-600 font-sans'}`}>
                  M.Tech candidate at BITS Pilani with industry tenure at Wipro in IT infrastructure and system operations engineering. Expert in cryptographic orchestration, cluster patching verification protocols, and incident management pipelines.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-10">
                  {[
                    { value: 4, suffix: "+", label: "Years Exp" },
                    { value: 500, suffix: "+", label: "Servers" },
                    { value: 100, suffix: "+", label: "Incidents" },
                    { value: 30, suffix: "%", label: "Efficiency" },
                  ].map((stat, i) => (
                    <div key={i} className={isDark ? 'stat-card-dark p-4' : 'stat-card-light p-4'}>
                      <div className={`text-2xl font-black tabular-nums tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <AnimCounter value={stat.value} suffix={stat.suffix} />
                      </div>
                      <div className={`text-[9px] mt-1 font-bold tracking-wide uppercase ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <motion.a
                    href="https://github.com/MN-ANIRBAN"
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2.5 px-6 py-3.5 font-black text-[11px] tracking-widest transition-all ${
                      isDark
                        ? "bg-white text-black hover:bg-white/90 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        : "bg-[#10b981] border-2 border-slate-900 text-slate-900 hover:bg-[#CCFF00] rounded-2xl shadow-[4px_4px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_rgba(15,23,42,1)] hover:-translate-y-1"
                    }`}
                  >
                    <Terminal size={14} strokeWidth={2.5} /> GITHUB
                  </motion.a>

                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2.5 px-6 py-3.5 font-black text-[11px] tracking-widest transition-all ${
                      isDark
                        ? "bg-transparent border border-white/20 text-white hover:bg-white/5 rounded-xl"
                        : "bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 hover:shadow-[4px_4px_0px_rgba(15,23,42,1)] hover:-translate-y-1 rounded-2xl"
                    }`}
                  >
                    <ExternalLink size={14} strokeWidth={2.5} /> RESUME
                  </motion.a>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className={`lg:col-span-5 flex flex-col ${isDark ? 'bg-white/[0.01]' : 'bg-[#F8FAFC]'}`}>
              <div className={`p-8 border-b ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
                <div className={`text-[10px] font-black tracking-[0.2em] uppercase mb-5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                  System Identity
                </div>
                <div className="space-y-4">
                  {[
                    { key: "LOC", value: "Bhatpara, West Bengal, IN", icon: <MapPin size={12} strokeWidth={2.5} /> },
                    { key: "NET", value: "anirbanadhikary2015@gmail.com", icon: <Mail size={12} strokeWidth={2.5} /> },
                    { key: "EDU", value: "M.Tech · BITS Pilani (Active)", icon: <Cpu size={12} strokeWidth={2.5} /> },
                    { key: "EXP", value: "Wipro Ltd. · 4 Years", icon: <Zap size={12} strokeWidth={2.5} /> },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-4 group">
                      <div className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-white/5 text-white/40 group-hover:bg-blue-500/20 group-hover:text-blue-400' : 'bg-white border-2 border-slate-200 text-slate-400 group-hover:border-[#10b981] group-hover:text-[#10b981]'}`}>
                        {item.icon}
                      </div>
                      <span className={`text-[10px] w-8 shrink-0 font-black tracking-widest ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{item.key}</span>
                      <span className={`text-[11px] font-bold ${isDark ? 'text-white/80 font-mono' : 'text-slate-700 font-sans'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-10 gap-6">
                <div className="text-center">
                  <div className={`text-[10px] font-black tracking-[0.25em] uppercase mb-4 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>INTERACTIVE SHELL · v4.0</div>
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={`font-mono text-xs font-bold tracking-widest mb-8 ${isDark ? 'text-blue-400' : 'text-[#10b981]'}`}
                  >
                    mn-root@quantum:~ #$_
                  </motion.div>
                  <motion.button
                    onClick={() => setTerminalOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-3 px-8 py-4 font-black text-[11px] tracking-[0.2em] uppercase transition-all ${
                      isDark
                        ? "bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                        : "bg-slate-900 text-white rounded-2xl hover:bg-[#CCFF00] hover:text-slate-900 border-2 border-slate-900 shadow-[4px_4px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_rgba(15,23,42,1)] hover:-translate-y-1"
                    }`}
                  >
                    <Terminal size={14} strokeWidth={2.5} />
                    INITIALIZE
                  </motion.button>
                </div>
                <div className={`text-[9px] font-black tracking-widest text-center ${isDark ? 'text-white/20 font-mono' : 'text-slate-400 font-sans'}`}>
                  /help · /skills · /projects · /status
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── EXPERIENCE ── */}
        <motion.section id="experience-matrix" variants={itemVariants} className="mb-32">
          <div className="flex items-center gap-4 mb-4">
            <span className={`text-[11px] font-black tracking-[0.3em] uppercase ${isDark ? 'text-blue-500' : 'text-[#10b981]'}`}>01</span>
            <div className={`flex-1 h-[2px] ${isDark ? 'bg-gradient-to-r from-blue-500/30 to-transparent' : 'bg-slate-200'}`} />
          </div>
          <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tight mb-10 ${isDark ? 'text-white font-mono' : 'text-slate-900 font-sans'}`}>
            <GlitchText text="Production Operations" isDark={isDark} />
          </h2>

          <div className="space-y-6">
            {experience.map((job, idx) => (
              <motion.div
                key={idx}
                whileHover={!isDark ? { y: -4, x: -4, boxShadow: "8px 8px 0px rgba(15,23,42,1)" } : { x: 4 }}
                transition={{ type: "spring", stiffness: isDark ? 300 : 400, damping: isDark ? 30 : 20 }}
                className={`relative border overflow-hidden group transition-all ${
                  isDark 
                    ? 'bg-[#050505]/80 border-white/[0.08] rounded-2xl hover:border-blue-500/30 card-glow-dark' 
                    : 'bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_rgba(15,23,42,1)]'
                }`}
              >
                <div className={`absolute left-0 top-0 bottom-0 ${isDark ? 'w-[2px]' : 'w-2'} transition-colors`} style={{ background: isDark ? job.colorDark : job.colorLight }} />
                <div className={`p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start ${isDark ? 'pl-8' : 'pl-10'}`}>
                  <div className="flex flex-col md:flex-1">
                    <div className="flex items-center gap-4 flex-wrap mb-2">
                      <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{job.role}</h3>
                      <span
                        className={`text-[9px] px-2.5 py-1 font-black tracking-widest uppercase ${isDark ? 'rounded-md' : 'rounded-lg border-2 border-slate-900'}`}
                        style={{ 
                          color: isDark ? job.colorDark : '#0f172a', 
                          background: isDark ? `${job.colorDark}15` : job.colorLight 
                        }}
                      >
                        {job.badge}
                      </span>
                    </div>
                    <div className={`text-xs mb-6 font-bold ${isDark ? 'text-white/40 font-mono' : 'text-slate-500 font-sans'}`}>
                      {job.company} — <span className={isDark ? 'text-white/60' : 'text-slate-700'}>Client: {job.client}</span>
                    </div>
                    <ul className="space-y-3">
                      {job.bullets.map((b, bi) => (
                        <li key={bi} className={`flex gap-3.5 text-sm font-medium ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                          <ChevronRight size={16} strokeWidth={3} className="shrink-0 mt-0.5" style={{ color: isDark ? job.colorDark : job.colorLight }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span
                      className={`text-[10px] px-4 py-2 font-black tracking-widest ${isDark ? 'rounded-lg' : 'rounded-xl border-2 border-slate-200'}`}
                      style={isDark ? { color: job.colorDark, background: `${job.colorDark}10`, border: `1px solid ${job.colorDark}20` } : { color: '#475569', background: '#f8fafc' }}
                    >
                      {job.duration}
                    </span>
                    <span className={`text-[9px] font-black tracking-widest uppercase flex items-center gap-2 ${job.status === "ACTIVE" ? (isDark ? "text-blue-400" : "text-[#10b981]") : (isDark ? "text-white/30" : "text-slate-400")}`}>
                      <span className={`w-2 h-2 rounded-full ${job.status === "ACTIVE" ? `blink ${isDark ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-[#10b981]"}` : (isDark ? "bg-white/20" : "bg-slate-300")}`} />
                      {job.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── PROJECTS ── */}
        <motion.section id="project-grid" variants={itemVariants} className="mb-32">
          <div className="flex items-center gap-4 mb-4">
            <span className={`text-[11px] font-black tracking-[0.3em] uppercase ${isDark ? 'text-blue-500' : 'text-[#10b981]'}`}>02</span>
            <div className={`flex-1 h-[2px] ${isDark ? 'bg-gradient-to-r from-blue-500/30 to-transparent' : 'bg-slate-200'}`} />
          </div>
          <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tight mb-10 ${isDark ? 'text-white font-mono' : 'text-slate-900 font-sans'}`}>
            <GlitchText text="Cryptographic Assets" isDark={isDark} />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((proj, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col overflow-hidden group transition-all duration-300 ${
                  isDark
                    ? 'bg-[#050505]/80 border border-white/[0.08] hover:border-blue-500/30 rounded-2xl card-glow-dark hover:-translate-y-1'
                    : 'bg-white border-2 border-slate-900 rounded-[2rem] shadow-[4px_4px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_rgba(15,23,42,1)] hover:-translate-y-2'
                }`}
              >
                {/* Accent Top Line */}
                <div className={`h-[4px] w-full transition-all duration-500`} style={{ background: isDark ? `linear-gradient(90deg, ${proj.colorDark}, transparent)` : proj.colorLight }} />
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110 ${isDark ? 'rounded-xl' : 'rounded-2xl shadow-[2px_2px_0px_rgba(15,23,42,1)]'}`}
                      style={
                        isDark 
                          ? { color: proj.colorDark, background: `${proj.colorDark}15`, border: `1px solid ${proj.colorDark}30` }
                          : { color: '#0f172a', background: proj.colorLight, border: '2px solid #0f172a' }
                      }
                    >
                      {proj.icon}
                    </div>
                    <span
                      className={`text-[9px] font-black tracking-widest px-3 py-1.5 uppercase ${isDark ? 'rounded-lg' : 'rounded-xl border-2 border-slate-200'}`}
                      style={
                        isDark 
                          ? { color: proj.colorDark, background: `${proj.colorDark}12` }
                          : { color: '#475569', background: '#f8fafc' }
                      }
                    >
                      {proj.scope}
                    </span>
                  </div>
                  <h3 className={`text-lg font-black mb-2 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{proj.title}</h3>
                  <div className={`text-[10px] mb-4 font-bold tracking-widest uppercase ${isDark ? 'text-white/40 font-mono' : 'text-slate-500 font-sans'}`}>{proj.tech}</div>
                  <p className={`text-xs leading-relaxed mb-6 flex-1 font-medium ${isDark ? 'text-white/50' : 'text-slate-600'}`}>{proj.desc}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {proj.tags.map((tag, ti) => (
                      <span key={ti} className={`text-[9px] font-black px-2.5 py-1.5 ${
                        isDark
                          ? 'text-white/50 bg-white/[0.04] border border-white/[0.08] rounded-md'
                          : 'text-slate-600 bg-slate-100 rounded-lg'
                      }`}>{tag}</span>
                    ))}
                  </div>
                </div>
                
                <div className={`px-8 py-5 border-t flex items-center justify-between ${isDark ? 'border-white/[0.08] bg-white/[0.01]' : 'border-slate-200 bg-slate-50'}`}>
                  <button
                    onClick={() => setSelectedProject(proj)}
                    className={`flex items-center gap-2 px-4 py-2 font-black text-[10px] tracking-wide transition-all ${
                      isDark 
                        ? "text-white bg-white/5 hover:bg-white/10 rounded-lg"
                        : "text-slate-900 bg-white border-2 border-slate-200 hover:border-slate-900 rounded-xl hover:shadow-[2px_2px_0px_rgba(15,23,42,1)]"
                    }`}
                  >
                    View Details <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── SKILLS ── */}
        <motion.section id="tech-arsenal" variants={itemVariants} className="mb-32">
          <div className="flex items-center gap-4 mb-4">
            <span className={`text-[11px] font-black tracking-[0.3em] uppercase ${isDark ? 'text-blue-500' : 'text-[#10b981]'}`}>03</span>
            <div className={`flex-1 h-[2px] ${isDark ? 'bg-gradient-to-r from-blue-500/30 to-transparent' : 'bg-slate-200'}`} />
          </div>
          <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tight mb-10 ${isDark ? 'text-white font-mono' : 'text-slate-900 font-sans'}`}>
            <GlitchText text="Capability Web" isDark={isDark} />
          </h2>

          {(() => {
            const points: SkillPoint[] = [];
            const descBySkill: Record<string, SkillPoint["details"]> = {
              "Python": { summary: "Clean scripting & automation logic containing crypto parsing loops.", bullets: ["Typed structures", "Task automation", "Crypto bindings"] },
              "Java": { summary: "Object-oriented design architectures for enterprise-level applications.", bullets: ["Class mapping", "Data modeling", "Deterministic flows"] },
              "C++": { summary: "Low-level system reasoning with performant memory mechanics.", bullets: ["Memory discipline", "Algorithm verification", "Math routines"] },
              "C": { summary: "Low-overhead foundation building blocking kernel threats directly.", bullets: ["System ops", "Memory bindings", "Hardware abstraction"] },
              "PostgreSQL": { summary: "Relational database logic matching robust production schemas.", bullets: ["Trigger tracking", "Query isolation", "Normalization"] },
              "MySQL": { summary: "Database management optimization supporting concurrent execution.", bullets: ["ACID consistency", "Query profiling", "Migration"] },
              "DBMS Concepts": { summary: "Core structural understanding of indexing, constraints & operations.", bullets: ["Isolation design", "Relational calculus", "Benchmarking"] },
              "Linux": { summary: "Operating system configuration, shell automations and user audits.", bullets: ["Daemon orchestration", "Shell telemetry", "Permission hardening"] },
              "ServiceNow": { summary: "Incident management tracking meeting critical enterprise SLAs.", bullets: ["Queue automation", "Incident routing", "ITIL validation"] },
              "Security Protocols": { summary: "Configuring infrastructure loops aligned with corporate risk rules.", bullets: ["Token inspection", "Governance audits", "Threat mapping"] },
              "Data Structures": { summary: "Algorithmic layout selections preventing runtime calculation leaks.", bullets: ["Node handling", "Asymptotic reviews", "Efficient indexing"] },
              "OOP Design": { summary: "Modular program architecture maximizing encapsulation safety rules.", bullets: ["Strict interfaces", "Polymorphic reuse", "Pattern enforcement"] },
              "Cybersecurity": { summary: "Asset validation simulations tracking telemetry vulnerability patterns.", bullets: ["Cryptography", "LSB steganography", "Trace assessment"] },
            };

            skillsData.forEach((cat) => {
              cat.bars.forEach((bar) => {
                points.push({
                  name: bar.label,
                  value: bar.value,
                  category: cat.cat,
                  color: cat.color,
                  details: descBySkill[bar.label] ?? {
                    summary: `Focused tactical asset inside ${cat.cat}.`,
                    bullets: ["Hands-on scripting", "Performance validation", "Continuous deployment"],
                  },
                });
              });
            });

            return <SkillRadarChart points={points} isDark={isDark} />;
          })()}

          {/* Skills Grid Outline */}
          <div className={`mt-8 border ${isDark ? 'border-white/[0.08] rounded-2xl bg-[#050505]/80 backdrop-blur-xl card-glow-dark' : 'border-2 border-slate-900 rounded-[2rem] bg-white shadow-[6px_6px_0px_rgba(15,23,42,1)]'} overflow-hidden`}>
            <div className={`px-8 py-5 border-b flex items-center gap-3 ${isDark ? 'border-white/[0.08] bg-white/[0.02]' : 'border-slate-900 bg-[#F4F5F7]'}`}>
              <Cpu size={16} strokeWidth={2.5} className={isDark ? 'text-blue-500' : 'text-[#10b981]'} />
              <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${isDark ? 'text-white/40' : 'text-slate-900'}`}>
                Skill Matrix Index
              </span>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] ${isDark ? 'bg-white/[0.05]' : 'bg-slate-900'}`}>
              {[
                { cat: "LANGUAGES", items: ["Python Core", "Java Logic", "C++ Engine", "C Systems"], colorDark: "#3b82f6", colorLight: "#10b981" },
                { cat: "DATA ENGINE", items: ["PostgreSQL Ops", "MySQL Server", "DBMS Architecture"], colorDark: "#06b6d4", colorLight: "#0ea5e9" },
                { cat: "CONTROL OPS", items: ["Linux Kernels", "ServiceNow ITSM", "Infrastructure Audits"], colorDark: "#8b5cf6", colorLight: "#f59e0b" },
                { cat: "THEORY", items: ["Data Structures", "OOP Architecture", "Cybersecurity Map"], colorDark: "#a78bfa", colorLight: "#f43f5e" },
              ].map((box, i) => (
                <div key={i} className={`p-8 flex flex-col ${isDark ? 'bg-[#050505]' : 'bg-white'}`}>
                  <div className={`text-[11px] font-black mb-6 tracking-widest uppercase`} style={{ color: isDark ? box.colorDark : box.colorLight }}>
                    {box.cat}
                  </div>
                  <ul className={`space-y-4 text-xs font-bold ${isDark ? 'text-white/60 font-mono' : 'text-slate-600 font-sans'}`}>
                    {box.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle size={14} strokeWidth={3} className="shrink-0" style={{ color: isDark ? box.colorDark : box.colorLight }} /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── BOOT LOG ── */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className={`text-[11px] font-black tracking-[0.3em] uppercase ${isDark ? 'text-blue-500' : 'text-[#10b981]'}`}>04</span>
            <div className={`flex-1 h-[2px] ${isDark ? 'bg-gradient-to-r from-blue-500/30 to-transparent' : 'bg-slate-200'}`} />
          </div>
          <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tight mb-10 ${isDark ? 'text-white font-mono' : 'text-slate-900 font-sans'}`}>
            <GlitchText text="System Boot Log" isDark={isDark} />
          </h2>

          <div className={`border p-8 md:p-10 ${isDark ? 'border-white/[0.08] rounded-2xl bg-[#050505]/80 backdrop-blur-xl card-glow-dark' : 'border-2 border-slate-900 rounded-[2rem] bg-slate-900 shadow-[6px_6px_0px_rgba(15,23,42,1)]'}`}>
            <div className={!isDark ? 'text-[#10b981]' : ''}>
              <TypewriterText
                lines={[
                  ">> VERIFYING AUTHOR ACCESS NODE SIGNATURE...",
                  ">> GRADUATE_PROFILE: BCA ALUMNUS",
                  ">> ACADEMIC_TRACK: BITS Pilani · M.Tech WILP Enrollment (Active)",
                  ">> PRODUCTION_TENURE: Wipro Limited Employee Node (4 Year Run)",
                  ">> DOMAIN_ENGAGEMENTS: Cloud Cluster Validation · Incident Telemetry",
                  ">> VALIDATION: RADAR WEB STRUCTURAL LAYER GENERATION STABLE",
                  ">> ALL LOGICAL OBJECTIVES SECURED ✔",
                ]}
                speed={25}
              />
            </div>
          </div>
        </motion.section>
      </motion.main>

      {/* ── TERMINAL OVERLAY ── */}
      <AnimatePresence>
        {terminalOpen && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
            className={`fixed inset-0 z-[200] flex flex-col ${isDark ? 'bg-black/95 backdrop-blur-xl' : 'bg-slate-900/95 backdrop-blur-xl'}`}
          >
            <div className="flex items-center justify-end px-8 pt-8 pb-4">
              <motion.button
                onClick={() => setTerminalOpen(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-5 py-2.5 font-black text-[10px] tracking-[0.2em] uppercase transition-all ${
                  isDark
                    ? "border border-white/20 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
                    : "bg-[#10b981] text-slate-900 hover:bg-[#CCFF00] rounded-xl shadow-[4px_4px_0px_rgba(204,255,0,0.5)]"
                }`}
              >
                <X size={14} strokeWidth={3} /> CLOSE TERMINAL
              </motion.button>
            </div>

            <div className="flex-1 flex flex-col px-8 pb-8 gap-4 overflow-hidden max-w-5xl mx-auto w-full">
              <div className={`flex-1 flex flex-col overflow-hidden border ${isDark ? 'rounded-2xl border-white/[0.1] shadow-[0_0_50px_rgba(59,130,246,0.15)] bg-[#050505]' : 'rounded-3xl border-2 border-[#10b981] shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-[#0f172a]'}`}>
                <div className={`flex items-center gap-3 px-6 py-4 border-b ${isDark ? 'border-white/[0.1] bg-white/[0.02]' : 'border-[#10b981]/30 bg-[#10b981]/10'}`}>
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500 cursor-pointer" onClick={() => setTerminalOpen(false)} />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                  <span className={`ml-4 text-[10px] font-black tracking-[0.2em] font-mono uppercase ${isDark ? 'text-white/40' : 'text-[#10b981]/70'}`}>mn-root@quantum:~ · QUANTUM BUFFER v4.0</span>
                  <span className="ml-auto flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full blink ${isDark ? 'bg-blue-500' : 'bg-[#CCFF00]'}`} />
                    <span className={`text-[9px] font-bold font-mono tracking-widest ${isDark ? 'text-blue-400' : 'text-[#CCFF00]'}`}>LIVE</span>
                  </span>
                </div>

                <div
                  ref={terminalContainerRef}
                  className="flex-1 overflow-y-auto p-6 md:p-8 space-y-2 custom-scrollbar font-mono text-xs leading-relaxed"
                >
                  {terminalLogs.map((log, i) => {
                    const styles: Record<string, string> = {
                      input:   isDark ? "text-blue-400 font-bold" : "text-[#CCFF00] font-bold",
                      success: isDark ? "text-emerald-400 font-bold" : "text-[#10b981] font-bold",
                      error:   "text-red-400 font-bold border-l-2 border-red-500/50 pl-3",
                      banner:  isDark ? "text-blue-300/80 font-bold" : "text-[#0ea5e9] font-bold",
                      system:  isDark ? "text-white/60 font-medium" : "text-white/80 font-medium",
                    };
                    return (
                      <div key={i} className={`${styles[log.type]} whitespace-pre-wrap`}>
                        {log.text}
                      </div>
                    );
                  })}
                </div>

                <form
                  onSubmit={handleTerminalSubmit}
                  className={`flex items-center gap-4 border-t px-6 py-5 ${isDark ? 'border-white/[0.1] bg-white/[0.02]' : 'border-[#10b981]/30 bg-[#10b981]/5'}`}
                >
                  <span className={`${isDark ? 'text-blue-400' : 'text-[#CCFF00]'} text-xs font-black shrink-0 font-mono`}>#$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="type /help to begin..."
                    autoFocus
                    className="bg-transparent border-none outline-none text-xs w-full font-mono text-white placeholder-white/30 font-medium"
                  />
                  <button type="submit" className={`shrink-0 px-6 py-2.5 text-[10px] font-black tracking-widest rounded-xl transition-colors ${
                    isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#10b981] hover:bg-[#CCFF00] text-slate-900'
                  }`}>
                    EXECUTE
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <footer className={`border-t py-10 relative z-20 ${isDark ? 'border-white/[0.05] bg-[#000000]' : 'border-slate-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className={`text-[10px] font-black tracking-[0.2em] uppercase font-mono ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
            © 2026 ANIRBAN ADHIKARY · v4.0
          </div>
          <div className={`flex items-center gap-8 text-[10px] font-bold tracking-widest font-mono ${isDark ? 'text-white/30' : 'text-slate-500'}`}>
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-blue-500' : 'bg-[#10b981]'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isDark ? 'bg-blue-500' : 'bg-[#10b981]'}`} />
              </span>
              ALL ENV RESILIENT
            </span>
            <span className={isDark ? 'text-white/50' : 'text-slate-700'}>Uptime: 100%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}