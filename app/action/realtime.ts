// ex. /app/actions/get-subscribe-token.ts
"use server";

import { inngest } from "@/inngest/client";
import { auth } from "@clerk/nextjs/server";
import { getSubscriptionToken } from "@inngest/realtime";


export async function fetchRealtimeSubscriptionToken(){
  const { userId } = await auth()
 if (!userId) throw new Error("Unauthorized")

  // This creates a token using the Inngest API that is bound to the channel and topic:
  const token = await getSubscriptionToken(inngest, {
    channel: `user:${userId}`,
    topics: [""],
  });

  return token;
}