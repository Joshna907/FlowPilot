"use client";

import { useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";

const panels = [
  {
    tag: "TRIGGER",
    title: ["Manual trigger", "to start", "a run"],
    text: "Start a run instantly from the UI, bypassing external services when you just need to test your logic."
  },
  {
    tag: "BUILDER",
    title: ["Voice Builder", "creates", "editable nodes"],
    text: "FlowPilot translates your voice request into a fully configured JSON structure mapped to visual nodes."
  },
  {
    tag: "STORAGE",
    title: ["Postgres", "stores", "workflow graph"],
    text: "The graph is saved before it is queued. The worker runs what is stored durably, not a temporary browser state."
  },
  {
    tag: "QUEUE",
    title: ["Redis queues", "execution", "jobs"],
    text: "Jobs are dispatched to a robust Redis-backed queue system, ensuring reliable processing even under load."
  },
  {
    tag: "WORKER",
    title: ["Worker loads", "and runs", "the graph"],
    text: "A background Node.js worker pulls the JSON DAG from Postgres and executes each node in perfect sequence."
  },
  {
    tag: "OUTPUT",
    title: ["Webhook.site", "confirms", "the POST"],
    text: "Watch the execution engine fire live HTTP requests. The ultimate proof that your automation actually ran."
  }
];

export function HorizontalCoreSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const calculateWidths = () => {
      setWindowWidth(window.innerWidth);
      if (trackRef.current) {
        setTrackWidth(trackRef.current.scrollWidth);
      }
    };

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      const scrolled = -rect.top;

      if (scrolled <= 0) {
        setScrollProgress(0);
      } else if (scrolled >= scrollableDistance) {
        setScrollProgress(1);
      } else {
        setScrollProgress(scrolled / scrollableDistance);
      }
    };

    calculateWidths();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", calculateWidths);
    
    // Initial calculate after fonts/layout settle
    const timeout = setTimeout(calculateWidths, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculateWidths);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-[600vh] w-full bg-[#fcfcfc] overflow-clip">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        
        {/* The Horizontal Sliding Track */}
        <div 
          ref={trackRef}
          className="flex h-full min-w-max will-change-transform"
          style={{ transform: `translate3d(-${scrollProgress * Math.max(0, trackWidth - windowWidth)}px, 0, 0)` }}
        >
          
          {/* Panel 1: The Execution Orb */}
          <div className="w-screen h-full flex items-center justify-center shrink-0">
            <div className="grid md:grid-cols-2 gap-16 md:gap-8 items-center max-w-[1280px] w-full px-6">
              
              {/* Left: The Animated Orb */}
              <div className="relative flex min-h-[400px] w-full items-center justify-center">
                {/* Outer Orbit */}
                <div 
                  className="absolute w-[120%] h-[120%] max-w-[500px] max-h-[500px] rounded-full border border-[#1d57f7]/20 opacity-90 animate-[spin-slow_18s_linear_infinite]" 
                  style={{ borderLeftColor: "transparent", borderBottomColor: "transparent" }}
                >
                  <div className="absolute top-1/2 right-0 w-3 h-3 rounded-full bg-[#1d57f7] shadow-[0_0_15px_#1d57f7] translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute top-1/2 right-0 w-8 h-[2px] bg-gradient-to-l from-[#1d57f7] to-transparent translate-x-1/2 -translate-y-1/2 blur-sm rotate-90 origin-right" />
                </div>

                {/* Middle Orbit */}
                <div 
                  className="absolute w-[90%] h-[90%] max-w-[380px] max-h-[380px] rounded-full border border-[#1d57f7]/30 opacity-90 animate-[spin-reverse-slow_12s_linear_infinite]" 
                  style={{ borderRightColor: "transparent", borderTopColor: "transparent" }}
                >
                  <div className="absolute bottom-0 left-1/2 w-2.5 h-2.5 rounded-full bg-[#6b9fff] shadow-[0_0_12px_#6b9fff] -translate-x-1/2 translate-y-1/2" />
                </div>

                {/* Inner Orbit */}
                <div 
                  className="absolute w-[60%] h-[60%] max-w-[260px] max-h-[260px] rounded-full border border-[#1d57f7]/40 opacity-90 animate-[spin-slow_8s_linear_infinite]" 
                  style={{ borderLeftColor: "transparent", borderTopColor: "transparent" }}
                >
                  <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_12px_#10b981] -translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Core Orb */}
                <div className="relative w-36 h-36 rounded-full overflow-hidden flex items-center justify-center animate-orb-float shadow-[0_0_80px_rgba(29,87,247,0.4)] bg-gradient-to-br from-[#6b9fff] via-[#1d57f7] to-[#0a2e99] z-10">
                  <div 
                    className="absolute inset-0 opacity-60 mix-blend-overlay animate-[spin-slow_4s_linear_infinite]"
                    style={{ background: "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.4) 25%, transparent 50%, rgba(255,255,255,0.4) 75%, transparent 100%)" }} 
                  />
                  <div className="absolute inset-4 rounded-full bg-[#1d57f7] blur-md mix-blend-screen opacity-80 animate-pulse" />
                  <div 
                    className="absolute inset-0 rounded-full pointer-events-none" 
                    style={{ boxShadow: "inset 0 6px 18px rgba(255,255,255,0.6), inset 0 -6px 18px rgba(0,0,10,0.5)" }} 
                  />
                  <Activity className="relative z-10 size-10 text-white opacity-90" />
                </div>
              </div>

              {/* Right: Typography */}
              <div className="relative z-10 flex flex-col justify-center text-center md:text-left px-4">
                <h2 className="text-5xl md:text-6xl lg:text-[72px] font-black tracking-tighter mb-6 leading-[0.95] text-[#050712]">
                  Your Live Graph Core
                </h2>
                <p className="text-xl max-w-[480px] leading-relaxed text-[#626977] mx-auto md:mx-0 font-medium">
                  Every automation is parsed into a strict JSON DAG, actively orchestrated by the FlowPilot engine in real-time. Keep scrolling.
                </p>
                <div className="mt-8 flex items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 rounded-full border border-[#eef1f5] bg-white px-4 py-2 shadow-sm">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-75"></span>
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#10b981]"></span>
                    </span>
                    <span className="text-sm font-bold text-[#050712]">Engine Online</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Feature Panels */}
          {panels.map((p, i) => (
            <div 
              key={i} 
              className="w-[85vw] md:w-[60vw] shrink-0 h-full flex flex-col justify-center px-10 md:px-20 border-l border-[#eef1f5] relative hover:bg-[#1d57f7]/[0.02] transition-colors duration-500 group"
            >
              {/* Subtle glow behind text */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#1d57f7]/[0.015] group-hover:bg-[#1d57f7]/[0.03] blur-[120px] rounded-full pointer-events-none transition-all duration-700" />
              
              <div className="relative z-10 w-full max-w-3xl flex flex-col justify-center text-left">
                <span className="text-sm md:text-base font-bold tracking-widest uppercase text-[#1d57f7] mb-8 block font-mono">
                  {p.tag}
                </span>
                
                <h3 className="font-black text-5xl md:text-7xl lg:text-[110px] leading-[0.9] tracking-tighter uppercase text-[#050712] mb-12 flex flex-col">
                  {p.title.map((word, wordIndex) => (
                    <span key={wordIndex} className="block">{word}</span>
                  ))}
                </h3>
                
                <p className="text-xl md:text-2xl leading-relaxed text-[#626977] max-w-[480px] font-medium">
                  {p.text}
                </p>
              </div>
            </div>
          ))}
          
          {/* Spacer to allow scrolling past the last item cleanly */}
          <div className="w-[15vw] md:w-[40vw] shrink-0 h-full bg-[#fcfcfc]" />

        </div>
      </div>
    </div>
  );
}
