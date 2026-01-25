import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { base64 } from "zod";

// Cache the Chromium executable path to avoid re-downloading on subsequent requests
let cachedExecutablePath: string | null = null;
let downloadPromise: Promise<string> | null = null;

/**
 * Downloads and caches the Chromium executable path.
 * Uses a download promise to prevent concurrent downloads.
 */
async function getChromiumPath(): Promise<string> {
  // Return cached path if available
  if (cachedExecutablePath) return cachedExecutablePath;

  // Prevent concurrent downloads by reusing the same promise
  if (!downloadPromise) {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    downloadPromise = chromium
      .executablePath("https://github.com/gabenunez/puppeteer-on-vercel/raw/refs/heads/main/example/chromium-dont-use-in-prod.tar")
      .then((path) => {
        cachedExecutablePath = path;
        console.log("Chromium path resolved:", path);
        return path;
      })
      .catch((error) => {
        console.error("Failed to get Chromium path:", error);
        downloadPromise = null; // Reset on error to allow retry
        throw error;
      });
  }

  return downloadPromise;
}


export async function POST(req:Request) {
  let browser;
  try {
    const { html, width = 800, height = 600, projectId } = await req.json();
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    //Detect Environment
    const isProduction = process.env.NODE_ENV === "production";
    const isVercel = !!process.env.VERCEL;

    let puppeteer: any;
    let launchOptions: any = {
      headless: true,
    };

    if (isProduction && isVercel) {
      const chromium = (await import("@sparticuz/chromium-min")).default;
      puppeteer = (await import("puppeteer-core"));
      const executablePath = await getChromiumPath();

      launchOptions = {
        ...launchOptions,
        args: chromium.args,
        executablePath
      }
    } else {
      puppeteer = await import("puppeteer");
    }
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    //set View port size
    await page.setViewport({
      width: Number(width),
      height: Number(height),
      deviceScaleFactor: 2
    });

    //Set HTML content
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for 1 second to ensure all resources are loaded
    
    // Screenshot Capture
    const buffer = await page.screenshot({
      type: 'png',
      fullPage: false,
    });

    if (projectId) {
      const base64 = buffer.toString('base64');
      await prisma.project.update({
        where: {
          id: projectId,
          userId
        },
        data: { thumbnail: `data:image/png;base64,${base64}` }
      })
      return NextResponse.json({base64});
    }

    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type":"image/png"
      }
    })
  } catch (error) {
    return NextResponse.json({
      error:"Failed to capture screenshot"
    }, { status: 500 })
  } finally {
    if(browser) await browser.close();
  }
}