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

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get request body
    const { paymentIntentId } = await req.json()

    console.log('Confirming payment:', paymentIntentId)

    // Validate required fields
    if (!paymentIntentId) {
      throw new Error('Missing required field: paymentIntentId')
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    console.log('Payment intent status:', paymentIntent.status)

    // Check if payment was successful
    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment not successful. Status: ${paymentIntent.status}`)
    }

    // Update payment status in database
    const { data: payment, error: updateError } = await supabaseClient
      .from('payments')
      .update({
        status: 'succeeded',
        processed_at: new Date().toISOString(),
        payment_method: paymentIntent.payment_method_types?.[0] || 'card',
      })
      .eq('stripe_payment_intent_id', paymentIntentId)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      throw new Error(`Database error: ${updateError.message}`)
    }

    console.log('Payment confirmed and database updated:', payment.id)

    // Return confirmation
    return new Response(
      JSON.stringify({
        success: true,
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        processedAt: payment.processed_at,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error confirming payment:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to confirm payment',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})