import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/LoginForm";
import { authOptions, oauthProviders } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <LoginForm
      googleEnabled={oauthProviders.google}
      appleEnabled={oauthProviders.apple}
    />
  );
}
