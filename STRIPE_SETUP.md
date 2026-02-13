# 💳 Stripe Setup - Quick Guide

## Step 1: Get Stripe Account
1. Go to https://stripe.com
2. Sign up (free)
3. Verify email

## Step 2: Get API Keys
1. Dashboard → Developers → API keys
2. Copy both keys:
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)

## Step 3: Add to Backend .env
```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

## Step 4: Test Payment
Card: 4242 4242 4242 4242
Exp: Any future date
CVC: Any 3 digits

Done! Check Stripe Dashboard for payments.
