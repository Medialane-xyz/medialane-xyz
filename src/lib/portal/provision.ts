import { clerkClient } from "@clerk/nextjs/server";

interface ProvisionResult {
  ok: boolean;
  alreadyProvisioned?: boolean;
  error?: string;
}

export async function provisionUser(userId: string): Promise<ProvisionResult> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  if (user.privateMetadata?.backendApiKey) {
    return { ok: true, alreadyProvisioned: true };
  }

  const email = user.primaryEmailAddress?.emailAddress;
  const name = user.fullName || user.firstName || email || userId;

  if (!email) {
    return { ok: false, error: "User has no email" };
  }

  const apiUrl = process.env.MEDIALANE_API_URL;
  const apiSecret = process.env.MEDIALANE_API_SECRET;

  if (!apiUrl || !apiSecret) {
    return { ok: false, error: "Backend not configured" };
  }

  const res = await fetch(`${apiUrl}/admin/tenants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-secret": apiSecret,
    },
    body: JSON.stringify({ name, email, plan: "FREE" }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[provision] Backend error:", res.status, body);
    return { ok: false, error: "Failed to provision tenant" };
  }

  const json = await res.json();
  // Backend wraps all responses in { data: ... }
  const data = json?.data ?? json;
  const plaintext = data?.apiKey?.plaintext;
  const tenantId = data?.tenant?.id;

  if (!plaintext || !tenantId) {
    console.error("[provision] Unexpected backend response:", data);
    return { ok: false, error: "Invalid backend response" };
  }

  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      backendApiKey: plaintext,
      backendTenantId: tenantId,
    },
  });

  return { ok: true };
}
