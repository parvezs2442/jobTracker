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

// GET Single Job with ownership verification (404 vs 403)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, errorResponse } = await getAuthenticatedUserId();
    if (errorResponse || !userId) return errorResponse!;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: {
            changedAt: "asc",
          },
        },
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

    if (job.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: You do not have permission to view this job",
        },
        { status: 403 }
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
    console.error("GET /api/jobs/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve job details.",
      },
      { status: 500 }
    );
  }
}

// PUT Update Job with ownership verification (404 vs 403)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, errorResponse } = await getAuthenticatedUserId();
    if (errorResponse || !userId) return errorResponse!;

    const existingJob = await prisma.job.findUnique({
      where: { id },
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

    if (existingJob.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: You do not have permission to edit this job",
        },
        { status: 403 }
      );
    }

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
    if (!company?.trim() || !position?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Company and Position are required fields.",
        },
        { status: 400 }
      );
    }

    // Validate enums if provided
    let sanitizedJobType: JobType = existingJob.jobType;
    if (jobType) {
      const upperJobType = jobType.trim().toUpperCase() as JobType;
      if (!VALID_JOB_TYPES.includes(upperJobType)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid jobType. Allowed values: ${VALID_JOB_TYPES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      sanitizedJobType = upperJobType;
    }

    let sanitizedStatus: JobStatus = existingJob.status;
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

    let sanitizedWorkMode: WorkMode | null = existingJob.workMode;
    if (workMode !== undefined) {
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
      } else {
        sanitizedWorkMode = null;
      }
    }

    // Handle resume updates
    let newResumeLink: string | null = existingJob.resumeLink || existingJob.resumeUrl;
    const rawResumeLink = resumeLink !== undefined ? resumeLink : resumeUrl;
    if (rawResumeLink !== undefined) {
      if (rawResumeLink && typeof rawResumeLink === "string" && rawResumeLink.trim()) {
        let url = rawResumeLink.trim();
        if (!/^https?:\/\//i.test(url)) {
          url = "https://" + url;
        }
        newResumeLink = url;
      } else {
        newResumeLink = null;
      }
    }

    const isStatusChanged = sanitizedStatus !== existingJob.status;

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        company: company.trim(),
        position: position.trim(),
        location: location !== undefined ? (location?.trim() || null) : existingJob.location,
        status: sanitizedStatus,
        jobType: sanitizedJobType,
        workMode: sanitizedWorkMode,
        salary: salary !== undefined ? (salary?.trim() || null) : existingJob.salary,
        jobUrl: jobUrl !== undefined ? (jobUrl?.trim() || null) : existingJob.jobUrl,
        notes: notes !== undefined ? (notes?.trim() || null) : existingJob.notes,
        resumeLink: newResumeLink,
        resumeType: newResumeLink ? "LINK" : null,
        resumeUrl: newResumeLink,
        resumeFilename: newResumeLink ? "Resume Link" : null,
        ...(isStatusChanged
          ? {
              statusHistory: {
                create: {
                  status: sanitizedStatus,
                  changedAt: new Date(),
                },
              },
            }
          : {}),
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
        message: "Job Updated Successfully",
        job: updatedJob,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/jobs/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update job application.",
      },
      { status: 500 }
    );
  }
}

// DELETE Job with ownership verification
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, errorResponse } = await getAuthenticatedUserId();
    if (errorResponse || !userId) return errorResponse!;

    const existingJob = await prisma.job.findUnique({
      where: { id },
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

    if (existingJob.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: You do not have permission to delete this job",
        },
        { status: 403 }
      );
    }

    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Job Deleted Successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/jobs/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete job application.",
      },
      { status: 500 }
    );
  }
}