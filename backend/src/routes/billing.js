const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

router.post('/checkout', auth, async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(400).json({ error: 'Stripe not configured' });
    if (!process.env.STRIPE_PRICE_ID) return res.status(500).json({ error: 'Stripe price is not configured' });

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
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Unable to start checkout' });
  }
});

router.post('/webhook', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(400).json({ error: 'Stripe not configured' });
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: 'Webhook error' });
  }

  try {
    if (['customer.subscription.created', 'customer.subscription.updated'].includes(event.type)) {
      const sub = event.data.object;
      const paidStatuses = ['active', 'trialing'];
      await User.findOneAndUpdate({ stripeCustomerId: sub.customer }, {
        plan: paidStatuses.includes(sub.status) ? 'pro' : 'free',
        stripeSubscriptionId: sub.id
      });
    }
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      await User.findOneAndUpdate({ stripeCustomerId: sub.customer }, { plan: 'free', stripeSubscriptionId: '' });
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

router.post('/portal', auth, async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(400).json({ error: 'Stripe not configured' });
    if (!req.user.stripeCustomerId) return res.status(400).json({ error: 'No billing account exists yet' });
    const session = await stripe.billingPortal.sessions.create({ customer: req.user.stripeCustomerId, return_url: `${process.env.FRONTEND_URL}/dashboard` });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Billing portal error:', err);
    res.status(500).json({ error: 'Unable to open billing portal' });
  }
});

module.exports = router;
