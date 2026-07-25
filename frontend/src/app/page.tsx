import Link from "next/link";
import { VoiceWorkflowLoop } from "./components/VoiceWorkflowLoop";
import { HorizontalCoreSection } from "./components/HorizontalCoreSection";
import { FAQSection } from "./components/FAQSection";
import { Footer } from "./components/Footer";
import {
  ArrowRight,
  AudioLines,
  GitBranch,
  Globe,
  Moon,
  MousePointerClick,
  type LucideIcon,
} from "lucide-react";

const navItems = ["Home", "Voice", "Builder", "Architecture", "Demo"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafaf8] p-3 text-[#070817] sm:p-4 relative">
      {/* Sticky glassmorphic navbar */}
      <div className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-4">
        <nav className="flex h-14 items-center justify-between gap-12 rounded-full border border-[#e9edf3] bg-white/70 px-2 pr-2 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] w-full max-w-[1000px]">
          <Link href="/" className="flex items-center gap-2 pl-3">
            <span className="grid size-8 place-items-center rounded bg-[#070817] text-white">
              <AudioLines className="size-4" />
            </span>
            <span className="text-[17px] font-black tracking-tight text-[#050712]">FlowPilot</span>
          </Link>

          <div className="hidden items-center gap-8 text-[13px] font-medium text-[#626977] md:flex">
            {navItems.map((item) => (
              <a
                key={item}
                href={item === "Home" ? "/" : `#${item.toLowerCase()}`}
                className="transition hover:text-[#070817]"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="grid size-9 place-items-center rounded-full border border-[#e9edf3] bg-[#f8fafc] text-[#626977] transition hover:bg-[#eef1f5] hover:text-[#070817]">
              <Moon className="size-4" />
            </button>
            <Link href="/signin" className="hidden text-[13px] font-medium text-[#626977] transition hover:text-[#070817] sm:block">
              Sign in
            </Link>
            <Link
              href="/workflow"
              className="rounded-full bg-[#1d57f7] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#070817] hover:shadow-[0_8px_20px_rgba(29,87,247,0.25)]"
            >
              Open app
            </Link>
          </div>
        </nav>
      </div>

      <section className="flow-vox-section-bg mx-auto w-full overflow-hidden rounded-[28px] border border-[#eef1f5] shadow-[0_24px_70px_rgba(15,23,42,0.08)] relative z-10 mt-16">

        {/* Ambient heading section */}
        <div className="relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 z-0">
            <div className="flow-vox-shimmer" />
            <div className="flow-vox-heading-glow" />
            <div className="flow-vox-orb flow-vox-orb-1" />
            <div className="flow-vox-orb flow-vox-orb-2" />
            <div className="flow-vox-orb flow-vox-orb-3" />
            <div className="flow-vox-orb flow-vox-orb-4" />
            <div className="flow-vox-orb flow-vox-orb-5" />
            <div className="flow-vox-orb flow-vox-orb-6" />
            <div className="flow-vox-orb flow-vox-orb-7" />
            <div className="flow-vox-orb flow-vox-orb-8" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1180px] px-5 pb-8 pt-16 text-center sm:px-8 lg:pt-24">

            <h1 className="mx-auto max-w-[760px] text-[42px] font-black leading-[1.04] text-[#050712] sm:text-[56px] lg:text-[68px]">
              AI workflows that start with your voice
            </h1>

            <p className="mx-auto mt-5 max-w-[640px] text-base leading-7 text-[#626977] sm:text-lg">
              Speak the automation you want. FlowPilot drafts the graph, shows
              what needs configuration, then runs the saved workflow for real.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/workflow"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#1d57f7] px-5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(29,87,247,0.26)] transition hover:-translate-y-0.5 hover:bg-[#070817]"
              >
                Start with voice
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#architecture"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[#eef1f5] bg-white/60 backdrop-blur-sm px-5 text-sm font-bold text-[#070817] transition hover:-translate-y-0.5 hover:bg-white"
              >
                See how it works
              </a>
            </div>
          </div>
        </div>

        <HeroVisual />


      </section>

      <VoiceWorkflowLoop />

      <HorizontalCoreSection />

      <FAQSection />
      <Footer />
    </main>
  );
}
function HeroVisual() {
  return (
    <div className="mx-auto w-full px-5 pb-8 sm:px-8">
      <div className="flow-vox-hero relative min-h-[420px] overflow-hidden rounded-[24px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:min-h-[520px]">
        {/* Grid overlay */}
        <div className="absolute inset-0 flow-vox-grid" />

        {/* Animated cloud blobs */}
        <div className="flow-vox-cloud flow-vox-cloud-1" />
        <div className="flow-vox-cloud flow-vox-cloud-2" />
        <div className="flow-vox-cloud flow-vox-cloud-3" />
        <div className="flow-vox-cloud flow-vox-cloud-4" />

        {/* Grain texture */}
        <div className="flow-vox-grain" />

        {/* Bottom fog fade */}
        <div className="absolute inset-x-0 bottom-0 z-[4] h-32 bg-gradient-to-t from-[#2b7fff]/60 via-[#5fa7ff]/30 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[420px] max-w-[1040px] items-center justify-center px-5 py-10 sm:min-h-[520px]">
          {/* Animated connecting lines */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 980 430"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M88 342 C218 92 768 92 892 342"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="1.5"
              className="flow-vox-line-animated"
            />
            <path
              d="M238 354 C342 204 644 204 748 354"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="1.5"
              className="flow-vox-line-animated"
              style={{ animationDelay: "0.6s" }}
            />
          </svg>

          {/* Floating workflow cards */}
          <WorkflowNode
            className="left-[5%] top-[18%]"
            floatClass="flow-vox-enter-1"
            icon={MousePointerClick}
            title="Manual trigger"
            subtitle="Start run"
          />
          <WorkflowNode
            className="left-1/2 top-[45%] -translate-x-1/2"
            floatClass="flow-vox-enter-2"
            icon={Globe}
            title="HTTP request"
            subtitle="POST webhook"
            active
          />
          <WorkflowNode
            className="right-[5%] top-[18%]"
            floatClass="flow-vox-enter-3"
            icon={GitBranch}
            title="Webhook.site"
            subtitle="200 OK"
          />

          {/* Voice builder bar */}
          <div className="flow-vox-builder-bar absolute bottom-8 left-1/2 z-[5] w-[min(720px,calc(100%-40px))] -translate-x-1/2 rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white/72">
                Voice Builder
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#1d57f7]">
                Ready
              </span>
            </div>
            <p className="text-sm font-medium text-white">
              &quot;When I get a WhatsApp message, reply okay.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowNode({
  className,
  floatClass,
  icon: Icon,
  title,
  subtitle,
  active,
}: {
  className: string;
  floatClass?: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  active?: boolean;
}) {
  return (
    <div
      className={`absolute w-[190px] rounded-2xl p-4 text-left text-[#070817] flow-vox-float-card ${floatClass || ""} ${className}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid size-10 place-items-center rounded-xl ${
            active ? "bg-[#1d57f7] text-white" : "bg-[#edf4ff] text-[#1d57f7]"
          }`}
        >
          <Icon className="size-5" />
        </span>
        <div>
          <div className="text-sm font-black">{title}</div>
          <div className="mt-1 text-xs font-semibold text-[#626977]">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}
