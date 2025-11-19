// src/app/api/fanvue/message-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

const BOTPRESS_WEBHOOK_URL = process.env.BOTPRESS_WEBHOOK_URL;
const BOTPRESS_PAT = process.env.BOTPRESS_PERSONAL_ACCESS_TOKEN;

async function sendToBotpress(input: {
  fanUuid: string;
  text: string;
  messageUuid: string;
  senderHandle?: string;
  senderName?: string;
  recipientUuid?: string;
}) {
  if (!BOTPRESS_WEBHOOK_URL || !BOTPRESS_PAT) {
    console.error(
      "Missing BOTPRESS_WEBHOOK_URL or BOTPRESS_PERSONAL_ACCESS_TOKEN"
    );
    return;
  }

  const { fanUuid, text, messageUuid, senderHandle, senderName, recipientUuid } =
    input;

  // Един разговор за всеки фен
  const conversationId = `fanvue-${fanUuid}`;
  const userId = fanUuid; // или conversationId – важното е да е стабилно

  const body = {
    userId,
    messageId: messageUuid, // уникален ID на съобщението (използваме Fanvue uuid)
    conversationId,
    type: "text",
    text,
    payload: {
      source: "fanvue",
      fanvue: {
        fanUuid,
        senderHandle,
        senderName,
        recipientUuid,
        messageUuid,
      },
    },
  };

  const res = await fetch(BOTPRESS_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BOTPRESS_PAT}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Botpress Messaging API error:", res.status, txt);
  } else {
    console.log("Message forwarded to Botpress successfully");
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  console.log(
    "Fanvue Message Received webhook:",
    JSON.stringify(body, null, 2)
  );

  if (!body) {
    return NextResponse.json({ ok: true, skipped: "no-body" });
  }

  const text: string | undefined = body?.message?.text;
  const messageUuid: string | undefined = body?.message?.uuid;
  const fanUuid: string | undefined = body?.sender?.uuid;

  if (!text || !messageUuid || !fanUuid) {
    console.log(
      "Missing text, messageUuid or fanUuid – skipping sendToBotpress"
    );
    return NextResponse.json({ ok: true, skipped: "missing-fields" });
  }

  await sendToBotpress({
    fanUuid,
    text,
    messageUuid,
    senderHandle: body?.sender?.handle,
    senderName: body?.sender?.displayName,
    recipientUuid: body?.recipientUuid,
  });

  // Винаги връщаме 200 към Fanvue
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
