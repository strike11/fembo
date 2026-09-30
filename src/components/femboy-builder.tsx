"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FemboyAvatar } from "@/components/femboy-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { englishVoiceId, SOFT_VOICES } from "@/lib/companions";
import {
  ACCESSORIES,
  BLUSH_LEVELS,
  DEFAULT_FEMBOY_LOOK,
  EAR_TYPES,
  FEMBOY_EXPRESSIONS,
  HAIR_STYLES,
  OUTFITS,
  type FemboyExpression,
  type FemboyLook,
} from "@/lib/femboy-look";
import { asLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PALETTE = [
  "#f4a4c8",
  "#c9a7eb",
  "#9fd4ff",
  "#a8e6cf",
  "#ffbfa3",
  "#f0d9a8",
  "#d8dce3",
  "#2a2430",
  "#c9d8ff",
  "#ffd4e5",
  "#fde8dc",
  "#f5d0b5",
  "#e8b896",
  "#7ec8e3",
  "#8b6fd4",
  "#ff8fb8",
];

const LABELS = {
  en: {
    hairStyle: {
      fluffy_short: "Fluffy short",
      long_wavy: "Long wavy",
      bob: "Bob",
      twin_tails: "Twin tails",
      messy: "Messy",
      wolf_cut: "Wolf cut",
    },
    ears: { human: "Human", cat: "Cat", fox: "Fox", bunny: "Bunny" },
    outfit: {
      hoodie: "Hoodie",
      sweater: "Sweater",
      casual_tee: "Casual tee",
      cardigan: "Cardigan",
      school: "School",
    },
    accessory: { none: "None", ribbon: "Ribbon", choker: "Choker", glasses: "Glasses" },
    blush: { soft: "Soft", medium: "Medium", strong: "Strong" },
    expression: {
      smile: "Smile",
      blushy: "Blush",
      shy: "Shy",
      wink: "Wink",
      surprised: "Surprised",
      sleepy: "Sleepy",
    },
  },
} as const;

function OptionGrid<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs transition-colors",
            value === option
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent",
          )}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}

function ColorSwatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={color}
          onClick={() => onChange(color)}
          className={cn(
            "size-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition-transform hover:scale-105",
            value === color ? "ring-primary" : "ring-transparent",
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

export function FemboyBuilder({
  locale = "en",
  initialLook = DEFAULT_FEMBOY_LOOK,
  initialName = "",
  initialTagline = "",
  initialLore = "",
  initialSlug,
  initialVoiceId = SOFT_VOICES[0].id,
}: {
  locale?: string;
  initialLook?: FemboyLook;
  initialName?: string;
  initialTagline?: string;
  initialLore?: string;
  initialSlug?: string;
  initialVoiceId?: string;
}) {
  const router = useRouter();
  const lang = asLocale(locale);
  const labels = LABELS[lang];
  const [look, setLook] = useState<FemboyLook>(initialLook);
  const [expression, setExpression] = useState<FemboyExpression>("smile");
  const [name, setName] = useState(initialName);
  const [tagline, setTagline] = useState(initialTagline);
  const [lore, setLore] = useState(initialLore);
  const [voiceId, setVoiceId] = useState(englishVoiceId(initialVoiceId));
  const [saving, setSaving] = useState(false);

  const patch = (next: Partial<FemboyLook>) => setLook((current) => ({ ...current, ...next }));

  const previewTitle = useMemo(
    () => (name.trim() ? `${name.trim()} preview` : "Femboy preview"),
    [name],
  );

  async function save() {
    if (!name.trim() || !tagline.trim()) {
      toast.error("Name and tagline are required");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: initialSlug,
          name: name.trim(),
          tagline: tagline.trim(),
          lore: lore.trim(),
          look,
          voiceId,
        }),
      });
      const payload = (await response.json()) as { error?: string; slug?: string };
      if (!response.ok) {
        toast.error(payload.error ?? "Could not save");
        return;
      }
      toast.success("Your femboy is ready!");
      router.push(`/app/companions/${payload.slug}`);
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <section className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <div className="overflow-hidden rounded-3xl bg-card p-4 ring-1 ring-border">
          <FemboyAvatar
            look={look}
            expression={expression}
            animated
            className="aspect-[10/11] w-full"
            title={previewTitle}
          />
        </div>
        <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {"Live expressions"}
          </p>
          <OptionGrid
            value={expression}
            options={FEMBOY_EXPRESSIONS}
            labels={labels.expression}
            onChange={setExpression}
          />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="grid gap-4 rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="grid gap-2">
            <Label htmlFor="name">{"Name"}</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={"Like Yuki"}
              maxLength={24}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tagline">{"Tagline"}</Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
              placeholder={
                "Soft, caring, always nearby"
              }
              maxLength={80}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lore">{"Backstory (optional)"}</Label>
            <Textarea
              id="lore"
              value={lore}
              onChange={(event) => setLore(event.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        <div className="grid gap-5 rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="grid gap-2">
            <Label>{"Hair style"}</Label>
            <OptionGrid
              value={look.hairStyle}
              options={HAIR_STYLES}
              labels={labels.hairStyle}
              onChange={(hairStyle) => patch({ hairStyle })}
            />
          </div>
          <div className="grid gap-2">
            <Label>{"Hair color"}</Label>
            <ColorSwatches value={look.hairColor} onChange={(hairColor) => patch({ hairColor })} />
          </div>
          <div className="grid gap-2">
            <Label>{"Eye color"}</Label>
            <ColorSwatches value={look.eyeColor} onChange={(eyeColor) => patch({ eyeColor })} />
          </div>
          <div className="grid gap-2">
            <Label>{"Skin tone"}</Label>
            <ColorSwatches value={look.skinTone} onChange={(skinTone) => patch({ skinTone })} />
          </div>
          <div className="grid gap-2">
            <Label>{"Ears"}</Label>
            <OptionGrid
              value={look.ears}
              options={EAR_TYPES}
              labels={labels.ears}
              onChange={(ears) => patch({ ears })}
            />
          </div>
          <div className="grid gap-2">
            <Label>{"Outfit"}</Label>
            <OptionGrid
              value={look.outfit}
              options={OUTFITS}
              labels={labels.outfit}
              onChange={(outfit) => patch({ outfit })}
            />
          </div>
          <div className="grid gap-2">
            <Label>{"Outfit color"}</Label>
            <ColorSwatches
              value={look.outfitColor}
              onChange={(outfitColor) => patch({ outfitColor })}
            />
          </div>
          <div className="grid gap-2">
            <Label>{"Accessory"}</Label>
            <OptionGrid
              value={look.accessory}
              options={ACCESSORIES}
              labels={labels.accessory}
              onChange={(accessory) => patch({ accessory })}
            />
          </div>
          <div className="grid gap-2">
            <Label>{"Blush"}</Label>
            <OptionGrid
              value={look.blush}
              options={BLUSH_LEVELS}
              labels={labels.blush}
              onChange={(blush) => patch({ blush })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="voice">{"Voice"}</Label>
            <select
              id="voice"
              value={voiceId}
              onChange={(event) => setVoiceId(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {SOFT_VOICES.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button size="lg" onClick={() => void save()} disabled={saving}>
          {saving
            ? "Saving…"
            : initialSlug
              ? "Update femboy"
              : "Create & start chat"}
        </Button>
      </section>
    </div>
  );
}
