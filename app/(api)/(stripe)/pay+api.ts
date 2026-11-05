import { Stripe } from "stripe";

const STRIPE_SECRET =
  process.env.STRIPE_SECRET_KEY ||
  "sk_test_51TnY3jGqBF5WNblmzzgS7y5qU8JbSpdFlJe8magArNvopxQ19CuDHhqtxaOVFVVwQJ3kSW062qmKaOM5vTsclpcc00ssEM4Cu5";

const stripe = new Stripe(STRIPE_SECRET);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payment_method_id, payment_intent_id, customer_id, client_secret } =
      body;

    if (!payment_method_id || !payment_intent_id || !customer_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 },
      );
    }

    let paymentMethodIdToConfirm = payment_method_id;

    if (!payment_method_id.startsWith("pm_card_")) {
      const paymentMethod = await stripe.paymentMethods.attach(
        payment_method_id,
        { customer: customer_id },
      );
      paymentMethodIdToConfirm = paymentMethod.id;
    }

    const result = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: paymentMethodIdToConfirm,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment successful",
        result: result,
      }),
    );
  } catch (error) {
    console.error("Error paying:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
