import { NextRequest, NextResponse } from "next/server";

type BotpressWebhookBody = {
  type?: string;
  payload?: any;
  conversationId?: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as BotpressWebhookBody;

  console.log(
    "Botpress webhook payload:",
    JSON.stringify(body, null, 2)
  );

  const { conversationId, payload } = body;

  const text: string | undefined =
    typeof payload?.text === "string" ? payload.text : undefined;

  if (!conversationId || !text) {
    console.log("Missing conversationId or text in Botpress webhook");
    return NextResponse.json({
      ok: true,
      skipped: "no-text-or-conversation",
    });
  }

  // Тук по-късно ще върнем текста обратно във Fanvue чрез Fanvue API.
  console.log("Should reply to Fanvue with:", { conversationId, text });

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
