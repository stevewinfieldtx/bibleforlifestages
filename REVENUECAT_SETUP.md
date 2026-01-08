# RevenueCat Integration Setup Guide
## Bible for Life Stages

---

## Overview

This guide walks you through connecting Bible for Life Stages to RevenueCat for real payment processing.

**Pricing:**
- Monthly: $5/month
- Yearly: $45/year (25% savings)

---

## Step 1: Install the RevenueCat SDK

Run this command in your project directory:

```bash
cd "C:\Users\steve\Documents\Life Stages - Bible"
npm install --save @revenuecat/purchases-js
```

---

## Step 2: Create RevenueCat Account & Project

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/signup)
2. Create account (or log in)
3. Create a new **Project**: "Bible for Life Stages"

---

## Step 3: Connect Stripe Account

1. In RevenueCat, go to **Project Settings > Billing > Web Billing**
2. Click **Connect Stripe**
3. Follow the Stripe OAuth flow to connect your Stripe account
4. If you don't have a Stripe account, create one at [stripe.com](https://stripe.com)

---

## Step 4: Add Web Billing App

1. In RevenueCat, go to **Apps & Providers**
2. Click **+ Add App**
3. Select **Web Billing**
4. Configure:
   - **App Name**: Bible for Life Stages
   - **Support Email**: steve@bibleforlifestages.com (or your email)
   - **Default Currency**: USD

---

## Step 5: Create Products in RevenueCat

1. Go to **Products** in RevenueCat
2. Click **+ New Product**

### Product 1: Monthly
- **Identifier**: `bible_premium_monthly`
- **Display Name**: Premium Monthly
- **Price**: $5.00
- **Duration**: 1 month

### Product 2: Yearly
- **Identifier**: `bible_premium_yearly`
- **Display Name**: Premium Yearly
- **Price**: $45.00
- **Duration**: 1 year

---

## Step 6: Create Entitlement

1. Go to **Entitlements**
2. Click **+ New Entitlement**
3. Configure:
   - **Identifier**: `premium`
   - **Display Name**: Premium Access
4. Attach both products to this entitlement

---

## Step 7: Create Offering

1. Go to **Offerings**
2. Click **+ New Offering**
3. Configure:
   - **Identifier**: `default`
   - **Display Name**: Default Offering
4. Add packages:
   - **$rc_monthly** → bible_premium_monthly
   - **$rc_annual** → bible_premium_yearly
5. Set as **Current Offering**

---

## Step 8: Get Your API Key

1. Go to **Project Settings > API Keys**
2. Copy your **Web Billing Public API Key** (starts with `rcb_`)
3. Update your `.env.local`:

```env
NEXT_PUBLIC_REVENUECAT_API_KEY=rcb_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 9: Switch to RevenueCat Context

Replace the subscription context in your app:

### Option A: Replace the file
```bash
# Backup old context
mv context/subscription-context.tsx context/subscription-context-old.tsx

# Use RevenueCat context
mv context/subscription-context-revenuecat.tsx context/subscription-context.tsx
```

### Option B: Update imports
In `app/layout.tsx`, change:
```tsx
import { SubscriptionProvider } from "@/context/subscription-context-revenuecat"
```

---

## Step 10: Update Subscription Page (Optional)

If you want to use the new RevenueCat-powered subscription page:

```bash
# Backup old page
mv app/subscription/page.tsx app/subscription/page-old.tsx

# Use RevenueCat page
mv app/subscription/page-revenuecat.tsx app/subscription/page.tsx
```

---

## Step 11: Test in Sandbox Mode

1. In RevenueCat, get your **Sandbox API Key** (for testing)
2. Use test card numbers from Stripe:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

---

## Step 12: Go Live

1. Replace Sandbox API key with Production API key
2. Deploy to Vercel
3. Test a real purchase

---

## Files Created

| File | Purpose |
|------|---------|
| `lib/revenuecat.ts` | RevenueCat SDK wrapper functions |
| `context/subscription-context-revenuecat.tsx` | React context for subscription state |
| `app/subscription/page-revenuecat.tsx` | Updated subscription page |

---

## Need Help?

- [RevenueCat Docs](https://www.revenuecat.com/docs/)
- [Web Billing Guide](https://www.revenuecat.com/docs/web/web-billing/web-sdk)
- [RevenueCat Community](https://community.revenuecat.com/)

---

## Quick Checklist

- [ ] RevenueCat account created
- [ ] Stripe account connected
- [ ] Web Billing app created
- [ ] Products created (monthly + yearly)
- [ ] Entitlement created (premium)
- [ ] Offering created with packages
- [ ] API key added to .env.local
- [ ] SDK installed (`npm install @revenuecat/purchases-js`)
- [ ] Context switched to RevenueCat version
- [ ] Tested in sandbox mode
- [ ] Deployed to production
