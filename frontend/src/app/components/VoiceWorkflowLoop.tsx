"use client";

import { useState, useEffect, useRef } from "react";
import {
  AudioLines,
  Mic,
  Workflow,
  CheckCircle2,
  ArrowRight,
  Globe,
  GitBranch,
  MousePointerClick,
  Zap,
} from "lucide-react";

const steps = [
  {
    id: 0,
    label: "Voice Intake",
    title: "Speak your automation, naturally.",
    description:
      "Describe what you want in plain language — 'When I get a WhatsApp message, look up the sender in my CRM and reply with their order status.' FlowPilot's voice pipeline captures your intent in real-time, no drag-and-drop required.",
  },
  {
    id: 1,
    label: "Graph Drafting",
    title: "AI turns words into a workflow graph.",
    description:
      "Your sentence becomes a complete automation: triggers, actions, conditional edges, labels, and field mappings. FlowPilot drafts the entire node graph — the same structure you'd spend 20 minutes wiring by hand in Zapier or n8n.",
  },
  {
    id: 2,
    label: "Review & Edit",
    title: "You see every node before anything runs.",
    description:
      "The draft lands on a React Flow canvas. Move nodes, rename actions, add missing fields, delete edges. Nothing executes until you say so. This is automation with guardrails, not a black-box AI agent.",
  },
  {
    id: 3,
    label: "Real Execution",
    title: "Saved workflows run through a real job queue.",
    description:
      "When you hit execute, the graph is stored in Postgres and queued via Redis. A background worker walks each node step-by-step, sending real HTTP requests, triggering real webhooks, with full execution logs.",
  },
];

export function VoiceWorkflowLoop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { top, height } = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate scroll progress through the container (0 to 1)
      // The container is 400vh tall. We want to start tracking when it hits the top.
      const scrollableDistance = height - viewportHeight;
      const scrolled = -top;
      
      if (scrolled < 0) {
        setActiveStep(0);
        return;
      }
      
      if (scrolled > scrollableDistance) {
        setActiveStep(steps.length - 1);
        return;
      }
      
      const progress = scrolled / scrollableDistance;
      const stepIndex = Math.min(
        Math.floor(progress * steps.length),
        steps.length - 1
      );
      
      setActiveStep(stepIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative w-full pb-24">
      {/* Scroll container (400vh tall to allow scrolling through 4 steps) */}
      <div ref={containerRef} className="h-[400vh] relative">
        {/* Sticky viewport content */}
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden pt-16">
          <div className="fp-loop-section mx-auto w-full max-w-[1280px] rounded-[32px] border border-[#eef1f5] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] overflow-hidden h-[85vh] min-h-[600px] flex flex-col relative">
            
            {/* Header */}
            <div className="w-full text-center pt-12 pb-6 px-6 z-10">
              <p className="text-sm font-bold uppercase tracking-wider text-[#1d57f7] mb-2">
                Context Assembly
              </p>
              <h2 className="text-4xl md:text-5xl font-black leading-tight text-[#050712]">
                It never starts from a blank slate.
              </h2>
            </div>

            {/* Split Content */}
            <div className="flex-1 grid md:grid-cols-2 relative">
              
              {/* Left: Text Steps */}
              <div className="relative h-full flex flex-col justify-center px-8 md:px-16 border-r border-[#eef1f5]">
                {steps.map((step, i) => {
                  const isActive = activeStep === i;
                  return (
                    <div
                      key={step.id}
                      className={`absolute left-8 right-8 md:left-16 md:right-16 transition-all duration-700 ease-in-out ${
                        isActive
                          ? "opacity-100 translate-y-0"
                          : i < activeStep
                          ? "opacity-0 -translate-y-12 pointer-events-none"
                          : "opacity-0 translate-y-12 pointer-events-none"
                      }`}
                    >
                      <div className="relative pl-8">
                        {/* Glow Line */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1d57f7] rounded-full origin-top transition-transform duration-700 scale-y-100" />
                        
                        <span className="block text-6xl md:text-7xl font-black text-[#eef1f5] tracking-tighter leading-none mb-4">
                          0{step.id + 1}
                        </span>
                        
                        <h3 className="text-2xl md:text-3xl font-black text-[#050712] mb-3">
                          {step.title}
                        </h3>
                        <p className="text-base leading-relaxed text-[#626977]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Visuals */}
              <div className="relative h-full overflow-hidden bg-[#f8fafc]">
                
                {/* Step 0: Voice Intake */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ease-in-out ${
                    activeStep === 0
                      ? "opacity-100 translate-y-0"
                      : activeStep > 0
                      ? "opacity-0 -translate-y-24"
                      : "opacity-0 translate-y-24"
                  }`}
                >
                  <div className="relative">
                    <div className="fp-voice-ring absolute -inset-6 rounded-full border-2 border-[#1d57f7]/30" />
                    <div className="fp-voice-ring-2 absolute -inset-12 rounded-full border border-[#1d57f7]/15" />
                    <div className="grid size-20 place-items-center rounded-full bg-[#1d57f7] shadow-[0_0_60px_rgba(29,87,247,0.4)] relative z-10">
                      <Mic className="size-8 text-white" />
                    </div>
                  </div>
                  <div className="mt-16 w-full max-w-[400px]">
                    <div className="fp-transcript rounded-2xl border border-[#eef1f5] bg-white px-6 py-5 shadow-lg">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#1d57f7]">
                        <AudioLines className="size-3.5" />
                        Listening…
                      </div>
                      <p className="mt-3 text-[15px] font-medium leading-relaxed text-[#050712]">
                        &quot;When I get a WhatsApp message, look up the sender in
                        my CRM and reply with their order status.&quot;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 1: Graph Drafting */}
                <div
                  className={`absolute inset-0 flex items-center justify-center p-8 transition-all duration-700 ease-in-out ${
                    activeStep === 1
                      ? "opacity-100 translate-y-0"
                      : activeStep > 1
                      ? "opacity-0 -translate-y-24"
                      : "opacity-0 translate-y-24"
                  }`}
                >
                  <div className="relative w-full max-w-[480px] h-[300px]">
                    {/* Mini graph */}
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 480 300" fill="none">
                      <path d="M120 80 L240 150" stroke="#1d57f7" strokeWidth="2" strokeDasharray="6 4" strokeOpacity="0.4" className={activeStep === 1 ? "fp-edge-draw" : ""} />
                      <path d="M240 150 L360 80" stroke="#1d57f7" strokeWidth="2" strokeDasharray="6 4" strokeOpacity="0.4" className={activeStep === 1 ? "fp-edge-draw" : ""} style={{ animationDelay: "0.3s" }} />
                      <path d="M240 150 L240 230" stroke="#1d57f7" strokeWidth="2" strokeDasharray="6 4" strokeOpacity="0.4" className={activeStep === 1 ? "fp-edge-draw" : ""} style={{ animationDelay: "0.6s" }} />
                    </svg>

                    {/* Nodes */}
                    <div className={`absolute left-[60px] top-[40px] flex items-center gap-3 rounded-xl border border-[#eef1f5] bg-white px-4 py-3 shadow-md ${activeStep === 1 ? "fp-node-pop" : "opacity-0"}`}>
                      <span className="grid size-8 place-items-center rounded-lg bg-[#edf4ff] text-[#1d57f7]">
                        <MousePointerClick className="size-4" />
                      </span>
                      <span className="text-xs font-bold text-[#050712]">WhatsApp trigger</span>
                    </div>

                    <div className={`absolute left-[170px] top-[120px] flex items-center gap-3 rounded-xl border border-[#1d57f7] bg-[#1d57f7] px-4 py-3 shadow-lg ${activeStep === 1 ? "fp-node-pop" : "opacity-0"}`} style={{ animationDelay: "0.4s" }}>
                      <span className="grid size-8 place-items-center rounded-lg bg-white/20 text-white">
                        <Globe className="size-4" />
                      </span>
                      <span className="text-xs font-bold text-white">CRM lookup</span>
                    </div>

                    <div className={`absolute right-[40px] top-[40px] flex items-center gap-3 rounded-xl border border-[#eef1f5] bg-white px-4 py-3 shadow-md ${activeStep === 1 ? "fp-node-pop" : "opacity-0"}`} style={{ animationDelay: "0.7s" }}>
                      <span className="grid size-8 place-items-center rounded-lg bg-[#edf4ff] text-[#1d57f7]">
                        <GitBranch className="size-4" />
                      </span>
                      <span className="text-xs font-bold text-[#050712]">Conditional</span>
                    </div>

                    <div className={`absolute left-[170px] top-[200px] flex items-center gap-3 rounded-xl border border-[#eef1f5] bg-white px-4 py-3 shadow-md ${activeStep === 1 ? "fp-node-pop" : "opacity-0"}`} style={{ animationDelay: "1s" }}>
                      <span className="grid size-8 place-items-center rounded-lg bg-[#edf4ff] text-[#1d57f7]">
                        <ArrowRight className="size-4" />
                      </span>
                      <span className="text-xs font-bold text-[#050712]">Send reply</span>
                    </div>
                  </div>
                </div>

                {/* Step 2: Review Canvas */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 transition-all duration-700 ease-in-out ${
                    activeStep === 2
                      ? "opacity-100 translate-y-0"
                      : activeStep > 2
                      ? "opacity-0 -translate-y-24"
                      : "opacity-0 translate-y-24"
                  }`}
                >
                  <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-[#eef1f5] bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-[#eef1f5] bg-[#f8fafc] px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Workflow className="size-4 text-[#1d57f7]" />
                        <span className="text-xs font-bold text-[#050712]">Canvas Editor</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-[#10b981]" />
                        <span className="text-xs font-medium text-[#10b981]">3 nodes ready</span>
                      </div>
                    </div>
                    <div className="space-y-3 p-5">
                      {[
                        { name: "WhatsApp trigger", type: "Trigger", color: "text-[#f59e0b]" },
                        { name: "CRM lookup", type: "HTTP Request", color: "text-[#1d57f7]" },
                        { name: "Send reply", type: "Action", color: "text-[#10b981]" },
                      ].map((node, i) => (
                        <div
                          key={node.name}
                          className={`flex items-center justify-between rounded-xl border border-[#eef1f5] bg-white px-4 py-3 shadow-sm ${activeStep === 2 ? "fp-node-slide" : "opacity-0"}`}
                          style={{ animationDelay: `${i * 0.2}s` }}
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className={`size-4 ${node.color}`} />
                            <span className="text-sm font-semibold text-[#050712]">{node.name}</span>
                          </div>
                          <span className="rounded-full bg-[#f8fafc] px-2.5 py-1 text-[10px] font-bold text-[#626977]">
                            {node.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 3: Execution */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 transition-all duration-700 ease-in-out ${
                    activeStep === 3
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-24"
                  }`}
                >
                  <div className="w-full max-w-[400px] space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="size-5 text-[#f59e0b]" />
                        <span className="text-base font-black text-[#050712]">Execution #1284</span>
                      </div>
                      <span className="rounded-full bg-[#10b981]/15 px-3 py-1 text-xs font-bold text-[#10b981]">
                        Completed
                      </span>
                    </div>

                    {[
                      { name: "WhatsApp trigger fired", time: "0ms" },
                      { name: "CRM lookup → 200 OK", time: "340ms" },
                      { name: "Reply sent → delivered", time: "520ms" },
                    ].map((exec, i) => (
                      <div
                        key={exec.name}
                        className={`flex items-center gap-4 rounded-xl border border-[#eef1f5] bg-white px-4 py-4 shadow-sm ${activeStep === 3 ? "fp-exec-step" : "opacity-0"}`}
                        style={{ animationDelay: `${i * 0.3}s` }}
                      >
                        <CheckCircle2 className="size-5 shrink-0 text-[#10b981]" />
                        <div className="flex-1">
                          <span className="text-sm font-bold text-[#050712]">{exec.name}</span>
                        </div>
                        <span className="text-xs font-mono font-medium text-[#626977]">{exec.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
