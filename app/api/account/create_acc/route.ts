import { ConnectDB } from "@/app/DB/connect";
import { UserDB } from "@/app/DB/Shema/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await ConnectDB();

  try {
    const { user_credentials, password, name } = await req.json();

    if (!user_credentials || !password || !name) {
      return NextResponse.json(
        { message: "Please fill all the fields" },
        { status: 400 }
      );
    }

    const existingUser = await UserDB.findOne({ user_credentials });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists!" },
        { status: 409 } // 409 = Conflict
      );
    }

    const newUser = new UserDB({
      user_credentials,
      password,
      name,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Account Creation error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
