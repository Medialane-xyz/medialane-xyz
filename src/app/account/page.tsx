import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { provisionUser } from "@/src/lib/portal/provision";
import { AccountDashboard } from "./dashboard";

export default async function AccountPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  if (!user.privateMetadata?.backendApiKey) {
    await provisionUser(userId);
    // Re-fetch after provision so we have the key for the plan lookup
    const fresh = await clerk.users.getUser(userId);
    Object.assign(user, fresh);
  }

  let plan = "FREE";
  const apiKey = user.privateMetadata?.backendApiKey as string | undefined;
  if (apiKey) {
    try {
      const apiUrl = process.env.MEDIALANE_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/v1/portal/me`, {
        headers: { "x-api-key": apiKey },
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = await res.json();
        plan = data?.tenant?.plan ?? "FREE";
      }
    } catch {
      // non-fatal — show FREE as fallback
    }
  }

  return (
    <AccountDashboard
      initialPlan={plan}
      userImageUrl={user.imageUrl}
      userFullName={user.fullName}
      userEmail={user.primaryEmailAddress?.emailAddress ?? ""}
      userId={userId}
      publicKey={user.publicMetadata?.publicKey as string | undefined}
    />
  );
}
