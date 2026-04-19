import { db } from "@/lib/db";

const DEMO_EMAIL = "demo@healthai.local";

export async function getOrCreateDemoUser() {
  return db.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: "Demo User",
      password: "temporary-placeholder",
      healthId: "DEMO-HEALTH-ID"
    }
  });
}
