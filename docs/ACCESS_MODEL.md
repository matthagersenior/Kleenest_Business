# Kleenest Business access model

## Principle

Keep **commercial products**, **effective capability bundles**, and **human roles** separate.

This prevents Fleet, Business, and Enterprise from becoming one ambiguous account-type flag and lets a single organization use multiple Kleenest products safely.

## Commercial products

### Business Standard — $20/month
- One location.
- Business profile and location management.
- Review/reply and engagement tools.
- QR management.
- Basic analytics.

### Business Growth — $50/month
- Up to five locations.
- Everything in Standard.
- Advanced analytics and intelligence.
- Recommendations.
- Reports.
- Audits and data-quality tooling.

Growth intentionally exposes many Enterprise-class operating tools at a smaller location ceiling. It is still a Growth subscription, not an Enterprise contract.

### Business Enterprise — contact Kleenest
- Six or more locations.
- Custom or negotiated requirements.
- Enterprise governance.
- Integrations and cross-product controls.
- No fixed location ceiling in the application entitlement layer; commercial terms are authoritative.

### Fleet
Fleet is its own product entitlement and app. It is not a Business plan name.

When an organization has an active Fleet entitlement, its **effective Business capability bundle becomes Enterprise**. The billing ledger must still retain the actual Business SKU and Fleet SKU separately so this promotion does not create accidental double billing or destroy the purchase history.

## Recommended organization record

Do not model this as a single `account_type`.

Conceptually, authorization should resolve these dimensions independently:

- `organization_id`
- `business_plan`: `standard | growth | enterprise | none`
- `fleet_enabled`: boolean
- `effective_business_plan`: derived server-side
- `location_count`: derived from canonical active locations
- membership role(s)
- explicit capability grants/denials where needed
- subscription status and effective dates

`effective_business_plan` resolves to `enterprise` when `fleet_enabled = true`; otherwise it matches the purchased Business plan. A sixth location never grants Enterprise by itself. It is rejected until the organization has Enterprise-equivalent entitlement.

## Role model

Business membership roles:

- `business_owner` — organization authority, billing, users and all purchased capabilities.
- `business_admin` — broad administrative authority without ownership/billing assumptions.
- `business_manager` — day-to-day location, review, QR, engagement and intelligence work.
- `business_analyst` — analytics, recommendations, reports, audits and read access.
- `business_marketing` — reviews/replies, campaigns, promotions, contests, events and QR engagement.
- `business_staff` — limited operational/read access.

Role is not plan. A Business Analyst on Standard still cannot use Advanced Analytics because the organization did not purchase it. A Business Owner on Growth can use Growth capabilities but cannot bypass the five-location ceiling.

## Authorization rule

A screen/action is available only when all applicable gates pass:

1. authenticated user;
2. active organization membership;
3. organization product entitlement;
4. role capability;
5. resource scope (organization/location);
6. server-side RLS/RPC authorization.

The mobile app may use the same resolved access model to render navigation and explain locked features, but client-side gating is never the security boundary.

## Cross-product behavior

### Business adds Fleet
- Create/activate Fleet subscription separately.
- Promote effective Business capability bundle to Enterprise.
- Preserve the purchased Business SKU for billing/history.
- Provision only Fleet roles/capabilities explicitly granted to users.
- Do not make every Business employee a Fleet user automatically.

### Fleet adds Business
- Add a Business product subscription to the existing organization.
- Because Fleet is active, Business runs with the Enterprise capability bundle.
- Provision Business memberships separately from Fleet memberships.

### Fleet roles
Canonical Fleet role family from Architecture remains:

- client
- fleet_owner
- admin
- manager
- dispatcher
- fleet_driver

Business and Fleet roles should be namespaced/capability-mapped rather than treated as interchangeable labels.

## Platform Owner

`Kleenest_Owner` is a separate private operator application. It should use Platform Owner/admin authorization only and should not contain product-preview replicas of Consumer, Business, Fleet, or Enterprise. Those products are inspected through their own apps using authorized accounts.

Owner should instead focus on platform control-plane work: organization provisioning, account/subscription administration, trust and safety, data/provenance operations, system health, audit trails, support tooling, feature/configuration controls, and cross-network intelligence.
