import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const PRODUCTS = {
  'website-design-zw': { title: 'Website design + eligible Zimbabwean domain', priceCents: 2499, currency: 'USD' },
  'website-design-com': { title: 'Website design + .com domain', priceCents: 5000, currency: 'USD' }
} as const;

type ProductId = keyof typeof PRODUCTS;
type CartItem = { id: ProductId; quantity: number };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Only POST is supported.' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication is required.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json({ error: 'Checkout service is not configured.' }, 500);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: 'Your session is invalid or expired. Please sign in again.' }, 401);

  let payload: { items?: CartItem[] };
  try { payload = await request.json(); } catch { return json({ error: 'Invalid checkout payload.' }, 400); }
  const items = payload.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > 20) return json({ error: 'Your cart is empty or too large.' }, 400);

  const normalized = new Map<ProductId, number>();
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || !(item.id in PRODUCTS) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
      return json({ error: 'One or more cart items are invalid.' }, 400);
    }
    const id = item.id as ProductId;
    normalized.set(id, (normalized.get(id) || 0) + item.quantity);
  }
  if ([...normalized.values()].some((quantity) => quantity > 20)) return json({ error: 'A cart item exceeds the maximum quantity.' }, 400);

  const lineItems = [...normalized.entries()].map(([id, quantity]) => ({ id, quantity, product: PRODUCTS[id], lineTotalCents: PRODUCTS[id].priceCents * quantity }));
  const totalCents = lineItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
  const description = lineItems.map((item) => `${item.product.title} × ${item.quantity}`).join('; ');
  const reference = `BD-${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: order, error: orderError } = await serviceClient.from('orders').insert({
    client_id: user.id,
    description,
    amount: (totalCents / 100).toFixed(2),
    currency: 'USD',
    status: 'pending',
    paynow_reference: reference
  }).select('id,amount,currency,status,paynow_reference').single();
  if (orderError || !order) return json({ error: 'The secure order could not be created.' }, 500);

  const { error: paymentError } = await serviceClient.from('payments').insert({
    order_id: order.id,
    provider: 'paynow',
    provider_reference: reference,
    status: 'awaiting',
    amount: order.amount,
    currency: order.currency
  });
  if (paymentError) {
    await serviceClient.from('orders').delete().eq('id', order.id);
    return json({ error: 'The payment record could not be prepared.' }, 500);
  }

  return json({
    order_id: order.id,
    reference: order.paynow_reference,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    paynow_url: 'https://www.paynow.co.zw/bug'
  });
});
