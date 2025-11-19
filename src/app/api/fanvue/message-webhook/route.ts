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

  // ⚠ Тестовият payload от Fanvue няма текст.
  // При истинско DM ще има поле с текст – ще го донастроим,
  // но за сега пробваме няколко възможни имена.
  const text: string =
    body?.message?.text ??
    body?.content?.text ??
    body?.text ??
    "";

  const senderUuid: string =
    body?.sender?.uuid ??
    body?.fanUuid ??
    body?.userId ??
    "unknown";

  if (!text) {
    console.log("No text in message, skipping sendToBotpress");
    return NextResponse.json({ ok: true, skipped: "no-text" });
  }

  // Ще използваме един conversation за всеки фен:
  const conversationId = `fanvue-${senderUuid}`;
  const userId = conversationId;

  await sendToBotpress({ conversationId, userId, text });

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
