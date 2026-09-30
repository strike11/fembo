"use client";



import { Volume2Icon, VolumeXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import {

  Dialog,

  DialogContent,

  DialogDescription,

  DialogFooter,

  DialogHeader,

  DialogTitle,

} from "@/components/ui/dialog";

import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

import { Spinner } from "@/components/ui/spinner";

import type { VoicePhase } from "@/hooks/use-piper";

import { asLocale, t, tf } from "@/lib/i18n";



export function VoiceReadyDialog({

  open,

  nickname,

  locale = "en",

  phase,

  progress,

  error,

  onRetry,

  onStartWithVoice,

  onContinueSilent,

}: {

  open: boolean;

  nickname: string;

  locale?: string;

  phase: VoicePhase;

  progress: number;

  error: string | null;

  onRetry: () => void;

  onStartWithVoice: () => void;

  onContinueSilent: () => void;

}) {

  const lang = asLocale(locale);

  const waiting =

    phase === "idle" || phase === "checking" || phase === "downloading" || phase === "preparing";



  return (

    <Dialog open={open} disablePointerDismissal onOpenChange={() => undefined}>

      <DialogContent showCloseButton={false} className="sm:max-w-md">

        <DialogHeader>

          <DialogTitle>{t(lang, "voicePreparing")}</DialogTitle>

          <DialogDescription>

            {tf(lang, "voicePreparingHint", { name: nickname })}

          </DialogDescription>

        </DialogHeader>

        <div className="flex flex-col gap-3">

          {waiting ? (

            <Progress value={progress}>

              <ProgressLabel>{t(lang, "voiceDownload")}</ProgressLabel>

              <ProgressValue />

            </Progress>

          ) : null}

          {phase === "ready" ? (

            <p className="text-sm text-muted-foreground">{t(lang, "voiceReady")}</p>

          ) : null}

          {phase === "error" && error ? <p className="text-sm text-destructive">{error}</p> : null}

        </div>

        <DialogFooter className="sm:flex-col sm:items-stretch">

          {phase === "error" ? (

            <Button type="button" onClick={onRetry}>

              <Volume2Icon data-icon="inline-start" />

              {t(lang, "tryAgain")}

            </Button>

          ) : (

            <Button type="button" disabled={waiting || phase !== "ready"} onClick={onStartWithVoice}>

              {waiting ? <Spinner data-icon="inline-start" /> : <Volume2Icon data-icon="inline-start" />}

              {waiting ? t(lang, "downloadingVoice") : t(lang, "startWithVoice")}

            </Button>

          )}

          <Button type="button" variant="outline" onClick={onContinueSilent}>

            <VolumeXIcon data-icon="inline-start" />

            {t(lang, "continueWithoutVoice")}

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>

  );

}

