import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { selling_ItemDB } from "@/app/DB/Shema/items";
import { ConnectDB } from "@/app/DB/connect";
// import { connectDB } from "@/app/DB/connection";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  // Connect to database
  await ConnectDB();

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    filename: (name, ext) => {
      return `${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
    },
  });

  try {
    const formData: any = await new Promise((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { fields, files } = formData;
    const file = files.file?.[0];
    const title = fields.title?.[0];
    const description = fields.description?.[0];
    const price = fields.price?.[0];
    const email = fields.email?.[0];

    // Validate required fields
    if (!file || !title || !description || !price || !email) {
      // Delete uploaded file if validation fails
      if (file) {
        fs.unlinkSync(file.filepath);
      }
      return NextResponse.json(
        { error: "Missing required fields or file" },
        { status: 400 }
      );
    }

    // Create the relative path for the database
    const relativePath = path.join("uploads", path.basename(file.filepath));

    // Save to database
    const savedItem = await selling_ItemDB.create({
      image: relativePath,
      iName: title,
      description,
      price: parseFloat(price),
      email,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "✅ Item added successfully",
        item: savedItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await ConnectDB();
    const items = await selling_ItemDB.find().sort({ createdAt: -1 });
    return NextResponse.json({ data: items }, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
