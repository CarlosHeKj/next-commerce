import { stripe } from "@/lib/stripe";
import { ProductType } from "@/types/ProductType";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const calculateOrderAmount = (items: ProductType[]): number => {
  return items.reduce((acc, item) => acc + (item.price! * item.quantity!), 0);
};

export async function Post(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { items, payment_intent_id } = await req.json();
  const total = calculateOrderAmount(items);

  const orderData = {
    user: { connect: { id: 1 } },
    amount: total,
    currency: "brl",
    status: "pending",
    paymentIntentId: payment_intent_id,
    products: {
      create: items.map((item: ProductType) => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
    },
  };

  if (payment_intent_id) {
    // Se um payment_intent_id já existir, atualize-o
    const current_intent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    if (current_intent) {
      const updated_intent = await stripe.paymentIntents.update(payment_intent_id, {
        amount: total,
      });

      const existing_order = await prisma.order.findFirst({
        where: { paymentIntentID: payment_intent_id },
        include: { products: true },
      });

      if (!existing_order) {
        return new Response("Order not found", { status: 404 });
      }

      // Atualize a ordem existente
      const updated_order = await prisma.order.update({
        where: { paymentIntentID: payment_intent_id },
        data: orderData,
      });

      return new Response(JSON.stringify({ paymentIntent: updated_intent, order: updated_order }), { status: 200 });
    }
  } else {
    // Crie um novo Payment Intent se não existir
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "brl",
      automatic_payment_methods: { enabled: true },
    });

    orderData.paymentIntentId = paymentIntent.id;

    // Crie uma nova ordem no banco de dados
    const newOrder = await prisma.order.create({
      data: {
        ...orderData,
      },
    });

    return new Response(JSON.stringify({ paymentIntent, order: newOrder }), { status: 200 });
  }
}
