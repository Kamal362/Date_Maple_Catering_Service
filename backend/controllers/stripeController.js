const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Get Stripe publishable key
// @route   GET /api/stripe/config
// @access  Public
exports.getStripeConfig = async (req, res) => {
  try {
    res.json({
      success: true,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error('Error fetching Stripe config:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching Stripe configuration',
    });
  }
};

// @desc    Create payment intent
// @route   POST /api/stripe/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency,
      metadata: {
        userId: req.user?.id || 'guest',
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
    });
  }
};

// @desc    Confirm payment
// @route   POST /api/stripe/confirm-payment
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required',
      });
    }

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    res.json({
      success: true,
      paymentIntent,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error confirming payment',
    });
  }
};

// @desc    Get payment intent status
// @route   GET /api/stripe/payment-intent/:id
// @access  Private
exports.getPaymentIntent = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);

    res.json({
      success: true,
      paymentIntent,
    });
  } catch (error) {
    console.error('Error fetching payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment intent',
    });
  }
};

// @desc    Create Stripe customer
// @route   POST /api/stripe/create-customer
// @access  Private
exports.createCustomer = async (req, res) => {
  try {
    const { email, name, metadata = {} } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: req.user?.id || 'guest',
        ...metadata,
      },
    });

    res.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
    });
  }
};

// @desc    Save payment method to customer
// @route   POST /api/stripe/save-payment-method
// @access  Private
exports.savePaymentMethod = async (req, res) => {
  try {
    const { customerId, paymentMethodId } = req.body;

    if (!customerId || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID and payment method ID are required',
      });
    }

    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.json({
      success: true,
      paymentMethod,
    });
  } catch (error) {
    console.error('Error saving payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving payment method',
    });
  }
};

// @desc    Get customer's saved payment methods
// @route   GET /api/stripe/customer/:customerId/payment-methods
// @access  Private
exports.getCustomerPaymentMethods = async (req, res) => {
  try {
    const { customerId } = req.params;

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    res.json({
      success: true,
      paymentMethods: paymentMethods.data,
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment methods',
    });
  }
};

// @desc    Process refund
// @route   POST /api/stripe/refund
// @access  Private/Admin
exports.processRefund = async (req, res) => {
  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required',
      });
    }

    const refundData = {
      payment_intent: paymentIntentId,
      reason,
    };

    if (amount) {
      refundData.amount = Math.round(amount); // Amount in cents
    }

    const refund = await stripe.refunds.create(refundData);

    res.json({
      success: true,
      refund,
      message: 'Refund processed successfully',
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing refund',
    });
  }
};

// @desc    Get payment method details
// @route   GET /api/stripe/payment-method/:id
// @access  Private
exports.getPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(req.params.id);

    res.json({
      success: true,
      paymentMethod,
    });
  } catch (error) {
    console.error('Error fetching payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment method',
    });
  }
};

// @desc    Webhook handler for Stripe events
// @route   POST /api/stripe/webhook
// @access  Public (verified by Stripe signature)
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      // Update order status in database
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed:', failedPayment.id);
      // Handle failed payment
      break;

    case 'charge.refunded':
      const refund = event.data.object;
      console.log('Charge refunded:', refund.id);
      // Update order status
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
