"use client";

import "@/lib/amplify";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return children;
}
