"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { ReactFlowProvider } from "@xyflow/react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <ReactFlowProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ReactFlowProvider>
      <Toaster />
    </ThemeProvider>
  );
}
