# Kleenest QR Studio Visual Editor Design

Date: 2026-09-04
Status: Approved direction; implementation requires plan after spec review

## Purpose

Replace the current thin QR Studio with a full visual QR design, behavior, engagement, lifecycle, and analytics workspace for Business, Fleet, and Enterprise use cases while preserving one canonical Kleenest QR authority.

A printed QR must remain useful after deployment. The encoded Kleenest code stays stable; design metadata, destination behavior, campaigns, rewards, targeting, and lifecycle rules can evolve server-side without requiring the business to reprint the code unless it explicitly chooses to create a new asset.

## Product principles

1. **One QR authority.** Reuse `qr_codes`, `qr_engagement_programs`, `qr_attribution_events`, `qr_redemptions`, existing Business QR RPCs, and the public resolver. Do not create a competing QR runtime.
2. **Visual first.** Editing should feel like a compact Canva-style studio rather than a database form.
3. **Stable printed identity.** Editing a QR does not silently rotate its code.
4. **Behavior is dynamic.** The same QR can be redirected between supported Kleenest actions through its canonical action configuration.
5. **Business-safe authority.** Every mutation remains server-authorized by Business/Fleet/Enterprise scope.
6. **Analytics are canonical.** Studio metrics come from attribution/redemption/check-in/progression events, never UI-maintained counters.
7. **Graceful tiering.** Standard users can design and operate core QR assets; Growth/Fleet/Enterprise features add targeting, advanced programs, automation, bulk operations, and cross-business analytics without creating separate products.

## Existing canonical foundation

`qr_codes` already provides:
- `business_id`
- `location_id`
- stable `code`
- `label`
- `active`
- `purpose`
- `action_type`
- `action_payload jsonb`
- `customization jsonb`
- `single_use`
- `max_redemptions`

`qr_engagement_programs` already provides program type, name, description, trigger count, reward configuration, active state, and start/end times.

`qr_attribution_events` already links QR activity to business, location, user, campaign, promotion, engagement program, source, action type, and metadata.

`qr_redemptions` already records redemption events.

Existing server functions already support custom QR creation/update, activation, customization, public landing resolution, attribution, redemption, single-use consumption, and QR engagement programs.

## Studio information architecture

The QR Studio becomes two primary surfaces.

### 1. QR Library

The library is the operational home for all QR assets in the selected workspace.

Each asset card shows:
- live preview thumbnail
- label and purpose
- location / campaign / program associations
- active, scheduled, paused, archived, or exhausted state
- scans, conversions, redemptions, and last activity
- single-use / redemption-limit status
- design/template identity

Library actions:
- create
- edit
- duplicate
- activate/deactivate
- archive
- preview public landing
- export/download
- inspect analytics
- select multiple assets for supported bulk actions

Filters:
- location
- purpose/action
- state
- campaign
- promotion
- engagement program
- template
- date/activity

### 2. Visual Editor

The editor keeps a persistent live preview visible while the user moves through these sections:

- Design
- Action
- Engagement
- Targeting
- Lifecycle
- Analytics
- Preview & Export

On phone, the live preview can collapse to a sticky compact preview and expand full-screen. On tablet/web, preview and controls can use a split layout.

## Design editor

### Core appearance controls

- foreground color
- background color
- optional gradient/background treatment where QR readability remains safe
- module/dot style
- finder-eye/corner style
- finder-eye color
- inner-corner style
- quiet-zone/padding
- QR size and export resolution
- border/frame style
- frame color
- frame radius
- CTA label above or below code
- supporting text
- text alignment
- font scale/weight using app-safe fonts
- optional business/location name
- optional trust/check-in/reward badges

### Logo and imagery

- business logo in QR center
- Kleenest mark
- approved uploaded image/media asset
- logo size and padding
- optional logo background plate

The renderer must enforce error-correction/readability constraints. If a logo or styling choice would make a code unsafe to scan, the editor warns and constrains it rather than exporting an unreliable code.

### Templates

System templates include:
- Kleenest Check-in
- Review this restroom
- Claim / verify this location
- Trust mission
- Promotion / coupon
- Loyalty / repeat visit
- Contest entry
- Event entry
- Directions / route stop
- Fleet service checkpoint
- Enterprise campaign
- Minimal brand
- High-visibility window sign

Businesses can save a design as a reusable workspace template. Enterprise can publish approved templates to member businesses where policy permits.

### Brand kit

The editor can seed colors/logo from the selected Business profile. Saved brand-kit choices should be reusable without copying raw styling values by hand on every QR.

## Live preview and QR rendering

The preview renders the exact QR payload produced for the stable Kleenest code, then applies the current visual design around it.

Preview modes:
- QR only
- print card
- counter sign
- door/window sign
- poster
- mobile landing preview

The preview must show a scan-readiness indicator based on contrast, quiet zone, logo obstruction, and rendered size.

Export formats should include PNG and printable PDF first. SVG can be added when the chosen QR renderer can preserve identical scan behavior across platforms.

## Action builder

The Action section configures canonical `purpose`, `action_type`, and validated `action_payload`.

Supported action families:
- check in
- open full location details
- leave a review
- open directions
- add location to route
- promotion/coupon redemption
- contest/game entry
- loyalty/reward progress
- event entry
- restroom verification / reverification
- trust mission
- premium benefit redemption
- Fleet service/checkpoint action
- Enterprise campaign action
- supported Kleenest deep link
- approved external/custom URL where policy permits

The editor uses typed forms for each action family. Raw JSON is never the primary Business UI.

Changing an action updates server-side behavior for the stable QR code. The system records a version snapshot before material behavior changes.

## Engagement program builder

A QR can have zero, one, or multiple active engagement programs where the backend supports it.

Program types include:
- XP/points award
- visit milestone
- streak
- badge
- contest/challenge progress
- loyalty threshold
- coupon/reward unlock
- trust mission
- check-in milestone
- premium reward
- campaign attribution

Controls include:
- program name/description
- trigger count
- reward type/value
- start/end schedule
- active state
- per-user limits when supported
- audience/tier constraints when supported

Existing `qr_engagement_programs.reward_config` remains the flexible canonical configuration envelope, with validation at the RPC boundary.

## Targeting

Targeting ties the QR to canonical context instead of duplicating audience systems.

Scopes can include:
- location
- selected Business
- campaign
- promotion
- event
- Fleet route/service context
- Enterprise partner network
- consumer membership/premium eligibility where authorized

Enterprise and Fleet targeting must use their existing authorization models. A QR must never gain access to a business/location merely because a client submits its ID.

## Lifecycle controls

Controls:
- draft/save without activation
- active/inactive
- scheduled start
- scheduled end
- single use
- max redemptions
- exhausted state
- archive
- duplicate as new code
- version history
- restore a prior configuration as a new version

Editing an existing QR preserves its code unless the user explicitly chooses **Duplicate as new QR**.

Archived QRs remain historically attributable and visible in analytics but are excluded from normal active-library views.

## Version history

Add a canonical version-history table rather than overloading attribution events.

Proposed table: `qr_code_versions`
- `id uuid`
- `qr_code_id uuid`
- `business_id uuid`
- `version integer`
- `snapshot jsonb`
- `change_summary text`
- `created_by uuid`
- `created_at timestamptz`

The snapshot stores design, purpose/action, payload, lifecycle flags, and relevant program references at the time of change. It must not store secrets.

Version creation happens server-side in the same transaction as material QR updates.

## Saved templates

Add a small canonical template table rather than copying templates into client code only.

Proposed table: `qr_design_templates`
- `id uuid`
- `owner_business_id uuid null` for system templates
- `name text`
- `description text`
- `design jsonb`
- `default_action jsonb null`
- `scope text` (`system`, `business`, `enterprise_network`)
- `active boolean`
- `created_by uuid null`
- timestamps

System templates are readable by eligible users. Business templates are manageable only by authorized workspace members. Enterprise-shared templates require explicit network authority.

## Customization schema

Continue using `qr_codes.customization jsonb`, but formalize a versioned schema.

Example top-level shape:

```json
{
  "schema_version": 1,
  "design": {
    "foreground": "#132b21",
    "background": "#ffffff",
    "module_style": "rounded",
    "eye_style": "rounded",
    "quiet_zone": 4,
    "logo": {"source": "business", "url": null, "scale": 0.18}
  },
  "frame": {
    "style": "rounded-card",
    "cta": "Scan to check in",
    "supporting_text": null
  },
  "brand": {
    "use_business_logo": true,
    "template_id": null
  }
}
```

The server validates known fields, allowed ranges, and safe URL/media references. Unknown future fields can be preserved when schema-version compatibility allows it.

## Analytics workspace

Per QR and aggregate analytics:
- total scans
- unique users where identifiable
- anonymous vs authenticated activity
- check-ins
- reviews started/completed where attribution exists
- redemptions
- conversion rate
- engagement-program completions
- XP/points/reward impact
- campaign/promotion attribution
- location performance
- source/channel performance
- time-of-day/day-of-week trends
- recent activity
- active vs inactive comparison
- funnel from scan → action → conversion

Business analytics use existing canonical attribution events and relevant downstream records. The UI should label metrics that cannot be causally attributed rather than inventing certainty.

## Bulk operations

Growth/Fleet/Enterprise can support safe bulk actions after single-asset editing is stable:
- apply template
- activate/deactivate
- schedule
- assign campaign/program
- export selected

Bulk operations call one server-authorized transaction/RPC per logical batch and return per-asset results. The client must not pretend partial failures succeeded.

## Error handling and recovery

- No active Business location: provide a direct **Find / claim / add location** recovery path.
- Failed save: keep unsaved editor state locally and display the server error without discarding work.
- Invalid design/readability: block export/activation only when scan safety would be compromised; explain which control must change.
- Unauthorized target: show a scoped authority error, never silently drop the target.
- Expired/exhausted QR: preview shows the actual public response state.
- Offline editing: local draft may be retained, but activation/publishing requires confirmed server persistence.
- Partial analytics failures: render available panels and clearly mark unavailable metrics.

## Components and boundaries

Keep components focused:

- `QrLibraryScreen` — discovery, filtering, bulk selection
- `QrEditorScreen` — editor shell and draft orchestration
- `QrLivePreview` — canonical visual preview
- `QrDesignPanel` — visual controls only
- `QrActionPanel` — typed action builder
- `QrEngagementPanel` — programs/rewards
- `QrTargetingPanel` — canonical associations
- `QrLifecyclePanel` — status/scheduling/limits/versioning
- `QrAnalyticsPanel` — canonical analytics
- `QrExportPanel` — scan validation and export
- `qrStudioService` — typed client interface to canonical RPCs
- `qrDesignSchema` — client-side types/defaults matching server validation

No component directly writes Supabase tables. Mutations flow through server-authorized RPCs.

## Data flow

1. User selects Business workspace.
2. Library loads Business locations, QR detail, lifecycle state, and summarized analytics.
3. User creates or opens a QR.
4. Editor hydrates a typed draft from canonical QR fields and customization schema.
5. Every control updates the local draft and live preview immediately.
6. Save calls one canonical create/update RPC.
7. Server validates authority, target references, action schema, design schema, and lifecycle constraints.
8. Server stores version snapshot and QR update transactionally.
9. Client refreshes canonical QR + analytics state.
10. Public scans continue resolving through the existing stable-code resolver.

## Server changes

Prefer extending existing RPCs over creating parallel APIs.

Required server work:
- validation helper for QR customization schema
- validation helper for action payload by `action_type`
- transactional create/update RPC that writes version history
- list/get version history RPC
- restore-version RPC that creates a new current version rather than rewriting history
- template CRUD/list RPCs with Business/Enterprise authority
- optional aggregate QR library analytics RPC to avoid N+1 mobile requests
- lifecycle scheduling support if current active/start/end semantics are insufficient

Existing public scan/attribution/redeem functions remain the execution backbone.

## Security

- All mutation RPCs require an authenticated user and Business/Fleet/Enterprise management authority as appropriate.
- `business_id` and `location_id` must be verified server-side.
- External URLs are validated against allowed schemes.
- Customization JSON cannot reference arbitrary private storage objects without access checks.
- Version snapshots exclude secrets and private auth/session material.
- System templates are immutable to normal Business users.
- Enterprise template sharing is explicit and revocable.

## Testing strategy

### Server tests/audits
- unauthorized Business cannot create/update another Business QR
- stable code remains unchanged after update
- version created for material changes
- invalid customization rejected
- invalid action payload rejected
- single-use/max-redemption behavior preserved
- template ownership enforced
- archived QR remains historically attributable
- public resolver still resolves legacy QRs

### Client tests/audits
- live preview updates for every design field
- template application is deterministic
- unsaved draft survives a failed save
- action family changes produce typed payloads, not raw JSON strings
- no `[object Object]` or raw JSON presentation
- zero-location state routes to claim/add recovery
- QR Library reflects activation and schedule states correctly
- editor preserves stable QR identity on save

### Device verification
- scan exported PNG/PDF from multiple physical sizes
- scan light/dark color combinations that pass validation
- scan with logo at maximum allowed scale
- edit behavior after printing and confirm old printed code resolves to new behavior
- test anonymous and authenticated scan attribution

## Rollout sequence

1. Typed customization/action schemas + server validation + version history.
2. QR Library and visual editor shell with live preview.
3. Design controls, templates, brand kit, PNG/PDF export.
4. Typed action builder and stable-code dynamic behavior editing.
5. Engagement-program builder.
6. Targeting and lifecycle scheduling/limits.
7. Analytics workspace.
8. Enterprise/Fleet template sharing and bulk operations.

Each wave must leave the existing QR scan runtime functional and backward compatible.

## Success criteria

QR Studio is successful when a Business user can create or open a QR, visually brand it with logo/colors/frame/text, apply or save a template, see a trustworthy live preview, configure a typed action and engagement program, publish without changing the stable printed code, export a scan-safe asset, and later measure attributable activity from the same canonical Kleenest QR record.
