export function LandingAtmosphere({ tone = "day" }: { tone?: "day" | "night" }) {
  const night = tone === "night";
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className={
          night
            ? "absolute -top-32 left-[-10%] size-[36rem] rounded-full bg-[radial-gradient(circle,oklch(0.42_0.1_350/0.55),transparent_68%)] blur-2xl"
            : "absolute -top-32 left-[-10%] size-[34rem] rounded-full bg-[radial-gradient(circle,oklch(0.86_0.08_350/0.45),transparent_68%)] blur-2xl"
        }
      />
      <div
        className={
          night
            ? "absolute top-24 right-[-8%] size-[28rem] rounded-full bg-[radial-gradient(circle,oklch(0.28_0.06_20/0.55),transparent_70%)] blur-2xl"
            : "absolute top-24 right-[-8%] size-[28rem] rounded-full bg-[radial-gradient(circle,oklch(0.9_0.06_55/0.35),transparent_70%)] blur-2xl"
        }
      />
      <div className="absolute top-[42rem] left-1/3 size-[22rem] rounded-full bg-[radial-gradient(circle,oklch(0.88_0.04_165/0.18),transparent_70%)] blur-2xl" />
    </div>
  );
}
