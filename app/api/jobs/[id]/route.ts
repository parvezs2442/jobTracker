import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface JwtPayload {
  userId: string;
}


// Get Single Job
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const job = await prisma.job.findFirst({
      where: {
        id,
        userId: decoded.userId,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          message: "Job not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        job,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}


// Update Job

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const {
      company,
      position,
      location,
      status,
      jobType,
      workMode,
      salary,
      jobUrl,
      notes,
    } = await req.json();

    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        userId: decoded.userId,
      },
    });

    if (!existingJob) {
      return NextResponse.json(
        {
          success: false,
          message: "Job not found",
        },
        { status: 404 }
      );
    }

    const updatedJob = await prisma.job.update({
      where: {
        id,
      },
      data: {
        company,
        position,
        location,
        status,
        jobType,
        workMode,
        salary,
        jobUrl,
        notes,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Job Updated Successfully",
        job: updatedJob,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

//Delete JOb
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        userId: decoded.userId,
      },
    });

    if (!existingJob) {
      return NextResponse.json(
        {
          success: false,
          message: "Job not found",
        },
        { status: 404 }
      );
    }

    await prisma.job.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Job Deleted Successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}