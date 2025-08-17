import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { selling_ItemDB } from "@/app/DB/Shema/items";
import { ConnectDB } from "@/app/DB/connect";

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await ConnectDB();

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Parse form data using Web API FormData
    const formData = await req.formData();

    // Extract fields
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const price = formData.get("price") as string | null;
    const email = formData.get("email") as string | null;
    const tel = formData.get("tel") as string | null;

    // Validate required fields
    if (!file || !title || !description || !price || !email) {
      return NextResponse.json(
        { error: "Missing required fields or file" },
        { status: 400 }
      );
    }

    // Validate file type - be more flexible with validation
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Check file extension as fallback if MIME type is missing
    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
    ];
    var fileExtension = path.extname(file.name.toLowerCase());

    const isValidImage =
      file.type.startsWith("image/") ||
      allowedExtensions.includes(fileExtension);

    if (!isValidImage) {
      return NextResponse.json(
        {
          error: `File must be an image. Received type: ${file.type}, extension: ${fileExtension}`,
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    fileExtension = path.extname(file.name);
    const filename = `${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}${fileExtension}`;
    const filePath = path.join(uploadDir, filename);

    // Save file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // Create the relative path for the database
    const relativePath = path.join("uploads", filename);

    // Validate price
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(filePath);
      return NextResponse.json(
        { error: "Invalid price value" },
        { status: 400 }
      );
    }

    // Save to database
    const savedItem = await selling_ItemDB.create({
      image: relativePath,
      iName: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      user_credentials: email.trim(),
      tel: tel?.trim() || null, // Add tel field if it exists in your schema
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
    console.error("Error adding item:", error);

    // If there's an error and we have a file path, try to clean it up
    // (This is a basic cleanup - in production you might want more sophisticated error handling)

    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await ConnectDB();

    // Get query parameters if you want to add filtering/pagination
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;
    const email = searchParams.get("email");

    let query = {};
    if (email) {
      query = { email };
    }

    let itemsQuery = selling_ItemDB.find(query).sort({ createdAt: -1 });

    if (limit) {
      itemsQuery = itemsQuery.limit(limit);
    }

    const items = await itemsQuery.exec();

    return NextResponse.json(
      {
        data: items,
        count: items.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch items",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
