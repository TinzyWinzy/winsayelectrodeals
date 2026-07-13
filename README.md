# Winsay Electrodeals — Solar Instant Quotes Zimbabwe

Get a solar quote online in under 3 minutes. No site visit needed. Pay after installation available.

## About

Winsay Electrodeals is a Zimbabwean-owned solar energy company based in Harare. We make solar power accessible to every home and business with honest pricing, professional installation, and flexible payment options.

**Visit our showroom:** Shop 23B, Copacabbana Mall, 1st Entrance, Cameroon Street, Harare  
**Call us:** +263 785 293 587

## Our Solar Packages

| Package | Price (USD) | Panels | Battery | Best For |
|---|---|---|---|---|
| 3.2Kva System | $950 | 2 × 700W | 25.5V 150Ah Lithium | Entry-level backup |
| 3.5Kva System | $1,000 | 3 × 700W | 24V 200Ah Lithium | Essential home backup |
| 8.2Kva System | $1,900 | 8 × 700W | 48V 200Ah Lithium | Mid-range home system |
| 10.2Kva Standard | $3,400 | 10 × 700W | 2 × 52.2V Promax | High-capacity home |
| 10.2Kva WiFi | $2,500 | 10 × 700W | 52.2V 200Ah Lithium | Smart home with WiFi monitoring |
| 12Kva System | $3,400 | 12 × 700W | 2 × 48V 200Ah | Maximum power |

All prices include full installation, protection kit, mounting kit, and voltage switch.

## Why Choose Us

- **500+ installations** across all 10 provinces
- **Pay after installation** on qualifying tiers (deposit only, balance after install)
- **Flexible payment** via EcoCash, InnBucks, PayNow, or bank transfer
- **Brands we trust:** SUMRY, Deye, SRNE
- **Professional installation** within 48 hours of deposit
- **25-year warranties** on Tier-1 solar panels
- **ZERA licensed** and fully insured

## Contact

- **Phone:** +263 785 293 587
- **Email:** info@winsay.co.zw
- **Shop:** Shop 23B, Copacabbana Mall, 1st Entrance, Cameroon Street, Harare

---

Built with Next.js · Supabase · Tailwind CSS · Zimbabwe

## Deployment

This app is built for GitHub Actions CI/CD into Vercel, with Supabase as the database and auth backend.

### GitHub repository secrets

Add these secrets in GitHub before enabling the workflow:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The workflow in `.github/workflows/vercel.yml` validates every pull request with `npm run lint` and `npm run build`, deploys pull requests as Vercel previews, and deploys pushes to `main` to production.

### Vercel environment variables

Configure these in Vercel Project Settings for Preview and Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `ADMIN_EMAILS`
- `SUPABASE_SERVICE_KEY`
- `PAYNOW_INTEGRATION_ID`
- `PAYNOW_INTEGRATION_KEY`
- `PAYNOW_RESULT_URL`
- `PAYNOW_RETURN_URL`
- `UPSTASH_REDIS_URL`
- `UPSTASH_REDIS_TOKEN`
- `NEXT_PUBLIC_FALLBACK_ZIG_RATE`
