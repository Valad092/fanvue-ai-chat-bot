// src/app/api/botpress/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

const BOTPRESS_WEBHOOK_SECRET = process.env.BOTPRESS_WEBHOOK_SECRET ?? "";

// Използва се от Botpress за "registration / healthcheck"
export async function GET() {
  return NextResponse.json({ ok: true });
}

// Тук Botpress ще праща отговорите на бота
export async function POST(req: NextRequest) {
  // По желание: проверка на secret header-а
  const secretHeader = req.headers.get("x-bp-secret");
  if (BOTPRESS_WEBHOOK_SECRET && secretHeader !== BOTPRESS_WEBHOOK_SECRET) {
    console.warn("Botpress webhook called with invalid secret");
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  console.log("Botpress webhook payload:", JSON.stringify(body));

  // ❗ Засега само логваме отговорите.
  // Следващата стъпка ще е тук да викнем Fanvue API, за да изпратим
  // текста обратно на фен-а.

  return NextResponse.json({ ok: true });
}
