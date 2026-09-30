import type { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {eyebrow ? (
        <p className="text-sm font-medium tracking-wide text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">{title}</h1>
      {children ? <div className="max-w-2xl text-muted-foreground">{children}</div> : null}
    </div>
  );
}
