# Kleenest Detailed Financial Model v9 — normalized reference

_Source artifact: Kleenest_Detailed_Financial_Model_v9.xlsx (11 tabs, 36-month model)._

## Model structure

The workbook contains:
1. Dashboard
2. Assumptions
3. Growth Targets
4. Conservative scenario
5. Base scenario
6. Upside scenario
7. Aggressive Growth scenario
8. Supporting operating calculations
9. Enterprise + Paid Access
10. Break-even & Sensitivity
11. Model Notes

## Core treatment

Core revenue includes:
- Standard
- Growth
- Fleet
- Premium
- Family
- conservative programmatic ads
- local sponsors

Explicitly excluded from core:
- Enterprise revenue
- paid-restroom-access revenue

## Pricing / economic assumptions

| Item | Value | Treatment |
|---|---:|---|
| Standard | $20/location/month | Core |
| Growth | $50/location/month | Core |
| Growth Premium seats | 50/location | Bundled; not double-counted |
| Fleet | $75/account/month | Core |
| Fleet Premium seats | 50/account | Bundled; not double-counted |
| Consumer Premium | $5 one-time | Core |
| Consumer Family | $20 one-time | Core |
| Programmatic eCPM | $3 / 1,000 impressions | Conservative core assumption |
| Ad impressions | 10 / MAU / month | Conservative core assumption |
| Direct local sponsor | $150/month | Core planning assumption |
| Enterprise floor | $499/month | Upside only |
| Enterprise platform component | $250/month | Upside only |
| Enterprise location component | $40/location/month | Upside only |
| Standard Enterprise onboarding | $1,500 one-time | Upside only |
| Paid access consumer price | $1.50/transaction | Upside sensitivity |
| Kleenest paid-access share | 20% of GMV | Upside sensitivity |

## Selected operating assumptions by scenario

| Assumption | Conservative | Base | Upside | Aggressive Growth |
|---|---:|---:|---:|---:|
| Monthly active-user retention | 55% | 62% | 65% | 67% |
| Premium attach rate | 1.6% | 2.5% | 3.0% | 3.5% |
| Family attach rate | 0.35% | 0.5% | 0.65% | 0.8% |
| Paid share of gross new active users | 20% | 30% | 35% | 40% |
| Blended paid CAC / active user | $1.50 | $1.75 | $2.00 | $2.50 |
| Verified observations / MAU / month | 8% | 12% | 15% | 18% |
| Standard/Growth monthly churn | 2.5% | 2.0% | 1.5% | 1.25% |
| Fleet monthly churn | 2.5% | 2.0% | 1.5% | 1.25% |

## Scenario dashboard

| Metric | Conservative | Base | Upside | Aggressive Growth |
|---|---:|---:|---:|---:|
| Y1 core revenue | $27,497.50 | $97,720.50 | $195,176 | $393,887 |
| Y1 operating result | ($28,294.90) | ($66,599.92) | ($152,789.50) | ($404,951.96) |
| Y2 core revenue | $146,781.93 | $615,363.51 | $1,179,252.17 | $2,477,558.13 |
| Y2 operating result | ($48,438.08) | $31,361.88 | ($4,351.41) | ($691,227.22) |
| Y3 core revenue | $305,400.26 | $1,394,758.61 | $2,860,536.33 | $5,984,518.07 |
| Y3 operating result | ($36.45) | $288,585.36 | $348,925.17 | ($897,228.33) |
| Peak cumulative funding | $94,065.91 | $100,147.36 | $233,495.76 | $1,993,407.51 |

## Base Month-12 snapshot

- MAU: **30,000**
- Standard locations: **450**
- Growth locations: **190**
- Paid business locations total: **640**
- Fleet accounts: **22**
- Included Premium employee seats: **10,600**
- Core monthly revenue: **$27,300**
- Annualized run-rate: **$327,600**
- Variable cash costs: **$17,058.90**
- Fixed cash opex: **$9,750**
- Operating result: approximately **+$491/month**
- Gross contribution margin: approximately **37.5%**

## Break-even sensitivity

Single-stream thought experiments from the workbook:

| Stream | Approx. net contribution / unit / month | Units to cover Base M12 cash opex | Base M12 units |
|---|---:|---:|---:|
| Standard-only locations | $19.40 | 1,382 | 450 |
| Growth-only locations | $48.50 | 553 | 190 |
| Fleet-only accounts | $72.75 | 369 | 22 |
| Sponsors-only | $145.50 | 184 | 18 |
| Ads-only MAU | ~$0.01 | ~2.68M | 30,000 |

Interpretation: advertising should supplement—not carry—the business model.

## Enterprise + paid-access sensitivity

Enterprise examples:
- 6 locations: $499/month + $1,500 standard onboarding
- 10: $650/month
- 25: $1,250/month
- 50: $2,250/month
- 100: $4,250/month
- 250: $10,250/month

Paid access is shown only as sensitivity. At $1.50 average consumer price and a 20% Kleenest share:
- 1,000 tx/month → $300/month Kleenest revenue
- 5,000 → $1,500/month
- 10,000 → $3,000/month
- 25,000 → $7,500/month
- 50,000 → $15,000/month

All remain **$0 in the core forecast until real conversion data exists**.

## Model caveats

- Targets are planning inputs, not promises.
- Close rates, retention, CAC, and churn remain assumptions until observed.
- Taxes and noncash equity compensation are excluded from the model.
- Aggressive Growth intentionally demonstrates that higher revenue can still mean substantially higher capital requirements.
