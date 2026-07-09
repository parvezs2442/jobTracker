import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 409 }
      );
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

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

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Response
    const response = NextResponse.json(
      {
        success: true,
        message: "User Registered Successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
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