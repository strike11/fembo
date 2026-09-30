import { cn } from "@/lib/utils";

export function Logo({
  variant = "black",
  className,
}: {
  variant?: "black" | "white";
  className?: string;
}) {
  const src =
    variant === "white" ? "/images/logo-white.png" : "/images/logo-black.png";

  return (
    // Public PNGs — SVG imports were not resolving to a usable URL
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Fembo"
      width={1000}
      height={312}
      className={cn("h-11 w-auto object-contain object-left", className)}
    />
  );
}
