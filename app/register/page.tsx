import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/RegisterForm";
import { authOptions, oauthProviders } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <RegisterForm
      googleEnabled={oauthProviders.google}
      appleEnabled={oauthProviders.apple}
    />
  );
}
