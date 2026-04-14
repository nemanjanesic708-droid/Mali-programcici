import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml"
};

export const dynamic = "force-dynamic";

function getContentType(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  return CONTENT_TYPES[extension] ?? "application/octet-stream";
}

export async function GET(
  _request: Request,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;

  if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return new NextResponse("Invalid file path", { status: 400 });
  }

  const absolutePath = path.join(process.cwd(), "public", "uploads", filename);

  try {
    const buffer = await readFile(absolutePath);

    console.info("[Warranty Tracker] Serving uploaded file", {
      filename,
      absolutePath,
      publicPath: `/uploads/${filename}`
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": getContentType(filename),
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    console.warn("[Warranty Tracker] Uploaded file missing", {
      filename,
      absolutePath,
      publicPath: `/uploads/${filename}`
    });

    return new NextResponse("Not found", { status: 404 });
  }
}
