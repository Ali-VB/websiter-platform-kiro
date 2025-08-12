import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client (use service role key for webhook)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the raw body and signature
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      throw new Error('Missing stripe-signature header')
    }

    // Verify webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable')
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    console.log('Received webhook event:', event.type, event.id)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, supabaseClient)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, supabaseClient)
        break
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent, supabaseClient)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, supabaseClient: any) {
  console.log('Payment succeeded:', paymentIntent.id)

  try {
    // Update payment status in database
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .update({
        status: 'succeeded',
        processed_at: new Date().toISOString(),
        payment_method: paymentIntent.payment_method_types?.[0] || 'card',
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (paymentError) {
      console.error('Error updating payment status:', paymentError)
      throw paymentError
    }

    // Get payment details to update project
    const { data: payment, error: fetchError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    if (fetchError) {
      console.error('Error fetching payment:', fetchError)
      throw fetchError
    }

    // Update project status based on payment type
    if (payment.payment_type === 'initial') {
      // Update project to "in_progress" status for initial payment
      const { error: projectError } = await supabaseClient
        .from('projects')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.project_id)

      if (projectError) {
        console.error('Error updating project status:', projectError)
        throw projectError
      }

      console.log('Project status updated to in_progress for initial payment')
    } else if (payment.payment_type === 'final') {
      // Update project to "completed" status
      const { error: projectError } = await supabaseClient
        .from('projects')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.project_id)

      if (projectError) {
        console.error('Error updating project status:', projectError)
        throw projectError
      }

      console.log('Project status updated to completed for final payment')
    }

    console.log('Payment processing completed successfully')
  } catch (error) {
    console.error('Error processing successful payment:', error)
    throw error
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, supabaseClient: any) {
  console.log('Payment failed:', paymentIntent.id)

  try {
    // Update payment status in database
    const { error } = await supabaseClient
      .from('payments')
      .update({
        status: 'failed',
        processed_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating failed payment status:', error)
      throw error
    }

    console.log('Payment failure recorded successfully')
  } catch (error) {
    console.error('Error processing failed payment:', error)
    throw error
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent, supabaseClient: any) {
  console.log('Payment canceled:', paymentIntent.id)

  try {
    // Update payment status in database
    const { error } = await supabaseClient
      .from('payments')
      .update({
        status: 'canceled',
        processed_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating canceled payment status:', error)
      throw error
    }

    console.log('Payment cancellation recorded successfully')
  } catch (error) {
    console.error('Error processing canceled payment:', error)
    throw error
  }
}