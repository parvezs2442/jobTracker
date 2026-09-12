import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface JwtPayload {
  userId: string;
}

const VALID_STATUSES = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED", "HIRED"] as const;
const VALID_JOB_TYPES = ["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", "FREELANCE"] as const;
const VALID_WORK_MODES = ["REMOTE", "HYBRID", "ONSITE"] as const;

async function getAuthenticatedUserId(): Promise<{ userId?: string; errorResponse?: NextResponse }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      errorResponse: NextResponse.json(
        { success: false, message: "Unauthorized: No authentication token provided" },
        { status: 401 }
      ),
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return { userId: decoded.userId };
  } catch {
    return {
      errorResponse: NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or expired token" },
        { status: 401 }
      ),
    };
  }
}

// POST - Create a new job for the authenticated user
export async function POST(req: Request) {
  try {
    const { userId, errorResponse } = await getAuthenticatedUserId();
    if (errorResponse || !userId) return errorResponse!;

    const body = await req.json();
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
    } = body;

    // Validate required fields
    if (!company?.trim() || !position?.trim() || !jobType?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Company, Position, and Job Type are required fields.",
        },
        { status: 400 }
      );
    }

    // Validate enum types
    const sanitizedJobType = jobType.trim().toUpperCase();
    if (!VALID_JOB_TYPES.includes(sanitizedJobType as any)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid jobType. Allowed values: ${VALID_JOB_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    let sanitizedStatus = "APPLIED";
    if (status) {
      const upperStatus = status.trim().toUpperCase();
      if (!VALID_STATUSES.includes(upperStatus as any)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      sanitizedStatus = upperStatus;
    }

    let sanitizedWorkMode = undefined;
    if (workMode && workMode.trim()) {
      const upperMode = workMode.trim().toUpperCase();
      if (!VALID_WORK_MODES.includes(upperMode as any)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid workMode. Allowed values: ${VALID_WORK_MODES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      sanitizedWorkMode = upperMode;
    }

    const job = await prisma.job.create({
      data: {
        company: company.trim(),
        position: position.trim(),
        location: location?.trim() || null,
        status: sanitizedStatus as any,
        jobType: sanitizedJobType as any,
        workMode: sanitizedWorkMode as any,
        salary: salary?.trim() || null,
        jobUrl: jobUrl?.trim() || null,
        notes: notes?.trim() || null,
        userId,
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
    console.error("POST /api/jobs error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create job application.",
      },
      { status: 500 }
    );
  }
}

// GET - List all jobs for the authenticated user only
export async function GET() {
  try {
    const { userId, errorResponse } = await getAuthenticatedUserId();
    if (errorResponse || !userId) return errorResponse!;

    const jobs = await prisma.job.findMany({
      where: {
        userId,
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
    console.error("GET /api/jobs error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch jobs.",
      },
      { status: 500 }
    );
  }
}