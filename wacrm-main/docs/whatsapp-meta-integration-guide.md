# WhatsApp Cloud API: AI Build Blueprint

## Purpose

This is a **build guide for an AI coding agent or developer implementing a similar WhatsApp CRM integration**. It describes the desired behavior, implementation sequence, data responsibilities, and acceptance criteria. It is not a code audit, test report, or proof that another codebase already implements these features.

Give this document to the coding agent together with the target repository. The agent should first inspect that repository, follow its framework/database/authentication conventions, and adapt the design below. Treat route names and table names as suggested interfaces, not requirements to copy blindly.

## 1. High-level architecture

Build the integration with HTTPS requests to the Meta Graph API for operations and a public webhook for asynchronous events. Do not rely on a persistent socket to WhatsApp.

```text
Browser / CRM --authenticated requests--> Next.js server --Graph API HTTPS--> Meta Graph API
                                               |                                  |
                                               | account-scoped reads/writes      |
                                               v                                  |
                                      Supabase (Postgres, RLS)                    |
                                                                                 |
Meta WhatsApp platform --signed webhook POST via Meta App----------------------> Next.js webhook
Meta App ----------------GET webhook verification request----------------------> Next.js webhook
Meta App <---------------challenge response (plain text)------------------------ Next.js webhook
```

Separate the implementation into these responsibilities:

| Capability | What to implement |
|---|---|
| Settings UI | Collect credentials, show connection diagnostics, and allow admins to retry/reset. |
| Connection service | Validate inputs, call Meta, encrypt credentials, and persist account state. |
| Webhook service | Verify GET handshakes and POST signatures, route events to the right account, and process idempotently. |
| Graph API client | Centralize Meta requests, auth headers, API version, response parsing, and error handling. |
| Message service | Send messages, persist Meta IDs, and reconcile asynchronous receipts. |
| Template service | Submit/edit/delete templates, synchronize the local catalog, and process lifecycle events. |

Choose and consistently use a supported Graph API version for every Meta request.

## 2. Meta and CRM configuration scopes

For a multi-account CRM, keep one WhatsApp configuration per CRM account while Meta App settings are deployment-wide.

| Value | Scope / storage | Notes |
|---|---|---|
| Phone Number ID | Per CRM account, `whatsapp_config.phone_number_id` | Numeric Meta ID, not the visible phone number. Unique across CRM accounts. |
| WABA ID | Per CRM account, `whatsapp_config.waba_id` | Must actually own the selected Phone Number ID. |
| Access token | Per CRM account, encrypted in `whatsapp_config.access_token` | Used as a Bearer token for Graph API calls. The service decrypts it server-side. |
| Webhook verify token | Per CRM account, encrypted in `whatsapp_config.verify_token` | Shared secret for Meta's one-time GET webhook verification handshake. It is not the POST signature secret. |
| Two-step verification PIN | Entered for a save; not stored as the access credential | Used for the phone-number `/register` call. |
| Meta App Secret | Deployment environment: `META_APP_SECRET` | HMAC verification secret for webhook POSTs. A comma-separated list is supported for multiple Meta Apps. |
| Meta App ID | Deployment environment: `META_APP_ID` | Used for app-scoped resumable media uploads for template media headers; it is a single value. |
| Encryption key | Deployment environment: `ENCRYPTION_KEY` | Must remain stable across deployments that read the same database ciphertext. |

Do not put the Meta App Secret, access tokens, encryption key, or PIN in browser code or logs. Configure deployment-specific values through server-side environment configuration.

One WABA may contain multiple numbers and multiple CRM accounts may connect different numbers. Prevent one Phone Number ID from being claimed by two CRM accounts. For deployments using WABAs from different Meta Apps, configure the same callback URL for each app and accept each app's secret; see [multi-WABA setup](./multi-waba.md). Template media uploads may require the matching Meta App ID, so account tokens from unrelated apps can have limitations.

## 3. What “connected” means (and does not mean)

Do not model connection as a Meta webhook event: Meta does not send a general “this CRM account is connected” or “disconnected” event. Compute credential health by calling Meta, and show phone registration and WABA subscription as separate readiness checks.

### Connection test: credentials/API reachability

Provide a connection-test endpoint that loads the account's row, decrypts its token, and calls `GET /{phone_number_id}` on Graph API.

- No account or config row: returns `connected: false` with a reason such as `no_account` or `no_config`.
- Token cannot be decrypted: returns `connected: false`, `reason: token_corrupted`, `needs_reset: true`. This commonly means the deployment is using a different `ENCRYPTION_KEY` from the one that encrypted the row.
- Meta rejects the token or the phone lookup: returns `connected: false`, `reason: meta_api_error`, with Meta error details when available.
- Phone lookup succeeds: returns `connected: true` and phone metadata. It then tries to inspect the WABA's subscribed apps. This subscription lookup is best-effort; its failure does not turn a valid phone credential check into disconnected.

Label this result “Credentials valid” / “Not connected.” This API check should not be treated as proof that inbound messages can reach the webhook.

### Webhook readiness: phone registration and WABA subscription

Provide a separate registration diagnostic endpoint that performs three checks:

1. `phone_metadata_ok`: can the saved token read the Phone Number ID?
2. `waba_subscribed_to_app`: does `GET /{waba_id}/subscribed_apps` return at least one app?
3. `locally_marked_registered`: is `whatsapp_config.registered_at` non-null?

`live` is true only when all three checks pass. The registration check is a **local timestamp marker** set after this server successfully calls `/register`; it is not a fresh Meta query of the number's registration state. The subscription check in this diagnostic treats a non-empty app list as success. The normal connection GET also reports whether the configured `META_APP_ID` specifically appears in the list, when that environment variable is set.

Show credential validity and webhook readiness separately. Typical states:

| Credentials/API check | Registration marker | WABA subscribed | Meaning |
|---|---|---|---|
| Fails | Any | Any | Not connected at the credential/API level; fix token, ID, permissions, encryption key, or Meta-side restriction. |
| Passes | No | Yes | Credentials are valid, but the phone registration step has not been recorded. Inbound delivery may not be wired to this app. |
| Passes | Yes | No | Credentials and local phone-registration marker exist, but Meta may not deliver webhooks for this WABA to this app. |
| Passes | Yes | Yes | Locally recorded live setup; still verify callback URL, verify token, subscribed webhook fields, and matching App Secret if events do not arrive. |

If the dashboard has a phone-health endpoint, keep its states distinct: `unavailable` means the Meta health lookup failed; `disconnected` means there is no usable saved config. Do not conflate this with a live credential test.

## 4. Saving or changing a connection

Create a connection-save endpoint (for example, `POST /api/whatsapp/config`). Require an authenticated account admin and apply an appropriate rate limit.

### Validation and Meta checks

1. Require an access token and Phone Number ID. Phone Number ID and an optional WABA ID must be digit-only Meta IDs. An optional PIN must be six digits.
2. Check that a different CRM account has not already claimed the Phone Number ID.
3. Call `GET /{phone_number_id}` to validate that the token can read the phone.
4. If a WABA ID is supplied, call `GET /{waba_id}/phone_numbers` and verify the phone is actually listed under that WABA. This catches valid-but-mismatched IDs before saving.
5. Encrypt the access token and verify token on the server. If the verify-token field was left blank, retain the already stored encrypted token rather than clearing it.
6. Attempt phone registration when this is a new/different number or when a PIN is explicitly supplied:
   - With a PIN: `POST /{phone_number_id}/register` with `{ messaging_product: "whatsapp", pin }`.
   - A success records `registered_at`. Meta's “already registered” response is treated as success.
   - Without a PIN: registration is skipped. This allows Meta developer test numbers to be saved, but leaves `registered_at` unset for a first-time registration; the UI presents the registration warning.
   - If registration fails, the credentials are still saved so the user can retry. The row is marked `disconnected`, `registered_at` is cleared, and `last_registration_error` is persisted and displayed.
7. If a WABA ID exists, call `POST /{waba_id}/subscribed_apps`. It is idempotent and is attempted on every save. A failure is returned to the user and the new config is not persisted.
8. Insert/update the one row for that CRM account. On a normal save, `status` becomes `connected` and `connected_at` is set. `subscribed_apps_at` records the successful subscription attempt.

Registration is intentionally not repeated with a stale PIN on every save: if the same number already has `registered_at` and no new PIN is provided, the registration call is skipped. Entering a fresh PIN explicitly retries `/register`.

Meta call failures include the failed step, field hint, Graph API error code/subcode, and `fbtrace_id` where Meta supplies it. The troubleshooting guide documents common errors and their likely fixes: [WhatsApp connection troubleshooting](./whatsapp-connection-troubleshooting.md).

### Reset behavior

Provide a reset operation that removes the account's local config row, especially when encrypted credentials cannot be decrypted. Do not imply that this removes the number from Meta or deletes local templates/messages; document those as separate operations if needed.

### Access control and tenancy

Require an admin role for connection settings and template administration, and an agent-or-higher role for sending. Scope all business data by `account_id`; retain the acting user as an audit field. Webhooks have no user session, so use a server-only privileged database client and resolve the tenant from Phone Number ID (message events) or WABA ID (template events).

## 5. Webhook setup, verification, and routing

Configure each Meta App's WhatsApp webhook callback as a public HTTPS URL, for example:

```text
https://<your-host>/api/whatsapp/webhook
```

Subscribe the app to the `messages` webhook field for incoming messages and delivery receipts. For template lifecycle updates, also subscribe to each of:

- `message_template_status_update`
- `message_template_quality_update`
- `message_template_components_update`

The template fields must be toggled in Meta App Dashboard → WhatsApp → Configuration → Webhooks. The application cannot subscribe these fields through the Cloud API. Without them, the manual “Sync from Meta” button is the fallback for template state.

### GET handshake (verify token)

Meta sends a GET request with `hub.mode`, `hub.verify_token`, and `hub.challenge`.

- The route requires `hub.mode=subscribe` and both token and challenge.
- It decrypts configured accounts' stored verify tokens and timing-safely compares them with the presented token.
- On a match, it returns the challenge as plain text with HTTP 200.
- Missing parameters, lookup errors, or a token mismatch are rejected.

The verify token is for proving webhook endpoint ownership during setup. It does **not** authenticate webhook POST deliveries.

### POST signature verification and acknowledgement

For each POST, read the raw, size-capped body and verify `X-Hub-Signature-256` as an HMAC-SHA256 signature using the configured Meta App Secret. For multiple Meta Apps, accept a signature matching any explicitly configured secret. If no secret is configured or the signature is absent/invalid, fail closed. Reject oversized payloads.

After signature verification and JSON parsing, acknowledge Meta promptly, then process the payload using a runtime-supported background-after-response mechanism or a durable queue. Do not use an untracked floating promise on serverless hosting. Log processing failures and design for retries/idempotency.

### Payload routing

- Message and delivery-status events include `metadata.phone_number_id`. The webhook finds exactly one `whatsapp_config` row for that ID and uses its `account_id` to scope writes.
- Missing or duplicate config matches are logged; the affected events are skipped rather than written to an uncertain tenant.
- Template lifecycle events use the webhook entry's WABA ID and are sent to the dedicated template handler.
- Inbound message IDs are used as an idempotency key. A retried webhook delivery does not duplicate the message, unread increment, automation, or other downstream event work.
- Inbound messages are matched to or create a contact and conversation, stored as customer messages, and update the conversation preview/unread count. The webhook then hands eligible new inbound events to the configured flows, automations, AI reply, broadcast-reply tracking, and public webhook delivery paths. Inbound media may be fetched from Meta and mirrored depending on the account's media setting.

## 6. Outbound messages and Meta delivery statuses

Build an authenticated send operation that validates the request, checks role and rate limits, resolves an account-scoped conversation/contact, and delegates to a shared send service.

1. Load the conversation, contact, and account's WhatsApp config; decrypt its access token.
2. Send through `POST /{phone_number_id}/messages` using the relevant Graph API message type: text, media, approved template, or interactive. The helpers set `messaging_product: "whatsapp"` and Bearer authorization. A phone-recipient retry is available for specific recipient-not-allowed errors; WhatsApp business-scoped user IDs are handled as a distinct recipient type.
3. Meta returns a WhatsApp message ID (`wamid`). The application persists the message locally with `status: sent`, stores the `wamid` as `messages.message_id`, and updates the conversation preview. “Sent” means Meta accepted the API send request; it is not proof of delivery or reading.
4. Meta later sends `statuses` entries through the webhook. A status contains the `wamid`, status, timestamp, recipient, and (for failures) error details. The webhook uses Phone Number ID to determine the account and `wamid` to find the stored message.
5. Receipt updates move forward through `sending → sent → delivered → read`. `failed` is accepted from `sending` or `sent`; a failed/read state is not moved backward by a late or duplicate event. Failure code/title/details are retained.
6. The same receipt is mirrored to broadcast-recipient rows by `wamid`, which updates broadcast aggregates, and relevant status events are fanned out to account webhooks.

Meta can deliver a receipt before the local send row has been committed. Such a receipt is parked in `pending_message_statuses` and applied after the send row is inserted; stale pending statuses are pruned after 24 hours. This prevents a fast receipt from being lost during the API/database timing gap.

Inbound messages are stored as `delivered` in the local message table, but this is not an outbound delivery receipt. A conversation's status (`open`, `pending`, `closed`) is also unrelated to the WhatsApp API connection or a message's Meta delivery status.

## 7. Message template lifecycle

Templates are WABA-level Meta objects and locally cached in `message_templates`, scoped to the CRM account. Admins can submit, edit/resubmit, delete, and sync them from the Settings template manager.

### Submit

Build a template-submit operation that validates the name, language, category, components, variables, and buttons. For a media header, obtain a Meta resumable-upload handle first. Then call `POST /{waba_id}/message_templates`, capture Meta's template ID/status, and upsert the local row. Save failed submissions locally as `DRAFT` with a visible submission error so they can be corrected and retried. A successful submission is normally `PENDING` while Meta reviews it.

### Edit, resubmit, and delete

- The edit operation should only permit templates in editable states such as `APPROVED`, `REJECTED`, or `PAUSED`. Send the full component replacement to Meta; after acceptance, mark the local row `PENDING` for review.
- The delete operation should delete remotely first, scoped to a single language variant, then remove the local row. Local-only rows skip the Meta call. Treat a Meta 404 as already deleted.
- Submit/edit/delete and sync are admin-only because the operation changes remote Meta state as well as local data.

### Manual “Sync from Meta”

Build a manual sync operation that reads the configured WABA's `/{waba_id}/message_templates` endpoint, follows pagination with a safe limit, and maps Meta fields into local rows:

- Match key: `account_id + name + language`.
- Imported fields include Meta template ID, status, category, language, header/body/footer, supported buttons, examples, and quality score.
- Status is stored in Meta-like uppercase form: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `PAUSED`, `DISABLED`, `IN_APPEAL`, or `PENDING_DELETION`. `PENDING_REVIEW` is normalized to `PENDING`; unknown values also fall back to `PENDING`.
- The sync updates matching rows and inserts missing rows. It does **not** delete local rows absent from Meta; locally created rows and drift remain visible.
- Per-template database errors are returned in the response. A page-cap result reports `truncated: true`.

### Automatic template webhook updates

When the three template webhook fields are enabled:

- Status events update status by `meta_template_id`; rejection reasons are stored on `REJECTED` and cleared on approval or pending review.
- Quality events update `quality_score` (`GREEN`, `YELLOW`, `RED`, or null).
- If a status/quality event refers to a template with no local row, the handler tries to resolve the account from the event's WABA ID and creates a minimal stub. Run manual sync to fill in its components and other details.
- Component-change events are logged but do not rewrite the local components automatically. Manual sync pulls the updated content so an unnoticed Meta-side modification does not silently overwrite what users see.

## 8. Invalid, disconnected, and “connected but not receiving” cases

| Symptom | Likely layer / meaning | What to check |
|---|---|---|
| Save rejects a phone ID/WABA ID before Graph API | Local validation | Use the numeric Phone Number ID and WABA ID, not the phone number, a URL, or display name. |
| Graph API error 190 or token validation failure | Credential | Generate/replace a valid System User access token; check expiry/revocation and permissions. |
| Permission error (often code 10/200-series) | Token/business asset access | Grant `whatsapp_business_management` and `whatsapp_business_messaging` as needed, and assign the System User to the WABA. |
| Phone metadata works but WABA check fails | Wrong WABA or WABA access | Confirm that Meta lists this Phone Number ID under the entered WABA and that the token can access it. |
| Registration status says not registered | `/register` absent, skipped, or failed | Enter the correct six-digit two-step PIN and save; check the saved registration error. Test numbers may not use this PIN path. |
| Credentials valid, WABA unsubscribed | Meta App subscription missing | Save again with a token that can subscribe the WABA; check `subscribed_apps` diagnostics. |
| Save works but inbound events never arrive | Webhook setup/registration/signature | Confirm `/register`, WABA subscription, callback URL, verify token, `messages` field subscription, HTTPS reachability, and that this app's secret is in `META_APP_SECRET`. |
| Webhook returns 401 | POST HMAC check failed | Ensure `META_APP_SECRET` matches the Meta App that owns the WABA. In multi-app setups include every app secret. |
| Messages arrive but template status does not change | Template webhook field not enabled | Toggle all three template lifecycle fields in Meta Dashboard or use “Sync from Meta.” |
| Dashboard health shows unavailable | Health API request failed | Check logs, token/permissions, outbound network to Graph API, and Meta availability. This is distinct from a definite disconnected state. |

The connection row's `registered_at` is an application-side success marker, not a permanent guarantee from Meta. If changing numbers or recovering a migrated legacy row, use the verification diagnostics and successfully register the intended number rather than relying solely on an old timestamp. Similarly, a connected credential check is not a webhook delivery test.

## 9. Data model and migration approach

| Table | What it tracks |
|---|---|
| `whatsapp_config` | Per-account Phone Number ID, WABA ID, encrypted access/verify tokens, local connection state and timestamps, registration error, and media mirroring preference. |
| `messages` | Inbound/outbound conversation messages, Meta `wamid`, message type/content, and local delivery status/error details. |
| `pending_message_statuses` | Receipts that arrived before the corresponding outbound message row. |
| `message_templates` | Account-scoped template catalog, Meta ID, status, quality, components, examples, and submission/rejection errors. |
| `broadcast_recipients` | Per-recipient broadcast delivery/read/failure state, linked to the Meta message ID. |
| `contacts`, `conversations` | Tenant-scoped sender identity and inbox thread state. |

Use migrations to add and evolve these records, tenant keys, uniqueness constraints, indexes, and row-level access policies. Keep each migration safe to apply and ensure existing data can be backfilled before enforcing new constraints.

## 10. Implementation sequence for an AI coding agent

Give the coding agent the following sequence and require it to inspect the target repository before making changes:

1. **Map the target app.** Identify its framework, authentication, account/tenant model, database conventions, migrations, UI patterns, test runner, and existing Meta integration. Reuse existing patterns; do not assume this project's paths or stack apply.
2. **Design the data model.** Define account-scoped WhatsApp configuration, encrypted credentials, registration/subscription state, messages with Meta IDs and statuses, pending early receipts, and templates with Meta IDs/status/components. Add appropriate uniqueness, indexes, tenant scoping, and access policies.
3. **Implement the Meta client.** Centralize Graph API versioning, Bearer auth, request/response types, pagination, structured error parsing, and trace IDs. Keep all secrets server-side.
4. **Implement connection setup and diagnostics.** Validate IDs and permissions, verify phone-to-WABA ownership, encrypt and save credentials, register the number when required, subscribe the WABA, and report credential validity separately from webhook readiness.
5. **Implement the webhook boundary.** Add the GET verification handshake, fail-closed raw-body HMAC validation for POSTs, prompt acknowledgement, payload-size limits, tenant resolution, idempotency, and reliable event processing.
6. **Implement message send and receive.** Persist sends with Meta's `wamid`; parse inbound messages into tenant-scoped contacts/conversations; apply delivery/read/failure receipts monotonically; handle receipts that arrive before the send record.
7. **Implement templates.** Add validation, submit/edit/delete, catalog sync with pagination, status normalization, and optional webhook-driven status/quality updates. Preserve local-only rows and provide a sync path for components Meta changes.
8. **Build the user experience.** Provide masked credential fields, clear save/test/reset actions, distinct credential and registration indicators, actionable Meta errors, template statuses, and sync feedback.
9. **Validate in layers.** Add focused unit tests for status transitions, token/signature checks, ID pairing, and template mapping; route tests for success/failure states; then run the repository's typecheck, lint, and relevant test commands.
10. **Report the result.** Summarize changed files, migration/setup steps, environment variable names (never values), tests actually run and their outcomes, and any remaining Meta Dashboard actions.

## 11. Acceptance checklist

A similar implementation is ready for handoff when:

- Invalid IDs, wrong phone/WABA pairing, invalid/expired tokens, missing permissions, and Meta API errors produce actionable failures without exposing credentials.
- Credentials are encrypted at rest, and a changed encryption key is detected as an unrecoverable credential-read problem rather than silently treated as a valid connection.
- “Credentials valid” is distinct from “number registered” and “WABA subscribed”; diagnostics show which check failed.
- A webhook GET handshake succeeds only for a configured verify token; POSTs fail closed for absent/invalid signatures.
- A valid message webhook is routed to exactly one tenant and duplicate deliveries do not duplicate messages or downstream effects.
- Outbound sends persist the Meta `wamid`; later delivered/read/failed receipts update the correct message and do not regress state.
- Early receipts are reconciled after the send row is persisted.
- Templates can be submitted, reviewed, edited/resubmitted where allowed, deleted, and synchronized from Meta without deleting local-only templates.
- Template status/quality events update local records when subscribed; manual sync repairs missing or stale template data.
- Admin/agent permissions, tenant isolation, operational setup steps, and test evidence are documented for the target repository.
