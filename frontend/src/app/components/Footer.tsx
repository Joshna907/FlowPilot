"use client";

import { AudioLines, ArrowRight } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 w-full overflow-hidden mt-0 pb-0 bg-white border-t border-[#eef1f5]">
      
      {/* Sky Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.15]"
      >
        <source src="/skyvideo.mp4" type="video/mp4" />
      </video>
      
      {/* Decorative background blend */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#fcfcfc] via-transparent to-[#f4f7fb]/80" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom,rgba(29,87,247,0.08)_0%,transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 pt-24 pb-12 md:pt-32 md:pb-16">
        
        {/* 4 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-24 md:mb-32">
          
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col items-start">
            <div 
              className="group flex items-center gap-2 mb-8 cursor-pointer" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <span className="grid size-8 place-items-center rounded bg-[#1d57f7] text-white transition-transform group-hover:scale-105">
                <AudioLines className="size-4" />
              </span>
              <span className="text-[20px] font-black tracking-tight text-[#050712]">FlowPilot</span>
            </div>
            
            <h3 className="text-[2rem] font-black tracking-tight text-[#050712] mb-6 leading-[1.1]">
              Speak your automations.<br />Don&apos;t build them.
            </h3>
            
            <p className="text-[15px] text-[#626977] mb-8 leading-relaxed max-w-[280px] font-medium">
              FlowPilot turns your voice notes into durably queued DAG workflows, saving you from drag-and-drop fatigue.
            </p>
            
            <Link 
              href="/workflow"
              className="bg-[#050712] text-white hover:bg-[#1d57f7] px-6 py-3 rounded-full text-sm font-bold transition-all group flex items-center gap-2 shadow-[0_8px_20px_rgba(5,7,18,0.12)] hover:shadow-[0_8px_25px_rgba(29,87,247,0.25)] hover:-translate-y-0.5"
            >
              Launch Voice Builder
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <div className="mt-16 text-[13px] text-[#828a99] space-y-3 font-medium">
              <p>© 2026 FlowPilot - All rights reserved</p>
              <div className="flex items-center gap-2">
                Built for real operations.
              </div>
            </div>
          </div>
          
          {/* Menu Column */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-[#050712] font-black mb-6 text-[15px] tracking-tight uppercase">Product</h4>
            <ul className="space-y-4 text-[#626977] text-[14px] font-medium">
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Voice Builder</a></li>
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Visual Editor</a></li>
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Execution Engine</a></li>
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Database</a></li>
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Pricing</a></li>
            </ul>
          </div>
          
          {/* Navigation Column */}
          <div className="md:col-span-2">
            <h4 className="text-[#050712] font-black mb-6 text-[15px] tracking-tight uppercase">Resources</h4>
            <ul className="space-y-4 text-[#626977] text-[14px] font-medium">
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Contact</a></li>
            </ul>
          </div>
          
          {/* Legal Column */}
          <div className="md:col-span-3">
            <h4 className="text-[#050712] font-black mb-6 text-[15px] tracking-tight uppercase">Legal</h4>
            <ul className="space-y-4 text-[#626977] text-[14px] font-medium">
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Privacy policy</a></li>
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Terms of service</a></li>
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Data Processing</a></li>
              <li><a href="#" className="hover:text-[#1d57f7] transition-colors">Open Source</a></li>
            </ul>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
