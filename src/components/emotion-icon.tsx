import type { ReactNode } from "react";
import type { EmotionId } from "@/lib/emotions";

function Face({
  children,
  blush,
}: {
  children: ReactNode;
  blush?: "soft" | "hot";
}) {
  return (
    <svg viewBox="0 0 32 32" className="size-4" aria-hidden>
      <rect x="2.4" y="2.4" width="27.2" height="27.2" rx="9" fill="currentColor" opacity="0.1" />
      <rect
        x="2.4"
        y="2.4"
        width="27.2"
        height="27.2"
        rx="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      {blush === "soft" ? (
        <>
          <ellipse cx="9.4" cy="19.4" rx="2.4" ry="1.25" fill="currentColor" opacity="0.28" />
          <ellipse cx="22.6" cy="19.4" rx="2.4" ry="1.25" fill="currentColor" opacity="0.28" />
        </>
      ) : null}
      {blush === "hot" ? (
        <>
          <ellipse cx="9.2" cy="19.6" rx="2.8" ry="1.45" fill="currentColor" opacity="0.4" />
          <ellipse cx="22.8" cy="19.6" rx="2.8" ry="1.45" fill="currentColor" opacity="0.4" />
        </>
      ) : null}
      {children}
    </svg>
  );
}

function Eye({ x, y, r = 1.35 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill="currentColor" />;
}

function HappyMouth({ wide = false }: { wide?: boolean }) {
  return (
    <path
      d={wide ? "M11 20.2c2.4 3 7.6 3 10 0" : "M12.2 20.4c1.8 2.2 5.8 2.2 7.6 0"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
    />
  );
}

function Icons({ id }: { id: EmotionId }) {
  switch (id) {
    case "smile":
      return (
        <Face blush="soft">
          <Eye x={11.2} y={14} />
          <Eye x={20.8} y={14} />
          <HappyMouth />
        </Face>
      );
    case "grin":
      return (
        <Face blush="soft">
          <Eye x={11} y={13.8} />
          <Eye x={21} y={13.8} />
          <path d="M10.5 19.4h11v3.1c0 1.6-2.4 2.5-5.5 2.5s-5.5-.9-5.5-2.5z" fill="currentColor" opacity="0.16" />
          <HappyMouth wide />
        </Face>
      );
    case "laugh":
      return (
        <Face>
          <path d="M8.8 14.2c1.5-1.6 3.6-1.6 5.1 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M18.1 14.2c1.5-1.6 3.6-1.6 5.1 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="16" cy="21" rx="4.4" ry="3.2" fill="currentColor" opacity="0.18" />
          <path d="M12 19.6c2.4 4 5.6 4 8 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </Face>
      );
    case "giggle":
      return (
        <Face blush="soft">
          <path d="M9.4 14.4c1.2-1.4 3.1-1.4 4.3 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M18.3 14.4c1.2-1.4 3.1-1.4 4.3 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <HappyMouth />
          <circle cx="25.2" cy="9.2" r="1" fill="currentColor" opacity="0.45" />
          <circle cx="22.8" cy="7.4" r="0.7" fill="currentColor" opacity="0.35" />
        </Face>
      );
    case "blushy":
      return (
        <Face blush="hot">
          <Eye x={11.2} y={14.2} />
          <Eye x={20.8} y={14.2} />
          <path d="M13.4 20.6c1.6 1.5 3.6 1.5 5.2 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8.4 18.4h3.2M20.4 18.4h3.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
        </Face>
      );
    case "shy":
      return (
        <Face blush="hot">
          <Eye x={11.4} y={14.6} r={1.15} />
          <Eye x={20.2} y={14.6} r={1.15} />
          <path d="M14 21h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M7.6 11.2 5.8 8.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </Face>
      );
    case "bashful":
      return (
        <Face blush="soft">
          <path d="M9.6 14.8h3.4M19 14.8h3.4" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
          <path d="M14.2 21.2c1.2.9 2.4.9 3.6 0" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
        </Face>
      );
    case "flustered":
      return (
        <Face blush="hot">
          <Eye x={11.3} y={13.6} />
          <Eye x={20.7} y={14.6} />
          <path d="M13.6 21.4h4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M24.8 8.2 27 6.4M25.6 10.6h2.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </Face>
      );
    case "wink":
      return (
        <Face blush="soft">
          <Eye x={11.2} y={14} />
          <path d="M18.4 14.4c1.3-1.5 3.3-1.5 4.6 0" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
          <HappyMouth />
        </Face>
      );
    case "smirk":
      return (
        <Face>
          <Eye x={11.2} y={14} />
          <Eye x={20.8} y={14} />
          <path d="M13 20.6c2.2 1.8 6.4.6 7.2-1.1" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
        </Face>
      );
    case "tease":
      return (
        <Face blush="soft">
          <path d="M9.2 14.2c1.3-1.5 3.2-1.5 4.5 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <Eye x={20.8} y={14} />
          <path d="M13.2 20.8c2.6 2.2 6.8 1 7.6-1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="25.6" cy="8.8" r="1.1" fill="currentColor" opacity="0.4" />
        </Face>
      );
    case "playful":
      return (
        <Face>
          <path d="M9.4 15.2 12.6 13.4 9.6 12" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22.6 15.2 19.4 13.4 22.4 12" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
          <HappyMouth />
        </Face>
      );
    case "pout":
      return (
        <Face blush="soft">
          <Eye x={11.3} y={14.4} />
          <Eye x={20.7} y={14.4} />
          <path d="M13.6 22.2c1.6-1.4 3.2-1.4 4.8 0" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
        </Face>
      );
    case "smug":
      return (
        <Face>
          <path d="M9.4 14.6c1.4-1.2 3.2-.6 3.8.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M18.8 14.6c1.4-1.2 3.2-.6 3.8.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M13 20.4c2.6 1.6 6.4.4 7-1.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </Face>
      );
    case "love":
      return (
        <Face blush="soft">
          <path d="M10.2 14.6c0-1.3 1-2.2 2.2-2.2 1 0 1.6.6 2 1.4.4-.8 1-1.4 2-1.4 1.2 0 2.2.9 2.2 2.2 0 2.3-4.2 4.2-4.2 4.2s-4.2-1.9-4.2-4.2z" fill="currentColor" />
          <path d="M12.6 21.2c1.8 1.6 5 1.6 6.8 0" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
        </Face>
      );
    case "heart":
      return (
        <svg viewBox="0 0 32 32" className="size-4" aria-hidden>
          <rect x="2.4" y="2.4" width="27.2" height="27.2" rx="9" fill="currentColor" opacity="0.1" />
          <rect x="2.4" y="2.4" width="27.2" height="27.2" rx="9" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M16 24.2s-8.2-5-8.2-10.2A4.6 4.6 0 0 1 16 11.4a4.6 4.6 0 0 1 8.2 2.6c0 5.2-8.2 10.2-8.2 10.2z"
            fill="currentColor"
            opacity="0.88"
          />
        </svg>
      );
    case "adore":
      return (
        <Face blush="soft">
          <path d="M9.8 14.8c.8-1.6 3.2-1.6 4 0" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
          <path d="M18.2 14.8c.8-1.6 3.2-1.6 4 0" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
          <path d="M13 20.2c2 2.4 4 2.4 6 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="8.2" r="1.05" fill="currentColor" opacity="0.45" />
        </Face>
      );
    case "hug":
      return (
        <svg viewBox="0 0 32 32" className="size-4" aria-hidden>
          <rect x="2.4" y="2.4" width="27.2" height="27.2" rx="9" fill="currentColor" opacity="0.08" />
          <rect x="2.4" y="2.4" width="27.2" height="27.2" rx="9" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12.2" cy="14.4" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.55" />
          <circle cx="19.8" cy="14.4" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.55" />
          <path d="M8.6 22.6c2.2-2.6 12.6-2.6 14.8 0" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
        </svg>
      );
    case "nuzzle":
      return (
        <Face blush="soft">
          <Eye x={11.4} y={14.2} r={1.15} />
          <Eye x={20.6} y={14.2} r={1.15} />
          <ellipse cx="16" cy="18.6" rx="1.15" ry="0.85" fill="currentColor" />
          <path d="M12.6 21.4c2.2 1.6 4.6 1.6 6.8 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </Face>
      );
    case "kissy":
      return (
        <Face blush="soft">
          <Eye x={11.2} y={14} r={1.15} />
          <Eye x={20.8} y={14} r={1.15} />
          <ellipse cx="16" cy="20.6" rx="1.7" ry="1.15" fill="currentColor" />
          <path d="M23.8 9.2c1.2 0 2.2.8 2.2 1.9 0 1.8-2.2 3.2-2.2 3.2s-2.2-1.4-2.2-3.2c0-1.1 1-1.9 2.2-1.9z" fill="currentColor" opacity="0.8" />
        </Face>
      );
    case "sad":
      return (
        <Face>
          <Eye x={11.3} y={14.6} />
          <Eye x={20.7} y={14.6} />
          <path d="M12.6 22.2c1.8-1.6 5-1.6 6.8 0" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
        </Face>
      );
    case "teary":
      return (
        <Face>
          <Eye x={11.2} y={14.2} />
          <Eye x={20.8} y={14.2} />
          <path d="M12.8 22c1.8-1.4 4.6-1.4 6.4 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9.6 18.2c0 2.2-1.4 3.6-1.4 3.6" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
        </Face>
      );
    case "sniffle":
      return (
        <Face>
          <Eye x={11.3} y={14.4} r={1.15} />
          <Eye x={20.7} y={14.4} r={1.15} />
          <path d="M15.2 19.8h1.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M13.4 22h5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </Face>
      );
    case "sorry":
      return (
        <Face blush="soft">
          <path d="M10.2 13.4 12.8 15M12.8 13.4 10.2 15" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
          <path d="M19.2 13.4 21.8 15M21.8 13.4 19.2 15" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
          <path d="M13 21.8c1.8-1.2 4.2-1.2 6 0" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
        </Face>
      );
    case "comfort":
      return (
        <Face blush="soft">
          <path d="M9.6 14.6c1.3-1.5 3.3-1.5 4.6 0" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
          <path d="M17.8 14.6c1.3-1.5 3.3-1.5 4.6 0" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
          <HappyMouth />
        </Face>
      );
    case "sigh":
      return (
        <Face>
          <Eye x={11.4} y={14.6} r={1.15} />
          <Eye x={20.6} y={14.6} r={1.15} />
          <path d="M13.4 20.8h5.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M23.6 10.2c1.6-.6 3 .4 3.4 1.8" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.55" />
        </Face>
      );
    case "calm":
      return (
        <Face>
          <path d="M9.6 14.6h4.2M18.2 14.6h4.2" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
          <path d="M13 20.6c1.8 1.6 4.2 1.6 6 0" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
        </Face>
      );
    case "sleepy":
      return (
        <Face>
          <path d="M9.6 14.8c1.3-1.4 3.2-1.4 4.5 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M17.9 14.8c1.3-1.4 3.2-1.4 4.5 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M13.8 20.8h4.4" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
          <text x="22.4" y="10.6" fontSize="6" fill="currentColor" opacity="0.55">
            z
          </text>
        </Face>
      );
    case "yawn":
      return (
        <Face>
          <path d="M9.8 14.2c1.2-1.3 3-1.3 4.2 0" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
          <path d="M18 14.2c1.2-1.3 3-1.3 4.2 0" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
          <ellipse cx="16" cy="21.2" rx="3.3" ry="3.6" fill="currentColor" opacity="0.16" />
          <ellipse cx="16" cy="21.2" rx="2.1" ry="2.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </Face>
      );
    case "thinking":
      return (
        <Face>
          <Eye x={11.3} y={14} />
          <Eye x={20.7} y={14} />
          <path d="M13.6 21h4.8" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
          <circle cx="24.8" cy="8.6" r="1.15" fill="currentColor" opacity="0.45" />
          <circle cx="27.2" cy="6.4" r="0.75" fill="currentColor" opacity="0.35" />
        </Face>
      );
    case "surprised":
      return (
        <Face>
          <Eye x={11.2} y={13.8} r={1.7} />
          <Eye x={20.8} y={13.8} r={1.7} />
          <ellipse cx="16" cy="21.2" rx="1.8" ry="2.1" fill="none" stroke="currentColor" strokeWidth="1.45" />
        </Face>
      );
    case "gasp":
      return (
        <Face>
          <Eye x={11.2} y={13.6} r={1.55} />
          <Eye x={20.8} y={13.6} r={1.55} />
          <circle cx="16" cy="21.4" r="2.15" fill="currentColor" opacity="0.16" />
          <circle cx="16" cy="21.4" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </Face>
      );
    case "confused":
      return (
        <Face>
          <Eye x={11.4} y={13.6} />
          <Eye x={20.4} y={14.6} />
          <path d="M13.6 21.2h5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
          <path d="M23.8 8.4c1.4-1 3 .2 2.6 1.8" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </Face>
      );
    case "curious":
      return (
        <Face>
          <Eye x={11.2} y={14} r={1.5} />
          <Eye x={20.8} y={14} r={1.5} />
          <path d="M13.4 21c1.6 1.5 3.6 1.5 5.2 0" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
        </Face>
      );
    case "wave":
      return (
        <Face blush="soft">
          <Eye x={11.2} y={14} />
          <Eye x={20.8} y={14} />
          <HappyMouth />
          <path d="M25.2 8.2c1.4-1.8 3.6-.4 3 1.6-.6 1.8-2.4 2-3.2.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </Face>
      );
    case "nod":
      return (
        <Face>
          <Eye x={11.3} y={14.2} />
          <Eye x={20.7} y={14.2} />
          <path d="M13 20.2c1.8 2 4.2 2 6 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </Face>
      );
    case "jealous":
      return (
        <Face>
          <path d="M9.4 13.2 13 15.2M9.4 15.6 13 14.2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
          <path d="M23 13.2 19.4 15.2M23 15.6 19.4 14.2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
          <path d="M13.2 21.6h5.6" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
        </Face>
      );
    case "nervous":
      return (
        <Face blush="soft">
          <Eye x={11.4} y={14.2} r={1.15} />
          <Eye x={20.6} y={14.2} r={1.15} />
          <path d="M13.8 21.2h4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M24.6 8.8c.2 1.8.2 2.8 0 4" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </Face>
      );
    case "sparkle":
      return (
        <Face blush="soft">
          <path d="M11.2 14.2 9.6 12.6M11.2 14.2 12.8 12.6M11.2 14.2v2.4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M20.8 14.2 19.2 12.6M20.8 14.2 22.4 12.6M20.8 14.2v2.4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          <HappyMouth />
        </Face>
      );
    case "excited":
      return (
        <Face>
          <path d="M9.2 15.4 12.6 12.8 9.4 11.6" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22.8 15.4 19.4 12.8 22.6 11.6" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
          <HappyMouth wide />
        </Face>
      );
    case "purr":
      return (
        <Face blush="soft">
          <path d="M8.2 8.6 12.2 12M23.8 8.6 19.8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <Eye x={11.4} y={15} r={1.15} />
          <Eye x={20.6} y={15} r={1.15} />
          <path d="M12.8 21.2c2 1.6 4.4 1.6 6.4 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M6.8 18.4c1.2 0 1.2 1.4 2.4 1.4M23.2 18.4c1.2 0 1.2 1.4 2.4 1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </Face>
      );
    case "wag":
      return (
        <Face blush="soft">
          <Eye x={11.2} y={14} />
          <Eye x={20.8} y={14} />
          <HappyMouth />
          <path d="M24.8 22.2c2.4 1.4 3.6-.6 2.4-2.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </Face>
      );
    case "sit":
      return (
        <Face blush="soft">
          <Eye x={11.2} y={14} />
          <Eye x={20.8} y={14} />
          <HappyMouth />
          <path d="M10 24.2h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.45" />
        </Face>
      );
    default:
      return (
        <Face>
          <Eye x={11.3} y={14} />
          <Eye x={20.7} y={14} />
          <HappyMouth />
        </Face>
      );
  }
}

export function EmotionIcon({ id }: { id: EmotionId }) {
  return <Icons id={id} />;
}
