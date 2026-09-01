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
- Up to five Business locations.
- Everything in Standard.
- Advanced analytics and intelligence.
- Recommendations.
- Reports.
- Audits and data-quality tooling.

Growth intentionally exposes many Enterprise-class Business tools at a smaller location ceiling. It is still a Growth subscription, not an Enterprise contract.

### Business Enterprise — contact Kleenest
- Six or more Business locations.
- Custom or negotiated requirements.
- Enterprise governance.
- Integrations and cross-product controls.
- No fixed location ceiling in the application entitlement layer; commercial terms are authoritative.

### Fleet
Fleet is its own product entitlement and app. It is not a Business plan name.

Fleet is designed for an organization that needs to provide Kleenest Premium-user access to more people than the Family-plan model supports. An active Fleet product includes **Business Standard** as a bundled entitlement.

Fleet may monitor **one location** under its normal entitlement. Monitoring **more than one location** requires Enterprise. Fleet itself does not automatically promote Business to Enterprise.

## Recommended organization record

Do not model this as a single `account_type`.

Conceptually, authorization should resolve these dimensions independently:

- `organization_id`
- `business_plan`: `standard | growth | enterprise | none`
- `fleet_enabled`: boolean
- `business_standard_source`: `purchased | fleet_bundle | none`
- `business_location_count`: derived from canonical active Business locations
- `fleet_monitored_location_count`: derived from Fleet monitoring configuration
- membership role(s)
- explicit capability grants/denials where needed
- subscription status and effective dates

Effective Business access resolves to the purchased Business plan when one exists. If no Business plan was purchased but Fleet is active, Business resolves to bundled **Standard**. Fleet never resolves Business to Enterprise by itself.

A sixth Business location never grants Enterprise by itself; it is rejected until Enterprise is active. Likewise, a second Fleet-monitored location is rejected until Enterprise is active.

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

### Fleet organization uses Business
- Fleet includes Business Standard automatically.
- No separate Standard purchase is required just to use the bundled Business tools.
- Business Standard remains limited to one Business location.
- Fleet monitoring remains limited to one monitored location.
- Enterprise is required before Fleet can monitor a second location.
- Fleet roles and Business roles are provisioned separately.

### Fleet organization upgrades Business
- It may purchase Business Growth for expanded Business management and intelligence across up to five Business locations.
- Business Growth does **not** expand Fleet monitoring beyond one location.
- Enterprise is still required for multi-location Fleet monitoring.

### Business organization adds Fleet
- Create/activate the Fleet entitlement separately.
- Fleet provides Premium-user access distribution beyond the Family-plan model.
- Do not promote Business to Enterprise just because Fleet is active.
- Preserve the current Business plan; if there was no Business plan, Fleet supplies bundled Standard.
- Provision only Fleet roles/capabilities explicitly granted to users.

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
