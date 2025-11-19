// src/app/api/fanvue/message-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

const BOTPRESS_WEBHOOK_URL = process.env.BOTPRESS_WEBHOOK_URL;
const BOTPRESS_WEBHOOK_SECRET = process.env.BOTPRESS_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  console.log("Fanvue Message Received webhook:", JSON.stringify(body));

  // Ако payload-ът е странен – просто връщаме 200, за да не чупим Fanvue
  if (!body || !body.message || !body.sender) {
    return NextResponse.json({ ok: true });
  }

  const text: string | undefined = body.message?.text;
  const fanUuid: string | undefined = body.sender?.uuid;
  const displayName: string | undefined =
    body.sender?.displayName ?? body.sender?.handle;

  if (!text || !fanUuid) {
    // Няма текст или user – нищо не пращаме към Botpress
    return NextResponse.json({ ok: true });
  }

  if (!BOTPRESS_WEBHOOK_URL) {
    console.error("Missing BOTPRESS_WEBHOOK_URL env var");
    return NextResponse.json({ ok: true });
  }

  try {
    // Форматът е този, който Messaging API плъгинът очаква
    const payloadForBotpress = {
      userId: fanUuid, // това ще се върне обратно в /api/botpress/webhook
      type: "text",
      payload: {
        text,
        metadata: {
          fanvue: {
            fanUuid,
            displayName,
            handle: body.sender?.handle,
            messageUuid: body.messageUuid,
            recipientUuid: body.recipientUuid,
          },
        },
      },
    };

    const res = await fetch(BOTPRESS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(BOTPRESS_WEBHOOK_SECRET
          ? { "x-bp-secret": BOTPRESS_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify(payloadForBotpress),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error(
        "Failed to forward message to Botpress:",
        res.status,
        txt,
      );
    }
  } catch (err) {
    console.error("Error forwarding message to Botpress:", err);
  }

  // Винаги връщаме 200 към Fanvue
  return NextResponse.json({ ok: true });
}

// Прост healthcheck – удобен и за тестове, и за да видим дали route-ът живее
export async function GET() {
  return NextResponse.json({ ok: true });
}
