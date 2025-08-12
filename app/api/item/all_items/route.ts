import { ConnectDB } from "@/app/DB/connect";
import { selling_ItemDB } from "@/app/DB/Shema/items";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  ConnectDB();
  try {
    const all_items = await selling_ItemDB.find();
    return NextResponse.json({
      message: "Success",
      status: 200,
      data: all_items,
    });
  } catch (error) {
    console.log(error);
    NextResponse.json({
      message: "Error",
      status: 500,
    });
  }
}
