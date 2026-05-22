// api/create-payment.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, orderId } = req.body;

  try {
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NOWPAYMENTS_API_KEY
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'USD',
        pay_currency: null, // El usuario elige (USDT, SOL, etc.)
        order_id: orderId,
        success_url: `${process.env.NEXT_PUBLIC_URL}/pago-exitoso.html`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/mis-citas.html`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_URL}/api/payment-webhook`
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error creating payment');
    }

    res.status(200).json({ 
      paymentUrl: data.invoice_url,
      paymentId: data.id,
      orderId: data.order_id
    });

  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: error.message });
  }
}
