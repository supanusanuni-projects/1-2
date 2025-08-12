import { ConnectDB } from "@/app/DB/connect";
import { selling_ItemDB } from "@/app/DB/Shema/items";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await ConnectDB();

  const user_credentials = req.nextUrl.searchParams.get("user_credentials");
  console.log(user_credentials);

  if (!user_credentials) {
    return NextResponse.json(
      { message: "user_credentials is required" },
      { status: 400 }
    );
  }

  try {
    const userItem = await selling_ItemDB.find({ email: user_credentials });

    if (!userItem || userItem.length === 0) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Success",
        status: 200,
        data: userItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        message: "Server Error",
        status: 500,
      },
      { status: 500 }
    );
  }
}
