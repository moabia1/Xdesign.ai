import { generateObject } from "ai";
import { inngest } from "../client";
import { z } from "zod";
import { openrouter } from "@/lib/openrouter";
import { FrameType } from "@/types/projects";


const AnalysisSchema = z.object({
  theme: z
    .string()
    .describe(
    "The specific visual theme ID (e.g., 'midnight', 'ocean-breeze', 'neo-brutalism' )."
  ),
  screens: z
    .array(
      z.object({
        id: z
          .string()
          .describe(
          "Unique identifier for the screen (e.g., 'home-dashboard', 'profile-setting', transaction-history'). Use kebab-case"
        ),
        name: z
          .string()
          .describe(
          "Short, descriptive name of the screen (e.g., 'Home Dashboard', 'Profile', 'Transaction History')"
        ),
        purpose: z
          .string()
          .describe(
          "One clear sentence explaining what this screen accomplishes for the user and its role in the app"
        ),
        visualDescription: z
          .string()
          .describe(
          "A dense, high-fidelity visual directive (like an image generation prompt). Describe the layout, specific data examples (e.g.,'oct-mar'), component hierarchy, and physical attributes(e.g., 'Chunky cards', 'Floating header', 'Floating action button', 'Bottom navigation', Header with user avatar)."
        ),
    })
  )
    .min(1)
    .max(4)
})

export const generateScreen = inngest.createFunction(
  { id: "generate-ui-screens" },
  { event: "ui/generate.screens" },
  async ({ event, step }) => {
    const { userId, projectId, prompt, frames, theme: existingTheme } = event.data;
    const isRegeneration = frames.length > 0;
    
    //Analyzing or plan
    const analysis = await step.run("analyze-and-plan-screens", async () => {

      const contextHtml = frames?.slice(0,4)?.map((frame:FrameType)=> frame.htmlContent)?.join("\n");

      const analysisPrompt = isRegeneration
        ? `
        USER REQUEST : ${prompt}
        SELECTED THEME:${existingTheme}
        CONTEXT HTML:${contextHtml}
      `.trim() : `
      USER REQUEST:${prompt}
      `.trim();


      const {object} = await generateObject({
      model: openrouter.chat("google/gemini-2.5-flash-lite"),
      schema:AnalysisSchema,
      system: `
      You are an AI assistant that generates very very short project names based on the user's prompt.
      - Keep it under 5 words.
      - Capitalize words appropriately.
      - Do not include special characters.
      `,
      prompt:analysisPrompt
    })
    })


    //Actual generation of each screens
    // const analysis = await step.run("analyze-and-plan-screens", async () => {
      
    // })
  },
);