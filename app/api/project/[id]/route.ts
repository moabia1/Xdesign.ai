import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"

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