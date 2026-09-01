# Kleenest Business

Kleenest Business is the Android-first business control center for organizations operating locations in the Kleenest network.

## Canonical repository contract

Kleenest is built as a coordinated product system with strict repository ownership:

- **`Kleenest_Architecture/main`** is the canonical source for features, service contracts, product rules, data models, workflows, provenance, analytics, QR, Business, Fleet and Enterprise design information. We mine Architecture for the behavior and contracts to implement; customer-facing runtime code does not live there.
- **`Kleenest_Production`** is the live Consumer/Premium product counterpart and the source of proven mobile/runtime patterns. Business features that interact with Consumer/Premium users must remain compatible with Production's shared backend contracts and live network behavior.
- **`Kleenest_Business`** owns the Business application implementation. Business code belongs here even when the originating feature or service definition comes from Architecture.
- **`Kleenest_Fleet`** owns the Fleet application implementation. Fleet communicates with Production because Fleet clients and Premium recipients use substantial portions of the Production/Consumer framework and network.
- **`Kleenest_Owner`** owns the private Platform Owner application and must communicate with Production, Business and Fleet through canonical backend/admin contracts.

There is **no separate Enterprise application or Enterprise repository**. Enterprise is a capability layer implemented in both Business and Fleet:

- Business Growth intentionally contains a substantial subset of Enterprise-class intelligence and operating capabilities at a smaller scale.
- Business Enterprise expands Business beyond Growth limits and adds enterprise governance/integration capabilities.
- Fleet Enterprise is an upgrade to Fleet and is required for multi-location Fleet monitoring.

Cross-app interoperability must happen through canonical Supabase/backend services, authorization and shared domain contracts—not by importing one customer application directly into another.

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

## Implementation rule

For every Business implementation wave:

1. inspect `Kleenest_Architecture/main` for the canonical feature, service, schema and behavior;
2. inspect `Kleenest_Production` for live shared-network/runtime expectations where the feature touches Consumer/Premium users;
3. implement the Business runtime in `Kleenest_Business`;
4. preserve shared backend identifiers, authorization semantics and event/data contracts so Business and Production operate on the same Kleenest network;
5. place Enterprise Business capabilities in this repository behind Growth/Enterprise entitlement gates as appropriate.
