"use client";

import { ErrorFallback } from "@/components/error-fallback";

export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorFallback title="Something went quiet" detail={error.digest} retry={retry} />;
}
