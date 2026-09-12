import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface JwtPayload {
  userId: string;
}

const VALID_STATUSES = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED", "HIRED"] as const;

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

// PATCH /api/jobs/:id/status - Dedicated status update endpoint with strict ownership verification
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, errorResponse } = await getAuthenticatedUserId();
    if (errorResponse || !userId) return errorResponse!;

    const body = await req.json();
    const { status } = body;

    if (!status || typeof status !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "A valid status string is required.",
        },
        { status: 400 }
      );
    }

    const sanitizedStatus = status.trim().toUpperCase();
    if (!VALID_STATUSES.includes(sanitizedStatus as any)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status '${status}'. Allowed values: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Find the job to verify existence
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

    // Ownership check: User A cannot modify User B's job
    if (existingJob.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: You do not have permission to update this job's status",
        },
        { status: 403 }
      );
    }

    // Check if status is actually changing (prevent duplicate transitions)
    if (existingJob.status === sanitizedStatus) {
      return NextResponse.json(
        {
          success: true,
          message: `Job status is already ${sanitizedStatus}`,
          job: existingJob,
        },
        { status: 200 }
      );
    }

    // Update status and append to statusHistory
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status: sanitizedStatus as any,
        statusHistory: {
          create: {
            status: sanitizedStatus as any,
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
        message: `Job status updated to ${sanitizedStatus}`,
        job: updatedJob,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/jobs/[id]/status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while updating job status.",
      },
      { status: 500 }
    );
  }
}
