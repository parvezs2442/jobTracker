import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

interface JwtPayload {
  userId: string;
}

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

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
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

    if (!job.resumeType || !job.resumeUrl) {
      return NextResponse.json(
        { success: false, message: "No resume attached to this job application." },
        { status: 404 }
      );
    }

    // 4. Handle External Link
    if (job.resumeType === "LINK") {
      let targetUrl = job.resumeUrl;
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = "https://" + targetUrl;
      }
      return NextResponse.redirect(new URL(targetUrl));
    }

    // 5. Handle Uploaded PDF
    if (job.resumeType === "PDF") {
      // Prevent path traversal
      const safeKey = path.basename(job.resumeUrl);
      const filePath = path.join(process.cwd(), "uploads", "resumes", safeKey);

      try {
        const fileBuffer = await fs.readFile(filePath);
        const filename = job.resumeFilename || "resume.pdf";

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
            "Cache-Control": "private, max-age=3600",
          },
        });
      } catch (err: any) {
        if (err.code === "ENOENT") {
          return NextResponse.json(
            { success: false, message: "Resume file not found on server storage." },
            { status: 404 }
          );
        }
        throw err;
      }
    }

    return NextResponse.json(
      { success: false, message: "Unsupported resume type." },
      { status: 400 }
    );
  } catch (error) {
    console.error("GET /api/jobs/[id]/resume error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred retrieving the resume." },
      { status: 500 }
    );
  }
}
