import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { provisionUser } from "@/src/lib/portal/provision";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await provisionUser(userId);

  if (!result.ok) {
    const status = result.error === "User has no email" ? 400 : 502;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, alreadyProvisioned: result.alreadyProvisioned ?? false });
}
