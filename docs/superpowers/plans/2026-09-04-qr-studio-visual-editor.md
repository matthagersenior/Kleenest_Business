# QR Studio Visual Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the thin Business QR screen with a full visual QR library/editor backed by the existing canonical Kleenest QR runtime while preserving stable printed codes.

**Architecture:** Keep `qr_codes`, `qr_engagement_programs`, `qr_attribution_events`, `qr_redemptions`, and the existing public resolver as the single execution authority. Add typed/versioned customization and action validation, version history, saved templates, and focused mobile editor components. All mutations stay behind server-authorized RPCs; clients never write QR tables directly.

**Tech Stack:** Expo Router, React Native, TypeScript, Supabase Postgres/RPC/RLS, existing Kleenest Business workspace authority, existing QR resolver/attribution/redeem pipeline.

**Spec:** `docs/superpowers/specs/2026-09-04-qr-studio-visual-editor-design.md`

## Global Constraints

- Preserve stable `qr_codes.code` identity when editing an existing QR.
- Do not create a second QR runtime or parallel scan resolver.
- No Business client writes directly to QR tables; mutations use authorized RPCs.
- Raw JSON is never the primary Business editing UI.
- Existing legacy QR codes continue resolving throughout rollout.
- Server validates business/location authority, action payloads, customization schema, lifecycle limits, and external URLs.
- Material QR changes create a version snapshot in the same transaction.
- Scan/readability validation blocks only unsafe activation/export, not harmless draft editing.
- Each rollout wave must leave the existing QR scan runtime functional.

---

### Task 1: Canonical QR schema contracts and history

**Files:**
- Create: `supabase/migrations/<timestamp>_qr_studio_versioning_and_templates.sql`
- Create: `src/domain/qrDesignSchema.ts`
- Test/Audit: `scripts/qr-studio-authority-audit.mjs`

**Interfaces:**
- Produces database tables `qr_code_versions` and `qr_design_templates`.
- Produces TypeScript `QrCustomizationV1`, `QrDesign`, `QrFrame`, `QrActionDraft`, and validation/default helpers used by all later tasks.

- [ ] **Step 1:** Add an audit that fails while `qr_code_versions`, `qr_design_templates`, schema-version validation, and stable-code update semantics are absent.
- [ ] **Step 2:** Run `npm run audit` and verify the new QR Studio authority audit fails for the missing contracts.
- [ ] **Step 3:** Add migration DDL for `qr_code_versions` and `qr_design_templates`, indexes, RLS, immutable system-template rules, and owner/business authority checks using existing canonical membership helpers.
- [ ] **Step 4:** Implement `src/domain/qrDesignSchema.ts` with schema version `1`, defaults, allowed module/eye/frame styles, quiet-zone/logo bounds, safe URL schemes, and typed action-family payload shapes.
- [ ] **Step 5:** Re-run the audit/typecheck and verify the schema contract passes.
- [ ] **Step 6:** Commit the schema-contract wave.

### Task 2: Transactional QR create/update/version RPCs

**Files:**
- Modify/Create migration SQL under `supabase/migrations/`
- Modify: `src/services/qrStudio.ts` (or replace the current thin QR service with this canonical client facade)
- Test/Audit: `scripts/qr-studio-authority-audit.mjs`

**Interfaces:**
- Produces `qr_studio_upsert_asset(...)`, `qr_studio_versions(...)`, `qr_studio_restore_version(...)`, `qr_studio_templates(...)`, and template CRUD RPCs.
- Client facade exports `listQrAssets`, `getQrAsset`, `saveQrAsset`, `listQrVersions`, `restoreQrVersion`, `listQrTemplates`, `saveQrTemplate`, `archiveQrTemplate`.

- [ ] **Step 1:** Extend the audit with unauthorized-workspace, stable-code, invalid-design, invalid-action, and version-history expectations.
- [ ] **Step 2:** Run the audit and confirm those assertions fail before implementation.
- [ ] **Step 3:** Implement server validation helpers for customization/action payloads and authority-resolved business/location references.
- [ ] **Step 4:** Implement one transactional create/update RPC that snapshots the previous/current material configuration and never rotates `code` on edit.
- [ ] **Step 5:** Add version list/restore and template list/create/update/archive RPCs; restore creates a new current version rather than rewriting history.
- [ ] **Step 6:** Wire the typed client facade and convert server errors to actionable Business-facing messages.
- [ ] **Step 7:** Run audit, typecheck, and existing Business CI.
- [ ] **Step 8:** Commit the canonical server API wave.

### Task 3: QR Library and editor shell

**Files:**
- Replace/Refactor: `app/qr-studio.tsx`
- Create: `src/components/qr/QrLibraryScreen.tsx`
- Create: `src/components/qr/QrEditorScreen.tsx`
- Create: `src/components/qr/QrAssetCard.tsx`
- Create: `src/components/qr/QrLivePreview.tsx`
- Create: `src/state/qrEditorDraft.ts`

**Interfaces:**
- `QrLibraryScreen` consumes `listQrAssets` and emits create/edit/duplicate/archive intents.
- `QrEditorScreen` owns a typed `QrEditorDraft` and persists only through `saveQrAsset`.
- `QrLivePreview` accepts `{ code, customization, action, previewMode }` and performs no persistence.

- [ ] **Step 1:** Add a client audit requiring library/editor separation, no direct table writes, stable-code display, zero-location recovery, and unsaved-draft retention.
- [ ] **Step 2:** Confirm the audit fails against the old thin screen.
- [ ] **Step 3:** Implement library cards with preview thumbnail, state, location, action/purpose, last activity, scan/conversion/redemption summaries, filters, and create/edit/duplicate/archive actions.
- [ ] **Step 4:** Implement the editor shell with sticky/collapsible live preview on phone and section navigation for Design, Action, Engagement, Targeting, Lifecycle, Analytics, Preview & Export.
- [ ] **Step 5:** Add draft orchestration so failed saves retain local edits; refreshing canonical data occurs only after successful persistence.
- [ ] **Step 6:** Add zero-location recovery linking directly to the existing find/claim/add-location flow.
- [ ] **Step 7:** Run client audit, typecheck, and CI.
- [ ] **Step 8:** Commit the library/editor-shell wave.

### Task 4: Visual design controls, templates, brand kit, scan readiness

**Files:**
- Create: `src/components/qr/QrDesignPanel.tsx`
- Create: `src/components/qr/QrTemplatePicker.tsx`
- Create: `src/components/qr/QrScanReadiness.tsx`
- Modify: `src/components/qr/QrLivePreview.tsx`
- Modify: `src/services/qrStudio.ts`

**Interfaces:**
- `QrDesignPanel` edits only typed customization fields.
- `QrScanReadiness` returns blocking/non-blocking findings for contrast, quiet zone, logo obstruction, and rendered size.
- Template application is deterministic: template design -> draft customization, with workspace brand-kit values applied only when explicitly selected.

- [ ] **Step 1:** Add tests/audits for every design field, deterministic template application, and unsafe contrast/logo/quiet-zone detection.
- [ ] **Step 2:** Confirm failures before implementation.
- [ ] **Step 3:** Implement foreground/background, safe gradient treatment, module style, eye/corner style/color, quiet zone, output size, frame, CTA/supporting text, alignment/font scale/weight, optional business/location/trust badges.
- [ ] **Step 4:** Implement center logo/image options with bounded size/padding/background plate and business-brand defaults.
- [ ] **Step 5:** Implement system/business template picker and save-current-design-as-template flow.
- [ ] **Step 6:** Implement scan-readiness indicator and block unsafe activation/export while preserving draft edits.
- [ ] **Step 7:** Run audits/typecheck/CI.
- [ ] **Step 8:** Commit the visual-design wave.

### Task 5: Typed action, engagement, targeting, and lifecycle builders

**Files:**
- Create: `src/components/qr/QrActionPanel.tsx`
- Create: `src/components/qr/QrEngagementPanel.tsx`
- Create: `src/components/qr/QrTargetingPanel.tsx`
- Create: `src/components/qr/QrLifecyclePanel.tsx`
- Modify: `src/services/qrStudio.ts`

**Interfaces:**
- Action families map typed UI values to canonical `purpose`, `action_type`, and validated `action_payload`.
- Engagement uses existing `qr_engagement_programs` authority.
- Targeting references canonical business/location/campaign/promotion/event/Fleet/Enterprise IDs and relies on server authorization.
- Lifecycle controls active/draft/schedule/single-use/redemption limit/archive/duplicate/version restore.

- [ ] **Step 1:** Add audits ensuring raw JSON editors are absent and each supported action family yields typed payloads.
- [ ] **Step 2:** Implement typed action forms for check-in, details, review, directions, route add, promotion, contest/game, loyalty/reward, event, reverification/trust mission, premium benefit, Fleet checkpoint, Enterprise campaign, Kleenest deep link, and approved external URL.
- [ ] **Step 3:** Implement engagement program CRUD/editing for XP/points, milestones, streak, badge, challenge/contest, loyalty, coupon/reward, trust mission, check-in milestone, premium reward, and campaign attribution using existing program records.
- [ ] **Step 4:** Implement canonical targeting selectors with server-side authority enforcement.
- [ ] **Step 5:** Implement draft/active/scheduled/single-use/max-redemption/exhausted/archive/duplicate/version-history controls.
- [ ] **Step 6:** Run audits/typecheck/CI.
- [ ] **Step 7:** Commit the behavior/lifecycle wave.

### Task 6: Analytics and export

**Files:**
- Create: `src/components/qr/QrAnalyticsPanel.tsx`
- Create: `src/components/qr/QrExportPanel.tsx`
- Modify: `src/services/qrStudio.ts`
- Add/Modify migration RPC for aggregate library/detail analytics if needed to avoid N+1 requests.

**Interfaces:**
- Analytics consumes canonical attribution/redemption/check-in/progression records only.
- Export consumes the exact stable-code payload + current validated customization and produces scan-safe PNG first; printable PDF follows the same rendered contract.

- [ ] **Step 1:** Add audits for canonical metrics, unavailable-metric labeling, and absence of UI-maintained counters.
- [ ] **Step 2:** Implement aggregate/detail analytics for scans, identifiable unique users, anonymous/authenticated split, check-ins, reviews where attributable, redemptions, conversion, program completion, XP/reward impact, campaign/location/source/time trends, recent activity, and funnel stages.
- [ ] **Step 3:** Implement QR-only, print-card, counter-sign, window/door-sign, poster, and mobile-landing preview modes.
- [ ] **Step 4:** Implement PNG export and printable PDF using the same scan-readiness gate and exact QR payload. Do not add SVG until identical scan behavior is verified.
- [ ] **Step 5:** Run audits/typecheck/CI and physical-size/device scan verification checklist.
- [ ] **Step 6:** Commit analytics/export wave.

### Task 7: Growth/Fleet/Enterprise bulk operations and final verification

**Files:**
- Modify: `src/components/qr/QrLibraryScreen.tsx`
- Modify: `src/services/qrStudio.ts`
- Modify migration/RPC layer for authorized batch operations
- Update: `README.md` QR Studio operator notes

**Interfaces:**
- Batch API performs one logical authorized transaction/request and returns per-asset results.

- [ ] **Step 1:** Add audit requiring truthful partial-failure handling.
- [ ] **Step 2:** Implement apply-template, activate/deactivate, schedule, assign campaign/program, and export-selected bulk actions behind the correct tier/capability gates.
- [ ] **Step 3:** Verify Enterprise template sharing is explicit/revocable and cannot cross unauthorized network boundaries.
- [ ] **Step 4:** Run full Business audit/typecheck/Expo Doctor/Android build.
- [ ] **Step 5:** Verify legacy QR resolver, single-use/max-redemption behavior, stable printed-code behavior, anonymous/authenticated attribution, and old printed code resolving after action change.
- [ ] **Step 6:** Update operator documentation and commit the final QR Studio rollout wave.

## Self-review

- Spec coverage: all Design, Action, Engagement, Targeting, Lifecycle, Versioning, Templates, Analytics, Export, Error Recovery, Security, Bulk, and rollout requirements are mapped to Tasks 1-7.
- Placeholder scan: no implementation task relies on TBD/TODO placeholders.
- Type consistency: client components consume the typed `qrDesignSchema` and `qrStudioService` interfaces established in Tasks 1-2; no direct table-write path is introduced.
- Rollout safety: server compatibility and stable code identity precede visual/client expansion, and every wave retains the existing public resolver.
