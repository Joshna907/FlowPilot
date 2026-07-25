"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/utils";
import { useWorkflow } from "@/stores/useWorkflowStore";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  AudioLines,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ReactNode } from "react";
import { toast } from "sonner";
import {
  convertPlannedEdge,
  convertPlannedNode,
  getNodeDisplayName,
  getVoicePlanErrorMessage,
  VoicePlan,
} from "./voicePlan";

type SpeechRecognitionResult = {
  transcript: string;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<SpeechRecognitionResult>>;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const examplePrompts = [
  "When I run this manually, send a follow-up email to the customer.",
  "Start from a webhook, call my API, then add another step.",
  "Send an email and wait for a reply before continuing.",
];

function getSpeechRecognition() {
  const windowWithSpeech = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return (
    windowWithSpeech.SpeechRecognition ??
    windowWithSpeech.webkitSpeechRecognition
  );
}

export function VoiceBuilder({
  initialOpen = false,
  trigger,
}: {
  initialOpen?: boolean;
  trigger?: ReactNode;
}) {
  const workflowId = useWorkflow((state) => state.workflow.id);
  const setNodes = useWorkflow((state) => state.setNodes);
  const setEdges = useWorkflow((state) => state.setEdges);
  const [open, setOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [draft, setDraft] = useState<VoicePlan | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const SpeechRecognition = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return getSpeechRecognition();
  }, []);

  const voicePlan = useMutation({
    mutationFn: async (input: { transcript: string }) => {
      const { data } = await api.post("/voice/plan", {
        transcript: input.transcript,
        workflowId,
      });
      return data as { success: boolean; data?: VoicePlan; error?: string };
    },
    onSuccess: (result) => {
      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to draft workflow");
        return;
      }
      setDraft(result.data);
      toast.success("Draft ready to review");
    },
    onError: (error) => {
      toast.error(getVoicePlanErrorMessage(error));
    },
  });

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (initialOpen) {
      setOpen(true);
    }
  }, [initialOpen]);

  function handleListen() {
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ");
      setTranscript(text);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setDraft(null);
    setIsListening(true);
    recognition.start();
  }

  function handleCreateDraft() {
    const trimmedTranscript = transcript.trim();
    if (!trimmedTranscript) {
      toast.error("Add a voice command first");
      return;
    }
    setDraft(null);
    voicePlan.mutate({ transcript: trimmedTranscript });
  }

  function handleApplyDraft() {
    if (!draft) return;
    setNodes(draft.nodes.map(convertPlannedNode));
    setEdges(draft.edges.map(convertPlannedEdge));
    toast.success("Voice draft applied to canvas");
    setOpen(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="voice-primary-button">
            <Sparkles />
            Voice Builder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[780px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AudioLines className="size-5 text-[var(--flow-primary)]" />
            Build from voice
          </DialogTitle>
          <DialogDescription>
            Speak or type the workflow, generate a draft, then apply it after
            review.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--flow-border)] bg-[var(--flow-bg)] p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">1. Capture request</div>
                {!SpeechRecognition && (
                  <span className="text-xs text-[var(--flow-muted)]">
                    Type instead
                  </span>
                )}
              </div>
              <div className="mb-3 flex gap-2">
                <Button
                  onClick={handleListen}
                  type="button"
                  variant={isListening ? "destructive" : "secondary"}
                >
                  {isListening ? <MicOff /> : <Mic />}
                  {isListening ? "Stop" : "Listen"}
                </Button>
                <Button
                  onClick={handleCreateDraft}
                  disabled={voicePlan.isPending}
                  type="button"
                  variant="outline"
                >
                  {voicePlan.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Sparkles />
                  )}
                  Generate draft
                </Button>
              </div>
              <Textarea
                value={transcript}
                onChange={(event) => {
                  setDraft(null);
                  setTranscript(event.target.value);
                }}
                placeholder="When I run this manually, send an email, then call my API."
                className="min-h-36 resize-none bg-white"
              />
            </div>

            <div className="rounded-lg border border-[var(--flow-border)] bg-white p-3">
              <div className="mb-2 text-sm font-semibold">Try saying</div>
              <div className="space-y-2">
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setDraft(null);
                      setTranscript(prompt);
                    }}
                    className="w-full rounded-md border border-[var(--flow-border)] px-3 py-2 text-left text-sm transition hover:border-[var(--flow-primary)] hover:bg-[var(--flow-bg)]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--flow-border)] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">2. Review draft</div>
                <p className="text-xs text-[var(--flow-muted)]">
                  Nothing changes until you apply it.
                </p>
              </div>
              {draft && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(20,125,100,0.12)] px-2 py-1 text-xs font-medium text-[var(--flow-primary)]">
                  <CheckCircle2 className="size-3" />
                  Ready
                </span>
              )}
            </div>

            {voicePlan.isPending ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-lg bg-[var(--flow-bg)] text-center">
                <Loader2 className="mb-3 size-8 animate-spin text-[var(--flow-primary)]" />
                <div className="font-medium">Generating workflow draft</div>
                <p className="mt-1 max-w-xs text-sm text-[var(--flow-muted)]">
                  Groq is turning your request into nodes and edges.
                </p>
              </div>
            ) : draft ? (
              <div className="space-y-3">
                <p className="rounded-md bg-[var(--flow-bg)] p-3 text-sm leading-6 text-[var(--flow-muted)]">
                  {draft.explanation}
                </p>
                <div className="space-y-2">
                  {draft.nodes.map((node, index) => (
                    <div
                      key={node.id}
                      className="flex items-center gap-3 rounded-lg border border-[var(--flow-border)] p-3"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--flow-canvas)] text-xs font-semibold text-[var(--flow-primary)]">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {getNodeDisplayName(node.nodeType)}
                        </div>
                        <div className="text-xs text-[var(--flow-muted)]">
                          {node.missingFields?.length
                            ? `Missing: ${node.missingFields.join(", ")}`
                            : "Ready to configure"}
                        </div>
                      </div>
                      {node.needsConfig && (
                        <AlertTriangle className="size-4 text-[#9A5B00]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--flow-border)] bg-[var(--flow-bg)] text-center">
                <Sparkles className="mb-3 size-8 text-[var(--flow-primary)]" />
                <div className="font-medium">Draft preview appears here</div>
                <p className="mt-1 max-w-xs text-sm text-[var(--flow-muted)]">
                  Generate first, review the planned steps, then apply to the
                  canvas.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleApplyDraft}
            disabled={!draft || voicePlan.isPending}
            type="button"
          >
            Apply to canvas
            <ArrowRight />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
