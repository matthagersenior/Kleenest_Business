# Kleenest Business

Kleenest Business is the Android-first business control center for organizations operating locations in the Kleenest network.

## Product model

- **Standard — $20/month**: core business management and engagement for one location.
- **Growth — $50/month**: Standard plus advanced intelligence, recommendations, reports, audits, automation-ready tooling, and multi-location Business management for up to **5 locations**.
- **Enterprise — contact Kleenest**: required for **6+ Business locations**, custom or negotiated requirements, advanced governance, integrations, cross-product controls, and enterprise-scale operations.
- **Fleet**: a separate app/product for organizations that need to provide Kleenest Premium access to a group larger than the Family-plan model. Fleet includes **Business Standard**. Fleet may monitor one location without Enterprise; monitoring more than one location requires **Enterprise**.

Enterprise is a capability layer, not a separate customer-facing app. Business and Fleet remain separate products, while Enterprise expands whichever product needs enterprise-scale capabilities.

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

Plan entitlements decide *what the organization purchased or received through a product bundle*. Role capabilities decide *what the signed-in person may do*. Backend authorization remains authoritative.

Fleet membership and Business membership remain separately scoped. Having Fleet does not grant Enterprise Business capabilities. Fleet only guarantees the bundled Business Standard entitlement unless the organization separately has Growth or Enterprise.

## Architecture sources

This repository is being built from the proven foundations in `Kleenest_Architecture/main` and the Expo/mobile runtime patterns in `Kleenest_Production`, while deliberately omitting consumer-only surfaces.
