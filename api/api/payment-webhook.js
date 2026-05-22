// api/payment-webhook.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    order_id, 
    payment_status, 
    pay_amount, 
    pay_currency,
    payment_id,
    outcome_amount,
    outcome_currency
  } = req.body;

  try {
    // Actualizar el pago en Supabase
    const { error } = await supabase
      .from('payments')
      .update({
        payment_status: payment_status,
        crypto_currency: pay_currency,
        crypto_amount: pay_amount,
        outcome_amount: outcome_amount,
        outcome_currency: outcome_currency,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', payment_id);

    if (error) throw error;

    // Si el pago está completado, confirmar la cita
    if (payment_status === 'finished' || payment_status === 'confirmed') {
      await supabase
        .from('appointments')
        .update({ status: 'confirmed', paid: true })
        .eq('id', order_id);
    }

    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
}
