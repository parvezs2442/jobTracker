import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and Password are required",
        },
        { status: 400 }
      );
    }

    // Find User
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Email or Password",
        },
        { status: 401 }
      );
    }

    // Compare Password
    const isPasswordMatched = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatched) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Email or Password",
        },
        { status: 401 }
      );
    }

    // Generate JWT via secure centralized helper
    const token = signJwt({ userId: user.id });

    // Exclude password from response
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login Successful",
        user: safeUser,
      },
      { status: 200 }
    );

    // Set Cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);

    const err = error as Error & { code?: string };
    const errMsg = err?.message || "";

    if (errMsg.includes("JWT_SECRET")) {
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error: JWT_SECRET is missing or using an insecure placeholder in production.",
        },
        { status: 500 }
      );
    }

    if (
      errMsg.includes("Can't reach database") ||
      errMsg.includes("does not exist") ||
      errMsg.includes("connect ECONNREFUSED") ||
      err?.code === "P1001" ||
      err?.code === "P2021"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed or tables are missing. Please verify DATABASE_URL and run 'prisma db push'.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error. Check server logs for details.",
      },
      { status: 500 }
    );
  }
}