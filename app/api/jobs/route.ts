import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { JobStatus, JobType, WorkMode } from "@/app/generated/prisma/client";

const VALID_STATUSES: JobStatus[] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED", "HIRED"];
const VALID_JOB_TYPES: JobType[] = ["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", "FREELANCE"];
const VALID_WORK_MODES: WorkMode[] = ["REMOTE", "HYBRID", "ONSITE"];

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
    const decoded = verifyJwt(token);
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
      resumeLink,
      resumeUrl,
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
    const sanitizedJobType = jobType.trim().toUpperCase() as JobType;
    if (!VALID_JOB_TYPES.includes(sanitizedJobType)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid jobType. Allowed values: ${VALID_JOB_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    let sanitizedStatus: JobStatus = "APPLIED";
    if (status) {
      const upperStatus = status.trim().toUpperCase() as JobStatus;
      if (!VALID_STATUSES.includes(upperStatus)) {
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

    let sanitizedWorkMode: WorkMode | null = null;
    if (workMode && workMode.trim()) {
      const upperMode = workMode.trim().toUpperCase() as WorkMode;
      if (!VALID_WORK_MODES.includes(upperMode)) {
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

    // Sanitize resume URL / link
    let sanitizedResumeLink: string | null = null;
    const rawLink = resumeLink || resumeUrl;
    if (rawLink && typeof rawLink === "string" && rawLink.trim()) {
      let url = rawLink.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }
      sanitizedResumeLink = url;
    }

    const job = await prisma.job.create({
      data: {
        company: company.trim(),
        position: position.trim(),
        location: location?.trim() || null,
        status: sanitizedStatus,
        jobType: sanitizedJobType,
        workMode: sanitizedWorkMode,
        salary: salary?.trim() || null,
        jobUrl: jobUrl?.trim() || null,
        notes: notes?.trim() || null,
        resumeLink: sanitizedResumeLink,
        resumeType: sanitizedResumeLink ? "LINK" : null,
        resumeUrl: sanitizedResumeLink,
        resumeFilename: sanitizedResumeLink ? "Resume Link" : null,
        userId,
        statusHistory: {
          create: {
            status: sanitizedStatus,
            changedAt: new Date(),
          },
        },
      },
      include: {
        statusHistory: {
          orderBy: {
            changedAt: "asc",
          },
        },
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
      include: {
        statusHistory: {
          orderBy: {
            changedAt: "asc",
          },
        },
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