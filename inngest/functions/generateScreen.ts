import { inngest } from "../client";
import { z } from "zod";


export const generateScreen = inngest.createFunction(
  { id: "generate-ui-screens" },
  { event: "ui/generate.screens" },
  async ({ event, step }) => {
    const { userId, projectId, prompt, frames, theme: existingTheme } = event.data;
    const isRegeneration = frames.length > 0;
    
    //Analyzing or plan
    const analysis = await step.run("analyze-and-plan-screens", async () => {
      
    })


    //Actual generation of each screens
    // const analysis = await step.run("analyze-and-plan-screens", async () => {
      
    // })
  },
);