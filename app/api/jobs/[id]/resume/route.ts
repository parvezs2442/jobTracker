import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = verifyJwt(token);
    } catch {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or expired token." },
        { status: 401 }
      );
    }

    // 2. Query job record
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job application not found." },
        { status: 404 }
      );
    }

    // 3. Strict ownership verification
    if (job.userId !== decoded.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: You do not have permission to access this resume.",
        },
        { status: 403 }
      );
    }

    const targetLink = job.resumeLink || job.resumeUrl;
    if (!targetLink || !targetLink.trim()) {
      return NextResponse.json(
        { success: false, message: "No resume link attached to this job application." },
        { status: 404 }
      );
    }

    let targetUrl = targetLink.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    return NextResponse.redirect(new URL(targetUrl));
  } catch (error) {
    console.error("GET /api/jobs/[id]/resume error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred retrieving the resume." },
      { status: 500 }
    );
  }
}
