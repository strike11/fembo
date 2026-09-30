"use client";

import {
  CopyIcon,
  FlagIcon,
  MicIcon,
  MoonIcon,
  PhoneIcon,
  PinIcon,
  RefreshCwIcon,
  SendIcon,
  SquarePenIcon,
  Trash2Icon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import Link from "next/link";
import { CompanionPortrait, expressionFromMessage } from "@/components/companion-portrait";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EmotionChip } from "@/components/emotion-chip";
import { RoleplayText } from "@/components/roleplay-text";
import { VisualStage } from "@/components/visual-stage";
import { VoiceReadyDialog } from "@/components/voice-ready-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAmbient } from "@/hooks/use-ambient";
import { usePiper } from "@/hooks/use-piper";
import { useSpeech } from "@/hooks/use-speech";
import { QuotaBar } from "@/components/quota-bar";
import { fetchBillingStatus, type BillingStatus } from "@/lib/billing-client";
import { companionExtra } from "@/lib/companions";
import { stripEmotionMarkup } from "@/lib/emotions";
import { formatClock } from "@/lib/format";
import { asLocale, sceneLabel, t } from "@/lib/i18n";
import { lastAssistantSprite } from "@/lib/sprites";
import { pullSentences } from "@/lib/sentences";
import { STATUS_LINES } from "@/lib/keeps";
import { SCENES, sceneById, type SceneId } from "@/lib/scenes";
import { readSseDeltaStream } from "@/lib/sse";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  reaction?: string;
  createdAt?: string;
};

function commonPrefix(left: string, right: string) {
  const max = Math.min(left.length, right.length);
  let index = 0;
  while (index < max && left[index] === right[index]) index += 1;
  return left.slice(0, index);
}

export function ChatThread({
  slug,
  nickname,
  avatarPath,
  lookLock,
  voiceId,
  conversationId: initialConversationId,
  initialMessages,
  enterToSend = true,
  autoSpeak = true,
  showEmotions = true,
  compactChat = false,
  ambientSound = false,
  sleepMode = false,
  statusLine = "",
  initialScene = "default",
  initialPrompt = "",
  layout = "thread",
  locale = "en",
  vibe,
}: {
  slug: string;
  nickname: string;
  avatarPath: string;
  lookLock?: string | null;
  voiceId: string;
  conversationId: string;
  initialMessages: ChatMessage[];
  enterToSend?: boolean;
  autoSpeak?: boolean;
  showEmotions?: boolean;
  compactChat?: boolean;
  ambientSound?: boolean;
  sleepMode?: boolean;
  statusLine?: string;
  initialScene?: string;
  initialPrompt?: string;
  layout?: "thread" | "visual";
  locale?: string;
  vibe?: string;
}) {
  const extras = companionExtra(slug, vibe);
  const lang = asLocale(locale);
  const visual = layout === "visual";
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [pinned, setPinned] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState(initialPrompt);
  const [pending, setPending] = useState(false);
  const [voiceChoice, setVoiceChoice] = useState<"pending" | "on" | "off">(
    autoSpeak ? "pending" : "off",
  );
  const [error, setError] = useState<string | null>(null);
  const [scene, setScene] = useState<SceneId>(sceneById(initialScene).id);
  const [filter, setFilter] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [asleep, setAsleep] = useState(sleepMode);
  const [presence, setPresence] = useState(statusLine);
  const [failedSend, setFailedSend] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const spokenCommittedRef = useRef("");
  const speakOn = voiceChoice === "on";
  const { speak, prepare, phase, progress, error: voiceError } = usePiper(voiceId, speakOn);
  const { supported, listening, toggle } = useSpeech((text) => {
    setInput(text);
    void send(text);
  });
  useAmbient(ambientSound, scene);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bottomRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    void fetchBillingStatus().then(setBilling).catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (!initialPrompt) {
        try {
          const draft = localStorage.getItem(`fembo-draft:${conversationId}`);
          if (draft) setInput(draft);
        } catch {
          /* private mode */
        }
      }
      setDraftReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [conversationId, initialPrompt]);

  useEffect(() => {
    if (!draftReady) return;
    try {
      const key = `fembo-draft:${conversationId}`;
      if (input) localStorage.setItem(key, input);
      else localStorage.removeItem(key);
    } catch {
      /* private mode */
    }
  }, [conversationId, draftReady, input]);

  useEffect(() => {
    if (voiceChoice === "pending") {
      void prepare();
    }
  }, [prepare, voiceChoice, voiceId]);

  const voicePending = voiceChoice === "pending";
  const voiceReady = !voicePending;
  const starters = extras.starters;
  const liveSprite = lastAssistantSprite(messages, slug, avatarPath);
  const quotaBlocked = billing !== null && !billing.plus && billing.remaining === 0;
  let lastAssistantIndex = -1;
  for (let cursor = messages.length - 1; cursor >= 0; cursor -= 1) {
    if (messages[cursor]?.role === "assistant") {
      lastAssistantIndex = cursor;
      break;
    }
  }

  function emitSpeech(full: string, final = false) {
    const spoken = stripEmotionMarkup(full);
    let committed = spokenCommittedRef.current;
    if (!spoken.startsWith(committed)) {
      committed = commonPrefix(committed, spoken);
    }
    const unread = spoken.slice(committed.length);
    if (final) {
      const leftover = unread.trim();
      if (leftover) speak(leftover);
      spokenCommittedRef.current = spoken;
      return;
    }
    const { sentences, rest } = pullSentences(unread);
    for (const sentence of sentences) {
      const clean = stripEmotionMarkup(sentence);
      if (clean) speak(clean);
    }
    spokenCommittedRef.current = spoken.slice(0, spoken.length - rest.length);
  }

  async function streamInto(assistantId: string, response: Response) {
    const full = await readSseDeltaStream(response, (next) => {
      emitSpeech(next);
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId ? { ...message, content: next } : message,
        ),
      );
    });
    emitSpeech(full, true);
    return full;
  }

  async function send(text = input, reuseUser = false, sceneOverride?: SceneId) {
    const content = text.trim();
    if (!content || pending || quotaBlocked) return;
    const sceneNow = sceneOverride ?? scene;
    setInput("");
    setError(null);
    setFailedSend(null);
    setPending(true);
    spokenCommittedRef.current = "";
    if (!reuseUser) {
      const userMessage: ChatMessage = {
        id: `local-${Date.now()}`,
        role: "user",
        content,
      };
      setMessages((current) => [...current, userMessage]);
    }
    const assistantId = `assistant-${Date.now()}`;
    setMessages((current) => [...current, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          content,
          conversationId,
          scene: sceneNow,
          visual,
          idempotencyKey: `chat:${conversationId}:${Date.now()}:${crypto.randomUUID()}`,
        }),
      });
      await streamInto(assistantId, response);
      setBilling((current) => {
        if (!current || current.plus || current.remaining === null) return current;
        return { ...current, remaining: Math.max(0, current.remaining - 1), used: current.used + 1 };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went quiet";
      setError(message);
      setFailedSend(content);
      setMessages((current) =>
        current.filter((item) => item.id !== assistantId || item.content.length > 0),
      );
      void fetchBillingStatus().then(setBilling).catch(() => undefined);
    } finally {
      setPending(false);
    }
  }

  function continueScene() {
    void send(
      "Continue from the last word. Do not restart the scene.",
    );
  }

  async function reportLine(content: string) {
    const snippet = stripEmotionMarkup(content).slice(0, 280);
    if (!snippet) return;
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, snippet, reason: "Needs a human look" }),
    });
    if (!response.ok) {
      toast.error("Could not file that");
      return;
    }
    toast.success("Reported. Thank you.");
  }

  async function regenerate() {
    if (pending) return;
    const lastAssistant = [...messages].reverse().find((item) => item.role === "assistant");
    if (!lastAssistant) return;
    setPending(true);
    setError(null);
    spokenCommittedRef.current = "";
    setMessages((current) =>
      current.map((item) => (item.id === lastAssistant.id ? { ...item, content: "" } : item)),
    );
    try {
      const response = await fetch("/api/chat/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          conversationId,
          visual,
          idempotencyKey: `regen:${conversationId}:${lastAssistant.id}:${crypto.randomUUID()}`,
        }),
      });
      await streamInto(lastAssistant.id, response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not regenerate");
    } finally {
      setPending(false);
    }
  }

  async function removeMessage(id: string) {
    const target = messages.find((item) => item.id === id);
    if (!target || target.id.startsWith("local-") || target.id.startsWith("assistant-")) {
      setMessages((current) => current.filter((item) => item.id !== id));
      return;
    }
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    setMessages((current) => current.filter((item) => item.id !== id));
  }

  async function newChat() {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const payload = (await response.json()) as { conversationId?: string };
    if (!response.ok || !payload.conversationId) {
      toast.error("Could not start a new chat");
      return;
    }
    setConversationId(payload.conversationId);
    setMessages([]);
    setPinned(false);
    toast.success("New chat started");
  }

  async function togglePin() {
    const next = !pinned;
    setPinned(next);
    await fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: next }),
    });
  }

  function exportChat() {
    const text = messages
      .map((message) => `${message.role === "user" ? "You" : nickname}: ${message.content}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug}-chat.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function setPresenceLine(line: string, nextSleep = asleep) {
    setPresence(line);
    setAsleep(nextSleep);
    await fetch("/api/presence", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusLine: line, sleepMode: nextSleep }),
    });
  }

  async function summarizeThread() {
    const response = await fetch("/api/summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, conversationId }),
    });
    const payload = (await response.json()) as { summary?: { body: string }; error?: string };
    if (!response.ok || !payload.summary) {
      toast.error(payload.error ?? t(lang, "errorSummarizeFailed"));
      return;
    }
    toast.success(payload.summary.body.slice(0, 120));
  }

  async function react(id: string, reaction: string) {
    setMessages((current) =>
      current.map((item) => (item.id === id ? { ...item, reaction } : item)),
    );
    if (!id.startsWith("local-") && !id.startsWith("assistant-")) {
      await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction }),
      });
    }
  }

  const dock = (
        <div className={cn("px-4 pt-2 pb-5", visual ? "px-0 pb-0 pt-0" : "bg-background/90 backdrop-blur-md")}>
        <div className={cn("mx-auto flex w-full flex-col gap-2", visual ? "max-w-2xl" : "max-w-3xl")}>
          {visual && messages.length === 0 ? (
            <div className="flex flex-wrap gap-2 px-1">
              {starters.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  disabled={pending || quotaBlocked}
                  className="rounded-full bg-white/15 px-3 py-1.5 text-sm text-white hover:bg-white/25"
                  onClick={() => void send(starter)}
                >
                  {starter}
                </button>
              ))}
            </div>
          ) : null}
          {moreOpen && !visual ? (
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={t(lang, "searchThread")}
            aria-label={t(lang, "searchThread")}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          />
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex flex-wrap items-center gap-1">
              {messages.length > 0 ? (
                <Button type="button" variant="ghost" size="sm" disabled={pending || quotaBlocked} onClick={continueScene} className={visual ? "text-white hover:bg-white/15" : undefined}>
                  {t(lang, "continue")}
                </Button>
              ) : null}
              {visual ? null : (
                <Link href={`/app/call/${slug}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
                  <PhoneIcon />
                  {t(lang, "call")}
                </Link>
              )}
              <Button type="button" variant={pinned ? "secondary" : "ghost"} size="sm" onClick={() => void togglePin()} className={visual ? "text-white hover:bg-white/15" : undefined}>
                <PinIcon />
                {pinned ? t(lang, "pinned") : t(lang, "pin")}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => void newChat()} className={visual ? "text-white hover:bg-white/15" : undefined}>
                <SquarePenIcon />
                {t(lang, "newChat")}
              </Button>
              <Button
                type="button"
                variant={moreOpen ? "secondary" : "ghost"}
                size="sm"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((value) => !value)}
                className={visual ? "text-white hover:bg-white/15" : undefined}
              >
                {t(lang, "more")}
              </Button>
              {moreOpen ? (
                <>
              <Button type="button" variant="ghost" size="sm" onClick={exportChat} disabled={messages.length === 0}>
                {t(lang, "exportChat")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={messages.length === 0}
                onClick={() => void summarizeThread()}
              >
                {t(lang, "summarize")}
              </Button>
              <Button
                type="button"
                variant={asleep ? "secondary" : "ghost"}
                size="sm"
                onClick={() => void setPresenceLine(asleep ? "" : "Going to sleep", !asleep)}
              >
                <MoonIcon />
                {asleep ? t(lang, "asleep") : t(lang, "sleep")}
              </Button>
                </>
              ) : null}
            </div>
          </div>
          {moreOpen ? (
          <div className="flex flex-wrap gap-1 px-1">
            <span className="self-center px-1 text-[10px] tracking-wide text-muted-foreground uppercase">
              {t(lang, "scenePicker")}
            </span>
            {SCENES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  scene === item.id ? "bg-primary text-primary-foreground" : visual ? "bg-white/15 text-white" : "bg-muted",
                )}
                onClick={() => {
                  setScene(item.id);
                  void fetch(`/api/conversations/${conversationId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ scene: item.id }),
                  }).catch(() => undefined);
                }}
              >
                {sceneLabel(lang, item.id)}
              </button>
            ))}
          </div>
          ) : null}
          {moreOpen ? (
          <div className="flex flex-wrap gap-1 px-1">
            {STATUS_LINES.map((line) => (
              <button
                key={line}
                type="button"
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  presence === line ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
                onClick={() => void setPresenceLine(presence === line ? "" : line, line === "Going to sleep")}
              >
                {line}
              </button>
            ))}
          </div>
          ) : null}
          <QuotaBar status={billing} locale={lang} />
          {error ? (
            <div className="flex items-center justify-between gap-2 px-1">
              <p className="text-sm text-destructive">{error}</p>
              {failedSend ? (
                <Button type="button" size="sm" variant="outline" onClick={() => void send(failedSend, true)}>
                  {t(lang, "retry")}
                </Button>
              ) : null}
            </div>
          ) : null}
          <form
            className={cn(
              "flex items-end gap-2 rounded-[28px] border p-2",
              visual ? "border-white/20 bg-black/40 text-white backdrop-blur-md" : "border-border bg-card",
            )}
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <Button
              type="button"
              variant={speakOn ? "secondary" : "ghost"}
              size="icon"
              aria-label={speakOn ? "Mute voice" : "Unmute voice"}
              disabled={!voiceReady}
              onClick={() => setVoiceChoice((value) => (value === "on" ? "off" : "on"))}
              className={visual ? "text-white hover:bg-white/15" : undefined}
            >
              {speakOn ? <Volume2Icon /> : <VolumeXIcon />}
            </Button>
            {supported ? (
              <Button
                type="button"
                variant={listening ? "secondary" : "ghost"}
                size="icon"
                aria-label="Speak"
                disabled={!voiceReady}
                onClick={toggle}
                className={visual ? "text-white hover:bg-white/15" : undefined}
              >
                <MicIcon />
              </Button>
            ) : null}
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && enterToSend) {
                  event.preventDefault();
                  void send();
                }
              }}
              placeholder={`${t(lang, "message")} ${nickname}`}
              className={cn(
                "min-h-11 flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0",
                visual && "text-white placeholder:text-white/50",
              )}
              disabled={quotaBlocked}
              rows={1}
            />
            <Button type="submit" size="icon" disabled={pending || quotaBlocked || !input.trim()} aria-label={t(lang, "message")}>
              <SendIcon />
            </Button>
          </form>
          {visual ? null : (
          <p className="px-2 text-xs text-muted-foreground">
            {t(lang, "rememberHint")}
          </p>
          )}
        </div>
      </div>
  );

  return (
    <div className={cn(visual ? "flex min-h-0 flex-1 flex-col" : "chat-scene flex min-h-0 flex-1 flex-col")} data-scene={scene}>
      <VoiceReadyDialog
        open={voicePending}
        nickname={nickname}
        locale={lang}
        phase={phase}
        progress={progress}
        error={voiceError}
        onRetry={() => void prepare()}
        onStartWithVoice={() => setVoiceChoice("on")}
        onContinueSilent={() => setVoiceChoice("off")}
      />
      {visual ? (
        <VisualStage
          slug={slug}
          spriteSrc={liveSprite}
          avatarPath={avatarPath}
          lookLock={lookLock}
          nickname={nickname}
          messages={messages}
          showEmotions={showEmotions}
          pending={pending}
        >
          {dock}
        </VisualStage>
      ) : (
      <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-5 pt-12 text-center">
              <CompanionPortrait
                slug={slug}
                avatarPath={avatarPath}
                lookLock={lookLock}
                animated={Boolean(lookLock)}
                width={80}
                height={80}
                className="size-20 overflow-hidden rounded-full"
                alt={nickname}
              />
              <div className="flex flex-col gap-1">
                <h2 className="font-heading text-2xl font-semibold">{nickname}</h2>
                <p className="text-sm text-muted-foreground">{extras.vibe}</p>
                <p className="max-w-sm text-sm leading-6 text-muted-foreground">{t(lang, "rememberHint")}</p>
              </div>
              {showEmotions ? (
                <div className="flex flex-wrap justify-center gap-1.5">
                  <EmotionChip id="blushy" label="blushy" />
                  <EmotionChip id="smile" label="smile" />
                  <EmotionChip id="adore" label="adore" />
                </div>
              ) : null}
              <div className="flex flex-wrap justify-center gap-2">
                {starters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    disabled={pending || quotaBlocked}
                    className="rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-accent"
                    onClick={() => void send(starter)}
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {messages.filter((message) => {
            if (!filter.trim()) return true;
            return message.content.toLowerCase().includes(filter.trim().toLowerCase());
          }).map((message, index) => {
            const lastAssistant = message.role === "assistant" && index === lastAssistantIndex;
            return (
              <div
                key={message.id}
                className={cn(
                  "group flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {message.role === "assistant" ? (
                  <CompanionPortrait
                    slug={slug}
                    avatarPath={lastAssistant ? liveSprite : avatarPath}
                    lookLock={lookLock}
                    expression={
                      lastAssistant ? expressionFromMessage(message.content) : "smile"
                    }
                    width={32}
                    height={32}
                    className="mt-1 size-8 overflow-hidden rounded-full"
                    alt=""
                  />
                ) : null}
                <div
                  className={cn(
                    "max-w-[min(100%,42rem)]",
                    compactChat && "text-sm",
                    message.role === "user" ? "rounded-3xl bg-muted px-4 py-3" : "px-1 py-1",
                  )}
                >
                  {message.role === "assistant" ? (
                    <p className="mb-1 text-sm font-medium">{nickname}</p>
                  ) : null}
                  {message.content ? (
                    showEmotions ? (
                      <RoleplayText
                        content={message.content}
                        tone={message.role === "user" ? "user" : "assistant"}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-7">
                        {stripEmotionMarkup(message.content)}
                      </p>
                    )
                  ) : pending ? (
                    <span className="text-muted-foreground">…</span>
                  ) : (
                    ""
                  )}
                  {message.content ? (
                    <div className="mt-2 flex gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                      {message.role === "assistant" ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Report"
                          onClick={() => void reportLine(message.content)}
                        >
                          <FlagIcon />
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Copy"
                        onClick={() => {
                          void navigator.clipboard.writeText(stripEmotionMarkup(message.content));
                          toast.success(t(lang, "copied"));
                        }}
                      >
                        <CopyIcon />
                      </Button>
                      {lastAssistant ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Regenerate"
                          disabled={pending}
                          onClick={() => void regenerate()}
                        >
                          <RefreshCwIcon />
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Delete"
                        onClick={() => void removeMessage(message.id)}
                      >
                        <Trash2Icon />
                      </Button>
                      {["♥", "🌸", "🌙"].map((mark) => (
                        <Button
                          key={mark}
                          type="button"
                          variant={message.reaction === mark ? "secondary" : "ghost"}
                          size="icon-xs"
                          aria-label={`React ${mark}`}
                          onClick={() => void react(message.id, message.reaction === mark ? "" : mark)}
                        >
                          {mark}
                        </Button>
                      ))}
                      {message.createdAt ? (
                        <span className="self-center px-1 text-[10px] text-muted-foreground">
                          {formatClock(new Date(message.createdAt))}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
      {dock}
      </div>
      )}
    </div>
  );
}
