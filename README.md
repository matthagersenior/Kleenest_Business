# Kleenest Business

Kleenest Business is the Android-first business control center for organizations operating locations in the Kleenest network.

## Product model

- **Standard — $20/month**: core business management and engagement.
- **Growth — $50/month**: Standard plus advanced intelligence, recommendations, reports, audits, automation-ready tooling, and multi-location management for up to **5 locations**.
- **Enterprise — contact Kleenest**: required for **6+ locations**, negotiated/custom needs, cross-product organization controls, advanced governance, and enterprise-scale operations.
- **Fleet add-on**: Fleet is a separate product entitlement. When a Business organization adds Fleet, its Business entitlement is automatically promoted to Enterprise while Fleet remains separately identifiable for authorization and billing.

Enterprise is a capability layer, not a separate customer-facing app. The Fleet app can add Enterprise-for-Business capabilities, and Business can add Fleet.

## App focus

This app intentionally excludes consumer discovery surfaces such as public map browsing and route planning. Its primary workspaces are:

1. **Control Center** — health, KPIs, alerts, recommendations, tasks, location rollups.
2. **Management** — business profile, locations, hours, amenities, accessibility, photos, staff, roles, QR lifecycle, reviews/replies, promotions, campaigns, contests, events and engagement.
3. **Intelligence** — analytics, trends, benchmarks, recommendations, forecasts, reports, audits, data quality, provenance and anomaly detection.
4. **Operations** — location readiness, issue tracking, verification, QR status, service signals and fleet-linked operational context where entitled.
5. **Governance** — organization, membership, role/permission gates, subscription, entitlements, audit trail and integrations.

## Authorization model

Business roles are organization-scoped and capability-gated:

- `business_owner`
- `business_admin`
- `business_manager`
- `business_analyst`
- `business_marketing`
- `business_staff`

Plan entitlements decide *what the organization purchased*. Role capabilities decide *what the signed-in person may do*. Backend authorization remains authoritative.

## Architecture sources

This repository is being built from the proven foundations in `Kleenest_Architecture/main` and the Expo/mobile runtime patterns in `Kleenest_Production`, while deliberately omitting consumer-only surfaces.
