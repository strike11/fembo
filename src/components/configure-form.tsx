"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { downloadPiperVoice, saveCustomPiperVoice } from "@/hooks/use-piper";
import { SOFT_VOICES } from "@/lib/companions";

type ConfigValues = {
  nickname: string;
  shyBold: number;
  sweetTeasing: number;
  calmEnergetic: number;
  treatYou: string;
  appearanceNotes: string;
  callYou: string;
  voiceId: string;
};

export function ConfigureForm({ slug, initial }: { slug: string; initial: ConfigValues }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [values, setValues] = useState(initial);

  function setSlider(
    key: "shyBold" | "sweetTeasing" | "calmEnergetic",
    next: number | readonly number[],
  ) {
    const value = Array.isArray(next) ? (next[0] ?? 0) : next;
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit() {
    setError(null);
    setPending(true);
    const response = await fetch(`/api/companions/${slug}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(payload.error ?? "Could not save this companion");
      return;
    }
    toast.success("Companion saved");
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="nickname">Nickname</FieldLabel>
          <Input
            id="nickname"
            value={values.nickname}
            onChange={(event) =>
              setValues((current) => ({ ...current, nickname: event.target.value }))
            }
          />
        </Field>
        <Field>
          <FieldLabel>Shy to bold</FieldLabel>
          <Slider value={[values.shyBold]} onValueChange={(value) => setSlider("shyBold", value)} />
          <FieldDescription>Left is shy. Right is bolder.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Sweet to teasing</FieldLabel>
          <Slider
            value={[values.sweetTeasing]}
            onValueChange={(value) => setSlider("sweetTeasing", value)}
          />
        </Field>
        <Field>
          <FieldLabel>Calm to energetic</FieldLabel>
          <Slider
            value={[values.calmEnergetic]}
            onValueChange={(value) => setSlider("calmEnergetic", value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="callYou">What they call you</FieldLabel>
          <Input
            id="callYou"
            value={values.callYou}
            onChange={(event) =>
              setValues((current) => ({ ...current, callYou: event.target.value }))
            }
            placeholder="love, you, a nickname"
          />
          <FieldDescription>They will use this in chat and on calls.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="treatYou">How they should treat you</FieldLabel>
          <Textarea
            id="treatYou"
            value={values.treatYou}
            onChange={(event) =>
              setValues((current) => ({ ...current, treatYou: event.target.value }))
            }
            placeholder="Gentle check-ins, quiet company, a little humor..."
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="appearanceNotes">Appearance notes</FieldLabel>
          <Textarea
            id="appearanceNotes"
            value={values.appearanceNotes}
            onChange={(event) =>
              setValues((current) => ({ ...current, appearanceNotes: event.target.value }))
            }
            placeholder="Soft sweater, fox ears, pastel hair..."
          />
          <FieldDescription>Flavor for the conversation only — cute and gentle.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="voiceId">Piper voice</FieldLabel>
          <select
            id="voiceId"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={
              SOFT_VOICES.some((voice) => voice.id === values.voiceId) ? values.voiceId : "__custom"
            }
            onChange={(event) => {
              if (event.target.value !== "__custom") {
                setValues((current) => ({ ...current, voiceId: event.target.value }));
              }
            }}
          >
            {SOFT_VOICES.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.label}
              </option>
            ))}
            <option value="__custom">Custom Piper voice id</option>
          </select>
          <Input
            className="mt-2"
            value={values.voiceId}
            onChange={(event) =>
              setValues((current) => ({ ...current, voiceId: event.target.value }))
            }
            placeholder="en_US-hfc_female-medium"
          />
          <FieldDescription>
            Use a catalog voice, type any Piper id, or drop your own .onnx and .json below.
          </FieldDescription>
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void downloadPiperVoice(values.voiceId, (percent) =>
                setVoiceStatus(`Downloading ${percent}%`),
              )
                .then(() => {
                  setVoiceStatus("Voice ready on this device");
                  toast.success("Voice saved in the browser");
                })
                .catch((err: unknown) => {
                  setVoiceStatus(err instanceof Error ? err.message : "Download failed");
                });
            }}
          >
            Download voice
          </Button>
          <Field className="min-w-60 flex-1">
            <FieldLabel htmlFor="voiceFiles">Upload Piper .onnx + .json</FieldLabel>
            <Input
              id="voiceFiles"
              type="file"
              multiple
              accept=".onnx,.json,application/json"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                const onnx = files.find((file) => file.name.endsWith(".onnx"));
                const json = files.find((file) => file.name.endsWith(".json"));
                if (!onnx || !json) {
                  setVoiceStatus("Select both the .onnx and .json files");
                  return;
                }
                void saveCustomPiperVoice(values.voiceId, onnx, json)
                  .then(() => {
                    setVoiceStatus("Custom voice stored in this browser");
                    toast.success("Custom voice stored");
                  })
                  .catch((err: unknown) => {
                    setVoiceStatus(err instanceof Error ? err.message : "Could not store voice");
                  });
              }}
            />
          </Field>
        </div>
        {voiceStatus ? <FieldDescription>{voiceStatus}</FieldDescription> : null}
      </FieldGroup>
      {error ? <FieldError>{error}</FieldError> : null}
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner data-icon="inline-start" /> : null}
        Save companion
      </Button>
    </form>
  );
}
