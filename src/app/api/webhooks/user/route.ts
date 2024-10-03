import prisma from "@/lib/prisma";
import { IncomingHttpHeaders } from "http";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook, WebhookRequiredHeaders } from "svix";
import Stripe from "stripe";

const WebhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

type EventType = 'user.created' | 'user.updated' | '*';

type Event = {
    data: EventDataType;
    object: 'event';
    type: EventType;
};

type EventDataType = {
    id: string;
    first_name: string;
    last_name: string;
    email_addresses: EmailAddressType[];
    primary_email_address_id: string;
    attributes: Record<string, string | number>;
};

type EmailAddressType = {
    id: string;
    email_address: string;
};

async function handler(request: Request) {
    const payload = await request.json();
    const headersList = headers();
    const heads = {
        'svix-id': headersList.get('svix-id'),
        'svix-timestamp': headersList.get('svix-timestamp'),
        'svix-signature': headersList.get('svix-signature'),
    };
    
    if (!heads['svix-id'] || !heads['svix-timestamp'] || !heads['svix-signature']) {
        return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    const wh = new Webhook(WebhookSecret);
    let evt: Event | null = null;

    try {
        evt = wh.verify(
            JSON.stringify(payload),
            heads as IncomingHttpHeaders & WebhookRequiredHeaders
        ) as Event;
    } catch (err) {
        console.error(err as Error);
        return NextResponse.json({}, { status: 400 });
    }

    const eventType: EventType = evt.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
        const {
            id,
            first_name,
            last_name,
            email_addresses,
            primary_email_address_id,
            ...attributes
        } = evt.data;

        // Verifique a chave secreta do Stripe
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            throw new Error('Stripe secret key is not set');
        }

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2024-06-20',
        });

        let customer;
        try {
            customer = await stripe.customers.create({
                name: `${first_name} ${last_name}`,
                email: email_addresses ? email_addresses[0].email_address : '',
            });
        } catch (error) {
            console.error('Error creating Stripe customer: ', error);
            return NextResponse.json({ error: 'Stripe customer creation failed' }, { status: 500 });
        }

        try {
            await prisma.user.upsert({
                where: { externalId: id as string },
                create: {
                    externalId: id as string,
                    stripeCustomerId: customer.id,
                    attributes,
                },
                update: {
                    attributes
                }
            });
        } catch (error) {
            console.error('Error with Prisma upsert: ', error);
            return NextResponse.json({ error: 'Database upsert failed' }, { status: 500 });
        }
    }

    return NextResponse.json({}, { status: 200 });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
