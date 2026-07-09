
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface JwtPayload {
  userId: string;
}

//Create JOB
export async function POST(req: Request) {
  try {
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

    if (!company || !position || !jobType) {
      return NextResponse.json(
        {
          success: false,
          message: "Company, Position and Job Type are required",
        },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
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
        userId: decoded.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Job Added Successfully",
        job,
      },
      { status: 201 }
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


// GET All Jobs
export async function GET() {
  try {
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

    const jobs = await prisma.job.findMany({
      where: {
        userId: decoded.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: jobs.length,
        jobs,
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