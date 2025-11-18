import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  // Засега само логваме payload-а, за да видим какво праща Fanvue
  console.log("Fanvue Message Received webhook:", JSON.stringify(body, null, 2));

  // Ще върнем 200 OK, за да знае Fanvue, че всичко е наред
  return NextResponse.json({ ok: true });
}
