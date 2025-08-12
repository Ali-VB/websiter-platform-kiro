# 🎯 Stripe Integration Setup Guide

## 📋 Prerequisites

1. **Stripe Account**: Create account at [stripe.com](https://stripe.com)
2. **Supabase Project**: Your existing Supabase project
3. **Domain**: For webhook endpoints (can use ngrok for testing)

## 🔧 Step 1: Environment Variables

### Frontend (.env)

```bash
# Stripe Public Key (starts with pk_test_ or pk_live_)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...

# Optional: Enable/disable payment methods
VITE_ENABLE_PAYPAL=true
VITE_ENABLE_INTERAC=true
```

### Supabase Edge Functions (.env)

```bash
# Stripe Secret Key (starts with sk_test_ or sk_live_)
STRIPE_SECRET_KEY=sk_test_51...

# Webhook Secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase URLs (already configured)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 🚀 Step 2: Deploy Supabase Edge Functions

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the functions
supabase functions deploy create-payment-intent
supabase functions deploy confirm-payment
supabase functions deploy stripe-webhook

# Set environment variables
supabase secrets set STRIPE_SECRET_KEY=sk_test_51...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🔗 Step 3: Configure Stripe Webhooks

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Add endpoint**: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
3. **Select events**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
4. **Copy webhook secret** and add to environment variables

## 🗄️ Step 4: Database Setup

The payments table should already exist. If not, run this SQL:

```sql
-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'cad',
  status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')) DEFAULT 'pending',
  payment_type TEXT CHECK (payment_type IN ('initial', 'final', 'maintenance')) NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

## 🧪 Step 5: Testing

### Test Mode Setup

1. Use Stripe test keys (pk*test*... and sk*test*...)
2. Use test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0025 0000 3155`

### Test the Flow

1. Go through onboarding process
2. Reach payment step
3. Use test card number
4. Verify payment in Stripe dashboard
5. Check database for payment record
6. Verify project status update

## 🔒 Step 6: Security Checklist

- [ ] Environment variables are secure
- [ ] Webhook endpoints use HTTPS
- [ ] Database RLS policies are enabled
- [ ] Test keys are not in production
- [ ] Webhook signatures are verified
- [ ] Payment amounts are validated server-side

## 🚨 Step 7: Go Live

### Before Production:

1. **Switch to live keys** in environment variables
2. **Update webhook endpoint** to production URL
3. **Test with real card** (small amount)
4. **Monitor Stripe dashboard** for issues
5. **Set up monitoring** and alerts

### Production Environment Variables:

```bash
# Use live keys (pk_live_... and sk_live_...)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_SECRET_KEY=sk_live_51...
STRIPE_WEBHOOK_SECRET=whsec_... # New webhook secret for live endpoint
```

## 📊 Step 8: Monitoring & Analytics

### Stripe Dashboard

- Monitor payment success rates
- Track failed payments
- Review dispute/chargeback data
- Analyze payment methods usage

### Database Queries

```sql
-- Payment success rate
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM payments
GROUP BY status;

-- Revenue by payment type
SELECT
  payment_type,
  SUM(amount) / 100.0 as total_amount,
  COUNT(*) as payment_count
FROM payments
WHERE status = 'succeeded'
GROUP BY payment_type;
```

## 🆘 Troubleshooting

### Common Issues:

1. **"Stripe not configured"**

   - Check VITE_STRIPE_PUBLISHABLE_KEY is set
   - Verify key format (starts with pk\_)

2. **"Payment intent creation failed"**

   - Check Supabase function deployment
   - Verify STRIPE_SECRET_KEY is set
   - Check function logs in Supabase dashboard

3. **"Webhook signature verification failed"**

   - Verify STRIPE_WEBHOOK_SECRET matches Stripe dashboard
   - Check webhook endpoint URL is correct
   - Ensure endpoint is accessible (not localhost)

4. **Database errors**
   - Check RLS policies allow access
   - Verify table structure matches types
   - Check foreign key constraints

### Debug Commands:

```bash
# Check function logs
supabase functions logs create-payment-intent

# Test webhook locally (with ngrok)
ngrok http 54321
# Then use ngrok URL in Stripe webhook settings

# Check environment variables
supabase secrets list
```

## 📞 Support

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Supabase Edge Functions**: [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **Test Cards**: [stripe.com/docs/testing](https://stripe.com/docs/testing)

---

🎉 **You're all set!** Your Stripe integration should now be working with secure server-side processing and webhook handling.
