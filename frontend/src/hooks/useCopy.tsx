"use client";

import { toast } from "sonner";

export default function useCopy(textToCopy: string) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("copied");
    } catch {
      toast.error("Failed to copy");
    }
  };
  return handleCopy;
}
