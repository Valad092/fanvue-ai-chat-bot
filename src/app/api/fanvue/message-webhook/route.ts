import { NextRequest, NextResponse } from "next/server";

const BOTPRESS_WEBHOOK_URL = process.env.BOTPRESS_WEBHOOK_URL;
const BOTPRESS_PAT = process.env.BOTPRESS_PERSONAL_ACCESS_TOKEN;

type BotpressMessageInput = {
  conversationId: string;
  userId: string;
  text: string;
};

async function sendToBotpress(input: BotpressMessageInput) {
  if (!BOTPRESS_WEBHOOK_URL || !BOTPRESS_PAT) {
    console.error("Missing Botpress environment variables");
    return;
  }

  const { conversationId, userId, text } = input;
  const messageId = `${conversationId}-${Date.now()}`;

  const res = await fetch(BOTPRESS_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BOTPRESS_PAT}`,
    },
    body: JSON.stringify({
      userId,
      messageId,
      conversationId,
      type: "text",
      text,
      payload: {
        source: "fanvue",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Botpress message error", res.status, body);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log(
    "Fanvue Message Received webhook:",
    JSON.stringify(body, null, 2)
  );

  // Тук вече знаем, че текстът е в body.message.text
  const text: string | undefined = body?.message?.text;
  const senderUuid: string | undefined = body?.sender?.uuid;

  if (!text || !senderUuid) {
    console.log("Missing text or senderUuid, skipping sendToBotpress");
    return NextResponse.json({ ok: true, skipped: "no-text-or-sender" });
  }

  // Един разговор на фен – използваме senderUuid
  const conversationId = `fanvue-${senderUuid}`;
  const userId = conversationId;

  await sendToBotpress({ conversationId, userId, text });

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
