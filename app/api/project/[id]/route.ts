import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"
import { inngest } from "@/inngest/client";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {

    const {id} = await params;
    const { userId } = await auth();
    
    if (!userId) throw new Error("Unauthorized");

    const project = await prisma.project.findFirst({
      where: {
        userId,
        id,
      },
      include: {
        frames  : true,
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Fail to fetch Project not found" }, { status: 500 });
  }
}

export async function POST(request: Request,{ params }: { params: { id: string } }) {
  try {
    const {id} = await params;
    const { prompt } = await request.json()
    const { userId } = await auth()

    if (!userId) throw new Error("Unauthorized")
    if (!prompt) throw new Error("Missing prompt")
    
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId
      },
      include:{frames:true}
    })

    if(!project) throw new Error("Project not found")

    // Trigger the Inngest
    try {
      await inngest.send({
       name: "ui/generate.screens",
       data: {
         userId,
         projectId: id,
         prompt,
         frames: project?.frames,
         theme:project?.theme
        },
      });
    } catch (error) {
      console.log(error)
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.log("Error occured :", error)
    return NextResponse.json({
      error: "Failed to generate frames"
    }, { status: 500 })
  }
}

export async function PATCH(request: Request,{ params }: { params: { id: string } }) {
  try {
    const {id} = await params;
    const { themeId } = await request.json()
    const { userId } = await auth()

    if (!userId) throw new Error("Unauthorized")
    if (!themeId) throw new Error("Missing themeId")
    
    const project = await prisma.project.update({
      where: {
        id,
        userId
      },
      data:{ theme:themeId }
    })

    if(!project) throw new Error("Project not found");

    return NextResponse.json({
      success: true,
      project
    })
  } catch (error) {
    console.log("Error occured :", error)
    return NextResponse.json({
      error: "Failed to generate frames"
    }, { status: 500 })
  }
}