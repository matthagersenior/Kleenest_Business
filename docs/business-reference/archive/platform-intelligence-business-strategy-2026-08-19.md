# Kleenest Location-Intelligence & Business Platform Strategy — Historical August 2026 Source

> **Status:** Historical strategy / architecture/business source  
> **Original artifact:** `Kleenest app .pdf`  
> **Source date:** August 19, 2026  
> **Original length:** 106 pages  
> **Precedence:** Current Architecture contracts and current v9/v10 business material override this source where they conflict.

## Why this source matters

Although titled like an app document, this 106-page source contains a substantial early **business, data-product, privacy, analytics, API, and enterprise strategy**.

Its central framing was:

> Kleenest should not be merely a bathroom directory. It should become a privacy-conscious location-intelligence and consumer-behavior platform, with restrooms as the initial data domain.

The document repeatedly emphasized that the defensible asset is not raw user surveillance or row count. It is a structured, trustworthy, continuously improving model of real-world restroom demand, quality, accessibility, amenities, and location behavior.

## Data-value chain

The source described a progression roughly as:

Consumer interaction  
→ location context  
→ intent  
→ discovery  
→ navigation  
→ arrival  
→ check-in  
→ observation  
→ amenity / cleanliness / occupancy evidence  
→ aggregated location intelligence  
→ business / enterprise / API products

## Privacy and data-use principle

The source explicitly rejected “collect as much data as possible.”

Instead it argued for:
- minimum necessary collection,
- clearly defined purposes,
- consent where required,
- short retention for raw location where possible,
- pseudonymization / separation of identity and analytics,
- aggregation thresholds,
- deletion mechanisms,
- no sale of individual movement histories,
- commercial use of aggregated location-level intelligence.

The intended durable asset was the statistical signal, not continuous personal GPS history.

## Four information layers

The source separated data into four conceptual classes.

### 1. Canonical domain data
Physical-world facts:
- locations,
- businesses,
- restrooms,
- amenities,
- fixtures,
- operating status,
- photos,
- external observations,
- confidence / provenance.

### 2. Behavioral events
What actually happened:
- search,
- location view,
- filters,
- directions request,
- route start,
- arrival,
- check-in / check-out,
- favorite / share,
- review,
- amenity observation,
- cleanliness observation,
- navigation completion.

### 3. Derived intelligence
What Kleenest calculates:
- demand,
- peak periods,
- cleanliness score,
- supply reliability,
- occupancy estimates,
- satisfaction,
- repeat-visit rate,
- confidence,
- percentile rankings,
- market benchmarks.

### 4. Commercial products
What customers receive:
- Business dashboards,
- alerts,
- reports,
- benchmarking,
- Fleet intelligence,
- API access,
- advertising/context signals,
- Enterprise analytics.

## Location Truth Plane + Intelligence Plane

A major architectural/business idea in the source was the separation of two authoritative planes.

### Location Truth Plane
Answers **what exists**:
- identity,
- coordinates,
- address,
- source identifiers,
- business relationship,
- access characteristics,
- amenities,
- fixtures,
- operational status,
- photos,
- confidence and provenance.

### Intelligence Plane
Answers **what is happening**:
- interaction events,
- observation events,
- system events,
- aggregations,
- demand,
- quality,
- operations,
- trends,
- recommendations.

The source argued that events should not silently mutate canonical physical truth.

## Event and aggregation model

The source proposed a canonical event vocabulary such as:
- SEARCH
- LOCATION_VIEW
- DIRECTIONS_REQUESTED
- ROUTE_STARTED
- ARRIVAL
- CHECK_IN
- CHECK_OUT
- REVIEW_SUBMITTED
- AMENITY_OBSERVED
- CLEANLINESS_OBSERVED
- OCCUPANCY_OBSERVED
- PHOTO_SUBMITTED
- FAVORITE
- SHARE
- NAVIGATION_COMPLETED

It also distinguished system events such as:
- LOCATION_IMPORTED
- LOCATION_UPDATED
- LOCATION_MERGED
- LOCATION_VERIFIED
- LOCATION_REJECTED
- BUSINESS_CLAIMED

The commercial rule was:

**Events are the auditable source; aggregated metrics are the performance/product layer.**

The source envisioned hourly, daily, weekly, rolling-window, market, business, and location metrics rather than dashboards directly counting raw events every time.

## Metric registry

The document proposed formal definitions for every commercial metric.

Example categories:
- bathroom demand score,
- cleanliness score,
- supply reliability,
- occupancy,
- confidence,
- freshness,
- data quality.

Each metric should define:
- input events / source facts,
- time window,
- minimum population,
- weighting,
- normalization,
- output scale,
- confidence,
- algorithm/version provenance.

This avoids multiple screens inventing different definitions of “demand,” “visit,” or “active user.”

## Demand intelligence

The source argued that different events provide different evidentiary strength:

Search  
→ weak intent

Location view  
→ stronger intent

Directions  
→ strong intent

Arrival  
→ very strong physical intent

Check-in  
→ confirmed interaction

Demand should therefore be weighted, deduplicated, time-aware, and fraud-resistant.

## Quality / occupancy intelligence

The source treated structured restroom observations as more useful than generic review text alone.

Potential observations included:
- cleanliness,
- supplies,
- accessibility,
- amenities,
- fixtures,
- condition,
- occupancy,
- operational status.

It also proposed separating persistent attributes from transient conditions.

Persistent examples:
- number of stalls,
- urinals,
- changing table,
- family room,
- accessible stall.

Transient examples:
- closed,
- out of soap,
- out of toilet paper,
- dirty,
- crowded,
- damaged,
- temporarily obstructed.

Occupancy was framed as an estimate with confidence, not false precision.

## Confidence, evidence and freshness

The source proposed making uncertainty visible.

Important dimensions:
- confidence,
- freshness,
- sample size,
- source quality,
- observed timestamp.

Potential freshness states:
- FRESH
- AGING
- STALE
- EXPIRED

This supports both consumer ranking and business intelligence.

## Business intelligence product

The source envisioned a Business dashboard capable of showing metrics such as:
- restroom demand,
- cleanliness,
- peak demand periods,
- accessibility,
- supply reliability,
- check-ins,
- nearby restroom searches,
- satisfaction,
- trend lines,
- benchmarks,
- verification recommendations.

The business proposition evolved beyond “pay to appear on a map.”

The source explicitly argued businesses could pay for:

**data confidence + operational intelligence**

—not merely listing visibility.

## Benchmarking / competitive intelligence

The platform could aggregate enough evidence to provide:
- ZIP / market averages,
- peer comparisons,
- cleanliness percentiles,
- demand benchmarks,
- supply reliability comparisons,
- accessibility coverage,
- market demand patterns.

The moat was framed as the continuously improving structured data model rather than raw volume.

## Consumer recommendation engine

The same intelligence layer was intended to improve consumer discovery.

Potential ranking inputs:
- distance,
- accessibility,
- amenities,
- quality,
- operational status,
- current demand,
- confidence,
- freshness,
- route context.

That allows Kleenest to move from “nearest restroom” toward “best restroom for this user's current needs.”

## Route intelligence

The source described route-aware restroom selection using:
- route proximity,
- detour distance,
- predicted demand,
- accessibility,
- amenity requirements,
- quality,
- operational status.

This supports travelers and mobile workforces in addition to local discovery.

## Commercial ladder

The source described a monetization/product ladder broadly like:

### Consumer
Discovery, maps, ratings, amenities, current condition.

### Business Standard
Understand the location:
- demand,
- check-ins,
- cleanliness,
- supply reliability,
- basic trends.

### Business Growth
Optimize the location:
- historical analytics,
- benchmarking,
- alerts,
- richer demand patterns,
- comparative intelligence.

### Fleet / Enterprise
Understand the network:
- multi-location views,
- regional trends,
- network benchmarking,
- operational intelligence,
- exports / API.

### API / Data
Potential restroom intelligence products:
- availability,
- quality,
- accessibility,
- amenity intelligence,
- demand,
- confidence,
- aggregated geographic trends.

Exact current pricing and packaging should come from current v9/v10 materials, not this historical source.

## Advertising sequencing

The source strongly recommended that advertising remain downstream:

Useful consumer product  
→ legitimate consumer interactions  
→ reliable intelligence  
→ aggregated/contextual signals  
→ advertising

It rejected a strategy of collecting excessive user data simply to sell targeting.

## Municipal / enterprise potential

The same aggregated system could help answer:
- where restroom-access gaps exist,
- which areas experience unusually high demand,
- which public facilities have recurring supply problems,
- where accessibility is underserved,
- when transport hubs experience spikes.

This extended the platform thesis beyond local SMB analytics.

## Snapshot model

The source proposed a current **location intelligence snapshot** containing resolved values such as:
- location ID,
- operational status,
- quality score,
- cleanliness score,
- demand score,
- occupancy band,
- accessibility,
- amenity / fixture summary,
- confidence,
- freshness,
- calculation time,
- algorithm version.

It then extended the concept upward:
- location snapshot,
- business snapshot,
- market snapshot,
- enterprise snapshot.

## Platform model

The historical source ultimately framed Kleenest as three connected systems:

### Discovery
Find → Filter → Navigate → Route

### Observation
Check in → Rate → Report → Photograph → Verify

### Intelligence
Aggregate → Analyze → Predict → Benchmark → Recommend

Commercial layers:
- Business,
- Fleet,
- Enterprise,
- API/data products.

## Current-use rule

Use this document as historical support for:
- Kleenest's location-intelligence moat,
- data-product strategy,
- business-intelligence architecture,
- API/enterprise thesis,
- privacy/aggregation principles,
- metric/provenance discipline.

Do **not** reuse its old system counts, old product-state descriptions, illustrative pricing, or stale competitor claims as current facts.
