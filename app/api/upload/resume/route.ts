import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

interface JwtPayload {
  userId: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
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
        { success: false, message: "Unauthorized: Invalid token." },
        { status: 401 }
      );
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No resume file was uploaded." },
        { status: 400 }
      );
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "File size exceeds 5MB limit. Please upload a smaller PDF.",
        },
        { status: 400 }
      );
    }

    // 4. Validate file type (strictly PDF)
    const originalName = file.name || "resume.pdf";
    const isPdfExt = originalName.toLowerCase().endsWith(".pdf");
    const isPdfMime = file.type === "application/pdf";

    if (!isPdfExt || (!isPdfMime && file.type !== "")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF documents (.pdf) are allowed.",
        },
        { status: 400 }
      );
    }

    // Read bytes & verify PDF header magic bytes (%PDF)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 4 || buffer.toString("utf8", 0, 4) !== "%PDF") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid PDF file structure.",
        },
        { status: 400 }
      );
    }

    // 5. Ensure upload directory exists
    const uploadsDir = path.join(process.cwd(), "uploads", "resumes");
    await fs.mkdir(uploadsDir, { recursive: true });

    // 6. Generate secure, unique filename
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const safeBaseName = path
      .basename(originalName, ".pdf")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const storedFilename = `${decoded.userId}_${Date.now()}_${uniqueId}_${safeBaseName}.pdf`;

    const filePath = path.join(uploadsDir, storedFilename);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json(
      {
        success: true,
        message: "Resume uploaded successfully.",
        fileKey: storedFilename,
        originalFilename: originalName,
        size: file.size,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while uploading the resume file.",
      },
      { status: 500 }
    );
  }
}
