import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { env } from '@/env';
import { db } from '@/app/server/db';

const webhookSecret: string = env.CLERK_WEBHOOK_SIGNING_SECRET;
export async function GET(request: Request) {
  return new Response(await db.user.all(), { status: 200 });
}
export async function POST(request: Request) {;
  
  const payloadString = await request.text();
  const svixHeaders = await headers();
  console.log("headers", svixHeaders)

  const svixId = svixHeaders.get('svix-id') || '';
  const svixTimestamp = svixHeaders.get('svix-timestamp')|| '';
  const svixSignature = svixHeaders.get('svix-signature')|| '';

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(payloadString, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const { data } = evt;
  const eventType = evt.type;

  switch (eventType) {
    case 'user.created': {
      const { id, email_addresses, first_name, last_name } = data as any;
      const name = `${first_name || ''} ${last_name || ''}`.trim();

      let email = "";
      if (Array.isArray(email_addresses) && email_addresses.length > 0) {
        email = email_addresses[0].email_address;
      }else{
        console.error("no email found")
      }
      
      await db.user.create({
        data: {
          id,
          email,
          name,
        },
      });

      break;
    }
    case 'user.updated': {
      const { id, email_addresses, first_name, last_name } = data as any;
      let email = "";
      if (Array.isArray(email_addresses) && email_addresses.length > 0) {
        email = email_addresses[0].email_address;
      }else{
        console.error("no email found")
      }
      const name = `${first_name || ''} ${last_name || ''}`.trim();

      await db.user.update({
        where: {
          id,
        },
        data: {
          email,
          name,
        },
      });

      break;
    }
    case 'user.deleted': {
      const { id } = data;

      try{
        await db.user.delete({
          where: {
            id,
          },
        });
      } catch(e) {
        console.error("Error deleting user", e)
      }

      break;
    }
    default:
      console.log('Unhandled event type:', eventType);
  }

  return new Response('', { status: 200 });
}