"use client";

import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { asLocale, t } from "@/lib/i18n";

export function SettingsForm({
  name,
  email,
  enterToSend,
  autoSpeak,
  showEmotions,
  callAutoListen,
  nightRoom,
  compactChat,
  doNotDisturb,
  ambientSound,
  statusLine,
  sleepMode,
  locale = "en",
}: {
  name: string;
  email: string;
  enterToSend: boolean;
  autoSpeak: boolean;
  showEmotions: boolean;
  callAutoListen: boolean;
  nightRoom: boolean;
  compactChat: boolean;
  doNotDisturb: boolean;
  ambientSound: boolean;
  statusLine: string;
  sleepMode: boolean;
  locale?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enter, setEnter] = useState(enterToSend);
  const [speak, setSpeak] = useState(autoSpeak);
  const [emotions, setEmotions] = useState(showEmotions);
  const [listen, setListen] = useState(callAutoListen);
  const [night, setNight] = useState(nightRoom);
  const [compact, setCompact] = useState(compactChat);
  const [quiet, setQuiet] = useState(doNotDisturb);
  const [ambient, setAmbient] = useState(ambientSound);
  const [status, setStatus] = useState(statusLine);
  const [asleep, setAsleep] = useState(sleepMode);
  const [lang, setLang] = useState(locale === "ru" ? "ru" : "en");
  const ui = asLocale(lang);
  const { setTheme } = useTheme();

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        enterToSend: enter,
        autoSpeak: speak,
        showEmotions: emotions,
        callAutoListen: listen,
        nightRoom: night,
        compactChat: compact,
        doNotDisturb: quiet,
        ambientSound: ambient,
        statusLine: status,
        sleepMode: asleep,
        locale: lang,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(payload.error ?? t(ui, "settingsSaveFailed"));
      return;
    }
    toast.success(t(ui, "settingsSaved"));
    setTheme(night ? "dark" : "light");
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(new FormData(event.currentTarget));
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">{t(ui, "displayName")}</FieldLabel>
          <Input id="name" name="name" defaultValue={name} required />
        </Field>
        <Field data-disabled>
          <FieldLabel htmlFor="email">{t(ui, "email")}</FieldLabel>
          <Input id="email" value={email} disabled />
        </Field>
        <Field>
          <FieldLabel htmlFor="locale">{t(ui, "language")}</FieldLabel>
          <select
            id="locale"
            value={lang}
            onChange={(event) => setLang(event.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
          <FieldDescription>{t(ui, "languageHint")}</FieldDescription>
        </Field>
        <Field orientation="horizontal">
          <Switch id="enter" checked={enter} onCheckedChange={setEnter} />
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="enter">{t(ui, "enterToSend")}</FieldLabel>
            <FieldDescription>{t(ui, "enterToSendHint")}</FieldDescription>
          </div>
        </Field>
        <Field orientation="horizontal">
          <Switch id="speak" checked={speak} onCheckedChange={setSpeak} />
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="speak">{t(ui, "speakReplies")}</FieldLabel>
            <FieldDescription>{t(ui, "speakRepliesHint")}</FieldDescription>
          </div>
        </Field>
        <Field orientation="horizontal">
          <Switch id="emotions" checked={emotions} onCheckedChange={setEmotions} />
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="emotions">Show emotion chips</FieldLabel>
            <FieldDescription>Voice still never reads the tags.</FieldDescription>
          </div>
        </Field>
        <Field orientation="horizontal">
          <Switch id="listen" checked={listen} onCheckedChange={setListen} />
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="listen">Auto-listen on calls</FieldLabel>
            <FieldDescription>After they finish speaking, the mic opens again.</FieldDescription>
          </div>
        </Field>
        <Field orientation="horizontal">
          <Switch id="night" checked={night} onCheckedChange={setNight} />
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="night">Night room</FieldLabel>
            <FieldDescription>Dim the whole house. You can also toggle it in the sidebar.</FieldDescription>
          </div>
        </Field>
        <Field orientation="horizontal">
          <Switch id="compact" checked={compact} onCheckedChange={setCompact} />
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="compact">Compact chat</FieldLabel>
            <FieldDescription>Tighter bubbles if you like a denser thread.</FieldDescription>
          </div>
        </Field>
        <Field orientation="horizontal">
          <Switch id="quiet" checked={quiet} onCheckedChange={setQuiet} />
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="quiet">Do not disturb</FieldLabel>
            <FieldDescription>Hides the notification pip. The room stays, the bell does not.</FieldDescription>
          </div>
        </Field>
        <Field orientation="horizontal">
          <Switch id="ambient" checked={ambient} onCheckedChange={setAmbient} />
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="ambient">Ambient room sound</FieldLabel>
            <FieldDescription>Soft rain or night noise when those scenes are on in chat.</FieldDescription>
          </div>
        </Field>
        <Field>
          <FieldLabel htmlFor="status">How you are sitting</FieldLabel>
          <Input
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            placeholder="Tired, home, working…"
          />
          <FieldDescription>They notice this in chat and on calls.</FieldDescription>
        </Field>
        <Field orientation="horizontal">
          <Switch id="sleep" checked={asleep} onCheckedChange={setAsleep} />
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="sleep">Sleep mode</FieldLabel>
            <FieldDescription>They keep their voice low and do not start a new plot.</FieldDescription>
          </div>
        </Field>
      </FieldGroup>
      {error ? <FieldError>{error}</FieldError> : null}
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner data-icon="inline-start" /> : null}
        {t(ui, "saveSettings")}
      </Button>
    </form>
  );
}
