"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { Spinner } from "@/components/ui/spinner";

const ChatThread = dynamic(
  () => import("@/components/chat-thread").then((module) => module.ChatThread),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    ),
  },
);

export function ChatThreadLoader(props: ComponentProps<typeof ChatThread>) {
  return <ChatThread {...props} />;
}
