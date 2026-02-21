# Walkthrough

This document explains how the system was built, what decisions were made, and what was found during testing. It is the written explanation requested in the project assessment.

---

## What was built

An internal voice intake tool. Operators open a browser, log in, click a button, and speak to a voice agent. The agent asks four questions: name, topic, description, and action items. When the session ends, the transcript is automatically processed and stored. The operator sees the new entry in a dashboard table and can update its status.

The system connects four services:
- **Vapi** handles the voice session (speech-to-text, LLM, text-to-speech)
- **n8n** receives the end-of-call webhook, transforms the payload, and inserts it into the database
- **Supabase** provides authentication and a Postgres database
- **Next.js on Cloudflare Pages** serves the frontend

## How it works, step by step

1. Operator visits the app and logs in with email and password. Middleware checks the session cookie on every request and redirects unauthenticated users to the login page.

2. On the dashboard, the operator clicks "Start New Intake." The Vapi Web SDK opens a microphone connection and starts the voice assistant.

3. The assistant follows a scripted 4-question flow. It asks one question at a time and waits for the answer before continuing.

4. When the session ends (operator clicks "End Session" or the agent finishes), Vapi processes the conversation. It generates a summary, extracts structured fields (caller_name, topic, action_items), and sends an `end-of-call-report` webhook to n8n.

5. The n8n workflow has three nodes. The webhook node receives the POST. The code node extracts the relevant fields from the payload and maps them to the database schema. The HTTP request node inserts the row into Supabase via its REST API.

6. After a 5-second delay (to allow the pipeline to complete), the frontend reloads the entries from Supabase and the new row appears in the table.

7. The operator can change the status of any entry from "new" to "in_progress" to "resolved" using the inline dropdown.

## Key decisions

**Browser voice instead of phone.** The assessment says "voice agent" but does not specify the channel. Browser-based voice removes telephony cost entirely and fits the internal tool context. If phone is needed later, the same n8n webhook and database work without changes.

**No email verification.** This is an internal tool. Operators are provisioned by the organization. Requiring email verification adds friction without security benefit. Supabase email confirmation is turned off.

**n8n Cloud for the workflow.** The 14-day trial provides a stable webhook URL with no infrastructure to manage. The workflow JSON is exported and included in the repo (`n8n/workflow.json`) so it can be imported into a self-hosted n8n instance when the trial ends.

**Client-side rendering only.** All pages use `'use client'`. The brief asks for a simple frontend. Client components are straightforward and easy to follow. Server-side rendering adds complexity without meaningful benefit here.

**Text transcript, not audio.** Vapi converts speech to text automatically. Storing the transcript is enough for operators to review what was said. Storing audio would require file storage infrastructure and adds cost.

**Structured data extraction via Vapi analysis.** Since browser sessions have no caller ID metadata, the agent asks for the caller's name directly. Vapi's analysis plan extracts `caller_name`, `topic`, and `action_items` as structured fields from the conversation.

## What was found during testing and what was fixed

**The post-session delay was too short.** The first version used a 3-second timeout after ending a session before refreshing the table. During testing, n8n sometimes took longer to process. The delay was increased to 5 seconds and a "Submitting..." spinner was added so the operator knows the system is working. The proper fix is Supabase Realtime, which would update the dashboard the instant the row is inserted.

**No feedback during Vapi connection.** The first version only had two states: idle and active. When the operator clicked Start, nothing happened visually while the SDK was connecting and requesting microphone permission. This was confusing. Two new states were added: "connecting" (with a spinner) and "submitting" (after session end). The button is disabled during these states to prevent double-clicks.

**Wrong data path in the n8n transform.** The first attempt accessed `$input.first().json.message`, but Vapi wraps the webhook payload inside a `body` field. The n8n execution log showed the actual structure. The path was corrected to `$input.first().json.body?.message` with optional chaining.

**Duplicate Vapi event listeners.** Without careful initialization, each React re-render created a new Vapi instance with its own event listeners. This caused duplicate state transitions. The fix was to create the Vapi instance once using a `useRef` guard in a `useEffect`, and store the `onSessionEnd` callback in a separate ref to avoid stale closures.

**No microphone error feedback.** If the operator denied microphone permission, the original UI showed nothing. An error state was added. Both the `try/catch` around `vapi.start()` and the `vapi.on('error')` handler now set an error message that displays inline next to the button.

**n8n trial expiry.** The 14-day trial will eventually stop the webhook. The workflow was exported as JSON and included in the repo so it can be imported into a self-hosted instance.

## What is not included and why

**No pagination.** This is a v1 with a handful of test entries. Pagination would be added when entry volume grows.

**No row-level security.** The Supabase table is accessible to any authenticated user. For a production deployment, RLS policies should restrict operators to their own entries.

**No audio storage.** Only the text transcript is stored. Audio recording would require a separate storage backend.

**No real-time updates.** The dashboard uses a 5-second delay after session end instead of a live subscription. Supabase Realtime would be the right solution for v2.

## How to verify it works

1. Clone the repo, install dependencies, fill in `.env.local`, run `bun dev`
2. Register an account at `/register`, get redirected to the dashboard
3. Click Start New Intake, allow microphone, speak through the 4 questions
4. Click End Session, wait for the Submitting spinner to finish
5. The new entry appears in the table with status "new"
6. Change the status dropdown to "in_progress" or "resolved"
7. Click Refresh to confirm the status persisted
8. Click Sign out, confirm redirect to login page
9. Visit `/` while signed out, confirm redirect to login

You can also test the n8n pipeline independently with a curl command. See the README for the exact command.
