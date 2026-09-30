"use client";

import { ErrorFallback } from "@/components/error-fallback";

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorFallback title="This room failed to sit" detail={error.digest} retry={retry} />;
}
