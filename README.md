import { ConnectDB } from "@/app/DB/connect";
import { connect } from "http2";
import { NextResponse } from "next/server";

export async function get(res: NextResponse) {
ConnectDB();
try {
} catch (error) {
console.log(error);
NextResponse.json({
message: "Error",
status: 500,
});
}
}

supanusanuni

mongodb+srv://<db_username>:<db_password>@cluster0.hzvut2x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
