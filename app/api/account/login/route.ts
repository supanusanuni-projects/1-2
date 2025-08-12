import { ConnectDB } from "@/app/DB/connect";
import { UserDB } from "@/app/DB/Shema/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await ConnectDB();
  const { user_credentials, password } = await req.json();

  try {
    const user = await UserDB.findOne({ user_credentials });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.password === password) {
      return NextResponse.json({ message: "Login success" ,user}, { status: 200 });
    }

    return NextResponse.json({ message: "Login failed" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
