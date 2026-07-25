"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "How is this different from Zapier?",
      a: "Zapier requires you to manually drag, drop, and configure every step of an automation. FlowPilot lets you simply speak your intent. The AI builds the entire graph instantly, which you can then visually edit if needed."
    },
    {
      q: "What integrations do you support?",
      a: "FlowPilot is built around universal HTTP Webhooks and REST API nodes. Instead of waiting for us to build a specific integration, you can connect to any tool on the internet that has an API, right out of the box."
    },
    {
      q: "Can I edit the workflows after generating them?",
      a: "Yes. Your voice request generates a strict JSON DAG that is rendered as a visual node graph. You can click any node to tweak its configuration, change API keys, or map dynamic variables."
    },
    {
      q: "Is the execution reliable?",
      a: "Absolutely. Unlike browser-based UI prototypes, FlowPilot saves your exact graph to a durable Postgres database before dispatching the job to a robust Redis queue. Background Node.js workers process the execution."
    },
    {
      q: "Do I need to know how to code?",
      a: "No. The Voice Builder understands plain English and handles the complex logic routing, variable mapping, and API payload generation for you."
    },
    {
      q: "Can I self-host FlowPilot?",
      a: "Yes! The entire architecture (Next.js, Express, Postgres, Redis) is designed to be easily deployed to your own infrastructure for complete data privacy."
    }
  ];

  return (
    <section className="bg-[#fafaf8] py-24 md:py-32">
      <div className="mx-auto max-w-[1000px] px-6">
        
        <div className="mb-16 text-center flex flex-col items-center w-full">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#050712] mb-4">
            Frequently asked
            <br />
            questions
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed text-[#626977]">
            Everything you need to know about the FlowPilot engine and architecture.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((item, i) => (
            <div 
              key={i}
              className="group transition-all duration-300 rounded-[2rem] overflow-hidden cursor-pointer bg-[#fdfdfc] border border-[#eef1f5] hover:border-[#d1d9e6] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <div className="relative z-10 p-6 md:p-8 flex items-start gap-5">
                <div className="shrink-0 mt-0.5">
                  <div 
                    className="flex items-center justify-center transition-transform duration-300"
                    style={{ transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    <Plus className="size-5 text-[#1d57f7] stroke-[3]" />
                  </div>
                </div>
                <div className="w-full">
                  <span className="text-[17px] block tracking-tight text-[#050712] font-bold">
                    {item.q}
                  </span>
                  <div
                    className="transition-all duration-300 ease-in-out overflow-hidden"
                    style={{
                      maxHeight: openIndex === i ? "300px" : "0px",
                      opacity: openIndex === i ? 1 : 0,
                      marginTop: openIndex === i ? "12px" : "0px"
                    }}
                  >
                    <p className="leading-relaxed text-[15px] text-[#626977] pr-2">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
