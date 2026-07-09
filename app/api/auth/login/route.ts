import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    // Remove Password
    const { password: _, ...userWithoutPassword } = user;

    // Response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login Successful",
        user: userWithoutPassword,
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