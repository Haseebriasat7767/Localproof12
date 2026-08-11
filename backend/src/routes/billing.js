const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();
const billingLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10, keyGenerator: (req) => String(req.user?.id || req.ip || 'unknown') });

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

function frontendUrl() {
  return (process.env.FRONTEND_URL || '').split(',')[0].trim().replace(/\/$/, '');
}

router.post('/checkout', auth, billingLimiter, async (req, res) => {
  try {
    const stripe = getStripe();
    const baseUrl = frontendUrl();
    if (!stripe) return res.status(503).json({ error: 'Billing is not configured' });
    if (!process.env.STRIPE_PRICE_ID || !baseUrl) return res.status(503).json({ error: 'Billing configuration is incomplete' });
    if (req.auth.hasPaid) return res.status(409).json({ error: 'You already have an active subscription' });

    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: req.user.email, name: req.user.name, metadata: { userId: String(req.user.id) } });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user.id, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      metadata: { userId: String(req.user.id) },
      subscription_data: { metadata: { userId: String(req.user.id) } },
      success_url: `${baseUrl}/dashboard?upgraded=true`,
      cancel_url: `${baseUrl}/pricing`
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Unable to start checkout' });
  }
});

router.post('/webhook', async (req, res) => {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).json({ error: 'Billing webhook is not configured' });
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    if (['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.resumed'].includes(event.type)) {
      const sub = event.data.object;
      const paidStatuses = ['active', 'trialing'];
      await User.findOneAndUpdate({ stripeCustomerId: sub.customer }, {
        plan: paidStatuses.includes(sub.status) ? 'pro' : 'free',
        stripeSubscriptionId: paidStatuses.includes(sub.status) ? sub.id : ''
      });
    } else if (['customer.subscription.deleted', 'customer.subscription.paused'].includes(event.type)) {
      const sub = event.data.object;
      await User.findOneAndUpdate({ stripeCustomerId: sub.customer }, { plan: 'free', stripeSubscriptionId: '' });
    } else if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.mode === 'subscription' && session.customer && session.subscription) {
        await User.findOneAndUpdate({ stripeCustomerId: session.customer }, { plan: 'pro', stripeSubscriptionId: session.subscription });
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

router.post('/portal', auth, billingLimiter, async (req, res) => {
  try {
    const stripe = getStripe();
    const baseUrl = frontendUrl();
    if (!stripe || !baseUrl) return res.status(503).json({ error: 'Billing is not configured' });
    if (!req.user.stripeCustomerId) return res.status(400).json({ error: 'No billing account exists yet' });
    const session = await stripe.billingPortal.sessions.create({ customer: req.user.stripeCustomerId, return_url: `${baseUrl}/dashboard` });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Billing portal error:', err);
    res.status(500).json({ error: 'Unable to open billing portal' });
  }
});

module.exports = router;
