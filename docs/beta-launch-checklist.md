# Fembo closed beta launch checklist

Use this checklist when inviting the first **20–50 users** from **2–3 target communities**. Keep the beta private until go/no-go metrics are reviewed after **30 days**.

## Before invite

- [ ] Production env validated (`DATABASE_URL`, auth, OpenRouter, storage, payment provider, webhooks).
- [ ] `ADMIN_EMAILS` set in production for `/app/admin/metrics` access.
- [ ] Privacy policy and terms published; support contact reachable.
- [ ] No autopost bots enabled. Reddit prohibits automated promotional spam; X/Threads allow official scheduled publishing only—not mass identical posts or unsolicited replies.

## Invite cohort (20–50 users)

- [ ] Invite from 2–3 communities where the companion use case is already understood.
- [ ] Give each cohort a distinct UTM or invite code if you need source comparison later.
- [ ] Cap invites so support and provider costs stay predictable during the first month.
- [ ] Tell testers this is a closed beta: feedback channel, known limits, and no guarantee of data permanence beyond export/delete.

## What we measure (30-day go/no-go)

Review metrics on `/app/admin/metrics` (dev) or production with `ADMIN_EMAILS`.

| Metric | Target | Source |
| --- | --- | --- |
| Provider success | ≥ 98% | `UsageLedger` completed vs failed |
| First-token p95 | ≤ 4 s | `UsageLedger.latencyMs` p95 |
| Signup → first chat | ≥ 40% | `AnalyticsEvent`: `signup` → `first_chat` |
| Signup → 10 messages | ≥ 25% | `AnalyticsEvent`: `signup` → `10_messages` |
| D7 retention | ≥ 15% | `AnalyticsEvent`: `d7_return` / signups |
| Paid cohort margin | Positive | Plus revenue vs `UsageLedger` cost for paid users |

### Decision rules

- **Go (iterate toward wider beta):** D7 ≥ 15%, signup→10 messages ≥ 25%, provider success ≥ 98%, paid cohort margin positive.
- **Hold (fix companion quality first):** D7 below 10% or signup→first chat below 25%.
- **Do not buy traffic** until retention and unit economics pass the table above.

## Privacy guardrails

Analytics events are first-party only. Tracked names:

`signup`, `first_chat`, `10_messages`, `visual_open`, `call_start`, `d1_return`, `d7_return`, `quota_hit`, `checkout_start`, `paid`, `cancel`, `provider_error`.

**Never** store message text, prompts, transcripts, or snippets in analytics metadata.

## ContentDraftQueue (after retention passes)

Only enable organic growth tooling **after** the 30-day metrics pass. Do not run an autonomous reply bot.

1. Agent prepares **3–5 distinct drafts per week** (copy + optional visual references).
2. **Human approves** every post before publish.
3. Publish via **official APIs** only to your own X/Threads accounts.
4. **Reddit:** manual posts per subreddit rules—no cross-post spam.
5. Tag links with UTM; compare **signup → 10_messages**, not vanity likes.

## Weekly beta ops

- [ ] Check admin metrics and provider error rate.
- [ ] Triage P0/P1 bugs from feedback.
- [ ] Review quota hits and cost caps for outliers.
- [ ] Confirm no third-party ad SDKs in chat surfaces.
- [ ] Export a backup before schema or billing changes.

## Exit criteria

- [ ] 30-day metrics reviewed with written go/no-go note.
- [ ] Top retention blockers either fixed or explicitly deferred.
- [ ] If go: plan ContentDraftQueue with human approval; if no-go: narrow scope to companion chat quality before any paid acquisition.
