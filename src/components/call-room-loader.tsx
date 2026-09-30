"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { Spinner } from "@/components/ui/spinner";

const CallRoom = dynamic(() => import("@/components/call-room").then((module) => module.CallRoom), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center">
      <Spinner />
    </div>
  ),
});

export function CallRoomLoader(props: ComponentProps<typeof CallRoom>) {
  return <CallRoom {...props} />;
}
