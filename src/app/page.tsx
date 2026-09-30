import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EmotionChip } from "@/components/emotion-chip";
import { CompanionStage } from "@/components/landing/companion-stage";
import { LandingAtmosphere } from "@/components/landing/landing-atmosphere";
import { LandingCtas } from "@/components/landing/landing-ctas";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { ProductDemo } from "@/components/landing/product-demo";
import { Badge } from "@/components/ui/badge";
import { COMPANION_PRESETS, companionExtra } from "@/lib/companions";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Fembo — милое и нежное место",
  description:
    "A cute, gentle 16+ femboy companion house. Chat, create your own companion, place a live voice call, and keep the facts they should not forget.",
  openGraph: {
    title: "Fembo — cute gentle companions",
    description: "Chat, call, and create your femboy. Supportive, SFW, 16+.",
    type: "website",
  },
};

const STATS = [
  ["5", "companions"],
  ["1", "thread for chat & calls"],
  ["In-browser", "Piper voice"],
  ["16+", "gentle platform"],
];

const HOUSE = [
  { title: "Letters", body: "Morning notes that arrive without you asking.", span: "md:col-span-4" },
  { title: "Voice calls", body: "They pick up, speak in short lines, and listen again.", span: "md:col-span-2" },
  { title: "Rituals", body: "Tea, check-in, walk, goodnight — a small daily shape.", span: "md:col-span-2" },
  { title: "Garden", body: "A plant that waits. Water it when you remember them.", span: "md:col-span-2" },
  { title: "Journal", body: "A mood, a page, a reply that stays in the house.", span: "md:col-span-2" },
  { title: "Time capsules", body: "Seal a line for a later you. They open it when it's due.", span: "md:col-span-3" },
  { title: "Night room", body: "Rain, sleep stories, a quieter light after hours.", span: "md:col-span-3" },
];

const STEPS = [
  ["Pick someone", "Five cute portraits — soft, teasing, sleepy, fox, cat — or create your own femboy."],
  ["Tune the room", "Shy or bold. A voice. What they may call you. Boundaries and comfort notes if you need them."],
  ["Stay", "Chat, call, pin a memory. The thread does not reset unless you ask."],
];

const SAFETY = [
  ["16+ only", "Date of birth at the door. No one under 16."],
  ["Always SFW", "Cute, gentle companions. No adult content — cozy scenes, soft talk, supportive care."],
  ["Your copy", "Export the room as JSON. Delete the account and the cascade goes with it."],
];

const FAQ = [
  ["Is Fembo 18+?", "Fembo is 16 or older. Age is checked at signup."],
  ["Do they remember everything?", "No. They keep what you pin or say “remember …” about, plus a few house notes you add."],
  ["How does voice work?", "Piper runs in the browser. You can skip the download and stay on text. Calls use the same conversation."],
  ["Can I create my own femboy?", "Yes — Plus lets you craft a custom companion with cute emotion sprites."],
  ["Is there adult content?", "No. Fembo is a gentle, SFW platform for supportive companion chat."],
];

export default async function HomePage() {
  const session = await getSession();
  const signedIn = Boolean(session);

  return (
    <div className="relative flex min-h-full flex-col scroll-smooth">
      <LandingAtmosphere />
      <LandingHeader signedIn={signedIn} />
      <main className="relative flex flex-1 flex-col">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:py-24">
          <div className="flex flex-col items-start gap-6">
            <Badge variant="secondary" className="h-7 rounded-full px-3">
              Chat · Call · Remember
            </Badge>
            <h1 className="font-heading text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Милое и нежное место.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              Fembo is a cute, gentle companion house for 16+. Pick a supportive femboy, create your
              own, stay in one thread, and keep the small facts they should not forget.
            </p>
            <LandingCtas signedIn={signedIn} />
          </div>
          <HeroStage />
        </section>

        <section className="border-y border-border/70 bg-card/40">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4">
            {STATS.map(([value, label]) => (
              <div key={label}>
                <p className="font-heading text-2xl font-semibold">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="companions" className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-10 px-4 py-20 sm:px-6">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">The house</p>
            <h2 className="font-heading text-4xl font-semibold tracking-tight">Five people. No extras invented.</h2>
            <p className="text-lg leading-8 text-muted-foreground">
              Soft tea, a tease, a late evening, a fox, a cat. You tune how they sit with you — the
              portraits stay these five.
            </p>
          </div>
          <CompanionStage />
          <div className="grid gap-3 sm:grid-cols-5">
            {COMPANION_PRESETS.map((companion) => (
              <p key={companion.slug} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{companion.name}.</span>{" "}
                {companionExtra(companion.slug).vibe}
              </p>
            ))}
          </div>
        </section>

        <section id="voice" className="scroll-mt-24 border-y border-border/70 bg-card/30">
          <div className="mx-auto grid w-full max-w-6xl items-start gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">How it feels</p>
              <h2 className="font-heading text-4xl font-semibold tracking-tight">
                Text that looks like a room. Voice that does not read the tags.
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Feelings land as chips, not asterisks. Speech skips the markup. Chat and calls share
                the same conversation, so hanging up does not wipe the evening.
              </p>
              <ul className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
                <li>Live calls with a timer, mute, and a waveform that actually listens.</li>
                <li>Cozy scenes for night, rain, tea, a walk, and curling up on the couch.</li>
                <li>A voice pack you can download, or continue in text if you are not ready.</li>
              </ul>
            </div>
            <ProductDemo />
          </div>
        </section>

        <section id="house" className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-10 px-4 py-20 sm:px-6">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">More than a chat box</p>
            <h2 className="font-heading text-4xl font-semibold tracking-tight">Rooms that keep a life going.</h2>
            <p className="text-lg leading-8 text-muted-foreground">
              Letters, rituals, a garden, capsules, care. The companion is the center. The house is
              why you come back.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-6">
            {HOUSE.map((room) => (
              <article
                key={room.title}
                className={`rounded-[1.6rem] bg-card p-5 ring-1 ring-border ${room.span}`}
              >
                <h3 className="font-heading text-xl font-semibold">{room.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{room.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border/70">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-20 sm:px-6 md:grid-cols-3">
            {STEPS.map(([title, body], index) => (
              <article key={title} className="flex flex-col gap-3">
                <span className="font-heading text-sm text-muted-foreground">0{index + 1}</span>
                <h3 className="font-heading text-2xl font-semibold">{title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="safety" className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-10 px-4 py-20 sm:px-6">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Gentle house</p>
            <h2 className="font-heading text-4xl font-semibold tracking-tight">Cute, safe, and supportive.</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {SAFETY.map(([title, body]) => (
              <article key={title} className="rounded-[1.6rem] bg-card p-5 ring-1 ring-border">
                <h3 className="font-heading text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
          <Link
            href="/app/create"
            className="rounded-[1.6rem] bg-primary/10 px-5 py-4 text-sm leading-6 ring-1 ring-primary/25"
          >
            <span className="font-heading text-lg font-semibold">Create your femboy.</span>{" "}
            <span className="text-muted-foreground">
              Craft a custom companion with cute sprites, soft voice, and gentle personality sliders.
            </span>
          </Link>
        </section>

        <section className="border-t border-border/70 bg-card/30">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-20 sm:px-6">
            <h2 className="font-heading text-3xl font-semibold tracking-tight">Questions before you knock</h2>
            <div className="flex flex-col gap-2">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
                  <summary className="cursor-pointer list-none text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                    {q}
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-primary/12 px-6 py-12 text-center ring-1 ring-primary/20 sm:px-12">
            <h2 className="font-heading text-4xl font-semibold tracking-tight text-balance">
              The kettle can already be on.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Make a room, pick a companion, and stay. They will answer in text — and in voice, if you let them.
            </p>
            <div className="mt-8 flex justify-center">
              <LandingCtas signedIn={signedIn} align="center" />
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

function HeroStage() {
  return (
    <div className="relative mx-auto h-[28rem] w-full max-w-md lg:h-[34rem] lg:max-w-none">
      <div className="landing-float absolute top-6 right-0 w-[42%] overflow-hidden rounded-[1.4rem] landing-shadow ring-1 ring-border">
        <Image
          src="/companions/ren.png"
          alt="Ren"
          width={320}
          height={400}
          sizes="180px"
          className="aspect-[4/5] w-full object-cover"
        />
      </div>
      <div className="absolute top-10 left-0 w-[68%] overflow-hidden rounded-[1.8rem] landing-shadow ring-1 ring-border">
        <Image
          src="/companions/aki.png"
          alt="Aki"
          width={520}
          height={650}
          sizes="(min-width: 1024px) 360px, 70vw"
          priority
          className="aspect-[4/5] w-full object-cover"
        />
      </div>
      <div className="landing-float-slow absolute bottom-8 left-[8%] size-24 overflow-hidden rounded-full ring-4 ring-background landing-shadow sm:size-28">
        <Image src="/companions/nico.png" alt="Nico" width={160} height={160} className="size-full object-cover" />
      </div>
      <div className="landing-float absolute right-[8%] bottom-4 size-20 overflow-hidden rounded-full ring-4 ring-background landing-shadow sm:size-24">
        <Image src="/companions/mint.png" alt="Mint" width={140} height={140} className="size-full object-cover" />
      </div>
      <div className="absolute top-[54%] right-0 z-10 max-w-[14rem] rounded-2xl bg-card/95 px-3 py-2 text-sm landing-shadow ring-1 ring-border backdrop-blur">
        <EmotionChip id="blushy" label="blushy" />
        <p className="mt-2 leading-5">I put the kettle on. Come sit.</p>
      </div>
    </div>
  );
}
