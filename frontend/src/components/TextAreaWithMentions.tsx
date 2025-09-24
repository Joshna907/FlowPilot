"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
import { useWorkflow } from "@/stores";

type Props = {
  onResolvedChange?: (valueWithIds: string) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
} & React.ComponentProps<"textarea">;

export function TextAreaWithMention({
  onResolvedChange,
  placeholder,
  defaultValue = "",
  className,
  ...props
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const nodes = useWorkflow((s) => s.nodes);
  const edges = useWorkflow((s) => s.edges);
  const selectedNodeId = useWorkflow((s) => s.selectedNodeId);
  const options = useMemo(() => {
    let eligibleNodes = nodes;
    if (selectedNodeId) {
      const ancestorIds = new Set<string>();
      const visited = new Set<string>();
      const stack: string[] = [];

      for (const e of edges) {
        if (e.target === selectedNodeId) {
          stack.push(e.source);
        }
      }

      while (stack.length > 0) {
        const currentId = stack.pop()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);
        ancestorIds.add(currentId);
        for (const e of edges) {
          if (e.target === currentId) {
            if (!visited.has(e.source)) stack.push(e.source);
          }
        }
      }

      eligibleNodes = nodes.filter((n) => ancestorIds.has(n.id));
    }

    return eligibleNodes
      .map((n) => ({ id: n.id, label: n.data?.label as string | undefined }))
      .filter((o) => Boolean(o.label)) as { id: string; label: string }[];
  }, [nodes, edges, selectedNodeId]);

  const [value, setValue] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [query, setQuery] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 5);
    return options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 8);
  }, [options, query]);

  const resolvedValue = useMemo(
    () => resolveMentionsToIds(value, options),
    [value, options],
  );

  useEffect(() => {
    onResolvedChange?.(resolvedValue);
  }, [resolvedValue, onResolvedChange]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    const caret = e.target.selectionStart ?? next.length;
    setValue(next);

    const lastAt = next.lastIndexOf("@", caret - 1);
    if (lastAt === -1) {
      closeMentions();
      return;
    }
    // Ensure trigger starts at beginning or after whitespace/newline
    const before = next[lastAt - 1];
    const isValidBoundary =
      lastAt === 0 || before === " " || before === "\n" || before === "\t";
    if (!isValidBoundary) {
      closeMentions();
      return;
    }

    // Extract current query
    const slice = next.slice(lastAt + 1, caret);
    // Stop mentioning when a space/newline is typed after '@'
    if (/[\s]/.test(slice)) {
      closeMentions();
      return;
    }
    setMentionStart(lastAt);
    setQuery(slice);
    setIsOpen(true);
  }

  function insertLabel(option: { id: string; label: string }) {
    if (mentionStart === null) return;
    const el = textareaRef.current;
    const caret = el?.selectionStart ?? value.length;
    const before = value.slice(0, mentionStart);
    const after = value.slice(caret);
    const insertText = `@${option.label}`;
    const nextValue = `${before}${insertText}${after}`;
    setValue(nextValue);
    closeMentions();
    // restore caret right after the inserted label
    requestAnimationFrame(() => {
      if (el) {
        const pos = before.length + insertText.length;
        el.selectionStart = pos;
        el.selectionEnd = pos;
        el.focus();
      }
    });
  }

  function closeMentions() {
    setIsOpen(false);
    setMentionStart(null);
    setQuery("");
  }

  return (
    <div>
      <Textarea
        className={className}
        ref={textareaRef}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={() => {
          setTimeout(() => closeMentions(), 150);
        }}
        {...props}
      />

      {isOpen && filtered.length > 0 ? (
        <div
          style={{ border: "1px solid #e5e7eb", borderRadius: 6, marginTop: 6 }}
        >
          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "6px 8px",
                background: "white",
                cursor: "pointer",
              }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertLabel(o)}
            >
              @{o.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function resolveMentionsToIds(
  input: string,
  options: { id: string; label: string }[],
): string {
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let out = input;
  for (const opt of options) {
    const re = new RegExp(`@${escapeRegExp(opt.label)}\\b`, "g");
    out = out.replace(re, `@${opt.id}`);
  }
  return out;
}
