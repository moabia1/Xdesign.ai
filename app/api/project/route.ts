import { generateProjectName } from "@/app/action/action"
import { inngest } from "@/inngest/client"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"


export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    const { userId } = await auth()

    if (!userId) throw new Error("Unauthorized")
    if (!prompt) throw new Error("Missing prompt")
    

    const projectName = await generateProjectName(prompt)

    const project = await prisma.project.create({
      data: {
        userId,
        name:projectName
      }
    })

    // Trigger the Inngest
    try {
      await inngest.send({
       name: "ui/generate.screens",
       data: {
         userId,
         projectId: project.id,
         prompt
        },
      });
    } catch (error) {
      console.log(error)
    }

    return NextResponse.json({
      success: true,
      data:project
    })
  } catch (error) {
    console.log("Error occured :", error)
    return NextResponse.json({
      error: "Failed to create project"
    }, { status: 500 })
  }
}

export async function GET(request: Request){
  try {
    const { userId } = await auth();
    
    if (!userId) throw new Error("Unauthorized");
    
    const projects = await prisma.project.findMany({
      where: { userId },  
      take: 10,
      orderBy: {createdAt:"desc"}
    });

    return NextResponse.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.log("Error Occured ", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}