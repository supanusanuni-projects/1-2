import { ConnectDB } from "@/app/DB/connect";
import { selling_ItemDB } from "@/app/DB/Shema/items";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await ConnectDB();
  const { _id } = await req.json();
  const deleteItem = await selling_ItemDB.findByIdAndDelete({ _id });
  if (!deleteItem) {
    return NextResponse.json(
      {
        message: "error",
        success: false,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "success", success: true });
}
