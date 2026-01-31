import { tool } from "ai";
import { z } from "zod";

export const unsplashTool = tool({
  description:
    "Fetch a single high-quality image URL from Unsplash to be embedded directly in an <img> tag.",
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .describe("Concise visual search query (e.g. 'fintech dashboard', 'wellness lifestyle')"),
    orientation: z
      .enum(["landscape", "portrait", "squarish"])
      .default("landscape"),
  }),
  execute: async ({ query, orientation }) => {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&orientation=${orientation}&per_page=1`,
        {
          headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            "Accept-Version": "v1",
          },
        }
      );

      if (!res.ok) return null;

      const data = await res.json();
      const imageUrl = data?.results?.[0]?.urls?.regular;

      return typeof imageUrl === "string" ? imageUrl : null;
    } catch {
      return null;
    }
  },
});
