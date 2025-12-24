import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const publicFilePath = path.resolve(process.cwd(), "public/circuits.json");
    if (fs.existsSync(publicFilePath)) {
      const data = fs.readFileSync(publicFilePath, "utf-8");
      return NextResponse.json(JSON.parse(data));
    }

    const fallbackFilePath = path.resolve(process.cwd(), "../circuits/target/circuits.json");
    if (fs.existsSync(fallbackFilePath)) {
      const data = fs.readFileSync(fallbackFilePath, "utf-8");
      return NextResponse.json(JSON.parse(data));
    }

    return NextResponse.json({ error: "circuits.json not found" }, { status: 404 });
  } catch (error) {
    console.error("Error reading circuit data:", error);
    return NextResponse.json({ error: "Failed to fetch circuit data" }, { status: 500 });
  }
}
