import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: "Logout Successful",
      },
      { status: 200 }
    );

    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
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